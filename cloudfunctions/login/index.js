const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

const COLLECTIONS = {
  users: 'users',
  dailyLogin: 'user_daily_login',
  skinRewardConfig: 'skin_reward_config',
  userSkin: 'user_skin',
  adminUsers: 'admin_users',
};

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

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeRiskLevel(value) {
  const level = Number(value);
  return Number.isFinite(level) ? Math.max(0, Math.min(4, Math.floor(level))) : 0;
}

function normalizeProfile(profile = {}) {
  return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
}

function hasProfileValue(profile = {}) {
  return !!(profile.nickName || profile.nickname || profile.avatarUrl);
}

function profileNickname(profile = {}) {
  return String(profile.nickName || profile.nickname || '').trim();
}

async function getUserRiskLevel(openid) {
  // TODO: 接入你的信用等级接口后，在这里用服务端密钥请求接口。
  // 当前默认 0，保证迁移上线后不影响真实用户。
  return { level: 0, source: 'default' };
}

async function isSuperAdmin(openid) {
  try {
    const res = await db.collection(COLLECTIONS.adminUsers)
      .where({
        openid,
        enabled: true,
      })
      .limit(1)
      .get();
    return !!res.data?.length;
  } catch (error) {
    return false;
  }
}

async function safeGet(collection, id) {
  try {
    const res = await db.collection(collection).doc(id).get();
    return res.data || null;
  } catch (error) {
    return null;
  }
}

async function safeAdd(collection, data) {
  try {
    await db.collection(collection).add({ data });
    return true;
  } catch (error) {
    return false;
  }
}

async function grantLoginSkins(openid, loginDays, continuousLoginDays, now) {
  let configs = [];
  try {
    const res = await db.collection(COLLECTIONS.skinRewardConfig)
      .where({
        enabled: true,
        reward_type: _.in(['login_days', 'continuous_login_days']),
      })
      .limit(100)
      .get();
    configs = res.data || [];
  } catch (error) {
    configs = [];
  }

  const granted = [];
  for (const config of configs) {
    const requiredDays = Number(config.required_days) || 0;
    const matched = config.reward_type === 'continuous_login_days'
      ? continuousLoginDays >= requiredDays
      : loginDays >= requiredDays;
    if (!matched || !config.skin_id) continue;

    const id = `${openid}_${config.skin_id}`;
    const existed = await safeGet(COLLECTIONS.userSkin, id);
    if (existed) continue;

    try {
      await db.collection(COLLECTIONS.userSkin).doc(id).set({
        data: {
          user_id: openid,
          openid,
          skin_id: config.skin_id,
          skin_name: config.skin_name || '',
          source: 'login_reward',
          reason: `${config.reward_type}_${requiredDays}`,
          obtained_at: now,
          created_at: now,
        },
      });
      granted.push(config.skin_id);
    } catch (error) {
      // 并发重复发放时忽略，唯一 doc id 会兜住。
    }
  }
  return granted;
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = Date.now();
  const loginDate = nowInChinaDateKey(now);
  const risk = await getUserRiskLevel(openid);
  const riskLevel = normalizeRiskLevel(risk.level);
  const dailyAdLimit = AD_LIMIT_BY_RISK_LEVEL[riskLevel] ?? 0;
  const superAdmin = await isSuperAdmin(openid);

  const userDoc = await safeGet(COLLECTIONS.users, openid);
  const dailyLoginId = `${openid}_${loginDate}`;
  const dailyDoc = await safeGet(COLLECTIONS.dailyLogin, dailyLoginId);
  const firstLoginToday = !dailyDoc;

  if (firstLoginToday) {
    await db.collection(COLLECTIONS.dailyLogin).doc(dailyLoginId).set({
      data: {
        user_id: openid,
        openid,
        login_date: loginDate,
        first_login_at: now,
        login_count: 1,
        created_at: now,
        updated_at: now,
      },
    });
  } else {
    await db.collection(COLLECTIONS.dailyLogin).doc(dailyLoginId).update({
      data: {
        login_count: _.inc(1),
        updated_at: now,
      },
    });
  }

  const previousLoginDate = userDoc?.last_login_date || '';
  const oldLoginDays = Number(userDoc?.login_days) || 0;
  const oldContinuousDays = Number(userDoc?.continuous_login_days) || 0;
  const nextLoginDays = oldLoginDays + (firstLoginToday ? 1 : 0);
  const nextContinuousDays = firstLoginToday
    ? (previousLoginDate && addDays(previousLoginDate, 1) === loginDate ? oldContinuousDays + 1 : 1)
    : Math.max(1, oldContinuousDays);
  const incomingProfile = normalizeProfile(event.profile);
  const storedProfile = normalizeProfile(userDoc?.profile);
  const profile = hasProfileValue(incomingProfile) ? incomingProfile : storedProfile;
  const nickname = profileNickname(profile);

  const userPayload = {
    openid,
    unionid: wxContext.UNIONID || '',
    appid: wxContext.APPID || '',
    risk_level: riskLevel,
    risk_source: risk.source || '',
    risk_updated_at: now,
    last_login_at: now,
    last_login_date: loginDate,
    login_days: nextLoginDays,
    continuous_login_days: nextContinuousDays,
    nickname,
    profile,
    device: event.device || userDoc?.device || {},
    status: userDoc?.status || 1,
    updated_at: now,
  };

  if (userDoc) {
    await db.collection(COLLECTIONS.users).doc(openid).update({ data: userPayload });
  } else {
    await db.collection(COLLECTIONS.users).doc(openid).set({
      data: {
        user_id: openid,
        first_login_at: now,
        created_at: now,
        ...userPayload,
      },
    });
  }

  const grantedSkins = firstLoginToday
    ? await grantLoginSkins(openid, nextLoginDays, nextContinuousDays, now)
    : [];

  return {
    openid,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || '',
    riskLevel,
    dailyAdLimit,
    loginDays: nextLoginDays,
    continuousLoginDays: nextContinuousDays,
    firstLoginToday,
    grantedSkins,
    isSuperAdmin: superAdmin,
  };
};
