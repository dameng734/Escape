const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();

const COLLECTIONS = {
  users: 'users',
  gameState: 'user_game_state',
  dailyLogin: 'user_daily_login',
  dailyAdCounter: 'user_daily_ad_counter',
  userSkin: 'user_skin',
};

function normalizeUserId(value) {
  return String(value || '').trim();
}

async function removeDoc(collection, id) {
  try {
    await db.collection(collection).doc(id).remove();
    return { collection, removed: true };
  } catch (error) {
    return { collection, removed: false, ignored: true, message: error.message || String(error) };
  }
}

async function removeByOpenid(collection, openid) {
  let removed = 0;
  let batches = 0;
  while (batches < 20) {
    const res = await db.collection(collection)
      .where({
        openid,
      })
      .limit(100)
      .get();
    const docs = res.data || [];
    if (!docs.length) break;
    batches += 1;
    await Promise.all(docs.map((doc) => db.collection(collection).doc(doc._id).remove()
      .then(() => { removed += 1; })
      .catch(() => null)));
    if (docs.length < 100) break;
  }
  return { collection, removed };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const operatorOpenid = wxContext.OPENID;
  const targetOpenid = normalizeUserId(event.targetUserId || event.targetOpenid || event.openid || event.userId);

  if (!targetOpenid) {
    return {
      ok: false,
      code: 'MISSING_TARGET_USER_ID',
      message: '请传入 targetUserId / targetOpenid / openid / userId',
    };
  }

  const results = [];
  results.push(await removeDoc(COLLECTIONS.gameState, targetOpenid));
  results.push(await removeDoc(COLLECTIONS.users, targetOpenid));
  results.push(await removeByOpenid(COLLECTIONS.dailyLogin, targetOpenid));
  results.push(await removeByOpenid(COLLECTIONS.dailyAdCounter, targetOpenid));
  results.push(await removeByOpenid(COLLECTIONS.userSkin, targetOpenid));

  return {
    ok: true,
    targetOpenid,
    operatorOpenid,
    results,
    clientStorageKeysToClear: [
      'let_him_out_native_save_v1',
      'let_him_out_native_save_v1_cloud_doc_id',
      'let_him_out_native_save_v1_cloud_user_id',
      'let_him_out_native_save_v1_user_profile',
    ],
    openDataKeysToClearOnClient: ['rank_score', 'score', 'rank_data'],
    note: '云函数只能删除云数据库数据；同一设备上的本地 storage 和好友榜开放数据域 KV 需要客户端清理，否则本地旧存档可能再次同步回云端。',
  };
};
