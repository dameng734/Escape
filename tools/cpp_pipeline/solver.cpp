#include "pipeline.hpp"

#include <bit>
#include <condition_variable>
#include <cstring>
#include <fstream>
#include <functional>
#include <iostream>
#include <limits>
#include <queue>
#include <tuple>

namespace escape {
namespace {

enum class BlockType : std::uint8_t {
  Normal = 0,
  Fixed = 1,
  Target = 2,
  Magnet = 3,
  Ice = 4,
  Locked = 5,
  Key = 6,
};

enum class MoveDir : std::uint8_t {
  None = 0,
  Horizontal = 1,
  Vertical = 2,
  Both = 3,
};

enum class Direction : std::uint8_t {
  Left = 0,
  Right = 1,
  Up = 2,
  Down = 3,
};

enum EventBits : std::uint8_t {
  UsedTeleport = 1 << 0,
  UsedUnlock = 1 << 1,
  UsedIceDamage = 1 << 2,
  UsedMagnet = 1 << 3,
  UsedMagnetAttract = 1 << 4,
  UsedMagnetRepel = 1 << 5,
  MovedSpecial = 1 << 6,
};

constexpr std::array<int, 4> kDx = {-1, 1, 0, 0};
constexpr std::array<int, 4> kDy = {0, 0, -1, 1};

struct RuntimeBlock {
  BlockType type = BlockType::Normal;
  std::int8_t x = 0;
  std::int8_t y = 0;
  std::uint8_t w = 1;
  std::uint8_t h = 1;
  MoveDir move_dir = MoveDir::None;
  std::uint8_t pole = 0;
  std::uint8_t ice_state = 0;
  bool active = true;
  std::int8_t last_portal = -1;
  std::int8_t magnet_slot = -1;
};

struct RuntimeState {
  std::array<RuntimeBlock, kMaxBlocks> blocks{};
  std::array<std::uint64_t, 4> magnet_links{};
  std::uint8_t count = 0;
};

struct NativeMove {
  std::uint8_t block = 0;
  Direction dir = Direction::Left;
  std::uint8_t amount = 1;
};

struct Portal {
  int x = 0;
  int y = 0;
  int w = 2;
  int h = 2;
  int pair = -1;
};

struct CompiledLevel {
  int width = 8;
  int height = 8;
  int exit_side = 0;
  int exit_x = 0;
  int exit_y = 0;
  std::uint8_t target = 0;
  std::vector<std::string> ids;
  std::unordered_map<std::string, int> id_to_index;
  std::array<int, kMaxBlocks> unlock_target{};
  std::array<MoveDir, kMaxBlocks> unlocked_move_dir{};
  std::array<bool, kMaxBlocks> originally_locked{};
  std::array<int, kMaxBlocks> canonical_class{};
  std::vector<std::vector<std::uint8_t>> canonical_members;
  std::vector<std::vector<std::uint8_t>> ice_canonical_members;
  std::vector<std::uint8_t> magnets;
  std::vector<std::uint8_t> ice;
  std::vector<std::uint8_t> locks;
  std::vector<Portal> portals;
  std::array<std::int8_t, 64> relaxed_target_distance{};
  std::uint8_t key_words = 8;
};

struct Placement {
  bool can_move = false;
  bool blocked_by_other = false;
  std::uint64_t ice_blockers = 0;
};

struct Relation {
  bool valid = false;
  bool horizontal = false;
  std::uint8_t first = 0;
  std::uint8_t second = 0;
  int gap = 0;
};

struct PackedKey {
  std::array<std::uint64_t, 8> words{};

  bool operator==(const PackedKey& other) const noexcept {
    return words == other.words;
  }
};

std::uint64_t mix64(std::uint64_t value) {
  value += 0x9e3779b97f4a7c15ULL;
  value = (value ^ (value >> 30)) * 0xbf58476d1ce4e5b9ULL;
  value = (value ^ (value >> 27)) * 0x94d049bb133111ebULL;
  return value ^ (value >> 31);
}

std::uint64_t key_hash(const PackedKey& key) {
  std::uint64_t hash = 0x243f6a8885a308d3ULL;
  for (const std::uint64_t word : key.words) hash = mix64(hash ^ mix64(word));
  return hash;
}

std::uint64_t key_hash(const PackedKey& key, int word_count) {
  std::uint64_t hash = 0x243f6a8885a308d3ULL;
  for (int i = 0; i < word_count; ++i) {
    hash = mix64(hash ^ mix64(key.words[static_cast<std::size_t>(i)]));
  }
  return hash;
}

class FlatVisited {
 public:
  explicit FlatVisited(
      int word_count = 8,
      std::size_t initial_capacity = 1U << 18,
      std::size_t max_capacity = 1U << 21)
      : word_count_(word_count),
        max_capacity_(std::max(initial_capacity, max_capacity)) {
    reset_capacity(initial_capacity);
  }

  void clear() {
    std::fill(used_.begin(), used_.end(), 0);
    size_ = 0;
  }

  bool should_prune(
      const PackedKey& key,
      std::uint8_t remaining,
      std::uint64_t hash) {
    bool can_insert = true;
    if ((size_ + 1) * 10 >= used_.size() * 7) {
      if (used_.size() < max_capacity_) grow();
      else can_insert = false;
    }
    std::size_t slot = static_cast<std::size_t>(hash) & mask_;
    while (used_[slot]) {
      if (key_equals(slot, key)) {
        if (remaining_[slot] >= remaining) return true;
        remaining_[slot] = remaining;
        return false;
      }
      slot = (slot + 1) & mask_;
    }
    if (!can_insert) return false;
    used_[slot] = 1;
    copy_key(slot, key);
    remaining_[slot] = remaining;
    size_++;
    return false;
  }

 private:
  bool key_equals(std::size_t slot, const PackedKey& key) const {
    const std::size_t base = slot * static_cast<std::size_t>(word_count_);
    for (int word = 0; word < word_count_; ++word) {
      if (words_[base + static_cast<std::size_t>(word)]
          != key.words[static_cast<std::size_t>(word)]) {
        return false;
      }
    }
    return true;
  }

  void copy_key(std::size_t slot, const PackedKey& key) {
    const std::size_t base = slot * static_cast<std::size_t>(word_count_);
    for (int word = 0; word < word_count_; ++word) {
      words_[base + static_cast<std::size_t>(word)] =
          key.words[static_cast<std::size_t>(word)];
    }
  }

  void reset_capacity(std::size_t capacity) {
    std::size_t rounded = 1;
    while (rounded < capacity) rounded <<= 1;
    words_.assign(rounded * static_cast<std::size_t>(word_count_), 0);
    remaining_.assign(rounded, 0);
    used_.assign(rounded, 0);
    mask_ = rounded - 1;
    size_ = 0;
  }

  void grow() {
    std::vector<std::uint64_t> old_words = std::move(words_);
    std::vector<std::uint8_t> old_remaining = std::move(remaining_);
    std::vector<std::uint8_t> old_used = std::move(used_);
    const std::size_t old_capacity = old_used.size();
    reset_capacity(old_capacity * 2);
    PackedKey key;
    for (std::size_t i = 0; i < old_capacity; ++i) {
      if (!old_used[i]) continue;
      const std::size_t old_base = i * static_cast<std::size_t>(word_count_);
      for (int word = 0; word < word_count_; ++word) {
        key.words[static_cast<std::size_t>(word)] =
            old_words[old_base + static_cast<std::size_t>(word)];
      }
      std::size_t slot =
          static_cast<std::size_t>(key_hash(key, word_count_)) & mask_;
      while (used_[slot]) slot = (slot + 1) & mask_;
      used_[slot] = 1;
      copy_key(slot, key);
      remaining_[slot] = old_remaining[i];
      size_++;
    }
  }

  int word_count_ = 8;
  std::vector<std::uint64_t> words_;
  std::vector<std::uint8_t> remaining_;
  std::vector<std::uint8_t> used_;
  std::size_t mask_ = 0;
  std::size_t size_ = 0;
  std::size_t max_capacity_ = 1U << 20;
};

class ConcurrentVisited {
 public:
  static constexpr std::size_t kShardCount = 64;

  explicit ConcurrentVisited(int word_count) : word_count_(word_count) {
    for (auto& shard : shards_) shard = std::make_unique<Shard>(word_count);
  }

  bool should_prune(const PackedKey& key, std::uint8_t remaining) {
    const std::uint64_t hash = key_hash(key, word_count_);
    return should_prune(key, remaining, hash);
  }

  bool should_prune(
      const PackedKey& key,
      std::uint8_t remaining,
      std::uint64_t hash) {
    Shard& shard = *shards_[static_cast<std::size_t>(hash) & (kShardCount - 1)];
    std::lock_guard lock(shard.mutex);
    return shard.visited.should_prune(key, remaining, hash);
  }

 private:
  struct Shard {
    explicit Shard(int word_count)
        : visited(word_count, 1U << 14, 1U << 21) {}
    std::mutex mutex;
    FlatVisited visited;
  };

  int word_count_ = 8;
  std::array<std::unique_ptr<Shard>, kShardCount> shards_;
};

class FlatExactSet {
 public:
  enum class InsertResult { Inserted, Present, Full };

  explicit FlatExactSet(
      std::size_t initial_capacity = 1U << 19,
      std::size_t max_capacity = 1U << 24)
      : max_capacity_(std::max(initial_capacity, max_capacity)) {
    reset_capacity(initial_capacity);
  }

  InsertResult insert(const PackedKey& key) {
    if ((size_ + 1) * 10 >= entries_.size() * 7) {
      if (entries_.size() >= max_capacity_) return InsertResult::Full;
      grow();
    }
    std::size_t slot = static_cast<std::size_t>(key_hash(key)) & mask_;
    while (used_[slot]) {
      if (entries_[slot] == key) return InsertResult::Present;
      slot = (slot + 1) & mask_;
    }
    used_[slot] = 1;
    entries_[slot] = key;
    size_++;
    return InsertResult::Inserted;
  }

 private:
  void reset_capacity(std::size_t capacity) {
    entries_.assign(capacity, {});
    used_.assign(capacity, 0);
    mask_ = capacity - 1;
    size_ = 0;
  }

  void grow() {
    std::vector<PackedKey> old_entries = std::move(entries_);
    std::vector<std::uint8_t> old_used = std::move(used_);
    reset_capacity(old_entries.size() * 2);
    for (std::size_t i = 0; i < old_entries.size(); ++i) {
      if (!old_used[i]) continue;
      std::size_t slot = static_cast<std::size_t>(key_hash(old_entries[i])) & mask_;
      while (used_[slot]) slot = (slot + 1) & mask_;
      used_[slot] = 1;
      entries_[slot] = old_entries[i];
      size_++;
    }
  }

  std::vector<PackedKey> entries_;
  std::vector<std::uint8_t> used_;
  std::size_t mask_ = 0;
  std::size_t size_ = 0;
  std::size_t max_capacity_ = 0;
};

class CompactExactSet {
 public:
  using InsertResult = FlatExactSet::InsertResult;
  struct InsertOutcome {
    InsertResult result = InsertResult::Full;
    std::uint32_t id = 0;
  };

  CompactExactSet(
      int word_count,
      std::size_t initial_capacity = 1U << 20,
      std::size_t max_capacity = 1U << 26)
      : word_count_(word_count),
        max_capacity_(std::max(initial_capacity, max_capacity)) {
    reset_capacity(initial_capacity);
  }

  InsertOutcome insert_with_id(const PackedKey& key) {
    if ((size_ + 1) * 10 >= used_.size() * 7) {
      if (used_.size() >= max_capacity_) return {InsertResult::Full, 0};
      grow();
    }
    std::size_t slot =
        static_cast<std::size_t>(key_hash(key, word_count_)) & mask_;
    while (used_[slot]) {
      if (key_equals(slot, key)) return {InsertResult::Present, ids_[slot]};
      slot = (slot + 1) & mask_;
    }
    const std::uint32_t id = static_cast<std::uint32_t>(size_);
    used_[slot] = 1;
    copy_key(slot, key);
    ids_[slot] = id;
    size_++;
    return {InsertResult::Inserted, id};
  }

  InsertResult insert(const PackedKey& key) {
    return insert_with_id(key).result;
  }

 private:
  bool key_equals(std::size_t slot, const PackedKey& key) const {
    const std::size_t base = slot * static_cast<std::size_t>(word_count_);
    for (int word = 0; word < word_count_; ++word) {
      if (words_[base + static_cast<std::size_t>(word)]
          != key.words[static_cast<std::size_t>(word)]) {
        return false;
      }
    }
    return true;
  }

  void copy_key(std::size_t slot, const PackedKey& key) {
    const std::size_t base = slot * static_cast<std::size_t>(word_count_);
    for (int word = 0; word < word_count_; ++word) {
      words_[base + static_cast<std::size_t>(word)] =
          key.words[static_cast<std::size_t>(word)];
    }
  }

  void reset_capacity(std::size_t capacity) {
    std::size_t rounded = 1;
    while (rounded < capacity) rounded <<= 1;
    words_.assign(rounded * static_cast<std::size_t>(word_count_), 0);
    used_.assign(rounded, 0);
    ids_.assign(rounded, 0);
    mask_ = rounded - 1;
    size_ = 0;
  }

  void grow() {
    std::vector<std::uint64_t> old_words = std::move(words_);
    std::vector<std::uint8_t> old_used = std::move(used_);
    std::vector<std::uint32_t> old_ids = std::move(ids_);
    const std::size_t old_capacity = old_used.size();
    reset_capacity(old_capacity * 2);
    PackedKey key;
    for (std::size_t i = 0; i < old_capacity; ++i) {
      if (!old_used[i]) continue;
      const std::size_t old_base = i * static_cast<std::size_t>(word_count_);
      for (int word = 0; word < word_count_; ++word) {
        key.words[static_cast<std::size_t>(word)] =
            old_words[old_base + static_cast<std::size_t>(word)];
      }
      std::size_t slot =
          static_cast<std::size_t>(key_hash(key, word_count_)) & mask_;
      while (used_[slot]) slot = (slot + 1) & mask_;
      used_[slot] = 1;
      copy_key(slot, key);
      ids_[slot] = old_ids[i];
      size_++;
    }
  }

  int word_count_ = 8;
  std::vector<std::uint64_t> words_;
  std::vector<std::uint8_t> used_;
  std::vector<std::uint32_t> ids_;
  std::size_t mask_ = 0;
  std::size_t size_ = 0;
  std::size_t max_capacity_ = 0;
};

BlockType block_type(const std::string& type) {
  if (type == "fixed") return BlockType::Fixed;
  if (type == "target") return BlockType::Target;
  if (type == "magnet") return BlockType::Magnet;
  if (type == "ice") return BlockType::Ice;
  if (type == "locked") return BlockType::Locked;
  if (type == "key") return BlockType::Key;
  return BlockType::Normal;
}

std::string block_type_name(BlockType type) {
  switch (type) {
    case BlockType::Fixed: return "fixed";
    case BlockType::Target: return "target";
    case BlockType::Magnet: return "magnet";
    case BlockType::Ice: return "ice";
    case BlockType::Locked: return "locked";
    case BlockType::Key: return "key";
    default: return "normal";
  }
}

MoveDir move_dir(const std::string& value) {
  if (value == "horizontal") return MoveDir::Horizontal;
  if (value == "vertical") return MoveDir::Vertical;
  if (value == "both") return MoveDir::Both;
  return MoveDir::None;
}

std::string move_dir_name(MoveDir value) {
  if (value == MoveDir::Horizontal) return "horizontal";
  if (value == MoveDir::Vertical) return "vertical";
  if (value == MoveDir::Both) return "both";
  return "none";
}

Direction direction(char value) {
  if (value == 'R') return Direction::Right;
  if (value == 'U') return Direction::Up;
  if (value == 'D') return Direction::Down;
  return Direction::Left;
}

char direction_name(Direction value) {
  static constexpr std::array<char, 4> names = {'L', 'R', 'U', 'D'};
  return names[static_cast<int>(value)];
}

Direction opposite(Direction value) {
  if (value == Direction::Left) return Direction::Right;
  if (value == Direction::Right) return Direction::Left;
  if (value == Direction::Up) return Direction::Down;
  return Direction::Up;
}

Flags flags_from_bits(std::uint8_t bits) {
  Flags flags;
  flags.used_teleport = bits & UsedTeleport;
  flags.used_unlock = bits & UsedUnlock;
  flags.used_ice_damage = bits & UsedIceDamage;
  flags.used_magnet = bits & UsedMagnet;
  flags.used_magnet_attract = bits & UsedMagnetAttract;
  flags.used_magnet_repel = bits & UsedMagnetRepel;
  flags.moved_special = bits & MovedSpecial;
  return flags;
}

std::uint8_t bits_from_flags(const Flags& flags) {
  std::uint8_t bits = 0;
  if (flags.used_teleport) bits |= UsedTeleport;
  if (flags.used_unlock) bits |= UsedUnlock;
  if (flags.used_ice_damage) bits |= UsedIceDamage;
  if (flags.used_magnet) bits |= UsedMagnet;
  if (flags.used_magnet_attract) bits |= UsedMagnetAttract;
  if (flags.used_magnet_repel) bits |= UsedMagnetRepel;
  if (flags.moved_special) bits |= MovedSpecial;
  return bits;
}

std::uint64_t linked_mask(const RuntimeState& state, std::uint8_t index) {
  const std::int8_t slot = state.blocks[index].magnet_slot;
  return slot >= 0 ? state.magnet_links[static_cast<std::size_t>(slot)] : 0;
}

void set_linked_mask(RuntimeState& state, std::uint8_t index, std::uint64_t mask) {
  const std::int8_t slot = state.blocks[index].magnet_slot;
  if (slot >= 0) state.magnet_links[static_cast<std::size_t>(slot)] = mask;
}

std::uint64_t group_mask(const RuntimeState& state, std::uint8_t index) {
  if (index >= state.count || !state.blocks[index].active) return 0;
  if (state.blocks[index].type != BlockType::Magnet) return std::uint64_t{1} << index;
  return linked_mask(state, index) | (std::uint64_t{1} << index);
}

std::array<std::int8_t, 64> occupancy(
    const RuntimeState& state,
    std::uint64_t ignored = 0) {
  std::array<std::int8_t, 64> result{};
  result.fill(-1);
  for (std::uint8_t i = 0; i < state.count; ++i) {
    const RuntimeBlock& block = state.blocks[i];
    if (!block.active || (ignored & (std::uint64_t{1} << i))) continue;
    for (int yy = 0; yy < block.h; ++yy) {
      for (int xx = 0; xx < block.w; ++xx) {
        const int x = block.x + xx;
        const int y = block.y + yy;
        if (x >= 0 && y >= 0 && x < 8 && y < 8) result[y * 8 + x] = static_cast<std::int8_t>(i);
      }
    }
  }
  return result;
}

Placement placement_result_with_grid(
    const CompiledLevel& level,
    const RuntimeState& state,
    std::uint64_t moving,
    int dx,
    int dy,
  const std::array<std::int8_t, 64>& grid) {
  Placement result;
  for (std::uint64_t members = moving; members; members &= members - 1) {
    const std::uint8_t i = static_cast<std::uint8_t>(std::countr_zero(members));
    const RuntimeBlock& block = state.blocks[i];
    const int nx = block.x + dx;
    const int ny = block.y + dy;
    if (nx < 0 || ny < 0 || nx + block.w > level.width || ny + block.h > level.height) {
      result.blocked_by_other = true;
      return result;
    }
    for (int yy = 0; yy < block.h; ++yy) {
      for (int xx = 0; xx < block.w; ++xx) {
        const int blocker_index = grid[(ny + yy) * 8 + nx + xx];
        if (blocker_index < 0) continue;
        if (moving & (std::uint64_t{1} << blocker_index)) continue;
        const RuntimeBlock& blocker = state.blocks[blocker_index];
        if (blocker.type == BlockType::Ice) {
          result.ice_blockers |= std::uint64_t{1} << blocker_index;
        } else {
          result.blocked_by_other = true;
          result.ice_blockers = 0;
          return result;
        }
      }
    }
  }
  result.can_move = result.ice_blockers == 0;
  return result;
}

Placement placement_result(
    const CompiledLevel& level,
    const RuntimeState& state,
    std::uint64_t moving,
    int dx,
    int dy) {
  return placement_result_with_grid(
      level, state, moving, dx, dy, occupancy(state));
}

bool is_movable(const RuntimeBlock& block) {
  return block.active && block.type != BlockType::Fixed && block.type != BlockType::Locked
      && block.move_dir != MoveDir::None;
}

bool direction_allowed(const RuntimeBlock& block, Direction dir) {
  if (!is_movable(block)) return false;
  if (block.type == BlockType::Ice && block.move_dir == MoveDir::None) return false;
  if (block.type == BlockType::Target || block.type == BlockType::Magnet
      || block.type == BlockType::Ice || block.type == BlockType::Key) {
    return true;
  }
  if (block.move_dir == MoveDir::Both) return true;
  if (block.move_dir == MoveDir::Horizontal) {
    return dir == Direction::Left || dir == Direction::Right;
  }
  if (block.move_dir == MoveDir::Vertical) {
    return dir == Direction::Up || dir == Direction::Down;
  }
  return false;
}

bool is_target_exit_move(
    const CompiledLevel& level,
    const RuntimeState& state,
    const NativeMove& move) {
  if (move.block != level.target || move.amount != 1) return false;
  const RuntimeBlock& target = state.blocks[level.target];
  if (!target.active) return false;
  if (level.exit_side == 0) {
    return move.dir == Direction::Right
        && target.x == level.width - target.w && target.y == level.exit_y;
  }
  if (level.exit_side == 1) {
    return move.dir == Direction::Left && target.x == 0 && target.y == level.exit_y;
  }
  if (level.exit_side == 2) {
    return move.dir == Direction::Up && target.y == 0 && target.x == level.exit_x;
  }
  return move.dir == Direction::Down
      && target.y == level.height - target.h && target.x == level.exit_x;
}

Relation line_relation(const RuntimeState& state, std::uint8_t a, std::uint8_t b) {
  Relation relation;
  const RuntimeBlock& left = state.blocks[a];
  const RuntimeBlock& right = state.blocks[b];
  if (!left.active || !right.active) return relation;
  const bool horizontal_overlap = left.y < right.y + right.h && left.y + left.h > right.y;
  const bool vertical_overlap = left.x < right.x + right.w && left.x + left.w > right.x;
  if (horizontal_overlap && (left.x + left.w <= right.x || right.x + right.w <= left.x)) {
    relation.valid = true;
    relation.horizontal = true;
    relation.first = left.x <= right.x ? a : b;
    relation.second = relation.first == a ? b : a;
    const RuntimeBlock& first = state.blocks[relation.first];
    const RuntimeBlock& second = state.blocks[relation.second];
    relation.gap = second.x - (first.x + first.w);
    return relation;
  }
  if (vertical_overlap && (left.y + left.h <= right.y || right.y + right.h <= left.y)) {
    relation.valid = true;
    relation.horizontal = false;
    relation.first = left.y <= right.y ? a : b;
    relation.second = relation.first == a ? b : a;
    const RuntimeBlock& first = state.blocks[relation.first];
    const RuntimeBlock& second = state.blocks[relation.second];
    relation.gap = second.y - (first.y + first.h);
  }
  return relation;
}

bool line_clear(
    const RuntimeState& state,
    const Relation& relation,
    std::uint8_t a,
    std::uint8_t b) {
  if (!relation.valid || relation.gap < 0) return false;
  const auto grid = occupancy(state, group_mask(state, a) | group_mask(state, b));
  const RuntimeBlock& aa = state.blocks[a];
  const RuntimeBlock& bb = state.blocks[b];
  const RuntimeBlock& first = state.blocks[relation.first];
  const RuntimeBlock& second = state.blocks[relation.second];
  if (relation.horizontal) {
    const int min_y = std::max<int>(aa.y, bb.y);
    const int max_y = std::min<int>(aa.y + aa.h, bb.y + bb.h);
    for (int x = first.x + first.w; x < second.x; ++x) {
      for (int y = min_y; y < max_y; ++y) {
        if (grid[y * 8 + x] >= 0) return false;
      }
    }
  } else {
    const int min_x = std::max<int>(aa.x, bb.x);
    const int max_x = std::min<int>(aa.x + aa.w, bb.x + bb.w);
    for (int y = first.y + first.h; y < second.y; ++y) {
      for (int x = min_x; x < max_x; ++x) {
        if (grid[y * 8 + x] >= 0) return false;
      }
    }
  }
  return true;
}

void sanitize_links(RuntimeState& state) {
  std::array<std::uint64_t, kMaxBlocks> neighbors{};
  std::vector<std::uint8_t> magnets;
  for (std::uint8_t i = 0; i < state.count; ++i) {
    RuntimeBlock& block = state.blocks[i];
    if (!block.active || block.type != BlockType::Magnet) continue;
    set_linked_mask(state, i, linked_mask(state, i) | (std::uint64_t{1} << i));
    neighbors[i] = std::uint64_t{1} << i;
    magnets.push_back(i);
  }
  for (std::size_t i = 0; i < magnets.size(); ++i) {
    for (std::size_t j = i + 1; j < magnets.size(); ++j) {
      const std::uint8_t a = magnets[i];
      const std::uint8_t b = magnets[j];
      if (!(linked_mask(state, a) & (std::uint64_t{1} << b))
          || !(linked_mask(state, b) & (std::uint64_t{1} << a))) {
        continue;
      }
      const Relation relation = line_relation(state, a, b);
      if (!relation.valid || relation.gap != 0 || !line_clear(state, relation, a, b)
          || state.blocks[a].pole == state.blocks[b].pole) {
        continue;
      }
      neighbors[a] |= std::uint64_t{1} << b;
      neighbors[b] |= std::uint64_t{1} << a;
    }
  }
  std::uint64_t visited = 0;
  for (const std::uint8_t start : magnets) {
    if (visited & (std::uint64_t{1} << start)) continue;
    std::uint64_t component = 0;
    std::uint64_t frontier = std::uint64_t{1} << start;
    visited |= frontier;
    while (frontier) {
      const std::uint8_t current = static_cast<std::uint8_t>(std::countr_zero(frontier));
      frontier &= frontier - 1;
      component |= std::uint64_t{1} << current;
      const std::uint64_t next = neighbors[current] & ~visited;
      visited |= next;
      frontier |= next;
    }
    for (std::uint64_t members = component; members; members &= members - 1) {
      const std::uint8_t index = static_cast<std::uint8_t>(std::countr_zero(members));
      set_linked_mask(state, index, component);
    }
  }
}

bool damage_ice(
    RuntimeState& state,
    std::uint8_t index,
    std::uint8_t& events,
    bool repel) {
  RuntimeBlock& ice = state.blocks[index];
  if (!ice.active || ice.type != BlockType::Ice) return false;
  events |= UsedIceDamage;
  if (repel || ice.ice_state == 2) ice.active = false;
  else ice.ice_state = 2;
  return true;
}

void translate_mask(RuntimeState& state, std::uint64_t mask, int dx, int dy) {
  while (mask) {
    const std::uint8_t index = static_cast<std::uint8_t>(std::countr_zero(mask));
    mask &= mask - 1;
    state.blocks[index].x += static_cast<std::int8_t>(dx);
    state.blocks[index].y += static_cast<std::int8_t>(dy);
  }
}

struct RepulsionPlan {
  std::uint64_t moving = 0;
  int dx = 0;
  int dy = 0;
  int steps = 0;
  std::uint64_t ice_blockers = 0;
  bool blocked_by_other = false;
};

RepulsionPlan plan_repulsion(
    const CompiledLevel& level,
    const RuntimeState& state,
    std::uint8_t index,
    Direction dir) {
  RepulsionPlan plan;
  plan.moving = group_mask(state, index);
  plan.dx = kDx[static_cast<int>(dir)];
  plan.dy = kDy[static_cast<int>(dir)];
  for (int step = 1; step <= 20; ++step) {
    const Placement placement = placement_result(
        level, state, plan.moving, plan.dx * step, plan.dy * step);
    if (!placement.can_move) {
      plan.ice_blockers = placement.ice_blockers;
      plan.blocked_by_other = placement.blocked_by_other;
      return plan;
    }
    plan.steps = step;
  }
  return plan;
}

bool apply_repulsion_plan(
    RuntimeState& state,
    const RepulsionPlan& plan,
    std::uint8_t& events,
    const SolverOptions& options) {
  bool changed = false;
  if (plan.steps > 0) {
    translate_mask(state, plan.moving, plan.dx * plan.steps, plan.dy * plan.steps);
    changed = true;
  }
  if (!options.disable_ice_damage && !plan.blocked_by_other) {
    std::uint64_t ice = plan.ice_blockers;
    while (ice) {
      const std::uint8_t index = static_cast<std::uint8_t>(std::countr_zero(ice));
      ice &= ice - 1;
      changed = damage_ice(state, index, events, true) || changed;
    }
  }
  return changed;
}

void link_groups(RuntimeState& state, std::uint8_t a, std::uint8_t b, std::uint8_t& events) {
  const std::uint64_t linked = group_mask(state, a) | group_mask(state, b);
  for (std::uint64_t members = linked; members; members &= members - 1) {
    const std::uint8_t index = static_cast<std::uint8_t>(std::countr_zero(members));
    set_linked_mask(state, index, linked);
  }
  events |= UsedMagnet | UsedMagnetAttract;
}

bool move_group_one(
    const CompiledLevel& level,
    RuntimeState& state,
    std::uint8_t index,
    Direction dir) {
  const std::uint64_t moving = group_mask(state, index);
  const int dx = kDx[static_cast<int>(dir)];
  const int dy = kDy[static_cast<int>(dir)];
  if (!placement_result(level, state, moving, dx, dy).can_move) return false;
  translate_mask(state, moving, dx, dy);
  return true;
}

void merge_ice_impact(
    const CompiledLevel& level,
    RuntimeState& state,
    std::uint8_t a,
    std::uint8_t b,
    const Relation& relation,
    std::uint8_t& events,
    const SolverOptions& options) {
  if (options.disable_ice_damage) return;
  const bool a_first = group_mask(state, a) & (std::uint64_t{1} << relation.first);
  const Direction dir = relation.horizontal
      ? (a_first ? Direction::Right : Direction::Left)
      : (a_first ? Direction::Down : Direction::Up);
  const std::uint64_t moving = group_mask(state, a) | group_mask(state, b);
  const Placement next = placement_result(
      level, state, moving, kDx[static_cast<int>(dir)], kDy[static_cast<int>(dir)]);
  if (!next.can_move && !next.blocked_by_other) {
    for (std::uint64_t ice = next.ice_blockers; ice; ice &= ice - 1) {
      damage_ice(state, static_cast<std::uint8_t>(std::countr_zero(ice)), events, false);
    }
  }
}

void resolve_magnets(
    const CompiledLevel& level,
    RuntimeState& state,
    std::uint8_t origin,
    std::uint8_t& events,
    const SolverOptions& options) {
  if (options.disable_magnet) return;
  for (int guard = 0; guard < 12; ++guard) {
    struct Candidate {
      std::uint8_t a = 0;
      std::uint8_t b = 0;
      Relation relation;
      bool attract = false;
      int origin_score = 1;
    };
    std::vector<Candidate> candidates;
    std::uint64_t origin_group = 0;
    if (origin < state.count && state.blocks[origin].active
        && state.blocks[origin].type == BlockType::Magnet) {
      origin_group = group_mask(state, origin);
    }
    for (std::size_t i = 0; i < level.magnets.size(); ++i) {
      const std::uint8_t a = level.magnets[i];
      if (!state.blocks[a].active) continue;
      for (std::size_t j = i + 1; j < level.magnets.size(); ++j) {
        const std::uint8_t b = level.magnets[j];
        if (!state.blocks[b].active || (group_mask(state, a) & (std::uint64_t{1} << b))) continue;
        const Relation relation = line_relation(state, a, b);
        if (!relation.valid || !line_clear(state, relation, a, b)) continue;
        const bool attract = state.blocks[relation.first].pole != state.blocks[relation.second].pole;
        candidates.push_back({
            a,
            b,
            relation,
            attract,
            origin_group && ((origin_group & group_mask(state, a)) || (origin_group & group_mask(state, b)))
                ? 0 : 1,
        });
      }
    }
    std::sort(candidates.begin(), candidates.end(), [&](const Candidate& lhs, const Candidate& rhs) {
      if (lhs.origin_score != rhs.origin_score) return lhs.origin_score < rhs.origin_score;
      if (lhs.relation.gap != rhs.relation.gap) return lhs.relation.gap < rhs.relation.gap;
      if (lhs.attract != rhs.attract) return lhs.attract < rhs.attract;
      if (lhs.a != rhs.a) return level.ids[lhs.a] < level.ids[rhs.a];
      return level.ids[lhs.b] < level.ids[rhs.b];
    });
    bool changed = false;
    for (const Candidate& candidate : candidates) {
      if (candidate.attract) {
        if (options.disable_attract) continue;
        Relation relation = line_relation(state, candidate.a, candidate.b);
        if (!relation.valid || !line_clear(state, relation, candidate.a, candidate.b)) continue;
        if (relation.gap == 0) {
          merge_ice_impact(
              level, state, candidate.a, candidate.b, relation, events, options);
          link_groups(state, candidate.a, candidate.b, events);
          changed = true;
          break;
        }
        std::uint8_t mover = candidate.a;
        if (origin_group & group_mask(state, candidate.b)) mover = candidate.b;
        else if (!(origin_group & group_mask(state, candidate.a))) {
          const int a_size = std::popcount(group_mask(state, candidate.a));
          const int b_size = std::popcount(group_mask(state, candidate.b));
          if (a_size > 1 && b_size == 1) mover = candidate.b;
        }
        const std::uint8_t anchor = mover == candidate.a ? candidate.b : candidate.a;
        bool moved = false;
        for (int slide = 0; slide < 10; ++slide) {
          relation = line_relation(state, mover, anchor);
          if (!relation.valid || relation.gap <= 0) break;
          const bool mover_first = group_mask(state, mover) & (std::uint64_t{1} << relation.first);
          const Direction dir = relation.horizontal
              ? (mover_first ? Direction::Right : Direction::Left)
              : (mover_first ? Direction::Down : Direction::Up);
          if (!move_group_one(level, state, mover, dir)) break;
          moved = true;
        }
        relation = line_relation(state, mover, anchor);
        if (relation.valid && relation.gap == 0 && line_clear(state, relation, mover, anchor)) {
          merge_ice_impact(level, state, mover, anchor, relation, events, options);
          link_groups(state, mover, anchor, events);
          changed = true;
        } else if (moved) {
          events |= UsedMagnet | UsedMagnetAttract;
          changed = true;
        }
      } else {
        if (options.disable_repel) continue;
        const Relation relation = line_relation(state, candidate.a, candidate.b);
        if (!relation.valid || !line_clear(state, relation, candidate.a, candidate.b)) continue;
        const Direction first_dir = relation.horizontal ? Direction::Left : Direction::Up;
        const RepulsionPlan first = plan_repulsion(level, state, relation.first, first_dir);
        const RepulsionPlan second = plan_repulsion(level, state, relation.second, opposite(first_dir));
        const bool moved_first = apply_repulsion_plan(state, first, events, options);
        const bool moved_second = apply_repulsion_plan(state, second, events, options);
        if (moved_first || moved_second) {
          events |= UsedMagnet | UsedMagnetRepel;
          changed = true;
        }
      }
      if (changed) break;
    }
    if (!changed) break;
    sanitize_links(state);
  }
}

bool fully_inside(const RuntimeBlock& block, const Portal& portal) {
  return block.x >= portal.x && block.y >= portal.y
      && block.x + block.w <= portal.x + portal.w
      && block.y + block.h <= portal.y + portal.h;
}

bool resolve_teleport(
    const CompiledLevel& level,
    RuntimeState& state,
    std::uint8_t index,
    std::uint8_t& events,
    const SolverOptions& options) {
  if (options.disable_teleport || level.portals.empty() || !state.blocks[index].active) return true;
  RuntimeBlock& block = state.blocks[index];
  int portal_index = -1;
  for (std::size_t i = 0; i < level.portals.size(); ++i) {
    if (fully_inside(block, level.portals[i])) {
      portal_index = static_cast<int>(i);
      break;
    }
  }
  if (portal_index < 0) {
    block.last_portal = -1;
    return true;
  }
  if (block.last_portal == portal_index) return true;
  const Portal& portal = level.portals[portal_index];
  if (portal.pair < 0 || portal.pair >= static_cast<int>(level.portals.size())) return true;
  const Portal& pair = level.portals[portal.pair];
  const int nx = pair.x + (block.x - portal.x);
  const int ny = pair.y + (block.y - portal.y);
  const std::uint64_t moving = group_mask(state, index);
  const int dx = nx - block.x;
  const int dy = ny - block.y;
  if (!placement_result(level, state, moving, dx, dy).can_move) return false;
  translate_mask(state, moving, dx, dy);
  for (std::uint64_t members = moving; members; members &= members - 1) {
    state.blocks[static_cast<std::uint8_t>(std::countr_zero(members))].last_portal =
        static_cast<std::int8_t>(portal.pair);
  }
  events |= UsedTeleport;
  return true;
}

void resolve_unlocks(
    const CompiledLevel& level,
    RuntimeState& state,
    std::uint8_t& events,
    const SolverOptions& options) {
  if (options.disable_unlock) return;
  for (std::uint8_t key_index = 0; key_index < state.count; ++key_index) {
    RuntimeBlock& key = state.blocks[key_index];
    if (!key.active || key.type != BlockType::Key) continue;
    const int lock_index = level.unlock_target[key_index];
    if (lock_index < 0 || lock_index >= state.count) continue;
    RuntimeBlock& lock = state.blocks[lock_index];
    if (!lock.active || lock.type != BlockType::Locked) continue;
    Block key_box;
    key_box.x = key.x;
    key_box.y = key.y;
    key_box.w = key.w;
    key_box.h = key.h;
    Block lock_box;
    lock_box.x = lock.x;
    lock_box.y = lock.y;
    lock_box.w = lock.w;
    lock_box.h = lock.h;
    if (!touches_or_overlaps(key_box, lock_box)) continue;
    key.active = false;
    lock.type = BlockType::Normal;
    lock.move_dir = level.unlocked_move_dir[lock_index];
    events |= UsedUnlock;
  }
}

bool apply_move_with_grid(
    const CompiledLevel& level,
    const RuntimeState& input,
    const NativeMove& move,
    const SolverOptions& options,
    const std::array<std::int8_t, 64>& initial_grid,
    RuntimeState& output,
    std::uint8_t& events) {
  if (move.block >= input.count || move.amount == 0) return false;
  const RuntimeBlock& original = input.blocks[move.block];
  if (!direction_allowed(original, move.dir)) return false;
  if (original.type == BlockType::Magnet) {
    const std::uint64_t group = group_mask(input, move.block);
    if (move.block != std::countr_zero(group)) return false;
  }
  output = input;
  events = 0;
  if (is_target_exit_move(level, input, move)) {
    output.blocks[level.target].active = false;
    output.blocks[level.target].last_portal = -1;
    return true;
  }
  const std::uint64_t moving = group_mask(output, move.block);
  const int dx = kDx[static_cast<int>(move.dir)];
  const int dy = kDy[static_cast<int>(move.dir)];
  const Placement first =
      placement_result_with_grid(level, input, moving, dx, dy, initial_grid);
  if (!first.can_move) {
    if (move.amount != 1 || options.disable_ice_damage
        || first.blocked_by_other || first.ice_blockers == 0) {
      return false;
    }
    for (std::uint64_t ice = first.ice_blockers; ice; ice &= ice - 1) {
      damage_ice(
          output, static_cast<std::uint8_t>(std::countr_zero(ice)), events, false);
    }
    if (original.type == BlockType::Magnet || original.type == BlockType::Ice
        || original.type == BlockType::Key || original.type == BlockType::Locked) {
      events |= MovedSpecial;
    }
    resolve_unlocks(level, output, events, options);
    resolve_magnets(level, output, move.block, events, options);
    sanitize_links(output);
    return true;
  }
  for (int step = 1; step <= move.amount; ++step) {
    if (!placement_result_with_grid(
            level, input, moving, dx * step, dy * step, initial_grid).can_move) {
      return false;
    }
  }
  translate_mask(output, moving, dx * move.amount, dy * move.amount);

  const BlockType moved_type = output.blocks[move.block].type;
  const Placement after = placement_result(level, output, moving, dx, dy);
  if (!options.disable_ice_damage && moved_type == BlockType::Ice && !after.can_move) {
    damage_ice(output, move.block, events, false);
  } else if (!options.disable_ice_damage && moved_type != BlockType::Ice
      && !after.can_move && !after.blocked_by_other) {
    for (std::uint64_t ice = after.ice_blockers; ice; ice &= ice - 1) {
      damage_ice(output, static_cast<std::uint8_t>(std::countr_zero(ice)), events, false);
    }
  }

  if (moved_type == BlockType::Magnet || moved_type == BlockType::Ice
      || moved_type == BlockType::Key || moved_type == BlockType::Locked) {
    events |= MovedSpecial;
  }
  if (!resolve_teleport(level, output, move.block, events, options)) return false;
  resolve_unlocks(level, output, events, options);
  resolve_magnets(level, output, move.block, events, options);
  sanitize_links(output);
  return true;
}

bool apply_move(
    const CompiledLevel& level,
    const RuntimeState& input,
    const NativeMove& move,
    const SolverOptions& options,
    RuntimeState& output,
    std::uint8_t& events) {
  const auto initial_grid = occupancy(input);
  return apply_move_with_grid(
      level, input, move, options, initial_grid, output, events);
}

bool reached_exit(const CompiledLevel& level, const RuntimeState& state) {
  const RuntimeBlock& target = state.blocks[level.target];
  return !target.active;
}

bool portals_clear(const CompiledLevel& level, const RuntimeState& state) {
  for (const Portal& portal : level.portals) {
    for (std::uint8_t i = 0; i < state.count; ++i) {
      const RuntimeBlock& block = state.blocks[i];
      if (!block.active) continue;
      const bool overlap = block.x < portal.x + portal.w && block.x + block.w > portal.x
          && block.y < portal.y + portal.h && block.y + block.h > portal.y;
      if (overlap) return false;
    }
  }
  return true;
}

bool flags_satisfied(const SolverOptions& options, std::uint8_t flags) {
  if (options.require_ice_damage && !(flags & UsedIceDamage)) return false;
  if (options.require_magnet && !(flags & UsedMagnet)) return false;
  if (options.require_magnet_attract && !(flags & UsedMagnetAttract)) return false;
  if (options.require_magnet_repel && !(flags & UsedMagnetRepel)) return false;
  if (options.require_teleport && !(flags & UsedTeleport)) return false;
  if (options.require_unlock && !(flags & UsedUnlock)) return false;
  return true;
}

bool goal_flags_satisfied(const SolverOptions& options, std::uint8_t flags) {
  return !options.mechanism_route_search || flags_satisfied(options, flags);
}

int admissible_lower_bound(
    const CompiledLevel& level,
    const RuntimeState& state,
    const SolverOptions& options,
    std::uint8_t flags) {
  if (reached_exit(level, state) && goal_flags_satisfied(options, flags)
      && (!options.require_portals_clear || portals_clear(level, state))) {
    return 0;
  }
  const RuntimeBlock& target = state.blocks[level.target];
  const bool aligned = (level.exit_side <= 1) ? target.y == level.exit_y : target.x == level.exit_x;
  int lower = aligned ? 1 : 2;
  if (level.portals.empty() || options.disable_teleport) {
    const int target_cell = target.y * 8 + target.x;
    const int relaxed = level.relaxed_target_distance[target_cell];
    if (relaxed < 0) return std::numeric_limits<int>::max() / 4;
    lower = std::max(lower, relaxed);
  }
  if (options.mechanism_route_search
      && ((options.require_ice_damage && !(flags & UsedIceDamage))
      || (options.require_magnet && !(flags & UsedMagnet))
      || (options.require_magnet_attract && !(flags & UsedMagnetAttract))
      || (options.require_magnet_repel && !(flags & UsedMagnetRepel))
      || (options.require_teleport && !(flags & UsedTeleport))
      || (options.require_unlock && !(flags & UsedUnlock)))) {
    lower = std::max(lower, 1);
  }
  return lower;
}

void write_bits(PackedKey& key, std::size_t& offset, std::uint64_t value, int width) {
  const std::size_t word = offset / 64;
  const int shift = static_cast<int>(offset % 64);
  key.words[word] |= value << shift;
  if (shift + width > 64) key.words[word + 1] |= value >> (64 - shift);
  offset += width;
}

std::uint16_t block_token(const RuntimeBlock& block) {
  if (!block.active) return 0;
  const std::uint16_t position =
      1U + (static_cast<std::uint16_t>(block.y) << 3) + static_cast<std::uint16_t>(block.x);
  return static_cast<std::uint16_t>(position | (static_cast<std::uint16_t>(block.last_portal + 1) << 7));
}

std::uint16_t ice_token(const RuntimeBlock& block) {
  if (!block.active) return 0;
  return static_cast<std::uint16_t>(
      block_token(block) | (static_cast<std::uint16_t>(block.ice_state) << 9));
}

PackedKey state_key(
    const CompiledLevel& level,
    const RuntimeState& state,
    const SolverOptions& options,
    std::uint8_t flags) {
  PackedKey key;
  std::size_t offset = 0;
  std::vector<bool> written(state.count, false);
  for (const auto& members : level.canonical_members) {
    std::vector<std::uint16_t> tokens;
    tokens.reserve(members.size());
    for (const std::uint8_t index : members) {
      tokens.push_back(block_token(state.blocks[index]));
      written[index] = true;
    }
    std::sort(tokens.begin(), tokens.end());
    for (const std::uint16_t token : tokens) write_bits(key, offset, token, 9);
  }
  for (const auto& members : level.ice_canonical_members) {
    std::vector<std::uint16_t> tokens;
    tokens.reserve(members.size());
    for (const std::uint8_t index : members) {
      tokens.push_back(ice_token(state.blocks[index]));
      written[index] = true;
    }
    std::sort(tokens.begin(), tokens.end());
    for (const std::uint16_t token : tokens) write_bits(key, offset, token, 11);
  }
  for (std::uint8_t i = 0; i < state.count; ++i) {
    if (!written[i]) write_bits(key, offset, block_token(state.blocks[i]), 9);
  }
  for (const std::uint8_t index : level.magnets) {
    std::uint8_t local = 0;
    for (std::size_t i = 0; i < level.magnets.size(); ++i) {
      if (linked_mask(state, index) & (std::uint64_t{1} << level.magnets[i])) {
        local |= static_cast<std::uint8_t>(1U << i);
      }
    }
    write_bits(key, offset, local, 4);
  }
  for (const std::uint8_t index : level.ice) {
    if (!written[index]) write_bits(key, offset, state.blocks[index].ice_state, 2);
  }
  for (const std::uint8_t index : level.locks) {
    write_bits(key, offset, state.blocks[index].type == BlockType::Locked ? 0 : 1, 1);
  }
  std::uint8_t relevant = 0;
  if (options.mechanism_route_search) {
    if (options.require_ice_damage) relevant |= flags & UsedIceDamage;
    if (options.require_magnet) relevant |= flags & UsedMagnet;
    if (options.require_magnet_attract) relevant |= flags & UsedMagnetAttract;
    if (options.require_magnet_repel) relevant |= flags & UsedMagnetRepel;
    if (options.require_teleport) relevant |= flags & UsedTeleport;
    if (options.require_unlock) relevant |= flags & UsedUnlock;
  }
  write_bits(key, offset, relevant, 7);
  return key;
}

std::uint64_t read_bits(const PackedKey& key, std::size_t& offset, int width) {
  const std::size_t word = offset / 64;
  const int shift = static_cast<int>(offset % 64);
  std::uint64_t value = key.words[word] >> shift;
  if (shift + width > 64) value |= key.words[word + 1] << (64 - shift);
  offset += width;
  if (width == 64) return value;
  return value & ((std::uint64_t{1} << width) - 1);
}

void restore_block_token(RuntimeBlock& block, std::uint16_t token) {
  if (token == 0) {
    block.active = false;
    block.last_portal = -1;
    return;
  }
  const int position = token & 0x7f;
  block.active = true;
  block.x = static_cast<std::int8_t>((position - 1) & 7);
  block.y = static_cast<std::int8_t>((position - 1) >> 3);
  block.last_portal = static_cast<std::int8_t>(((token >> 7) & 0x3) - 1);
}

void restore_state_key(
    const CompiledLevel& level,
    const RuntimeState& prototype,
    const PackedKey& key,
    RuntimeState& state,
    std::uint8_t& flags) {
  state = prototype;
  std::size_t offset = 0;
  std::vector<bool> restored(state.count, false);
  for (const auto& members : level.canonical_members) {
    for (const std::uint8_t index : members) {
      restore_block_token(
          state.blocks[index], static_cast<std::uint16_t>(read_bits(key, offset, 9)));
      restored[index] = true;
    }
  }
  for (const auto& members : level.ice_canonical_members) {
    for (const std::uint8_t index : members) {
      const std::uint16_t token = static_cast<std::uint16_t>(read_bits(key, offset, 11));
      restore_block_token(state.blocks[index], token & 0x1ffU);
      state.blocks[index].ice_state = token == 0
          ? 0 : static_cast<std::uint8_t>((token >> 9) & 0x3U);
      restored[index] = true;
    }
  }
  for (std::uint8_t i = 0; i < state.count; ++i) {
    if (!restored[i]) {
      restore_block_token(
          state.blocks[i], static_cast<std::uint16_t>(read_bits(key, offset, 9)));
    }
  }
  for (const std::uint8_t index : level.magnets) {
    const std::uint8_t local = static_cast<std::uint8_t>(read_bits(key, offset, 4));
    std::uint64_t restored_links = 0;
    for (std::size_t i = 0; i < level.magnets.size(); ++i) {
      if (local & (1U << i)) {
        restored_links |= std::uint64_t{1} << level.magnets[i];
      }
    }
    set_linked_mask(state, index, restored_links);
  }
  for (const std::uint8_t index : level.ice) {
    if (!restored[index]) {
      state.blocks[index].ice_state = static_cast<std::uint8_t>(read_bits(key, offset, 2));
    }
  }
  for (const std::uint8_t index : level.locks) {
    const bool unlocked = read_bits(key, offset, 1) != 0;
    state.blocks[index].type = unlocked ? BlockType::Normal : BlockType::Locked;
    state.blocks[index].move_dir = unlocked
        ? level.unlocked_move_dir[index] : MoveDir::None;
  }
  flags = static_cast<std::uint8_t>(read_bits(key, offset, 7));
  sanitize_links(state);
}

void legal_moves_into(
    const CompiledLevel& level,
    const RuntimeState& state,
    const std::unordered_map<std::uint32_t, int>& preferred,
    std::vector<NativeMove>& moves,
    bool order_moves = true,
    const std::array<std::int8_t, 64>* known_grid = nullptr) {
  moves.clear();
  if (moves.capacity() < 128) moves.reserve(128);
  const auto computed_grid = known_grid ? std::array<std::int8_t, 64>{} : occupancy(state);
  const auto& grid = known_grid ? *known_grid : computed_grid;
  for (std::uint8_t index = 0; index < state.count; ++index) {
    const RuntimeBlock& block = state.blocks[index];
    if (!is_movable(block)) continue;
    if (block.type == BlockType::Magnet && index != std::countr_zero(group_mask(state, index))) continue;
    for (int dir_value = 0; dir_value < 4; ++dir_value) {
      const Direction dir = static_cast<Direction>(dir_value);
      if (!direction_allowed(block, dir)) continue;
      const std::uint64_t moving = group_mask(state, index);
      const int dx = kDx[dir_value];
      const int dy = kDy[dir_value];
      for (int amount = 1; amount <= 8; ++amount) {
        const NativeMove candidate{
            index, dir, static_cast<std::uint8_t>(amount)};
        if (is_target_exit_move(level, state, candidate)) {
          moves.push_back(candidate);
          break;
        }
        const Placement placement = placement_result_with_grid(
            level, state, moving, dx * amount, dy * amount, grid);
        if (!placement.can_move) {
          if (amount == 1 && !placement.blocked_by_other
              && placement.ice_blockers != 0) {
            moves.push_back({index, dir, 1});
          }
          break;
        }
        moves.push_back({index, dir, static_cast<std::uint8_t>(amount)});
      }
    }
  }
  auto code = [](const NativeMove& move) {
    return (static_cast<std::uint32_t>(move.block) << 16)
        | (static_cast<std::uint32_t>(move.dir) << 8) | move.amount;
  };
  if (order_moves) {
    std::stable_sort(moves.begin(), moves.end(), [&](const NativeMove& lhs, const NativeMove& rhs) {
      const auto left = preferred.find(code(lhs));
      const auto right = preferred.find(code(rhs));
      const int left_rank = left == preferred.end() ? std::numeric_limits<int>::max() : left->second;
      const int right_rank = right == preferred.end() ? std::numeric_limits<int>::max() : right->second;
      if (left_rank != right_rank) return left_rank < right_rank;
      const bool left_target = lhs.block == level.target;
      const bool right_target = rhs.block == level.target;
      if (left_target != right_target) return left_target;
      if (lhs.block != rhs.block) return lhs.block < rhs.block;
      if (lhs.dir != rhs.dir) return lhs.dir < rhs.dir;
      return lhs.amount < rhs.amount;
    });
  }
}

std::vector<NativeMove> legal_moves(
    const CompiledLevel& level,
    const RuntimeState& state,
    const std::unordered_map<std::uint32_t, int>& preferred,
    bool order_moves = true) {
  std::vector<NativeMove> moves;
  legal_moves_into(level, state, preferred, moves, order_moves);
  return moves;
}

CompiledLevel compile_level(const Level& source, RuntimeState& state, std::string& error) {
  CompiledLevel level;
  level.width = source.width;
  level.height = source.height;
  level.exit_x = source.exit.x;
  level.exit_y = source.exit.y;
  level.exit_side = source.exit.side == "right" ? 0
      : source.exit.side == "left" ? 1 : source.exit.side == "top" ? 2 : 3;
  level.unlock_target.fill(-1);
  level.unlocked_move_dir.fill(MoveDir::None);
  level.originally_locked.fill(false);
  level.canonical_class.fill(-1);
  level.relaxed_target_distance.fill(-1);
  if (source.blocks.empty() || source.blocks.size() > kMaxBlocks) {
    error = "block-count";
    return level;
  }
  state.count = static_cast<std::uint8_t>(source.blocks.size());
  for (std::size_t i = 0; i < source.blocks.size(); ++i) {
    const Block& block = source.blocks[i];
    level.ids.push_back(block.id);
    level.id_to_index[block.id] = static_cast<int>(i);
    RuntimeBlock& runtime = state.blocks[i];
    runtime.type = block_type(block.type);
    runtime.x = static_cast<std::int8_t>(block.x);
    runtime.y = static_cast<std::int8_t>(block.y);
    runtime.w = static_cast<std::uint8_t>(block.w);
    runtime.h = static_cast<std::uint8_t>(block.h);
    runtime.move_dir = move_dir(block.move_dir);
    runtime.pole = block.pole == "S" ? 2 : block.pole == "N" ? 1 : 0;
    runtime.ice_state = block.type == "ice" ? (block.ice_state == "cracked" ? 2 : 1) : 0;
    runtime.active = true;
    runtime.last_portal = -1;
    if (block.id == source.target_id) level.target = static_cast<std::uint8_t>(i);
    if (runtime.type == BlockType::Magnet) {
      if (level.magnets.size() >= state.magnet_links.size()) {
        error = "magnet-count";
        return level;
      }
      runtime.magnet_slot = static_cast<std::int8_t>(level.magnets.size());
      level.magnets.push_back(static_cast<std::uint8_t>(i));
    }
    if (runtime.type == BlockType::Ice) level.ice.push_back(static_cast<std::uint8_t>(i));
    if (runtime.type == BlockType::Locked) {
      level.locks.push_back(static_cast<std::uint8_t>(i));
      level.originally_locked[i] = true;
      level.unlocked_move_dir[i] = move_dir(block.unlocked_move_dir);
    }
  }
  for (std::size_t i = 0; i < source.blocks.size(); ++i) {
    const Block& block = source.blocks[i];
    if (block.type == "magnet") {
      std::uint64_t initial_links = std::uint64_t{1} << i;
      for (const std::string& id : block.linked_ids) {
        const auto found = level.id_to_index.find(id);
        if (found != level.id_to_index.end()) {
          initial_links |= std::uint64_t{1} << found->second;
        }
      }
      set_linked_mask(state, static_cast<std::uint8_t>(i), initial_links);
    }
    if (block.type == "key") {
      const auto found = level.id_to_index.find(block.unlock_target_id);
      if (found != level.id_to_index.end()) level.unlock_target[i] = found->second;
    }
  }
  sanitize_links(state);

  std::unordered_map<std::string, std::vector<std::uint8_t>> classes;
  for (std::size_t i = 0; i < source.blocks.size(); ++i) {
    const Block& block = source.blocks[i];
    if (block.type != "normal") continue;
    const std::string signature = std::to_string(block.w) + "x" + std::to_string(block.h)
        + ":" + block.move_dir;
    classes[signature].push_back(static_cast<std::uint8_t>(i));
  }
  for (auto& [signature, members] : classes) {
    if (members.size() < 2) continue;
    const int class_id = static_cast<int>(level.canonical_members.size());
    for (const std::uint8_t member : members) level.canonical_class[member] = class_id;
    level.canonical_members.push_back(std::move(members));
  }
  if (level.magnets.size() >= 2) {
    const RuntimeBlock& first = state.blocks[level.magnets.front()];
    const bool interchangeable_singletons = first.pole != 0
        && std::all_of(level.magnets.begin(), level.magnets.end(), [&](std::uint8_t index) {
          const RuntimeBlock& magnet = state.blocks[index];
          return magnet.pole == first.pole
              && magnet.w == first.w && magnet.h == first.h
              && magnet.move_dir == first.move_dir
              && linked_mask(state, index) == (std::uint64_t{1} << index);
        });
    if (interchangeable_singletons) {
      std::vector<std::uint8_t> members = level.magnets;
      const int class_id = static_cast<int>(level.canonical_members.size());
      for (const std::uint8_t member : members) level.canonical_class[member] = class_id;
      level.canonical_members.push_back(std::move(members));
    }
  }
  std::unordered_map<std::string, std::vector<std::uint8_t>> ice_classes;
  for (std::size_t i = 0; i < source.blocks.size(); ++i) {
    const Block& block = source.blocks[i];
    if (block.type != "ice") continue;
    const std::string signature = std::to_string(block.w) + "x" + std::to_string(block.h)
        + ":" + block.move_dir;
    ice_classes[signature].push_back(static_cast<std::uint8_t>(i));
  }
  for (auto& [signature, members] : ice_classes) {
    if (members.size() < 2) continue;
    level.ice_canonical_members.push_back(std::move(members));
  }

  std::unordered_map<std::string, int> portal_ids;
  for (const SpecialCell& cell : source.special_cells) {
    if (cell.type != "teleport") continue;
    portal_ids[cell.portal_id] = static_cast<int>(level.portals.size());
    level.portals.push_back({cell.x, cell.y, cell.w, cell.h, -1});
  }
  int portal_index = 0;
  for (const SpecialCell& cell : source.special_cells) {
    if (cell.type != "teleport") continue;
    const auto pair = portal_ids.find(cell.pair_id);
    if (pair != portal_ids.end()) level.portals[portal_index].pair = pair->second;
    portal_index++;
  }

  const RuntimeBlock& target = state.blocks[level.target];
  std::uint64_t fixed_cells = 0;
  for (std::uint8_t i = 0; i < state.count; ++i) {
    const RuntimeBlock& block = state.blocks[i];
    if (!block.active || block.type != BlockType::Fixed) continue;
    for (int yy = 0; yy < block.h; ++yy) {
      for (int xx = 0; xx < block.w; ++xx) {
        fixed_cells |= std::uint64_t{1} << ((block.y + yy) * 8 + block.x + xx);
      }
    }
  }
  auto target_position_valid = [&](int x, int y) {
    if (x < 0 || y < 0 || x + target.w > level.width || y + target.h > level.height) {
      return false;
    }
    for (int yy = 0; yy < target.h; ++yy) {
      for (int xx = 0; xx < target.w; ++xx) {
        if (fixed_cells & (std::uint64_t{1} << ((y + yy) * 8 + x + xx))) {
          return false;
        }
      }
    }
    return true;
  };
  int goal_x = level.exit_side == 0 ? level.width - target.w
      : level.exit_side == 1 ? 0 : level.exit_x;
  int goal_y = level.exit_side == 2 ? 0
      : level.exit_side == 3 ? level.height - target.h : level.exit_y;
  if (target_position_valid(goal_x, goal_y)) {
    std::queue<int> frontier;
    const int goal_cell = goal_y * 8 + goal_x;
    level.relaxed_target_distance[goal_cell] = 1;
    frontier.push(goal_cell);
    while (!frontier.empty()) {
      const int cell = frontier.front();
      frontier.pop();
      const int x = cell & 7;
      const int y = cell >> 3;
      const int next_distance = level.relaxed_target_distance[cell] + 1;
      for (int direction_index = 0; direction_index < 4; ++direction_index) {
        for (int amount = 1; amount <= 8; ++amount) {
          const int nx = x + kDx[direction_index] * amount;
          const int ny = y + kDy[direction_index] * amount;
          if (!target_position_valid(nx, ny)) break;
          const int next_cell = ny * 8 + nx;
          if (level.relaxed_target_distance[next_cell] >= 0) continue;
          level.relaxed_target_distance[next_cell] =
              static_cast<std::int8_t>(next_distance);
          frontier.push(next_cell);
        }
      }
    }
  }
  const int key_bits = static_cast<int>(state.count) * 9
      + static_cast<int>(level.magnets.size()) * 4
      + static_cast<int>(level.ice.size()) * 2
      + static_cast<int>(level.locks.size()) + 7;
  level.key_words = static_cast<std::uint8_t>((key_bits + 63) / 64);
  return level;
}

std::vector<Block> export_blocks(
    const Level& source,
    const RuntimeState& state) {
  std::vector<Block> output;
  std::unordered_map<int, std::string> index_to_id;
  for (std::size_t i = 0; i < source.blocks.size(); ++i) index_to_id[static_cast<int>(i)] = source.blocks[i].id;
  for (std::size_t i = 0; i < source.blocks.size(); ++i) {
    const RuntimeBlock& runtime = state.blocks[i];
    if (!runtime.active) continue;
    Block block = source.blocks[i];
    block.type = block_type_name(runtime.type);
    block.x = runtime.x;
    block.y = runtime.y;
    block.move_dir = move_dir_name(runtime.move_dir);
    if (runtime.type == BlockType::Ice) {
      block.ice_state = runtime.ice_state == 2 ? "cracked" : "intact";
    }
    if (runtime.type == BlockType::Magnet) {
      block.linked_ids.clear();
      for (std::uint64_t linked = linked_mask(state, static_cast<std::uint8_t>(i));
           linked; linked &= linked - 1) {
        const int index = std::countr_zero(linked);
        if (index_to_id.contains(index)) block.linked_ids.push_back(index_to_id[index]);
      }
      std::sort(block.linked_ids.begin(), block.linked_ids.end());
    }
    output.push_back(std::move(block));
  }
  return output;
}

std::string native_move_text(const CompiledLevel& level, const NativeMove& move) {
  return level.ids[move.block] + ":" + direction_name(move.dir) + std::to_string(move.amount);
}

std::uint32_t move_code(const NativeMove& move) {
  return (static_cast<std::uint32_t>(move.block) << 16)
      | (static_cast<std::uint32_t>(move.dir) << 8) | move.amount;
}

struct LayeredProofResult {
  bool solved = false;
  bool limited = false;
  int depth = -1;
  int proven_unsolved_depth = -1;
  std::uint64_t expanded = 0;
  std::uint64_t time_ms = 0;
};

class LayeredProofSearch {
 public:
  LayeredProofSearch(
      const CompiledLevel& level,
      const RuntimeState& start,
      const SolverOptions& options,
      const std::unordered_map<std::uint32_t, int>& preferred)
      : level_(level),
        start_(start),
        options_(options),
        preferred_(preferred),
        started_(std::chrono::steady_clock::now()) {}

  LayeredProofResult run(int max_depth) {
    LayeredProofResult result;
    if (goal(start_, 0)) {
      result.solved = true;
      result.depth = 0;
      return result;
    }
    FlatExactSet visited;
    std::vector<PackedKey> frontier;
    std::vector<PackedKey> next_frontier;
    const PackedKey start_key = state_key(level_, start_, options_, 0);
    if (visited.insert(start_key) == FlatExactSet::InsertResult::Full) {
      result.limited = true;
      return result;
    }
    frontier.push_back(start_key);
    for (int depth = 0; depth < max_depth; ++depth) {
      next_frontier.clear();
      if (frontier.size() < (1U << 22)) {
        next_frontier.reserve(std::min<std::size_t>(frontier.size() * 3U, 1U << 22));
      }
      for (const PackedKey& packed : frontier) {
        if ((result.expanded & 0x3ff) == 0 && limit_hit(result.expanded)) {
          result.limited = true;
          result.time_ms = elapsed_ms();
          return result;
        }
        RuntimeState state;
        std::uint8_t flags = 0;
        restore_state_key(level_, start_, packed, state, flags);
        result.expanded++;
        const std::vector<NativeMove> moves = legal_moves(level_, state, preferred_, false);
        for (const NativeMove& move : moves) {
          RuntimeState next;
          std::uint8_t events = 0;
          if (!apply_move(level_, state, move, options_, next, events)) continue;
          const std::uint8_t next_flags = flags | events;
          if (goal(next, next_flags)) {
            result.solved = true;
            result.depth = depth + 1;
            result.proven_unsolved_depth = depth;
            result.time_ms = elapsed_ms();
            return result;
          }
          const PackedKey next_key = state_key(level_, next, options_, next_flags);
          const FlatExactSet::InsertResult inserted = visited.insert(next_key);
          if (inserted == FlatExactSet::InsertResult::Full) {
            result.limited = true;
            result.time_ms = elapsed_ms();
            return result;
          }
          if (inserted == FlatExactSet::InsertResult::Inserted) {
            next_frontier.push_back(next_key);
          }
        }
      }
      result.proven_unsolved_depth = depth + 1;
      if (next_frontier.empty()) {
        result.proven_unsolved_depth = max_depth;
        result.time_ms = elapsed_ms();
        return result;
      }
      frontier.swap(next_frontier);
    }
    result.time_ms = elapsed_ms();
    return result;
  }

 private:
  bool goal(const RuntimeState& state, std::uint8_t flags) const {
    return reached_exit(level_, state)
        && goal_flags_satisfied(options_, flags)
        && (!options_.require_portals_clear || portals_clear(level_, state));
  }

  bool limit_hit(std::uint64_t expanded) const {
    return expanded >= options_.max_nodes || elapsed_ms() >= options_.deadline_ms;
  }

  std::uint64_t elapsed_ms() const {
    return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - started_).count());
  }

  const CompiledLevel& level_;
  const RuntimeState& start_;
  const SolverOptions& options_;
  const std::unordered_map<std::uint32_t, int>& preferred_;
  std::chrono::steady_clock::time_point started_;
};

class ParallelIddfs {
 public:
  ParallelIddfs(
      const CompiledLevel& level,
      const RuntimeState& start,
      const SolverOptions& options,
      std::unordered_map<std::uint32_t, int> preferred,
      int proven_unsolved_depth,
      std::function<void(int, std::uint64_t, std::uint64_t)> proof_callback = {})
      : level_(level),
        start_(start),
        options_(options),
        preferred_(std::move(preferred)),
        proven_unsolved_depth_(proven_unsolved_depth),
        proof_callback_(std::move(proof_callback)),
        started_(std::chrono::steady_clock::now()) {}

  SolverResult run() {
    SolverResult result;
    if (goal(start_, 0)) {
      result.solved = true;
      result.depth = 0;
      return result;
    }
    const unsigned hardware_threads = std::max(1U, std::thread::hardware_concurrency());
    const int requested_threads = options_.threads > 0
        ? options_.threads
        : static_cast<int>(std::max(1U, hardware_threads / 2U));
    ConcurrentVisited visited(level_.key_words);
    result.proven_depth = proven_unsolved_depth_;
    const int first_depth = options_.find_any
        ? options_.max_depth : std::max(1, proven_unsolved_depth_ + 1);
    for (int depth = first_depth;
         depth <= options_.max_depth; ++depth) {
      if (limit_hit()) break;
      found_.store(false);
      next_root_.store(0);
      root_tasks_.clear();
      const auto start_grid = occupancy(start_);
      std::vector<NativeMove> first_moves;
      legal_moves_into(level_, start_, preferred_, first_moves, true, &start_grid);
      FlatExactSet root_states(1U << 8, 1U << 14);
      for (const NativeMove& move : first_moves) {
        RuntimeState next;
        std::uint8_t events = 0;
        if (!apply_move_with_grid(
                level_, start_, move, options_, start_grid, next, events)) {
          continue;
        }
        const auto inserted = root_states.insert(state_key(level_, next, options_, events));
        if (inserted == FlatExactSet::InsertResult::Present) continue;
        RootTask task;
        task.state = std::move(next);
        task.flags = events;
        task.path.push_back(move);
        root_tasks_.push_back(std::move(task));
      }
      if (root_tasks_.empty()) {
        result.proven_depth = options_.max_depth;
        break;
      }

      const std::size_t desired_tasks = static_cast<std::size_t>(requested_threads) * 4U;
      if (depth >= 2 && root_tasks_.size() < desired_tasks) {
        std::vector<RootTask> expanded_tasks;
        FlatExactSet expanded_states(1U << 12, 1U << 18);
        for (const RootTask& parent : root_tasks_) {
          if (goal(parent.state, parent.flags)) {
            bool expected = false;
            if (found_.compare_exchange_strong(expected, true)) {
              solution_ = parent.path;
              solution_flags_ = parent.flags;
            }
            break;
          }
          const auto parent_grid = occupancy(parent.state);
          std::vector<NativeMove> second_moves;
          legal_moves_into(
              level_, parent.state, preferred_, second_moves, true, &parent_grid);
          for (const NativeMove& move : second_moves) {
            RuntimeState next;
            std::uint8_t events = 0;
            if (!apply_move_with_grid(
                    level_, parent.state, move, options_, parent_grid, next, events)) {
              continue;
            }
            RootTask child = parent;
            child.state = std::move(next);
            child.flags |= events;
            const auto inserted = expanded_states.insert(
                state_key(level_, child.state, options_, child.flags));
            if (inserted == FlatExactSet::InsertResult::Present) continue;
            child.path.push_back(move);
            expanded_tasks.push_back(std::move(child));
          }
        }
        if (!found_.load() && !expanded_tasks.empty()) root_tasks_ = std::move(expanded_tasks);
      }

      const int thread_count = std::max(1, std::min<int>(requested_threads, root_tasks_.size()));
      std::vector<std::thread> workers;
      workers.reserve(thread_count);
      if (!found_.load()) {
        for (int worker = 0; worker < thread_count; ++worker) {
          workers.emplace_back([&, depth] {
            std::vector<std::vector<NativeMove>> move_buffers(
                static_cast<std::size_t>(depth) + 2);
            for (auto& buffer : move_buffers) buffer.reserve(128);
            std::uint32_t limit_counter = 0;
            while (!found_.load(std::memory_order_relaxed)) {
              const std::size_t root = next_root_.fetch_add(1);
              if (root >= root_tasks_.size()) break;
              const RootTask& task = root_tasks_[root];
              std::vector<NativeMove> path = task.path;
              const int remaining = depth - static_cast<int>(path.size());
              if (remaining < 0) continue;
              if (dfs(
                      task.state, task.flags, remaining, path, visited,
                      move_buffers, limit_counter)) {
                break;
              }
              if (limit_hit()) break;
            }
          });
        }
      }
      for (std::thread& worker : workers) worker.join();
      if (found_.load()) {
        std::lock_guard lock(solution_mutex_);
        result.solved = true;
        result.depth = static_cast<int>(solution_.size());
        result.flags = flags_from_bits(solution_flags_);
        for (const NativeMove& move : solution_) result.path.push_back(native_move_text(level_, move));
        RuntimeState final_state = start_;
        for (const NativeMove& move : solution_) {
          RuntimeState next;
          std::uint8_t events = 0;
          apply_move(level_, final_state, move, options_, next, events);
          final_state = next;
        }
        result.final_blocks = export_blocks(source_level_, final_state);
        break;
      }
      if (limit_hit()) break;
      result.proven_depth = depth;
      if (proof_callback_) proof_callback_(depth, expanded_.load(), elapsed_ms());
    }
    result.limited = limited_.load();
    result.expanded = expanded_.load();
    result.time_ms = elapsed_ms();
    return result;
  }

  void set_source(const Level& source) {
    source_level_ = source;
  }

 private:
  struct RootTask {
    RuntimeState state;
    std::uint8_t flags = 0;
    std::vector<NativeMove> path;
  };

  bool goal(const RuntimeState& state, std::uint8_t flags) const {
    return reached_exit(level_, state)
        && goal_flags_satisfied(options_, flags)
        && (!options_.require_portals_clear || portals_clear(level_, state));
  }

  bool dfs(
      const RuntimeState& state,
      std::uint8_t flags,
      int remaining,
      std::vector<NativeMove>& path,
      ConcurrentVisited& visited,
      std::vector<std::vector<NativeMove>>& move_buffers,
      std::uint32_t& limit_counter) {
    if (found_.load(std::memory_order_relaxed)) return true;
    if (((++limit_counter) & 0x3ff) == 0 && limit_hit()) return false;
    if (goal(state, flags)) {
      bool expected = false;
      if (found_.compare_exchange_strong(expected, true)) {
        std::lock_guard lock(solution_mutex_);
        solution_ = path;
        solution_flags_ = flags;
      }
      return true;
    }
    if (remaining == 0) return false;
    if (admissible_lower_bound(level_, state, options_, flags) > remaining) return false;
    const PackedKey key = state_key(level_, state, options_, flags);
    const std::uint64_t hash = key_hash(key);
    if (visited.should_prune(key, static_cast<std::uint8_t>(remaining), hash)) {
      return false;
    }
    expanded_.fetch_add(1, std::memory_order_relaxed);
    const auto grid = occupancy(state);
    std::vector<NativeMove>& moves = move_buffers[path.size()];
    legal_moves_into(level_, state, preferred_, moves, true, &grid);
    for (const NativeMove& move : moves) {
      RuntimeState next;
      std::uint8_t events = 0;
      if (!apply_move_with_grid(
              level_, state, move, options_, grid, next, events)) {
        continue;
      }
      path.push_back(move);
      if (dfs(
              next, flags | events, remaining - 1, path, visited,
              move_buffers, limit_counter)) {
        return true;
      }
      path.pop_back();
      if (found_.load(std::memory_order_relaxed) || limit_hit()) return false;
    }
    return false;
  }

  bool limit_hit() {
    if (limited_.load()) return true;
    if (expanded_.load(std::memory_order_relaxed) >= options_.max_nodes
        || elapsed_ms() >= options_.deadline_ms) {
      limited_.store(true);
      return true;
    }
    return false;
  }

  std::uint64_t elapsed_ms() const {
    return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - started_).count());
  }

  const CompiledLevel& level_;
  const RuntimeState& start_;
  const SolverOptions& options_;
  std::unordered_map<std::uint32_t, int> preferred_;
  int proven_unsolved_depth_ = -1;
  std::function<void(int, std::uint64_t, std::uint64_t)> proof_callback_;
  Level source_level_;
  std::chrono::steady_clock::time_point started_;
  std::atomic<std::uint64_t> expanded_{0};
  std::atomic<bool> limited_{false};
  std::atomic<bool> found_{false};
  std::atomic<std::size_t> next_root_{0};
  std::vector<RootTask> root_tasks_;
  std::mutex solution_mutex_;
  std::vector<NativeMove> solution_;
  std::uint8_t solution_flags_ = 0;
};

class ExhaustiveReachability {
 public:
  ExhaustiveReachability(
      const CompiledLevel& level,
      const RuntimeState& start,
      const SolverOptions& options,
      std::unordered_map<std::uint32_t, int> preferred,
      const Level& source)
      : level_(level),
        start_(start),
        options_(options),
        preferred_(std::move(preferred)),
        source_(source),
        started_(std::chrono::steady_clock::now()) {}

  SolverResult run() {
    SolverResult result;
    struct PendingState {
      PackedKey key;
      std::uint32_t id = 0;
    };
    std::vector<PendingState> stack;
    const PackedKey start_key = state_key(level_, start_, options_, 0);
    CompactExactSet visited(level_.key_words);
    const auto start_insert = visited.insert_with_id(start_key);
    if (start_insert.result == CompactExactSet::InsertResult::Full) {
      result.limited = true;
      return result;
    }
    stack.push_back({start_key, start_insert.id});
    struct ParentEdge {
      std::uint32_t parent = std::numeric_limits<std::uint32_t>::max();
      NativeMove move;
      std::uint16_t moved_token = 0;
      bool ice_token_used = false;
    };
    std::vector<ParentEdge> parent_edges(1);
    while (!stack.empty()) {
      if ((result.expanded & 0x3ff) == 0
          && (result.expanded >= options_.max_nodes || elapsed_ms() >= options_.deadline_ms)) {
        result.limited = true;
        break;
      }
      const PendingState pending = stack.back();
      stack.pop_back();
      RuntimeState current;
      std::uint8_t current_flags = 0;
      restore_state_key(level_, start_, pending.key, current, current_flags);
      if (reached_exit(level_, current)
          && goal_flags_satisfied(options_, current_flags)
          && (!options_.require_portals_clear || portals_clear(level_, current))) {
        result.solved = true;
        result.flags = flags_from_bits(current_flags);
        result.final_blocks = export_blocks(source_, current);
        std::vector<ParentEdge> reversed_edges;
        std::uint32_t cursor = pending.id;
        while (cursor != start_insert.id) {
          reversed_edges.push_back(parent_edges[cursor]);
          cursor = parent_edges[cursor].parent;
        }
        std::reverse(reversed_edges.begin(), reversed_edges.end());
        RuntimeState identity_state = start_;
        std::uint8_t replay_flags = 0;
        result.path.reserve(reversed_edges.size());
        for (const ParentEdge& edge : reversed_edges) {
          NativeMove identity_move = edge.move;
          bool mapped = false;
          const int class_id = level_.canonical_class[edge.move.block];
          if (class_id >= 0) {
            for (const std::uint8_t member :
                 level_.canonical_members[static_cast<std::size_t>(class_id)]) {
              if (block_token(identity_state.blocks[member]) == edge.moved_token) {
                identity_move.block = member;
                mapped = true;
                break;
              }
            }
          } else {
            for (const auto& members : level_.ice_canonical_members) {
              if (std::find(members.begin(), members.end(), edge.move.block) == members.end()) {
                continue;
              }
              for (const std::uint8_t member : members) {
                if (ice_token(identity_state.blocks[member]) == edge.moved_token) {
                  identity_move.block = member;
                  mapped = true;
                  break;
                }
              }
              break;
            }
          }
          if (class_id < 0 && !edge.ice_token_used) mapped = true;
          RuntimeState next_identity;
          std::uint8_t events = 0;
          if (!mapped || !apply_move(
                  level_, identity_state, identity_move, options_, next_identity, events)) {
            result.solved = false;
            result.limited = true;
            result.error = "exhaustive-identity-remap";
            break;
          }
          result.path.push_back(native_move_text(level_, identity_move));
          identity_state = next_identity;
          replay_flags |= events;
        }
        if (!result.solved) break;
        result.depth = static_cast<int>(result.path.size());
        result.flags = flags_from_bits(replay_flags);
        result.final_blocks = export_blocks(source_, identity_state);
        if (!reached_exit(level_, identity_state)) {
          result.solved = false;
          result.limited = true;
          result.error = "exhaustive-reconstructed-path-not-solved";
        }
        break;
      }
      result.expanded++;
      if ((result.expanded & ((1U << 20) - 1)) == 0) {
        std::cerr << "[solver-exhaustive] expanded=" << result.expanded
                  << " stack=" << stack.size()
                  << " timeMs=" << elapsed_ms() << '\n';
      }
      auto moves = legal_moves(level_, current, preferred_);
      std::reverse(moves.begin(), moves.end());
      for (const NativeMove& move : moves) {
        RuntimeState next;
        std::uint8_t events = 0;
        if (!apply_move(level_, current, move, options_, next, events)) continue;
        const std::uint8_t flags = current_flags | events;
        const PackedKey next_key = state_key(level_, next, options_, flags);
        const auto inserted = visited.insert_with_id(next_key);
        if (inserted.result == CompactExactSet::InsertResult::Present) continue;
        if (inserted.result == CompactExactSet::InsertResult::Full) {
          result.limited = true;
          stack.clear();
          break;
        }
        if (inserted.id != parent_edges.size()) {
          result.limited = true;
          stack.clear();
          break;
        }
        ParentEdge edge;
        edge.parent = pending.id;
        edge.move = move;
        edge.moved_token = block_token(current.blocks[move.block]);
        for (const auto& members : level_.ice_canonical_members) {
          if (std::find(members.begin(), members.end(), move.block) != members.end()) {
            edge.moved_token = ice_token(current.blocks[move.block]);
            edge.ice_token_used = true;
            break;
          }
        }
        parent_edges.push_back(edge);
        stack.push_back({next_key, inserted.id});
      }
    }
    result.time_ms = elapsed_ms();
    return result;
  }

 private:
  std::uint64_t elapsed_ms() const {
    return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - started_).count());
  }

  const CompiledLevel& level_;
  const RuntimeState& start_;
  const SolverOptions& options_;
  std::unordered_map<std::uint32_t, int> preferred_;
  const Level& source_;
  std::chrono::steady_clock::time_point started_;
};

std::string cache_key(const Level& level, const SolverOptions& options) {
  json option_json = {
      {"exhaustive", options.exhaustive},
      {"disableMagnet", options.disable_magnet},
      {"disableAttract", options.disable_attract},
      {"disableRepel", options.disable_repel},
      {"disableIce", options.disable_ice_damage},
      {"disableTeleport", options.disable_teleport},
      {"disableUnlock", options.disable_unlock},
      {"requireIce", options.mechanism_route_search && options.require_ice_damage},
      {"requireMagnet", options.mechanism_route_search && options.require_magnet},
      {"requireAttract", options.mechanism_route_search && options.require_magnet_attract},
      {"requireRepel", options.mechanism_route_search && options.require_magnet_repel},
      {"requireTeleport", options.mechanism_route_search && options.require_teleport},
      {"requireUnlock", options.mechanism_route_search && options.require_unlock},
      {"mechanismRouteSearch", options.mechanism_route_search},
      {"findAny", options.find_any},
      {"requirePortalsClear", options.require_portals_clear},
  };
  json board = {
      {"width", level.width},
      {"height", level.height},
      {"exit", {
          {"side", level.exit.side},
          {"x", level.exit.x},
          {"y", level.exit.y},
          {"w", level.exit.w},
          {"h", level.exit.h},
      }},
      {"targetId", level.target_id},
      {"blocks", json::array()},
      {"specialCells", json::array()},
  };
  std::vector<Block> blocks = level.blocks;
  std::sort(blocks.begin(), blocks.end(), [](const Block& lhs, const Block& rhs) {
    return lhs.id < rhs.id;
  });
  for (const Block& block : blocks) {
    json item = {
        {"id", block.id},
        {"type", block.type},
        {"x", block.x},
        {"y", block.y},
        {"w", block.w},
        {"h", block.h},
        {"moveDir", block.move_dir},
    };
    if (!block.pole.empty()) item["pole"] = block.pole;
    if (!block.ice_state.empty()) item["iceState"] = block.ice_state;
    if (!block.linked_ids.empty()) {
      auto linked = block.linked_ids;
      std::sort(linked.begin(), linked.end());
      item["linkedIds"] = linked;
    }
    if (!block.unlock_target_id.empty()) item["unlockTargetId"] = block.unlock_target_id;
    if (!block.unlocked_move_dir.empty()) item["unlockedMoveDir"] = block.unlocked_move_dir;
    board["blocks"].push_back(std::move(item));
  }
  std::vector<SpecialCell> cells = level.special_cells;
  std::sort(cells.begin(), cells.end(), [](const SpecialCell& lhs, const SpecialCell& rhs) {
    return std::tie(lhs.type, lhs.portal_id, lhs.x, lhs.y, lhs.w, lhs.h)
        < std::tie(rhs.type, rhs.portal_id, rhs.x, rhs.y, rhs.w, rhs.h);
  });
  for (const SpecialCell& cell : cells) {
    if (cell.type != "teleport") continue;
    board["specialCells"].push_back({
        {"type", cell.type},
        {"x", cell.x},
        {"y", cell.y},
        {"w", cell.w},
        {"h", cell.h},
        {"portalId", cell.portal_id},
        {"pairId", cell.pair_id},
    });
  }
  return board.dump() + "|" + option_json.dump();
}

std::string topology_key(const Level& level, const SolverOptions& options) {
  std::vector<std::string> descriptors;
  descriptors.reserve(level.blocks.size());
  for (const Block& block : level.blocks) {
    descriptors.push_back(
        block.type + ":" + std::to_string(block.w) + "x" + std::to_string(block.h)
        + ":" + block.move_dir + ":" + block.pole);
  }
  std::sort(descriptors.begin(), descriptors.end());
  json value = {
      {"exitSide", level.exit.side},
      {"descriptors", descriptors},
      {"portalCount", std::count_if(
          level.special_cells.begin(), level.special_cells.end(),
          [](const SpecialCell& cell) { return cell.type == "teleport"; })},
      {"requireIce", options.mechanism_route_search && options.require_ice_damage},
      {"requireMagnet", options.mechanism_route_search && options.require_magnet},
      {"requireAttract", options.mechanism_route_search && options.require_magnet_attract},
      {"requireRepel", options.mechanism_route_search && options.require_magnet_repel},
      {"requireTeleport", options.mechanism_route_search && options.require_teleport},
      {"requireUnlock", options.mechanism_route_search && options.require_unlock},
      {"mechanismRouteSearch", options.mechanism_route_search},
  };
  return value.dump();
}

json result_to_json(const SolverResult& result) {
  return {
      {"solved", result.solved},
      {"limited", result.limited},
      {"depth", result.depth},
      {"flags", flags_to_json(result.flags)},
      {"path", result.path},
  };
}

SolverResult result_from_json(const json& value) {
  SolverResult result;
  result.solved = value.value("solved", false);
  result.limited = value.value("limited", false);
  result.depth = value.value("depth", -1);
  result.path = value.value("path", std::vector<std::string>{});
  const json flags = value.value("flags", json::object());
  result.flags.used_teleport = flags.value("usedTeleport", false);
  result.flags.used_unlock = flags.value("usedUnlock", false);
  result.flags.used_ice_damage = flags.value("usedIceDamage", false);
  result.flags.used_magnet = flags.value("usedMagnet", false);
  result.flags.used_magnet_attract = flags.value("usedMagnetAttract", false);
  result.flags.used_magnet_repel = flags.value("usedMagnetRepel", false);
  result.flags.moved_special = flags.value("movedSpecial", false);
  return result;
}

}  // namespace

struct SolverEngine::Impl {
  struct Proof {
    int proven_unsolved_depth = -1;
    SolverResult optimal;
    bool has_optimal = false;
  };

  std::mutex cache_mutex;
  std::unordered_map<std::string, Proof> proofs;
  std::unordered_map<std::string, SolverResult> replay_cache;
  std::unordered_map<std::string, std::vector<std::string>> topology_hints;
  std::filesystem::path cache_file =
      std::filesystem::current_path() / "tmp" / "cpp_pipeline" / "solver_cache_v3.json";
  std::filesystem::path progress_file =
      std::filesystem::current_path() / "tmp" / "cpp_pipeline" / "solver_progress_v3.jsonl";
  std::uint64_t exact_hits = 0;
  std::uint64_t proof_hits = 0;
  std::uint64_t replay_hits = 0;
  std::uint64_t topology_hits = 0;
  std::uint64_t solves = 0;
};

SolverEngine::SolverEngine() : impl_(std::make_unique<Impl>()) {
  std::ifstream input(impl_->cache_file, std::ios::binary);
  if (input) {
    try {
      json persisted;
      input >> persisted;
      if (persisted.value("version", 0) == 3) {
        const json proofs = persisted.value("proofs", json::object());
        for (auto it = proofs.begin(); it != proofs.end(); ++it) {
          Impl::Proof proof;
          proof.proven_unsolved_depth = it.value().value("provenUnsolvedDepth", -1);
          if (it.value().contains("optimal")) {
            proof.optimal = result_from_json(it.value()["optimal"]);
            proof.has_optimal = proof.optimal.solved;
          }
          impl_->proofs.emplace(it.key(), std::move(proof));
        }
        impl_->topology_hints =
            persisted.value("topologyHints", std::unordered_map<std::string, std::vector<std::string>>{});
      }
    } catch (...) {
      impl_->proofs.clear();
      impl_->topology_hints.clear();
    }
  }
  std::ifstream progress(impl_->progress_file, std::ios::binary);
  std::string line;
  while (std::getline(progress, line)) {
    if (line.empty()) continue;
    try {
      const json checkpoint = json::parse(line);
      const std::string checkpoint_key = checkpoint.at("key").get<std::string>();
      const int depth = checkpoint.at("depth").get<int>();
      Impl::Proof& proof = impl_->proofs[checkpoint_key];
      proof.proven_unsolved_depth = std::max(proof.proven_unsolved_depth, depth);
    } catch (...) {
    }
  }
}

SolverEngine::~SolverEngine() {
  flush_cache();
}

void SolverEngine::clear_cache() {
  std::lock_guard lock(impl_->cache_mutex);
  impl_->proofs.clear();
  impl_->replay_cache.clear();
  impl_->topology_hints.clear();
  std::error_code ignored;
  std::filesystem::remove(impl_->progress_file, ignored);
}

void SolverEngine::flush_cache() {
  std::lock_guard lock(impl_->cache_mutex);
  std::error_code error;
  std::filesystem::create_directories(impl_->cache_file.parent_path(), error);
  if (error) return;
  json persisted = {
      {"version", 3},
      {"proofs", json::object()},
      {"topologyHints", impl_->topology_hints},
  };
  for (const auto& [key, proof] : impl_->proofs) {
    json item = {{"provenUnsolvedDepth", proof.proven_unsolved_depth}};
    if (proof.has_optimal) item["optimal"] = result_to_json(proof.optimal);
    persisted["proofs"][key] = std::move(item);
  }
  const auto temporary = impl_->cache_file.string() + ".tmp";
  {
    std::ofstream output(temporary, std::ios::binary);
    if (!output) return;
    output << persisted.dump() << '\n';
  }
  std::filesystem::rename(temporary, impl_->cache_file, error);
  if (error) {
    std::filesystem::remove(impl_->cache_file, error);
    error.clear();
    std::filesystem::rename(temporary, impl_->cache_file, error);
  }
  if (!error) std::filesystem::remove(impl_->progress_file, error);
}

json SolverEngine::cache_stats() const {
  std::lock_guard lock(impl_->cache_mutex);
  return {
      {"proofEntries", impl_->proofs.size()},
      {"replayEntries", impl_->replay_cache.size()},
      {"topologyEntries", impl_->topology_hints.size()},
      {"exactHits", impl_->exact_hits},
      {"proofHits", impl_->proof_hits},
      {"replayHits", impl_->replay_hits},
      {"topologyHits", impl_->topology_hits},
      {"searches", impl_->solves},
  };
}

SolverResult SolverEngine::replay(
    const Level& level,
    const std::vector<std::string>& moves,
    const SolverOptions& options) {
  const std::string replay_key =
      cache_key(level, options) + "|replay|" + json(moves).dump();
  {
    std::lock_guard lock(impl_->cache_mutex);
    const auto found = impl_->replay_cache.find(replay_key);
    if (found != impl_->replay_cache.end()) {
      impl_->replay_hits++;
      return found->second;
    }
  }
  SolverResult result;
  RuntimeState state;
  std::string error;
  const CompiledLevel compiled = compile_level(level, state, error);
  if (!error.empty()) {
    result.error = error;
    return result;
  }
  std::uint8_t flags = 0;
  int applied = 0;
  for (const std::string& raw : moves) {
    const auto parsed = parse_move(raw);
    if (!parsed) {
      result.error = "bad-move:" + raw;
      break;
    }
    const auto found = compiled.id_to_index.find(parsed->block_id);
    if (found == compiled.id_to_index.end()) {
      result.error = "missing-block:" + parsed->block_id;
      break;
    }
    NativeMove move{
        static_cast<std::uint8_t>(found->second),
        direction(parsed->dir),
        static_cast<std::uint8_t>(parsed->amount),
    };
    if (state.blocks[move.block].type == BlockType::Magnet) {
      move.block = static_cast<std::uint8_t>(std::countr_zero(group_mask(state, move.block)));
    }
    RuntimeState next;
    std::uint8_t events = 0;
    if (!apply_move(compiled, state, move, options, next, events)) {
      result.error = "illegal-move:" + raw;
      break;
    }
    state = next;
    flags |= events;
    applied++;
  }
  result.replay_ok = applied == static_cast<int>(moves.size());
  result.depth = applied;
  result.flags = flags_from_bits(flags);
  result.final_blocks = export_blocks(level, state);
  result.solved = result.replay_ok && reached_exit(compiled, state);
  {
    std::lock_guard lock(impl_->cache_mutex);
    if (result.replay_ok) impl_->replay_cache.emplace(replay_key, result);
  }
  return result;
}

SolverResult SolverEngine::weave_required_sequence(
    const Level& level,
    const std::vector<std::string>& required_moves,
    const std::vector<std::string>& seed_moves,
    int max_support_normal_moves,
    int max_total_moves,
    const SolverOptions& required_flags) {
  return weave_required_sequence_multi(
      level,
      required_moves,
      {seed_moves},
      max_support_normal_moves,
      max_total_moves,
      required_flags);
}

SolverResult SolverEngine::weave_required_sequence_multi(
    const Level& level,
    const std::vector<std::string>& required_moves,
    const std::vector<std::vector<std::string>>& seed_moves,
    int max_support_normal_moves,
    int max_total_moves,
    const SolverOptions& required_flags) {
  struct WeaveKey {
    PackedKey state;
    std::uint8_t required_index = 0;
    std::uint8_t support_moves = 0;

    bool operator==(const WeaveKey& other) const noexcept {
      return state == other.state
          && required_index == other.required_index
          && support_moves == other.support_moves;
    }
  };
  struct WeaveKeyHash {
    std::size_t operator()(const WeaveKey& key) const noexcept {
      return static_cast<std::size_t>(
          mix64(key_hash(key.state)
              ^ (static_cast<std::uint64_t>(key.required_index) << 8)
              ^ key.support_moves));
    }
  };
  struct Node {
    RuntimeState state;
    std::uint8_t flags = 0;
    std::uint8_t required_index = 0;
    std::uint8_t support_moves = 0;
    std::vector<NativeMove> path;
    int score = 0;
  };
  struct Worse {
    bool operator()(const Node& lhs, const Node& rhs) const noexcept {
      if (lhs.score != rhs.score) return lhs.score > rhs.score;
      return lhs.path.size() > rhs.path.size();
    }
  };

  SolverResult result;
  RuntimeState start;
  std::string error;
  const CompiledLevel compiled = compile_level(level, start, error);
  if (!error.empty()) {
    result.error = error;
    return result;
  }
  const auto started = std::chrono::steady_clock::now();
  auto elapsed_ms = [&]() {
    return static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - started).count());
  };
  auto parse_native = [&](const std::string& raw, const RuntimeState& state)
      -> std::optional<NativeMove> {
    const auto parsed = parse_move(raw);
    if (!parsed) return std::nullopt;
    const auto found = compiled.id_to_index.find(parsed->block_id);
    if (found == compiled.id_to_index.end()) return std::nullopt;
    NativeMove move{
        static_cast<std::uint8_t>(found->second),
        direction(parsed->dir),
        static_cast<std::uint8_t>(parsed->amount),
    };
    if (state.blocks[move.block].type == BlockType::Magnet) {
      move.block = static_cast<std::uint8_t>(std::countr_zero(group_mask(state, move.block)));
    }
    return move;
  };
  auto missing_flags = [&](std::uint8_t flags) {
    int missing = 0;
    if (required_flags.require_ice_damage && !(flags & UsedIceDamage)) missing++;
    if (required_flags.require_magnet && !(flags & UsedMagnet)) missing++;
    if (required_flags.require_magnet_attract && !(flags & UsedMagnetAttract)) missing++;
    if (required_flags.require_magnet_repel && !(flags & UsedMagnetRepel)) missing++;
    if (required_flags.require_teleport && !(flags & UsedTeleport)) missing++;
    if (required_flags.require_unlock && !(flags & UsedUnlock)) missing++;
    return missing;
  };
  auto score_node = [&](const Node& node) {
    return (static_cast<int>(required_moves.size()) - node.required_index) * 1000
        + missing_flags(node.flags) * 80
        + node.support_moves * 8
        + static_cast<int>(node.path.size());
  };
  auto advance_required = [&](Node node) {
    while (node.required_index < required_moves.size()
        && static_cast<int>(node.path.size()) < max_total_moves) {
      const auto move = parse_native(required_moves[node.required_index], node.state);
      if (!move) break;
      RuntimeState next;
      std::uint8_t events = 0;
      if (!apply_move(compiled, node.state, *move, required_flags, next, events)) break;
      node.state = next;
      node.flags |= events;
      node.path.push_back(*move);
      node.required_index++;
    }
    node.score = score_node(node);
    return node;
  };
  auto apply_seed = [&](const std::vector<std::string>& seed) -> std::optional<Node> {
    Node node;
    node.state = start;
    for (const std::string& raw : seed) {
      const auto move = parse_native(raw, node.state);
      if (!move) return std::nullopt;
      RuntimeState next;
      std::uint8_t events = 0;
      if (!apply_move(compiled, node.state, *move, required_flags, next, events)) {
        return std::nullopt;
      }
      node.state = next;
      node.flags |= events;
      node.path.push_back(*move);
    }
    return advance_required(std::move(node));
  };

  std::priority_queue<Node, std::vector<Node>, Worse> frontier;
  for (const std::vector<std::string>& seed : seed_moves) {
    if (auto seeded = apply_seed(seed)) frontier.push(std::move(*seeded));
  }
  if (seed_moves.empty()) {
    if (auto empty = apply_seed({})) frontier.push(std::move(*empty));
  }
  std::unordered_map<WeaveKey, std::uint8_t, WeaveKeyHash> best_length;
  std::mutex frontier_mutex;
  std::mutex seen_mutex;
  std::mutex result_mutex;
  std::condition_variable frontier_cv;
  std::atomic<std::uint64_t> expanded{0};
  std::atomic<int> active_workers{0};
  std::atomic<int> best_required_index{0};
  std::atomic<bool> stop{false};
  std::atomic<bool> limited{false};
  const int weave_threads = static_cast<int>(std::max(1U, std::thread::hardware_concurrency()));

  auto worker = [&]() {
    while (true) {
      Node node;
      {
        std::unique_lock lock(frontier_mutex);
        frontier_cv.wait(lock, [&] {
          return stop.load(std::memory_order_relaxed)
              || !frontier.empty()
              || active_workers.load(std::memory_order_relaxed) == 0;
        });
        if (stop.load(std::memory_order_relaxed)) return;
        if (frontier.empty()) {
          if (active_workers.load(std::memory_order_relaxed) == 0) {
            stop.store(true);
            frontier_cv.notify_all();
            return;
          }
          continue;
        }
        node = frontier.top();
        frontier.pop();
        active_workers.fetch_add(1, std::memory_order_relaxed);
      }

      bool duplicate = false;
      const WeaveKey key{
          state_key(compiled, node.state, required_flags, node.flags),
          node.required_index,
          node.support_moves,
      };
      {
        std::lock_guard lock(seen_mutex);
        const auto seen = best_length.find(key);
        if (seen != best_length.end() && seen->second <= node.path.size()) {
          duplicate = true;
        } else {
          best_length[key] = static_cast<std::uint8_t>(node.path.size());
        }
      }

      std::vector<Node> children;
      if (!duplicate && !stop.load(std::memory_order_relaxed)) {
        const std::uint64_t count = expanded.fetch_add(1, std::memory_order_relaxed) + 1;
        int observed = best_required_index.load(std::memory_order_relaxed);
        while (observed < node.required_index
            && !best_required_index.compare_exchange_weak(observed, node.required_index)) {}
        if (count >= required_flags.max_nodes || elapsed_ms() >= required_flags.deadline_ms) {
          limited.store(true);
          stop.store(true);
        } else if (node.required_index == required_moves.size()
            && reached_exit(compiled, node.state)
            && flags_satisfied(required_flags, node.flags)
            && static_cast<int>(node.path.size()) >= kMinBest
            && static_cast<int>(node.path.size()) <= max_total_moves) {
          bool expected = false;
          if (stop.compare_exchange_strong(expected, true)) {
            std::lock_guard lock(result_mutex);
            result.solved = true;
            result.depth = static_cast<int>(node.path.size());
            result.flags = flags_from_bits(node.flags);
            result.final_blocks = export_blocks(level, node.state);
            for (const NativeMove& move : node.path) {
              result.path.push_back(native_move_text(compiled, move));
            }
          }
        } else if (static_cast<int>(node.path.size()) < max_total_moves) {
          const auto moves = legal_moves(compiled, node.state, {});
          children.reserve(moves.size());
          for (const NativeMove& move : moves) {
            const RuntimeBlock& block = node.state.blocks[move.block];
            const bool support = block.type == BlockType::Normal;
            if (block.type != BlockType::Magnet && block.type != BlockType::Ice && !support) continue;
            if (support && node.support_moves >= max_support_normal_moves) continue;
            RuntimeState next_state;
            std::uint8_t events = 0;
            if (!apply_move(compiled, node.state, move, required_flags, next_state, events)) continue;
            Node next = node;
            next.state = std::move(next_state);
            next.flags |= events;
            next.path.push_back(move);
            if (support) next.support_moves++;
            children.push_back(advance_required(std::move(next)));
          }
        }
      }

      {
        std::lock_guard lock(frontier_mutex);
        if (!stop.load(std::memory_order_relaxed)) {
          for (Node& child : children) frontier.push(std::move(child));
        }
        active_workers.fetch_sub(1, std::memory_order_relaxed);
        if (!stop.load(std::memory_order_relaxed)
            && frontier.empty()
            && active_workers.load(std::memory_order_relaxed) == 0) {
          stop.store(true);
        }
      }
      frontier_cv.notify_all();
    }
  };

  std::vector<std::thread> workers;
  workers.reserve(weave_threads);
  for (int i = 0; i < weave_threads; ++i) workers.emplace_back(worker);
  frontier_cv.notify_all();
  for (std::thread& thread : workers) thread.join();
  result.expanded = expanded.load();
  result.limited = limited.load() && !result.solved;
  if (!result.solved) result.depth = best_required_index.load();
  result.time_ms = elapsed_ms();
  return result;
}

SolverResult SolverEngine::solve(const Level& level, const SolverOptions& options) {
  const std::string key = cache_key(level, options);
  std::optional<SolverResult> cached_optimal;
  int proven_unsolved_depth = -1;
  {
    std::lock_guard lock(impl_->cache_mutex);
    const auto found = impl_->proofs.find(key);
    if (found != impl_->proofs.end()) {
      proven_unsolved_depth = found->second.proven_unsolved_depth;
      if (found->second.has_optimal && found->second.optimal.depth <= options.max_depth) {
        impl_->exact_hits++;
        cached_optimal = found->second.optimal;
      }
      if (!cached_optimal && found->second.proven_unsolved_depth >= options.max_depth) {
        impl_->proof_hits++;
        SolverResult unsolved;
        unsolved.depth = -1;
        return unsolved;
      }
    }
  }
  if (cached_optimal) {
    SolverResult verified = replay(level, cached_optimal->path, options);
    if (verified.replay_ok && verified.solved && goal_flags_satisfied(options, [&] {
          std::uint8_t bits = 0;
          if (verified.flags.used_teleport) bits |= UsedTeleport;
          if (verified.flags.used_unlock) bits |= UsedUnlock;
          if (verified.flags.used_ice_damage) bits |= UsedIceDamage;
          if (verified.flags.used_magnet) bits |= UsedMagnet;
          if (verified.flags.used_magnet_attract) bits |= UsedMagnetAttract;
          if (verified.flags.used_magnet_repel) bits |= UsedMagnetRepel;
          return bits;
        }())) {
      cached_optimal->final_blocks = std::move(verified.final_blocks);
      return *cached_optimal;
    }
    std::lock_guard lock(impl_->cache_mutex);
    impl_->proofs.erase(key);
  }

  SolverResult result;
  RuntimeState state;
  std::string error;
  const CompiledLevel compiled = compile_level(level, state, error);
  if (!error.empty()) {
    result.error = error;
    return result;
  }
  std::vector<std::string> preferred_moves = options.preferred_moves;
  std::optional<SolverResult> preferred_upper_bound;
  if (!options.exhaustive && !options.preferred_moves.empty()) {
    SolverResult replayed = replay(level, options.preferred_moves, options);
    if (replayed.replay_ok && replayed.solved
        && replayed.depth <= options.max_depth
        && goal_flags_satisfied(options, bits_from_flags(replayed.flags))
        && (!options.require_portals_clear
            || portal_cells_clear(level, replayed.final_blocks))) {
      replayed.path = options.preferred_moves;
      preferred_upper_bound = std::move(replayed);
    }
  }
  {
    std::lock_guard lock(impl_->cache_mutex);
    const auto hint = impl_->topology_hints.find(topology_key(level, options));
    if (hint != impl_->topology_hints.end()) {
      preferred_moves.insert(preferred_moves.end(), hint->second.begin(), hint->second.end());
      impl_->topology_hits++;
    }
    impl_->solves++;
  }
  std::unordered_map<std::uint32_t, int> preferred;
  for (std::size_t i = 0; i < preferred_moves.size(); ++i) {
    const auto parsed = parse_move(preferred_moves[i]);
    if (!parsed) continue;
    const auto found = compiled.id_to_index.find(parsed->block_id);
    if (found == compiled.id_to_index.end()) continue;
    NativeMove move{
        static_cast<std::uint8_t>(found->second),
        direction(parsed->dir),
        static_cast<std::uint8_t>(parsed->amount),
    };
    preferred.try_emplace(move_code(move), static_cast<int>(i));
  }
  if (options.exhaustive) {
    ExhaustiveReachability search(compiled, state, options, std::move(preferred), level);
    result = search.run();
  } else {
    SolverOptions search_options = options;
    if (preferred_upper_bound) {
      if (preferred_upper_bound->depth == 0) return *preferred_upper_bound;
      search_options.max_depth =
          std::min(search_options.max_depth, preferred_upper_bound->depth - 1);
      if (proven_unsolved_depth >= search_options.max_depth) {
        result = *preferred_upper_bound;
        result.proven_depth = search_options.max_depth;
      }
    }
    auto proof_callback = [this, &key](int depth, std::uint64_t expanded, std::uint64_t time_ms) {
      {
        std::lock_guard lock(impl_->cache_mutex);
        Impl::Proof& proof = impl_->proofs[key];
        proof.proven_unsolved_depth = std::max(proof.proven_unsolved_depth, depth);
        if (depth >= kMinBest - 1) {
          std::error_code error;
          std::filesystem::create_directories(impl_->progress_file.parent_path(), error);
          if (!error) {
            std::ofstream checkpoint(impl_->progress_file, std::ios::binary | std::ios::app);
            if (checkpoint) {
              checkpoint << json({{"key", key}, {"depth", depth}}).dump() << '\n';
            }
          }
        }
      }
      if (depth >= 10 && time_ms >= 1'000) {
        std::cerr << "[solver-proof] completedDepth=" << depth
                  << " expanded=" << expanded
                  << " timeMs=" << time_ms << '\n';
      }
    };
    if (!result.solved) {
      ParallelIddfs search(
          compiled, state, search_options, std::move(preferred), proven_unsolved_depth,
          std::move(proof_callback));
      search.set_source(level);
      result = search.run();
      if (!result.solved && !result.limited && preferred_upper_bound) {
        const std::uint64_t proof_expanded = result.expanded;
        const std::uint64_t proof_time_ms = result.time_ms;
        const int proof_depth = result.proven_depth;
        result = *preferred_upper_bound;
        result.expanded = proof_expanded;
        result.time_ms = proof_time_ms;
        result.proven_depth = std::max(proof_depth, result.depth - 1);
      }
    }
  }
  {
    std::lock_guard lock(impl_->cache_mutex);
    Impl::Proof& proof = impl_->proofs[key];
    proof.proven_unsolved_depth = std::max(
        proof.proven_unsolved_depth, result.proven_depth);
    if (!result.limited) {
      if (result.solved && !options.exhaustive && !options.find_any) {
        proof.optimal = result;
        proof.has_optimal = true;
        impl_->topology_hints[topology_key(level, options)] = result.path;
      } else if (result.solved) {
        impl_->topology_hints[topology_key(level, options)] = result.path;
      } else {
        proof.proven_unsolved_depth = options.exhaustive
            ? std::numeric_limits<int>::max()
            : std::max(proof.proven_unsolved_depth, options.max_depth);
      }
    }
  }
  return result;
}

}  // namespace escape
