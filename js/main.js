import LEVEL_DATA from '../assets/data/levels_data';

const wxRuntime = typeof wx !== 'undefined' ? wx : null;

const ASSET = {
  data: {
    levels: 'assets/data/levels.json',
    game: 'assets/data/game_config.json',
    economy: 'assets/data/economy_config.json',
    ads: 'assets/data/ad_config.json',
  },
  image: {
    home: 'assets/images/home_bg.png',
    game: 'assets/images/game_bg.png',
    classic: 'assets/images/theme_classic_bg.jpg',
    neon: 'assets/images/theme_neon_bg.jpg',
    pixel: 'assets/images/theme_pixel_bg.jpg',
    pastel: 'assets/images/theme_pastel_bg.png',
    logo: 'assets/images/logo_mark.png',
    catOrange: 'assets/images/characters/cat_orange_idle_down.png',
    catLihua: 'assets/images/characters/cat_lihua_idle_down.png',
    dogTan: 'assets/images/characters/dog_tan_idle_down.png',
    coinIcon: 'assets/images/ui/coin_icon.png',
    starIcon: 'assets/images/ui/star_icon.png',
    adIcon: 'assets/images/ui/ad_icon.png',
    freeIcon: 'assets/images/ui/free_icon.png',
    gameCircleIcon: 'assets/images/ui/game_circle_icon.png',
    ageHint8: 'assets/images/ui/age_hint_8.png',
    pagerArrowRight: 'assets/images/ui/pager_arrow_right.png',
    levelLock: 'assets/images/ui/level_lock.png',
    exitGate: 'assets/images/ui/exit_gate.png',
    defaultAvatar: 'assets/images/ui/default_avatar.png',
    moveArrowHorizontal: 'assets/images/ui/move_arrow_horizontal.png',
    moveArrowVertical: 'assets/images/ui/move_arrow_vertical.png',
    specialMagnetS: 'assets/images/special/magnet_s.png',
    specialMagnetN: 'assets/images/special/magnet_n.png',
    specialCoin: 'assets/images/special/coin.png',
    specialIceIntactSquare: 'assets/images/special/ice_intact_square.png',
    specialIceCrackedSquare: 'assets/images/special/ice_cracked_square.png',
    specialIceIntactWide: 'assets/images/special/ice_intact_wide.png',
    specialIceCrackedWide: 'assets/images/special/ice_cracked_wide.png',
    specialIceIntactTall: 'assets/images/special/ice_intact_tall.png',
    specialIceCrackedTall: 'assets/images/special/ice_cracked_tall.png',
    specialDirectional: 'assets/images/special/directional.png',
    specialTeleport: 'assets/images/special/teleport.png',
    specialLocked: 'assets/images/special/locked.png',
    specialKey: 'assets/images/special/key.png',
  },
  audio: {
    bgm: 'assets/audio/bg.m4a',
    click: 'assets/audio/click.wav',
    move: 'assets/audio/move.wav',
    snap: 'assets/audio/snap.wav',
    invalid: 'assets/audio/invalid.wav',
    win: 'assets/audio/win.wav',
    success: 'assets/audio/3success.m4a',
    fail: 'assets/audio/5faild.m4a',
    coin: 'assets/audio/coin.wav',
    star: 'assets/audio/star.wav',
  },
};

const SAVE_KEY = 'let_him_out_native_save_v1';
const SAVE_VERSION = 2;
const CLOUD_ENV_ID = 'cloud1-d7geb751l19dcac71';
const CLOUD_DOC_ID_KEY = `${SAVE_KEY}_cloud_doc_id`;
const CLOUD_USER_ID_KEY = `${SAVE_KEY}_cloud_user_id`;
const USER_PROFILE_KEY = `${SAVE_KEY}_user_profile`;
const CLOUD_LOGIN_FUNCTION = 'login';
const CLOUD_AD_REWARD_FUNCTION = 'adReward';
const CLOUD_GAME_STATE_FUNCTION = 'gameState';
const CLOUD_SYNC_DEBOUNCE = 1200;
const CLOUD_PERIODIC_SYNC_INTERVAL = 60000;
const GAME_BANNER_RESERVED_HEIGHT = 116;
const RANK_SCORE_KEY = 'rank_score';
const RANK_COMPAT_SCORE_KEY = 'score';
const RANK_DATA_KEY = 'rank_data';
const RANK_SUBMIT_DEBOUNCE = 1200;
const DEFAULT_STAR_RULE = { three: 0, two: 2, max: 5 };
const DEBUG_INITIAL_COINS = 0;
const FACING_DIRECTIONS = ['up', 'down', 'left', 'right'];
const COIN_REWARD_PER_CELL = 3;
const MAGNET_SLIDE_MS = 320;
const GAME_CIRCLE_OPENLINK = '-SSEykJvFV3pORt5kTNpSweKIAM-OvCNOim8mHIv0_g-hiY1-AK2_gCx4BADeDROZrpGSfU24yA6KFoDrijd5LS-MLp7MnLgltxc0FkBM5jCdTovAjei9aZ6rw11NT79lz8I3yuXXWiRmMHaH2TY8q6iAnl3DeTps65DMfTX0rQz50qOQmzH5-MV9U9OY4K7qJfTN0uM0VJ9pqsARnm5aD68DHWX41_KOfj3x-3yLwC0ulZhviLqrMjk-4hllsDJ39uPG5CnUfdyBDRkkrrgXKIRL32ZKzuHMaqMjfC2uuQL-C1406lLP_OOIuknu8_9UceHeNKuJIQJda5ua7qaog';
const SHARE_TITLE = '\u8ba9\u5b83\u51fa\u53bb\uff1a\u4e00\u8d77\u6311\u6218\u6ed1\u5757\u8c1c\u9898';
const SHARE_IMAGE_URL_ID = 'wQOYiLTvSR256srPd+jIJw==';
const SHARE_IMAGE_URL = 'https://mmocgame.qpic.cn/wechatgame/5Omv8jytpFy7vBNMzX3l4yMgtESAeWZcWJc2wxR9YZRz2E8WZpGbDWKOVzNq7lKl/0';
const MAGNET_MERGE_GLOW_MS = 500;
const ICE_SHATTER_MS = 520;
const MAGNET_REPEL_ICE_BREAK_DELAY_MS = 300;

function characterImagePath(skinId, facing = 'down') {
  return `assets/images/characters/${skinId}_idle_${facing}.png`;
}

const CHARACTER_SKINS = [
  { id: 'cat_orange', name: '\u6a58\u732b', desc: '\u9ed8\u8ba4\u4f19\u4f34\uff0c\u52a8\u4f5c\u7075\u6d3b\u3002', price: 0, asset: ASSET.image.catOrange },
  { id: 'cat_lihua', name: '\u72f8\u82b1\u732b', desc: '\u7070\u68d5\u82b1\u7eb9\uff0c\u673a\u654f\u597d\u52a8\u3002', price: 1200, asset: ASSET.image.catLihua },
  { id: 'dog_tan', name: '\u5c0f\u9ec4\u72d7', desc: '\u8f6f\u8033\u6735\uff0c\u4eb2\u548c\u529b\u6ee1\u5206\u3002', price: 1200, asset: ASSET.image.dogTan },
  { id: 'rabbit_white', name: '\u5c0f\u767d\u5154', desc: '\u8f7b\u5de7\u53ef\u7231\u7684\u5c0f\u767d\u5154\u3002', price: 1200 },
  { id: 'turtle_green', name: '\u5c0f\u4e4c\u9f9f', desc: '\u6162\u60a0\u60a0\uff0c\u7a33\u7a33\u7684\u5c0f\u4e4c\u9f9f\u3002', price: 1200 },
  { id: 'panda_baby', name: '\u718a\u732b\u5b9d\u5b9d', desc: '\u5706\u6eda\u6eda\u7684\u7a00\u6709\u4f19\u4f34\u3002', price: 1200 },
];

const THEMES = [
  {
    id: 'theme_default',
    name: '\u6e05\u723d\u9ed8\u8ba4',
    price: 0,
    bg: ASSET.image.home,
    colors: {
      pageA: '#f7f9ff',
      pageB: '#e8f1ff',
      board: '#dfe6f4',
      cell: '#fdfefe',
      grid: '#cbd5e6',
      target: '#ff4d4f',
      block: '#2f80ed',
      horizontal: '#2f80ed',
      vertical: '#27ae60',
      freeMove: '#9b5cff',
      fixed: '#4f5665',
      exit: '#ffb020',
      text: '#202633',
      muted: '#778091',
    },
  },
  {
    id: 'theme_classic',
    name: '\u9633\u5149\u623f\u95f4',
    price: 1200,
    bg: ASSET.image.classic,
    colors: {
      pageA: '#fff7df',
      pageB: '#dff7ff',
      board: '#f2d39f',
      cell: '#fffaf0',
      grid: '#deb878',
      target: '#ff6b4a',
      block: '#41a8e8',
      horizontal: '#41a8e8',
      vertical: '#6ac36a',
      freeMove: '#b26cff',
      fixed: '#8b7357',
      exit: '#f5a623',
      text: '#34291d',
      muted: '#7a6b5a',
    },
  },
  {
    id: 'theme_neon',
    name: '\u591c\u95f4\u9713\u8679',
    price: 1600,
    bg: ASSET.image.neon,
    colors: {
      pageA: '#071329',
      pageB: '#24124a',
      board: '#111c3d',
      cell: '#182850',
      grid: '#49bfff',
      target: '#ff4f9a',
      block: '#12c8ff',
      horizontal: '#12c8ff',
      vertical: '#2ee58f',
      freeMove: '#d45cff',
      fixed: '#5e6f99',
      exit: '#ffe066',
      text: '#f6fbff',
      muted: '#b6c8e8',
    },
  },
  {
    id: 'theme_pastel',
    name: '\u7c89\u5f69\u67d4\u548c',
    hidden: true,
    price: 1500,
    bg: ASSET.image.pastel,
    colors: {
      pageA: '#fff8fb',
      pageB: '#f1fbff',
      board: '#eadff2',
      cell: '#fffafd',
      grid: '#dacce4',
      target: '#ff7a90',
      block: '#78a8ff',
      horizontal: '#78a8ff',
      vertical: '#78d6b3',
      freeMove: '#c084fc',
      fixed: '#8b8795',
      exit: '#ffc857',
      text: '#40364d',
      muted: '#8d819a',
    },
  },
  {
    id: 'theme_pixel',
    name: '\u50cf\u7d20\u65b9\u683c',
    price: 2000,
    bg: ASSET.image.pixel,
    colors: {
      pageA: '#d8fff6',
      pageB: '#ffd676',
      board: '#0f766e',
      cell: '#fff5c7',
      grid: '#073b4c',
      target: '#ff5b5b',
      block: '#21b7c8',
      horizontal: '#21b7c8',
      vertical: '#22c55e',
      freeMove: '#a855f7',
      fixed: '#3b2d50',
      exit: '#ffbf3f',
      text: '#16223a',
      muted: '#4f6473',
    },
  },
  {
    id: 'theme_mono',
    name: '\u9ed1\u767d\u6781\u7b80',
    hidden: true,
    price: 1800,
    bg: ASSET.image.neon,
    colors: {
      pageA: '#f7f7f7',
      pageB: '#e7e7e7',
      board: '#d7d7d7',
      cell: '#ffffff',
      grid: '#c0c0c0',
      target: '#e53935',
      block: '#6f7782',
      horizontal: '#6f7782',
      vertical: '#4d5662',
      freeMove: '#8b5cf6',
      fixed: '#222222',
      exit: '#111111',
      text: '#171717',
      muted: '#707070',
    },
  },
];

const DEFAULT_CONFIGS = {
  game: {
    showAdButtons: false,
    hideAdFeatures: true,
    visibleLevelMax: 0,
    hiddenCharacterSkins: ['cat_lihua', 'turtle_green', 'panda_baby'],
    starRuleDefault: DEFAULT_STAR_RULE,
    levelStarRules: {},
  },
  economy: {
    shop: { adCoins: { coinsPerAd: 80, dailyLimit: 10, totalLimit: 0 } },
    characterSkinPrices: {},
    characterSkinUnlocks: {},
    themePrices: {},
    themeUnlocks: {},
  },
  ads: {
    enabled: false,
    simulateWhenUnavailable: false,
    adUnitId: '',
    interstitial: { enabled: false, adUnitId: '', firstLevel: 10 },
    rewards: {
      hint: { enabled: true, adUnitId: 'adunit-3982861b15085a31', freeUses: 2, maxUsesPerLevel: 3 },
      addSteps: { enabled: true, steps: 6 },
      coinDouble: { enabled: true },
      shopCoins: { enabled: true, coins: 80, dailyLimit: 10, totalLimit: 0 },
      skinProgress: { enabled: true, progress: 1 },
      undo: { enabled: true },
    },
  },
};

function safeWindowInfo() {
  if (wxRuntime?.getWindowInfo) return wxRuntime.getWindowInfo();
  if (wxRuntime?.getSystemInfoSync) return wxRuntime.getSystemInfoSync();
  return { windowWidth: 375, windowHeight: 667, pixelRatio: 1, safeArea: { top: 0, bottom: 667 } };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function todayKey() {
  const date = new Date();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function merge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const out = { ...target };
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = merge(out[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  });
  return out;
}

export default class Main {
  constructor() {
    this.canvas = wxRuntime?.createCanvas ? wxRuntime.createCanvas() : canvas;
    this.ctx = this.canvas.getContext('2d');
    this.images = new Map();

    // ── PC端适配：平台检测 ──
    const _sysInfo = wxRuntime?.getSystemInfoSync?.() || {};
    this.isPC = ['windows', 'mac', 'devtools'].includes(String(_sysInfo.platform || '').toLowerCase());
    this.buttons = [];
    this.toast = null;
    this.scene = 'home';
    this.tab = 'levels';
    this.page = 0;
    this.shopScroll = 0;
    this.rankScroll = 0;
    this.rankPullDistance = 0;
    this.rankRefreshing = false;
    this.dragging = null;
    this.scrollDrag = null;
    this.blockAnimations = new Map();
    this.boardEffects = [];
    this.animationLockUntil = 0;
    this.pressedButton = null;
    this.pressedPoint = null;
    this.resultOverlay = null;
    this.failureOverlay = null;
    this.music = null;
    this.musicKey = '';
    this.cloudReady = false;
    this.cloudDocId = '';
    this.cloudUserId = '';
    this.cloudPullDone = false;
    this.cloudSyncTimer = null;
    this.cloudPeriodicTimer = null;
    this.cloudSyncing = false;
    this.cloudSyncPending = false;
    this.cloudDirty = false;
    this.cloudLastSyncedAt = 0;
    this.userLoginInfo = {};
    this.serverAdCounters = {};
    this.rankSubmitTimer = null;
    this.rankLastSubmitted = '';
    this.rankContext = null;
    this.rankCanvas = null;
    this.rankLastRenderMessage = '';
    this.rankStatus = '';
    this.coinDoublePending = false;
    this.addStepsPending = false;
    this.addStepStarBonus = 0;
    this.stepLimitBonusEffect = null;
    this.hintUsesByLevel = new Map();
    this.hintAdUsesByLevel = new Map();
    this.hintPathCache = null;
    this.hintMoveCache = new Map();
    this.hintPending = false;
    this.hintAdPending = false;
    this.hintBlockId = '';
    this.hintUntil = 0;
    this.lastSolveStatus = '';
    this.customAd = null;
    this.customAdVisible = false;
    this.customAdStyleKey = '';
    this.customAdRetryAt = 0;
    this.userProfile = {};
    this.userInfoButton = null;
    this.userInfoButtonRect = null;
    this.gameCirclePageManager = null;
    this.gameCircleOpening = false;
    this.resize();
    this.bindEvents();
    this.loadData();
    // ── PC端适配：延迟云初始化，等待JS桥接就绪 ──
    if (this.isPC) {
      setTimeout(() => {
        this.initCloud();
        this.pullCloudSave();
        this.startCloudPeriodicSync();
      }, 3000);
    } else {
      this.initCloud();
      this.pullCloudSave();
      this.startCloudPeriodicSync();
    }
    this.loadCachedUserProfile();
    this.save = this.loadSave();
    this.initShare();
    this.initRankContext();
    this.queueRankSubmit(0);
    this.startLoading();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  resize() {
    const info = safeWindowInfo();
    this.dpr = info.pixelRatio || 1;
    const realWidth = info.windowWidth || info.screenWidth || 375;
    const realHeight = info.windowHeight || info.screenHeight || 667;
    // ── PC端适配：限制游戏区域宽度，居中显示 ──
    if (this.isPC) {
      this.width = Math.min(realWidth, 480);
      this.height = realHeight;
      this.safeTop = 0;
      this.safeBottom = this.height;
      this.pcOffsetX = Math.floor((realWidth - this.width) / 2);
    } else {
      this.width = realWidth;
      this.height = realHeight;
      this.safeTop = info.safeArea?.top || 0;
      this.safeBottom = info.safeArea?.bottom || this.height;
      this.pcOffsetX = 0;
    }
    this.menuButton = wxRuntime?.getMenuButtonBoundingClientRect ? wxRuntime.getMenuButtonBoundingClientRect() : null;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    if (this.ctx.setTransform) this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    else {
      this.ctx.scale(this.dpr, this.dpr);
    }
  }

  loadData() {
    this.config = {
      game: merge(DEFAULT_CONFIGS.game, this.readJson(ASSET.data.game, DEFAULT_CONFIGS.game)),
      economy: merge(DEFAULT_CONFIGS.economy, this.readJson(ASSET.data.economy, DEFAULT_CONFIGS.economy)),
      ads: merge(DEFAULT_CONFIGS.ads, this.readJson(ASSET.data.ads, DEFAULT_CONFIGS.ads)),
    };
    const levels = this.readJson(ASSET.data.levels, LEVEL_DATA);
    const visibleLevelMax = Number(this.config.game.visibleLevelMax) || 0;
    const visibleLevels = visibleLevelMax > 0
      ? levels.filter((level) => Number(level.levelId) <= visibleLevelMax)
      : levels;
    this.levels = visibleLevels.map((level) => {
      const configured = this.config.game.levelStarRules?.[String(level.levelId)] || {};
      const configuredRule = { ...configured };
      const configuredBestSteps = Number(configuredRule.bestSteps) || 0;
      delete configuredRule.bestSteps;
      const bestSteps = configuredBestSteps || level.bestSteps || Math.max(1, level.designerSolution?.length || level.stepLimit || 1);
      const starRule = merge(merge(DEFAULT_STAR_RULE, this.config.game.starRuleDefault || {}), merge(level.starRule || {}, configuredRule));
      return { ...level, bestSteps, starRule, stepLimit: bestSteps + starRule.max };
    });
  }

  readJson(path, fallback) {
    try {
      if (wxRuntime?.getFileSystemManager) {
        const fs = wxRuntime.getFileSystemManager();
        const candidates = [path, `/${path}`, `./${path}`];
        for (const filePath of candidates) {
          try {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
          } catch (error) {
            // Real devices are stricter than DevTools about package file paths.
          }
        }
      }
    } catch (error) {
      console.warn(`\u8bfb\u53d6\u914d\u7f6e\u5931\u8d25: ${path}`, error);
    }
    return fallback;
  }

  defaultSave() {
    return {
      version: SAVE_VERSION,
      updatedAt: 0,
      coins: DEBUG_INITIAL_COINS,
      highestUnlockedLevel: 1,
      levelProgress: {},
      currentTheme: 'theme_default',
      ownedThemes: ['theme_default'],
      currentCharacterSkin: 'cat_orange',
      ownedCharacterSkins: ['cat_orange'],
      adProgress: {},
      rewardedAds: { shopCoinsTotal: 0, shopCoinsDay: '', shopCoinsToday: 0 },
      items: {
        // hintTicket: 3,
        undoTicket: 0,
        addStepTicket: 0,
        skipTicket: 0,
      },
    };
  }

  loadSave() {
    let data = this.defaultSave();
    try {
      const raw = wxRuntime?.getStorageSync ? wxRuntime.getStorageSync(SAVE_KEY) : '';
      const parsed = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      data = parsed?.version === SAVE_VERSION ? merge(data, parsed) : data;
    } catch (error) {
      console.warn('\u8bfb\u53d6\u5b58\u6863\u5931\u8d25\uff0c\u4f7f\u7528\u9ed8\u8ba4\u5b58\u6863', error);
    }
    if (!data.ownedThemes.includes('theme_default')) data.ownedThemes.unshift('theme_default');
    if (!data.ownedCharacterSkins.includes('cat_orange')) data.ownedCharacterSkins.unshift('cat_orange');
    data.coins = Math.max(0, Number(data.coins) || 0);
    data.updatedAt = Number(data.updatedAt) || Date.now();
    if (!this.availableThemes().some((theme) => theme.id === data.currentTheme) || !data.ownedThemes.includes(data.currentTheme)) {
      data.currentTheme = 'theme_default';
    }
    if (!CHARACTER_SKINS.some((skin) => skin.id === data.currentCharacterSkin) || !data.ownedCharacterSkins.includes(data.currentCharacterSkin)) {
      data.currentCharacterSkin = 'cat_orange';
    }
    data.highestUnlockedLevel = this.contiguousUnlockedLevel(data.levelProgress);
    this.saveLocal(data);
    return data;
  }

  saveData(data = this.save, options = {}) {
    this.save = data;
    this.save.updatedAt = Date.now();
    this.saveLocal(this.save);
    if (options.syncCloud !== false) this.queueCloudSave();
    if (options.syncRank !== false) this.queueRankSubmit();
  }

  saveLocal(data = this.save) {
    try {
      wxRuntime?.setStorageSync?.(SAVE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('\u5199\u5165\u5b58\u6863\u5931\u8d25', error);
    }
  }

  loadCachedUserProfile() {
    try {
      const raw = wxRuntime?.getStorageSync?.(USER_PROFILE_KEY);
      this.userProfile = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
    } catch (error) {
      this.userProfile = {};
    }
  }

  saveUserProfile(userInfo = {}) {
    const hasProfile = !!(userInfo.nickName || userInfo.avatarUrl);
    this.userProfile = {
      authorized: hasProfile,
      nickName: userInfo.nickName || '',
      avatarUrl: userInfo.avatarUrl || '',
      gender: userInfo.gender || 0,
      country: userInfo.country || '',
      province: userInfo.province || '',
      city: userInfo.city || '',
      language: userInfo.language || '',
      updatedAt: Date.now(),
    };
    try {
      wxRuntime?.setStorageSync?.(USER_PROFILE_KEY, JSON.stringify(this.userProfile));
    } catch (error) {
      console.warn('\u5199\u5165\u7528\u6237\u8d44\u6599\u7f13\u5b58\u5931\u8d25', error);
    }
    this.queueCloudSave(0);
    this.ensureCloudUserId();
    this.queueRankSubmit(0);
  }

  initRankContext() {
    if (!wxRuntime?.getOpenDataContext) {
      this.rankStatus = '\u5f53\u524d\u73af\u5883\u4e0d\u652f\u6301\u5fae\u4fe1\u597d\u53cb\u699c';
      return;
    }
    try {
      this.rankContext = wxRuntime.getOpenDataContext();
      this.rankCanvas = this.rankContext?.canvas || wxRuntime.getSharedCanvas?.() || null;
      this.rankStatus = this.rankCanvas ? '' : '\u597d\u53cb\u699c\u753b\u5e03\u521d\u59cb\u5316\u5931\u8d25';
    } catch (error) {
      this.rankContext = null;
      this.rankCanvas = null;
      this.rankStatus = '\u597d\u53cb\u699c\u521d\u59cb\u5316\u5931\u8d25';
      console.warn('\u597d\u53cb\u699c\u521d\u59cb\u5316\u5931\u8d25', error);
    }
  }

  rankPayload() {
    const progress = this.save?.levelProgress || {};
    const passedLevels = Object.values(progress).filter((item) => item?.passed).length;
    const totalStars = this.totalStars();
    const bestStepSum = Object.values(progress).reduce((sum, item) => sum + (Number(item?.bestSteps) || 0), 0);
    const score = passedLevels * 100000 + totalStars * 1000 + Math.max(0, 999 - Math.min(999, bestStepSum));
    return {
      score,
      level: Math.max(0, (this.save?.highestUnlockedLevel || 1) - 1),
      stars: totalStars,
      bestSteps: bestStepSum,
      nickName: this.userProfile?.nickName || '',
      avatarUrl: this.userProfile?.avatarUrl || '',
      updatedAt: Date.now(),
    };
  }

  queueRankSubmit(delay = RANK_SUBMIT_DEBOUNCE) {
    if (!wxRuntime?.setUserCloudStorage) return;
    if (this.rankSubmitTimer) clearTimeout(this.rankSubmitTimer);
    this.rankSubmitTimer = setTimeout(() => this.submitRankScore(), delay);
  }

  submitRankScore(onDone = null) {
    if (!wxRuntime?.setUserCloudStorage) {
      if (onDone) onDone(false);
      return;
    }
    const payload = this.rankPayload();
    const rankData = JSON.stringify(payload);
    const signature = `${payload.score}:${payload.level}:${payload.stars}:${payload.bestSteps}`;
    if (signature === this.rankLastSubmitted) {
      if (onDone) onDone(true);
      return;
    }
    wxRuntime.setUserCloudStorage({
      KVDataList: [
        { key: RANK_SCORE_KEY, value: String(payload.score) },
        { key: RANK_COMPAT_SCORE_KEY, value: String(payload.score) },
        { key: RANK_DATA_KEY, value: rankData },
      ],
      success: () => {
        this.rankLastSubmitted = signature;
        if (onDone) onDone(true);
      },
      fail: (error) => {
        console.warn('\u597d\u53cb\u699c\u6210\u7ee9\u63d0\u4ea4\u5931\u8d25', error);
        if (onDone) onDone(false);
      },
    });
  }

  postRankMessage(message) {
    try {
      this.rankContext?.postMessage?.({
        scoreKey: RANK_SCORE_KEY,
        compatScoreKey: RANK_COMPAT_SCORE_KEY,
        dataKey: RANK_DATA_KEY,
        defaultAvatar: 'assets/images/ui/default_avatar.png',
        ...message,
      });
    } catch (error) {
      console.warn('\u597d\u53cb\u699c\u6d88\u606f\u53d1\u9001\u5931\u8d25', error);
    }
  }

  ensurePrivacyAuthorized(onDone) {
    if (!wxRuntime?.requirePrivacyAuthorize) {
      onDone(true);
      return;
    }
    wxRuntime.requirePrivacyAuthorize({
      success: () => onDone(true),
      fail: (error) => {
        console.warn('\u9690\u79c1\u6388\u6743\u5931\u8d25\uff0c\u597d\u53cb\u699c\u65e0\u6cd5\u8bfb\u53d6\u5fae\u4fe1\u5173\u7cfb\u94fe\u6570\u636e', error);
        const msg = error?.errno === 1026
          ? '\u8bf7\u5148\u5728\u5fae\u4fe1\u516c\u4f17\u5e73\u53f0\u914d\u7f6e\u9690\u79c1\u4fdd\u62a4\u6307\u5f15'
          : '\u540c\u610f\u9690\u79c1\u4fdd\u62a4\u6307\u5f15\u540e\u53ef\u67e5\u770b\u597d\u53cb\u699c';
        this.showToast(msg);
        onDone(false);
      },
    });
  }

  enterRankTab() {
    this.tab = 'rank';
    this.play('click');
    this.destroyUserInfoButton();
    this.rankScroll = 0;
    this.rankPullDistance = 0;
    this.rankLastRenderMessage = '';
    this.queueCloudSave(0, { force: true, markDirty: false });
    this.ensurePrivacyAuthorized((authorized) => {
      if (!authorized) return;
      this.refreshRankList({ toast: false });
    });
  }

  openGameCircle() {
    this.play('click');
    if (this.gameCircleOpening) return;
    const systemInfo = wxRuntime?.getSystemInfoSync?.() || {};
    const platform = String(systemInfo.platform || '').toLowerCase();
    if (platform && platform !== 'ios' && platform !== 'android') {
      this.showToast('\u8bf7\u5728\u624b\u673a\u5fae\u4fe1\u4e2d\u6253\u5f00\u6e38\u620f\u5708');
      return;
    }
    if (!wxRuntime?.createPageManager) {
      this.showToast('\u5f53\u524d\u7248\u672c\u6682\u4e0d\u652f\u6301\u6e38\u620f\u5708');
      return;
    }
    this.gameCircleOpening = true;
    try {
      if (!this.gameCirclePageManager) this.gameCirclePageManager = wxRuntime.createPageManager();
      const pageManager = this.gameCirclePageManager;
      if (!pageManager?.load) {
        this.gameCircleOpening = false;
        this.showToast('\u5f53\u524d\u7248\u672c\u6682\u4e0d\u652f\u6301\u6e38\u620f\u5708');
        return;
      }
      let pageShown = false;
      const resetOpeningSoon = () => {
        setTimeout(() => {
          this.gameCircleOpening = false;
        }, 800);
      };
      const failOpen = (error) => {
        console.warn('\u6e38\u620f\u5708\u52a0\u8f7d\u6216\u6253\u5f00\u5931\u8d25', error);
        this.gameCircleOpening = false;
        this.showToast('\u6e38\u620f\u5708\u6253\u5f00\u5931\u8d25');
      };
      const showPage = () => {
        if (pageShown) return;
        pageShown = true;
        try {
          const showResult = pageManager.show?.({
            fail: (error) => {
              failOpen(error);
            },
            complete: () => {
              this.gameCircleOpening = false;
            },
          });
          if (showResult?.then) showResult.then(resetOpeningSoon).catch(failOpen);
          else resetOpeningSoon();
          if (!pageManager.show) this.gameCircleOpening = false;
        } catch (error) {
          console.warn('\u6e38\u620f\u5708\u6253\u5f00\u5f02\u5e38', error);
          this.gameCircleOpening = false;
          this.showToast('\u6e38\u620f\u5708\u6253\u5f00\u5931\u8d25');
        }
      };
      const loadResult = pageManager.load({
        openlink: GAME_CIRCLE_OPENLINK,
        success: showPage,
        fail: failOpen,
        complete: () => {
          if (!pageManager.show) this.gameCircleOpening = false;
        },
      });
      if (loadResult?.then) loadResult.then(showPage).catch(failOpen);
    } catch (error) {
      console.warn('\u6e38\u620f\u5708\u521d\u59cb\u5316\u5931\u8d25', error);
      this.gameCircleOpening = false;
      this.showToast('\u6e38\u620f\u5708\u6682\u4e0d\u53ef\u7528');
    }
  }

  refreshRankList(options = {}) {
    if (this.rankRefreshing) return;
    this.rankRefreshing = true;
    this.rankPullDistance = 0;
    this.rankLastRenderMessage = '';
    this.submitRankScore(() => {
      setTimeout(() => {
        this.postRankMessage({ type: 'refreshRank' });
        this.rankRefreshing = false;
        if (options.toast !== false) this.showToast('\u6392\u884c\u699c\u5df2\u66f4\u65b0');
      }, 350);
    });
  }

  destroyUserInfoButton() {
    if (this.userInfoButton) {
      this.userInfoButton.hide?.();
      this.userInfoButton.destroy?.();
    }
    this.userInfoButton = null;
    this.userInfoButtonRect = null;
  }

  initCloud() {
    if (!wxRuntime?.cloud?.init || !wxRuntime?.cloud?.database) return;
    const tryInit = (retriesLeft) => {
      try {
        wxRuntime.cloud.init({
          env: CLOUD_ENV_ID,
          traceUser: true,
        });
        this.cloudReady = true;
        this.cloudDocId = wxRuntime.getStorageSync?.(CLOUD_DOC_ID_KEY) || '';
        this.cloudUserId = wxRuntime.getStorageSync?.(CLOUD_USER_ID_KEY) || '';
      } catch (error) {
        if (retriesLeft > 0) {
          console.warn('\u4e91\u5f00\u53d1\u521d\u59cb\u5316\u5931\u8d25\uff0c1\u79d2\u540e\u91cd\u8bd5', error);
          setTimeout(() => tryInit(retriesLeft - 1), 1000);
        } else {
          this.cloudReady = false;
          console.warn('\u4e91\u5f00\u53d1\u521d\u59cb\u5316\u5931\u8d25\uff0c\u5c06\u7ee7\u7eed\u4f7f\u7528\u672c\u5730\u5b58\u6863', error);
        }
      }
    };
    tryInit(5);
  }

  // 云函数调用包装：自动重试，减少网络波动导致的失败
  callCloudFunction(params) {
    // ── PC端适配：更多重试、更长间隔 ──
    const maxRetries = this.isPC ? 8 : 5;
    const retryDelay = this.isPC ? 1000 : 500;
    const call = () => wxRuntime.cloud.callFunction(params);
    const attempt = (retriesLeft) => call().catch((error) => {
      if (retriesLeft <= 0) throw error;
      console.warn('云函数调用失败，重试中', params.name, `剩余${retriesLeft}次`, error);
      return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(() => attempt(retriesLeft - 1));
    });
    return attempt(maxRetries);
  }

  ensureCloudUserId() {
    if (!this.cloudReady || !wxRuntime?.cloud?.callFunction) return Promise.resolve('');
    return this.callCloudFunction({
      name: CLOUD_LOGIN_FUNCTION,
      data: {
        profile: this.userProfile || {},
        device: this.deviceSnapshot(),
        clientVersion: String(SAVE_VERSION),
      },
    }).then((res) => {
      const openid = res.result?.openid || res.result?.OPENID || '';
      if (openid) {
        this.cloudUserId = openid;
        this.cloudDocId = openid;
        wxRuntime?.setStorageSync?.(CLOUD_USER_ID_KEY, openid);
        wxRuntime?.setStorageSync?.(CLOUD_DOC_ID_KEY, openid);
      }
      this.applyCloudLoginInfo(res.result || {});
      return openid || this.cloudUserId;
    }).catch((error) => {
      console.warn('\u83b7\u53d6\u5fae\u4fe1\u7528\u6237\u552f\u4e00ID\u5931\u8d25\uff0c\u5c06\u4e34\u65f6\u4f7f\u7528\u4e91\u6570\u636e\u5e93 _openid \u67e5\u8be2', error);
      return this.cloudUserId || '';
    });
  }

  pullCloudSave() {
    if (!this.cloudReady || !wxRuntime?.cloud?.callFunction) return;
    const handleDoc = (doc) => {
      if (!doc) {
        this.cloudPullDone = true;
        this.queueCloudSave(0);
        return;
      }
      this.cloudDocId = doc._id;
      wxRuntime?.setStorageSync?.(CLOUD_DOC_ID_KEY, doc._id);
      const cloudSave = this.normalizeSave(this.saveFromGameStateDoc(doc));
      const localTime = Number(this.save.updatedAt) || 0;
      const cloudTime = Number(cloudSave.updatedAt || doc.updated_at || doc.updatedAt) || 0;
      const merged = this.mergeSaves(this.save, cloudSave);
      this.cloudPullDone = true;
      if (cloudTime >= localTime) {
        this.saveData(merged, { syncCloud: false });
      } else {
        this.save = merged;
        this.saveLocal(merged);
        this.queueCloudSave(0);
      }
      if (this.scene === 'menu' && this.tab === 'levels') this.jumpToLatestLevelPage();
    };
    const request = this.ensureCloudUserId()
      .then(() => this.callCloudFunction({
        name: CLOUD_GAME_STATE_FUNCTION,
        data: { action: 'get' },
      }))
      .then((res) => handleDoc(res.result?.state || null));
    request.catch((error) => {
      this.cloudPullDone = true;
      this.queueCloudSave(3000);
      console.warn('\u8bfb\u53d6\u4e91\u7aef\u5b58\u6863\u5931\u8d25\uff0c\u5c06\u7ee7\u7eed\u4f7f\u7528\u672c\u5730\u5b58\u6863', error);
    });
  }

  normalizeSave(save) {
    if (save?.version !== SAVE_VERSION) return this.defaultSave();
    const data = merge(this.defaultSave(), save || {});
    if (!Array.isArray(data.ownedThemes)) data.ownedThemes = ['theme_default'];
    if (!Array.isArray(data.ownedCharacterSkins)) data.ownedCharacterSkins = ['cat_orange'];
    if (!data.ownedThemes.includes('theme_default')) data.ownedThemes.unshift('theme_default');
    if (!data.ownedCharacterSkins.includes('cat_orange')) data.ownedCharacterSkins.unshift('cat_orange');
    data.coins = Math.max(0, Number(data.coins) || 0);
    data.updatedAt = Number(data.updatedAt) || 0;
    data.highestUnlockedLevel = Math.max(1, Math.min(this.levels.length || 1, data.highestUnlockedLevel || 1));
    return data;
  }

  saveFromGameStateDoc(doc = {}) {
    if (doc.save) return doc.save;
    if (doc.legacy_save_snapshot) {
      const legacy = { ...doc.legacy_save_snapshot };
      legacy.updatedAt = Number(doc.updated_at || legacy.updatedAt) || Date.now();
      return legacy;
    }
    return {
      version: SAVE_VERSION,
      updatedAt: Number(doc.updated_at || doc.updatedAt) || 0,
      coins: Number(doc.coins) || 0,
      highestUnlockedLevel: Number(doc.highest_unlocked_level) || 1,
      levelProgress: doc.level_progress || {},
      currentTheme: doc.current_theme || 'theme_default',
      ownedThemes: Array.isArray(doc.owned_themes) ? doc.owned_themes : ['theme_default'],
      currentCharacterSkin: doc.current_character_skin || 'cat_orange',
      ownedCharacterSkins: Array.isArray(doc.owned_character_skins) ? doc.owned_character_skins : ['cat_orange'],
      adProgress: doc.ad_progress || {},
      rewardedAds: doc.rewarded_ads_snapshot || { shopCoinsTotal: 0, shopCoinsDay: '', shopCoinsToday: 0 },
      items: doc.items || {
        // hintTicket: 3,
        undoTicket: 0,
        addStepTicket: 0,
        skipTicket: 0,
      },
    };
  }

  gameStatePayload() {
    const save = deepClone(this.save);
    const now = Date.now();
    return {
      user_id: this.cloudUserId || this.cloudDocId || '',
      openid: this.cloudUserId || this.cloudDocId || '',
      coins: Math.max(0, Number(save.coins) || 0),
      highest_unlocked_level: Math.max(1, Number(save.highestUnlockedLevel) || 1),
      current_theme: save.currentTheme || 'theme_default',
      owned_themes: Array.isArray(save.ownedThemes) ? save.ownedThemes : ['theme_default'],
      current_character_skin: save.currentCharacterSkin || 'cat_orange',
      owned_character_skins: Array.isArray(save.ownedCharacterSkins) ? save.ownedCharacterSkins : ['cat_orange'],
      items: save.items || {},
      ad_progress: save.adProgress || {},
      rewarded_ads_snapshot: save.rewardedAds || {},
      level_progress: save.levelProgress || {},
      legacy_save_snapshot: save,
      save_version: save.version || SAVE_VERSION,
      nickname: this.userProfile?.nickName || this.userProfile?.nickname || '',
      profile: this.userProfile || {},
      device: this.deviceSnapshot(),
      updated_at: save.updatedAt || now,
    };
  }

  mergeSaves(localSave, cloudSave) {
    const localTime = Number(localSave.updatedAt) || 0;
    const cloudTime = Number(cloudSave.updatedAt) || 0;
    const newer = cloudTime >= localTime ? cloudSave : localSave;
    const older = cloudTime >= localTime ? localSave : cloudSave;
    const mergedProgress = { ...(older.levelProgress || {}) };
    Object.keys(cloudSave.levelProgress || {}).forEach((key) => {
      const a = mergedProgress[key] || {};
      const b = cloudSave.levelProgress[key] || {};
      mergedProgress[key] = {
        passed: !!(a.passed || b.passed),
        stars: Math.max(a.stars || 0, b.stars || 0),
        bestSteps: a.bestSteps && b.bestSteps ? Math.min(a.bestSteps, b.bestSteps) : (a.bestSteps || b.bestSteps || 0),
      };
    });
    Object.keys(localSave.levelProgress || {}).forEach((key) => {
      const a = mergedProgress[key] || {};
      const b = localSave.levelProgress[key] || {};
      mergedProgress[key] = {
        passed: !!(a.passed || b.passed),
        stars: Math.max(a.stars || 0, b.stars || 0),
        bestSteps: a.bestSteps && b.bestSteps ? Math.min(a.bestSteps, b.bestSteps) : (a.bestSteps || b.bestSteps || 0),
      };
    });
    const merged = {
      ...newer,
      coins: Math.max(0, Number(newer.coins) || 0),
      highestUnlockedLevel: Math.max(localSave.highestUnlockedLevel || 1, cloudSave.highestUnlockedLevel || 1),
      levelProgress: mergedProgress,
      ownedThemes: Array.from(new Set([...(cloudSave.ownedThemes || []), ...(localSave.ownedThemes || [])])),
      ownedCharacterSkins: Array.from(new Set([...(cloudSave.ownedCharacterSkins || []), ...(localSave.ownedCharacterSkins || [])])),
      rewardedAds: cloudTime >= localTime ? cloudSave.rewardedAds : localSave.rewardedAds,
      adProgress: cloudTime >= localTime ? cloudSave.adProgress : localSave.adProgress,
      items: cloudTime >= localTime ? cloudSave.items : localSave.items,
      updatedAt: Math.max(localTime, cloudTime, Date.now()),
    };
    merged.highestUnlockedLevel = this.contiguousUnlockedLevel(merged.levelProgress);
    if (!merged.ownedThemes.includes('theme_default')) merged.ownedThemes.unshift('theme_default');
    if (!merged.ownedCharacterSkins.includes('cat_orange')) merged.ownedCharacterSkins.unshift('cat_orange');
    if (!this.availableThemes().some((theme) => theme.id === merged.currentTheme) || !merged.ownedThemes.includes(merged.currentTheme)) merged.currentTheme = 'theme_default';
    if (!merged.ownedCharacterSkins.includes(merged.currentCharacterSkin)) merged.currentCharacterSkin = 'cat_orange';
    return merged;
  }

  applyCloudLoginInfo(info = {}) {
    this.userLoginInfo = {
      riskLevel: Number(info.riskLevel) || 0,
      dailyAdLimit: Number(info.dailyAdLimit) || 0,
      loginDays: Number(info.loginDays) || 0,
      continuousLoginDays: Number(info.continuousLoginDays) || 0,
      isSuperAdmin: info.isSuperAdmin === true,
      isHintAdmin: info.isHintAdmin === true,
    };
    if (Array.isArray(info.grantedSkins) && info.grantedSkins.length) {
      const owned = new Set(this.save.ownedCharacterSkins || []);
      info.grantedSkins.forEach((skinId) => {
        if (skinId) owned.add(skinId);
      });
      this.save.ownedCharacterSkins = Array.from(owned);
      this.saveData(this.save, { syncCloud: true });
      this.showToast('\u767b\u5f55\u5956\u52b1\u5df2\u5230\u8d26');
    }
  }

  isSuperAdmin() {
    return this.userLoginInfo?.isSuperAdmin === true;
  }

  hasUnlimitedHints() {
    return this.config.game.adminUnlimitedHint === true && this.userLoginInfo?.isHintAdmin === true;
  }

  startCloudPeriodicSync() {
    if (this.cloudPeriodicTimer || typeof setInterval === 'undefined') return;
    this.cloudPeriodicTimer = setInterval(() => {
      if (this.cloudDirty) this.queueCloudSave(0, { markDirty: false });
    }, CLOUD_PERIODIC_SYNC_INTERVAL);
  }

  queueCloudSave(delay = CLOUD_SYNC_DEBOUNCE, options = {}) {
    if (options.markDirty !== false) this.cloudDirty = true;
    if (!this.cloudReady || !this.cloudPullDone) return;
    if (this.cloudSyncTimer) clearTimeout(this.cloudSyncTimer);
    this.cloudSyncTimer = setTimeout(() => this.flushCloudSave(!!options.force), delay);
  }

  flushCloudSave(force = false) {
    if (!this.cloudReady || !wxRuntime?.cloud?.callFunction) return;
    if (!force && !this.cloudDirty) return;
    if (this.cloudSyncing) {
      this.cloudSyncPending = true;
      return;
    }
    const payload = this.gameStatePayload();
    this.cloudSyncing = true;
    const docId = this.cloudUserId || this.cloudDocId;
    if (!docId) {
      this.cloudSyncing = false;
      this.queueCloudSave(3000);
      return;
    }
    const request = this.callCloudFunction({
      name: CLOUD_GAME_STATE_FUNCTION,
      data: {
        action: 'save',
        state: { ...payload, created_at: this.save.createdAt || Date.now() },
      },
    });
    request.then((res) => {
      if (docId) {
        this.cloudDocId = docId;
        wxRuntime?.setStorageSync?.(CLOUD_DOC_ID_KEY, docId);
      }
      this.cloudLastSyncedAt = Date.now();
      this.cloudDirty = false;
    }).catch((error) => {
      console.warn('\u540c\u6b65\u4e91\u7aef\u5b58\u6863\u5931\u8d25\uff0c\u7a0d\u540e\u4f1a\u7ee7\u7eed\u4f7f\u7528\u672c\u5730\u5b58\u6863', error);
    }).finally(() => {
      this.cloudSyncing = false;
      if (this.cloudSyncPending) {
        this.cloudSyncPending = false;
        this.queueCloudSave(300);
      }
    });
  }

  deviceSnapshot() {
    try {
      const info = wxRuntime?.getDeviceInfo?.() || wxRuntime?.getSystemInfoSync?.() || {};
      return {
        brand: info.brand || '',
        model: info.model || '',
        platform: info.platform || '',
        system: info.system || '',
      };
    } catch (error) {
      return {};
    }
  }

  bindEvents() {
    wxRuntime?.onTouchStart?.((event) => this.onTouchStart(event));
    wxRuntime?.onTouchMove?.((event) => this.onTouchMove(event));
    wxRuntime?.onTouchEnd?.((event) => this.onTouchEnd(event));
    wxRuntime?.onTouchCancel?.((event) => this.onTouchEnd(event));
    wxRuntime?.onWindowResize?.(() => this.resize());
  }

  initShare() {
    if (!wxRuntime) return;
    try {
      wxRuntime.showShareMenu?.({
        withShareTicket: true,
        menus: ['shareAppMessage'],
        fail: (error) => console.warn('\u5f00\u542f\u8f6c\u53d1\u83dc\u5355\u5931\u8d25', error),
      });
      wxRuntime.onShareAppMessage?.(() => this.sharePayload());
    } catch (error) {
      console.warn('\u521d\u59cb\u5316\u8f6c\u53d1\u529f\u80fd\u5931\u8d25', error);
    }
  }

  sharePayload() {
    const levelId = this.currentLevel?.levelId || this.save?.highestUnlockedLevel || 1;
    return {
      title: SHARE_TITLE,
      imageUrlId: SHARE_IMAGE_URL_ID,
      imageUrl: SHARE_IMAGE_URL,
      query: `level=${encodeURIComponent(String(levelId))}`,
    };
  }

  shareGame() {
    this.play('click');
    if (!wxRuntime?.shareAppMessage) {
      this.showToast('\u5f53\u524d\u7248\u672c\u6682\u4e0d\u652f\u6301\u5206\u4eab');
      return;
    }
    try {
      wxRuntime.shareAppMessage(this.sharePayload());
    } catch (error) {
      console.warn('\u4e3b\u52a8\u8f6c\u53d1\u5931\u8d25', error);
      this.showToast('\u5206\u4eab\u6682\u65f6\u4e0d\u53ef\u7528');
    }
  }

  startLoading() {
    this.loadingProgress = 0;
    const characterPaths = this.visibleCharacterSkins()
      .flatMap((skin) => FACING_DIRECTIONS.map((facing) => characterImagePath(skin.id, facing)));
    const imagePaths = [...Object.values(ASSET.image), ...characterPaths];
    const total = imagePaths.length;
    let done = 0;
    Promise.all(imagePaths.map((path) => this.loadImage(path).finally(() => {
      done += 1;
      this.loadingProgress = total ? done / total : 1;
    }))).then(() => {
      this.loadingProgress = 1;
      this.playMusic('bgm');
    });
  }

  loadImage(path) {
    if (this.images.has(path)) return Promise.resolve(this.images.get(path));
    return new Promise((resolve) => {
      if (!wxRuntime?.createImage) {
        resolve(null);
        return;
      }
      const image = wxRuntime.createImage();
      const candidates = [path, `/${path}`, `./${path}`];
      let index = 0;
      image.onload = () => {
        this.images.set(path, image);
        resolve(image);
      };
      image.onerror = () => {
        index += 1;
        if (index < candidates.length) {
          image.src = candidates[index];
          return;
        }
        this.images.set(path, null);
        resolve(null);
      };
      image.src = candidates[index];
    });
  }

  getTheme() {
    return this.availableThemes().find((theme) => theme.id === this.save.currentTheme) || THEMES[0];
  }

  availableThemes() {
    return THEMES.filter((theme) => !theme.hidden);
  }

  adsHidden() {
    // ── PC端适配：PC不支持激励视频广告 ──
    if (this.isPC) return true;
    return this.config.game.hideAdFeatures === true || this.config.game.showAdButtons === false || this.config.ads.enabled === false;
  }

  addStepsAdEnabled() {
    const reward = this.config.ads?.rewards?.addSteps || {};
    return this.config.ads?.enabled === true
      && reward.enabled !== false
      && !!(reward.adUnitId || this.config.ads?.adUnitId)
      && !this.resultOverlay;
  }

  addStepsButtonLabel() {
    if (this.addStepsPending) return '\u62c9\u53d6\u4e2d';
    if (this.addStepsUsed) return '\u5df2\u52a0\u6b65';
    return '+6\u6b65';
  }

  gameBannerReserve() {
    return this.scene === 'game' ? GAME_BANNER_RESERVED_HEIGHT : 0;
  }

  customAdConfig() {
    return this.config.ads?.custom || {};
  }

  customAdEnabled() {
    const config = this.customAdConfig();
    return this.config.ads?.enabled === true
      && config.enabled !== false
      && !!config.adUnitId
      && !!wxRuntime?.createCustomAd;
  }

  customAdRect() {
    const config = this.customAdConfig();
    const safeInset = Math.max(0, this.height - this.safeBottom);
    const height = Math.max(82, Number(config.height) || 104);
    const bottom = Math.max(0, Number(config.bottom) || 8);
    const width = Math.max(280, Math.min(this.width, Number(config.width) || this.width));
    const left = Math.max(0, (this.width - width) / 2);
    const top = Math.max(this.safeTop, this.height - safeInset - height - bottom);
    return {
      left: Math.round(left),
      top: Math.round(top),
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  syncCustomAdVisibility() {
    if (this.scene !== 'game' || this.resultOverlay || this.failureOverlay || this.tutorialOverlay) {
      this.hideCustomAd();
      return;
    }
    if (!this.customAdEnabled()) return;
    this.showCustomAd();
  }

  showCustomAd() {
    const config = this.customAdConfig();
    const rect = this.customAdRect();
    const styleKey = `${config.adUnitId}:${rect.left}:${rect.top}:${rect.width}:${rect.height}`;
    if (this.customAd && this.customAdStyleKey !== styleKey) this.destroyCustomAd();
    if (!this.customAd) {
      if (Date.now() < this.customAdRetryAt) return;
      try {
        const ad = wxRuntime.createCustomAd({
          adUnitId: config.adUnitId,
          style: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            fixed: true,
          },
        });
        this.customAd = ad;
        this.customAdStyleKey = styleKey;
        ad.onError?.((error) => {
          console.warn('\u539f\u751f\u5e7f\u544a\u52a0\u8f7d\u5931\u8d25', error);
          this.customAdRetryAt = Date.now() + 30000;
        });
        ad.onClose?.(() => {
          this.customAdVisible = false;
          if (this.scene === 'game') this.customAdRetryAt = Date.now() + 1200;
        });
      } catch (error) {
        console.warn('\u521b\u5efa\u539f\u751f\u5e7f\u544a\u5931\u8d25', error);
        this.customAdRetryAt = Date.now() + 30000;
        return;
      }
    }
    if (Date.now() < this.customAdRetryAt) return;
    if (this.customAdVisible) return;
    try {
      const shown = this.customAd.show?.();
      if (shown?.then) {
        shown.then(() => {
          this.customAdVisible = true;
        }).catch((error) => {
          console.warn('\u539f\u751f\u5e7f\u544a\u5c55\u793a\u5931\u8d25', error);
          this.customAdRetryAt = Date.now() + 30000;
        });
      } else {
        this.customAdVisible = true;
      }
    } catch (error) {
      console.warn('\u539f\u751f\u5e7f\u544a\u5c55\u793a\u5931\u8d25', error);
      this.customAdRetryAt = Date.now() + 30000;
    }
  }

  hideCustomAd() {
    if (!this.customAd || !this.customAdVisible) return;
    try {
      this.customAd.hide?.();
    } catch (error) {
      console.warn('\u9690\u85cf\u539f\u751f\u5e7f\u544a\u5931\u8d25', error);
    }
    this.customAdVisible = false;
  }

  destroyCustomAd() {
    if (!this.customAd) return;
    try {
      this.customAd.destroy?.();
    } catch (error) {
      console.warn('\u9500\u6bc1\u539f\u751f\u5e7f\u544a\u5931\u8d25', error);
    }
    this.customAd = null;
    this.customAdVisible = false;
    this.customAdStyleKey = '';
  }

  visibleCharacterSkins() {
    const hidden = new Set(this.config.game.hiddenCharacterSkins || []);
    return CHARACTER_SKINS.filter((skin) => !hidden.has(skin.id));
  }

  loop() {
    this.updateGameEffects();
    this.render();
    this.syncCustomAdVisibility();
    this.raf = requestAnimationFrame(this.loop);
  }

  render() {
    this.buttons = [];
    // ── PC端适配：全屏清空，游戏区域居中偏移 ──
    if (this.isPC && this.pcOffsetX) {
      this.ctx.clearRect(0, 0, this.width + this.pcOffsetX * 2, this.height);
      // 两侧留白
      this.ctx.fillStyle = '#f0f4f8';
      this.ctx.fillRect(0, 0, this.pcOffsetX, this.height);
      this.ctx.fillRect(this.pcOffsetX + this.width, 0, this.pcOffsetX, this.height);
      this.ctx.save();
      this.ctx.translate(this.pcOffsetX, 0);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    if (this.scene === 'home') this.renderHome();
    if (this.scene === 'menu') this.renderMenu();
    if (this.scene === 'game') {
      this.destroyUserInfoButton();
      this.renderGame();
    }
    this.renderToast();
    if (this.isPC && this.pcOffsetX) {
      this.ctx.restore();
    }
  }

  renderLoading() {
    const ctx = this.ctx;
    this.drawPageBackground('#f7f9ff', '#e8f1ff');
    const cx = this.width / 2;
    const cy = this.height * 0.36;
    this.drawImageContain(ASSET.image.logo, cx - 62, cy - 62, 124, 124);
    this.text('\u840c\u5ba0\u51fa\u9003\u8bb0', cx, cy + 110, 40, '#202633', 'center', 'bold');
    this.text('\u6b63\u5728\u6574\u7406\u65b9\u5757\u548c\u51fa\u53e3', cx, cy + 152, 18, '#778091', 'center');
    const barW = Math.min(330, this.width - 64);
    const barY = cy + 195;
    this.roundRect(cx - barW / 2, barY, barW, 14, 7, '#d4dceb');
    this.roundRect(cx - barW / 2, barY, Math.max(10, barW * this.loadingProgress), 14, 7, '#ffb020');
    this.text(`\u8d44\u6e90\u52a0\u8f7d ${Math.floor(this.loadingProgress * 100)}%`, cx, barY + 44, 16, '#556070', 'center');
  }

  renderHome() {
    this.drawPageBackground('#f7f9ff', '#e8f1ff', ASSET.image.home);
    const cx = this.width / 2;
    const heroTop = Math.max(this.safeTop + 43, this.height * 0.06);
    const logo = Math.min(108, this.width * 0.25);
    const logoY = heroTop;
    const titleY = logoY + logo + 44;
    const actionY = titleY + 52;
    const startRect = { x: cx - 150, y: actionY, w: 300, h: 66 };
    this.drawImageContain(ASSET.image.logo, cx - logo / 2, logoY, logo, logo);
    this.text('\u840c\u5ba0\u51fa\u9003\u8bb0', cx, titleY, 42, '#202633', 'center', 'bold', '#ffffff');
    if (this.loadingProgress >= 1) {
      this.button('\u5f00\u59cb\u6e38\u620f', startRect.x, startRect.y, startRect.w, startRect.h, () => this.startGameFromHome(), { fill: '#ffb020', stroke: '#ffffff', text: '#2f230e', fontSize: 28, radius: 10, pressFill: '#f2a30d' });
      this.destroyUserInfoButton();
    } else {
      this.destroyUserInfoButton();
      const barW = Math.min(300, this.width - 76);
      const barY = actionY + 25;
      this.roundRect(cx - barW / 2, barY, barW, 14, 7, '#d4dceb');
      this.roundRect(cx - barW / 2, barY, Math.max(10, barW * this.loadingProgress), 14, 7, '#ffb020');
      this.text(`\u8d44\u6e90\u52a0\u8f7d ${Math.floor(this.loadingProgress * 100)}%`, cx, barY + 42, 16, '#556070', 'center', 'bold', '#ffffff');
    }
    const ageW = Math.min(78, this.width * 0.2);
    const ageH = ageW * 1.293;
    const ageX = this.width - ageW - 22;
    const aiNoteY = this.height - 40;
    const ageY = aiNoteY - ageH - 56;
    const healthH = 158;
    const preferredHealthY = startRect.y + startRect.h + 62;
    const maxHealthY = ageY - healthH - 26;
    const healthY = Math.min(preferredHealthY, maxHealthY);
    this.text('\u5065\u5eb7\u6e38\u620f\u5fe0\u544a', cx, healthY + 30, 28, '#202633', 'center', 'normal', '#ffffff');
    const notices = [
      '\u62b5\u5236\u4e0d\u826f\u6e38\u620f\uff0c\u62d2\u7edd\u76d7\u7248\u6e38\u620f\u3002',
      '\u6ce8\u610f\u81ea\u6211\u4fdd\u62a4\uff0c\u8c28\u9632\u53d7\u9a97\u4e0a\u5f53\u3002',
      '\u9002\u5ea6\u6e38\u620f\u76ca\u8111\uff0c\u6c89\u8ff7\u6e38\u620f\u4f24\u8eab\u3002',
      '\u5408\u7406\u5b89\u6392\u65f6\u95f4\uff0c\u4eab\u53d7\u5065\u5eb7\u751f\u6d3b\u3002',
    ];
    notices.forEach((notice, index) => {
      this.text(notice, cx, healthY + 72 + index * 29, 20, '#607083', 'center', 'normal', '#ffffff');
    });
    this.wrappedText('\u90e8\u5206\u7d20\u6750\u3001\u97f3\u4e50\u4e0e\u8f85\u52a9\u4ee3\u7801\u7531 AI \u5de5\u5177\u534f\u52a9\u751f\u6210\uff0c\u6700\u7ec8\u5185\u5bb9\u5df2\u7531\u5f00\u53d1\u8005\u6574\u7406\u4e0e\u5ba1\u6838\u3002', 22, aiNoteY, Math.max(210, ageX - 42), 12, 17, '#778091', 'left');
    this.drawImageContain(ASSET.image.ageHint8, ageX, ageY, ageW, ageH);
  }

  startGameFromHome() {
    this.play('click');
    this.enterMenuFromHome();
  }

  enterMenuFromHome() {
    this.destroyUserInfoButton();
    this.scene = 'menu';
    this.tab = 'levels';
    this.jumpToLatestLevelPage();
  }

  renderMenu() {
    this.drawPageBackground('#f7f9ff', '#e8f1ff', ASSET.image.home);
    const top = Math.max(this.safeTop + 10, (this.menuButton?.bottom || 0) + 6);
    const title = this.tab === 'levels' ? '\u9009\u62e9\u5173\u5361' : this.tab === 'shop' ? '\u5546\u5e97' : '\u6392\u884c\u699c';
    this.text(title, this.width / 2, top + 28, 30, '#202633', 'center', 'bold', '#ffffff');
    const chipW = Math.min(92, Math.max(76, this.width * 0.23));
    const chipsX = this.width - chipW - 14;
    this.statChip(chipsX, top + 4, chipW, 27, ASSET.image.coinIcon, this.save.coins);
    this.statChip(chipsX, top + 35, chipW, 27, ASSET.image.starIcon, this.totalStars());
    this.renderGameCircleButton(18, top + 8);
    const tabGap = 2;
    const tabW = Math.min(112, (this.width - 60) / 3);
    const tabTotalW = tabW * 3 + tabGap * 2;
    const tabStartX = this.width / 2 - tabTotalW / 2;
    const tabs = [['levels', '\u5173\u5361'], ['shop', '\u5546\u5e97'], ['rank', '\u6392\u884c']];
    const tabY = top + 98;
    tabs.forEach(([id, label], i) => {
      const tabRect = { x: tabStartX + i * (tabW + tabGap), y: tabY, w: tabW, h: 42 };
      this.button(label, tabRect.x, tabRect.y, tabRect.w, tabRect.h, () => {
        if (id === 'rank') {
          this.enterRankTab();
        } else {
          this.tab = id;
          if (id === 'levels') this.jumpToLatestLevelPage();
          this.play('click');
          this.destroyUserInfoButton();
        }
      }, {
        fill: this.tab === id ? '#ffb020' : 'rgba(255,255,255,0.88)',
        stroke: this.tab === id ? '#ffffff' : '#d8e1f0',
        text: this.tab === id ? '#2f230e' : '#536173',
        fontSize: 18,
      });
    });
    const contentTop = top + 150;
    if (this.tab === 'levels') this.renderLevelMenu(contentTop);
    if (this.tab === 'shop') this.renderShop(contentTop);
    if (this.tab === 'rank') this.renderRank(contentTop);
    if (this.tab !== 'rank') this.destroyUserInfoButton();
  }

  renderGameCircleButton(x, y) {
    const w = 72;
    const h = 62;
    const button = { x, y, w, h, action: () => this.openGameCircle() };
    this.buttons.push(button);
    const pressed = this.pressedPoint && this.inRect(this.pressedPoint, button);
    const drawY = y + (pressed ? 3 : 0);
    if (!pressed) this.roundRect(x + 1, y + 4, w, h, 18, 'rgba(15,23,42,0.08)');
    this.roundRect(x, drawY, w, h, 18, 'rgba(255,255,255,0.94)', '#bfe8c4', 1.8);
    const cx = x + w / 2;
    this.drawImageContain(ASSET.image.gameCircleIcon, cx - 22, drawY + 4, 44, 44);
    this.text('\u6e38\u620f\u5708', cx, drawY + h - 7, 12, '#125c39', 'center', 'bold');
  }

  renderLevelMenu(y) {
    const panel = this.panelRect(y);
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 14, 'rgba(255,255,255,0.92)', '#dbe4f1', 2);
    const totalPages = Math.max(1, Math.ceil(this.levels.length / 9));
    this.page = clamp(this.page, 0, totalPages - 1);
    const pageGate = this.levelPageGate(this.page);
    const pageUnlocked = pageGate.unlocked;
    const gridTop = panel.y + 34;
    const gridBottom = panel.y + panel.h - 112;
    const tile = Math.min(88, (panel.w - 86) / 3, (gridBottom - gridTop - 34) / 3);
    const space = Math.min(18, Math.max(12, tile * 0.2));
    const gap = tile + space;
    const gridW = tile * 3 + space * 2;
    const gridH = tile * 3 + space * 2;
    const startX = panel.x + panel.w / 2 - gridW / 2;
    const startY = gridTop + Math.max(0, (gridBottom - gridTop - gridH) / 2);
    this.levels.slice(this.page * 9, this.page * 9 + 9).forEach((level, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * gap;
      const yy = startY + row * gap;
      const progress = this.levelProgress(level.levelId);
      const sequentialLevel = this.contiguousUnlockedLevel();
      const unlocked = pageUnlocked && level.levelId <= sequentialLevel;
      const current = level.levelId === sequentialLevel;
      this.renderLevelTile(level, x, yy, tile, {
        unlocked,
        current,
        progress,
        onTap: () => {
          if (!unlocked) return;
          this.startLevel(level.levelId);
        },
      });
    });
    if (!pageUnlocked) {
      this.renderLevelPageLock({ x: startX - space / 2, y: startY - space / 2, w: gridW + space, h: gridH + space }, pageGate);
    }
    const pagerY = panel.y + panel.h - 88;
    this.renderLevelPager(panel, pagerY, totalPages);
    const quickW = Math.min(132, (panel.w - 88) / 2);
    const quickGap = 22;
    const quickY = panel.y + panel.h - 48;
    this.button('\u6700\u65b0', panel.x + panel.w / 2 - quickW - quickGap / 2, quickY, quickW, 36, () => {
      this.page = this.highestUnlockedPageByStars(Math.floor((this.contiguousUnlockedLevel() - 1) / 9));
    }, { fill: '#fff6df', stroke: '#ffcf77', text: '#6b470b', fontSize: 15, radius: 9 });
    this.button('\u8865\u661f', panel.x + panel.w / 2 + quickGap / 2, quickY, quickW, 36, () => {
      const index = this.levels.findIndex((level) => {
        const progress = this.levelProgress(level.levelId);
        return level.levelId <= this.contiguousUnlockedLevel() && (!progress.passed || progress.stars < 3);
      });
      if (index >= 0) this.page = this.highestUnlockedPageByStars(Math.floor(index / 9));
      else this.showToast('\u5f53\u524d\u6ca1\u6709\u5f85\u8865\u4e09\u661f\u7684\u5173\u5361');
    }, { fill: '#e9fff5', stroke: '#74d99f', text: '#125c39', fontSize: 15, radius: 9 });
  }

  renderLevelPager(panel, y, totalPages) {
    const cx = panel.x + panel.w / 2;
    const atFirst = this.page <= 0;
    const atLast = this.page >= totalPages - 1;
    const btnSize = 40;
    const textW = 74;
    const gap = 16;
    const rowY = y - btnSize / 2 - 2;
    const leftX = cx - textW / 2 - gap - btnSize;
    const rightX = cx + textW / 2 + gap;
    this.iconButton(leftX, rowY, btnSize, btnSize, 'left', () => {
      if (atFirst) return;
      this.page = clamp(this.page - 1, 0, totalPages - 1);
      this.play('click');
    }, { disabled: atFirst });
    this.roundRect(cx - textW / 2, y - 16, textW, 30, 15, 'rgba(255,255,255,0.72)', '#edf2f8', 1);
    this.text(`${this.page + 1} / ${totalPages}`, cx, y + 5, 17, '#536173', 'center', 'bold');
    this.iconButton(rightX, rowY, btnSize, btnSize, 'right', () => {
      if (atLast) return;
      this.page = clamp(this.page + 1, 0, totalPages - 1);
      this.play('click');
    }, { disabled: atLast });
  }

  iconButton(x, y, w, h, direction, action, options = {}) {
    const button = { x, y, w, h, action, disabled: options.disabled };
    this.buttons.push(button);
    const pressed = !options.disabled && this.pressedPoint && this.inRect(this.pressedPoint, button);
    const drawY = y + (pressed ? 2 : 0);
    const fill = options.disabled ? '#f3f6fb' : pressed ? '#eef6ff' : '#ffffff';
    const stroke = options.disabled ? '#dfe6f1' : '#d8e1f0';
    const color = options.disabled ? '#b5bfcc' : '#2f80ed';
    if (!options.disabled && !pressed) this.roundRect(x, y + 3, w, h, w / 2, 'rgba(15,23,42,0.08)');
    this.roundRect(x, drawY, w, h, w / 2, fill, stroke, 1.8);
    if (!options.disabled) {
      this.circle(x + w / 2, drawY + h / 2, w * 0.28, pressed ? '#dff0ff' : '#eef6ff');
      this.circle(x + w * 0.37, drawY + h * 0.32, w * 0.055, 'rgba(255,255,255,0.86)');
    }
    this.drawPagerArrowIcon(x + w / 2, drawY + h / 2, direction, color, options.disabled);
  }

  drawPagerArrowIcon(cx, cy, direction, color, disabled = false) {
    if (this.images.get(ASSET.image.pagerArrowRight)) {
      const size = 23;
      this.ctx.save();
      this.ctx.globalAlpha = disabled ? 0.34 : 1;
      if (direction === 'left') {
        this.ctx.translate(cx, cy);
        this.ctx.scale(-1, 1);
        this.drawImageContain(ASSET.image.pagerArrowRight, -size / 2, -size / 2, size, size);
      } else {
        this.drawImageContain(ASSET.image.pagerArrowRight, cx - size / 2, cy - size / 2, size, size);
      }
      this.ctx.restore();
      return;
    }
    const dir = direction === 'left' ? -1 : 1;
    const tail = disabled ? '#c5cedb' : '#8cbcf4';
    this.ctx.save();
    this.ctx.strokeStyle = tail;
    this.ctx.lineWidth = 2.4;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - dir * 6, cy);
    this.ctx.lineTo(cx + dir * 4, cy);
    this.ctx.stroke();
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(cx + dir * 7, cy);
    this.ctx.lineTo(cx - dir * 1, cy - 6);
    this.ctx.quadraticCurveTo(cx - dir * 3, cy - 2, cx - dir * 3, cy);
    this.ctx.quadraticCurveTo(cx - dir * 3, cy + 2, cx - dir * 1, cy + 6);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  renderLevelTile(level, x, y, tile, options) {
    const unlocked = !!options.unlocked;
    const current = !!options.current;
    const progress = options.progress || { passed: false, stars: 0 };
    const button = { x, y, w: tile, h: tile, action: options.onTap, disabled: !unlocked };
    this.buttons.push(button);
    const pressed = unlocked && this.pressedPoint && this.inRect(this.pressedPoint, button);
    const drawY = y + (pressed ? 3 : 0);
    const passed = !!progress.passed;
    const baseFill = !unlocked ? '#f5f7fb' : current ? '#f8fbff' : '#ffffff';
    const stroke = !unlocked ? '#d9e1ec' : current ? '#2f80ed' : passed ? '#bfe8c4' : '#d8e1f0';
    const accent = !unlocked ? '#aeb7c4' : current ? '#2f80ed' : passed ? '#55bd4b' : '#ffb020';
    const numberColor = !unlocked ? '#8e98a7' : current ? '#1f6fd1' : '#283241';
    if (!pressed) this.roundRect(x + 1, y + 5, tile, tile, 11, 'rgba(15,23,42,0.08)');
    this.roundRect(x, drawY, tile, tile, 11, baseFill, stroke, current ? 2.4 : 1.6);
    this.roundRect(x + tile * 0.16, drawY + tile * 0.12, tile * 0.68, Math.max(4, tile * 0.055), 5, accent);
    this.renderLevelStatusBadge(x + tile - tile * 0.16, drawY + tile * 0.17, tile * 0.085, { unlocked, current, passed });
    this.drawCenteredText(String(level.levelId), x + tile / 2, drawY + tile * 0.47, this.levelNumberSize(level.levelId, tile), numberColor, 'bold');
    this.renderStars(x + tile / 2, drawY + tile * 0.82, unlocked && passed ? progress.stars : 0, Math.max(10, tile * 0.14), Math.max(2, tile * 0.032));
  }

  levelNumberSize(levelId, tile) {
    const digits = String(levelId).length;
    if (digits >= 3) return Math.max(24, tile * 0.34);
    if (digits === 2) return Math.max(28, tile * 0.39);
    return Math.max(31, tile * 0.44);
  }

  renderLevelStatusBadge(cx, cy, r, state) {
    if (!state.unlocked) {
      this.circle(cx, cy, r, '#aeb7c4', '#ffffff', 1.5);
      this.text('\u9501', cx, cy + r * 0.38, r * 1.05, '#ffffff', 'center', 'bold');
      return;
    }
    if (state.current) {
      this.circle(cx, cy, r, '#2f80ed', '#ffffff', 1.5);
      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(cx - r * 0.20, cy - r * 0.34);
      this.ctx.lineTo(cx - r * 0.20, cy + r * 0.34);
      this.ctx.lineTo(cx + r * 0.34, cy);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
      return;
    }
    if (state.passed) {
      this.circle(cx, cy, r, '#55bd4b', '#ffffff', 1.5);
      this.ctx.save();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = Math.max(2, r * 0.24);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(cx - r * 0.42, cy - r * 0.02);
      this.ctx.lineTo(cx - r * 0.12, cy + r * 0.30);
      this.ctx.lineTo(cx + r * 0.46, cy - r * 0.34);
      this.ctx.stroke();
      this.ctx.restore();
      return;
    }
    this.circle(cx, cy, r, '#ffb020', '#ffffff', 1.5);
  }

  drawCenteredText(value, x, y, size, color, weight = 'normal') {
    this.ctx.save();
    this.ctx.font = `${weight} ${size}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = color;
    this.ctx.fillText(value, x, y);
    this.ctx.restore();
  }

  levelPageRequirement(page) {
    if (page <= 0) return 0;
    return Math.min(25, 20 + Math.floor((page - 1) / 2));
  }

  levelPageStars(page) {
    const start = page * 9 + 1;
    const end = Math.min(this.levels.length, start + 8);
    let total = 0;
    for (let levelId = start; levelId <= end; levelId += 1) {
      total += this.levelProgress(levelId).stars || 0;
    }
    return total;
  }

  levelPageGate(page) {
    if (page <= 0) return { unlocked: true, required: 0, previousStars: 0 };
    const required = this.levelPageRequirement(page);
    const previousStars = this.levelPageStars(page - 1);
    return {
      unlocked: previousStars >= required,
      required,
      previousStars,
    };
  }

  highestUnlockedPageByStars(targetPage) {
    const totalPages = Math.max(1, Math.ceil(this.levels.length / 9));
    let page = clamp(targetPage, 0, totalPages - 1);
    while (page > 0 && !this.levelPageGate(page).unlocked) page -= 1;
    return page;
  }

  latestUnlockedPage() {
    const latestLevel = this.contiguousUnlockedLevel();
    return this.highestUnlockedPageByStars(Math.floor((latestLevel - 1) / 9));
  }

  jumpToLatestLevelPage() {
    this.page = this.latestUnlockedPage();
  }

  renderLevelPageLock(rect, gate) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(18, 27, 45, 0.56)';
    this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    this.ctx.restore();

    const cardW = Math.min(rect.w - 34, 270);
    const cardH = Math.min(rect.h - 28, 236);
    const cardX = rect.x + rect.w / 2 - cardW / 2;
    const cardY = rect.y + rect.h / 2 - cardH / 2;
    this.roundRect(cardX, cardY + 5, cardW, cardH, 14, 'rgba(0,0,0,0.12)');
    this.roundRect(cardX, cardY, cardW, cardH, 14, 'rgba(255,255,255,0.96)', '#ffcf77', 3);

    const iconSize = Math.min(76, cardH * 0.34);
    const iconX = cardX + cardW / 2 - iconSize / 2;
    const iconY = cardY + 34;
    if (this.images.get(ASSET.image.levelLock)) {
      this.drawImageContain(ASSET.image.levelLock, iconX, iconY, iconSize, iconSize);
    } else {
      this.drawFallbackLock(cardX + cardW / 2, iconY + iconSize / 2, iconSize * 0.44);
    }

    const starText = `${gate.previousStars} / ${gate.required}`;
    const starSize = 28;
    const starGap = 8;
    const starFont = 23;
    this.ctx.save();
    this.ctx.font = `bold ${starFont}px Arial, sans-serif`;
    const textW = this.ctx.measureText(starText).width;
    this.ctx.restore();
    const rowW = starSize + starGap + textW;
    const rowX = cardX + cardW / 2 - rowW / 2;
    const rowY = iconY + iconSize + 34;
    this.drawImageContain(ASSET.image.starIcon, rowX, rowY - starSize + 4, starSize, starSize);
    this.text(starText, rowX + starSize + starGap + textW / 2, rowY, starFont, '#ff9f0a', 'center', 'bold');
    this.text('\u5148\u56de\u524d\u4e00\u9875\u8865\u661f\u5427', cardX + cardW / 2, rowY + 42, 16, '#778091', 'center', 'bold');
  }

  drawFallbackLock(cx, cy, size) {
    const shackleW = size * 1.08;
    const shackleH = size * 0.88;
    this.ctx.save();
    this.ctx.lineWidth = Math.max(6, size * 0.16);
    this.ctx.strokeStyle = '#d88a00';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - size * 0.08, shackleW / 2, Math.PI, Math.PI * 2);
    this.ctx.stroke();
    this.roundRect(cx - size * 0.74, cy - size * 0.06, size * 1.48, size * 1.12, size * 0.22, '#ffb020', '#ffffff', 3);
    this.circle(cx, cy + size * 0.38, size * 0.14, '#7c4a03');
    this.ctx.restore();
  }

  renderShop(y) {
    const panel = this.panelRect(y);
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 14, 'rgba(255,255,255,0.93)', '#dbe4f1', 2);
    const view = { x: panel.x + 14, y: panel.y + 14, w: panel.w - 28, h: panel.h - 28, type: 'shop' };
    this.shopView = view;
    this.ctx.save();
    this.ctx.beginPath();
    this.roundPath(view.x, view.y, view.w, view.h, 10);
    this.ctx.clip();
    let rowY = view.y + 36 - this.shopScroll;
    this.text('\u89d2\u8272\u76ae\u80a4', view.x + view.w / 2, rowY, 22, '#202633', 'center', 'bold');
    rowY += 30;
    this.visibleCharacterSkins().forEach((skin) => {
      this.shopSkinRow(skin, view.x + 14, rowY, view.w - 28);
      rowY += 84;
    });
    rowY += 12;
    this.text('\u68cb\u76d8\u4e3b\u9898', view.x + view.w / 2, rowY, 22, '#202633', 'center', 'bold');
    rowY += 30;
    this.availableThemes().forEach((theme) => {
      this.shopThemeRow(theme, view.x + 14, rowY, view.w - 28);
      rowY += 78;
    });
    rowY += 12;
    if (!this.adsHidden()) {
      this.shopCoinRow(view.x + 14, rowY, view.w - 28);
      rowY += 152;
    }
    this.shopContentHeight = Math.max(view.h, rowY + this.shopScroll - view.y);
    this.ctx.restore();
    this.shopScroll = clamp(this.shopScroll, 0, Math.max(0, this.shopContentHeight - view.h));
    this.scrollBar(view, this.shopScroll, this.shopContentHeight);
  }

  shopSkinRow(skin, x, y, w) {
    if (this.shopView && (y + 68 < this.shopView.y || y > this.shopView.y + this.shopView.h)) return;
    const owns = this.save.ownedCharacterSkins.includes(skin.id);
    const current = this.save.currentCharacterSkin === skin.id;
    const unlock = this.config.economy.characterSkinUnlocks?.[skin.id] || { coins: skin.price, ads: 0 };
    this.roundRect(x, y, w, 68, 10, current ? '#fff4db' : '#f8fafc', current ? '#ffb020' : '#d8e1f0', 2);
    const previewPath = characterImagePath(skin.id, 'down');
    const img = this.images.get(previewPath);
    if (img) this.drawImageContain(previewPath, x + 8, y + 4, 60, 60);
    else this.drawCharacterIcon(x + 38, y + 36, 24, skin.id);
    this.text(skin.name, x + 78, y + 24, 18, '#202633', 'left', 'bold');
    this.text(skin.desc, x + 78, y + 48, 13, '#778091', 'left');
    if (owns) {
      this.button(current ? '\u4f7f\u7528\u4e2d' : '\u4f7f\u7528', x + w - 92, y + 15, 78, 38, () => {
        this.save.currentCharacterSkin = skin.id;
        this.saveData();
        this.play('click');
      }, { fill: current ? '#e9fff5' : '#ffb020', stroke: current ? '#35c987' : '#ffffff', text: '#202633', fontSize: 15, disabled: current });
    } else {
      this.button(String(unlock.coins || skin.price), x + w - 96, y + 15, 82, 38, () => this.buySkin(skin, unlock), { fill: '#ffb020', stroke: '#ffffff', text: '#202633', fontSize: 15 });
    }
  }

  shopThemeRow(theme, x, y, w) {
    if (this.shopView && (y + 62 < this.shopView.y || y > this.shopView.y + this.shopView.h)) return;
    const owns = this.save.ownedThemes.includes(theme.id);
    const current = this.save.currentTheme === theme.id;
    const unlock = this.config.economy.themeUnlocks?.[theme.id] || { coins: theme.price, ads: 0 };
    this.roundRect(x, y, w, 62, 10, current ? '#fff4db' : '#f8fafc', current ? '#ffb020' : '#d8e1f0', 2);
    this.roundRect(x + 18, y + 13, 42, 36, 8, theme.colors.board, theme.colors.grid, 2);
    this.roundRect(x + 28, y + 22, 22, 14, 4, theme.colors.target);
    this.text(theme.name, x + 78, y + 25, 18, '#202633', 'left', 'bold');
    this.text(owns ? '\u5df2\u62e5\u6709' : '\u91d1\u5e01\u6216\u5e7f\u544a\u89e3\u9501', x + 78, y + 47, 13, '#778091', 'left');
    if (owns) {
      this.button(current ? '\u4f7f\u7528\u4e2d' : '\u4f7f\u7528', x + w - 92, y + 12, 78, 38, () => {
        this.save.currentTheme = theme.id;
        this.saveData();
        this.play('click');
      }, { fill: current ? '#e9fff5' : '#ffb020', stroke: current ? '#35c987' : '#ffffff', text: '#202633', fontSize: 15, disabled: current });
    } else {
      this.button(String(unlock.coins || theme.price), x + w - 96, y + 12, 82, 38, () => this.buyTheme(theme, unlock), { fill: '#ffb020', stroke: '#ffffff', text: '#202633', fontSize: 15 });
    }
  }

  shopCoinRow(x, y, w) {
    if (this.shopView && (y + 132 < this.shopView.y || y > this.shopView.y + this.shopView.h)) return;
    const conf = this.config.economy.shop?.adCoins || { coinsPerAd: 80, dailyLimit: 10, totalLimit: 0 };
    const counts = this.getShopCoinAdCounts();
    const dailyLimit = counts.dailyLimit ?? conf.dailyLimit;
    const canWatch = counts.today < dailyLimit && (!conf.totalLimit || counts.total < conf.totalLimit);
    this.roundRect(x, y, w, 128, 12, '#fffaf0', '#ffcf77', 2);
    this.circle(x + 48, y + 42, 28, '#ffb020', '#ffffff');
    this.text('\u5e01', x + 48, y + 51, 24, '#6b470b', 'center', 'bold');
    this.text(`\u770b\u5e7f\u544a\u83b7\u5f97 ${conf.coinsPerAd} \u91d1\u5e01`, x + 90, y + 36, 20, '#202633', 'left', 'bold');
    this.text(`\u4eca\u65e5 ${counts.today} / ${dailyLimit}`, x + 90, y + 64, 15, '#778091', 'left');
    this.button(canWatch ? '\u9886\u53d6\u5956\u52b1' : '\u4eca\u65e5\u5df2\u9886\u5b8c', x + 18, y + 82, w - 36, 36, () => this.claimAdCoins(conf), { fill: canWatch ? '#ffb020' : '#eef2f7', stroke: '#ffffff', text: '#2f230e', fontSize: 16, radius: 10, disabled: !canWatch });
  }

  renderRankLegacy(y) {
    const panel = this.panelRect(y);
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 14, 'rgba(255,255,255,0.93)', '#dbe4f1', 2);
    const view = { x: panel.x + 14, y: panel.y + 66, w: panel.w - 28, h: panel.h - 82, type: 'rank' };
    this.rankView = view;
    this.text('\u597d\u53cb\u6392\u884c\u699c', panel.x + panel.w / 2, panel.y + 38, 24, '#202633', 'center', 'bold');
    const entries = [
      ['1', '\u4f60', `${this.save.highestUnlockedLevel - 1} \u5173`, '\u5f53\u524d\u8fdb\u5ea6'],
      ['2', '\u65b9\u5757\u9ad8\u624b', '10 \u5173', '\u4e09\u661f 8 \u4e2a'],
      ['3', '\u5dee\u4e00\u6b65\u5927\u5e08', '8 \u5173', '\u6700\u77ed\u6b65\u5f88\u7a33'],
      ['4', '\u51fa\u53e3\u89c2\u5bdf\u5458', '6 \u5173', '\u6b63\u5728\u8ffd\u8d76'],
      ['5', '\u6ed1\u5757\u8fbe\u4eba', '5 \u5173', '\u7ec3\u4e60\u4e2d'],
      ['6', '\u76ae\u80a4\u6536\u85cf\u5bb6', '4 \u5173', '\u6536\u96c6\u76ae\u80a4'],
      ['7', '\u51fa\u53e3\u5de5\u7a0b\u5e08', '3 \u5173', '\u7a33\u624e\u7a33\u6253'],
      ['8', '\u65b0\u73a9\u5bb6', '1 \u5173', '\u51c6\u5907\u51fa\u53d1'],
    ];
    this.ctx.save();
    this.ctx.beginPath();
    this.roundPath(view.x, view.y, view.w, view.h, 10);
    this.ctx.clip();
    entries.forEach((entry, index) => {
      const rowY = view.y + 12 + index * 72 - this.rankScroll;
      this.roundRect(view.x + 8, rowY, view.w - 16, 58, 10, index === 0 ? '#fff4db' : '#f8fafc', '#d8e1f0', 2);
      this.circle(view.x + 40, rowY + 29, 20, index === 0 ? '#ffb020' : '#d8e1f0');
      this.text(entry[0], view.x + 40, rowY + 36, 16, '#202633', 'center', 'bold');
      this.text(entry[1], view.x + 74, rowY + 24, 18, '#202633', 'left', 'bold');
      this.text(entry[3], view.x + 74, rowY + 46, 13, '#778091', 'left');
      this.text(entry[2], view.x + view.w - 44, rowY + 36, 18, '#ff7a00', 'center', 'bold');
    });
    this.rankContentHeight = Math.max(view.h, entries.length * 72 + 24);
    this.ctx.restore();
    this.rankScroll = clamp(this.rankScroll, 0, Math.max(0, this.rankContentHeight - view.h));
    this.scrollBar(view, this.rankScroll, this.rankContentHeight);
  }

  renderRank(y) {
    const panel = this.panelRect(y);
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 14, 'rgba(255,255,255,0.93)', '#dbe4f1', 2);
    const view = { x: panel.x + 14, y: panel.y + 66, w: panel.w - 28, h: panel.h - 82, type: 'rank' };
    this.rankView = view;
    this.text('\u597d\u53cb\u6392\u884c\u699c', panel.x + panel.w / 2, panel.y + 38, 24, '#202633', 'center', 'bold');
    const pullOffset = this.rankRefreshing ? 38 : Math.min(50, this.rankPullDistance || 0);
    this.drawRankRefreshIndicator(view, pullOffset);
    this.destroyUserInfoButton();
    this.ctx.save();
    this.ctx.beginPath();
    this.roundPath(view.x, view.y, view.w, view.h, 10);
    this.ctx.clip();
    this.ctx.translate(0, pullOffset);
    if (this.rankCanvas && this.rankContext) {
      this.updateRankCanvas(view);
      this.ctx.drawImage(this.rankCanvas, view.x, view.y, view.w, view.h);
    } else {
      this.roundRect(view.x + 8, view.y + 12, view.w - 16, 92, 12, '#f8fafc', '#d8e1f0', 2);
      this.drawImageContain(ASSET.image.defaultAvatar, view.x + view.w / 2 - 30, view.y + 25, 60, 60);
      this.text(this.rankStatus || '\u597d\u53cb\u699c\u53ea\u80fd\u5728\u5fae\u4fe1\u5c0f\u6e38\u620f\u73af\u5883\u4e2d\u663e\u793a', view.x + view.w / 2, view.y + 120, 15, '#778091', 'center', 'bold');
    }
    this.rankContentHeight = Math.max(view.h, 30 * 72 + 24);
    this.ctx.restore();
    this.rankScroll = clamp(this.rankScroll, 0, Math.max(0, this.rankContentHeight - view.h));
    this.scrollBar(view, this.rankScroll, this.rankContentHeight);
  }

  drawRankRefreshIndicator(view, pullOffset) {
    if (!this.rankRefreshing && pullOffset <= 0) return;
    const progress = this.rankRefreshing ? 1 : clamp(this.rankPullDistance / 54, 0, 1);
    const cx = view.x + view.w / 2;
    const cy = view.y + Math.max(18, pullOffset * 0.46);
    const r = 13;
    this.circle(cx, cy, r, this.rankRefreshing ? '#ffb020' : 'rgba(255,176,32,0.18)', '#ffcf77', 2);
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate((this.rankRefreshing ? Date.now() / 240 : progress * 1.4) % (Math.PI * 2));
    this.ctx.strokeStyle = this.rankRefreshing ? '#ffffff' : '#ff9f0a';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 6, -0.35, Math.PI * 1.35);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(6, -1);
    this.ctx.lineTo(10, -1);
    this.ctx.lineTo(8, 3);
    this.ctx.closePath();
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.fill();
    this.ctx.restore();
    if (this.rankRefreshing || progress > 0.82) {
      this.text(this.rankRefreshing ? '\u66f4\u65b0\u4e2d' : '\u677e\u624b\u5237\u65b0', cx + 28, cy + 5, 12, '#8a6a16', 'left', 'bold');
    }
  }

  updateRankCanvas(view) {
    const dpr = this.dpr || 1;
    const width = Math.max(1, Math.floor(view.w * dpr));
    const height = Math.max(1, Math.floor(view.h * dpr));
    if (this.rankCanvas.width !== width) this.rankCanvas.width = width;
    if (this.rankCanvas.height !== height) this.rankCanvas.height = height;
    const payload = this.rankPayload();
    const message = {
      type: 'renderRank',
      width: view.w,
      height: view.h,
      dpr,
      scroll: this.rankScroll || 0,
      currentUser: payload,
    };
    const key = JSON.stringify({
      w: Math.round(view.w),
      h: Math.round(view.h),
      dpr,
      scroll: Math.round(message.scroll),
      score: payload.score,
      nickName: payload.nickName,
      avatarUrl: payload.avatarUrl,
    });
    if (key === this.rankLastRenderMessage) return;
    this.rankLastRenderMessage = key;
    this.postRankMessage(message);
  }

  startLevel(levelId) {
    const source = this.levels.find((level) => level.levelId === levelId) || this.levels[0];
    const targetPage = Math.floor((source.levelId - 1) / 9);
    const gate = this.levelPageGate(targetPage);
    const sequentialLevel = this.contiguousUnlockedLevel();
    if (source.levelId > sequentialLevel) {
      this.page = Math.floor((sequentialLevel - 1) / 9);
      this.scene = 'menu';
      this.showToast(`\u8bf7\u5148\u901a\u8fc7\u7b2c ${sequentialLevel} \u5173`);
      this.play('invalid');
      return;
    }
    if (!gate.unlocked) {
      this.page = targetPage;
      this.scene = 'menu';
      this.showToast(`\u4e0a\u4e00\u9875\u661f\u661f\u6570\u9700\u5927\u4e8e ${gate.required}`);
      this.play('invalid');
      return;
    }
    this.level = deepClone(source);
    const progress = this.levelProgress(this.level.levelId);
    this.blocks = this.level.blocks.map((block) => ({
      ...block,
      w: block.type === 'target' ? 2 : block.w,
      h: block.type === 'target' ? 2 : block.h,
      moveDir: block.type === 'target' || block.type === 'magnet' ? 'both' : block.moveDir,
      linkedIds: block.type === 'magnet' ? [...new Set([...(block.linkedIds || []), block.id])].sort() : block.linkedIds,
      iceState: block.type === 'ice' ? (block.iceState || 'intact') : block.iceState,
      skinId: block.type === 'target' ? this.save.currentCharacterSkin : block.skinId,
      facing: block.type === 'target' ? (block.facing || this.level.exit.direction || this.level.exit.side || 'right') : block.facing,
    }));
    this.sanitizeMagnetLinks(this.blocks);
    this.steps = 0;
    this.undoLeft = 1;
    if (!this.hintUsesByLevel.has(source.levelId)) this.hintUsesByLevel.set(source.levelId, 0);
    this.addStepsUsed = false;
    this.history = [];
    this.finished = false;
    this.resultOverlay = null;
    this.failureOverlay = null;
    this.coinDoublePending = false;
    this.addStepsPending = false;
    this.addStepStarBonus = 0;
    this.stepLimitBonusEffect = null;
    this.collectedCoinsThisLevel = 0;
    this.blockAnimations.clear();
    this.boardEffects = [];
    this.animationLockUntil = 0;
    this.hintPathCache = null;
    this.hintPending = false;
    this.hintBlockId = '';
    this.hintUntil = 0;
    this.hintAdPending = false;
    this.tutorialOverlay = this.tutorialOverlayForLevel(source);
    this.confetti = [];
    this.scene = 'game';
    this.queueCloudSave(0, { force: true, markDirty: false });
    this.playMusic('game');
    this.play('click');
  }

  tutorialOverlayForLevel(level) {
    if (level.levelId === 1) return { kind: 'basic', step: 0 };
    return null;
  }

  renderGame() {
    const theme = this.getTheme();
    this.drawPageBackground(theme.colors.pageA, theme.colors.pageB, theme.bg || ASSET.image.game);
    const top = this.safeTop + 18;
    this.button('\u8fd4\u56de', 18, top, 70, 38, () => {
      this.scene = 'menu';
      this.tab = 'levels';
      this.jumpToLatestLevelPage();
      this.playMusic('bgm');
      this.play('click');
    }, { fill: 'rgba(255,255,255,0.90)', stroke: '#d8e1f0', fontSize: 16 });
    this.text(`\u7b2c ${this.level.levelId} \u5173`, this.width / 2, top + 20, 24, theme.colors.text, 'center', 'bold', '#ffffff');
    this.text(`\u6b65\u6570 ${this.steps} / ${this.level.stepLimit}`, this.width / 2, top + 50, 16, this.steps >= this.level.stepLimit ? '#ff4d4f' : theme.colors.muted, 'center', 'bold', '#ffffff');
    this.renderStepLimitBonusEffect(this.width / 2 + 74, top + 50);
    this.statChip(this.width - 102, top - 2, 86, 27, ASSET.image.coinIcon, this.save.coins);
    this.statChip(this.width - 102, top + 29, 86, 27, ASSET.image.starIcon, this.totalStars());
    this.renderBoard(theme);
    this.renderTools(theme);
    this.renderGameBannerReserve();
    if (this.tutorialOverlay) this.renderTutorialOverlay(theme);
    if (this.failureOverlay) this.renderFailure(theme);
    if (this.resultOverlay) this.renderResult(theme);
  }

  renderStepLimitBonusEffect(x, y) {
    if (!this.stepLimitBonusEffect) return;
    const elapsed = Date.now() - this.stepLimitBonusEffect.startedAt;
    const duration = 1100;
    if (elapsed >= duration) {
      this.stepLimitBonusEffect = null;
      return;
    }
    const t = elapsed / duration;
    this.ctx.save();
    this.ctx.globalAlpha = 1 - t;
    this.ctx.translate(x, y - 26 * t);
    this.text(`+${this.stepLimitBonusEffect.amount}`, 0, 0, 22, '#35c987', 'center', 'bold', '#ffffff');
    this.ctx.restore();
  }

  renderBoard(theme) {
    const top = this.safeTop + 82;
    const bottomTools = Math.max(118, this.height - this.safeBottom + 110) + this.gameBannerReserve();
    this.boardSize = Math.min(this.width - 46, 572, this.height - top - bottomTools, this.height * 0.46);
    this.boardSize = Math.max(260, this.boardSize);
    this.cellSize = this.boardSize / this.level.width;
    this.boardX = (this.width - this.boardSize) / 2;
    this.boardY = top + Math.max(0, (this.height - top - bottomTools - this.boardSize) / 2);
    const pad = 12;
    this.roundRect(this.boardX - pad, this.boardY - pad + 7, this.boardSize + pad * 2, this.boardSize + pad * 2, 16, 'rgba(0,0,0,0.11)');
    this.roundRect(this.boardX - pad / 2, this.boardY - pad / 2, this.boardSize + pad, this.boardSize + pad, 14, theme.colors.board, 'rgba(255,255,255,0.82)', 3);
    for (let y = 0; y < this.level.height; y += 1) {
      for (let x = 0; x < this.level.width; x += 1) {
        const rect = this.gridRect({ x, y, w: 1, h: 1 }, 4);
        this.roundRect(rect.x, rect.y, rect.w, rect.h, 8, theme.colors.cell, this.hexAlpha(theme.colors.grid, 0.6), 1);
      }
    }
    this.renderSpecialCells(theme);
    this.blocks.forEach((block) => this.renderBlock(block, theme));
    this.renderBoardEffects();
    this.renderBoardLock();
    this.renderExit(theme);
  }

  renderSpecialCells(theme) {
    (this.level.specialCells || []).forEach((cell) => {
      if (cell.type === 'exit' || cell.collected) return;
      const rect = this.gridRect({ ...cell, w: cell.w || 1, h: cell.h || 1 }, 6);
      const icon = this.specialCellIcon(cell);
      const pulse = cell.type === 'teleport' ? 0.82 + Math.sin(Date.now() / 360) * 0.08 : 0.92;
      this.ctx.save();
      this.ctx.globalAlpha = pulse;
      if (cell.type === 'coin') {
        this.circle(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.42, 'rgba(255,214,92,0.32)', '#ffb020', 2);
      } else if (cell.type === 'directional') {
        this.roundRect(rect.x, rect.y, rect.w, rect.h, 10, 'rgba(71,85,105,0.18)', '#94a3b8', 2);
      } else if (cell.type === 'teleport') {
        this.roundRect(rect.x, rect.y, rect.w, rect.h, 12, 'rgba(116,60,255,0.15)', '#9b5cff', 2);
      }
      if (icon) this.drawImageContain(icon, rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      if (cell.portalId) this.text(cell.portalId, rect.x + rect.w - 8, rect.y + 18, 13, '#ffffff', 'right', 'bold', 'rgba(31,18,78,0.7)');
      this.ctx.restore();
      cell.screenRect = rect;
    });
  }

  renderExit(theme) {
    const exit = this.level.exit;
    const horizontal = exit.side === 'top' || exit.side === 'bottom';
    const exitW = exit.w || (horizontal ? 2 : 1);
    const exitH = exit.h || (horizontal ? 1 : 2);
    const spanX = this.boardX + exit.x * this.cellSize;
    const spanY = this.boardY + exit.y * this.cellSize;
    const spanW = exitW * this.cellSize;
    const spanH = exitH * this.cellSize;
    const exitColor = '#ffb020';
    const dark = '#5b3900';
    const arrow = exit.side === 'right' ? '>' : exit.side === 'left' ? '<' : exit.side === 'top' ? '^' : 'v';
    const glow = this.hexAlpha(exitColor, 0.36);

    this.ctx.save();
    this.ctx.shadowColor = this.hexAlpha(exitColor, 0.86);
    this.ctx.shadowBlur = 18;
    if (horizontal) {
      const slotH = 24;
      const slotW = Math.max(92, spanW + 18);
      const slotX = clamp(spanX + spanW / 2 - slotW / 2, 8, this.width - slotW - 8);
      const slotY = exit.side === 'top' ? this.boardY - slotH - 8 : this.boardY + this.boardSize + 8;
      this.roundRect(slotX - 6, slotY - 5, slotW + 12, slotH + 10, 14, glow);
      this.roundRect(slotX, slotY, slotW, slotH, 12, exitColor, '#ffffff', 3);
      this.text(`${arrow} \u51fa\u53e3`, slotX + slotW / 2, slotY + 18, 17, dark, 'center', 'bold');

      const edgeY = exit.side === 'top' ? this.boardY + 3 : this.boardY + this.boardSize - 7;
      this.roundRect(spanX + 5, edgeY, spanW - 10, 8, 4, '#ffffff', exitColor, 2);
    } else {
      const slotW = 58;
      const slotH = Math.max(84, spanH + 18);
      const slotX = exit.side === 'left' ? this.boardX - slotW - 8 : this.boardX + this.boardSize + 8;
      const slotY = clamp(spanY + spanH / 2 - slotH / 2, this.safeTop + 70, this.safeBottom - this.gameBannerReserve() - slotH - 92);
      this.roundRect(slotX - 5, slotY - 6, slotW + 10, slotH + 12, 14, glow);
      this.roundRect(slotX, slotY, slotW, slotH, 12, exitColor, '#ffffff', 3);
      this.text(arrow, slotX + slotW / 2, slotY + slotH / 2 - 8, 24, dark, 'center', 'bold');
      this.text('\u51fa\u53e3', slotX + slotW / 2, slotY + slotH / 2 + 23, 16, dark, 'center', 'bold');

      const edgeX = exit.side === 'left' ? this.boardX + 3 : this.boardX + this.boardSize - 7;
      this.roundRect(edgeX, spanY + 5, 8, spanH - 10, 4, '#ffffff', exitColor, 2);
    }
    this.ctx.restore();
  }

  renderTutorialOverlay(theme) {
    if (this.tutorialOverlay?.kind === 'special') {
      this.renderSpecialTutorialOverlay(theme);
      return;
    }
    const target = this.blocks.find((block) => block.id === this.level.targetId);
    const exit = this.level.exit;
    if (!target || !exit) return;

    const step = this.tutorialOverlay?.step || 0;
    const targetRect = this.gridRect(target, 2);
    const targetPoint = {
      x: targetRect.x + targetRect.w / 2,
      y: targetRect.y + targetRect.h / 2,
    };
    const horizontal = exit.side === 'top' || exit.side === 'bottom';
    const exitW = exit.w || (horizontal ? 2 : 1);
    const exitH = exit.h || (horizontal ? 1 : 2);
    const exitRect = {
      x: this.boardX + exit.x * this.cellSize,
      y: this.boardY + exit.y * this.cellSize,
      w: exitW * this.cellSize,
      h: exitH * this.cellSize,
    };
    const exitCx = exit.side === 'right'
      ? this.boardX + this.boardSize + 36
      : exit.side === 'left'
        ? this.boardX - 36
        : exitRect.x + exitRect.w / 2;
    const exitCy = exit.side === 'top'
      ? this.boardY - 34
        : exit.side === 'bottom'
          ? this.boardY + this.boardSize + 34
          : exitRect.y + exitRect.h / 2;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15,23,42,0.62)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();

    const panelW = Math.min(this.width - 44, 330);
    const panelH = step >= 3 ? 166 : 124;
    const panelX = (this.width - panelW) / 2;
    const bottomPanelY = Math.min(this.height - this.gameBannerReserve() - panelH - 96, this.boardY + this.boardSize + 26);
    const topPanelY = Math.max(this.safeTop + 86, this.boardY - panelH - 24);
    const panelY = bottomPanelY + panelH < this.height - 78 ? bottomPanelY : topPanelY;
    const panelAnchor = {
      x: panelX + panelW / 2,
      y: panelY > this.boardY ? panelY - 8 : panelY + panelH + 8,
    };

    if (step === 0) {
      this.circle(exitCx, exitCy, 42, 'rgba(255,176,32,0.22)', '#ffb020', 5);
      this.text('\u51fa\u53e3', exitCx, exitCy + 6, 17, '#ffffff', 'center', 'bold', 'rgba(75,42,0,0.55)');
      this.drawTutorialPointer(panelAnchor.x, panelAnchor.y, exitCx, exitCy);
      this.renderTutorialTip(panelX, panelY, panelW, panelH, '\u8fd9\u91cc\u662f\u51fa\u53e3', ['\u628a\u76ee\u6807\u89d2\u8272\u79fb\u52a8\u5230\u8fd9\u91cc', '\u5c31\u53ef\u4ee5\u5b8c\u6210\u8fd9\u4e00\u5173'], '\u70b9\u51fb\u5c4f\u5e55\u7ee7\u7eed');
    } else if (step === 1) {
      this.roundRect(targetRect.x - 8, targetRect.y - 8, targetRect.w + 16, targetRect.h + 16, 20, 'rgba(255,255,255,0.14)', '#ffcf77', 4);
      this.drawTutorialPointer(panelAnchor.x, panelAnchor.y, targetPoint.x, targetPoint.y);
      this.renderTutorialTip(panelX, panelY, panelW, panelH, '\u8fd9\u662f\u76ee\u6807\u89d2\u8272', ['\u62d6\u52a8\u5b83\u4e0a\u4e0b\u5de6\u53f3\u79fb\u52a8', '\u60f3\u529e\u6cd5\u8ba9\u5b83\u5230\u8fbe\u51fa\u53e3'], '\u70b9\u51fb\u5c4f\u5e55\u7ee7\u7eed');
    } else if (step === 2) {
      const candidates = this.blocks.filter((block) => block.type !== 'target' && block.moveDir !== 'none').slice(0, 3);
      candidates.forEach((block) => {
        const rect = this.gridRect(block, 3);
        this.roundRect(rect.x - 5, rect.y - 5, rect.w + 10, rect.h + 10, 14, 'rgba(255,255,255,0.12)', '#7dd3fc', 3);
      });
      const first = candidates[0] ? this.gridRect(candidates[0], 2) : targetRect;
      this.drawTutorialPointer(panelAnchor.x, panelAnchor.y, first.x + first.w / 2, first.y + first.h / 2);
      this.renderTutorialTip(panelX, panelY, panelW, panelH, '\u79fb\u52a8\u6ed1\u5757\u8ba9\u8def', ['\u5e26\u7bad\u5934\u7684\u6ed1\u5757', '\u53ea\u80fd\u6309\u7bad\u5934\u65b9\u5411\u79fb\u52a8'], '\u70b9\u51fb\u5c4f\u5e55\u7ee7\u7eed');
    } else {
      this.roundRect(targetRect.x - 8, targetRect.y - 8, targetRect.w + 16, targetRect.h + 16, 20, 'rgba(255,255,255,0.12)', '#ffcf77', 4);
      this.circle(exitCx, exitCy, 34, 'rgba(255,176,32,0.18)', '#ffb020', 4);
      this.renderTutorialTip(panelX, panelY, panelW, panelH, '\u51c6\u5907\u597d\u4e86', ['\u79fb\u52a8\u6ed1\u5757\uff0c\u7ed9\u76ee\u6807\u89d2\u8272', '\u8ba9\u51fa\u901a\u5f80\u51fa\u53e3\u7684\u8def'], '');
      this.button('\u5f00\u59cb\u6e38\u620f', panelX + panelW / 2 - 68, panelY + panelH - 58, 136, 40, () => {
        this.tutorialOverlay = null;
        this.play('click');
      }, { fill: '#ffb020', stroke: '#ffffff', text: '#2f230e', fontSize: 17, radius: 10, tutorial: true });
    }
  }

  renderSpecialTutorialOverlay(theme) {
    const overlay = this.tutorialOverlay;
    const step = overlay.step || 0;
    const focusRects = this.specialTutorialRects(overlay);
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15,23,42,0.62)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();

    focusRects.forEach((rect, index) => {
      const pulse = Math.sin(Date.now() / 220 + index) * 4;
      this.roundRect(rect.x - 7 - pulse / 2, rect.y - 7 - pulse / 2, rect.w + 14 + pulse, rect.h + 14 + pulse, 16, 'rgba(255,255,255,0.12)', '#ffcf77', 4);
    });

    const panelW = Math.min(this.width - 44, 342);
    const panelH = step === 0 ? 164 : 176;
    const panelX = (this.width - panelW) / 2;
    const bottomLimit = this.height - this.gameBannerReserve() - panelH - 112;
    const preferredY = step === 0
      ? this.boardY + this.boardSize + 18
      : this.boardY + this.boardSize - panelH - 10;
    const panelY = Math.max(this.safeTop + 84, Math.min(preferredY, bottomLimit));
    const fallbackY = Math.max(this.safeTop + 84, this.boardY - panelH - 22);
    const y = panelY + panelH < this.height - 76 ? panelY : fallbackY;
    const anchor = focusRects[0]
      ? { x: focusRects[0].x + focusRects[0].w / 2, y: focusRects[0].y + focusRects[0].h / 2 }
      : { x: this.width / 2, y: this.boardY + this.boardSize / 2 };
    this.drawTutorialPointer(panelX + panelW / 2, y > this.boardY ? y - 8 : y + panelH + 8, anchor.x, anchor.y);

    if (step === 0) {
      this.renderTutorialTip(panelX, y, panelW, panelH, overlay.title, overlay.lines, '\u70b9\u51fb\u5c4f\u5e55\u7ee7\u7eed');
      return;
    }
    const hasThirdStep = Array.isArray(overlay.thirdLines) && overlay.thirdLines.length > 0;
    if (step === 1 && hasThirdStep) {
      this.renderTutorialTip(panelX, y, panelW, panelH, overlay.secondTitle || '\u8bd5\u8bd5\u770b', overlay.secondLines || [overlay.hint || '\u7528\u5b83\u521b\u9020\u65b0\u7684\u8def\u7ebf', '\u79fb\u52a8\u65b9\u5757\u7ee7\u7eed\u89e3\u8c1c'], '\u70b9\u51fb\u5c4f\u5e55\u7ee7\u7eed');
      return;
    }
    const finalTitle = hasThirdStep ? (overlay.thirdTitle || '\u8bd5\u8bd5\u770b') : (overlay.secondTitle || '\u8bd5\u8bd5\u770b');
    const finalLines = hasThirdStep
      ? (overlay.thirdLines || [overlay.hint || '\u7528\u5b83\u521b\u9020\u65b0\u7684\u8def\u7ebf', '\u79fb\u52a8\u65b9\u5757\u7ee7\u7eed\u89e3\u8c1c'])
      : (overlay.secondLines || [overlay.hint || '\u7528\u5b83\u521b\u9020\u65b0\u7684\u8def\u7ebf', '\u79fb\u52a8\u65b9\u5757\u7ee7\u7eed\u89e3\u8c1c']);
    this.renderTutorialTip(panelX, y, panelW, panelH, finalTitle, finalLines, '');
    this.button('\u5f00\u59cb\u6e38\u620f', panelX + panelW / 2 - 68, y + panelH - 58, 136, 40, () => {
      this.tutorialOverlay = null;
      this.play('click');
    }, { fill: '#ffb020', stroke: '#ffffff', text: '#2f230e', fontSize: 17, radius: 10, tutorial: true });
  }

  specialTutorialRects(overlay) {
    const type = typeof overlay === 'string' ? overlay : overlay?.type;
    if (overlay?.focusIds?.length) {
      const rects = overlay.focusIds
        .map((id) => this.blocks.find((block) => block.id === id))
        .filter(Boolean)
        .map((block) => this.gridRect(block, 3));
      if (rects.length) return rects;
    }
    const blockTypes = type === 'lockKey' ? ['locked', 'key'] : [type];
    const blockRects = this.blocks
      .filter((block) => blockTypes.includes(block.type))
      .slice(0, type === 'magnet' ? 4 : 3)
      .map((block) => this.gridRect(block, 3));
    if (blockRects.length) return blockRects;
    const cellType = type === 'lockKey' ? '' : type;
    return (this.level.specialCells || [])
      .filter((cell) => cell.type === cellType)
      .slice(0, 2)
      .map((cell) => this.gridRect({ ...cell, w: cell.w || 1, h: cell.h || 1 }, 3));
  }

  renderTutorialTip(x, y, w, h, title, lines, hint) {
    this.roundRect(x, y + 5, w, h, 14, 'rgba(0,0,0,0.16)');
    this.roundRect(x, y, w, h, 14, 'rgba(255,255,255,0.96)', '#ffcf77', 3);
    this.text(title, x + w / 2, y + 32, 21, '#202633', 'center', 'bold');
    lines.forEach((line, index) => {
      this.text(line, x + w / 2, y + 62 + index * 24, 15, '#536173', 'center');
    });
    if (hint) this.text(hint, x + w / 2, y + h - 18, 14, '#ff9f0a', 'center', 'bold');
  }

  drawTutorialPointer(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const pulse = Math.sin(Date.now() / 230) * 10;
    const tipX = toX - ux * 26 + ux * pulse;
    const tipY = toY - uy * 26 + uy * pulse;
    const angle = Math.atan2(uy, ux);
    const arrowLen = clamp(len * 0.34, 74, 118);
    const headLen = 40;
    const headHalf = 28;
    const shaftHalf = 14;

    this.ctx.save();
    this.ctx.translate(tipX, tipY);
    this.ctx.rotate(angle);
    this.ctx.shadowColor = 'rgba(255,255,255,0.72)';
    this.ctx.shadowBlur = 18;
    this.ctx.fillStyle = 'rgba(255,255,255,0.72)';
    this.ctx.strokeStyle = 'rgba(255,255,255,0.88)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-headLen, -headHalf);
    this.ctx.lineTo(-headLen, -shaftHalf);
    this.ctx.lineTo(-arrowLen, -shaftHalf);
    this.ctx.lineTo(-arrowLen, shaftHalf);
    this.ctx.lineTo(-headLen, shaftHalf);
    this.ctx.lineTo(-headLen, headHalf);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255,255,255,0.22)';
    this.ctx.beginPath();
    this.ctx.moveTo(-headLen - 8, -shaftHalf + 5);
    this.ctx.lineTo(-arrowLen + 10, -shaftHalf + 5);
    this.ctx.lineTo(-arrowLen + 10, -2);
    this.ctx.lineTo(-headLen - 8, -2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawImageRotated(path, x, y, w, h, angle = 0) {
    const img = this.images.get(path);
    if (!img) return;
    this.ctx.save();
    this.ctx.translate(x + w / 2, y + h / 2);
    this.ctx.rotate(angle);
    this.ctx.drawImage(img, -w / 2, -h / 2, w, h);
    this.ctx.restore();
  }

  drawExitGateFallback(cx, cy, size, angle, theme) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);
    this.roundRect(-size * 0.72, -size * 0.62, size * 1.44, size * 1.34, size * 0.28, '#ffb020', '#ffffff', 3);
    this.roundRect(-size * 0.42, -size * 0.24, size * 0.84, size * 0.92, size * 0.18, this.hexAlpha(theme.colors.exit, 0.35), '#fff4c2', 2);
    this.ctx.restore();
  }

  blockFill(block, theme) {
    if (block.type === 'target') return theme.colors.target;
    if (block.type === 'magnet') return block.pole === 'N' ? '#2563eb' : '#ef4444';
    if (block.type === 'ice') return '#7dd3fc';
    if (block.type === 'locked') return '#8b5cf6';
    if (block.type === 'key') return '#facc15';
    if (block.type === 'fixed' || block.moveDir === 'none') return theme.colors.fixed;
    if (block.type === 'empty' || block.style === 'empty' || block.style === 'space') return theme.colors.cell;
    if (block.moveDir === 'horizontal') return theme.colors.horizontal || theme.colors.block;
    if (block.moveDir === 'vertical') return theme.colors.vertical || theme.colors.block;
    if (block.moveDir === 'both') return theme.colors.freeMove || theme.colors.block;
    return theme.colors.block || theme.colors.horizontal || theme.colors.vertical;
  }

  specialCellIcon(cell) {
    if (cell.type === 'coin') return ASSET.image.specialCoin;
    if (cell.type === 'directional') return ASSET.image.specialDirectional;
    if (cell.type === 'teleport') return ASSET.image.specialTeleport;
    return '';
  }

  specialBlockIcon(block) {
    if (block.type === 'magnet') return block.pole === 'N' ? ASSET.image.specialMagnetN : ASSET.image.specialMagnetS;
    if (block.type === 'locked') return ASSET.image.specialLocked;
    if (block.type === 'key') return ASSET.image.specialKey;
    if (block.type === 'ice') {
      const cracked = block.iceState === 'cracked';
      if (block.h > block.w) return cracked ? ASSET.image.specialIceCrackedTall : ASSET.image.specialIceIntactTall;
      if (block.w > block.h) return cracked ? ASSET.image.specialIceCrackedWide : ASSET.image.specialIceIntactWide;
      return cracked ? ASSET.image.specialIceCrackedSquare : ASSET.image.specialIceIntactSquare;
    }
    return '';
  }

  moveArrowIcon(block) {
    if (block.moveDir === 'horizontal') return ASSET.image.moveArrowHorizontal;
    if (block.moveDir === 'vertical') return ASSET.image.moveArrowVertical;
    return '';
  }

  renderBlock(block, theme) {
    const drawBlock = { ...block };
    if (this.dragging?.axis) {
      if (this.dragging.linkedIds?.includes(block.id) && this.dragging.linkedStartPositions?.[block.id]) {
        const startAxis = this.dragging.axis === 'horizontal' ? this.dragging.startX : this.dragging.startY;
        const dAxis = this.dragging.currentAxis - startAxis;
        const start = this.dragging.linkedStartPositions[block.id];
        drawBlock.x = this.dragging.axis === 'horizontal' ? start.x + dAxis : start.x;
        drawBlock.y = this.dragging.axis === 'vertical' ? start.y + dAxis : start.y;
      } else if (this.dragging.block.id === block.id) {
        if (this.dragging.axis === 'horizontal') drawBlock.x = this.dragging.currentAxis;
        else drawBlock.y = this.dragging.currentAxis;
      }
    } else {
      const animated = this.animatedBlockPosition(block);
      if (animated) {
        drawBlock.x = animated.x;
        drawBlock.y = animated.y;
      }
    }
    const rect = this.gridRect(drawBlock, 6);
    block.screenRect = rect;
    const fill = this.blockFill(block, theme);
    this.roundRect(rect.x + 1, rect.y + 4, rect.w, rect.h, block.type === 'target' ? 18 : 10, 'rgba(0,0,0,0.12)');
    this.roundRect(rect.x, rect.y, rect.w, rect.h, block.type === 'target' ? 18 : 10, fill, 'rgba(255,255,255,0.78)', block.type === 'target' ? 3 : 2);
    if (block.type === 'target') {
      this.drawCharacter(rect, block.skinId || this.save.currentCharacterSkin, block.facing || 'down');
    } else {
      const iconPath = this.specialBlockIcon(block);
      if (iconPath && this.images.get(iconPath)) {
        if (block.type === 'ice') this.renderIceBlock(block, rect);
        else this.drawImageContain(iconPath, rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
      } else {
        this.roundRect(rect.x + 8, rect.y + 8, rect.w - 16, Math.max(8, rect.h * 0.18), 6, 'rgba(255,255,255,0.20)');
        const arrowIcon = this.moveArrowIcon(block);
        if (arrowIcon && this.images.get(arrowIcon)) {
          const arrowSize = clamp(Math.min(rect.w, rect.h) * 0.62, 22, 38);
          this.drawImageContain(arrowIcon, rect.x + rect.w / 2 - arrowSize / 2, rect.y + rect.h / 2 - arrowSize / 2, arrowSize, arrowSize);
        } else {
          const icon = block.type === 'magnet'
            ? (block.pole || 'N')
            : block.type === 'locked'
              ? 'L'
              : block.type === 'key'
                ? 'K'
                : block.type === 'ice'
                  ? 'I'
                  : block.moveDir === 'both' ? '+' : 'x';
          const iconSize = Math.min(34, this.cellSize * 0.34);
          this.text(icon, rect.x + rect.w / 2, rect.y + rect.h / 2 + iconSize * 0.34, iconSize, '#ffffff', 'center', 'bold', 'rgba(0,0,0,0.25)');
        }
      }
    }
    if (this.hintBlockId === block.id && Date.now() < this.hintUntil) {
      const pulse = 1 + Math.sin(Date.now() / 90) * 0.04;
      const dx = (rect.w * pulse - rect.w) / 2;
      const dy = (rect.h * pulse - rect.h) / 2;
      this.roundRect(rect.x - dx, rect.y - dy, rect.w * pulse, rect.h * pulse, 12, 'rgba(255,242,166,0.24)', '#ffb020', 4);
    }
  }

  renderIceBlock(block, rect) {
    const asset = block.iceState === 'cracked'
      ? ASSET.image.specialIceCrackedSquare
      : ASSET.image.specialIceIntactSquare;
    const img = this.images.get(asset);
    const cellW = rect.w / block.w;
    const cellH = rect.h / block.h;
    const pad = Math.max(1, Math.min(cellW, cellH) * 0.03);
    for (let gy = 0; gy < block.h; gy += 1) {
      for (let gx = 0; gx < block.w; gx += 1) {
        const x = rect.x + gx * cellW + pad;
        const y = rect.y + gy * cellH + pad;
        const w = cellW - pad * 2;
        const h = cellH - pad * 2;
        if (img) {
          this.ctx.drawImage(img, x, y, w, h);
        } else {
          this.roundRect(x, y, w, h, 8, block.iceState === 'cracked' ? '#38bdf8' : '#7dd3fc', 'rgba(255,255,255,0.72)', 2);
        }
      }
    }
  }

  animatedBlockPosition(block) {
    const animation = this.blockAnimations.get(block.id);
    if (!animation) return null;
    const t = clamp((Date.now() - animation.start) / animation.duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    return {
      x: animation.fromX + (animation.toX - animation.fromX) * eased,
      y: animation.fromY + (animation.toY - animation.fromY) * eased,
    };
  }

  renderBoardEffects() {
    const now = Date.now();
    (this.boardEffects || []).forEach((effect) => {
      const elapsed = now - effect.start;
      const duration = effect.duration || 1;
      const t = clamp(elapsed / duration, 0, 1);
      if (effect.type === 'iceBurst') this.renderIceBurstEffect(effect, t);
      if (effect.type === 'magnetMerge') this.renderMagnetMergeEffect(effect, t);
    });
  }

  renderBoardLock() {
    if (!this.isBoardBusy()) return;
    const alpha = 0.08 + Math.sin(Date.now() / 120) * 0.025;
    this.ctx.save();
    this.ctx.fillStyle = `rgba(15,23,42,${alpha})`;
    this.ctx.fillRect(this.boardX, this.boardY, this.boardSize, this.boardSize);
    this.ctx.restore();
  }

  renderIceBurstEffect(effect, t) {
    const rect = this.gridRect(effect.rect, 0);
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const base = Math.min(rect.w / effect.rect.w, rect.h / effect.rect.h);
    const spread = base * (0.16 + t * 0.38);
    const alpha = 1 - t;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    (effect.pieces || []).forEach((piece) => {
      const x = cx + piece.dx * spread;
      const y = cy + piece.dy * spread;
      const size = base * piece.size * (1 - t * 0.35);
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(piece.rot + t * piece.spin);
      this.roundRect(-size / 2, -size / 2, size, size * 0.72, 3, piece.fill, 'rgba(255,255,255,0.78)', 1);
      this.ctx.restore();
    });
    this.ctx.restore();
  }

  renderMagnetMergeEffect(effect, t) {
    const rects = effect.rects?.length ? effect.rects : [effect.rect].filter(Boolean);
    const pulse = Math.sin(t * Math.PI);
    this.ctx.save();
    this.ctx.globalAlpha = 1 - t;
    this.ctx.shadowColor = '#ffe066';
    this.ctx.shadowBlur = 8 + pulse * 10;
    rects.forEach((item) => {
      const rect = this.gridRect(item, 0);
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;
      const r = Math.min(rect.w, rect.h) * (0.18 + pulse * 0.12);
      this.ctx.fillStyle = 'rgba(255,224,102,0.82)';
      this.circle(cx, cy, r, 'rgba(255,224,102,0.82)', 'rgba(255,255,255,0.95)', 2);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx - r * 1.8, cy);
      this.ctx.lineTo(cx + r * 1.8, cy);
      this.ctx.moveTo(cx, cy - r * 1.8);
      this.ctx.lineTo(cx, cy + r * 1.8);
      this.ctx.stroke();
    });
    this.ctx.restore();
  }

  drawCharacter(rect, skinId, facing = 'down') {
    const skin = CHARACTER_SKINS.find((item) => item.id === skinId) || CHARACTER_SKINS[0];
    const path = characterImagePath(skin.id, facing);
    const img = this.images.get(path);
    if (img) {
      const side = Math.min(rect.h * 0.96, rect.w * 0.96);
      this.drawImageContain(path, rect.x + rect.w / 2 - side / 2, rect.y + rect.h / 2 - side / 2, side, side);
      return;
    }
    this.drawCharacterIcon(rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.h, rect.w) * 0.36, skinId);
  }

  renderTools(theme) {
    const y = Math.min(this.height - 82 - this.gameBannerReserve(), this.safeBottom - 86 - this.gameBannerReserve());
    const showAds = !this.adsHidden();
    const undoNeedsAd = this.undoLeft <= 0;
    const unlimitedHints = this.hasUnlimitedHints();
    const items = [
      ['\u91cd\u6765', () => this.restartLevel(), '#ffffff', '#d8e1f0', {}],
      showAds
        ? ['\u64a4\u9500', () => this.undoWithAd(), '#ffffff', '#d8e1f0', { adIcon: undoNeedsAd, freeBadge: !undoNeedsAd }]
        : ['\u64a4\u9500', () => this.undo(), '#ffffff', '#d8e1f0', { freeBadge: this.undoLeft > 0, disabled: this.undoLeft <= 0 }],
    ];
    // \u63d0\u793a\u6309\u94ae\uff1a\u6240\u6709\u7528\u6237\u53ef\u89c1
    const hintDisabled = this.hintPending || this.hintAdPending;
    if (unlimitedHints) {
      items.push([
        this.hintPending ? '\u601d\u8003\u4e2d' : '\u63d0\u793a',
        () => this.requestHint(),
        '#fff4db', '#ffce72',
        { disabled: hintDisabled, hintButton: true },
      ]);
    } else {
      const freeLeft = this.hintFreeUsesLeft();
      const adLeft = this.isPC ? 0 : this.hintAdUsesLeft();
      const allUsed = freeLeft <= 0 && adLeft <= 0;
      const needAd = !this.isPC && freeLeft <= 0 && adLeft > 0;
      const label = this.hintPending ? '\u601d\u8003\u4e2d' : this.hintAdPending ? '\u5e7f\u544a\u4e2d' : '\u63d0\u793a';
      items.push([
        label,
        () => this.requestHint(),
        '#fff4db', '#ffce72',
        { disabled: allUsed || hintDisabled, hintButton: true, adIcon: needAd && !allUsed, freeBadge: freeLeft > 0 && !needAd },
      ]);
    }
    if (this.addStepsAdEnabled()) items.push([this.addStepsButtonLabel(), () => this.addStepsWithAd(), '#e9fff5', '#74d99f', { adIcon: !this.addStepsUsed && !this.addStepsPending, disabled: this.addStepsUsed || this.addStepsPending }]);
    const count = items.length;
    const sidePadding = 16;
    const buttonW = clamp((this.width - sidePadding * 2 - Math.max(0, count - 1) * 8) / count, 60, 76);
    const freeSpace = this.width - sidePadding * 2 - buttonW * count;
    const itemGap = count > 1 ? clamp(freeSpace / (count - 1), 4, 12) : 0;
    const totalW = buttonW * count + itemGap * Math.max(0, count - 1);
    const startX = (this.width - totalW) / 2;
    items.forEach((item, index) => {
      const x = startX + (buttonW + itemGap) * index;
      this.button(item[0], x, y, buttonW, 50, item[1], { fill: item[2], stroke: item[3], fontSize: 15, radius: 10, ...item[4] });
    });
  }

  renderGameBannerReserve() {
    const h = this.gameBannerReserve();
    if (!h) return;
    const safeInset = Math.max(0, this.height - this.safeBottom);
    const y = this.height - h - safeInset;
    this.ctx.save();
    const gradient = this.ctx.createLinearGradient(0, y, 0, this.height);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.72)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.94)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, y, this.width, h + safeInset);
    this.ctx.restore();
  }

  renderFailure(theme) {
    this.overlayPanel('\u6b65\u6570\u7528\u5b8c\u4e86', `\u672c\u5173\u4e0a\u9650 ${this.level.stepLimit} \u6b65`, '#ff8a8a');
    const panel = this.modalRect(318);
    const showAddSteps = this.addStepsAdEnabled();
    this.text(showAddSteps ? '\u518d\u8bd5\u4e00\u6b21\uff0c\u6216\u589e\u52a0 6 \u6b65\u7ee7\u7eed\u3002' : '\u6b65\u6570\u5df2\u7ecf\u7528\u5b8c\uff0c\u518d\u8bd5\u4e00\u6b21\u5427\u3002', panel.x + panel.w / 2, panel.y + 146, 16, '#536173', 'center');
    const replayX = showAddSteps ? panel.x + panel.w / 2 - 128 : panel.x + panel.w / 2 - 56;
    this.button('\u91cd\u73a9', replayX, panel.y + 206, 112, 48, () => {
      this.failureOverlay = null;
      this.restartLevel();
    }, { fill: '#f8fafc', stroke: '#d8e1f0', text: '#334155', fontSize: 18 });
    if (showAddSteps) {
      this.button(this.addStepsPending ? '\u62c9\u53d6\u4e2d' : this.addStepsUsed ? '\u5df2\u52a0\u6b65' : '+6\u6b65\u7ee7\u7eed', panel.x + panel.w / 2 + 16, panel.y + 206, 132, 48, () => this.addStepsWithAd(), {
        fill: this.addStepsUsed || this.addStepsPending ? '#eef2f7' : '#fff4db',
        stroke: this.addStepsUsed || this.addStepsPending ? '#d8e1f0' : '#ffce72',
        text: this.addStepsUsed || this.addStepsPending ? '#9aa4b5' : '#65420a',
        fontSize: 18,
        adIcon: !this.addStepsUsed && !this.addStepsPending,
        disabled: this.addStepsUsed || this.addStepsPending,
      });
    }
  }

  renderResult(theme) {
    const stars = this.resultOverlay.stars;
    const reward = this.resultOverlay.reward;
    const baseReward = this.resultOverlay.baseReward ?? reward;
    const coinBonus = this.resultOverlay.coinBonus || 0;
    this.overlayPanel(stars >= 3 ? '\u5b8c\u7f8e\u901a\u5173' : '\u987a\u5229\u901a\u5173', '__stars__', '#ffcf77');
    this.renderConfetti();
    const panel = this.modalRect(386);
    this.text(`\u6b65\u6570 ${this.steps} / ${this.level.stepLimit}`, panel.x + panel.w / 2, panel.y + 154, 17, '#536173', 'center', 'bold');
    const rewardLabel = this.resultOverlay.firstClear ? '\u9996\u6b21\u901a\u5173\u5956\u52b1' : '\u91cd\u590d\u901a\u5173\u5956\u52b1';
    this.text(`${rewardLabel} +${baseReward}`, panel.x + panel.w / 2, panel.y + 184, 18, '#ff7a00', 'center', 'bold');
    if (coinBonus > 0) this.text(`\u91d1\u5e01\u683c +${coinBonus}`, panel.x + panel.w / 2, panel.y + 212, 17, '#f59e0b', 'center', 'bold');
    if (this.resultOverlay.doubleClaimed) {
      this.text(`\u5df2\u53cc\u500d +${this.resultOverlay.doubleReward || reward}`, panel.x + panel.w / 2, panel.y + 236, 16, '#35a66a', 'center', 'bold');
    }
    const buttonY = panel.y + 268;
    const gap = 10;
    const buttonW = Math.min(106, (panel.w - 58 - gap * 2) / 3);
    const startX = panel.x + panel.w / 2 - (buttonW * 3 + gap * 2) / 2;
    this.button('\u8fd4\u56de', startX, buttonY, buttonW, 50, () => {
      this.scene = 'menu';
      this.tab = 'levels';
      this.jumpToLatestLevelPage();
      this.playMusic('bgm');
      this.play('click');
    }, { fill: '#f8fafc', stroke: '#d8e1f0', text: '#334155', fontSize: 17 });
    const doubleDisabled = this.resultOverlay.doubleClaimed || this.coinDoublePending;
    this.button(doubleDisabled ? (this.coinDoublePending ? '\u62c9\u53d6\u4e2d' : '\u5df2\u53cc\u500d') : '\u53cc\u500d\u7ed3\u7b97', startX + buttonW + gap, buttonY, buttonW, 50, () => this.doubleCoinsWithAd(reward), {
      fill: doubleDisabled ? '#eef2f7' : '#e9fff5',
      stroke: doubleDisabled ? '#d8e1f0' : '#74d99f',
      text: doubleDisabled ? '#9aa4b5' : '#125c39',
      fontSize: 15,
      adIcon: !doubleDisabled,
      disabled: doubleDisabled,
    });
    this.button('\u4e0b\u4e00\u5173', startX + (buttonW + gap) * 2, buttonY, buttonW, 50, () => {
      const next = Math.min(this.levels.length, this.level.levelId + 1);
      this.startLevel(next);
    }, { fill: '#ffb020', stroke: '#ffffff', text: '#2f230e', fontSize: 17 });
  }

  renderStars(cx, cy, stars, size = 30, gap = 7) {
    const icon = ASSET.image.starIcon;
    const totalW = size * 3 + gap * 2;
    const startX = cx - totalW / 2;
    for (let index = 0; index < 3; index += 1) {
      const x = startX + index * (size + gap);
      this.ctx.save();
      this.ctx.globalAlpha = index < stars ? 1 : 0.22;
      if (this.images.get(icon)) {
        this.drawImageContain(icon, x, cy - size + 3, size, size);
      } else {
        this.text('\u2605', x + size / 2, cy, size, '#ffb020', 'center', 'bold');
      }
      this.ctx.restore();
    }
  }

  createConfetti() {
    const colors = ['#ff4d4f', '#ffb020', '#35c987', '#2f80ed', '#9b5cff', '#ff7a90'];
    const topY = Math.max(this.safeTop + 20, this.height * 0.16);
    this.confetti = Array.from({ length: 74 }, (_, index) => ({
      x: this.width * (0.18 + Math.random() * 0.64),
      y: topY + Math.random() * 24,
      vx: (Math.random() - 0.5) * 3.4,
      vy: 1.2 + Math.random() * 3.4,
      size: 5 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.28,
      color: colors[index % colors.length],
      delay: Math.random() * 360,
      start: Date.now(),
    }));
  }

  renderConfetti() {
    if (!this.confetti?.length) return;
    const now = Date.now();
    this.confetti = this.confetti.filter((piece) => now - piece.start < 2400);
    this.confetti.forEach((piece) => {
      const t = Math.max(0, now - piece.start - piece.delay) / 16.67;
      if (t <= 0) return;
      const x = piece.x + piece.vx * t + Math.sin(t * 0.12) * 12;
      const y = piece.y + piece.vy * t + 0.035 * t * t;
      const alpha = clamp(1 - (now - piece.start) / 2400, 0, 1);
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(piece.rot + piece.spin * t);
      this.ctx.globalAlpha = alpha;
      this.roundRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62, 2, piece.color);
      this.ctx.restore();
    });
  }

  overlayPanel(title, subtitle, stroke) {
    this.ctx.fillStyle = 'rgba(15,23,42,0.48)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    const hasStars = subtitle === '__stars__';
    const panel = this.modalRect(hasStars ? 386 : 318);
    this.roundRect(panel.x, panel.y, panel.w, panel.h, 14, '#ffffff', stroke, 3);
    this.text(title, panel.x + panel.w / 2, panel.y + 72, 30, '#202633', 'center', 'bold');
    if (hasStars) this.renderStars(panel.x + panel.w / 2, panel.y + 124, this.resultOverlay?.stars || 0, 36, 9);
    else this.text(subtitle, panel.x + panel.w / 2, panel.y + 118, 18, '#778091', 'center', 'bold');
  }

  restartLevel() {
    this.startLevel(this.level.levelId);
  }

  pushHistory() {
    this.history.push({
      steps: this.steps,
      blocks: deepClone(this.blocks),
      specialCells: deepClone(this.level.specialCells || []),
      collectedCoinsThisLevel: this.collectedCoinsThisLevel || 0,
    });
    if (this.history.length > 80) this.history.shift();
  }

  restoreSnapshot(snapshot) {
    this.blocks = deepClone(snapshot.blocks || []);
    this.steps = snapshot.steps;
    this.level.specialCells = deepClone(snapshot.specialCells || this.level.specialCells || []);
    this.collectedCoinsThisLevel = snapshot.collectedCoinsThisLevel || 0;
    this.finished = false;
    this.failureOverlay = null;
    this.blockAnimations.clear();
    this.boardEffects = [];
    this.animationLockUntil = 0;
    this.hintPathCache = null;
  }

  undo() {
    if (this.finished || this.undoLeft <= 0 || this.history.length === 0) {
      this.showToast('\u73b0\u5728\u6ca1\u6709\u53ef\u64a4\u9500\u7684\u6b65\u9aa4');
      return;
    }
    const snapshot = this.history.pop();
    this.restoreSnapshot(snapshot);
    this.undoLeft -= 1;
    this.play('snap');
  }

  undoWithAd() {
    if (this.undoLeft > 0) {
      this.undo();
      return;
    }
    if (this.adsHidden()) {
      this.showToast('\u64a4\u9500\u6b21\u6570\u5df2\u7528\u5b8c');
      return;
    }
    this.showRewarded('undo').then((result) => {
      if (!result.ok) this.showToast(result.message);
      else {
        this.undoLeft = 1;
        this.undo();
      }
    });
  }

  addStepsWithAd() {
    if (this.addStepsPending) return;
    if (!this.addStepsAdEnabled()) {
      this.showToast('\u6682\u672a\u5f00\u653e\u52a0\u6b65\u529f\u80fd');
      return;
    }
    if (this.addStepsUsed) {
      this.showToast('+6\u6b65\u6bcf\u5173\u53ea\u80fd\u4f7f\u7528\u4e00\u6b21');
      return;
    }
    if (this.rewardedLimitReached('addSteps')) {
      this.showToast('\u4eca\u65e5\u6fc0\u52b1\u5e7f\u544a\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650\uff0c\u660e\u5929\u518d\u6765\u5427');
      return;
    }
    this.addStepsPending = true;
    this.showRewarded('addSteps').then((result) => {
      if (!result.ok) {
        this.showToast(result.message);
        return;
      }
      const amount = Number(this.config.ads.rewards?.addSteps?.steps) || 6;
      this.addStepsUsed = true;
      this.level.stepLimit += amount;
      this.addStepStarBonus += amount;
      this.stepLimitBonusEffect = { amount, startedAt: Date.now() };
      this.failureOverlay = null;
      this.finished = false;
      this.showToast(`\u672c\u5173\u6b65\u6570 +${amount}`);
    }).finally(() => {
      this.addStepsPending = false;
    });
  }

  hintFreeUseLimit() {
    return Math.max(0, Number(this.config.ads.rewards?.hint?.freeUses) || 2);
  }

  // ── PC端适配：广告次数限制为0 ──
  hintAdUseLimit() {
    return this.isPC ? 0 : 2;
  }

  hintUseLimit() {
    return this.hintFreeUseLimit() + this.hintAdUseLimit();
  }

  hintUsesForCurrentLevel() {
    return Math.max(0, Number(this.hintUsesByLevel.get(this.level?.levelId)) || 0);
  }

  hintAdUsesForCurrentLevel() {
    return Math.max(0, Number(this.hintAdUsesByLevel.get(this.level?.levelId)) || 0);
  }

  hintFreeUsesLeft() {
    if (this.hasUnlimitedHints()) return 999;
    return this.hintFreeUseLimit() - this.hintUsesForCurrentLevel();
  }

  hintAdUsesLeft() {
    if (this.hasUnlimitedHints()) return 999;
    return this.hintAdUseLimit() - this.hintAdUsesForCurrentLevel();
  }

  consumeHintFreeUse() {
    if (this.hasUnlimitedHints() || !this.level) return;
    this.hintUsesByLevel.set(this.level.levelId, this.hintUsesForCurrentLevel() + 1);
  }

  consumeHintAdUse() {
    if (this.hasUnlimitedHints() || !this.level) return;
    this.hintAdUsesByLevel.set(this.level.levelId, this.hintAdUsesForCurrentLevel() + 1);
  }

  // 提示入口：免费次数优先，用完后走广告
  requestHint() {
    if (this.hintPending || this.hintAdPending || this.finished) return;
    const freeLeft = this.hintFreeUsesLeft();
    const adLeft = this.hintAdUsesLeft();
    if (this.hasUnlimitedHints()) {
      this._doHint();
    } else if (freeLeft > 0) {
      this._doHint();
    } else if (adLeft > 0) {
      this._doHintWithAd();
    }
  }

  _doHint() {
    this.hintPending = true;
    setTimeout(() => {
      try {
        const result = this.basicHintSolve();
        if (result) {
          if (!this.hasUnlimitedHints()) this.consumeHintFreeUse();
          this.hintBlockId = result.blockId;
          this.hintUntil = Date.now() + 4000;
          if (this.hasUnlimitedHints()) {
            this.showToast(`高亮方块向${this.dirText(result.dir)}移动 ${result.amount} 格`, 4000);
          } else {
            const freeLeft = this.hintFreeUsesLeft();
            const adLeft = this.hintAdUsesLeft();
            const totalLeft = freeLeft + adLeft;
            this.showToast(`高亮方块向${this.dirText(result.dir)}移动 ${result.amount} 格`, 4000, `提示次数剩余 ${totalLeft} 次`);
          }
          this.play('star');
        } else {
          this.showToast('未找到解法，请尝试撤销或重来', 4000);
        }
      } finally {
        this.hintPending = false;
      }
    }, 16);
  }

  _doHintWithAd() {
    this.hintAdPending = true;
    this.showRewarded('hint').then((result) => {
      if (!result.ok) {
        this.showToast(result.message || '广告未完成');
        return;
      }
      // 广告成功后执行提示
      this.hintPending = true;
      setTimeout(() => {
        try {
          const hintResult = this.basicHintSolve();
          if (hintResult) {
            this.consumeHintAdUse();
            this.hintBlockId = hintResult.blockId;
            this.hintUntil = Date.now() + 4000;
            const freeLeft = this.hintFreeUsesLeft();
            const adLeft = this.hintAdUsesLeft();
            const totalLeft = freeLeft + adLeft;
            this.showToast(`高亮方块向${this.dirText(hintResult.dir)}移动 ${hintResult.amount} 格`, 4000, `提示次数剩余 ${totalLeft} 次`);
            this.play('star');
          } else {
            this.showToast('未找到解法，请尝试撤销或重来', 4000);
          }
        } finally {
          this.hintPending = false;
        }
      }, 16);
    }).finally(() => {
      this.hintAdPending = false;
    });
  }

  currentHintStateKey() {
    if (!this.level || !this.blocks) return '';
    return this.solverKey(this.normalizeSolverState(this.makeSolverState()));
  }

  findHintMove() {
    if (this.finished) return null;
    const cachedMove = this.hintMoveFromCache();
    const designerMove = this.solverDesignerNextMoveFromCurrent();
    let move = cachedMove;
    if (!move) move = this.solverDesignerPathHintFromCurrent();
    if (!move) move = this.solverHistoryRecoveryHintFromCurrent();
    if (!move) {
      move = this.solveNextMove({
        maxDepth: Math.max(40, Number(this.level.bestSteps) + 10),
        preferredMove: designerMove,
        maxNodes: 600000,
        deadlineMs: 3200,
      });
    }
    return move;
  }

  showHintFailure() {
    const status = this.lastSolveStatus || 'limited';
    if (status === 'exhausted') {
      this.showToast(this.steps === 0 ? '\u5f53\u524d\u5173\u5361\u65e0\u89e3\uff0c\u8bf7\u91cd\u8bd5\u6216\u68c0\u67e5\u5173\u5361' : '\u5f53\u524d\u5c40\u9762\u65e0\u6cd5\u901a\u8fc7\uff0c\u8bf7\u64a4\u9500\u6216\u91cd\u8bd5');
    } else {
      this.showToast('\u5f53\u524d\u5c40\u9762\u641c\u7d22\u8d85\u65f6\uff0c\u8bf7\u64a4\u9500\u4e00\u6b65\u540e\u518d\u8bd5');
    }
  }

  displayHintMove(move, simulated = false) {
    if (!move) {
      return false;
    }
    this.hintBlockId = move.blockId;
    this.hintUntil = Date.now() + 2700;
    const suffix = move.remaining ? `\uff0c\u5269\u4f59\u6700\u591a ${move.remaining} \u6b65` : '';
    this.showToast(`${simulated ? '\u6a21\u62df\u5e7f\u544a\u5b8c\u6210\uff0c' : ''}\u9ad8\u4eae\u65b9\u5757\u5411${this.dirText(move.dir)}\u79fb\u52a8 ${move.amount} \u683c${suffix}`, 2700);
    this.play('star');
    return true;
  }

  showHint(simulated = false) {
    const move = this.findHintMove();
    if (!move) {
      this.showHintFailure();
      return false;
    }
    return this.displayHintMove(move, simulated);
  }

  updateGameEffects() {
    const now = Date.now();
    for (const [id, animation] of this.blockAnimations) {
      if (now >= animation.start + animation.duration) this.blockAnimations.delete(id);
    }
    let removedDelayedIce = false;
    (this.blocks || []).forEach((block) => {
      if (block.type !== 'ice' || !block.removeAt || now < block.removeAt) return;
      this.spawnIceBurst(block);
      this.blocks = this.blocks.filter((item) => item.id !== block.id);
      block.removeAt = 0;
      removedDelayedIce = true;
    });
    if (removedDelayedIce) {
      const beforeMagnet = this.snapshotBlockPositions();
      this.resolveMagnetForces();
      this.collectCoinsFromMovementSnapshot(beforeMagnet);
      this.animateMovedBlocks(beforeMagnet, (item) => item.type === 'magnet', MAGNET_SLIDE_MS);
    }
    this.boardEffects = (this.boardEffects || []).filter((effect) => now < effect.start + effect.duration);
  }

  isBoardBusy() {
    return Date.now() < (this.animationLockUntil || 0) || this.blockAnimations.size > 0;
  }

  lockBoardFor(ms) {
    this.animationLockUntil = Math.max(this.animationLockUntil || 0, Date.now() + ms);
  }

  resolveSpecialAfterMove(block, move = null) {
    this.resolveIceImpact(block, move);
    const teleported = this.resolveTeleportForBlock(block);
    if (teleported === false) return false;
    this.resolveKeyLocks();
    this.collectCoinsFromBlocks();
    const beforeMagnet = this.snapshotBlockPositions();
    this.resolveMagnetForces(block);
    this.collectCoinsFromMovementSnapshot(beforeMagnet);
    this.animateMovedBlocks(beforeMagnet, (item) => item.type === 'magnet', MAGNET_SLIDE_MS);
    return true;
  }

  collectCoinsFromBlocks() {
    if (!this.level?.specialCells?.length) return;
    let collected = 0;
    this.level.specialCells.forEach((cell) => {
      if (cell.type !== 'coin' || cell.collected) return;
      if (!this.blocks.some((block) => this.blockOverlapsCell(block, cell))) return;
      cell.collected = true;
      collected += COIN_REWARD_PER_CELL;
    });
    if (collected > 0) {
      this.collectedCoinsThisLevel = (this.collectedCoinsThisLevel || 0) + collected;
      this.showToast(`\u91d1\u5e01 +${collected}`);
      this.play('coin');
    }
  }

  collectCoinsForBlockPath(block, fromX, fromY, toX, toY) {
    if (!block || !this.level?.specialCells?.length) return;
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    let collected = 0;
    for (let step = 0; step <= steps; step += 1) {
      const preview = { ...block, x: fromX + dx * step, y: fromY + dy * step };
      this.level.specialCells.forEach((cell) => {
        if (cell.type !== 'coin' || cell.collected) return;
        if (!this.blockOverlapsCell(preview, cell)) return;
        cell.collected = true;
        collected += COIN_REWARD_PER_CELL;
      });
    }
    if (collected > 0) {
      this.collectedCoinsThisLevel = (this.collectedCoinsThisLevel || 0) + collected;
      this.showToast(`\u91d1\u5e01 +${collected}`);
      this.play('coin');
    }
  }

  collectCoinsFromMovementSnapshot(snapshot) {
    if (!snapshot) return;
    this.blocks.forEach((block) => {
      const start = snapshot[block.id];
      if (!start || (start.x === block.x && start.y === block.y)) return;
      this.collectCoinsForBlockPath(block, start.x, start.y, block.x, block.y);
    });
  }

  snapshotBlockPositions() {
    return (this.blocks || []).reduce((map, block) => {
      map[block.id] = { x: block.x, y: block.y };
      return map;
    }, {});
  }

  animateMovedBlocks(snapshot, predicate = null, duration = MAGNET_SLIDE_MS) {
    if (!snapshot) return;
    const now = Date.now();
    let animated = false;
    this.blocks.forEach((block) => {
      const start = snapshot[block.id];
      if (!start || (predicate && !predicate(block))) return;
      if (start.x === block.x && start.y === block.y) return;
      this.blockAnimations.set(block.id, {
        fromX: start.x,
        fromY: start.y,
        toX: block.x,
        toY: block.y,
        start: now,
        duration,
      });
      animated = true;
    });
    if (animated) this.lockBoardFor(duration);
  }

  resolveTeleportForBlock(block) {
    if (!block || !this.level?.specialCells?.length) return true;
    const portals = this.level.specialCells.filter((cell) => cell.type === 'teleport');
    if (!portals.length) return true;
    const portal = portals.find((cell) => this.blockFullyInsideCell(block, cell));
    if (!portal) {
      block.lastPortalId = '';
      return true;
    }
    if (block.lastPortalId === portal.portalId) return true;
    const pair = portals.find((cell) => cell.portalId === portal.pairId);
    if (!pair) return true;
    const nextX = pair.x + (block.x - portal.x);
    const nextY = pair.y + (block.y - portal.y);
    if (!this.canPlaceBlockAt(block, nextX, nextY, block.id)) {
      this.showToast('\u65e0\u6cd5\u7a7f\u8fc7\u65f6\u7a7a\u4e4b\u95e8\uff0c\u5bf9\u9762\u95e8\u4e0a\u6709\u969c\u788d');
      return false;
    }
    block.x = nextX;
    block.y = nextY;
    block.lastPortalId = pair.portalId;
    this.showToast('\u7a7f\u8fc7\u65f6\u7a7a\u4e4b\u95e8');
    return true;
  }

  resolveIceImpact(block, move) {
    if (!block || !move || !move.delta) return;
    const reachedLimit = move.delta < 0 ? move.finalAxis === move.range.min : move.finalAxis === move.range.max;
    if (!reachedLimit) return;
    if (block.type === 'ice') {
      const step = this.stepResultForBlocks([block], move.dir);
      if (!step.canMove) this.damageIceBlock(block);
      return;
    }
    const linkedIds = block.type === 'magnet' ? this.magnetGroupIds(block) : [block.id];
    const isLinkedGroup = linkedIds.length > 1;
    const movingBlocks = isLinkedGroup ? this.blocks.filter((item) => linkedIds.includes(item.id)) : [block];
    this.damageIceBlockersIfOnlyObstacle(movingBlocks, move.dir, (ice) => this.damageIceBlock(ice));
  }

  damageIceBlock(ice) {
    if (!ice || ice.type !== 'ice') return false;
    if (ice.iceState === 'cracked') {
      this.spawnIceBurst(ice);
      this.blocks = this.blocks.filter((block) => block.id !== ice.id);
      this.showToast('\u51b0\u5757\u788e\u88c2\u6d88\u5931');
    } else {
      ice.iceState = 'cracked';
      ice.style = 'ice_cracked';
      this.spawnIceCrackPulse(ice);
      this.showToast('\u51b0\u5757\u88c2\u5f00\u4e86');
    }
    this.play('snap');
    return true;
  }

  breakIceBlockByMagnetRepulsion(ice) {
    if (!ice || ice.type !== 'ice') return false;
    if (ice.iceState === 'cracked') {
      if (ice.removeAt && Date.now() < ice.removeAt) return false;
      this.spawnIceBurst(ice);
      this.blocks = this.blocks.filter((block) => block.id !== ice.id);
      ice.removeAt = 0;
    } else {
      ice.iceState = 'cracked';
      ice.style = 'ice_cracked';
      ice.removeAt = Date.now() + MAGNET_REPEL_ICE_BREAK_DELAY_MS;
      this.spawnIceCrackPulse(ice, MAGNET_REPEL_ICE_BREAK_DELAY_MS);
      this.lockBoardFor(MAGNET_REPEL_ICE_BREAK_DELAY_MS);
    }
    this.play('snap');
    return true;
  }

  damageIceBlockersIfOnlyObstacle(blocks, dir, damage) {
    const step = this.stepResultForBlocks(blocks, dir);
    if (step.canMove || step.blockedByOther || !step.iceBlockers.length) return false;
    let changed = false;
    step.iceBlockers.forEach((ice) => {
      if (damage(ice)) changed = true;
    });
    return changed;
  }

  stepResultForBlocks(blocks, dir) {
    const movingBlocks = (blocks || []).filter(Boolean);
    const ignored = new Set(movingBlocks.map((block) => block.id));
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    return this.blocksPlacementResult(movingBlocks, dx, dy, ignored);
  }

  spawnIceCrackPulse(ice, duration = 420) {
    this.boardEffects.push({
      type: 'iceBurst',
      rect: { x: ice.x, y: ice.y, w: ice.w, h: ice.h },
      start: Date.now(),
      duration,
      pieces: this.iceBurstPieces(ice, 0.38),
    });
  }

  spawnIceBurst(ice) {
    this.boardEffects.push({
      type: 'iceBurst',
      rect: { x: ice.x, y: ice.y, w: ice.w, h: ice.h },
      start: Date.now(),
      duration: ICE_SHATTER_MS,
      pieces: this.iceBurstPieces(ice, 0.72),
    });
  }

  iceBurstPieces(ice, scale) {
    const count = clamp(Math.round((ice.w * ice.h) * 7), 7, 18);
    return Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count + ((index % 3) - 1) * 0.24;
      const distance = scale * (0.75 + (index % 4) * 0.18);
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 0.14 + (index % 3) * 0.035,
        rot: angle,
        spin: (index % 2 ? -1 : 1) * (1.2 + (index % 5) * 0.22),
        fill: index % 2 ? '#bae6fd' : '#e0f2fe',
      };
    });
  }

  resolveKeyLocks() {
    const keys = this.blocks.filter((block) => block.type === 'key');
    keys.forEach((key) => {
      const locked = this.blocks.find((block) => block.type === 'locked' && block.id === key.unlockTargetId);
      if (!locked || !this.blocksTouchOrOverlap(key, locked)) return;
      this.blocks = this.blocks.filter((block) => block.id !== key.id);
      locked.type = 'normal';
      locked.moveDir = locked.unlockedMoveDir || 'horizontal';
      locked.style = styleFor(locked);
      this.showToast('\u94a5\u5319\u6253\u5f00\u4e86\u9501');
      this.play('star');
    });
  }

  resolveMagnetForces(originBlock = null) {
    for (let guard = 0; guard < 12; guard += 1) {
      const before = this.snapshotBlockPositions();
      const beforeLinks = this.snapshotMagnetLinks();
      const magnets = this.blocks.filter((block) => block.type === 'magnet');
      let changed = false;
      const candidates = this.magnetForceCandidates(magnets, originBlock);
      for (const candidate of candidates) {
        if (!this.blocks.includes(candidate.a) || !this.blocks.includes(candidate.b)) continue;
        if (this.magnetGroupIds(candidate.a).includes(candidate.b.id)) continue;
        changed = candidate.attract
          ? this.applyMagnetAttraction(candidate.a, candidate.b, candidate.relation, originBlock)
          : this.applyMagnetRepulsion(candidate.a, candidate.b, candidate.relation);
        if (changed) break;
      }
      if (changed && !this.magnetStateValid()) {
        this.restoreBlockPositions(before);
        this.restoreMagnetLinks(beforeLinks);
        changed = false;
      }
      if (!changed) break;
    }
  }

  magnetForceCandidates(magnets, originBlock = null) {
    const candidates = [];
    for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const a = magnets[i];
        const b = magnets[j];
        const groupA = this.magnetGroupIds(a);
        const groupB = this.magnetGroupIds(b);
        if (groupA.includes(b.id)) continue;
        const relation = this.magnetLineRelation(a, b);
        if (!relation || !this.magnetLineClear(relation, a, b)) continue;
        const attract = this.magnetsAttractForRelation(a, b, relation);
        if (attract === null) continue;
        const originIds = originBlock?.type === 'magnet' ? this.magnetGroupIds(originBlock) : [];
        const originScore = originIds.length && (groupA.some((id) => originIds.includes(id)) || groupB.some((id) => originIds.includes(id))) ? 0 : 1;
        candidates.push({ a, b, relation, attract, originScore, gap: relation.gap });
      }
    }
    return candidates.sort((left, right) => (
      left.originScore - right.originScore
      || left.gap - right.gap
      || Number(left.attract) - Number(right.attract)
      || left.a.id.localeCompare(right.a.id)
      || left.b.id.localeCompare(right.b.id)
    ));
  }

  snapshotMagnetLinks() {
    return (this.blocks || []).reduce((map, block) => {
      if (block.type === 'magnet') map[block.id] = this.magnetGroupIds(block);
      return map;
    }, {});
  }

  restoreBlockPositions(snapshot) {
    if (!snapshot) return;
    (this.blocks || []).forEach((block) => {
      const pos = snapshot[block.id];
      if (!pos) return;
      block.x = pos.x;
      block.y = pos.y;
    });
  }

  restoreMagnetLinks(snapshot) {
    if (!snapshot) return;
    (this.blocks || []).forEach((block) => {
      if (block.type === 'magnet' && snapshot[block.id]) block.linkedIds = [...snapshot[block.id]];
    });
  }

  magnetStateValid() {
    const magnets = this.blocks.filter((block) => block.type === 'magnet');
    for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const idsA = this.magnetGroupIds(magnets[i]);
        if (idsA.includes(magnets[j].id)) continue;
        if (this.blocksOverlapPhysical(magnets[i], magnets[j])) return false;
      }
    }
    return true;
  }

  magnetsAttract(a, b) {
    return (a.pole || 'N') !== (b.pole || 'N');
  }

  magnetsAttractForRelation(a, b, relation) {
    const firstPole = relation?.first?.pole || a?.pole || 'N';
    const secondPole = relation?.second?.pole || b?.pole || 'N';
    return firstPole !== secondPole;
  }

  applyMagnetAttraction(a, b, relation, originBlock = null) {
    if (!a || !b || !relation) return false;
    if (relation.gap <= 0) return this.linkTouchingOppositeMagnetGroups(a, b);
    const mover = this.magnetAttractionMover(a, b, originBlock);
    const anchor = mover === a ? b : a;
    const moved = this.slideMagnetToward(mover, anchor);
    const linked = this.linkTouchingOppositeMagnetGroups(mover, anchor);
    if (linked) return true;
    if (moved) this.showToast('\u5f02\u6781\u78c1\u94c1\u5438\u9644');
    return moved;
  }

  magnetAttractionMover(a, b, originBlock) {
    if (originBlock?.type === 'magnet') {
      const groupA = this.magnetGroupIds(a);
      const groupB = this.magnetGroupIds(b);
      if (groupA.includes(originBlock.id)) return a;
      if (groupB.includes(originBlock.id)) return b;
    }
    const aSize = this.magnetGroupIds(a).length;
    const bSize = this.magnetGroupIds(b).length;
    if (aSize === 1 && bSize > 1) return a;
    if (bSize === 1 && aSize > 1) return b;
    return a;
  }

  slideMagnetToward(mover, anchor) {
    if (!mover || !anchor) return false;
    let moved = false;
    for (let guard = 0; guard < Math.max(this.level.width, this.level.height) + 2; guard += 1) {
      const relation = this.magnetLineRelation(mover, anchor);
      if (!relation || relation.gap <= 0) break;
      const moverIds = this.magnetGroupIds(mover);
      const moverIsFirst = moverIds.includes(relation.first.id);
      const dir = relation.axis === 'horizontal'
        ? (moverIsFirst ? 'R' : 'L')
        : (moverIsFirst ? 'D' : 'U');
      if (!this.moveMagnetGroupByDir(mover, dir)) break;
      moved = true;
    }
    return moved;
  }

  moveMagnetGroupByDir(magnet, dir) {
    const linkedIds = this.magnetGroupIds(magnet);
    const linkedBlocks = this.blocks.filter((b) => linkedIds.includes(b.id));
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    const step = this.linkedGroupStepResult(linkedBlocks, dir);
    if (!step.canMove) return false;
    for (const b of linkedBlocks) {
      b.x += dx;
      b.y += dy;
    }
    return true;
  }

  moveLinkedGroupByDir(magnet, dir) {
    return this.moveMagnetGroupByDir(magnet, dir);
  }

  linkedGroupStepResult(linkedBlocks, dir) {
    const ignored = new Set((linkedBlocks || []).map((block) => block.id));
    if (!linkedBlocks?.length) return { canMove: false, iceBlockers: [], blockedByOther: true };
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    return this.blocksPlacementResult(linkedBlocks, dx, dy, ignored);
  }

  singleBlockStepResult(block, dir) {
    if (!block) return { canMove: false, iceBlockers: [], blockedByOther: true };
    const next = this.nextPosition(block, dir);
    return this.canMoveMagnetEntityTo(block, next.x, next.y);
  }

  isTargetExitTransition(block, x, y) {
    if (!block || block.id !== this.level?.targetId) return false;
    const exit = this.level.exit;
    if (exit.side === 'right') {
      return block.x === this.level.width - block.w
        && block.y === exit.y
        && x === block.x + 1
        && y === block.y;
    }
    if (exit.side === 'left') {
      return block.x === 0
        && block.y === exit.y
        && x === -1
        && y === block.y;
    }
    if (exit.side === 'top') {
      return block.y === 0
        && block.x === exit.x
        && y === -1
        && x === block.x;
    }
    return block.y === this.level.height - block.h
      && block.x === exit.x
      && y === block.y + 1
      && x === block.x;
  }

  canMoveMagnetEntityTo(block, x, y) {
    if (!block) return { canMove: false, iceBlockers: [], blockedByOther: true };
    if (this.isTargetExitTransition(block, x, y)) {
      return { canMove: true, iceBlockers: [], blockedByOther: false, exitsBoard: true };
    }
    const linkedIds = block.type === 'magnet' ? this.magnetGroupIds(block) : [block.id];
    const ignored = new Set(linkedIds);
    const dx = x - block.x;
    const dy = y - block.y;
    if (linkedIds.length > 1) {
      return this.blocksPlacementResult(this.blocks.filter((item) => linkedIds.includes(item.id)), dx, dy, ignored);
    }
    return this.rectPlacementResult({ x, y, w: block.w, h: block.h }, ignored);
  }

  blocksPlacementResult(blocks, dx, dy, ignored) {
    const ignoredSet = this.ignoredIdSet(ignored);
    const iceBlockers = new Map();
    for (const block of blocks || []) {
      const rect = { x: block.x + dx, y: block.y + dy, w: block.w, h: block.h };
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > this.level.width || rect.y + rect.h > this.level.height) {
        return { canMove: false, iceBlockers: [], blockedByOther: true };
      }
      for (const cell of this.cellsCoveredByRect(rect)) {
        const blocker = this.blockAtCell(cell, ignoredSet);
        if (!blocker) continue;
        if (blocker.type === 'ice') iceBlockers.set(blocker.id, blocker);
        else return { canMove: false, iceBlockers: [], blockedByOther: true };
      }
    }
    if (iceBlockers.size) return { canMove: false, iceBlockers: [...iceBlockers.values()], blockedByOther: false };
    return { canMove: true, iceBlockers: [], blockedByOther: false };
  }

  rectPlacementResult(rect, ignored) {
    const ignoredSet = this.ignoredIdSet(ignored);
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > this.level.width || rect.y + rect.h > this.level.height) {
      return { canMove: false, iceBlockers: [], blockedByOther: true };
    }
    const iceBlockers = new Map();
    const cells = this.cellsCoveredByRect(rect);
    for (const cell of cells) {
      const [x, y] = cell.split(',').map(Number);
      const blocker = this.blockAtCell(`${x},${y}`, ignoredSet);
      if (!blocker) continue;
      if (blocker.type === 'ice') iceBlockers.set(blocker.id, blocker);
      else return { canMove: false, iceBlockers: [], blockedByOther: true };
    }
    if (iceBlockers.size) return { canMove: false, iceBlockers: [...iceBlockers.values()], blockedByOther: false };
    return { canMove: true, iceBlockers: [], blockedByOther: false };
  }

  blocksStepResult(blocks, dir, ignored) {
    const ignoredSet = this.ignoredIdSet(ignored);
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    const iceBlockers = new Map();
    for (const block of blocks) {
      const nx = block.x + dx;
      const ny = block.y + dy;
      if (nx < 0 || ny < 0 || nx + block.w > this.level.width || ny + block.h > this.level.height) {
        return { canMove: false, iceBlockers: [], blockedByOther: true };
      }
      for (let y = 0; y < block.h; y += 1) {
        for (let x = 0; x < block.w; x += 1) {
          const cell = `${nx + x},${ny + y}`;
          const blocker = this.blockAtCell(cell, ignoredSet);
          if (!blocker) continue;
          if (blocker.type === 'ice') iceBlockers.set(blocker.id, blocker);
          else return { canMove: false, iceBlockers: [], blockedByOther: true };
        }
      }
    }
    if (iceBlockers.size) return { canMove: false, iceBlockers: [...iceBlockers.values()], blockedByOther: false };
    return { canMove: true, iceBlockers: [], blockedByOther: false };
  }

  applyMagnetRepulsion(a, b, relation) {
    const first = relation.first;
    const second = relation.second;
    const dirA = relation.axis === 'horizontal'
      ? (relation.firstRect.x < relation.secondRect.x ? 'L' : 'R')
      : (relation.firstRect.y < relation.secondRect.y ? 'U' : 'D');
    const dirB = this.oppositeDir(dirA);
    const planA = this.planRepulsionSlide(first, dirA);
    const planB = this.planRepulsionSlide(second, dirB);
    const movedA = this.applyRepulsionPlan(planA);
    const movedB = this.applyRepulsionPlan(planB);
    if (movedA || movedB) {
      this.showToast('\u540c\u6781\u78c1\u94c1\u76f8\u65a5');
      return true;
    }
    return false;
  }

  planRepulsionSlide(block, dir) {
    const linkedIds = block.type === 'magnet' ? this.magnetGroupIds(block) : [block.id];
    const ignored = new Set(linkedIds);
    const movingBlocks = this.blocks.filter((item) => linkedIds.includes(item.id));
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    const iceBlockers = new Map();
    let steps = 0;
    for (let guard = 0; guard < 20; guard += 1) {
      const step = this.blocksPlacementResult(movingBlocks, dx * (steps + 1), dy * (steps + 1), ignored);
      if (!step.canMove) {
        step.iceBlockers.forEach((ice) => iceBlockers.set(ice.id, ice));
        return {
          block,
          dir,
          linkedIds,
          steps,
          iceBlockers: [...iceBlockers.values()],
          blockedByOther: step.blockedByOther,
        };
      }
      steps += 1;
    }
    return { block, dir, linkedIds, steps, iceBlockers: [...iceBlockers.values()], blockedByOther: false };
  }

  applyRepulsionPlan(plan) {
    if (!plan) return false;
    const dx = plan.dir === 'L' ? -plan.steps : plan.dir === 'R' ? plan.steps : 0;
    const dy = plan.dir === 'U' ? -plan.steps : plan.dir === 'D' ? plan.steps : 0;
    let changed = false;
    if (plan.steps > 0) {
      this.blocks.forEach((block) => {
        if (!plan.linkedIds.includes(block.id)) return;
        block.x += dx;
        block.y += dy;
      });
      changed = true;
    }
    plan.iceBlockers.forEach((ice) => {
      if (this.breakIceBlockByMagnetRepulsion(ice)) changed = true;
    });
    return changed;
  }

  linkMagnetsIfAdjacent(a, b, relation = null) {
    return this.linkTouchingOppositeMagnetGroups(a, b, relation);
  }

  linkTouchingOppositeMagnetGroups(a, b, preferredRelation = null) {
    if (!this.blocks.includes(a) || !this.blocks.includes(b)) return false;
    if (this.magnetGroupIds(a).includes(b.id)) return false;
    const pairs = [];
    if (preferredRelation?.gap === 0) {
      pairs.push({ a: preferredRelation.first, b: preferredRelation.second, relation: preferredRelation });
    }
    const groupA = this.magnetBlocksFor(a);
    const groupB = this.magnetBlocksFor(b);
    groupA.forEach((left) => {
      groupB.forEach((right) => {
        if (this.magnetGroupIds(left).includes(right.id)) return;
        const relation = this.singleMagnetLineRelation(left, right);
        if (!relation || relation.gap !== 0) return;
        pairs.push({ a: left, b: right, relation });
      });
    });
    const pair = pairs.find((item) => (
      this.blocks.includes(item.a)
      && this.blocks.includes(item.b)
      && !this.magnetGroupIds(item.a).includes(item.b.id)
      && this.magnetsAttractForRelation(item.a, item.b, item.relation)
      && this.magnetLineClear(item.relation, item.a, item.b)
    ));
    if (!pair) return false;
    return this.mergeMagnetGroups(pair.a, pair.b, pair.relation);
  }

  mergeMagnetGroups(a, b, relation = null) {
    const groupA = this.magnetGroupIds(a);
    const groupB = this.magnetGroupIds(b);
    if (groupA.includes(b.id)) return false;
    this.resolveMergeIceImpact(a, b, relation);
    const combinedIds = [...new Set([...groupA, ...groupB])].sort();
    this.blocks.forEach((block) => {
      if (combinedIds.includes(block.id)) block.linkedIds = combinedIds;
    });
    this.spawnMagnetMergeGlow(combinedIds);
    this.showToast('\u78c1\u94c1\u5408\u5e76');
    return true;
  }

  spawnMagnetMergeGlow(ids) {
    const group = this.blocks.filter((block) => ids.includes(block.id));
    if (!group.length) return;
    this.boardEffects.push({
      type: 'magnetMerge',
      rects: group.map((block) => ({ x: block.x, y: block.y, w: block.w, h: block.h })),
      start: Date.now(),
      duration: MAGNET_MERGE_GLOW_MS,
    });
  }

  resolveMergeIceImpact(a, b, relation = null) {
    const dir = this.mergeImpactDir(a, b, relation);
    if (!dir) return;
    const groupIds = [...new Set([...this.magnetGroupIds(a), ...this.magnetGroupIds(b)])];
    const group = this.blocks.filter((block) => groupIds.includes(block.id));
    this.damageIceBlockersIfOnlyObstacle(group, dir, (ice) => this.damageIceBlock(ice));
  }

  mergeImpactDir(a, b, relation = null) {
    if (relation?.axis === 'horizontal') return this.magnetGroupIds(a).includes(relation.first.id) ? 'R' : 'L';
    if (relation?.axis === 'vertical') return this.magnetGroupIds(a).includes(relation.first.id) ? 'D' : 'U';
    const ar = this.collisionRectForBlock(a);
    const br = this.collisionRectForBlock(b);
    if (ar.x + ar.w === br.x) return 'R';
    if (br.x + br.w === ar.x) return 'L';
    if (ar.y + ar.h === br.y) return 'D';
    if (br.y + br.h === ar.y) return 'U';
    return null;
  }

  magnetLineRelation(a, b) {
    return this.singleMagnetLineRelation(a, b);
  }

  singleMagnetLineRelation(a, b) {
    const ar = { x: a.x, y: a.y, w: a.w, h: a.h };
    const br = { x: b.x, y: b.y, w: b.w, h: b.h };
    const horizontalOverlap = ar.y < br.y + br.h && ar.y + ar.h > br.y;
    const verticalOverlap = ar.x < br.x + br.w && ar.x + ar.w > br.x;
    if (horizontalOverlap && (ar.x + ar.w <= br.x || br.x + br.w <= ar.x)) {
      const first = ar.x <= br.x ? a : b;
      const second = first === a ? b : a;
      const fr = first === a ? ar : br;
      const sr = second === a ? ar : br;
      return { axis: 'horizontal', first, second, firstRect: fr, secondRect: sr, gap: sr.x - (fr.x + fr.w), line: Math.max(fr.y, sr.y) };
    }
    if (verticalOverlap && (ar.y + ar.h <= br.y || br.y + br.h <= ar.y)) {
      const first = ar.y <= br.y ? a : b;
      const second = first === a ? b : a;
      const fr = first === a ? ar : br;
      const sr = second === a ? ar : br;
      return { axis: 'vertical', first, second, firstRect: fr, secondRect: sr, gap: sr.y - (fr.y + fr.h), line: Math.max(fr.x, sr.x) };
    }
    return null;
  }

  magnetLineClear(relation, a, b) {
    const occupied = this.buildIndividualOccupancy(a.id, b.id);
    if (relation.axis === 'horizontal') {
      const minY = Math.max(relation.firstRect.y, relation.secondRect.y);
      const maxY = Math.min(relation.firstRect.y + relation.firstRect.h, relation.secondRect.y + relation.secondRect.h);
      for (let x = relation.firstRect.x + relation.firstRect.w; x < relation.secondRect.x; x += 1) {
        for (let y = minY; y < maxY; y += 1) {
          if (occupied.has(`${x},${y}`)) return false;
        }
      }
    } else {
      const minX = Math.max(relation.firstRect.x, relation.secondRect.x);
      const maxX = Math.min(relation.firstRect.x + relation.firstRect.w, relation.secondRect.x + relation.secondRect.w);
      for (let y = relation.firstRect.y + relation.firstRect.h; y < relation.secondRect.y; y += 1) {
        for (let x = minX; x < maxX; x += 1) {
          if (occupied.has(`${x},${y}`)) return false;
        }
      }
    }
    return true;
  }

  slideBlockToLimit(block, dir) {
    const linkedIds = block.type === 'magnet' ? this.magnetGroupIds(block) : [block.id];
    const isLinkedGroup = linkedIds.length > 1;
    const linkedBlocks = isLinkedGroup ? this.blocks.filter((item) => linkedIds.includes(item.id)) : null;
    let moved = false;
    let brokeIce = false;
    while (true) {
      const step = isLinkedGroup
        ? this.linkedGroupStepResult(linkedBlocks, dir)
        : this.singleBlockStepResult(block, dir);
      if (!step.canMove) {
        if (!step.blockedByOther && step.iceBlockers.length) {
          step.iceBlockers.forEach((ice) => {
            if (this.breakIceBlockByMagnetRepulsion(ice)) brokeIce = true;
          });
        }
        break;
      }
      if (isLinkedGroup) {
        this.moveLinkedGroupByDir(block, dir);
      } else {
        const next = this.nextPosition(block, dir);
        block.x = next.x;
        block.y = next.y;
      }
      moved = true;
    }
    return moved || brokeIce;
  }

  nextPosition(block, dir) {
    if (dir === 'L') return { x: block.x - 1, y: block.y };
    if (dir === 'R') return { x: block.x + 1, y: block.y };
    if (dir === 'U') return { x: block.x, y: block.y - 1 };
    return { x: block.x, y: block.y + 1 };
  }

  oppositeDir(dir) {
    return dir === 'L' ? 'R' : dir === 'R' ? 'L' : dir === 'U' ? 'D' : 'U';
  }

  blockHasCell(block, key) {
    return this.cellsCoveredByRect(block).includes(key);
  }

  canPlaceBlockAt(block, x, y, ...ignoreIds) {
    const candidate = { ...block, x, y };
    const occupied = this.buildOccupancy(...ignoreIds);
    return !this.wouldCollide(candidate, occupied);
  }

  blockFullyInsideCell(block, cell) {
    const cellW = cell.w || 1;
    const cellH = cell.h || 1;
    return block.x >= cell.x
      && block.y >= cell.y
      && block.x + block.w <= cell.x + cellW
      && block.y + block.h <= cell.y + cellH;
  }

  blockOverlapsCell(block, cell) {
    const cellW = cell.w || 1;
    const cellH = cell.h || 1;
    return block.x < cell.x + cellW
      && block.x + block.w > cell.x
      && block.y < cell.y + cellH
      && block.y + block.h > cell.y;
  }

  blocksTouchOrOverlap(a, b) {
    const ar = this.collisionRectForBlock(a);
    const br = this.collisionRectForBlock(b);
    const overlap = this.rectsOverlap(ar, br);
    const verticalSpan = ar.y < br.y + br.h && ar.y + ar.h > br.y;
    const horizontalSpan = ar.x < br.x + br.w && ar.x + ar.w > br.x;
    const horizontalTouch = verticalSpan && (ar.x + ar.w === br.x || br.x + br.w === ar.x);
    const verticalTouch = horizontalSpan && (ar.y + ar.h === br.y || br.y + br.h === ar.y);
    return overlap || horizontalTouch || verticalTouch;
  }

  blocksTouchWithoutOverlap(a, b) {
    const ar = this.collisionRectForBlock(a);
    const br = this.collisionRectForBlock(b);
    const overlap = this.rectsOverlap(ar, br);
    if (overlap) return false;
    const verticalSpan = ar.y < br.y + br.h && ar.y + ar.h > br.y;
    const horizontalSpan = ar.x < br.x + br.w && ar.x + ar.w > br.x;
    return (verticalSpan && (ar.x + ar.w === br.x || br.x + br.w === ar.x))
      || (horizontalSpan && (ar.y + ar.h === br.y || br.y + br.h === ar.y));
  }

  collisionRectForBlock(block) {
    return { x: block.x, y: block.y, w: block.w, h: block.h };
  }

  rectsOverlap(a, b) {
    return a.x < b.x + b.w
      && a.x + a.w > b.x
      && a.y < b.y + b.h
      && a.y + a.h > b.y;
  }

  checkWin() {
    if (this.finished) return;
    const target = this.blocks.find((block) => block.id === this.level.targetId);
    if (!target || !this.hasReachedExit(target)) return;
    this.finished = true;
    this.play('success');
    this.createConfetti();
    const stars = this.calculateStars();
    const progress = this.levelProgress(this.level.levelId);
    const coinBonus = this.collectedCoinsThisLevel || 0;
    const baseReward = progress.passed ? stars * 2 : stars * 10;
    const reward = baseReward + coinBonus;
    this.save.coins += reward;
    this.completeLevel(stars);
    this.saveData();
    this.queueCloudSave(0);
    this.resultOverlay = { stars, reward, baseReward, coinBonus, firstClear: !progress.passed };
    this.showCompletionInterstitial(this.level.levelId);
  }

  checkFailure() {
    if (!this.finished && this.steps >= this.level.stepLimit) {
      this.finished = true;
      this.play('fail');
      this.failureOverlay = true;
    }
  }

  calculateStars() {
    const best = this.level.bestSteps || Math.max(1, this.level.designerSolution?.length || this.level.stepLimit);
    const rule = this.level.starRule || DEFAULT_STAR_RULE;
    const bonus = Number(this.addStepStarBonus) || 0;
    if (this.steps <= best + rule.three + bonus) return 3;
    if (this.steps <= best + rule.two + bonus) return 2;
    return 1;
  }

  completeLevel(stars) {
    const key = String(this.level.levelId);
    const prev = this.levelProgress(this.level.levelId);
    this.save.levelProgress[key] = {
      passed: true,
      stars: Math.max(prev.stars, stars),
      bestSteps: prev.bestSteps > 0 ? Math.min(prev.bestSteps, this.steps) : this.steps,
    };
    this.save.highestUnlockedLevel = this.contiguousUnlockedLevel(this.save.levelProgress);
  }

  contiguousUnlockedLevel(progress = this.save?.levelProgress || {}) {
    const maximum = Math.max(1, this.levels?.length || 1);
    let unlocked = 1;
    for (let levelId = 1; levelId < maximum; levelId += 1) {
      if (progress[String(levelId)]?.passed !== true) break;
      unlocked = levelId + 1;
    }
    return unlocked;
  }

  levelProgress(levelId) {
    return this.save.levelProgress[String(levelId)] || { passed: false, stars: 0, bestSteps: 0 };
  }

  totalStars() {
    return Object.values(this.save.levelProgress).reduce((sum, item) => sum + (item.stars || 0), 0);
  }

  buySkin(skin, unlock) {
    const price = unlock.coins || skin.price || 0;
    if (this.save.coins < price) {
      this.showToast('\u91d1\u5e01\u4e0d\u8db3\uff0c\u5148\u53bb\u8fc7\u5173\u6512\u4e00\u70b9\u5427');
      return;
    }
    this.save.coins -= price;
    this.save.ownedCharacterSkins.push(skin.id);
    this.save.currentCharacterSkin = skin.id;
    this.saveData();
    this.play('coin');
  }

  buyTheme(theme, unlock) {
    const price = unlock.coins || theme.price || 0;
    if (this.save.coins < price) {
      this.showToast('\u91d1\u5e01\u4e0d\u8db3\uff0c\u5148\u53bb\u8fc7\u5173\u6512\u4e00\u70b9\u5427');
      return;
    }
    this.save.coins -= price;
    this.save.ownedThemes.push(theme.id);
    this.save.currentTheme = theme.id;
    this.saveData();
    this.play('coin');
  }

  getShopCoinAdCounts() {
    const today = todayKey();
    if (this.save.rewardedAds.shopCoinsDay !== today) {
      this.save.rewardedAds.shopCoinsDay = today;
      this.save.rewardedAds.shopCoinsToday = 0;
      this.saveData();
    }
    const server = this.serverAdCounters.shopCoins;
    return {
      today: server?.date === today ? server.watchedCount : this.save.rewardedAds.shopCoinsToday,
      total: this.save.rewardedAds.shopCoinsTotal,
      dailyLimit: server?.date === today ? server.dailyLimit : null,
    };
  }

  callAdReward(action, type, extra = {}) {
    if (!this.cloudReady || !wxRuntime?.cloud?.callFunction) return Promise.resolve(null);
    return this.callCloudFunction({
      name: CLOUD_AD_REWARD_FUNCTION,
      data: {
        action,
        adType: type,
        scene: extra.scene || type,
        rewardType: extra.rewardType || type,
        rewardAmount: Number(extra.rewardAmount) || 0,
      },
    }).then((res) => res.result || null).catch((error) => {
      console.warn('\u5e7f\u544a\u6b21\u6570\u6821\u9a8c\u5931\u8d25', error);
      return null;
    });
  }

  rememberServerAdCounter(type, result) {
    if (!result || typeof result.watchedCount === 'undefined') return;
    const counter = {
      date: result.adDate || todayKey(),
      watchedCount: Number(result.watchedCount) || 0,
      dailyLimit: Number(result.dailyLimit) || 0,
      remaining: Number(result.remaining) || 0,
      riskLevel: Number(result.riskLevel) || 0,
      quotaKey: result.quotaKey || type,
    };
    this.serverAdCounters[type] = counter;
    if (result.quotaKey) this.serverAdCounters[result.quotaKey] = counter;
  }

  strictRewardedLimitType(type) {
    return type === 'addSteps' || type === 'coinDouble';
  }

  rewardedLimitReached(type) {
    if (!this.strictRewardedLimitType(type)) return false;
    const counter = this.serverAdCounters.gameplay_rewarded || this.serverAdCounters[type];
    return counter?.date === todayKey() && counter.dailyLimit > 0 && counter.remaining <= 0;
  }

  checkServerAdLimit(type) {
    return this.callAdReward('canWatch', type).then((result) => {
      this.rememberServerAdCounter(type, result);
      if (!result) {
        return this.strictRewardedLimitType(type)
          ? { allowed: false, message: '\u6fc0\u52b1\u5e7f\u544a\u6b21\u6570\u6821\u9a8c\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5' }
          : { allowed: true };
      }
      return {
        allowed: result.allowed !== false,
        message: result.message || '\u4eca\u65e5\u6fc0\u52b1\u5e7f\u544a\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650\uff0c\u660e\u5929\u518d\u6765\u5427',
      };
    });
  }

  finishServerAd(type, rewardAmount = 0) {
    return this.callAdReward('finish', type, { rewardAmount }).then((result) => {
      this.rememberServerAdCounter(type, result);
      if (!result) {
        return this.strictRewardedLimitType(type)
          ? { allowed: false, message: '\u6fc0\u52b1\u5e7f\u544a\u5956\u52b1\u786e\u8ba4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5' }
          : { allowed: true };
      }
      return {
        allowed: result.allowed !== false && result.finished !== false,
        message: result.message || '\u5e7f\u544a\u5956\u52b1\u786e\u8ba4\u5931\u8d25',
      };
    });
  }

  claimAdCoins(conf) {
    this.showRewarded('shopCoins', { rewardAmount: conf.coinsPerAd }).then((result) => {
      if (!result.ok) {
        this.showToast(result.message);
        return;
      }
      this.getShopCoinAdCounts();
      this.save.rewardedAds.shopCoinsToday += 1;
      this.save.rewardedAds.shopCoinsTotal += 1;
      this.save.coins += conf.coinsPerAd;
      this.saveData();
      this.showToast(`${result.simulated ? '\u6a21\u62df\u5e7f\u544a\u5b8c\u6210\uff0c' : ''}\u83b7\u5f97 ${conf.coinsPerAd} \u91d1\u5e01`);
      this.play('coin');
    });
  }

  doubleCoinsWithAd(reward) {
    if (this.coinDoublePending || this.resultOverlay?.doubleClaimed) return;
    if (this.rewardedLimitReached('coinDouble')) {
      this.showToast('\u4eca\u65e5\u6fc0\u52b1\u5e7f\u544a\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650\uff0c\u660e\u5929\u518d\u6765\u5427');
      return;
    }
    this.coinDoublePending = true;
    this.showRewarded('coinDouble', { rewardAmount: reward }).then((result) => {
      if (!result.ok) {
        this.showToast(result.message);
        return;
      }
      this.save.coins += reward;
      if (this.resultOverlay) {
        this.resultOverlay.doubleClaimed = true;
        this.resultOverlay.doubleReward = reward;
      }
      this.saveData();
      this.showToast(`\u53cc\u500d\u7ed3\u7b97\u6210\u529f\uff0c\u989d\u5916\u83b7\u5f97 ${reward} \u91d1\u5e01`);
      this.play('coin');
    }).finally(() => {
      this.coinDoublePending = false;
    });
  }

  showCompletionInterstitial(levelId) {
    const config = this.config.ads || {};
    const interstitial = config.interstitial || {};
    const firstLevel = Number(interstitial.firstLevel) || 10;
    const adUnitId = interstitial.adUnitId || config.interstitialAdUnitId || '';
    if (!config.enabled || interstitial.enabled === false || !adUnitId || Number(levelId) < firstLevel) return;
    if (!wxRuntime?.createInterstitialAd) {
      console.warn('\u63d2\u5c4f\u5e7f\u544a\u4e0d\u53ef\u7528: createInterstitialAd missing');
      return;
    }
    const ad = wxRuntime.createInterstitialAd({ adUnitId });
    const cleanup = () => {
      ad.offError?.(handleError);
      ad.offClose?.(handleClose);
    };
    const handleError = (error) => {
      cleanup();
      console.warn('\u63d2\u5c4f\u5e7f\u544a\u62c9\u53d6\u6216\u64ad\u653e\u5931\u8d25', error);
    };
    const handleClose = () => {
      cleanup();
    };
    ad.onError?.(handleError);
    ad.onClose?.(handleClose);
    ad.load()
      .then(() => ad.show())
      .catch(handleError);
  }

  showRewarded(type, options = {}) {
    const config = this.config.ads;
    const reward = config.rewards?.[type] || {};
    if (reward.enabled === false) return Promise.resolve({ ok: false, simulated: false, message: '\u8be5\u5e7f\u544a\u5956\u52b1\u672a\u5f00\u542f' });
    const adUnitId = reward.adUnitId || config.adUnitId;
    const playAd = () => {
      if (!config.enabled || !adUnitId || !wxRuntime?.createRewardedVideoAd) {
        return Promise.resolve({
          ok: false,
          simulated: false,
          message: '\u5e7f\u544a\u4f4d\u672a\u914d\u7f6e',
        });
      }
      return new Promise((resolve) => {
        let settled = false;
        const ad = wxRuntime.createRewardedVideoAd({ adUnitId });
        const done = (result) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(result);
        };
        const cleanup = () => {
          ad.offClose?.(handleClose);
          ad.offError?.(handleError);
        };
        const handleClose = (res) => {
          const completed = res?.isEnded === true;
          done({ ok: completed, simulated: false, message: completed ? '\u5e7f\u544a\u89c2\u770b\u5b8c\u6210' : '\u5e7f\u544a\u672a\u770b\u5b8c' });
        };
        const handleError = (error) => {
          done({ ok: false, simulated: false, message: error?.errMsg || String(error || '\u5e7f\u544a\u52a0\u8f7d\u5931\u8d25') });
        };
        ad.onClose(handleClose);
        ad.onError(handleError);
        ad.load()
          .then(() => ad.show())
          .catch(handleError);
      });
    };

    return this.checkServerAdLimit(type).then((permission) => {
      if (!permission.allowed) return { ok: false, simulated: false, message: permission.message };
      return playAd();
    }).then((result) => {
      if (!result.ok) return result;
      return this.finishServerAd(type, options.rewardAmount || 0).then((confirm) => {
        if (!confirm.allowed) return { ok: false, simulated: result.simulated, message: confirm.message };
        return result;
      });
    });
  }

  onTouchStart(event) {
    const point = this.touchPoint(event);
    if (this.scene === 'game' && this.isBoardBusy()) return;
    this.pressedPoint = point;
    this.pressedButton = [...this.buttons].reverse().find((button) => this.inRect(point, button));
    if (this.pressedButton) return;
    if (this.scene === 'game' && !this.finished && !this.resultOverlay && !this.failureOverlay && !this.tutorialOverlay && !this.isBoardBusy()) {
      const block = [...this.blocks].reverse().find((item) => item.moveDir !== 'none' && this.inRect(point, item.screenRect));
      if (block) {
        const linkedIds = block.type === 'magnet' ? this.magnetGroupIds(block) : [block.id];
        const linkedBlocks = block.type === 'magnet' && linkedIds.length > 1
          ? this.blocks.filter((b) => linkedIds.includes(b.id))
          : null;
        const linkedStartPositions = linkedBlocks
          ? linkedBlocks.reduce((map, b) => { map[b.id] = { x: b.x, y: b.y }; return map; }, {})
          : null;
        const axis = block.moveDir === 'vertical' ? 'vertical' : block.moveDir === 'horizontal' ? 'horizontal' : null;
        const range = linkedBlocks && axis
          ? this.getMoveRangeForLinkedGroup(block, linkedIds, axis)
          : (axis ? this.getMoveRange(block, axis) : (linkedBlocks ? this.getMoveRangeForLinkedGroup(block, linkedIds, 'horizontal') : { min: block.x, max: block.x }));
        this.dragging = {
          block,
          start: point,
          startX: block.x,
          startY: block.y,
          axis,
          range,
          currentAxis: axis === 'vertical' ? block.y : block.x,
          hasDragged: false,
          originalFacing: block.facing,
          linkedIds: linkedIds.length > 1 ? linkedIds : null,
          linkedStartPositions,
        };
        this.play('move');
        return;
      }
    }
    if (this.scene === 'menu' && this.tab === 'shop' && this.inRect(point, this.shopView)) {
      this.scrollDrag = { type: 'shop', start: point, startScroll: this.shopScroll };
    }
    if (this.scene === 'menu' && this.tab === 'rank' && this.inRect(point, this.rankView)) {
      this.scrollDrag = { type: 'rank', start: point, startScroll: this.rankScroll };
    }
  }

  onTouchMove(event) {
    const point = this.touchPoint(event);
    if (this.dragging) {
      const dx = point.x - this.dragging.start.x;
      const dy = point.y - this.dragging.start.y;
      if (this.dragging.linkedIds) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < this.cellSize * 0.12) return;
        this.restoreLinkedDragPositions(this.dragging);
        const choice = this.chooseLinkedDragAxis(this.dragging, dx, dy);
        if (!choice) return;
        this.dragging.axis = choice.axis;
        this.dragging.range = choice.range;
        this.dragging.currentAxis = this.dragging.axis === 'horizontal' ? this.dragging.startX : this.dragging.startY;
      } else if (!this.dragging.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < this.cellSize * 0.12) return;
        const chosenAxis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
        this.dragging.axis = chosenAxis;
        this.dragging.range = this.getMoveRange(this.dragging.block, this.dragging.axis);
      }
      const delta = this.dragging.axis === 'horizontal' ? dx / this.cellSize : dy / this.cellSize;
      const startAxis = this.dragging.axis === 'horizontal' ? this.dragging.startX : this.dragging.startY;
      const desiredAxis = clamp(startAxis + delta, this.dragging.range.min, this.dragging.range.max);
      this.dragging.currentAxis = this.closestLegalDragAxis(this.dragging, desiredAxis);
      if (this.dragging.block.type === 'target' && Math.abs(delta) > 0.08) {
        this.dragging.block.facing = this.facingFromMove(this.dragging.axis, delta);
      }
      this.dragging.hasDragged = Math.abs(delta) > 0.08;
      return;
    }
    if (this.scrollDrag) {
      const dy = point.y - this.scrollDrag.start.y;
      if (this.scrollDrag.type === 'shop') {
        const max = Math.max(0, (this.shopContentHeight || 0) - (this.shopView?.h || 0));
        this.shopScroll = clamp(this.scrollDrag.startScroll - dy, 0, max);
      } else {
        const max = Math.max(0, (this.rankContentHeight || 0) - (this.rankView?.h || 0));
        if (this.scrollDrag.startScroll <= 0 && dy > 0) {
          this.rankScroll = 0;
          this.rankPullDistance = clamp(dy * 0.45, 0, 70);
        } else {
          this.rankPullDistance = 0;
          this.rankScroll = clamp(this.scrollDrag.startScroll - dy, 0, max);
        }
      }
    }
  }

  onTouchEnd(event) {
    const point = this.touchPoint(event);
    if (this.dragging) {
      const drag = this.dragging;
      this.dragging = null;
      this.pressedPoint = null;
      if (!drag.axis || !drag.hasDragged) {
        this.restoreLinkedDragPositions(drag);
        if (drag.block.type === 'target') drag.block.facing = drag.originalFacing;
        this.play('invalid');
        return;
      }
      const finalAxis = Math.round(clamp(drag.currentAxis, drag.range.min, drag.range.max));
      const changed = drag.axis === 'horizontal' ? finalAxis !== drag.startX : finalAxis !== drag.startY;
      if (!changed) {
        this.restoreLinkedDragPositions(drag);
        if (drag.block.type === 'target') drag.block.facing = drag.originalFacing;
        this.play('invalid');
        return;
      }
      this.restoreLinkedDragPositions(drag);
      this.pushHistory();
      const delta = finalAxis - (drag.axis === 'horizontal' ? drag.startX : drag.startY);
      if (drag.axis === 'horizontal') drag.block.x = finalAxis;
      else drag.block.y = finalAxis;
      // Finalize linked magnet positions
      if (drag.linkedIds && drag.linkedStartPositions) {
        drag.linkedIds.forEach((id) => {
          const b = this.blocks.find((bl) => bl.id === id);
          if (!b || b.id === drag.block.id) return;
          const startPos = drag.linkedStartPositions[b.id];
          if (drag.axis === 'horizontal') b.x = startPos.x + delta;
          else b.y = startPos.y + delta;
        });
      }
      if (drag.block.type === 'target') drag.block.facing = this.facingFromMove(drag.axis, delta);
      if (!this.magnetStateValid()) {
        const snapshot = this.history.pop();
        if (snapshot) this.restoreSnapshot(snapshot);
        this.play('invalid');
        return;
      }
      this.collectCoinsForBlockPath(drag.block, drag.startX, drag.startY, drag.block.x, drag.block.y);
      if (drag.linkedIds && drag.linkedStartPositions) {
        drag.linkedIds.forEach((id) => {
          const b = this.blocks.find((bl) => bl.id === id);
          const startPos = drag.linkedStartPositions[id];
          if (!b || !startPos || b.id === drag.block.id) return;
          this.collectCoinsForBlockPath(b, startPos.x, startPos.y, b.x, b.y);
        });
      }
      const dir = drag.axis === 'horizontal'
        ? (delta < 0 ? 'L' : 'R')
        : (delta < 0 ? 'U' : 'D');
      const resolved = this.resolveSpecialAfterMove(drag.block, {
        axis: drag.axis,
        dir,
        delta,
        finalAxis,
        range: drag.range,
      });
      if (resolved === false) {
        const snapshot = this.history.pop();
        if (snapshot) this.restoreSnapshot(snapshot);
        this.play('invalid');
        return;
      }
      this.steps += 1;
      this.play('snap');
      this.checkWin();
      this.checkFailure();
      return;
    }
    if (this.scrollDrag) {
      if (this.scrollDrag.type === 'rank' && this.rankPullDistance >= 54) {
        this.ensurePrivacyAuthorized((authorized) => {
          if (authorized) this.refreshRankList({ toast: true });
        });
      }
      this.rankPullDistance = 0;
      this.scrollDrag = null;
      this.pressedPoint = null;
      return;
    }
    if (this.scene === 'game' && this.tutorialOverlay && !this.resultOverlay && !this.failureOverlay) {
      const step = this.tutorialOverlay.step || 0;
      const maxStep = this.tutorialOverlay.kind === 'special'
        ? (this.tutorialOverlay.thirdLines ? 2 : 1)
        : 3;
      if (step < maxStep) {
        this.tutorialOverlay.step = step + 1;
        this.play('click');
      } else if (this.pressedButton?.tutorial && this.inRect(point, this.pressedButton) && !this.pressedButton.disabled) {
        this.pressedButton.action();
      }
      this.pressedButton = null;
      this.pressedPoint = null;
      return;
    }
    if (this.pressedButton && this.inRect(point, this.pressedButton) && !this.pressedButton.disabled) {
      this.pressedButton.action();
    }
    this.pressedButton = null;
    this.pressedPoint = null;
  }

  restoreLinkedDragPositions(drag) {
    if (!drag?.linkedIds || !drag.linkedStartPositions) return;
    drag.linkedIds.forEach((id) => {
      const block = this.blocks.find((item) => item.id === id);
      const start = drag.linkedStartPositions[id];
      if (!block || !start) return;
      block.x = start.x;
      block.y = start.y;
    });
  }

  chooseLinkedDragAxis(drag, dx, dy) {
    const horizontalRange = this.getMoveRangeForLinkedGroup(drag.block, drag.linkedIds, 'horizontal');
    const verticalRange = this.getMoveRangeForLinkedGroup(drag.block, drag.linkedIds, 'vertical');
    const canMoveHorizontal = dx >= 0 ? horizontalRange.max > drag.startX : horizontalRange.min < drag.startX;
    const canMoveVertical = dy >= 0 ? verticalRange.max > drag.startY : verticalRange.min < drag.startY;
    const primaryAxis = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
    const secondaryAxis = primaryAxis === 'horizontal' ? 'vertical' : 'horizontal';
    const rangeFor = (axis) => (axis === 'horizontal' ? horizontalRange : verticalRange);
    const canMove = (axis) => (axis === 'horizontal' ? canMoveHorizontal : canMoveVertical);
    const chosenAxis = canMove(primaryAxis) ? primaryAxis : (canMove(secondaryAxis) ? secondaryAxis : primaryAxis);
    return { axis: chosenAxis, range: rangeFor(chosenAxis) };
  }

  closestLegalDragAxis(drag, desiredAxis) {
    return desiredAxis;
  }

  touchPoint(event) {
    const touch = event.changedTouches?.[0] || event.touches?.[0] || { clientX: 0, clientY: 0 };
    // ── PC端适配：触摸坐标减去居中偏移 ──
    const offsetX = this.isPC ? (this.pcOffsetX || 0) : 0;
    return { x: touch.clientX - offsetX, y: touch.clientY };
  }

  getMoveRange(block, axis) {
    let min = axis === 'horizontal' ? block.x : block.y;
    let max = min;
    const originalX = block.x;
    const originalY = block.y;
    const negativeDir = axis === 'horizontal' ? 'L' : 'U';
    const positiveDir = axis === 'horizontal' ? 'R' : 'D';
    while (this.singleBlockStepResult(block, negativeDir).canMove) {
      if (axis === 'horizontal') block.x -= 1;
      else block.y -= 1;
      min -= 1;
    }
    block.x = originalX;
    block.y = originalY;
    while (this.singleBlockStepResult(block, positiveDir).canMove) {
      if (axis === 'horizontal') block.x += 1;
      else block.y += 1;
      max += 1;
    }
    block.x = originalX;
    block.y = originalY;
    return { min, max };
  }

  getMoveRangeForLinkedGroup(magnet, linkedIds, axis) {
    const ignored = new Set(linkedIds);
    const linkedBlocks = this.blocks.filter((block) => linkedIds.includes(block.id));
    const startVal = axis === 'horizontal' ? magnet.x : magnet.y;
    let minDelta = 0;
    let maxDelta = 0;
    const limit = Math.max(this.level.width, this.level.height);
    while (minDelta > -limit) {
      const delta = minDelta - 1;
      const dx = axis === 'horizontal' ? delta : 0;
      const dy = axis === 'vertical' ? delta : 0;
      if (!this.blocksPlacementResult(linkedBlocks, dx, dy, ignored).canMove) break;
      minDelta = delta;
    }
    while (maxDelta < limit) {
      const delta = maxDelta + 1;
      const dx = axis === 'horizontal' ? delta : 0;
      const dy = axis === 'vertical' ? delta : 0;
      if (!this.blocksPlacementResult(linkedBlocks, dx, dy, ignored).canMove) break;
      maxDelta = delta;
    }
    return { min: startVal + minDelta, max: startVal + maxDelta };
  }

  cellsCoveredByRect(rect) {
    const epsilon = 1e-6;
    const minX = Math.floor(rect.x + epsilon);
    const minY = Math.floor(rect.y + epsilon);
    const maxX = Math.ceil(rect.x + rect.w - epsilon);
    const maxY = Math.ceil(rect.y + rect.h - epsilon);
    const cells = [];
    for (let y = minY; y < maxY; y += 1) {
      for (let x = minX; x < maxX; x += 1) cells.push(`${x},${y}`);
    }
    return cells;
  }

  ignoredIdSet(...values) {
    const ignored = new Set();
    const add = (value) => {
      if (!value) return;
      if (value instanceof Set || Array.isArray(value)) {
        value.forEach(add);
        return;
      }
      ignored.add(value);
    };
    values.forEach(add);
    return ignored;
  }

  buildOccupancy(...ignoreIds) {
    const ignored = this.ignoredIdSet(ignoreIds);
    const occupied = new Set();
    this.blocks.forEach((block) => {
      if (ignored.has(block.id)) return;
      this.cellsCoveredByRect(block).forEach((cell) => occupied.add(cell));
    });
    return occupied;
  }

  buildIndividualOccupancy(...ignoreIds) {
    const ignored = this.ignoredIdSet(ignoreIds);
    const occupied = new Set();
    this.blocks.forEach((block) => {
      if (ignored.has(block.id)) return;
      this.cellsCoveredByRect(block).forEach((cell) => occupied.add(cell));
    });
    return occupied;
  }

  magnetGroupIds(block) {
    if (block?.type !== 'magnet') return block?.id ? [block.id] : [];
    return [...new Set([...(block.linkedIds || []), block.id])].filter((id) => this.blocks.some((item) => item.id === id)).sort();
  }

  sanitizeMagnetLinks(blocks = this.blocks) {
    const magnets = (blocks || []).filter((block) => block.type === 'magnet');
    if (!magnets.length) return;
    const byId = new Map(magnets.map((block) => [block.id, block]));
    const declared = new Map(magnets.map((block) => [
      block.id,
      new Set([...(block.linkedIds || []), block.id].filter((id) => byId.has(id))),
    ]));
    const neighbors = new Map(magnets.map((block) => [block.id, new Set([block.id])]));
    for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const a = magnets[i];
        const b = magnets[j];
        if (!declared.get(a.id).has(b.id) || !declared.get(b.id).has(a.id)) continue;
        const relation = this.singleMagnetLineRelation(a, b);
        if (!relation || relation.gap !== 0 || !this.magnetsAttractForRelation(a, b, relation)) continue;
        neighbors.get(a.id).add(b.id);
        neighbors.get(b.id).add(a.id);
      }
    }
    const visited = new Set();
    magnets.forEach((block) => {
      if (visited.has(block.id)) return;
      const stack = [block.id];
      const component = [];
      visited.add(block.id);
      while (stack.length) {
        const id = stack.pop();
        component.push(id);
        neighbors.get(id).forEach((nextId) => {
          if (visited.has(nextId)) return;
          visited.add(nextId);
          stack.push(nextId);
        });
      }
      const ids = component.sort();
      ids.forEach((id) => {
        byId.get(id).linkedIds = [...ids];
      });
    });
  }

  magnetBlocksFor(block) {
    const ids = this.magnetGroupIds(block);
    return this.blocks.filter((item) => ids.includes(item.id));
  }

  blocksOverlapPhysical(a, b) {
    const occupied = new Set(this.cellsCoveredByRect(a));
    return this.cellsCoveredByRect(b).some((cell) => occupied.has(cell));
  }

  blockAtCell(key, ignored = new Set()) {
    const ignoredSet = this.ignoredIdSet(ignored);
    for (const block of this.blocks) {
      if (ignoredSet.has(block.id)) continue;
      if (this.blockHasCell(block, key)) return block;
    }
    return null;
  }

  wouldCollide(block, occupied) {
    if (block.x < 0 || block.y < 0 || block.x + block.w > this.level.width || block.y + block.h > this.level.height) return true;
    if (this.cellsCoveredByRect(block).some((cell) => occupied.has(cell))) return true;
    return false;
  }

  hasReachedExit(target) {
    const exit = this.level.exit;
    if (Number(this.level.levelId) <= 3) {
      if (exit.side === 'right') return target.y === exit.y && target.x + target.w >= this.level.width;
      if (exit.side === 'left') return target.y === exit.y && target.x <= 0;
      if (exit.side === 'top') return target.x === exit.x && target.y <= 0;
      return target.x === exit.x && target.y + target.h >= this.level.height;
    }
    if (exit.side === 'right') return target.y === exit.y && target.x > this.level.width - target.w;
    if (exit.side === 'left') return target.y === exit.y && target.x < 0;
    if (exit.side === 'top') return target.x === exit.x && target.y < 0;
    return target.x === exit.x && target.y > this.level.height - target.h;
  }

  parseDesignerMove(step) {
    const match = String(step || '').match(/^([^:]+):([LRUD])(\d+)$/);
    if (!match) return null;
    return { blockId: match[1], dir: match[2], amount: Number(match[3]) || 1 };
  }

  isHintMoveLegal(move) {
    if (!move) return false;
    const block = this.blocks.find((item) => item.id === move.blockId);
    if (!block || block.moveDir === 'none') return false;
    const amount = Number(move.amount) || 0;
    if (amount <= 0) return false;
    const axis = move.dir === 'L' || move.dir === 'R' ? 'horizontal' : 'vertical';
    if (block.moveDir !== 'both' && block.moveDir !== axis) return false;
    const sign = move.dir === 'L' || move.dir === 'U' ? -1 : 1;
    const current = axis === 'horizontal' ? block.x : block.y;
    const target = current + sign * amount;
    const magnetIds = block.type === 'magnet' ? this.magnetGroupIds(block) : null;
    const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
    const range = linkedIds
      ? this.getMoveRangeForLinkedGroup(block, linkedIds, axis)
      : this.getMoveRange(block, axis);
    return target !== current && target >= range.min && target <= range.max;
  }

  designerNextMoveFromCurrent() {
    const solution = this.level?.designerSolution;
    if (!Array.isArray(solution) || !solution.length) return null;
    const ids = this.blocks.map((block) => block.id);
    const key = (blocks) => {
      const positions = {};
      blocks.forEach((b) => { if (ids.includes(b.id)) positions[b.id] = `${b.x},${b.y}`; });
      return Object.keys(positions).sort().map((id) => `${id}:${positions[id]}`).join('|');
    };
    const currentKey = key(this.blocks);
    const state = this.level.blocks.map((block) => ({ ...block }));
    if (key(state) === currentKey) return this.parseDesignerMove(solution[0]);
    for (let i = 0; i < solution.length; i += 1) {
      const move = this.parseDesignerMove(solution[i]);
      if (!move) return null;
      const block = state.find((b) => b.id === move.blockId);
      if (!block) continue;
      const dx = move.dir === 'L' ? -move.amount : move.dir === 'R' ? move.amount : 0;
      const dy = move.dir === 'U' ? -move.amount : move.dir === 'D' ? move.amount : 0;
      block.x += dx;
      block.y += dy;
      if (key(state) === currentKey) return i + 1 < solution.length ? this.parseDesignerMove(solution[i + 1]) : null;
    }
    return null;
  }

  hintMoveFromCache() {
    const key = this.solverKey(this.normalizeSolverState(this.makeSolverState()));
    const persistentKey = `${this.level?.levelId}|${key}`;
    const cached = this.hintMoveCache.get(persistentKey)
      || (this.hintPathCache?.levelId === this.level?.levelId ? this.hintPathCache.movesByState.get(key) : null);
    if (!cached || !this.isHintMoveLegal(cached)) return null;
    return { ...cached, fromCache: true };
  }

  cacheHintPath(path) {
    if (!Array.isArray(path) || !path.length) {
      this.hintPathCache = null;
      return;
    }
    const movesByState = new Map();
    path.forEach((item, index) => {
      if (!movesByState.has(item.fromKey)) {
        movesByState.set(item.fromKey, { ...item.move, remaining: path.length - index });
      }
    });
    this.hintPathCache = {
      levelId: this.level.levelId,
      movesByState,
    };
    path.forEach((item, index) => {
      const key = `${this.level.levelId}|${item.fromKey}`;
      if (!this.hintMoveCache.has(key)) {
        this.hintMoveCache.set(key, { ...item.move, remaining: path.length - index });
      }
    });
    if (this.hintMoveCache.size > 12000) {
      const removeCount = this.hintMoveCache.size - 9000;
      const keys = this.hintMoveCache.keys();
      for (let index = 0; index < removeCount; index += 1) {
        const next = keys.next();
        if (next.done) break;
        this.hintMoveCache.delete(next.value);
      }
    }
  }

  solverDesignerPathHintFromCurrent() {
    const solution = this.level?.designerSolution || [];
    if (!solution.length) return null;
    const currentKey = this.solverKey(this.normalizeSolverState(this.makeSolverState()));
    let state = this.makeInitialSolverState();
    let startIndex = -1;
    if (this.solverKey(state) === currentKey) {
      startIndex = 0;
    } else {
      for (let index = 0; index < solution.length; index += 1) {
        const parsed = this.parseDesignerMove(solution[index]);
        const fullMove = this.solverParsedMoveToFullMove(state, parsed);
        if (!fullMove) return null;
        const next = this.solverApplyMove(state, fullMove);
        if (!next) return null;
        state = next;
        if (this.solverKey(state) === currentKey) {
          startIndex = index + 1;
          break;
        }
      }
    }
    if (startIndex < 0 || startIndex >= solution.length) return null;
    const path = [];
    for (let index = startIndex; index < solution.length; index += 1) {
      const fromKey = this.solverKey(state);
      const parsed = this.parseDesignerMove(solution[index]);
      const fullMove = this.solverParsedMoveToFullMove(state, parsed);
      if (!fullMove) return null;
      const next = this.solverApplyMove(state, fullMove);
      if (!next) return null;
      path.push({
        fromKey,
        move: { blockId: fullMove.blockId, dir: fullMove.dir, amount: fullMove.amount },
      });
      state = next;
      if (this.solverHasReachedExit(state)) {
        this.cacheHintPath(path);
        const first = { ...path[0].move, remaining: path.length, fromDesignerPath: true };
        return this.isHintMoveLegal(first) ? first : null;
      }
    }
    return null;
  }

  solverHistoryRecoveryHintFromCurrent() {
    if (!Array.isArray(this.history) || !this.history.length) return null;
    if ((this.blocks || []).some((block) => !['target', 'normal', 'fixed'].includes(block.type))) return null;
    if ((this.level.specialCells || []).some((cell) => cell.type !== 'exit')) return null;

    let state = this.normalizeSolverState(this.makeSolverState());
    const path = [];
    for (let index = this.history.length - 1; index >= 0; index -= 1) {
      const snapshot = this.history[index];
      const snapshotState = this.normalizeSolverState(this.makeSolverState(
        snapshot.blocks || [],
        snapshot.specialCells || this.level.specialCells || [],
      ));
      const fromKey = this.solverKey(state);
      const snapshotKey = this.solverKey(snapshotState);
      if (fromKey === snapshotKey) continue;
      const snapshotById = new Map(snapshotState.blocks.map((block) => [block.id, block]));
      const changed = state.blocks.filter((block) => {
        const before = snapshotById.get(block.id);
        return !before || block.x !== before.x || block.y !== before.y;
      });
      if (changed.length !== 1) return null;
      const block = changed[0];
      const before = snapshotById.get(block.id);
      if (!before) return null;
      const dx = before.x - block.x;
      const dy = before.y - block.y;
      if ((!dx && !dy) || (dx && dy)) return null;
      const parsed = {
        blockId: block.id,
        dir: dx < 0 ? 'L' : dx > 0 ? 'R' : dy < 0 ? 'U' : 'D',
        amount: Math.abs(dx || dy),
      };
      const fullMove = this.solverParsedMoveToFullMove(state, parsed);
      if (!fullMove) return null;
      const next = this.solverApplyMove(state, fullMove);
      if (!next || this.solverKey(next) !== snapshotKey) return null;
      path.push({
        fromKey,
        move: { blockId: fullMove.blockId, dir: fullMove.dir, amount: fullMove.amount },
      });
      state = next;
    }

    const initial = this.makeInitialSolverState();
    if (this.solverKey(state) !== this.solverKey(initial)) return null;
    for (const encoded of this.level.designerSolution || []) {
      const fromKey = this.solverKey(state);
      const fullMove = this.solverParsedMoveToFullMove(state, this.parseDesignerMove(encoded));
      if (!fullMove) return null;
      const next = this.solverApplyMove(state, fullMove);
      if (!next) return null;
      path.push({
        fromKey,
        move: { blockId: fullMove.blockId, dir: fullMove.dir, amount: fullMove.amount },
      });
      state = next;
      if (this.solverHasReachedExit(state)) break;
    }
    if (!path.length || !this.solverHasReachedExit(state)) return null;
    this.cacheHintPath(path);
    const first = { ...path[0].move, remaining: path.length, fromHistoryRecovery: true };
    return this.isHintMoveLegal(first) ? first : null;
  }

  solverBlockSnapshot(block) {
    return {
      ...block,
      w: block.type === 'target' ? 2 : block.w,
      h: block.type === 'target' ? 2 : block.h,
      moveDir: block.type === 'target' || block.type === 'magnet' ? 'both' : block.moveDir,
      linkedIds: block.type === 'magnet' ? [...(block.linkedIds || [block.id])] : block.linkedIds,
      iceState: block.type === 'ice' ? (block.iceState || 'intact') : block.iceState,
    };
  }

  makeSolverState(blocks = this.blocks, specialCells = this.level.specialCells || []) {
    return {
      blocks: blocks.map((block) => this.solverBlockSnapshot(block)),
      specialCells: (specialCells || [])
        .filter((cell) => cell.type !== 'exit')
        .map((cell, index) => ({ ...cell, solverId: cell.solverId || `${cell.type}:${index}:${cell.x},${cell.y}` })),
    };
  }

  makeInitialSolverState() {
    return this.normalizeSolverState(this.makeSolverState(
      this.level.blocks || [],
      (this.level.specialCells || []).map((cell) => ({ ...cell, collected: false, solverId: cell.solverId })),
    ));
  }

  cloneSolverState(state) {
    return {
      blocks: state.blocks.map((block) => ({
        ...block,
        linkedIds: Array.isArray(block.linkedIds) ? [...block.linkedIds] : block.linkedIds,
      })),
      specialCells: state.specialCells.map((cell) => ({ ...cell })),
    };
  }

  normalizeSolverState(state) {
    const existing = new Set(state.blocks.map((block) => block.id));
    state.blocks.forEach((block) => {
      if (block.type !== 'magnet') return;
      block.moveDir = 'both';
      block.linkedIds = [...new Set([...(block.linkedIds || [block.id]), block.id])]
        .filter((id) => existing.has(id))
        .sort();
    });
    this.sanitizeSolverMagnetLinks(state);
    return state;
  }

  sanitizeSolverMagnetLinks(state) {
    const magnets = (state.blocks || []).filter((block) => block.type === 'magnet');
    if (!magnets.length) return;
    const byId = new Map(magnets.map((block) => [block.id, block]));
    const declared = new Map(magnets.map((block) => [
      block.id,
      new Set([...(block.linkedIds || []), block.id].filter((id) => byId.has(id))),
    ]));
    const neighbors = new Map(magnets.map((block) => [block.id, new Set([block.id])]));
    for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const a = magnets[i];
        const b = magnets[j];
        if (!declared.get(a.id).has(b.id) || !declared.get(b.id).has(a.id)) continue;
        const relation = this.solverMagnetLineRelation(state, a, b);
        if (!relation || relation.gap !== 0 || !this.solverMagnetsAttractForRelation(state, a, b, relation)) continue;
        neighbors.get(a.id).add(b.id);
        neighbors.get(b.id).add(a.id);
      }
    }
    const visited = new Set();
    magnets.forEach((block) => {
      if (visited.has(block.id)) return;
      const stack = [block.id];
      const component = [];
      visited.add(block.id);
      while (stack.length) {
        const id = stack.pop();
        component.push(id);
        neighbors.get(id).forEach((nextId) => {
          if (visited.has(nextId)) return;
          visited.add(nextId);
          stack.push(nextId);
        });
      }
      const ids = component.sort();
      ids.forEach((id) => {
        byId.get(id).linkedIds = [...ids];
      });
    });
  }

  solverKey(state) {
    return [...state.blocks]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((block) => [
        block.id,
        block.type,
        block.x,
        block.y,
        block.moveDir,
        block.iceState || '',
        block.pole || '',
        block.lastPortalId || '',
        Array.isArray(block.linkedIds) ? block.linkedIds.join('.') : '',
        block.unlockTargetId || '',
        block.unlockedMoveDir || '',
      ].join(','))
      .join('|');
  }

  solverHasReachedExit(state) {
    const target = state.blocks.find((block) => block.id === this.level.targetId);
    if (!target) return false;
    return this.hasReachedExit(target);
  }

  solverHeuristic(state) {
    if (this.solverHasReachedExit(state)) return 0;
    const target = state.blocks.find((block) => block.id === this.level.targetId);
    if (!target) return 999;
    const exit = this.level.exit;
    let estimate = 0;
    if (exit.side === 'right' || exit.side === 'left') {
      if (target.y !== exit.y) estimate += Math.min(2, Math.abs(target.y - exit.y));
      if (exit.side === 'right' && target.x + target.w < this.level.width) estimate += 1;
      if (exit.side === 'left' && target.x > 0) estimate += 1;
    } else {
      if (target.x !== exit.x) estimate += Math.min(2, Math.abs(target.x - exit.x));
      if (exit.side === 'top' && target.y > 0) estimate += 1;
      if (exit.side === 'bottom' && target.y + target.h < this.level.height) estimate += 1;
    }
    const blockers = this.solverExitBlockers(state);
    if (blockers.size) estimate += Math.min(3, blockers.size);
    return estimate;
  }

  solverExitBlockers(state) {
    const blockers = new Set();
    const target = state.blocks.find((block) => block.id === this.level.targetId);
    if (!target) return blockers;
    const exit = this.level.exit;
    const occupied = this.solverBuildOccupancy(state, [target.id]);
    const add = (x, y) => {
      const id = occupied.get(`${x},${y}`);
      if (id) blockers.add(id);
    };
    if (exit.side === 'right' && target.y === exit.y) {
      for (let x = target.x + target.w; x < this.level.width; x += 1) for (let y = target.y; y < target.y + target.h; y += 1) add(x, y);
    } else if (exit.side === 'left' && target.y === exit.y) {
      for (let x = target.x - 1; x >= 0; x -= 1) for (let y = target.y; y < target.y + target.h; y += 1) add(x, y);
    } else if (exit.side === 'top' && target.x === exit.x) {
      for (let y = target.y - 1; y >= 0; y -= 1) for (let x = target.x; x < target.x + target.w; x += 1) add(x, y);
    } else if (exit.side === 'bottom' && target.x === exit.x) {
      for (let y = target.y + target.h; y < this.level.height; y += 1) for (let x = target.x; x < target.x + target.w; x += 1) add(x, y);
    }
    return blockers;
  }

  solverBuildOccupancy(state, ignoreIds = []) {
    const ignored = this.ignoredIdSet(ignoreIds);
    const occupied = new Map();
    state.blocks.forEach((block) => {
      if (ignored.has(block.id)) return;
      this.cellsCoveredByRect(block).forEach((cell) => occupied.set(cell, block.id));
    });
    return occupied;
  }

  solverBuildIndividualOccupancy(state, ignoreIds = []) {
    const ignored = this.ignoredIdSet(ignoreIds);
    const occupied = new Map();
    state.blocks.forEach((block) => {
      if (ignored.has(block.id)) return;
      this.cellsCoveredByRect(block).forEach((cell) => occupied.set(cell, block.id));
    });
    return occupied;
  }

  solverWouldCollide(block, occupied) {
    if (block.x < 0 || block.y < 0 || block.x + block.w > this.level.width || block.y + block.h > this.level.height) return true;
    if (this.cellsCoveredByRect(block).some((cell) => occupied.has(cell))) return true;
    return false;
  }

  solverStepResultForBlocks(state, blocks, dir) {
    const movingBlocks = (blocks || []).filter(Boolean);
    const ignored = new Set(movingBlocks.map((block) => block.id));
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    const iceBlockers = new Map();
    for (const block of movingBlocks) {
      const rect = { x: block.x + dx, y: block.y + dy, w: block.w, h: block.h };
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > this.level.width || rect.y + rect.h > this.level.height) {
        return { canMove: false, iceBlockers: [], blockedByOther: true };
      }
      for (const cell of this.cellsCoveredByRect(rect)) {
        const blocker = state.blocks.find((item) => !ignored.has(item.id) && this.solverBlockHasCell(state, item, cell));
        if (!blocker) continue;
        if (blocker.type === 'ice') iceBlockers.set(blocker.id, blocker);
        else return { canMove: false, iceBlockers: [], blockedByOther: true };
      }
    }
    if (iceBlockers.size) return { canMove: false, iceBlockers: [...iceBlockers.values()], blockedByOther: false };
    return { canMove: true, iceBlockers: [], blockedByOther: false };
  }

  solverMagnetGroupIds(state, block) {
    if (block?.type !== 'magnet') return block?.id ? [block.id] : [];
    const existing = new Set((state.blocks || []).map((item) => item.id));
    return [...new Set([...(block.linkedIds || []), block.id])].filter((id) => existing.has(id)).sort();
  }

  solverCollisionRectForBlock(state, block) {
    return { x: block.x, y: block.y, w: block.w, h: block.h };
  }

  solverBlocksTouchOrOverlap(state, a, b) {
    const ar = this.solverCollisionRectForBlock(state, a);
    const br = this.solverCollisionRectForBlock(state, b);
    const overlap = this.rectsOverlap(ar, br);
    const verticalSpan = ar.y < br.y + br.h && ar.y + ar.h > br.y;
    const horizontalSpan = ar.x < br.x + br.w && ar.x + ar.w > br.x;
    const horizontalTouch = verticalSpan && (ar.x + ar.w === br.x || br.x + br.w === ar.x);
    const verticalTouch = horizontalSpan && (ar.y + ar.h === br.y || br.y + br.h === ar.y);
    return overlap || horizontalTouch || verticalTouch;
  }

  solverBlockHasCell(state, block, key) {
    return this.cellsCoveredByRect(block).includes(key);
  }

  solverMagnetBlocksFor(state, block) {
    const ids = this.solverMagnetGroupIds(state, block);
    return state.blocks.filter((item) => ids.includes(item.id));
  }

  solverMoveRange(state, block, axis) {
    const occupied = this.solverBuildOccupancy(state, [block.id]);
    let min = axis === 'horizontal' ? block.x : block.y;
    let max = min;
    if (axis === 'horizontal') {
      while (min > 0 && !this.solverWouldCollide({ ...block, x: min - 1 }, occupied)) min -= 1;
      while (max + block.w < this.level.width && !this.solverWouldCollide({ ...block, x: max + 1 }, occupied)) max += 1;
    } else {
      while (min > 0 && !this.solverWouldCollide({ ...block, y: min - 1 }, occupied)) min -= 1;
      while (max + block.h < this.level.height && !this.solverWouldCollide({ ...block, y: max + 1 }, occupied)) max += 1;
    }
    if (block.id === this.level.targetId) {
      const exit = this.level.exit;
      if (axis === 'horizontal' && block.y === exit.y) {
        if (exit.side === 'left' && block.x === 0) min = -1;
        if (exit.side === 'right' && block.x === this.level.width - block.w) max = block.x + 1;
      } else if (axis === 'vertical' && block.x === exit.x) {
        if (exit.side === 'top' && block.y === 0) min = -1;
        if (exit.side === 'bottom' && block.y === this.level.height - block.h) max = block.y + 1;
      }
    }
    return { min, max };
  }

  solverLinkedRange(state, magnet, linkedIds, axis) {
    const linkedBlocks = state.blocks.filter((block) => linkedIds.includes(block.id));
    const occupied = this.solverBuildOccupancy(state, linkedIds);
    const startVal = axis === 'horizontal' ? magnet.x : magnet.y;
    let minDelta = 0;
    let maxDelta = 0;
    while (minDelta > -Math.max(this.level.width, this.level.height)) {
      const delta = minDelta - 1;
      if (!this.solverCanMoveBlocksByDelta(linkedBlocks, occupied, axis, delta)) break;
      minDelta = delta;
    }
    while (maxDelta < Math.max(this.level.width, this.level.height)) {
      const delta = maxDelta + 1;
      if (!this.solverCanMoveBlocksByDelta(linkedBlocks, occupied, axis, delta)) break;
      maxDelta = delta;
    }
    return { min: startVal + minDelta, max: startVal + maxDelta };
  }

  solverCanMoveBlocksByDelta(blocks, occupied, axis, delta) {
    return blocks.every((block) => {
      const candidate = {
        ...block,
        x: axis === 'horizontal' ? block.x + delta : block.x,
        y: axis === 'vertical' ? block.y + delta : block.y,
      };
      return !this.solverWouldCollide(candidate, occupied);
    });
  }

  solverLegalMoves(state, preferredMove = null, mode = 'full') {
    const processedGroups = new Set();
    const exitDir = this.level.exit.direction
      || (this.level.exit.side === 'right' ? 'right' : this.level.exit.side === 'left' ? 'left' : this.level.exit.side === 'top' ? 'up' : 'down');
    const exitDirKey = exitDir === 'right' ? 'R' : exitDir === 'left' ? 'L' : exitDir === 'up' ? 'U' : 'D';
    const exitBlockers = this.solverExitBlockers(state);
    const blockItems = state.blocks
      .map((block) => ({ block, score: this.solverBlockMoveScore(block, preferredMove, exitBlockers) }))
      .sort((a, b) => a.score - b.score || a.block.id.localeCompare(b.block.id));
    const moves = [];
    for (const { block } of blockItems) {
      if (block.moveDir === 'none') continue;
      const magnetIds = block.type === 'magnet' ? this.solverMagnetGroupIds(state, block) : null;
      const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
      if (linkedIds) {
        const groupId = [...linkedIds].sort().join(',');
        if (processedGroups.has(groupId)) continue;
        processedGroups.add(groupId);
      }
      const dirs = block.moveDir === 'horizontal'
        ? [[-1, 0, 'L'], [1, 0, 'R']]
        : block.moveDir === 'vertical'
          ? [[0, -1, 'U'], [0, 1, 'D']]
          : [[-1, 0, 'L'], [1, 0, 'R'], [0, -1, 'U'], [0, 1, 'D']];
      dirs.sort((a, b) => {
        const score = (dir) => {
          if (preferredMove && block.id === preferredMove.blockId && dir === preferredMove.dir) return 0;
          if (block.id === this.level.targetId && dir === exitDirKey) return 1;
          return 2;
        };
        return score(a[2]) - score(b[2]);
      });
      for (const [, , dir] of dirs) {
        const axis = dir === 'L' || dir === 'R' ? 'horizontal' : 'vertical';
        const range = linkedIds ? this.solverLinkedRange(state, block, linkedIds, axis) : this.solverMoveRange(state, block, axis);
        const current = axis === 'horizontal' ? block.x : block.y;
        const values = [];
        if (dir === 'L' || dir === 'U') {
          for (let value = current - 1; value >= range.min; value -= 1) values.push(value);
        } else {
          for (let value = current + 1; value <= range.max; value += 1) values.push(value);
        }
        const targetValues = mode === 'focused'
          ? this.solverFocusedTargetValues(state, block, dir, current, values, preferredMove)
          : values;
        targetValues.sort((a, b) => {
          if (preferredMove && block.id === preferredMove.blockId && dir === preferredMove.dir) {
            const preferredTarget = current + (dir === 'L' || dir === 'U' ? -preferredMove.amount : preferredMove.amount);
            return Math.abs(a - preferredTarget) - Math.abs(b - preferredTarget);
          }
          return Math.abs(b - current) - Math.abs(a - current);
        });
        targetValues.forEach((targetAxis) => {
          moves.push({
            blockId: block.id,
            dir,
            axis,
            amount: Math.abs(targetAxis - current),
            targetAxis,
            range,
            linkedIds,
          });
        });
      }
    }
    return moves;
  }

  solverFocusedTargetValues(state, block, dir, current, values, preferredMove) {
    if (values.length <= 2) return values;
    const out = new Set();
    out.add(values[0]);
    out.add(values[values.length - 1]);
    if (preferredMove && block.id === preferredMove.blockId && dir === preferredMove.dir) {
      const preferredTarget = current + (dir === 'L' || dir === 'U' ? -preferredMove.amount : preferredMove.amount);
      if (values.includes(preferredTarget)) out.add(preferredTarget);
    }
    const axis = dir === 'L' || dir === 'R' ? 'horizontal' : 'vertical';
    const preview = { ...block };
    for (const value of values) {
      if (axis === 'horizontal') preview.x = value;
      else preview.y = value;
      if (block.id === this.level.targetId && this.hasReachedExit(preview)) out.add(value);
      if (state.specialCells.some((cell) => (
        (cell.type === 'teleport' && this.blockFullyInsideCell(preview, cell))
        || (cell.type === 'coin' && this.blockOverlapsCell(preview, cell))
      ))) out.add(value);
    }
    return values.filter((value) => out.has(value));
  }

  solverParsedMoveToFullMove(state, parsed) {
    if (!parsed) return null;
    const block = state.blocks.find((item) => item.id === parsed.blockId);
    if (!block || block.moveDir === 'none') return null;
    const axis = parsed.dir === 'L' || parsed.dir === 'R' ? 'horizontal' : 'vertical';
    if (block.moveDir !== 'both' && block.moveDir !== axis) return null;
    const magnetIds = block.type === 'magnet' ? this.solverMagnetGroupIds(state, block) : null;
    const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
    const range = linkedIds ? this.solverLinkedRange(state, block, linkedIds, axis) : this.solverMoveRange(state, block, axis);
    const current = axis === 'horizontal' ? block.x : block.y;
    const targetAxis = current + (parsed.dir === 'L' || parsed.dir === 'U' ? -parsed.amount : parsed.amount);
    if (targetAxis < range.min || targetAxis > range.max || targetAxis === current) return null;
    return {
      blockId: parsed.blockId,
      dir: parsed.dir,
      axis,
      amount: Math.abs(targetAxis - current),
      targetAxis,
      range,
      linkedIds,
    };
  }

  solverDesignerNextMoveFromCurrent() {
    const solution = this.level?.designerSolution || [];
    if (!solution.length) return null;
    const currentKey = this.solverKey(this.normalizeSolverState(this.makeSolverState()));
    let state = this.makeInitialSolverState();
    if (this.solverKey(state) === currentKey) {
      const first = this.parseDesignerMove(solution[0]);
      return first ? { ...first, remaining: solution.length } : null;
    }
    for (let index = 0; index < solution.length; index += 1) {
      const parsed = this.parseDesignerMove(solution[index]);
      const fullMove = this.solverParsedMoveToFullMove(state, parsed);
      if (!fullMove) return null;
      const next = this.solverApplyMove(state, fullMove);
      if (!next) return null;
      state = next;
      if (this.solverKey(state) === currentKey) {
        const nextParsed = this.parseDesignerMove(solution[index + 1]);
        return nextParsed ? { ...nextParsed, remaining: solution.length - index - 1 } : null;
      }
    }
    return null;
  }

  solverBlockMoveScore(block, preferredMove, exitBlockers) {
    if (block.id === this.level.targetId) return 0;
    if (preferredMove && block.id === preferredMove.blockId) return 1;
    if (exitBlockers.has(block.id)) return 2;
    if (block.type === 'key' || block.type === 'locked') return 3;
    if (block.type === 'magnet' || block.type === 'ice') return 4;
    return 5;
  }

  solverApplyMove(state, move) {
    const next = this.cloneSolverState(state);
    const block = next.blocks.find((item) => item.id === move.blockId);
    if (!block || block.moveDir === 'none') return null;
    const magnetIds = block.type === 'magnet' ? this.solverMagnetGroupIds(next, block) : null;
    const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
    const range = linkedIds ? this.solverLinkedRange(next, block, linkedIds, move.axis) : this.solverMoveRange(next, block, move.axis);
    if (move.targetAxis < range.min || move.targetAxis > range.max) return null;
    const current = move.axis === 'horizontal' ? block.x : block.y;
    const delta = move.targetAxis - current;
    if (!delta) return null;
    if (linkedIds) {
      next.blocks.forEach((item) => {
        if (!linkedIds.includes(item.id)) return;
        if (move.axis === 'horizontal') item.x += delta;
        else item.y += delta;
      });
    } else if (move.axis === 'horizontal') {
      block.x = move.targetAxis;
    } else {
      block.y = move.targetAxis;
    }
    const resolved = this.solverResolveSpecialAfterMove(next, block.id, {
      axis: move.axis,
      dir: move.dir,
      delta,
      finalAxis: move.targetAxis,
      range,
      linkedIds,
    });
    if (resolved === false) return null;
    return this.normalizeSolverState(next);
  }

  solverResolveSpecialAfterMove(state, originId, move) {
    this.solverResolveIceImpact(state, originId, move);
    if (state.blocks.some((block) => block.id === originId) && this.solverResolveTeleportForBlock(state, originId) === false) return false;
    this.solverResolveKeyLocks(state);
    this.solverCollectCoins(state);
    this.solverResolveMagnetForces(state, originId);
    this.solverCollectCoins(state);
    return true;
  }

  solverResolveIceImpact(state, originId, move) {
    if (!move?.delta) return;
    const reachedLimit = move.delta < 0 ? move.finalAxis === move.range.min : move.finalAxis === move.range.max;
    if (!reachedLimit) return;
    const block = state.blocks.find((item) => item.id === originId);
    if (!block) return;
    const magnetIds = block.type === 'magnet' ? this.solverMagnetGroupIds(state, block) : null;
    const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
    const movingBlocks = linkedIds ? state.blocks.filter((item) => linkedIds.includes(item.id)) : [block];
    const step = this.solverStepResultForBlocks(state, movingBlocks, move.dir);
    if (!step.canMove && !step.blockedByOther) {
      step.iceBlockers.forEach((ice) => this.solverDamageIceBlock(state, ice.id));
    }
  }

  solverDamageIceBlock(state, iceId) {
    const ice = state.blocks.find((block) => block.id === iceId);
    if (!ice || ice.type !== 'ice') return false;
    if (ice.iceState === 'cracked') {
      state.blocks = state.blocks.filter((block) => block.id !== iceId);
    } else {
      ice.iceState = 'cracked';
      ice.style = 'ice_cracked';
    }
    return true;
  }

  solverBreakIceBlockByMagnetRepulsion(state, iceId) {
    const ice = state.blocks.find((block) => block.id === iceId);
    if (!ice || ice.type !== 'ice') return false;
    state.blocks = state.blocks.filter((block) => block.id !== iceId);
    return true;
  }

  solverResolveTeleportForBlock(state, blockId) {
    const block = state.blocks.find((item) => item.id === blockId);
    if (!block) return true;
    const portals = state.specialCells.filter((cell) => cell.type === 'teleport');
    if (!portals.length) return true;
    const portal = portals.find((cell) => this.blockFullyInsideCell(block, cell));
    if (!portal) {
      block.lastPortalId = '';
      return true;
    }
    if (block.lastPortalId === portal.portalId) return true;
    const pair = portals.find((cell) => cell.portalId === portal.pairId);
    if (!pair) return true;
    const nextX = pair.x + (block.x - portal.x);
    const nextY = pair.y + (block.y - portal.y);
    const occupied = this.solverBuildOccupancy(state, [block.id]);
    if (this.solverWouldCollide({ ...block, x: nextX, y: nextY }, occupied)) return false;
    block.x = nextX;
    block.y = nextY;
    block.lastPortalId = pair.portalId;
    return true;
  }

  solverResolveKeyLocks(state) {
    const removeKeys = new Set();
    state.blocks.filter((block) => block.type === 'key').forEach((key) => {
      const locked = state.blocks.find((block) => block.type === 'locked' && block.id === key.unlockTargetId);
      if (!locked || !this.blocksTouchOrOverlap(key, locked)) return;
      removeKeys.add(key.id);
      locked.type = 'normal';
      locked.moveDir = locked.unlockedMoveDir || 'horizontal';
      locked.style = styleFor(locked);
    });
    if (removeKeys.size) state.blocks = state.blocks.filter((block) => !removeKeys.has(block.id));
  }

  solverCollectCoins(state) {
    state.specialCells.forEach((cell) => {
      if (cell.type !== 'coin' || cell.collected) return;
      if (state.blocks.some((block) => this.blockOverlapsCell(block, cell))) cell.collected = true;
    });
  }

  solverResolveMagnetForces(state, originId = '') {
    for (let guard = 0; guard < 12; guard += 1) {
      const magnets = state.blocks.filter((block) => block.type === 'magnet');
      const candidates = this.solverMagnetForceCandidates(state, magnets, originId);
      let changed = false;
      for (const candidate of candidates) {
        if (!state.blocks.includes(candidate.a) || !state.blocks.includes(candidate.b)) continue;
        if (this.solverMagnetGroupIds(state, candidate.a).includes(candidate.b.id)) continue;
        changed = candidate.attract
          ? this.solverApplyMagnetAttraction(state, candidate.a.id, candidate.b.id, candidate.relation, originId)
          : this.solverApplyMagnetRepulsion(state, candidate.relation);
        if (changed) break;
      }
      if (!changed) break;
    }
  }

  solverMagnetForceCandidates(state, magnets, originId = '') {
    const candidates = [];
    const originBlock = originId ? state.blocks.find((block) => block.id === originId) : null;
    const originIds = originBlock?.type === 'magnet' ? this.solverMagnetGroupIds(state, originBlock) : [];
    for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const a = magnets[i];
        const b = magnets[j];
        const groupA = this.solverMagnetGroupIds(state, a);
        const groupB = this.solverMagnetGroupIds(state, b);
        if (groupA.includes(b.id)) continue;
        const relation = this.solverMagnetLineRelation(state, a, b);
        if (!relation || !this.solverMagnetLineClear(state, relation, a, b)) continue;
        const attract = this.solverMagnetsAttractForRelation(state, a, b, relation);
        const originScore = originIds.length && (groupA.some((id) => originIds.includes(id)) || groupB.some((id) => originIds.includes(id))) ? 0 : 1;
        candidates.push({ a, b, relation, attract, originScore, gap: relation.gap });
      }
    }
    return candidates.sort((left, right) => (
      left.originScore - right.originScore
      || left.gap - right.gap
      || Number(left.attract) - Number(right.attract)
      || left.a.id.localeCompare(right.a.id)
      || left.b.id.localeCompare(right.b.id)
    ));
  }

  solverApplyMagnetAttraction(state, aId, bId, relation, originId = '') {
    const a = state.blocks.find((block) => block.id === aId);
    const b = state.blocks.find((block) => block.id === bId);
    if (!a || !b) return false;
    if (relation.gap <= 0) return this.solverLinkTouchingOppositeMagnetGroups(state, a.id, b.id, relation);
    const mover = this.solverMagnetAttractionMover(a, b, originId);
    const anchor = mover.id === a.id ? b : a;
    const moved = this.solverSlideMagnetToward(state, mover.id, anchor.id);
    const linked = this.solverLinkTouchingOppositeMagnetGroups(state, mover.id, anchor.id);
    return moved || linked;
  }

  solverMagnetAttractionMover(a, b, originId) {
    if (originId) {
      if (originId === a.id) return a;
      if (originId === b.id) return b;
      if ((a.linkedIds || []).includes(originId)) return a;
      if ((b.linkedIds || []).includes(originId)) return b;
    }
    const aSize = (a.linkedIds || [a.id]).length;
    const bSize = (b.linkedIds || [b.id]).length;
    if (aSize === 1 && bSize > 1) return a;
    if (bSize === 1 && aSize > 1) return b;
    return a;
  }

  solverMagnetsAttractForRelation(state, a, b, relation) {
    const firstPole = relation?.first?.pole || a?.pole || 'N';
    const secondPole = relation?.second?.pole || b?.pole || 'N';
    return firstPole !== secondPole;
  }

  solverSlideMagnetToward(state, moverId, anchorId) {
    let moved = false;
    for (let guard = 0; guard < Math.max(this.level.width, this.level.height) + 2; guard += 1) {
      const mover = state.blocks.find((block) => block.id === moverId);
      const anchor = state.blocks.find((block) => block.id === anchorId);
      if (!mover || !anchor) break;
      const relation = this.solverMagnetLineRelation(state, mover, anchor);
      if (!relation || relation.gap <= 0) break;
      const moverIds = this.solverMagnetGroupIds(state, mover);
      const moverIsFirst = moverIds.includes(relation.first.id);
      const dir = relation.axis === 'horizontal'
        ? (moverIsFirst ? 'R' : 'L')
        : (moverIsFirst ? 'D' : 'U');
      if (this.solverMagnetGroupIds(state, mover).length > 1) {
        if (!this.solverMoveLinkedGroupByDir(state, mover.id, dir)) break;
      } else {
        const next = this.nextPosition(mover, dir);
        const occupied = this.solverBuildOccupancy(state, [mover.id]);
        if (this.solverWouldCollide({ ...mover, ...next }, occupied)) break;
        mover.x = next.x;
        mover.y = next.y;
      }
      moved = true;
    }
    const linked = this.solverLinkMagnetsIfAdjacent(state, moverId, anchorId);
    return moved || linked;
  }

  solverMoveLinkedGroupByDir(state, magnetId, dir) {
    const magnet = state.blocks.find((block) => block.id === magnetId);
    if (!magnet) return false;
    const linkedIds = this.solverMagnetGroupIds(state, magnet);
    const linkedBlocks = state.blocks.filter((block) => linkedIds.includes(block.id));
    const occupied = this.solverBuildOccupancy(state, linkedIds);
    const dx = dir === 'L' ? -1 : dir === 'R' ? 1 : 0;
    const dy = dir === 'U' ? -1 : dir === 'D' ? 1 : 0;
    if (!linkedBlocks.every((block) => !this.solverWouldCollide({ ...block, x: block.x + dx, y: block.y + dy }, occupied))) return false;
    linkedBlocks.forEach((block) => {
      block.x += dx;
      block.y += dy;
    });
    return true;
  }

  solverApplyMagnetRepulsion(state, relation) {
    const first = state.blocks.find((block) => block.id === relation.first.id);
    const second = state.blocks.find((block) => block.id === relation.second.id);
    if (!first || !second) return false;
    const dirA = relation.axis === 'horizontal'
      ? (first.x < second.x ? 'L' : 'R')
      : (first.y < second.y ? 'U' : 'D');
    const dirB = this.oppositeDir(dirA);
    const movedA = this.solverSlideBlockToLimit(state, first.id, dirA, { breakIceByRepulsion: true });
    const movedB = this.solverSlideBlockToLimit(state, second.id, dirB, { breakIceByRepulsion: true });
    return movedA || movedB;
  }

  solverSlideBlockToLimit(state, blockId, dir, options = {}) {
    let block = state.blocks.find((item) => item.id === blockId);
    if (!block) return false;
    const magnetIds = block.type === 'magnet' ? this.solverMagnetGroupIds(state, block) : null;
    const linkedIds = magnetIds && magnetIds.length > 1 ? magnetIds : null;
    let moved = false;
    while (true) {
      block = state.blocks.find((item) => item.id === blockId);
      if (!block) break;
      if (linkedIds) {
        if (!this.solverMoveLinkedGroupByDir(state, block.id, dir)) break;
      } else {
        const next = this.nextPosition(block, dir);
        const occupied = this.solverBuildOccupancy(state, [block.id]);
        if (this.solverWouldCollide({ ...block, ...next }, occupied)) break;
        block.x = next.x;
        block.y = next.y;
      }
      moved = true;
    }
    block = state.blocks.find((item) => item.id === blockId);
    const movingBlocks = linkedIds ? state.blocks.filter((item) => linkedIds.includes(item.id)) : (block ? [block] : []);
    const step = this.solverStepResultForBlocks(state, movingBlocks, dir);
    if (!step.canMove && !step.blockedByOther) {
      step.iceBlockers.forEach((ice) => {
        if (options.breakIceByRepulsion) this.solverBreakIceBlockByMagnetRepulsion(state, ice.id);
        else this.solverDamageIceBlock(state, ice.id);
      });
      moved = moved || step.iceBlockers.length > 0;
    }
    return moved;
  }

  solverLinkMagnetsIfAdjacent(state, aId, bId) {
    return this.solverLinkTouchingOppositeMagnetGroups(state, aId, bId);
  }

  solverLinkTouchingOppositeMagnetGroups(state, aId, bId, preferredRelation = null) {
    const a = state.blocks.find((block) => block.id === aId);
    const b = state.blocks.find((block) => block.id === bId);
    if (!a || !b || this.solverMagnetGroupIds(state, a).includes(b.id)) return false;
    const pairs = [];
    if (preferredRelation?.gap === 0) {
      pairs.push({ a: preferredRelation.first, b: preferredRelation.second, relation: preferredRelation });
    }
    const groupA = this.solverMagnetBlocksFor(state, a);
    const groupB = this.solverMagnetBlocksFor(state, b);
    groupA.forEach((left) => {
      groupB.forEach((right) => {
        if (this.solverMagnetGroupIds(state, left).includes(right.id)) return;
        const relation = this.solverMagnetLineRelation(state, left, right);
        if (!relation || relation.gap !== 0) return;
        pairs.push({ a: left, b: right, relation });
      });
    });
    const pair = pairs.find((item) => (
      state.blocks.includes(item.a)
      && state.blocks.includes(item.b)
      && !this.solverMagnetGroupIds(state, item.a).includes(item.b.id)
      && this.solverMagnetsAttractForRelation(state, item.a, item.b, item.relation)
      && this.solverMagnetLineClear(state, item.relation, item.a, item.b)
    ));
    if (!pair) return false;
    return this.solverMergeMagnetGroups(state, pair.a.id, pair.b.id);
  }

  solverMergeMagnetGroups(state, aId, bId) {
    const a = state.blocks.find((block) => block.id === aId);
    const b = state.blocks.find((block) => block.id === bId);
    if (!a || !b) return false;
    const groupA = this.solverMagnetGroupIds(state, a);
    const groupB = this.solverMagnetGroupIds(state, b);
    if (groupA.includes(b.id)) return false;
    const combinedIds = [...new Set([...groupA, ...groupB])].sort();
    state.blocks.forEach((block) => {
      if (combinedIds.includes(block.id)) block.linkedIds = combinedIds;
    });
    return true;
  }

  solverMagnetLineRelation(state, a, b) {
    return this.singleMagnetLineRelation(a, b);
  }

  solverMagnetLineClear(state, relation) {
    const first = state.blocks.find((block) => block.id === relation.first.id);
    const second = state.blocks.find((block) => block.id === relation.second.id);
    if (!first || !second) return false;
    const occupied = this.solverBuildIndividualOccupancy(state, [first.id, second.id]);
    const firstRect = relation.firstRect || this.solverCollisionRectForBlock(state, first);
    const secondRect = relation.secondRect || this.solverCollisionRectForBlock(state, second);
    if (relation.axis === 'horizontal') {
      const minY = Math.max(firstRect.y, secondRect.y);
      const maxY = Math.min(firstRect.y + firstRect.h, secondRect.y + secondRect.h);
      for (let x = firstRect.x + firstRect.w; x < secondRect.x; x += 1) {
        for (let y = minY; y < maxY; y += 1) if (occupied.has(`${x},${y}`)) return false;
      }
    } else {
      const minX = Math.max(firstRect.x, secondRect.x);
      const maxX = Math.min(firstRect.x + firstRect.w, secondRect.x + secondRect.w);
      for (let y = firstRect.y + firstRect.h; y < secondRect.y; y += 1) {
        for (let x = minX; x < maxX; x += 1) if (occupied.has(`${x},${y}`)) return false;
      }
    }
    return true;
  }

  solverPushHeap(heap, item) {
    heap.push(item);
    let index = heap.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.solverCompareHeap(heap[parent], item) <= 0) break;
      heap[index] = heap[parent];
      index = parent;
    }
    heap[index] = item;
  }

  solverPopHeap(heap) {
    if (heap.length <= 1) return heap.pop() || null;
    const root = heap[0];
    const last = heap.pop();
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= heap.length) break;
      const child = right < heap.length && this.solverCompareHeap(heap[right], heap[left]) < 0 ? right : left;
      if (this.solverCompareHeap(last, heap[child]) <= 0) break;
      heap[index] = heap[child];
      index = child;
    }
    heap[index] = last;
    return root;
  }

  solverCompareHeap(a, b) {
    return (a.f - b.f) || (a.h - b.h) || (a.seq - b.seq);
  }

  solveNextMove(options = {}) {
    const focused = this.solveNextMovePass({ ...options, moveMode: 'focused', maxNodes: Math.floor((options.maxNodes || 500000) * 0.25), deadlineMs: Math.floor((options.deadlineMs || 3000) * 0.3) });
    if (focused || this.lastSolveStatus === 'solved') return focused;
    const exact = this.solveNextMovePass({ ...options, moveMode: 'full', deadlineMs: Math.floor((options.deadlineMs || 3000) * 0.85) });
    if (exact || this.lastSolveStatus === 'exhausted') return exact;
    return this.solveNextMovePass({
      ...options,
      moveMode: 'full',
      heuristicWeight: 4,
      maxNodes: Math.floor((options.maxNodes || 500000) * 0.7),
      deadlineMs: Math.floor((options.deadlineMs || 3000) * 0.65),
    });
  }

  solverReconstructPath(goalKey, parents) {
    const path = [];
    let cursor = goalKey;
    while (parents.has(cursor)) {
      const item = parents.get(cursor);
      path.push({ fromKey: item.prevKey, move: item.move });
      cursor = item.prevKey;
    }
    return path.reverse();
  }

  solveNextMovePass(options = {}) {
    const maxDepth = Number.isFinite(options.maxDepth) ? Math.max(0, options.maxDepth) : Infinity;
    this.lastSolveStatus = 'searching';
    if (maxDepth <= 0) {
      this.lastSolveStatus = 'exhausted';
      return null;
    }
    const start = this.normalizeSolverState(this.makeSolverState());
    const startKey = this.solverKey(start);
    const maxNodes = options.maxNodes || 500000;
    const deadline = Date.now() + (options.deadlineMs || 3000);
    const open = [];
    const bestG = new Map([[startKey, 0]]);
    const parents = new Map();
    let seq = 0;
    let expanded = 0;
    const heuristicWeight = options.heuristicWeight || 1;
    const startH = this.solverHeuristic(start);
    this.solverPushHeap(open, { state: start, key: startKey, g: 0, h: startH, f: startH * heuristicWeight, first: null, seq: seq++ });
    while (open.length && expanded < maxNodes && Date.now() < deadline) {
      const node = this.solverPopHeap(open);
      if (!node || bestG.get(node.key) !== node.g) continue;
      if (this.solverHasReachedExit(node.state)) {
        this.lastSolveStatus = 'solved';
        const path = this.solverReconstructPath(node.key, parents);
        this.cacheHintPath(path);
        const first = path[0]?.move || node.first;
        if (first) first.remaining = path.length || node.g;
        return first || null;
      }
      if (node.g >= maxDepth) continue;
      expanded += 1;
      const moves = this.solverLegalMoves(node.state, options.preferredMove || null, options.moveMode || 'full');
      for (const move of moves) {
        const next = this.solverApplyMove(node.state, move);
        if (!next) continue;
        const nextKey = this.solverKey(next);
        const nextG = node.g + 1;
        if (nextG > maxDepth || nextG >= (bestG.get(nextKey) ?? Infinity)) continue;
        bestG.set(nextKey, nextG);
        parents.set(nextKey, {
          prevKey: node.key,
          move: { blockId: move.blockId, dir: move.dir, amount: move.amount },
        });
        const h = this.solverHeuristic(next);
        const first = node.first || { blockId: move.blockId, dir: move.dir, amount: move.amount };
        this.solverPushHeap(open, { state: next, key: nextKey, g: nextG, h, f: nextG + h * heuristicWeight, first, seq: seq++ });
      }
    }
    this.lastSolveStatus = open.length ? 'limited' : 'exhausted';
    return null;
  }

  dirText(dir) {
    return dir === 'L' ? '\u5de6' : dir === 'R' ? '\u53f3' : dir === 'U' ? '\u4e0a' : '\u4e0b';
  }

  // \u2500\u2500 BFS\u6c42\u89e3\u5668\uff1a\u5355\u6b65\u5c55\u5f00\u4fdd\u8bc1\u6700\u4f18\uff0c\u56de\u6eaf\u5408\u5e76\u5f97\u5230\u5408\u9002\u7684\u79fb\u52a8\u8ddd\u79bb \u2500\u2500

  basicHintSolve() {
    if (!this.level || !this.blocks) return null;
    const W = this.level.width;
    const H = this.level.height;
    const exit = this.level.exit;
    const targetId = this.level.targetId;
    const area = W * H;

    const curTarget = this.blocks.find((b) => b.id === targetId);
    if (curTarget && this.hasReachedExit(curTarget)) return null;

    // 每次从当前棋盘状态BFS求解，不缓存、不回放设计者路径
    const mov = [];
    const fixedMap = new Uint8Array(area);
    for (const b of this.blocks) {
      if (b.type === 'target' || (b.type === 'normal' && b.moveDir !== 'none')) {
        mov.push({ id: b.id, isT: b.id === targetId, w: b.w, h: b.h, x: b.x, y: b.y, md: b.moveDir });
      } else {
        for (let dy = 0; dy < b.h; dy++)
          for (let dx = 0; dx < b.w; dx++)
            fixedMap[(b.x + dx) * H + (b.y + dy)] = 1;
      }
    }
    const n = mov.length;
    const ti = mov.findIndex((b) => b.isT);
    if (ti < 0) return null;

    const bw = new Uint8Array(n);
    const bh = new Uint8Array(n);
    const canH = new Uint8Array(n);
    const canV = new Uint8Array(n);
    const isT = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      bw[i] = mov[i].w; bh[i] = mov[i].h;
      canH[i] = (mov[i].md === 'horizontal' || mov[i].md === 'both') ? 1 : 0;
      canV[i] = (mov[i].md === 'vertical' || mov[i].md === 'both') ? 1 : 0;
      isT[i] = mov[i].isT ? 1 : 0;
    }
    const tw = bw[ti], th = bh[ti];
    const exitSide = exit.side;
    const exitY = exit.y, exitX = exit.x;

    const makeKey = (pos) => {
      const p = new Array(n);
      for (let i = 0; i < n; i++) p[i] = pos[i * 2] * H + pos[i * 2 + 1];
      return p.join(',');
    };

    const buildGrid = (pos) => {
      const g = new Uint8Array(fixedMap);
      for (let i = 0; i < n; i++) {
        const bx = pos[i * 2], by = pos[i * 2 + 1];
        for (let dy = 0; dy < bh[i]; dy++)
          for (let dx = 0; dx < bw[i]; dx++)
            g[(bx + dx) * H + (by + dy)] = i + 2;
      }
      return g;
    };

    const isGoal = (pos) => {
      const tx = pos[ti * 2], ty = pos[ti * 2 + 1];
      if (exitSide === 'right') return ty === exitY && tx + tw > W - 1;
      if (exitSide === 'left') return ty === exitY && tx < 0;
      if (exitSide === 'top') return tx === exitX && ty < 0;
      return tx === exitX && ty + th > H - 1;
    };

    const genMoves = (pos, grid) => {
      const moves = [];
      for (let i = 0; i < n; i++) {
        const bx = pos[i * 2], by = pos[i * 2 + 1], w = bw[i], h = bh[i], me = i + 2;
        // 每个方向尝试1格、2格...直到碰壁，生成所有合法滑动距离
        if (canH[i]) {
          for (let s = 1; ; s++) {
            const nx = bx - s;
            if (nx < 0) break;
            let ok = true;
            for (let dy = 0; dy < h && ok; dy++)
              for (let dx = 0; dx < w && ok; dx++) { const v = grid[(nx + dx) * H + (by + dy)]; if (v && v !== me) ok = false; }
            if (!ok) break;
            moves.push({ bi: i, ddx: -s, ddy: 0, dir: 'L', amount: s });
          }
          for (let s = 1; ; s++) {
            const nx = bx + s;
            if (nx + w > W) break;
            let ok = true;
            for (let dy = 0; dy < h && ok; dy++)
              for (let dx = 0; dx < w && ok; dx++) { const v = grid[(nx + dx) * H + (by + dy)]; if (v && v !== me) ok = false; }
            if (!ok) break;
            moves.push({ bi: i, ddx: s, ddy: 0, dir: 'R', amount: s });
          }
        }
        if (canV[i]) {
          for (let s = 1; ; s++) {
            const ny = by - s;
            if (ny < 0) break;
            let ok = true;
            for (let dy = 0; dy < h && ok; dy++)
              for (let dx = 0; dx < w && ok; dx++) { const v = grid[(bx + dx) * H + (ny + dy)]; if (v && v !== me) ok = false; }
            if (!ok) break;
            moves.push({ bi: i, ddx: 0, ddy: -s, dir: 'U', amount: s });
          }
          for (let s = 1; ; s++) {
            const ny = by + s;
            if (ny + h > H) break;
            let ok = true;
            for (let dy = 0; dy < h && ok; dy++)
              for (let dx = 0; dx < w && ok; dx++) { const v = grid[(bx + dx) * H + (ny + dy)]; if (v && v !== me) ok = false; }
            if (!ok) break;
            moves.push({ bi: i, ddx: 0, ddy: s, dir: 'D', amount: s });
          }
        }
        // 目标块向出口方向允许滑出边界
        if (isT[i]) {
          if (exitSide === 'right' && canH[i] && by === exitY && bx + w === W)
            moves.push({ bi: i, ddx: 1, ddy: 0, dir: 'R', amount: 1 });
          else if (exitSide === 'left' && canH[i] && by === exitY && bx === 0)
            moves.push({ bi: i, ddx: -1, ddy: 0, dir: 'L', amount: 1 });
          else if (exitSide === 'top' && canV[i] && bx === exitX && by === 0)
            moves.push({ bi: i, ddx: 0, ddy: -1, dir: 'U', amount: 1 });
          else if (exitSide === 'bottom' && canV[i] && bx === exitX && by + h === H)
            moves.push({ bi: i, ddx: 0, ddy: 1, dir: 'D', amount: 1 });
        }
      }
      return moves;
    };

    const initPos = new Int16Array(n * 2);
    for (let i = 0; i < n; i++) { initPos[i * 2] = mov[i].x; initPos[i * 2 + 1] = mov[i].y; }
    if (isGoal(initPos)) return null;

    const initKey = makeKey(initPos);
    const visited = new Set([initKey]);
    const parentMap = new Map();
    const queue = [initKey];
    const posStore = new Map([[initKey, initPos]]);
    let head = 0;
    const maxNodes = 2000000;
    let expanded = 0;
    const deadline = Date.now() + 5000;

    while (head < queue.length && expanded < maxNodes && Date.now() < deadline) {
      const curKey = queue[head++];
      const pos = posStore.get(curKey);
      expanded++;
      const grid = buildGrid(pos);
      const moves = genMoves(pos, grid);
      for (const mv of moves) {
        const np = pos.slice();
        np[mv.bi * 2] += mv.ddx;
        np[mv.bi * 2 + 1] += mv.ddy;
        const nk = makeKey(np);
        if (visited.has(nk)) continue;
        visited.add(nk);
        parentMap.set(nk, { pk: curKey, bi: mv.bi, dir: mv.dir, amount: mv.amount });
        posStore.set(nk, np);
        if (isGoal(np)) {
          const path = [];
          let cursor = nk;
          while (parentMap.has(cursor)) { const it = parentMap.get(cursor); path.push(it); cursor = it.pk; }
          path.reverse();
          const first = path[0];
          const result = { blockId: mov[first.bi].id, dir: first.dir, amount: first.amount, remaining: path.length };
          return result;
        }
        queue.push(nk);
      }
    }
    return null;
  }

  _basicHintFromCache() {
    const c = this._basicHintCache;
    if (!c || c.levelId !== this.level?.levelId) return null;
    const block = this.blocks.find((b) => b.id === c.move.blockId);
    if (!block) return null;
    const axis = c.move.dir === 'L' || c.move.dir === 'R' ? 'horizontal' : 'vertical';
    const sign = c.move.dir === 'L' || c.move.dir === 'U' ? -1 : 1;
    const current = axis === 'horizontal' ? block.x : block.y;
    const target = current + sign * c.move.amount;
    const range = this.getMoveRange(block, axis);
    if (target >= range.min && target <= range.max && target !== current) return c.move;
    return null;
  }

  _basicHintDesignerPath() {
    const solution = this.level?.designerSolution;
    if (!Array.isArray(solution) || !solution.length) return null;
    const pc = this._basicHintPathCache;
    const curKey = this._makeBasicKey();
    if (pc && pc.levelId === this.level?.levelId && pc.steps.length) {
      const step = pc.steps.find((s) => s.fromKey === curKey);
      if (step) {
        const mov = this._getBasicMov();
        return { blockId: mov[step.m.bi]?.id || '?', dir: step.m.dir, amount: step.m.amount, remaining: pc.steps.length - pc.steps.indexOf(step) };
      }
    }
    const initPos = this._getBasicInitPos();
    if (!initPos) return null;
    const mov = this._getBasicMov();
    const n = mov.length;
    const H = this.level.height;
    const mk = (pos) => { const p = []; for (let i = 0; i < n; i++) p.push(pos[i * 2] * H + pos[i * 2 + 1]); return p.join(','); };
    let pos = initPos;
    let ck = mk(pos);
    const stateKey = curKey;
    if (ck === stateKey) {
      const first = this.parseDesignerMove(solution[0]);
      return first ? { blockId: first.blockId, dir: first.dir, amount: first.amount, remaining: solution.length } : null;
    }
    const path = [{ fromKey: ck, m: null }];
    for (let si = 0; si < solution.length; si++) {
      const parsed = this.parseDesignerMove(solution[si]);
      if (!parsed) return null;
      const mi = mov.findIndex((b) => b.id === parsed.blockId);
      if (mi < 0) continue;
      const ddx = parsed.dir === 'L' ? -parsed.amount : parsed.dir === 'R' ? parsed.amount : 0;
      const ddy = parsed.dir === 'U' ? -parsed.amount : parsed.dir === 'D' ? parsed.amount : 0;
      const np = pos.slice();
      np[mi * 2] += ddx;
      np[mi * 2 + 1] += ddy;
      const nk = mk(np);
      path.push({ fromKey: ck, m: { bi: mi, dir: parsed.dir, amount: parsed.amount } });
      ck = nk;
      pos = np;
      if (ck === stateKey) {
        this._basicHintPathCache = { levelId: this.level.levelId, steps: path.slice(1), startKey: stateKey };
        if (si + 1 < solution.length) {
          const next = this.parseDesignerMove(solution[si + 1]);
          return next ? { blockId: next.blockId, dir: next.dir, amount: next.amount, remaining: solution.length - si - 1 } : null;
        }
        return null;
      }
    }
    return null;
  }

  _makeBasicKey() {
    const mov = this._getBasicMov();
    const H = this.level.height;
    const p = [];
    for (let i = 0; i < mov.length; i++) p.push(mov[i].x * H + mov[i].y);
    return p.join(',');
  }

  _getBasicMov() {
    if (!this.level || !this.blocks) return [];
    const targetId = this.level.targetId;
    return this.blocks
      .filter((b) => b.type === 'target' || (b.type === 'normal' && b.moveDir !== 'none'))
      .map((b) => ({ id: b.id, isT: b.id === targetId, w: b.w, h: b.h, x: b.x, y: b.y, md: b.moveDir }));
  }

  _getBasicInitPos() {
    const mov = [];
    const targetId = this.level.targetId;
    for (const b of this.level.blocks) {
      if (b.type === 'target' || (b.type === 'normal' && b.moveDir !== 'none')) {
        mov.push({ id: b.id, isT: b.id === targetId, w: b.w, h: b.h, x: b.x, y: b.y, md: b.moveDir });
      }
    }
    const pos = new Int16Array(mov.length * 2);
    for (let i = 0; i < mov.length; i++) { pos[i * 2] = mov[i].x; pos[i * 2 + 1] = mov[i].y; }
    return pos;
  }

  facingFromMove(axis, delta) {
    if (axis === 'horizontal') return delta < 0 ? 'left' : 'right';
    return delta < 0 ? 'up' : 'down';
  }

  playMusic(key) {
    if (!wxRuntime?.createInnerAudioContext || this.musicKey === key) return;
    try {
      this.music?.stop();
      this.music?.destroy();
      this.music = wxRuntime.createInnerAudioContext();
      this.music.src = ASSET.audio.bgm;
      this.music.loop = true;
      this.music.volume = key === 'game' ? 0.22 : 0.28;
      this.musicKey = key;
      this.music.play();
    } catch (error) {
      console.warn('\u80cc\u666f\u97f3\u4e50\u64ad\u653e\u5931\u8d25', error);
    }
  }

  play(key) {
    if (!wxRuntime?.createInnerAudioContext || !ASSET.audio[key]) return;
    try {
      const audio = wxRuntime.createInnerAudioContext();
      audio.src = ASSET.audio[key];
      audio.volume = 0.65;
      audio.onEnded(() => audio.destroy());
      audio.onError(() => audio.destroy());
      audio.play();
    } catch (error) {
      console.warn(`\u97f3\u6548\u64ad\u653e\u5931\u8d25: ${key}`, error);
    }
  }

  showToast(message, duration = 1800, sub) {
    this.toast = { message, sub, until: Date.now() + Math.max(0, Number(duration) || 1800) };
  }

  renderToast() {
    if (!this.toast || Date.now() > this.toast.until) return;
    const fontSize = 18;
    const subSize = 14;
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    const mainW = this.ctx.measureText(this.toast.message).width + 40;
    let subW = 0;
    if (this.toast.sub) {
      this.ctx.font = `${subSize}px sans-serif`;
      subW = this.ctx.measureText(this.toast.sub).width + 40;
    }
    const w = Math.min(this.width - 48, Math.max(mainW, subW));
    const x = (this.width - w) / 2;
    const h = this.toast.sub ? 62 : 48;
    let y = this.height - 140 - this.gameBannerReserve();
    if (this.scene === 'game' && this.boardY && this.boardSize) {
      const toolsY = Math.min(this.height - 82 - this.gameBannerReserve(), this.safeBottom - 86 - this.gameBannerReserve());
      const boardBottom = this.boardY + this.boardSize + 18;
      const toolsTop = toolsY - 8;
      if (toolsTop > boardBottom) {
        y = boardBottom + (toolsTop - boardBottom - h) / 2;
      }
    }
    this.roundRect(x, y, w, h, 24, 'rgba(15,23,42,0.82)');
    this.text(this.toast.message, this.width / 2, y + (this.toast.sub ? 26 : 31), fontSize, '#ffffff', 'center', 'bold');
    if (this.toast.sub) {
      this.text(this.toast.sub, this.width / 2, y + 48, subSize, 'rgba(255,255,255,0.7)', 'center', 'normal');
    }
  }

  panelRect(y) {
    const w = Math.min(this.width - 34, 660);
    const bottomReserve = this.scene === 'menu' ? GAME_BANNER_RESERVED_HEIGHT : 0;
    const h = Math.min(this.height - y - Math.max(22, this.height - this.safeBottom + 18) - bottomReserve, 760);
    return { x: (this.width - w) / 2, y, w, h: Math.max(320, h) };
  }

  modalRect(h) {
    const w = Math.min(520, this.width - 54);
    return { x: (this.width - w) / 2, y: (this.height - h) / 2, w, h };
  }

  gridRect(block, inset = 0) {
    return {
      x: this.boardX + block.x * this.cellSize + inset,
      y: this.boardY + block.y * this.cellSize + inset,
      w: block.w * this.cellSize - inset * 2,
      h: block.h * this.cellSize - inset * 2,
    };
  }

  inRect(point, rect) {
    return !!rect && point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  button(label, x, y, w, h, action, style = {}) {
    const button = { x, y, w, h, action, disabled: style.disabled, tutorial: style.tutorial };
    this.buttons.push(button);
    const radius = style.radius ?? 9;
    const pressed = !style.disabled && this.pressedPoint && this.inRect(this.pressedPoint, button);
    const drawY = pressed ? y + 3 : y;
    const fill = style.disabled ? '#eef2f7' : pressed ? (style.pressFill || this.hexAlpha(style.fill || '#ffffff', 0.82)) : style.fill || '#ffffff';
    const stroke = style.stroke || '#d8e1f0';
    if (!style.disabled && !pressed) this.roundRect(x, y + 4, w, h, radius, 'rgba(0,0,0,0.08)');
    this.roundRect(x, drawY, w, h, radius, fill, stroke, 2);
    const textColor = style.disabled ? '#9aa4b5' : (style.text || this.textOnFill(fill));
    const fontSize = style.fontSize || 16;
    if (style.adIcon) {
      this.drawImageContain(ASSET.image.adIcon, x + w / 2 - 17, drawY + 3, 34, 34);
      if (label) this.text(label, x + w / 2, drawY + h - 8, Math.max(13, fontSize - 2), textColor, 'center', 'bold');
    } else {
      const labelY = drawY + h / 2 + fontSize * 0.35 + (style.freeBadge ? 9 : 0);
      if (label) this.text(label, x + w / 2, labelY, fontSize, textColor, 'center', 'bold');
    }
    if (style.freeBadge) {
      this.ctx.save();
      this.ctx.translate(x + w - 10, drawY + 0);
      this.ctx.rotate(-0.34);
      this.drawImageContain(ASSET.image.freeIcon, -39, -15, 66, 32);
      this.ctx.restore();
    }
    return button;
  }

  statChip(x, y, w, h, icon, value, color) {
    this.roundRect(x, y, w, h, h / 2, 'rgba(255,255,255,0.88)', '#d8e1f0', 1.5);
    if (this.images.get(icon)) {
      this.drawImageContain(icon, x + 3, y - 1, h + 2, h + 2);
    } else {
      this.circle(x + h / 2, y + h / 2, h * 0.34, color || '#ffb020', '#ffffff', 1.5);
      this.text(icon?.includes?.('/') ? '?' : icon, x + h / 2, y + h / 2 + h * 0.18, h * 0.42, '#ffffff', 'center', 'bold');
    }
    this.text(String(value), x + h + 8, y + h / 2 + h * 0.18, h * 0.45, '#202633', 'left', 'bold');
  }

  drawPageBackground(a, b, imagePath) {
    const img = imagePath ? this.images.get(imagePath) : null;
    if (img) {
      this.drawImageCover(imagePath, 0, 0, this.width, this.height);
      const overlay = imagePath === ASSET.image.neon ? 'rgba(7,12,28,0.12)' : imagePath === ASSET.image.pixel ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)';
      this.ctx.fillStyle = overlay;
      this.ctx.fillRect(0, 0, this.width, this.height);
      return;
    }
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, a);
    gradient.addColorStop(1, b);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawImageCover(path, x, y, w, h) {
    const img = this.images.get(path);
    if (!img) return;
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    this.ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  drawImageContain(path, x, y, w, h) {
    const img = this.images.get(path);
    if (!img) return;
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    this.ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  drawCharacterIcon(cx, cy, r, skinId) {
    const palettes = {
      cat_orange: ['#f59b36', '#7a3d10', '#fff2d1'],
      cat_lihua: ['#9ca3af', '#334155', '#fef3c7'],
      dog_tan: ['#d99034', '#7a3d10', '#fff7d6'],
      rabbit_white: ['#fff7ed', '#f9a8d4', '#334155'],
      turtle_green: ['#84cc16', '#166534', '#fef3c7'],
      panda_baby: ['#f8fafc', '#111827', '#fca5a5'],
    };
    const [main, dark, accent] = palettes[skinId] || ['#f59b36', '#7a3d10', '#fff2d1'];
    this.circle(cx, cy + r * 0.28, r * 0.76, 'rgba(0,0,0,0.14)');
    this.circle(cx, cy, r, main, dark, 3);
    this.circle(cx - r * 0.42, cy - r * 0.68, r * 0.34, main, dark, 3);
    this.circle(cx + r * 0.42, cy - r * 0.68, r * 0.34, main, dark, 3);
    this.circle(cx - r * 0.34, cy - r * 0.1, r * 0.12, dark);
    this.circle(cx + r * 0.34, cy - r * 0.1, r * 0.12, dark);
    this.circle(cx, cy + r * 0.18, r * 0.11, accent);
    this.ctx.strokeStyle = dark;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + r * 0.28, r * 0.2, 0.2, Math.PI - 0.2);
    this.ctx.stroke();
  }

  circle(x, y, r, fill, stroke, lineWidth = 2) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  roundPath(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    this.ctx.moveTo(x + radius, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, radius);
    this.ctx.arcTo(x + w, y + h, x, y + h, radius);
    this.ctx.arcTo(x, y + h, x, y, radius);
    this.ctx.arcTo(x, y, x + w, y, radius);
    this.ctx.closePath();
  }

  roundRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
    this.ctx.beginPath();
    this.roundPath(x, y, w, h, r);
    if (fill) {
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
    if (stroke) {
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  text(text, x, y, size, color, align = 'left', weight = 'normal', outline) {
    this.ctx.font = `${weight} ${size}px sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'alphabetic';
    if (outline) {
      this.ctx.strokeStyle = outline;
      this.ctx.lineWidth = Math.max(2, size * 0.08);
      this.ctx.strokeText(text, x, y);
    }
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  wrappedText(text, x, y, maxWidth, size, lineHeight, color, align = 'left', weight = 'normal') {
    this.ctx.font = `${weight} ${size}px sans-serif`;
    const lines = [];
    let line = '';
    Array.from(text).forEach((char) => {
      const test = line + char;
      if (line && this.ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    const top = y - (lines.length - 1) * lineHeight;
    lines.forEach((item, index) => {
      this.text(item, x, top + index * lineHeight, size, color, align, weight);
    });
  }

  scrollBar(view, scroll, contentH) {
    if (!view || contentH <= view.h + 4) return;
    const trackH = view.h - 18;
    const thumbH = Math.max(42, trackH * (view.h / contentH));
    const progress = scroll / Math.max(1, contentH - view.h);
    const x = view.x + view.w - 9;
    const y = view.y + 9 + progress * (trackH - thumbH);
    this.roundRect(x, view.y + 9, 5, trackH, 3, 'rgba(203,213,225,0.72)');
    this.roundRect(x, y, 5, thumbH, 3, 'rgba(100,116,139,0.72)');
  }

  textOnFill(fill) {
    const rgb = this.parseColor(fill);
    if (!rgb) return '#202633';
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.58 ? '#202633' : '#ffffff';
  }

  parseColor(color) {
    if (!color || typeof color !== 'string') return null;
    if (color.startsWith('#')) {
      const hex = color.length === 4
        ? color.slice(1).split('').map((item) => item + item).join('')
        : color.slice(1, 7);
      const n = parseInt(hex, 16);
      if (Number.isNaN(n)) return null;
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const match = color.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(',').map((item) => Number(item.trim()));
    if (parts.length < 3 || parts.some((item, index) => index < 3 && Number.isNaN(item))) return null;
    const alpha = parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1;
    const r = parts[0] * alpha + 255 * (1 - alpha);
    const g = parts[1] * alpha + 255 * (1 - alpha);
    const b = parts[2] * alpha + 255 * (1 - alpha);
    return { r, g, b };
  }

  hexAlpha(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return hex;
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
