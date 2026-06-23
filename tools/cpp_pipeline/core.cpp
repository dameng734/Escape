#include "pipeline.hpp"

#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <stdexcept>

namespace escape {

const std::array<Shape, 8> kShapes = {{
    {"h1", 1, 1, "horizontal"},
    {"v1", 1, 1, "vertical"},
    {"h2", 2, 1, "horizontal"},
    {"h3", 3, 1, "horizontal"},
    {"v2", 1, 2, "vertical"},
    {"v3", 1, 3, "vertical"},
    {"sqh", 2, 2, "horizontal"},
    {"sqv", 2, 2, "vertical"},
}};

namespace {

std::string style_for(const Block& block) {
  if (block.type == "fixed") return "fixed_stone";
  if (block.type == "locked") return "locked";
  if (block.type == "key") return "key";
  if (block.type == "magnet") return block.pole == "S" ? "magnet_s" : "magnet_n";
  if (block.type == "ice") return block.ice_state == "cracked" ? "ice_cracked" : "ice_intact";
  if (block.type == "target") return "pet";
  if (block.w == 2 && block.h == 2) return "normal_square_2x2";
  if (block.move_dir == "vertical") {
    return block.h >= 3 ? "normal_green_vertical_long" : "normal_green_vertical";
  }
  if (block.move_dir == "horizontal") {
    return block.w >= 3 ? "normal_blue_horizontal_long" : "normal_blue_horizontal";
  }
  return "normal_block";
}

json block_to_json(const Block& block) {
  json item = {
      {"id", block.id},
      {"type", block.type},
      {"x", block.x},
      {"y", block.y},
      {"w", block.w},
      {"h", block.h},
      {"moveDir", block.move_dir},
      {"style", style_for(block)},
  };
  if (!block.pole.empty()) item["pole"] = block.pole;
  if (!block.ice_state.empty()) item["iceState"] = block.ice_state;
  if (!block.linked_ids.empty()) item["linkedIds"] = block.linked_ids;
  if (!block.unlock_target_id.empty()) item["unlockTargetId"] = block.unlock_target_id;
  if (!block.unlocked_move_dir.empty()) item["unlockedMoveDir"] = block.unlocked_move_dir;
  if (!block.lock_id.empty()) item["lockId"] = block.lock_id;
  if (!block.key_id.empty()) item["keyId"] = block.key_id;
  if (!block.skin_id.empty()) item["skinId"] = block.skin_id;
  if (!block.facing.empty()) item["facing"] = block.facing;
  return item;
}

}  // namespace

json flags_to_json(const Flags& flags) {
  return {
      {"usedTeleport", flags.used_teleport},
      {"usedUnlock", flags.used_unlock},
      {"usedIceDamage", flags.used_ice_damage},
      {"usedMagnet", flags.used_magnet},
      {"usedMagnetAttract", flags.used_magnet_attract},
      {"usedMagnetRepel", flags.used_magnet_repel},
      {"movedSpecial", flags.moved_special},
  };
}

json move_record_to_json(const MoveRecord& record) {
  json path = json::array();
  for (const int key : record.path_cells) {
    const auto [x, y] = key_cell(key);
    path.push_back({{"x", x}, {"y", y}});
  }
  return {
      {"stage", record.stage},
      {"move", record.move},
      {"blockId", record.block_id},
      {"dir", std::string(1, record.dir)},
      {"amount", record.amount},
      {"type", record.before_type},
      {"before", {
          {"x", record.before_x},
          {"y", record.before_y},
          {"w", record.before_w},
          {"h", record.before_h},
      }},
      {"after", {{"x", record.after_x}, {"y", record.after_y}}},
      {"pathCells", std::move(path)},
  };
}

json level_to_json(const Level& level) {
  json output = {
      {"levelId", level.level_id},
      {"width", level.width},
      {"height", level.height},
      {"exit", {
          {"side", level.exit.side},
          {"x", level.exit.x},
          {"y", level.exit.y},
          {"w", level.exit.w},
          {"h", level.exit.h},
          {"direction", level.exit.direction},
      }},
      {"targetId", level.target_id},
      {"bestSteps", level.best_steps},
      {"stepLimit", level.step_limit},
      {"starRule", {{"three", 0}, {"two", 2}, {"max", 5}}},
      {"blocks", json::array()},
      {"specialCells", json::array()},
      {"designerSolution", level.designer_solution},
  };
  for (const Block& block : level.blocks) output["blocks"].push_back(block_to_json(block));
  for (const SpecialCell& cell : level.special_cells) {
    json item = {{"type", cell.type}, {"x", cell.x}, {"y", cell.y}};
    if (cell.w != 1 || cell.type == "teleport" || cell.type == "coin") item["w"] = cell.w;
    if (cell.h != 1 || cell.type == "teleport" || cell.type == "coin") item["h"] = cell.h;
    if (!cell.portal_id.empty()) item["portalId"] = cell.portal_id;
    if (!cell.pair_id.empty()) item["pairId"] = cell.pair_id;
    if (cell.reward_coins) item["rewardCoins"] = cell.reward_coins;
    output["specialCells"].push_back(std::move(item));
  }
  return output;
}

Level level_from_json(const json& value) {
  Level level;
  level.level_id = value.value("levelId", 0);
  level.width = value.value("width", 8);
  level.height = value.value("height", 8);
  const json& exit = value.at("exit");
  level.exit.side = exit.value("side", "right");
  level.exit.x = exit.value("x", 7);
  level.exit.y = exit.value("y", 3);
  level.exit.w = exit.value("w", 1);
  level.exit.h = exit.value("h", 2);
  level.exit.direction = exit.value("direction", level.exit.side);
  level.target_id = value.value("targetId", "T");
  level.best_steps = value.value("bestSteps", 0);
  level.step_limit = value.value("stepLimit", 0);
  for (const json& item : value.value("blocks", json::array())) {
    Block block;
    block.id = item.value("id", "");
    block.type = item.value("type", "normal");
    block.x = item.value("x", 0);
    block.y = item.value("y", 0);
    block.w = item.value("w", block.type == "target" ? 2 : 1);
    block.h = item.value("h", block.type == "target" ? 2 : 1);
    block.move_dir = item.value("moveDir", "none");
    block.pole = item.value("pole", "");
    block.ice_state = item.value("iceState", "");
    block.linked_ids = item.value("linkedIds", std::vector<std::string>{});
    block.unlock_target_id = item.value("unlockTargetId", "");
    block.unlocked_move_dir = item.value("unlockedMoveDir", "");
    block.lock_id = item.value("lockId", "");
    block.key_id = item.value("keyId", "");
    block.skin_id = item.value("skinId", "");
    block.facing = item.value("facing", "");
    level.blocks.push_back(std::move(block));
  }
  for (const json& item : value.value("specialCells", json::array())) {
    SpecialCell cell;
    cell.type = item.value("type", "");
    cell.x = item.value("x", 0);
    cell.y = item.value("y", 0);
    cell.w = item.value("w", 1);
    cell.h = item.value("h", 1);
    cell.portal_id = item.value("portalId", "");
    cell.pair_id = item.value("pairId", "");
    cell.reward_coins = item.value("rewardCoins", 0);
    level.special_cells.push_back(std::move(cell));
  }
  level.designer_solution = value.value("designerSolution", std::vector<std::string>{});
  style_level(level);
  return level;
}

std::optional<Move> parse_move(const std::string& raw) {
  const size_t colon = raw.find(':');
  if (colon == std::string::npos || colon + 2 >= raw.size()) return std::nullopt;
  Move move;
  move.block_id = raw.substr(0, colon);
  move.dir = raw[colon + 1];
  if (move.dir != 'L' && move.dir != 'R' && move.dir != 'U' && move.dir != 'D') return std::nullopt;
  try {
    move.amount = std::stoi(raw.substr(colon + 2));
  } catch (...) {
    return std::nullopt;
  }
  if (move.amount <= 0 || move.amount > kBoard) return std::nullopt;
  return move;
}

std::string move_text(const Move& move) {
  return move.block_id + ":" + move.dir + std::to_string(move.amount);
}

std::string invert_move(const std::string& raw) {
  const auto move = parse_move(raw);
  if (!move) return raw;
  Move inverse = *move;
  if (inverse.dir == 'L') inverse.dir = 'R';
  else if (inverse.dir == 'R') inverse.dir = 'L';
  else if (inverse.dir == 'U') inverse.dir = 'D';
  else inverse.dir = 'U';
  return move_text(inverse);
}

std::vector<std::string> invert_moves(const std::vector<std::string>& moves) {
  std::vector<std::string> output;
  output.reserve(moves.size());
  for (auto it = moves.rbegin(); it != moves.rend(); ++it) output.push_back(invert_move(*it));
  return output;
}

int cell_key(int x, int y) {
  return y * kBoard + x;
}

std::pair<int, int> key_cell(int key) {
  return {key % kBoard, key / kBoard};
}

std::vector<int> block_cells(const Block& block) {
  std::vector<int> cells;
  for (int yy = 0; yy < block.h; ++yy) {
    for (int xx = 0; xx < block.w; ++xx) cells.push_back(cell_key(block.x + xx, block.y + yy));
  }
  return cells;
}

bool inside(int x, int y, int w, int h) {
  return x >= 0 && y >= 0 && x + w <= kBoard && y + h <= kBoard;
}

bool overlaps(const Block& a, const Block& b) {
  return a.x < b.x + b.w && a.x + a.w > b.x
      && a.y < b.y + b.h && a.y + a.h > b.y;
}

bool touches_or_overlaps(const Block& a, const Block& b) {
  const bool x_touch = a.x <= b.x + b.w && a.x + a.w >= b.x;
  const bool y_overlap = a.y < b.y + b.h && a.y + a.h > b.y;
  const bool y_touch = a.y <= b.y + b.h && a.y + a.h >= b.y;
  const bool x_overlap = a.x < b.x + b.w && a.x + a.w > b.x;
  return overlaps(a, b) || (x_touch && y_overlap) || (y_touch && x_overlap);
}

bool target_inside(int x, int y) {
  return inside(x, y, 2, 2);
}

Block* find_block(Level& level, const std::string& id) {
  for (Block& block : level.blocks) if (block.id == id) return &block;
  return nullptr;
}

const Block* find_block(const Level& level, const std::string& id) {
  for (const Block& block : level.blocks) if (block.id == id) return &block;
  return nullptr;
}

const Block* block_at(const Level& level, int x, int y) {
  for (const Block& block : level.blocks) {
    if (x >= block.x && x < block.x + block.w && y >= block.y && y < block.y + block.h) return &block;
  }
  return nullptr;
}

bool rect_free(
    const Level& level,
    int x,
    int y,
    int w,
    int h,
    const std::unordered_set<std::string>& ignored) {
  if (!inside(x, y, w, h)) return false;
  Block test;
  test.x = x;
  test.y = y;
  test.w = w;
  test.h = h;
  for (const Block& block : level.blocks) {
    if (ignored.contains(block.id)) continue;
    if (overlaps(test, block)) return false;
  }
  return true;
}

int occupied_area(const Level& level) {
  std::set<int> occupied;
  for (const Block& block : level.blocks) {
    for (const int cell : block_cells(block)) occupied.insert(cell);
  }
  return static_cast<int>(occupied.size());
}

int plain_empty_count(const Level& level) {
  std::set<int> occupied;
  for (const Block& block : level.blocks) {
    for (const int cell : block_cells(block)) occupied.insert(cell);
  }
  for (const SpecialCell& special : level.special_cells) {
    if (special.type == "exit") continue;
    Block block;
    block.x = special.x;
    block.y = special.y;
    block.w = special.w;
    block.h = special.h;
    for (const int cell : block_cells(block)) occupied.insert(cell);
  }
  return 64 - static_cast<int>(occupied.size());
}

int fixed_count(const Level& level) {
  return static_cast<int>(std::count_if(level.blocks.begin(), level.blocks.end(), [](const Block& block) {
    return block.type == "fixed";
  }));
}

std::string shape_signature(const Block& block) {
  for (const Shape& shape : kShapes) {
    if (block.w == shape.w && block.h == shape.h && block.move_dir == shape.move_dir) return shape.key;
  }
  return "other";
}

std::unordered_map<std::string, int> shape_counts(const Level& level) {
  std::unordered_map<std::string, int> counts;
  for (const Shape& shape : kShapes) counts[shape.key] = 0;
  for (const Block& block : level.blocks) {
    if (block.type != "normal") continue;
    counts[shape_signature(block)]++;
  }
  return counts;
}

bool shape_distribution_ok(const Level& level) {
  const auto counts = shape_counts(level);
  int min_count = 100;
  int max_count = 0;
  for (const Shape& shape : kShapes) {
    const int count = counts.at(shape.key);
    if (count < 1 || count > 4) return false;
    min_count = std::min(min_count, count);
    max_count = std::max(max_count, count);
  }
  return max_count - min_count <= 1;
}

bool magnet_spread_ok(const Level& level) {
  std::vector<const Block*> magnets;
  for (const Block& block : level.blocks) if (block.type == "magnet") magnets.push_back(&block);
  if (magnets.size() < 2 || magnets.size() > kStage3MaxMagnets) return false;
  int max_distance = 0;
  for (const Block* a : magnets) {
    for (const Block* b : magnets) {
      max_distance = std::max(max_distance, std::abs(a->x - b->x) + std::abs(a->y - b->y));
    }
  }
  return max_distance >= (magnets.size() == 2 ? 2 : 3);
}

bool flags_complete(const Level& level, const Flags& flags) {
  if (!flags.used_ice_damage || !flags.used_magnet || !flags.used_magnet_repel) return false;
  if (std::any_of(level.special_cells.begin(), level.special_cells.end(), [](const SpecialCell& cell) {
        return cell.type == "teleport";
      }) && !flags.used_teleport) {
    return false;
  }
  if (std::any_of(level.blocks.begin(), level.blocks.end(), [](const Block& block) {
        return block.type == "locked" || block.type == "key";
      }) && !flags.used_unlock) {
    return false;
  }
  return true;
}

void style_level(Level& level) {
  for (Block& block : level.blocks) {
    if (block.type == "target") {
      block.w = 2;
      block.h = 2;
      block.move_dir = "both";
      if (block.skin_id.empty()) block.skin_id = "cat_orange";
      if (block.facing.empty()) block.facing = level.exit.direction;
    } else if (block.type == "magnet" || block.type == "key") {
      block.move_dir = "both";
    } else if (block.type == "ice" && block.move_dir.empty()) {
      block.move_dir = "both";
    } else if (block.type == "fixed" || block.type == "locked") {
      block.move_dir = "none";
    }
    if (block.type == "ice" && block.ice_state.empty()) block.ice_state = "intact";
    if (block.type == "magnet" && block.linked_ids.empty()) block.linked_ids = {block.id};
  }
}

std::string next_id(const Level& level, const std::string& prefix) {
  std::unordered_set<std::string> ids;
  for (const Block& block : level.blocks) ids.insert(block.id);
  for (int i = 1; i < 10000; ++i) {
    const std::string id = prefix + std::to_string(i);
    if (!ids.contains(id)) return id;
  }
  throw std::runtime_error("id exhaustion");
}

void save_backup(StageContext& ctx, const std::string& label) {
  ctx.backups.erase(
      std::remove_if(ctx.backups.begin(), ctx.backups.end(), [&](const auto& entry) {
        return entry.first == label;
      }),
      ctx.backups.end());
  ctx.backups.emplace_back(label, ctx.level);
  write_stage_snapshot(ctx, label);
}

bool restore_backup(StageContext& ctx, const std::string& label) {
  for (auto it = ctx.backups.rbegin(); it != ctx.backups.rend(); ++it) {
    if (it->first == label) {
      ctx.level = it->second;
      return true;
    }
  }
  return false;
}

bool write_stage_snapshot(const StageContext& ctx, const std::string& label) {
  if (ctx.snapshot_dir.empty()) return true;
  std::error_code error;
  std::filesystem::create_directories(ctx.snapshot_dir, error);
  if (error) return false;
  std::ofstream output(ctx.snapshot_dir / (label + ".json"), std::ios::binary);
  if (!output) return false;
  json snapshot = {
      {"level", level_to_json(ctx.level)},
      {"records", ctx.records},
      {"seed", ctx.seed},
      {"attempt", ctx.attempt},
  };
  output << std::setw(2) << snapshot << '\n';
  return static_cast<bool>(output);
}

int random_int(std::mt19937_64& rng, int min_value, int max_value) {
  std::uniform_int_distribution<int> distribution(min_value, max_value);
  return distribution(rng);
}

bool random_chance(std::mt19937_64& rng, double chance) {
  std::bernoulli_distribution distribution(chance);
  return distribution(rng);
}

Exit random_exit(std::mt19937_64& rng) {
  static const std::array<std::string, 4> sides = {"right", "bottom", "left", "top"};
  Exit exit;
  exit.side = sides[random_int(rng, 0, 3)];
  if (exit.side == "right" || exit.side == "left") {
    exit.y = random_int(rng, 1, 5);
    exit.x = exit.side == "right" ? 7 : 0;
    exit.w = 1;
    exit.h = 2;
    exit.direction = exit.side;
  } else {
    exit.x = random_int(rng, 1, 5);
    exit.y = exit.side == "bottom" ? 7 : 0;
    exit.w = 2;
    exit.h = 1;
    exit.direction = exit.side == "bottom" ? "down" : "up";
  }
  return exit;
}

std::pair<int, int> solved_target(const Exit& exit) {
  if (exit.side == "right") return {6, exit.y};
  if (exit.side == "left") return {0, exit.y};
  if (exit.side == "bottom") return {exit.x, 6};
  return {exit.x, 0};
}

char primary_dir(const Exit& exit) {
  if (exit.side == "right") return 'R';
  if (exit.side == "left") return 'L';
  if (exit.side == "bottom") return 'D';
  return 'U';
}

char away_dir(const Exit& exit) {
  const char dir = primary_dir(exit);
  if (dir == 'R') return 'L';
  if (dir == 'L') return 'R';
  if (dir == 'D') return 'U';
  return 'D';
}

std::pair<int, int> moved_position(int x, int y, char dir, int amount) {
  if (dir == 'L') x -= amount;
  else if (dir == 'R') x += amount;
  else if (dir == 'U') y -= amount;
  else y += amount;
  return {x, y};
}

int distance_from_solved(int x, int y, int solved_x, int solved_y) {
  return std::abs(x - solved_x) + std::abs(y - solved_y);
}

bool target_aligned_with_exit(const Exit& exit, const Block& target) {
  if (exit.side == "right" || exit.side == "left") return target.y == exit.y;
  return target.x == exit.x;
}

bool apply_simple_move(Level& level, const std::string& raw, MoveRecord* record) {
  const auto move = parse_move(raw);
  if (!move) return false;
  Block* block = find_block(level, move->block_id);
  if (!block) return false;
  if (block->type == "fixed" || block->type == "locked" || block->move_dir == "none") return false;
  const bool horizontal = move->dir == 'L' || move->dir == 'R';
  if (block->type == "normal") {
    if (block->move_dir == "horizontal" && !horizontal) return false;
    if (block->move_dir == "vertical" && horizontal) return false;
  }
  int current_x = block->x;
  int current_y = block->y;
  for (int step = 1; step <= move->amount; ++step) {
    const auto [next_x, next_y] = moved_position(current_x, current_y, move->dir, 1);
    if (!rect_free(level, next_x, next_y, block->w, block->h, {block->id})) return false;
    current_x = next_x;
    current_y = next_y;
  }
  if (record) {
    record->move = raw;
    record->block_id = block->id;
    record->dir = move->dir;
    record->amount = move->amount;
    record->before_x = block->x;
    record->before_y = block->y;
    record->before_w = block->w;
    record->before_h = block->h;
    record->before_type = block->type;
    for (int step = 1; step <= move->amount; ++step) {
      const auto [step_x, step_y] = moved_position(block->x, block->y, move->dir, step);
      Block moved = *block;
      moved.x = step_x;
      moved.y = step_y;
      const auto cells = block_cells(moved);
      record->path_cells.insert(record->path_cells.end(), cells.begin(), cells.end());
    }
    std::sort(record->path_cells.begin(), record->path_cells.end());
    record->path_cells.erase(
        std::unique(record->path_cells.begin(), record->path_cells.end()),
        record->path_cells.end());
    record->after_x = current_x;
    record->after_y = current_y;
  }
  block->x = current_x;
  block->y = current_y;
  return true;
}

std::vector<std::string> legal_simple_moves(
    const Level& level,
    const std::unordered_set<std::string>& ids) {
  std::vector<std::string> output;
  static const std::array<char, 4> dirs = {'L', 'R', 'U', 'D'};
  for (const Block& block : level.blocks) {
    if (!ids.empty() && !ids.contains(block.id)) continue;
    if (block.type == "fixed" || block.type == "locked" || block.move_dir == "none") continue;
    for (const char dir : dirs) {
      const bool horizontal = dir == 'L' || dir == 'R';
      if (block.type == "normal") {
        if (block.move_dir == "horizontal" && !horizontal) continue;
        if (block.move_dir == "vertical" && horizontal) continue;
      }
      for (int amount = 1; amount <= kBoard; ++amount) {
        Level test = level;
        const std::string raw = block.id + ":" + dir + std::to_string(amount);
        if (!apply_simple_move(test, raw)) break;
        output.push_back(raw);
      }
    }
  }
  return output;
}

std::set<int> collect_solution_path_cells(
    const Level& level,
    const std::vector<std::string>& solution) {
  Level current = level;
  std::set<int> cells;
  for (const std::string& raw : solution) {
    const auto parsed = parse_move(raw);
    const Block* before = parsed ? find_block(current, parsed->block_id) : nullptr;
    if (before) {
      const auto before_cells = block_cells(*before);
      cells.insert(before_cells.begin(), before_cells.end());
    }
    MoveRecord record;
    if (!apply_simple_move(current, raw, &record)) continue;
    cells.insert(record.path_cells.begin(), record.path_cells.end());
  }
  return cells;
}

bool trim_or_remove_normal(
    Level& level,
    int x,
    int y,
    const std::unordered_set<std::string>& protected_ids,
    bool preserve_shapes) {
  auto found = std::find_if(level.blocks.begin(), level.blocks.end(), [&](const Block& block) {
    return x >= block.x && x < block.x + block.w && y >= block.y && y < block.y + block.h;
  });
  if (found == level.blocks.end()) return true;
  if (found->type != "normal" || protected_ids.contains(found->id)) return false;
  const auto before = level.blocks;
  Block block = *found;
  const auto erase_index = static_cast<size_t>(std::distance(level.blocks.begin(), found));
  if (block.w == 1 && block.h == 1) {
    level.blocks.erase(level.blocks.begin() + static_cast<std::ptrdiff_t>(erase_index));
  } else if (block.w > 1 && block.h == 1) {
    if (x == block.x) {
      level.blocks[erase_index].x++;
      level.blocks[erase_index].w--;
    } else if (x == block.x + block.w - 1) {
      level.blocks[erase_index].w--;
    } else {
      return false;
    }
  } else if (block.h > 1 && block.w == 1) {
    if (y == block.y) {
      level.blocks[erase_index].y++;
      level.blocks[erase_index].h--;
    } else if (y == block.y + block.h - 1) {
      level.blocks[erase_index].h--;
    } else {
      return false;
    }
  } else {
    return false;
  }
  if (preserve_shapes && !shape_distribution_ok(level)) {
    level.blocks = before;
    return false;
  }
  return true;
}

bool is_portal_level(int level_id) {
  static const std::unordered_set<int> levels = {
      73, 79, 85, 91, 97, 103, 109, 115, 121, 127, 133, 139, 145, 151, 157};
  return levels.contains(level_id);
}

bool is_lock_level(int level_id) {
  static const std::unordered_set<int> levels = {
      100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 160};
  return levels.contains(level_id);
}

bool portal_cells_clear(const Level& level, const std::vector<Block>& blocks) {
  for (const SpecialCell& cell : level.special_cells) {
    if (cell.type != "teleport") continue;
    Block portal;
    portal.x = cell.x;
    portal.y = cell.y;
    portal.w = cell.w;
    portal.h = cell.h;
    for (const Block& block : blocks) {
      if (overlaps(portal, block)) return false;
    }
  }
  return true;
}

bool solution_uses_portal_long_chain(
    const Level& level,
    const std::vector<std::string>& solution,
    SolverEngine& solver) {
  SolverOptions options;
  SolverResult full = solver.replay(level, solution, options);
  if (!full.replay_ok || !full.flags.used_teleport || !portal_cells_clear(level, full.final_blocks)) return false;
  int first_portal = -1;
  int target_after = 0;
  int normal_after = 0;
  for (size_t i = 0; i < solution.size(); ++i) {
    std::vector<std::string> prefix(solution.begin(), solution.begin() + static_cast<std::ptrdiff_t>(i + 1));
    SolverResult replay = solver.replay(level, prefix, options);
    if (!replay.replay_ok) return false;
    if (first_portal < 0 && replay.flags.used_teleport) first_portal = static_cast<int>(i);
    if (first_portal >= 0) {
      const auto move = parse_move(solution[i]);
      const Block* initial = move ? find_block(level, move->block_id) : nullptr;
      if (move && move->block_id == level.target_id) target_after++;
      else if (initial && initial->type == "normal") normal_after++;
    }
  }
  return first_portal >= 0 && target_after >= 2 && normal_after <= 3;
}

}  // namespace escape
