#pragma once

#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <filesystem>
#include <memory>
#include <mutex>
#include <optional>
#include <random>
#include <set>
#include <string>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

#include "third_party/json.hpp"

namespace escape {

using json = nlohmann::json;

constexpr int kBoard = 8;
constexpr int kMinBest = 12;
constexpr int kMaxBest = 32;
constexpr int kMaxFixed = 6;
constexpr int kMaxEmpty = 8;
constexpr int kStage1MinEmpty = 8;
constexpr int kStage1MaxEmpty = 10;
constexpr int kStage2MinTargetMoves = 4;
constexpr int kStage2MaxTargetMoves = 6;
constexpr int kStage2MaxNormalMoves = 9;
constexpr int kStage3MaxIce = 3;
constexpr int kStage3MinMagnets = 2;
constexpr int kStage3MaxMagnets = 4;
constexpr int kMaxBlocks = 48;

struct Block {
  std::string id;
  std::string type = "normal";
  int x = 0;
  int y = 0;
  int w = 1;
  int h = 1;
  std::string move_dir = "none";
  std::string pole;
  std::string ice_state;
  std::vector<std::string> linked_ids;
  std::string unlock_target_id;
  std::string unlocked_move_dir;
  std::string lock_id;
  std::string key_id;
  std::string skin_id;
  std::string facing;
};

struct SpecialCell {
  std::string type;
  int x = 0;
  int y = 0;
  int w = 1;
  int h = 1;
  std::string portal_id;
  std::string pair_id;
  int reward_coins = 0;
};

struct Exit {
  std::string side;
  int x = 0;
  int y = 0;
  int w = 1;
  int h = 1;
  std::string direction;
};

struct Level {
  int level_id = 0;
  int width = 8;
  int height = 8;
  Exit exit;
  std::string target_id = "T";
  int best_steps = 0;
  int step_limit = 0;
  std::vector<Block> blocks;
  std::vector<SpecialCell> special_cells;
  std::vector<std::string> designer_solution;
};

struct Move {
  std::string block_id;
  char dir = 'L';
  int amount = 1;
};

struct MoveRecord {
  std::string stage;
  std::string move;
  std::string block_id;
  char dir = 'L';
  int amount = 1;
  int before_x = 0;
  int before_y = 0;
  int after_x = 0;
  int after_y = 0;
  int before_w = 1;
  int before_h = 1;
  std::string before_type;
  std::vector<int> path_cells;
};

struct Flags {
  bool used_teleport = false;
  bool used_unlock = false;
  bool used_ice_damage = false;
  bool used_magnet = false;
  bool used_magnet_attract = false;
  bool used_magnet_repel = false;
  bool moved_special = false;
};

struct SolverOptions {
  int max_depth = kMaxBest;
  std::uint64_t max_nodes = 300'000'000;
  std::uint64_t deadline_ms = 900'000;
  int threads = 0;
  bool exhaustive = false;
  bool disable_magnet = false;
  bool disable_attract = false;
  bool disable_repel = false;
  bool disable_ice_damage = false;
  bool disable_teleport = false;
  bool disable_unlock = false;
  bool require_ice_damage = false;
  bool require_magnet = false;
  bool require_magnet_attract = false;
  bool require_magnet_repel = false;
  bool require_teleport = false;
  bool require_unlock = false;
  bool require_portals_clear = false;
  bool mechanism_route_search = false;
  bool find_any = false;
  std::vector<std::string> preferred_moves;
};

struct SolverResult {
  bool solved = false;
  bool limited = false;
  bool replay_ok = false;
  std::uint64_t expanded = 0;
  std::uint64_t time_ms = 0;
  int depth = -1;
  int proven_depth = -1;
  Flags flags;
  std::vector<std::string> path;
  std::vector<Block> final_blocks;
  std::string error;
};

struct Shape {
  std::string key;
  int w;
  int h;
  std::string move_dir;
};

struct RouteStep {
  char dir = 'L';
  int from_x = 0;
  int from_y = 0;
  int to_x = 0;
  int to_y = 0;
};

struct StageContext {
  int level_id = 0;
  int attempt = 0;
  std::uint64_t seed = 0;
  std::mt19937_64 rng;
  Level level;
  json records = json::object();
  std::vector<std::pair<std::string, Level>> backups;
  std::vector<RouteStep> target_route;
  std::set<int> mechanism_reserved;
  std::unordered_set<std::string> magnet_placeholder_ids;
  std::vector<std::string> magnet_placeholder_wiggles;
  std::vector<std::string> reverse_moves;
  std::vector<MoveRecord> move_records;
  std::filesystem::path snapshot_dir;
  // Set by the orchestrator only when an already accepted prefix needs a
  // different legal magnet count to satisfy the cross-level diversity rule.
  // This constrains a single scalar; placement, poles, route and solution stay
  // independently randomized and fully verified.
  int required_magnet_count = 0;
  int required_target_move_count = 0;
  std::string required_exit_side;
};

extern const std::array<Shape, 8> kShapes;

class SolverEngine {
 public:
  SolverEngine();
  ~SolverEngine();
  SolverEngine(const SolverEngine&) = delete;
  SolverEngine& operator=(const SolverEngine&) = delete;

  SolverResult solve(const Level& level, const SolverOptions& options = {});
  SolverResult replay(
      const Level& level,
      const std::vector<std::string>& moves,
      const SolverOptions& options = {});
  SolverResult weave_required_sequence(
      const Level& level,
      const std::vector<std::string>& required_moves,
      const std::vector<std::string>& seed_moves,
      int max_support_normal_moves,
      int max_total_moves,
      const SolverOptions& required_flags);
  SolverResult weave_required_sequence_multi(
      const Level& level,
      const std::vector<std::string>& required_moves,
      const std::vector<std::vector<std::string>>& seed_moves,
      int max_support_normal_moves,
      int max_total_moves,
      const SolverOptions& required_flags);
  void clear_cache();
  void flush_cache();
  json cache_stats() const;

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

json level_to_json(const Level& level);
Level level_from_json(const json& value);
json flags_to_json(const Flags& flags);
json move_record_to_json(const MoveRecord& record);

std::optional<Move> parse_move(const std::string& raw);
std::string move_text(const Move& move);
std::string invert_move(const std::string& raw);
std::vector<std::string> invert_moves(const std::vector<std::string>& moves);

int cell_key(int x, int y);
std::pair<int, int> key_cell(int key);
std::vector<int> block_cells(const Block& block);
bool inside(int x, int y, int w = 1, int h = 1);
bool overlaps(const Block& a, const Block& b);
bool touches_or_overlaps(const Block& a, const Block& b);
bool target_inside(int x, int y);
Block* find_block(Level& level, const std::string& id);
const Block* find_block(const Level& level, const std::string& id);
const Block* block_at(const Level& level, int x, int y);
bool rect_free(
    const Level& level,
    int x,
    int y,
    int w,
    int h,
    const std::unordered_set<std::string>& ignored = {});
int occupied_area(const Level& level);
int plain_empty_count(const Level& level);
int fixed_count(const Level& level);
std::unordered_map<std::string, int> shape_counts(const Level& level);
std::string shape_signature(const Block& block);
bool shape_distribution_ok(const Level& level);
bool magnet_spread_ok(const Level& level);
bool flags_complete(const Level& level, const Flags& flags);
void style_level(Level& level);
std::string next_id(const Level& level, const std::string& prefix);
void save_backup(StageContext& ctx, const std::string& label);
bool restore_backup(StageContext& ctx, const std::string& label);
bool write_stage_snapshot(const StageContext& ctx, const std::string& label);

Exit random_exit(std::mt19937_64& rng);
std::pair<int, int> solved_target(const Exit& exit);
char primary_dir(const Exit& exit);
char away_dir(const Exit& exit);
std::pair<int, int> moved_position(int x, int y, char dir, int amount = 1);
int distance_from_solved(int x, int y, int solved_x, int solved_y);
bool target_aligned_with_exit(const Exit& exit, const Block& target);

bool apply_simple_move(Level& level, const std::string& raw, MoveRecord* record = nullptr);
std::vector<std::string> legal_simple_moves(
    const Level& level,
    const std::unordered_set<std::string>& ids = {});
std::set<int> collect_solution_path_cells(
    const Level& level,
    const std::vector<std::string>& solution);

bool trim_or_remove_normal(
    Level& level,
    int x,
    int y,
    const std::unordered_set<std::string>& protected_ids,
    bool preserve_shapes);

bool is_portal_level(int level_id);
bool is_lock_level(int level_id);
bool portal_cells_clear(const Level& level, const std::vector<Block>& blocks);
bool solution_uses_portal_long_chain(
    const Level& level,
    const std::vector<std::string>& solution,
    SolverEngine& solver);

bool stage01_random_board(StageContext& ctx, SolverEngine& solver);
bool stage02_reverse_walk(StageContext& ctx, SolverEngine& solver);
bool stage03_magnets_ice(StageContext& ctx, SolverEngine& solver);
bool stage04_verify_special_replay(StageContext& ctx, SolverEngine& solver);
bool stage05_portals(StageContext& ctx, SolverEngine& solver);
bool stage06_lock_key(StageContext& ctx, SolverEngine& solver);
bool stage07_final_audit_fill(StageContext& ctx, SolverEngine& solver);
bool stage08_orchestrate(
    int from,
    int to,
    const std::filesystem::path& levels_file,
    const std::filesystem::path& data_file,
    const std::filesystem::path& report_file,
    SolverEngine& solver,
    int max_attempts,
    std::uint64_t base_seed);

bool validate_final_level(
    const Level& level,
    SolverEngine& solver,
    json& audit,
    std::string& failure);

int random_int(std::mt19937_64& rng, int min_value, int max_value);
bool random_chance(std::mt19937_64& rng, double chance);
template <class T>
void shuffle(std::mt19937_64& rng, std::vector<T>& values) {
  std::shuffle(values.begin(), values.end(), rng);
}

}  // namespace escape
