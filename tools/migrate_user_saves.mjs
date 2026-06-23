import fs from 'node:fs';
import path from 'node:path';

const input = process.argv[2] || 'C:/Users/73408/Desktop/database_export-HHCxavHvc_d5.json';
const outDir = process.argv[3] || path.resolve('tools/migration-output');

const AD_LIMIT_BY_RISK_LEVEL = {
  0: 12,
  1: 10,
  2: 6,
  3: 3,
  4: 0,
};

function parseExport(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }
}

function dateKeyFromMs(ms) {
  if (!ms) return '';
  const date = new Date(Number(ms) + 8 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function intOrZero(value) {
  return Math.floor(numberOrZero(value));
}

function normalizeRiskLevel(value) {
  return Math.max(0, Math.min(4, intOrZero(value)));
}

function uniqueList(values, fallback) {
  return Array.from(new Set([...(fallback || []), ...(Array.isArray(values) ? values : [])].filter(Boolean)));
}

function normalizeLevelProgress(levelProgress = {}) {
  const out = {};
  Object.entries(levelProgress || {}).forEach(([levelId, progress]) => {
    out[String(levelId)] = {
      passed: !!progress?.passed,
      stars: numberOrZero(progress?.stars),
      bestSteps: numberOrZero(progress?.bestSteps),
    };
  });
  return out;
}

function writeJsonl(fileName, rows) {
  const fullPath = path.join(outDir, fileName);
  fs.writeFileSync(fullPath, rows.map((row) => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
}

const raw = fs.readFileSync(input, 'utf8');
const docs = parseExport(raw);
const now = Date.now();

const users = [];
const gameStates = [];
const dailyLogins = [];
const dailyAdCounters = [];
const userSkins = [];

let levelProgressItems = 0;

for (const doc of docs) {
  const openid = doc._openid || doc.userId || doc._id;
  if (!openid) continue;

  const save = doc.save || {};
  const createdAt = numberOrZero(doc.createdAt) || now;
  const updatedAt = numberOrZero(save.updatedAt || doc.clientUpdatedAt || doc.updatedAt) || createdAt;
  const lastLoginDate = dateKeyFromMs(updatedAt);
  const riskLevel = normalizeRiskLevel(doc.risk_level);
  const adDay = save.rewardedAds?.shopCoinsDay || lastLoginDate;
  const watchedToday = numberOrZero(save.rewardedAds?.shopCoinsToday);
  const ownedCharacterSkins = uniqueList(save.ownedCharacterSkins, ['cat_orange']);
  const ownedThemes = uniqueList(save.ownedThemes, ['theme_default']);
  const levelProgress = normalizeLevelProgress(save.levelProgress || {});
  levelProgressItems += Object.keys(levelProgress).length;

  users.push({
    _id: openid,
    user_id: openid,
    openid,
    unionid: doc.unionid || '',
    appid: doc.appid || '',
    profile: doc.profile || {},
    device: doc.device || {},
    risk_level: riskLevel,
    risk_source: doc.risk_source || 'migration_default',
    risk_updated_at: updatedAt,
    first_login_at: createdAt,
    last_login_at: updatedAt,
    last_login_date: lastLoginDate,
    login_days: intOrZero(doc.login_days),
    continuous_login_days: intOrZero(doc.continuous_login_days),
    status: doc.status || 1,
    legacy_save_doc_id: doc._id || '',
    created_at: createdAt,
    updated_at: updatedAt,
  });

  gameStates.push({
    _id: openid,
    user_id: openid,
    openid,
    coins: numberOrZero(save.coins),
    highest_unlocked_level: Math.max(1, intOrZero(save.highestUnlockedLevel) || 1),
    current_theme: save.currentTheme || 'theme_default',
    owned_themes: ownedThemes,
    current_character_skin: ownedCharacterSkins.includes(save.currentCharacterSkin) ? save.currentCharacterSkin : 'cat_orange',
    owned_character_skins: ownedCharacterSkins,
    items: save.items || {},
    ad_progress: save.adProgress || {},
    rewarded_ads_snapshot: save.rewardedAds || {},
    level_progress: levelProgress,
    legacy_save_snapshot: save,
    save_version: intOrZero(save.version || doc.version),
    legacy_save_doc_id: doc._id || '',
    created_at: createdAt,
    updated_at: updatedAt,
  });

  if (lastLoginDate) {
    dailyLogins.push({
      _id: `${openid}_${lastLoginDate}`,
      user_id: openid,
      openid,
      login_date: lastLoginDate,
      first_login_at: updatedAt,
      login_count: 1,
      source: 'migration_snapshot',
      created_at: updatedAt,
      updated_at: updatedAt,
    });
  }

  if (adDay) {
    dailyAdCounters.push({
      _id: `${openid}_${adDay}`,
      user_id: openid,
      openid,
      ad_date: adDay,
      risk_level: riskLevel,
      daily_limit: AD_LIMIT_BY_RISK_LEVEL[riskLevel] ?? 0,
      watched_count: watchedToday,
      reward_count: watchedToday,
      last_watch_at: watchedToday > 0 ? updatedAt : 0,
      legacy_total_count: numberOrZero(save.rewardedAds?.shopCoinsTotal),
      created_at: updatedAt,
      updated_at: updatedAt,
    });
  }

  ownedCharacterSkins.forEach((skinId) => {
    userSkins.push({
      _id: `${openid}_${skinId}`,
      user_id: openid,
      openid,
      skin_id: skinId,
      skin_name: skinId,
      source: 'migration',
      obtained_at: createdAt,
      created_at: createdAt,
    });
  });
}

const skinRewardConfig = [
  {
    _id: 'login_days_5_dog_tan',
    reward_type: 'login_days',
    required_days: 5,
    skin_id: 'dog_tan',
    skin_name: 'dog_tan',
    enabled: true,
    created_at: now,
    updated_at: now,
  },
];

fs.mkdirSync(outDir, { recursive: true });
[
  'users.jsonl',
  'user_game_state.jsonl',
  'user_daily_login.jsonl',
  'user_daily_ad_counter.jsonl',
  'user_skin.jsonl',
  'skin_reward_config.jsonl',
  'summary.json',
].forEach((fileName) => {
  fs.rmSync(path.join(outDir, fileName), { force: true });
});
writeJsonl('users.jsonl', users);
writeJsonl('user_game_state.jsonl', gameStates);
writeJsonl('user_daily_login.jsonl', dailyLogins);
writeJsonl('user_daily_ad_counter.jsonl', dailyAdCounters);
writeJsonl('user_skin.jsonl', userSkins);
writeJsonl('skin_reward_config.jsonl', skinRewardConfig);

const summary = {
  input,
  outDir,
  sourceDocs: docs.length,
  users: users.length,
  userGameStates: gameStates.length,
  userDailyLogins: dailyLogins.length,
  userDailyAdCounters: dailyAdCounters.length,
  userSkins: userSkins.length,
  skinRewardConfigs: skinRewardConfig.length,
  levelProgressItemsInGameState: levelProgressItems,
  generatedAt: now,
};
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
console.log(JSON.stringify(summary, null, 2));
