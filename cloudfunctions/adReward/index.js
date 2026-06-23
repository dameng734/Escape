const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const COLLECTIONS = {
  users: 'users',
  dailyAdCounter: 'user_daily_ad_counter',
};

const GAMEPLAY_REWARDED_TYPES = new Set(['addSteps', 'coinDouble']);
const GAMEPLAY_REWARDED_LIMIT = 10;
const LIMIT_MESSAGE = '今日激励广告次数已达上限，明天再来领取吧';

const AD_LIMIT_BY_RISK_LEVEL = {
  0: 12,
  1: 10,
  2: 6,
  3: 3,
  4: 0,
};

function nowInChinaDateKey(now = Date.now()) {
  const date = new Date(now + 8 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function normalizeRiskLevel(value) {
  const level = Number(value);
  return Number.isFinite(level) ? Math.max(0, Math.min(4, Math.floor(level))) : 0;
}

function cleanKey(value, fallback = 'rewarded') {
  return String(value || fallback).replace(/[^\w-]/g, '_').slice(0, 48) || fallback;
}

function quotaFor(adType, riskLevel) {
  if (GAMEPLAY_REWARDED_TYPES.has(adType)) {
    return {
      quotaKey: 'gameplay_rewarded',
      dailyLimit: GAMEPLAY_REWARDED_LIMIT,
      limitedTypes: [...GAMEPLAY_REWARDED_TYPES],
    };
  }
  return {
    quotaKey: cleanKey(adType),
    dailyLimit: AD_LIMIT_BY_RISK_LEVEL[riskLevel] ?? 0,
    limitedTypes: [adType],
  };
}

async function safeGet(collection, id) {
  try {
    const res = await db.collection(collection).doc(id).get();
    return res.data || null;
  } catch (error) {
    return null;
  }
}

async function ensureCounter(openid, adDate, quota, riskLevel, now) {
  const id = `${openid}_${adDate}_${quota.quotaKey}`;
  const existed = await safeGet(COLLECTIONS.dailyAdCounter, id);
  if (existed) return { id, data: existed };

  const data = {
    user_id: openid,
    openid,
    ad_date: adDate,
    quota_key: quota.quotaKey,
    limited_ad_types: quota.limitedTypes,
    risk_level: riskLevel,
    daily_limit: quota.dailyLimit,
    watched_count: 0,
    reward_count: 0,
    type_counts: {},
    created_at: now,
    updated_at: now,
  };
  try {
    await db.collection(COLLECTIONS.dailyAdCounter).doc(id).set({ data });
  } catch (error) {
    // Concurrent requests may create the same counter; read it back below.
  }
  return { id, data: await safeGet(COLLECTIONS.dailyAdCounter, id) || data };
}

async function userRisk(openid) {
  const user = await safeGet(COLLECTIONS.users, openid);
  const riskLevel = normalizeRiskLevel(user?.risk_level);
  return { user, riskLevel };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = Date.now();
  const adDate = nowInChinaDateKey(now);
  const action = event.action || 'canWatch';
  const adType = cleanKey(event.adType || 'rewarded');
  const scene = cleanKey(event.scene || adType);
  const rewardType = cleanKey(event.rewardType || adType);
  const rewardAmount = Number(event.rewardAmount) || 0;
  const { riskLevel } = await userRisk(openid);
  const quota = quotaFor(adType, riskLevel);
  const counter = await ensureCounter(openid, adDate, quota, riskLevel, now);
  const watchedCount = Number(counter.data.watched_count) || 0;
  const allowed = watchedCount < quota.dailyLimit;

  if (action === 'finish') {
    if (!allowed) {
      return {
        allowed: false,
        finished: false,
        message: LIMIT_MESSAGE,
        riskLevel,
        dailyLimit: quota.dailyLimit,
        watchedCount,
        remaining: 0,
        quotaKey: quota.quotaKey,
        adDate,
      };
    }

    const updateData = {
      watched_count: _.inc(1),
      reward_count: _.inc(1),
      last_watch_at: now,
      last_ad_type: adType,
      last_scene: scene,
      last_reward_type: rewardType,
      last_reward_amount: rewardAmount,
      risk_level: riskLevel,
      daily_limit: quota.dailyLimit,
      updated_at: now,
    };
    updateData[`type_counts.${adType}`] = _.inc(1);

    const res = await db.collection(COLLECTIONS.dailyAdCounter)
      .where({
        _id: counter.id,
        watched_count: _.lt(quota.dailyLimit),
      })
      .update({ data: updateData });

    if (!res.stats?.updated) {
      const latest = await safeGet(COLLECTIONS.dailyAdCounter, counter.id);
      const latestCount = Number(latest?.watched_count) || watchedCount;
      return {
        allowed: false,
        finished: false,
        message: LIMIT_MESSAGE,
        riskLevel,
        dailyLimit: quota.dailyLimit,
        watchedCount: latestCount,
        remaining: Math.max(0, quota.dailyLimit - latestCount),
        quotaKey: quota.quotaKey,
        adDate,
      };
    }

    return {
      allowed: true,
      finished: true,
      riskLevel,
      dailyLimit: quota.dailyLimit,
      watchedCount: watchedCount + 1,
      remaining: Math.max(0, quota.dailyLimit - watchedCount - 1),
      quotaKey: quota.quotaKey,
      adDate,
    };
  }

  return {
    allowed,
    message: allowed ? '' : LIMIT_MESSAGE,
    riskLevel,
    dailyLimit: quota.dailyLimit,
    watchedCount,
    remaining: Math.max(0, quota.dailyLimit - watchedCount),
    quotaKey: quota.quotaKey,
    adDate,
  };
};
