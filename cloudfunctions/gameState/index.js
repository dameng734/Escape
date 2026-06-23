const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const COLLECTION = 'user_game_state';
const USERS_COLLECTION = 'users';

function normalizeProfile(profile = {}) {
  return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
}

function profileNickname(profile = {}, fallback = '') {
  return String(profile.nickName || profile.nickname || fallback || '').trim();
}

function cleanState(state = {}, openid, now) {
  const profile = normalizeProfile(state.profile);
  const nickname = profileNickname(profile, state.nickname);
  return {
    user_id: openid,
    openid,
    nickname,
    coins: Math.max(0, Number(state.coins) || 0),
    highest_unlocked_level: Math.max(1, Number(state.highest_unlocked_level) || 1),
    current_theme: state.current_theme || 'theme_default',
    owned_themes: Array.isArray(state.owned_themes) ? state.owned_themes : ['theme_default'],
    current_character_skin: state.current_character_skin || 'cat_orange',
    owned_character_skins: Array.isArray(state.owned_character_skins) ? state.owned_character_skins : ['cat_orange'],
    items: state.items || {},
    ad_progress: state.ad_progress || {},
    rewarded_ads_snapshot: state.rewarded_ads_snapshot || {},
    level_progress: state.level_progress || {},
    legacy_save_snapshot: state.legacy_save_snapshot || {},
    save_version: Number(state.save_version) || 1,
    profile,
    device: state.device || {},
    created_at: Number(state.created_at) || now,
    updated_at: Number(state.updated_at) || now,
  };
}

async function updateUserProfile(state, openid, now) {
  if (!state.nickname && !Object.keys(state.profile || {}).length) return;
  try {
    await db.collection(USERS_COLLECTION).doc(openid).update({
      data: {
        nickname: state.nickname || '',
        profile: state.profile || {},
        updated_at: now,
      },
    });
  } catch (error) {
    // The login function normally creates the user document first. Ignore missing docs.
  }
}

async function getState(openid) {
  try {
    const res = await db.collection(COLLECTION).doc(openid).get();
    return res.data || null;
  } catch (error) {
    return null;
  }
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = Date.now();
  const action = event.action || 'get';

  if (action === 'save') {
    const existed = await getState(openid);
    const state = cleanState({
      ...(event.state || {}),
      created_at: existed?.created_at || event.state?.created_at || now,
    }, openid, now);
    await db.collection(COLLECTION).doc(openid).set({ data: state });
    await updateUserProfile(state, openid, now);
    return { ok: true, state };
  }

  const state = await getState(openid);
  return { ok: true, state };
};
