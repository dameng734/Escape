const wxRuntime = typeof wx !== 'undefined' ? wx : null;
const canvas = wxRuntime?.getSharedCanvas ? wxRuntime.getSharedCanvas() : wxRuntime?.createCanvas?.();
const ctx = canvas?.getContext?.('2d');

const state = {
  width: 320,
  height: 420,
  dpr: 1,
  scroll: 0,
  scoreKey: 'rank_score',
  compatScoreKey: 'score',
  dataKey: 'rank_data',
  defaultAvatar: 'assets/images/ui/default_avatar.png',
  currentUser: null,
  friends: [],
  loading: true,
  error: '',
  lastFetchAt: 0,
  lastErrorMessage: '',
};

const images = new Map();

function rankText() {
  return {
    loading: '好友榜加载中',
    empty: '暂无好友成绩',
    emptyTip: '好友需进入新版游戏一次',
    error: '好友榜加载失败',
    guest: '微信玩家',
    me: '我',
    level: '关',
    stars: '星',
    steps: '最佳步数',
  };
}

function imageFor(path) {
  const src = path || state.defaultAvatar;
  if (images.has(src)) return images.get(src);
  if (!wxRuntime?.createImage) return null;
  const image = wxRuntime.createImage();
  images.set(src, image);
  image.onload = () => render();
  image.onerror = () => {
    if (src !== state.defaultAvatar) images.set(src, imageFor(state.defaultAvatar));
    render();
  };
  image.src = src;
  return image;
}

function parseFriend(item) {
  const kv = {};
  (item.KVDataList || []).forEach((pair) => {
    kv[pair.key] = pair.value;
  });
  let data = {};
  try {
    data = kv[state.dataKey] ? JSON.parse(kv[state.dataKey]) : {};
  } catch (error) {
    data = {};
  }
  const score = Number(kv[state.scoreKey] || kv.score || data.score || 0);
  if (!score) return null;
  const userInfo = item.userInfo || item.wxUserInfo || {};
  const nickname = item.nickname || item.nickName || item.nick_name || userInfo.nickname || userInfo.nickName || data.nickname || data.nickName || rankText().guest;
  const avatarUrl = item.avatarUrl || item.avatarURL || item.headUrl || userInfo.avatarUrl || userInfo.avatarURL || userInfo.headUrl || data.avatarUrl || data.avatarURL || data.headUrl || '';
  return {
    openid: item.openid || '',
    nickname,
    avatarUrl,
    score,
    level: Number(data.level) || 0,
    stars: Number(data.stars) || 0,
    bestSteps: Number(data.bestSteps) || 0,
    updatedAt: Number(data.updatedAt) || 0,
  };
}

function fetchFriends(force = false) {
  if (!wxRuntime?.getFriendCloudStorage) {
    state.loading = false;
    state.error = 'unsupported';
    render();
    return;
  }
  const now = Date.now();
  if (!force && now - state.lastFetchAt < 5000) return;
  state.lastFetchAt = now;
  state.loading = true;
  state.error = '';
  state.lastErrorMessage = '';
  wxRuntime.getFriendCloudStorage({
    keyList: Array.from(new Set([state.scoreKey, state.compatScoreKey, state.dataKey])),
    success: (res) => {
      const raw = res.data || [];
      const parsed = raw.map(parseFriend).filter(Boolean);
      state.friends = sortEntries(parsed);
      state.loading = false;
      render();
    },
    fail: (error) => {
      state.loading = false;
      state.error = error?.errMsg || 'failed';
      state.lastErrorMessage = state.error;
      console.warn('好友榜加载失败', error);
      if (!state.friends.length) state.error = '';
      render();
    },
  });
}

function sortEntries(entries) {
  return entries.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    if (b.stars !== a.stars) return b.stars - a.stars;
    if (a.bestSteps !== b.bestSteps) return (a.bestSteps || 999999) - (b.bestSteps || 999999);
    return b.score - a.score;
  });
}

function displayEntries() {
  const entries = state.friends.slice();
  const current = state.currentUser;
  if (current?.score && (!entries.length || current.nickName || current.avatarUrl)) {
    const sameUser = entries.some((entry) => (
      (current.avatarUrl && entry.avatarUrl === current.avatarUrl)
      || (current.nickName && entry.nickname === current.nickName && entry.score === current.score)
    ));
    if (!sameUser) {
      entries.push({
        nickname: current.nickName || rankText().me,
        avatarUrl: current.avatarUrl || '',
        score: Number(current.score) || 0,
        level: Number(current.level) || 0,
        stars: Number(current.stars) || 0,
        bestSteps: Number(current.bestSteps) || 0,
        updatedAt: Number(current.updatedAt) || 0,
      });
    }
  }
  return sortEntries(entries);
}

function resizeCanvas() {
  if (!canvas) return;
  const width = Math.max(1, Math.floor(state.width * state.dpr));
  const height = Math.max(1, Math.floor(state.height * state.dpr));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}

function setupContext() {
  resizeCanvas();
  if (ctx?.setTransform) ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  else ctx?.scale?.(state.dpr, state.dpr);
}

function roundRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
  if (!ctx) return;
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function text(value, x, y, size, color, align = 'left', weight = 'normal') {
  if (!ctx) return;
  ctx.font = `${weight} ${size}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(String(value), x, y);
}

function drawAvatar(src, x, y, size) {
  if (!ctx) return;
  const img = imageFor(src);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (img?.width) ctx.drawImage(img, x, y, size, size);
  else {
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function ellipsis(value, maxWidth, size, weight = 'normal') {
  if (!ctx) return value;
  ctx.font = `${weight} ${size}px sans-serif`;
  let out = String(value || rankText().guest);
  if (ctx.measureText(out).width <= maxWidth) return out;
  while (out.length > 1 && ctx.measureText(`${out}...`).width > maxWidth) out = out.slice(0, -1);
  return `${out}...`;
}

function drawRow(entry, index, y) {
  const rowX = 8;
  const rowW = state.width - 16;
  const isTop = index === 0;
  roundRect(rowX, y, rowW, 60, 10, isTop ? '#fff4db' : '#f8fafc', isTop ? '#ffcf77' : '#d8e1f0', 2);
  roundRect(rowX + 12, y + 17, 30, 26, 13, isTop ? '#ffb020' : '#d8e1f0');
  text(index + 1, rowX + 27, y + 36, 15, '#202633', 'center', 'bold');
  drawAvatar(entry.avatarUrl || state.defaultAvatar, rowX + 50, y + 10, 40);
  const nameMax = Math.max(80, rowW - 178);
  text(ellipsis(entry.nickname, nameMax, 16, 'bold'), rowX + 100, y + 25, 16, '#202633', 'left', 'bold');
  const sub = `${entry.stars}${rankText().stars} · ${rankText().steps} ${entry.bestSteps || '-'}`;
  text(sub, rowX + 100, y + 47, 12, '#778091');
  text(`${entry.level}${rankText().level}`, rowX + rowW - 22, y + 36, 17, '#ff7a00', 'right', 'bold');
}

function renderEmpty(message, tip = '') {
  roundRect(8, 12, state.width - 16, 112, 12, '#f8fafc', '#d8e1f0', 2);
  drawAvatar(state.defaultAvatar, state.width / 2 - 28, 28, 56);
  text(message, state.width / 2, tip ? 98 : 106, 15, '#778091', 'center', 'bold');
  if (tip) text(tip, state.width / 2, 118, 11, '#9aa4b5', 'center');
}

function privacyErrorTip() {
  if (!state.lastErrorMessage) return '';
  if (String(state.lastErrorMessage).includes('privacy') || String(state.lastErrorMessage).includes('1026')) {
    return '需在微信公众平台声明隐私用途';
  }
  return '';
}

function render() {
  if (!ctx) return;
  setupContext();
  ctx.clearRect(0, 0, state.width, state.height);
  const t = rankText();
  if (state.loading) {
    renderEmpty(t.loading);
    return;
  }
  const entries = displayEntries();
  if (state.error && !entries.length) {
    renderEmpty(t.error, privacyErrorTip());
    return;
  }
  if (!entries.length) {
    renderEmpty(t.empty, t.emptyTip);
    return;
  }
  entries.forEach((entry, index) => {
    const y = 12 + index * 72 - state.scroll;
    if (y > -72 && y < state.height + 12) drawRow(entry, index, y);
  });
}

wxRuntime?.onMessage?.((message = {}) => {
  if (message.scoreKey) state.scoreKey = message.scoreKey;
  if (message.compatScoreKey) state.compatScoreKey = message.compatScoreKey;
  if (message.dataKey) state.dataKey = message.dataKey;
  if (message.defaultAvatar) state.defaultAvatar = message.defaultAvatar;
  if (message.currentUser) state.currentUser = message.currentUser;
  if (message.type === 'renderRank') {
    state.width = Number(message.width) || state.width;
    state.height = Number(message.height) || state.height;
    state.dpr = Number(message.dpr) || state.dpr;
    state.scroll = Number(message.scroll) || 0;
    render();
  }
  if (message.type === 'refreshRank') fetchFriends(true);
});

fetchFriends(true);
