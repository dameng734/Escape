#include "../cpp_pipeline/pipeline.hpp"

#include <algorithm>
#include <array>
#include <bit>
#include <cmath>
#include <cstdint>
#include <deque>
#include <fstream>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <random>
#include <set>
#include <sstream>

namespace {

using escape::Block;
using escape::Level;
using escape::SolverEngine;
using escape::SolverOptions;
using escape::SolverResult;
using escape::json;

constexpr int kMaxMovable = 32;
constexpr std::uint32_t kNoParent = std::numeric_limits<std::uint32_t>::max();

struct Shape {
  const char* key;
  int w;
  int h;
  const char* move_dir;
};

constexpr std::array<Shape, 8> kShapes = {{
    {"h1", 1, 1, "horizontal"},
    {"v1", 1, 1, "vertical"},
    {"h2", 2, 1, "horizontal"},
    {"h3", 3, 1, "horizontal"},
    {"v2", 1, 2, "vertical"},
    {"v3", 1, 3, "vertical"},
    {"sqh", 2, 2, "horizontal"},
    {"sqv", 2, 2, "vertical"},
}};

struct Arguments {
  int from = 4;
  int to = 180;
  int probe_depth = 0;
  int max_component_states = 2'000'000;
  int topology_attempts = 20'000;
  std::uint64_t seed = 0;
  bool validate_only = false;
  std::filesystem::path levels = "assets/data/levels.json";
  std::filesystem::path data = "assets/data/levels_data.js";
  std::filesystem::path report = "assets/data/independent_levels_report.json";
  std::filesystem::path checkpoint = "assets/data/independent_level_checkpoint.json";
};

struct PackedState {
  std::array<std::uint64_t, 3> words{};

  bool operator==(const PackedState& other) const {
    return words == other.words;
  }
};

std::uint64_t mix64(std::uint64_t value) {
  value += 0x9e3779b97f4a7c15ULL;
  value = (value ^ (value >> 30)) * 0xbf58476d1ce4e5b9ULL;
  value = (value ^ (value >> 27)) * 0x94d049bb133111ebULL;
  return value ^ (value >> 31);
}

std::uint64_t state_hash(const PackedState& state) {
  std::uint64_t hash = 0x243f6a8885a308d3ULL;
  for (const std::uint64_t word : state.words) {
    hash ^= mix64(word + hash);
  }
  return mix64(hash);
}

class FlatStateMap {
 public:
  explicit FlatStateMap(std::size_t maximum_states) {
    std::size_t capacity = 1;
    while (capacity < maximum_states * 2U) capacity <<= 1U;
    slots_.assign(capacity, 0);
    mask_ = capacity - 1;
  }

  std::pair<std::uint32_t, bool> insert(
      const PackedState& state,
      std::vector<PackedState>& states) {
    std::size_t slot = static_cast<std::size_t>(state_hash(state)) & mask_;
    for (;;) {
      const std::uint32_t stored = slots_[slot];
      if (stored == 0) {
        const std::uint32_t id = static_cast<std::uint32_t>(states.size());
        states.push_back(state);
        slots_[slot] = id + 1;
        return {id, true};
      }
      const std::uint32_t id = stored - 1;
      if (states[id] == state) return {id, false};
      slot = (slot + 1U) & mask_;
    }
  }

  std::uint32_t find(
      const PackedState& state,
      const std::vector<PackedState>& states) const {
    std::size_t slot = static_cast<std::size_t>(state_hash(state)) & mask_;
    for (;;) {
      const std::uint32_t stored = slots_[slot];
      if (stored == 0) return kNoParent;
      const std::uint32_t id = stored - 1;
      if (states[id] == state) return id;
      slot = (slot + 1U) & mask_;
    }
  }

 private:
  std::vector<std::uint32_t> slots_;
  std::size_t mask_ = 0;
};

struct StaticBlock {
  std::string id;
  std::string shape;
  int w = 1;
  int h = 1;
  int axis = 0;  // 0 horizontal, 1 vertical, 2 both.
  int class_id = 0;
  bool target = false;
};

struct ReverseMove {
  std::uint8_t class_id = 0;
  std::uint8_t from = 0;
  std::uint8_t to = 0;
};

struct PureTopology {
  Level goal;
  std::vector<StaticBlock> blocks;
  std::vector<std::vector<int>> classes;
  std::uint64_t fixed_cells = 0;
  std::uint8_t target_goal = 0;
};

struct ComponentResult {
  bool complete = false;
  std::uint64_t enumeration_ms = 0;
  std::uint64_t distance_ms = 0;
  int maximum_distance = 0;
  std::vector<PackedState> states;
  std::vector<std::uint16_t> distance;
  std::vector<std::uint32_t> parent;
  std::vector<ReverseMove> reverse_move;
  std::vector<std::uint32_t> exact_candidates;
};

struct Fingerprint {
  std::string topology;
  std::string exact_solution;
  std::set<std::string> solution_ngrams;
  std::set<std::string> target_ngrams;
  std::map<std::string, int> moved_shape_histogram;
};

int target_depth(int level_id) {
  return std::min(30, 12 + (level_id - 4) / 3);
}

bool parse_int(const std::string& text, int& value) {
  try {
    value = std::stoi(text);
    return true;
  } catch (...) {
    return false;
  }
}

bool parse_u64(const std::string& text, std::uint64_t& value) {
  try {
    value = std::stoull(text);
    return true;
  } catch (...) {
    return false;
  }
}

bool parse_args(int argc, char** argv, Arguments& args) {
  for (int i = 1; i < argc; ++i) {
    const std::string option = argv[i];
    auto next = [&]() -> std::optional<std::string> {
      if (i + 1 >= argc) return std::nullopt;
      return std::string(argv[++i]);
    };
    if (option == "--from") {
      const auto value = next();
      if (!value || !parse_int(*value, args.from)) return false;
    } else if (option == "--to") {
      const auto value = next();
      if (!value || !parse_int(*value, args.to)) return false;
    } else if (option == "--probe-depth") {
      const auto value = next();
      if (!value || !parse_int(*value, args.probe_depth)) return false;
    } else if (option == "--max-component-states") {
      const auto value = next();
      if (!value || !parse_int(*value, args.max_component_states)) return false;
    } else if (option == "--topology-attempts") {
      const auto value = next();
      if (!value || !parse_int(*value, args.topology_attempts)) return false;
    } else if (option == "--seed") {
      const auto value = next();
      if (!value || !parse_u64(*value, args.seed)) return false;
    } else if (option == "--validate-only") {
      args.validate_only = true;
    } else if (option == "--levels") {
      const auto value = next();
      if (!value) return false;
      args.levels = *value;
    } else if (option == "--data") {
      const auto value = next();
      if (!value) return false;
      args.data = *value;
    } else if (option == "--report") {
      const auto value = next();
      if (!value) return false;
      args.report = *value;
    } else if (option == "--checkpoint") {
      const auto value = next();
      if (!value) return false;
      args.checkpoint = *value;
    } else {
      return false;
    }
  }
  return args.from >= 4 && args.to >= args.from && args.to <= 180
      && args.max_component_states >= 10'000 && args.topology_attempts > 0
      && (args.probe_depth == 0 || (args.probe_depth >= 20 && args.probe_depth <= 40));
}

std::uint64_t block_bits(int x, int y, int w, int h) {
  std::uint64_t bits = 0;
  for (int yy = y; yy < y + h; ++yy) {
    for (int xx = x; xx < x + w; ++xx) bits |= 1ULL << (yy * 8 + xx);
  }
  return bits;
}

bool inside(int x, int y, int w, int h) {
  return x >= 0 && y >= 0 && x + w <= 8 && y + h <= 8;
}

int shape_index(const Block& block) {
  for (int i = 0; i < static_cast<int>(kShapes.size()); ++i) {
    const Shape& shape = kShapes[static_cast<std::size_t>(i)];
    if (block.w == shape.w && block.h == shape.h && block.move_dir == shape.move_dir) {
      return i;
    }
  }
  return -1;
}

std::uint8_t position(int x, int y) {
  return static_cast<std::uint8_t>(y * 8 + x);
}

int pos_x(std::uint8_t pos) {
  return pos % 8;
}

int pos_y(std::uint8_t pos) {
  return pos / 8;
}

void canonicalize(const PureTopology& topology, std::array<std::uint8_t, kMaxMovable>& positions) {
  for (const auto& members : topology.classes) {
    if (members.size() <= 1) continue;
    std::array<std::uint8_t, kMaxMovable> values{};
    for (std::size_t i = 0; i < members.size(); ++i) {
      values[i] = positions[static_cast<std::size_t>(members[i])];
    }
    std::sort(values.begin(), values.begin() + static_cast<std::ptrdiff_t>(members.size()));
    for (std::size_t i = 0; i < members.size(); ++i) {
      positions[static_cast<std::size_t>(members[i])] = values[i];
    }
  }
}

PackedState pack(
    const PureTopology& topology,
    std::array<std::uint8_t, kMaxMovable> positions) {
  canonicalize(topology, positions);
  PackedState packed;
  int offset = 0;
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const int word = offset / 64;
    const int shift = offset % 64;
    const std::uint64_t value = positions[i] & 63U;
    packed.words[static_cast<std::size_t>(word)] |= value << shift;
    if (shift > 58) {
      packed.words[static_cast<std::size_t>(word + 1)] |= value >> (64 - shift);
    }
    offset += 6;
  }
  return packed;
}

std::array<std::uint8_t, kMaxMovable> unpack(
    const PureTopology& topology,
    const PackedState& packed) {
  std::array<std::uint8_t, kMaxMovable> positions{};
  int offset = 0;
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const int word = offset / 64;
    const int shift = offset % 64;
    std::uint64_t value = packed.words[static_cast<std::size_t>(word)] >> shift;
    if (shift > 58) {
      value |= packed.words[static_cast<std::size_t>(word + 1)] << (64 - shift);
    }
    positions[i] = static_cast<std::uint8_t>(value & 63U);
    offset += 6;
  }
  return positions;
}

template <typename Callback>
void generate_neighbors(
    const PureTopology& topology,
    const PackedState& packed,
    Callback&& callback) {
  const auto positions = unpack(topology, packed);
  std::uint64_t occupied = topology.fixed_cells;
  std::array<std::uint64_t, kMaxMovable> block_occupancy{};
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const StaticBlock& block = topology.blocks[i];
    const int x = pos_x(positions[i]);
    const int y = pos_y(positions[i]);
    block_occupancy[i] = block_bits(x, y, block.w, block.h);
    occupied |= block_occupancy[i];
  }

  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const StaticBlock& block = topology.blocks[i];
    const std::uint64_t other = occupied & ~block_occupancy[i];
    static constexpr std::array<int, 4> dx = {-1, 1, 0, 0};
    static constexpr std::array<int, 4> dy = {0, 0, -1, 1};
    for (int direction = 0; direction < 4; ++direction) {
      const bool horizontal = direction < 2;
      if (block.axis == 0 && !horizontal) continue;
      if (block.axis == 1 && horizontal) continue;
      const int origin_x = pos_x(positions[i]);
      const int origin_y = pos_y(positions[i]);
      for (int amount = 1; amount <= 7; ++amount) {
        const int x = origin_x + dx[static_cast<std::size_t>(direction)] * amount;
        const int y = origin_y + dy[static_cast<std::size_t>(direction)] * amount;
        if (!inside(x, y, block.w, block.h)) break;
        if ((block_bits(x, y, block.w, block.h) & other) != 0) break;
        auto next_positions = positions;
        next_positions[i] = position(x, y);
        const PackedState next = pack(topology, next_positions);
        callback(
            next,
            static_cast<std::uint8_t>(block.class_id),
            position(x, y),
            positions[i]);
      }
    }
  }
}

bool compile_topology(const Level& level, PureTopology& topology, std::string& error) {
  topology = {};
  topology.goal = level;
  std::vector<const Block*> movable;
  const Block* target = escape::find_block(level, level.target_id);
  if (!target) {
    error = "missing-target";
    return false;
  }
  movable.push_back(target);
  for (const Block& block : level.blocks) {
    if (block.id == level.target_id) continue;
    if (block.type == "fixed") {
      topology.fixed_cells |= block_bits(block.x, block.y, block.w, block.h);
    } else if (block.type == "normal") {
      movable.push_back(&block);
    } else {
      error = "special-block";
      return false;
    }
  }
  if (movable.size() > kMaxMovable) {
    error = "too-many-movable";
    return false;
  }

  std::map<std::string, int> class_ids;
  std::array<std::uint8_t, kMaxMovable> positions{};
  for (std::size_t i = 0; i < movable.size(); ++i) {
    const Block& block = *movable[i];
    StaticBlock compiled;
    compiled.id = block.id;
    compiled.w = block.w;
    compiled.h = block.h;
    compiled.axis = block.move_dir == "horizontal" ? 0
        : block.move_dir == "vertical" ? 1 : 2;
    compiled.target = i == 0;
    const int shape = shape_index(block);
    compiled.shape = compiled.target ? "target"
        : shape >= 0 ? kShapes[static_cast<std::size_t>(shape)].key : "";
    if (!compiled.target && compiled.shape.empty()) {
      error = "unknown-shape";
      return false;
    }
    const std::string descriptor = compiled.target
        ? "target"
        : compiled.shape + ":" + std::to_string(compiled.axis);
    auto [found, inserted] = class_ids.emplace(descriptor, static_cast<int>(class_ids.size()));
    compiled.class_id = found->second;
    if (inserted) topology.classes.emplace_back();
    topology.classes[static_cast<std::size_t>(compiled.class_id)].push_back(static_cast<int>(i));
    positions[i] = position(block.x, block.y);
    topology.blocks.push_back(std::move(compiled));
  }
  topology.target_goal = position(target->x, target->y);
  topology.goal.blocks.clear();
  topology.goal.blocks.reserve(level.blocks.size());
  for (std::size_t i = 0; i < movable.size(); ++i) topology.goal.blocks.push_back(*movable[i]);
  for (const Block& block : level.blocks) {
    if (block.type == "fixed") topology.goal.blocks.push_back(block);
  }
  const PackedState canonical = pack(topology, positions);
  const auto canonical_positions = unpack(topology, canonical);
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    Block* block = escape::find_block(topology.goal, topology.blocks[i].id);
    if (!block) continue;
    block->x = pos_x(canonical_positions[i]);
    block->y = pos_y(canonical_positions[i]);
  }
  return true;
}

PackedState goal_state(const PureTopology& topology) {
  std::array<std::uint8_t, kMaxMovable> positions{};
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const Block* block = escape::find_block(topology.goal, topology.blocks[i].id);
    positions[i] = position(block->x, block->y);
  }
  return pack(topology, positions);
}

std::optional<PackedState> state_from_level(
    const PureTopology& topology,
    const Level& level) {
  std::array<std::uint8_t, kMaxMovable> positions{};
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    const Block* block = escape::find_block(level, topology.blocks[i].id);
    if (!block) return std::nullopt;
    positions[i] = position(block->x, block->y);
  }
  return pack(topology, positions);
}

ComponentResult analyze_component(
    const PureTopology& topology,
    int desired_depth,
    int maximum_states) {
  ComponentResult result;
  const auto enumeration_started = std::chrono::steady_clock::now();
  FlatStateMap state_map(static_cast<std::size_t>(maximum_states));
  result.states.reserve(std::min(maximum_states, 500'000));
  const auto [root, inserted] = state_map.insert(goal_state(topology), result.states);
  (void)inserted;
  for (std::uint32_t cursor = root;
       cursor < result.states.size() && result.states.size() < static_cast<std::size_t>(maximum_states);
       ++cursor) {
    generate_neighbors(topology, result.states[cursor],
        [&](const PackedState& next, std::uint8_t, std::uint8_t, std::uint8_t) {
          if (result.states.size() >= static_cast<std::size_t>(maximum_states)) return;
          state_map.insert(next, result.states);
        });
  }
  result.complete = result.states.size() < static_cast<std::size_t>(maximum_states);
  result.enumeration_ms = static_cast<std::uint64_t>(
      std::chrono::duration_cast<std::chrono::milliseconds>(
          std::chrono::steady_clock::now() - enumeration_started).count());
  if (!result.complete) return result;

  const auto distance_started = std::chrono::steady_clock::now();
  result.distance.assign(result.states.size(), 0);
  result.parent.assign(result.states.size(), kNoParent);
  result.reverse_move.resize(result.states.size());
  std::deque<std::uint32_t> queue;
  for (std::uint32_t id = 0; id < result.states.size(); ++id) {
    const auto positions = unpack(topology, result.states[id]);
    if (positions[0] == topology.target_goal) {
      result.distance[id] = 1;
      queue.push_back(id);
    }
  }
  while (!queue.empty()) {
    const std::uint32_t current = queue.front();
    queue.pop_front();
    const std::uint16_t next_distance =
        static_cast<std::uint16_t>(result.distance[current] + 1);
    generate_neighbors(topology, result.states[current],
        [&](const PackedState& neighbor,
            std::uint8_t class_id,
            std::uint8_t moved_to,
            std::uint8_t moved_from) {
          const std::uint32_t id = state_map.find(neighbor, result.states);
          if (id == kNoParent || result.distance[id] != 0) return;
          result.distance[id] = next_distance;
          result.parent[id] = current;
          result.reverse_move[id] = {class_id, moved_to, moved_from};
          result.maximum_distance = std::max(result.maximum_distance, static_cast<int>(next_distance));
          if (next_distance == desired_depth && result.exact_candidates.size() < 2048) {
            result.exact_candidates.push_back(id);
          }
          queue.push_back(id);
        });
  }
  result.distance_ms = static_cast<std::uint64_t>(
      std::chrono::duration_cast<std::chrono::milliseconds>(
          std::chrono::steady_clock::now() - distance_started).count());
  return result;
}

struct PlacementItem {
  int shape = 0;
  std::string id;
};

bool cells_free(
    const std::array<std::uint8_t, 64>& used,
    const std::array<std::uint8_t, 64>& reserved,
    int x,
    int y,
    int w,
    int h) {
  if (!inside(x, y, w, h)) return false;
  for (int yy = y; yy < y + h; ++yy) {
    for (int xx = x; xx < x + w; ++xx) {
      const int cell = yy * 8 + xx;
      if (used[static_cast<std::size_t>(cell)]
          || reserved[static_cast<std::size_t>(cell)]) return false;
    }
  }
  return true;
}

void mark(
    std::array<std::uint8_t, 64>& cells,
    int x,
    int y,
    int w,
    int h,
    std::uint8_t value) {
  for (int yy = y; yy < y + h; ++yy) {
    for (int xx = x; xx < x + w; ++xx) {
      cells[static_cast<std::size_t>(yy * 8 + xx)] = value;
    }
  }
}

bool place_items(
    const std::vector<PlacementItem>& items,
    std::size_t index,
    std::array<std::uint8_t, 64>& used,
    const std::array<std::uint8_t, 64>& reserved,
    std::vector<Block>& blocks,
    std::mt19937_64& rng,
    std::uint64_t& nodes) {
  if (++nodes > 750'000) return false;
  if (index == items.size()) return true;
  const PlacementItem& item = items[index];
  const Shape& shape = kShapes[static_cast<std::size_t>(item.shape)];
  std::vector<std::pair<int, int>> positions;
  for (int y = 0; y <= 8 - shape.h; ++y) {
    for (int x = 0; x <= 8 - shape.w; ++x) {
      if (cells_free(used, reserved, x, y, shape.w, shape.h)) positions.emplace_back(x, y);
    }
  }
  std::shuffle(positions.begin(), positions.end(), rng);
  for (const auto [x, y] : positions) {
    Block block;
    block.id = item.id;
    block.type = "normal";
    block.x = x;
    block.y = y;
    block.w = shape.w;
    block.h = shape.h;
    block.move_dir = shape.move_dir;
    mark(used, x, y, shape.w, shape.h, 1);
    blocks.push_back(block);
    if (place_items(items, index + 1, used, reserved, blocks, rng, nodes)) return true;
    blocks.pop_back();
    mark(used, x, y, shape.w, shape.h, 0);
  }
  return false;
}

std::optional<std::vector<PlacementItem>> balanced_items(
    int target_area,
    std::mt19937_64& rng) {
  for (int attempt = 0; attempt < 200; ++attempt) {
    const int base = std::uniform_int_distribution<int>(1, 3)(rng);
    std::array<int, 8> counts{};
    counts.fill(base);
    int area = 0;
    for (int i = 0; i < 8; ++i) {
      area += counts[static_cast<std::size_t>(i)]
          * kShapes[static_cast<std::size_t>(i)].w
          * kShapes[static_cast<std::size_t>(i)].h;
    }
    std::array<int, 8> order{};
    std::iota(order.begin(), order.end(), 0);
    std::shuffle(order.begin(), order.end(), rng);
    for (const int shape : order) {
      const int shape_area = kShapes[static_cast<std::size_t>(shape)].w
          * kShapes[static_cast<std::size_t>(shape)].h;
      if (area + shape_area <= target_area) {
        counts[static_cast<std::size_t>(shape)]++;
        area += shape_area;
      }
    }
    if (area != target_area) continue;
    const auto [minimum, maximum] = std::minmax_element(counts.begin(), counts.end());
    if (*maximum - *minimum > 1) continue;
    std::vector<PlacementItem> items;
    for (int shape = 0; shape < 8; ++shape) {
      for (int serial = 1; serial <= counts[static_cast<std::size_t>(shape)]; ++serial) {
        items.push_back({
            shape,
            std::string(kShapes[static_cast<std::size_t>(shape)].key)
                + std::to_string(serial)});
      }
    }
    std::stable_sort(items.begin(), items.end(), [](const PlacementItem& lhs, const PlacementItem& rhs) {
      const int lhs_area = kShapes[static_cast<std::size_t>(lhs.shape)].w
          * kShapes[static_cast<std::size_t>(lhs.shape)].h;
      const int rhs_area = kShapes[static_cast<std::size_t>(rhs.shape)].w
          * kShapes[static_cast<std::size_t>(rhs.shape)].h;
      return lhs_area > rhs_area;
    });
    return items;
  }
  return std::nullopt;
}

bool make_random_goal(
    std::mt19937_64& rng,
    int desired_depth,
    Level& level) {
  for (int attempt = 0; attempt < 3000; ++attempt) {
    level = {};
    level.level_id = 4;
    level.width = 8;
    level.height = 8;
    level.target_id = "T";
    level.exit = escape::random_exit(rng);
    const int opening = std::uniform_int_distribution<int>(1, 5)(rng);
    if (level.exit.side == "left" || level.exit.side == "right") level.exit.y = opening;
    else level.exit.x = opening;
    const auto [tx, ty] = escape::solved_target(level.exit);

    Block target;
    target.id = "T";
    target.type = "target";
    target.x = tx;
    target.y = ty;
    target.w = 2;
    target.h = 2;
    target.move_dir = "both";
    target.skin_id = "cat_orange";
    target.facing = level.exit.direction;

    std::array<std::uint8_t, 64> used{};
    std::array<std::uint8_t, 64> reserved{};
    mark(used, tx, ty, 2, 2, 1);
    const auto [ix, iy] = escape::moved_position(tx, ty, escape::away_dir(level.exit), 1);
    if (!inside(ix, iy, 2, 2)) continue;
    Block reserved_target;
    reserved_target.id = "R";
    reserved_target.type = "normal";
    reserved_target.x = ix;
    reserved_target.y = iy;
    reserved_target.w = 2;
    reserved_target.h = 2;
    reserved_target.move_dir = "both";
    for (const int cell : escape::block_cells(reserved_target)) {
      if (!used[static_cast<std::size_t>(cell)]) reserved[static_cast<std::size_t>(cell)] = 1;
    }

    const int empty_count = std::uniform_int_distribution<int>(5, 8)(rng);
    const int fixed_max = desired_depth >= 30 ? 6 : desired_depth >= 25 ? 4 : 3;
    const int fixed_count = std::uniform_int_distribution<int>(0, fixed_max)(rng);
    const int normal_area = 64 - 4 - empty_count - fixed_count;
    const auto items = balanced_items(normal_area, rng);
    if (!items) continue;
    std::vector<Block> normals;
    std::uint64_t nodes = 0;
    if (!place_items(*items, 0, used, reserved, normals, rng, nodes)) continue;

    std::vector<int> free_cells;
    for (int cell = 0; cell < 64; ++cell) {
      if (!used[static_cast<std::size_t>(cell)]
          && !reserved[static_cast<std::size_t>(cell)]) free_cells.push_back(cell);
    }
    if (static_cast<int>(free_cells.size()) < fixed_count) continue;
    std::shuffle(free_cells.begin(), free_cells.end(), rng);

    level.blocks.push_back(target);
    level.blocks.insert(level.blocks.end(), normals.begin(), normals.end());
    for (int index = 0; index < fixed_count; ++index) {
      Block fixed;
      fixed.id = "F" + std::to_string(index + 1);
      fixed.type = "fixed";
      fixed.x = free_cells[static_cast<std::size_t>(index)] % 8;
      fixed.y = free_cells[static_cast<std::size_t>(index)] / 8;
      fixed.move_dir = "none";
      level.blocks.push_back(fixed);
    }
    escape::SpecialCell exit;
    exit.type = "exit";
    exit.x = level.exit.x;
    exit.y = level.exit.y;
    exit.w = level.exit.w;
    exit.h = level.exit.h;
    level.special_cells = {exit};
    escape::style_level(level);

    Level inward = level;
    const std::string inward_move =
        "T:" + std::string(1, escape::away_dir(level.exit)) + "1";
    if (!escape::apply_simple_move(inward, inward_move)) continue;
    const auto legal = escape::legal_simple_moves(inward);
    std::set<std::string> moving_ids;
    for (const std::string& raw : legal) {
      if (const auto parsed = escape::parse_move(raw)) moving_ids.insert(parsed->block_id);
    }
    if (legal.size() < 8 || moving_ids.size() < 4) continue;
    return true;
  }
  return false;
}

char direction_from_positions(std::uint8_t from, std::uint8_t to) {
  if (pos_x(to) < pos_x(from)) return 'L';
  if (pos_x(to) > pos_x(from)) return 'R';
  if (pos_y(to) < pos_y(from)) return 'U';
  return 'D';
}

int amount_from_positions(std::uint8_t from, std::uint8_t to) {
  return std::abs(pos_x(to) - pos_x(from)) + std::abs(pos_y(to) - pos_y(from));
}

bool materialize_candidate(
    const PureTopology& topology,
    const ComponentResult& component,
    std::uint32_t candidate,
    Level& level,
    std::vector<std::string>& solution) {
  level = topology.goal;
  auto positions = unpack(topology, component.states[candidate]);
  for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
    Block* block = escape::find_block(level, topology.blocks[i].id);
    if (!block) return false;
    block->x = pos_x(positions[i]);
    block->y = pos_y(positions[i]);
  }

  Level replay = level;
  std::uint32_t cursor = candidate;
  while (component.parent[cursor] != kNoParent) {
    const ReverseMove edge = component.reverse_move[cursor];
    Block* selected = nullptr;
    for (std::size_t i = 0; i < topology.blocks.size(); ++i) {
      if (topology.blocks[i].class_id != edge.class_id) continue;
      Block* block = escape::find_block(replay, topology.blocks[i].id);
      if (block && position(block->x, block->y) == edge.from) {
        selected = block;
        break;
      }
    }
    if (!selected) return false;
    const char direction = direction_from_positions(edge.from, edge.to);
    const int amount = amount_from_positions(edge.from, edge.to);
    const std::string raw =
        selected->id + ":" + std::string(1, direction) + std::to_string(amount);
    if (!escape::apply_simple_move(replay, raw)) return false;
    solution.push_back(raw);
    cursor = component.parent[cursor];
  }
  const std::string exit_move =
      "T:" + std::string(1, escape::primary_dir(level.exit)) + "1";
  solution.push_back(exit_move);
  SolverEngine solver;
  const SolverResult replayed = solver.replay(level, solution);
  return replayed.replay_ok && replayed.solved;
}

std::string normalized_direction(char direction, const escape::Exit& exit) {
  int rotation = 0;
  if (exit.side == "right") rotation = 0;
  else if (exit.side == "bottom") rotation = 1;
  else if (exit.side == "left") rotation = 2;
  else rotation = 3;
  int vector_x = direction == 'L' ? -1 : direction == 'R' ? 1 : 0;
  int vector_y = direction == 'U' ? -1 : direction == 'D' ? 1 : 0;
  for (int i = 0; i < rotation; ++i) {
    const int next_x = -vector_y;
    const int next_y = vector_x;
    vector_x = next_x;
    vector_y = next_y;
  }
  if (vector_x < 0) return "L";
  if (vector_x > 0) return "R";
  if (vector_y < 0) return "U";
  return "D";
}

Fingerprint fingerprint(const Level& level, const std::vector<std::string>& solution) {
  Fingerprint result;
  std::vector<std::string> topology_tokens;
  for (const Block& block : level.blocks) {
    if (block.type == "target") continue;
    topology_tokens.push_back(
        block.type + ":" + std::to_string(block.w) + "x" + std::to_string(block.h)
        + ":" + block.move_dir + "@" + std::to_string(block.x) + "," + std::to_string(block.y));
  }
  std::sort(topology_tokens.begin(), topology_tokens.end());
  for (const std::string& token : topology_tokens) result.topology += token + ";";

  std::vector<std::string> tokens;
  std::vector<std::string> target_tokens;
  for (const std::string& raw : solution) {
    const auto move = escape::parse_move(raw);
    if (!move) continue;
    const Block* block = escape::find_block(level, move->block_id);
    if (!block) continue;
    std::string shape = block->type == "target" ? "T"
        : block->type == "fixed" ? "F"
        : kShapes[static_cast<std::size_t>(shape_index(*block))].key;
    const std::string token =
        shape + normalized_direction(move->dir, level.exit) + std::to_string(move->amount);
    tokens.push_back(token);
    result.moved_shape_histogram[shape]++;
    if (shape == "T") target_tokens.push_back(token);
  }
  for (const std::string& token : tokens) result.exact_solution += token + ",";
  for (std::size_t i = 0; i + 2 < tokens.size(); ++i) {
    result.solution_ngrams.insert(tokens[i] + "|" + tokens[i + 1] + "|" + tokens[i + 2]);
  }
  for (std::size_t i = 0; i + 1 < target_tokens.size(); ++i) {
    result.target_ngrams.insert(target_tokens[i] + "|" + target_tokens[i + 1]);
  }
  return result;
}

double jaccard(const std::set<std::string>& lhs, const std::set<std::string>& rhs) {
  if (lhs.empty() && rhs.empty()) return 1.0;
  std::size_t intersection = 0;
  auto left = lhs.begin();
  auto right = rhs.begin();
  while (left != lhs.end() && right != rhs.end()) {
    if (*left < *right) ++left;
    else if (*right < *left) ++right;
    else {
      intersection++;
      ++left;
      ++right;
    }
  }
  const std::size_t total = lhs.size() + rhs.size() - intersection;
  return total == 0 ? 1.0 : static_cast<double>(intersection) / total;
}

bool diverse_enough(
    const Fingerprint& candidate,
    const std::vector<Fingerprint>& accepted,
    std::string& failure) {
  for (const Fingerprint& existing : accepted) {
    if (candidate.topology == existing.topology) {
      failure = "duplicate-topology";
      return false;
    }
    if (candidate.exact_solution == existing.exact_solution) {
      failure = "duplicate-solution";
      return false;
    }
    const double solution_similarity =
        jaccard(candidate.solution_ngrams, existing.solution_ngrams);
    if (solution_similarity > 0.58) {
      failure = "solution-pattern-too-similar";
      return false;
    }
    if (!candidate.target_ngrams.empty() && !existing.target_ngrams.empty()
        && solution_similarity > 0.40
        && jaccard(candidate.target_ngrams, existing.target_ngrams) > 0.80) {
      failure = "target-route-too-similar";
      return false;
    }
  }
  return true;
}

bool verify_exact(Level& level, const std::vector<std::string>& solution, int depth) {
  level.best_steps = depth;
  level.designer_solution = solution;
  SolverEngine solver;
  SolverOptions options;
  options.max_depth = depth;
  options.max_nodes = 500'000'000ULL;
  options.deadline_ms = 600'000;
  options.preferred_moves = solution;
  options.threads = 1;
  const SolverResult exact = solver.solve(level, options);
  return exact.solved && !exact.limited && exact.depth == depth;
}

bool generate_one(
    int level_id,
    int depth,
    std::uint64_t base_seed,
    int topology_attempts,
    int maximum_states,
    const std::vector<Fingerprint>& accepted,
    bool crosscheck_with_general_solver,
    Level& output,
    Fingerprint& output_fingerprint,
    json& record) {
  const std::uint64_t seed = mix64(base_seed ^ (static_cast<std::uint64_t>(level_id) << 32));
  std::mt19937_64 rng(seed);
  for (int attempt = 1; attempt <= topology_attempts; ++attempt) {
    Level goal;
    if (!make_random_goal(rng, depth, goal)) continue;
    PureTopology topology;
    std::string compile_error;
    if (!compile_topology(goal, topology, compile_error)) continue;
    ComponentResult component = analyze_component(topology, depth, maximum_states);
    if (component.maximum_distance >= depth - 3 || attempt % 500 == 0) {
      std::cerr << "[independent-topology] level=" << level_id
                << " depth=" << depth
                << " attempt=" << attempt
                << " states=" << component.states.size()
                << " complete=" << component.complete
                << " maxDistance=" << component.maximum_distance
                << " candidates=" << component.exact_candidates.size()
                << " enumerateMs=" << component.enumeration_ms
                << " distanceMs=" << component.distance_ms << '\n';
    }
    if (!component.complete || component.exact_candidates.empty()) continue;
    std::shuffle(component.exact_candidates.begin(), component.exact_candidates.end(), rng);
    for (const std::uint32_t candidate : component.exact_candidates) {
      Level level;
      std::vector<std::string> solution;
      if (!materialize_candidate(topology, component, candidate, level, solution)) continue;
      if (static_cast<int>(solution.size()) != depth) continue;
      Fingerprint current = fingerprint(level, solution);
      std::string diversity_failure;
      if (!diverse_enough(current, accepted, diversity_failure)) continue;
      if (crosscheck_with_general_solver && !verify_exact(level, solution, depth)) continue;

      level.level_id = level_id;
      level.best_steps = depth;
      level.designer_solution = solution;
      constexpr int two = 2;
      constexpr int maximum = 5;
      level.step_limit = depth + maximum;
      escape::style_level(level);
      output = std::move(level);
      output_fingerprint = std::move(current);
      record = {
          {"seed", seed},
          {"topologyAttempt", attempt},
          {"componentStates", component.states.size()},
          {"componentMaximumDistance", component.maximum_distance},
          {"enumerationMs", component.enumeration_ms},
          {"distanceMs", component.distance_ms},
          {"trueOptimalSteps", depth},
          {"emptyCells", escape::plain_empty_count(output)},
          {"fixedBlocks", escape::fixed_count(output)},
          {"shapeCounts", escape::shape_counts(output)},
          {"starRule", {{"three", 0}, {"two", two}, {"max", maximum}}},
      };
      return true;
    }
  }
  return false;
}

bool write_atomic(const std::filesystem::path& path, const std::string& text) {
  std::error_code error;
  std::filesystem::create_directories(path.parent_path(), error);
  if (error) return false;
  const std::filesystem::path temporary = path.string() + ".independent_new";
  {
    std::ofstream output(temporary, std::ios::binary | std::ios::trunc);
    if (!output) return false;
    output << text;
    output.flush();
    if (!output) return false;
  }
  std::filesystem::remove(path, error);
  error.clear();
  std::filesystem::rename(temporary, path, error);
  return !error;
}

json level_json_with_star_rule(const Level& level) {
  json value = escape::level_to_json(level);
  constexpr int two = 2;
  constexpr int maximum = 5;
  value["starRule"] = {{"three", 0}, {"two", two}, {"max", maximum}};
  value["stepLimit"] = level.best_steps + maximum;
  return value;
}

bool save_checkpoint(
    const Arguments& args,
    const std::vector<Level>& generated,
    const json& records) {
  json levels = json::array();
  for (const Level& level : generated) levels.push_back(level_json_with_star_rule(level));
  const json checkpoint = {
      {"version", 1},
      {"from", args.from},
      {"to", args.to},
      {"seed", args.seed},
      {"levels", levels},
      {"records", records},
  };
  return write_atomic(args.checkpoint, checkpoint.dump() + "\n");
}

bool load_checkpoint(
    const Arguments& args,
    std::vector<Level>& generated,
    std::vector<Fingerprint>& fingerprints,
    json& records) {
  std::ifstream input(args.checkpoint, std::ios::binary);
  if (!input) return true;
  try {
    json checkpoint;
    input >> checkpoint;
    if (checkpoint.value("version", 0) != 1
        || checkpoint.value("from", 0) != args.from
        || checkpoint.value("to", 0) != args.to) {
      return false;
    }
    records = checkpoint.value("records", json::object());
    for (const json& value : checkpoint.value("levels", json::array())) {
      Level level = escape::level_from_json(value);
      if (level.level_id != args.from + static_cast<int>(generated.size())
          || level.best_steps != target_depth(level.level_id)
          || escape::plain_empty_count(level) < 5
          || escape::plain_empty_count(level) > 8) {
        return false;
      }
      generated.push_back(level);
      fingerprints.push_back(fingerprint(level, level.designer_solution));
    }
    return true;
  } catch (...) {
    return false;
  }
}

bool write_final(
    const Arguments& args,
    const std::vector<Level>& generated,
    const json& records) {
  json original = json::array();
  {
    std::ifstream input(args.levels, std::ios::binary);
    if (!input) return false;
    input >> original;
  }
  json levels = json::array();
  for (const json& value : original) {
    if (value.value("levelId", 0) < args.from) levels.push_back(value);
  }
  for (const Level& level : generated) levels.push_back(level_json_with_star_rule(level));
  std::sort(levels.begin(), levels.end(), [](const json& lhs, const json& rhs) {
    return lhs.value("levelId", 0) < rhs.value("levelId", 0);
  });
  if (levels.size() != 180) return false;
  const json report = {
      {"pipeline", "independent-random-pure-basic-component-bfs-v1"},
      {"generatedRange", {args.from, args.to}},
      {"generatedCount", generated.size()},
      {"schedule", {
          {"levels4To6", 12},
          {"increaseEveryLevels", 3},
          {"maximum", 30},
      }},
      {"emptyCells", {{"minimum", 5}, {"maximum", 8}}},
      {"independentTopologyPerLevel", true},
      {"symmetryExpansionUsed", false},
      {"templateExpansionUsed", false},
      {"exactProof", "complete-component-enumeration-plus-multi-source-bfs-from-all-exit-ready-states"},
      {"records", records},
  };
  return write_atomic(args.levels, levels.dump(2) + "\n")
      && write_atomic(
          args.data,
          "const LEVEL_DATA=" + levels.dump() + ";\nexport default LEVEL_DATA;\n")
      && write_atomic(args.report, report.dump(2) + "\n");
}

bool validate_all(const Arguments& args) {
  json source;
  {
    std::ifstream input(args.levels, std::ios::binary);
    if (!input) return false;
    input >> source;
  }
  std::vector<Fingerprint> fingerprints;
  fingerprints.reserve(177);
  std::set<std::string> topology_signatures;
  json records = json::object();
  int checked = 0;
  for (const json& value : source) {
    const int level_id = value.value("levelId", 0);
    if (level_id < args.from || level_id > args.to) continue;
    Level level = escape::level_from_json(value);
    const int expected_depth = target_depth(level_id);
    const json star_rule = value.value("starRule", json::object());
    if (level.width != 8 || level.height != 8
        || level.best_steps != expected_depth
        || level.designer_solution.size() != static_cast<std::size_t>(expected_depth)
        || star_rule.value("three", -1) != 0
        || star_rule.value("two", -1) != 2
        || star_rule.value("max", -1) != 5
        || value.value("stepLimit", -1) != expected_depth + 5
        || escape::plain_empty_count(level) < 5
        || escape::plain_empty_count(level) > 8
        || escape::fixed_count(level) > 6
        || level.special_cells.size() != 1
        || level.special_cells.front().type != "exit") {
      std::cerr << "[independent-validate-structure-failed] level=" << level_id << '\n';
      return false;
    }
    std::array<int, 8> shape_counts{};
    for (const Block& block : level.blocks) {
      if (block.type == "target" || block.type == "fixed") continue;
      if (block.type != "normal") return false;
      const int shape = shape_index(block);
      if (shape < 0) return false;
      shape_counts[static_cast<std::size_t>(shape)]++;
    }
    const auto [minimum_shape, maximum_shape] =
        std::minmax_element(shape_counts.begin(), shape_counts.end());
    if (*minimum_shape <= 0 || *maximum_shape - *minimum_shape > 1) return false;

    SolverEngine replay_solver;
    const SolverResult replayed =
        replay_solver.replay(level, level.designer_solution);
    if (!replayed.replay_ok || !replayed.solved) {
      std::cerr << "[independent-validate-replay-failed] level=" << level_id << '\n';
      return false;
    }

    Level goal = level;
    for (std::size_t index = 0; index + 1 < level.designer_solution.size(); ++index) {
      if (!escape::apply_simple_move(goal, level.designer_solution[index])) {
        std::cerr << "[independent-validate-goal-replay-failed] level=" << level_id << '\n';
        return false;
      }
    }
    const Block* target = escape::find_block(goal, goal.target_id);
    const auto [goal_x, goal_y] = escape::solved_target(goal.exit);
    if (!target || target->x != goal_x || target->y != goal_y) {
      std::cerr << "[independent-validate-goal-state-failed] level=" << level_id << '\n';
      return false;
    }

    PureTopology topology;
    std::string compile_error;
    if (!compile_topology(goal, topology, compile_error)) return false;
    ComponentResult component =
        analyze_component(topology, expected_depth, args.max_component_states);
    if (!component.complete) {
      std::cerr << "[independent-validate-component-limited] level=" << level_id << '\n';
      return false;
    }
    const auto packed_candidate = state_from_level(topology, level);
    if (!packed_candidate) return false;
    std::uint32_t candidate_id = kNoParent;
    for (std::uint32_t id = 0; id < component.states.size(); ++id) {
      if (component.states[id] == *packed_candidate) {
        candidate_id = id;
        break;
      }
    }
    if (candidate_id == kNoParent
        || component.distance[candidate_id] != expected_depth) {
      std::cerr << "[independent-validate-distance-failed] level=" << level_id
                << " actual="
                << (candidate_id == kNoParent ? -1 : component.distance[candidate_id])
                << " expected=" << expected_depth << '\n';
      return false;
    }

    Fingerprint current = fingerprint(level, level.designer_solution);
    std::string diversity_failure;
    if (!diverse_enough(current, fingerprints, diversity_failure)) {
      std::cerr << "[independent-validate-diversity-failed] level=" << level_id
                << " reason=" << diversity_failure << '\n';
      return false;
    }
    if (!topology_signatures.insert(current.topology).second) return false;
    fingerprints.push_back(std::move(current));
    records[std::to_string(level_id)] = {
        {"trueOptimalSteps", expected_depth},
        {"componentStates", component.states.size()},
        {"componentMaximumDistance", component.maximum_distance},
        {"enumerationMs", component.enumeration_ms},
        {"distanceMs", component.distance_ms},
        {"emptyCells", escape::plain_empty_count(level)},
        {"fixedBlocks", escape::fixed_count(level)},
    };
    checked++;
    std::cerr << "[independent-validate] checked=" << checked
              << " level=" << level_id
              << " depth=" << expected_depth
              << " states=" << component.states.size() << '\n';
  }
  if (checked != args.to - args.from + 1) return false;
  const json report = {
      {"valid", true},
      {"checked", checked},
      {"range", {args.from, args.to}},
      {"independentTopologies", topology_signatures.size()},
      {"symmetryExpansionUsed", false},
      {"templateExpansionUsed", false},
      {"exactOptimalVerified", true},
      {"diversityGateVerified", true},
      {"records", records},
  };
  const std::filesystem::path validation_report =
      args.report.parent_path() / "independent_validation_report.json";
  return write_atomic(validation_report, report.dump(2) + "\n");
}

}  // namespace

int main(int argc, char** argv) {
  Arguments args;
  if (!parse_args(argc, argv, args)) {
    std::cerr << "usage: independent_generator [--from 4 --to 180]"
                 " [--probe-depth 20..40] [--seed N]"
                 " [--max-component-states N] [--topology-attempts N]\n";
    return 2;
  }
  if (args.seed == 0) {
    args.seed = mix64(static_cast<std::uint64_t>(
        std::chrono::high_resolution_clock::now().time_since_epoch().count()));
  }

  if (args.probe_depth > 0) {
    Level level;
    Fingerprint fp;
    json record;
    const bool found = generate_one(
        4, args.probe_depth, args.seed, args.topology_attempts,
        args.max_component_states, {}, true, level, fp, record);
    if (found) {
      json output = escape::level_to_json(level);
      output["starRule"] = record["starRule"];
      std::cout << json({{"found", true}, {"record", record}, {"level", output}}).dump(2) << '\n';
      return 0;
    }
    std::cout << json({{"found", false}, {"depth", args.probe_depth}}).dump(2) << '\n';
    return 1;
  }

  if (args.validate_only) {
    if (!validate_all(args)) return 1;
    std::cout << "validated independent random levels " << args.from << '-'
              << args.to << '\n';
    return 0;
  }

  std::vector<Level> generated;
  std::vector<Fingerprint> fingerprints;
  json records = json::object();
  if (!load_checkpoint(args, generated, fingerprints, records)) {
    std::cerr << "checkpoint does not match this generation request\n";
    return 1;
  }
  if (!generated.empty()) {
    std::cerr << "[independent-resume] generated=" << generated.size()
              << " nextLevel=" << args.from + generated.size() << '\n';
  }
  for (int level_id = args.from + static_cast<int>(generated.size());
       level_id <= args.to;
       ++level_id) {
    const int depth = target_depth(level_id);
    Level level;
    Fingerprint current;
    json record;
    std::cerr << "[independent-level-start] level=" << level_id
              << " depth=" << depth
              << " acceptedTopologies=" << generated.size() << '\n';
    const bool found = generate_one(
        level_id, depth, args.seed, args.topology_attempts,
        args.max_component_states, fingerprints, false, level, current, record);
    if (!found) {
      std::cerr << "[independent-level-failed] level=" << level_id
                << " depth=" << depth << '\n';
      return 1;
    }
    generated.push_back(std::move(level));
    fingerprints.push_back(std::move(current));
    records[std::to_string(level_id)] = std::move(record);
    if (!save_checkpoint(args, generated, records)) {
      std::cerr << "failed to save checkpoint after level " << level_id << '\n';
      return 1;
    }
    std::cerr << "[independent-level-complete] level=" << level_id
              << " depth=" << depth
              << " empty=" << escape::plain_empty_count(generated.back())
              << " fixed=" << escape::fixed_count(generated.back()) << '\n';
  }
  if (!write_final(args, generated, records)) {
    std::cerr << "failed to write final level files\n";
    return 1;
  }
  std::cout << "generated independent random levels " << args.from << '-'
            << args.to << " count=" << generated.size() << '\n';
  return 0;
}
