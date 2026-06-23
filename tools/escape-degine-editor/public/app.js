const $ = (selector) => document.querySelector(selector);

const state = {
  levels: [],
  currentIndex: 0,
  current: null,
  mode: 'play',
  steps: 0,
  coins: 0,
  selected: null,
  drag: null,
  paths: null,
  effects: [],
  effectSeq: 0,
};

const asset = (path) => `/game-assets/${path}`;

const image = {
  targetBlock: asset('images/block_target.png'),
  horizontalBlock: asset('images/block_horizontal.png'),
  verticalBlock: asset('images/block_vertical.png'),
  fixedBlock: asset('images/block_fixed.png'),
  exitGate: asset('images/ui/exit_gate.png'),
  coin: asset('images/special/coin.png'),
  magnetN: asset('images/special/magnet_n.png'),
  magnetS: asset('images/special/magnet_s.png'),
  locked: asset('images/special/locked.png'),
  key: asset('images/special/key.png'),
  teleport: asset('images/special/teleport.png'),
  directional: asset('images/special/directional.png'),
  iceIntactSquare: asset('images/special/ice_intact_square.png'),
  iceCrackedSquare: asset('images/special/ice_cracked_square.png'),
  iceIntactWide: asset('images/special/ice_intact_wide.png'),
  iceCrackedWide: asset('images/special/ice_cracked_wide.png'),
  iceIntactTall: asset('images/special/ice_intact_tall.png'),
  iceCrackedTall: asset('images/special/ice_cracked_tall.png'),
  moveHorizontal: asset('images/ui/move_arrow_horizontal.png'),
  moveVertical: asset('images/ui/move_arrow_vertical.png'),
};

const palette = [
  { label: '目标', kind: 'block', type: 'target', w: 2, h: 2, moveDir: 'both', color: '#ef4444' },
  { label: '横块 1', kind: 'block', type: 'normal', w: 1, h: 1, moveDir: 'horizontal', color: '#2563eb' },
  { label: '横块 2', kind: 'block', type: 'normal', w: 2, h: 1, moveDir: 'horizontal', color: '#2563eb' },
  { label: '横块 3', kind: 'block', type: 'normal', w: 3, h: 1, moveDir: 'horizontal', color: '#2563eb' },
  { label: '竖块 1', kind: 'block', type: 'normal', w: 1, h: 1, moveDir: 'vertical', color: '#159466' },
  { label: '竖块 2', kind: 'block', type: 'normal', w: 1, h: 2, moveDir: 'vertical', color: '#159466' },
  { label: '竖块 3', kind: 'block', type: 'normal', w: 1, h: 3, moveDir: 'vertical', color: '#159466' },
  { label: '方块', kind: 'block', type: 'normal', w: 1, h: 1, moveDir: 'both', color: '#0f766e' },
  { label: '横向方块', kind: 'block', type: 'normal', w: 2, h: 2, moveDir: 'horizontal', style: 'normal_square_2x2', color: '#2563eb' },
  { label: '纵向方块', kind: 'block', type: 'normal', w: 2, h: 2, moveDir: 'vertical', style: 'normal_square_2x2', color: '#159466' },
  { label: '固定', kind: 'block', type: 'fixed', w: 1, h: 1, moveDir: 'none', color: '#64748b' },
  { label: '横向固定块', kind: 'block', type: 'fixed', w: 2, h: 1, moveDir: 'none', style: 'fixed_stone', color: '#64748b' },
  { label: '纵向固定块', kind: 'block', type: 'fixed', w: 1, h: 2, moveDir: 'none', style: 'fixed_stone', color: '#64748b' },
  { label: '磁铁 N', kind: 'block', type: 'magnet', pole: 'N', w: 1, h: 1, moveDir: 'both', color: '#1d4ed8' },
  { label: '磁铁 S', kind: 'block', type: 'magnet', pole: 'S', w: 1, h: 1, moveDir: 'both', color: '#dc2626' },
  { label: '冰块', kind: 'block', type: 'ice', iceState: 'intact', w: 1, h: 1, moveDir: 'both', color: '#7dd3fc' },
  { label: '横向冰块 2', kind: 'block', type: 'ice', iceState: 'intact', w: 2, h: 1, moveDir: 'both', color: '#7dd3fc' },
  { label: '横向冰块 3', kind: 'block', type: 'ice', iceState: 'intact', w: 3, h: 1, moveDir: 'both', color: '#7dd3fc' },
  { label: '纵向冰块 2', kind: 'block', type: 'ice', iceState: 'intact', w: 1, h: 2, moveDir: 'both', color: '#7dd3fc' },
  { label: '纵向冰块 3', kind: 'block', type: 'ice', iceState: 'intact', w: 1, h: 3, moveDir: 'both', color: '#7dd3fc' },
  { label: '锁', kind: 'block', type: 'locked', w: 1, h: 1, moveDir: 'none', unlockedMoveDir: 'horizontal', color: '#7c3aed' },
  { label: '钥匙', kind: 'block', type: 'key', w: 1, h: 1, moveDir: 'both', color: '#facc15' },
  { label: '金币', kind: 'cell', type: 'coin', w: 1, h: 1, rewardCoins: 3, color: '#facc15' },
  { label: '传送 A', kind: 'cell', type: 'teleport', portalId: 'A', pairId: 'B', w: 2, h: 2, color: '#c4b5fd' },
  { label: '传送 B', kind: 'cell', type: 'teleport', portalId: 'B', pairId: 'A', w: 2, h: 2, color: '#a78bfa' },
  { label: '方向格', kind: 'cell', type: 'directional', dir: 'right', w: 1, h: 1, color: '#bbf7d0' },
  { label: '出口', kind: 'exit', side: 'right', w: 1, h: 2, color: '#f59e0b' },
];

const DIRS = {
  L: { dx: -1, dy: 0, axis: 'horizontal' },
  R: { dx: 1, dy: 0, axis: 'horizontal' },
  U: { dx: 0, dy: -1, axis: 'vertical' },
  D: { dx: 0, dy: 1, axis: 'vertical' },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeLevel(level) {
  const next = clone(level);
  next.specialCells = Array.isArray(next.specialCells) ? next.specialCells : [];
  next.blocks = Array.isArray(next.blocks) ? next.blocks : [];
  next.exit = next.exit || { side: 'right', x: next.width - 1, y: 2, w: 1, h: 2, direction: 'right' };
  return next;
}

async function loadLevels() {
  const response = await fetch('/api/levels');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '读取关卡失败');
  state.levels = data.levels;
  state.paths = data.paths;
  $('#pathText').textContent = `保存目标：${data.paths.levelsJson} 和 ${data.paths.levelsJs}`;
  selectLevel(0);
  renderLevelList();
  renderPalette();
}

function selectLevel(index) {
  state.currentIndex = index;
  state.current = normalizeLevel(state.levels[index]);
  state.steps = 0;
  state.coins = 0;
  state.selected = null;
  renderAll();
}

function renderAll() {
  renderLevelList();
  renderBoard();
  renderMeta();
  renderInspector();
  updateStats();
}

function renderLevelList() {
  const query = $('#levelSearch').value.trim();
  const list = $('#levelList');
  list.innerHTML = '';
  state.levels.forEach((level, index) => {
    if (query && !String(level.levelId).includes(query)) return;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `levelTile${index === state.currentIndex ? ' active' : ''}`;
    item.textContent = level.levelId;
    item.addEventListener('click', () => selectLevel(index));
    list.appendChild(item);
  });
}

function renderMeta() {
  const level = state.current;
  if (!level) return;
  $('#levelTitle').textContent = `第 ${level.levelId} 关`;
  $('#levelMeta').textContent = `${level.width}x${level.height}，块 ${level.blocks.length}，特殊格 ${level.specialCells.length}，步数上限 ${level.stepLimit || '-'}`;
  $('#statusPill').textContent = state.mode === 'play' ? '游玩模式' : '编辑模式';
  $('#statusPill').classList.toggle('editing', state.mode === 'edit');
}

function updateStats(message = '') {
  $('#stepText').textContent = `步数 ${state.steps}`;
  $('#coinText').textContent = `金币 ${state.coins}`;
  if (message) $('#messageText').textContent = message;
}

function renderPalette() {
  const root = $('#palette');
  root.innerHTML = '';
  palette.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'paletteItem';
    button.draggable = true;
    button.innerHTML = `<span>${item.label}</span><i class="swatch" style="background:${item.color}"></i>`;
    button.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('application/json', JSON.stringify(item));
    });
    root.appendChild(button);
  });
}

function renderBoard() {
  const level = state.current;
  const board = $('#board');
  if (!level) return;
  board.style.setProperty('--board-w', level.width);
  board.style.setProperty('--board-h', level.height);
  board.innerHTML = '';
  board.ondragover = (event) => event.preventDefault();
  board.ondrop = onPaletteDrop;

  renderExit(board, level.exit);
  level.specialCells.forEach((cell, index) => renderSpecial(board, cell, index));
  level.blocks.forEach((block) => renderBlock(board, block));
  state.effects.forEach((effect) => renderEffect(board, effect));
}

function renderExit(board, exit) {
  const el = document.createElement('div');
  el.className = `exit${state.selected?.kind === 'exit' ? ' selected' : ''}`;
  setRectVars(el, exit);
  el.innerHTML = `<img class="exitSprite" src="${image.exitGate}" alt=""><span class="blockLabel">${exitArrow(exit.side)}</span>`;
  el.addEventListener('pointerdown', (event) => startDrag(event, { kind: 'exit' }));
  el.addEventListener('contextmenu', (event) => event.preventDefault());
  board.appendChild(el);
}

function renderSpecial(board, cell, index) {
  if (cell.type === 'exit') return;
  const el = document.createElement('div');
  el.className = `special ${cell.type || ''}${isSelected('cell', index) ? ' selected' : ''}`;
  setRectVars(el, cell);
  el.innerHTML = specialVisual(cell);
  el.addEventListener('pointerdown', (event) => startDrag(event, { kind: 'cell', index }));
  el.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (state.mode === 'edit') {
      state.current.specialCells.splice(index, 1);
      state.selected = null;
      renderAll();
    }
  });
  board.appendChild(el);
}

function renderBlock(board, block) {
  const el = document.createElement('div');
  el.className = [
    'block',
    block.type,
    block.moveDir,
    block.pole,
    block.iceState === 'cracked' ? 'cracked' : '',
    isSelected('block', block.id) ? 'selected' : '',
  ].filter(Boolean).join(' ');
  setRectVars(el, block);
  el.innerHTML = blockVisual(block);
  el.addEventListener('pointerdown', (event) => startDrag(event, { kind: 'block', id: block.id }));
  el.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (state.mode === 'edit' && block.type !== 'target') {
      state.current.blocks = state.current.blocks.filter((item) => item.id !== block.id);
      state.selected = null;
      renderAll();
    }
  });
  board.appendChild(el);
}

function renderEffect(board, effect) {
  const el = document.createElement('div');
  el.className = `fx ${effect.type}`;
  setRectVars(el, effect);
  el.textContent = effect.text || '';
  board.appendChild(el);
}

function pushEffect(type, item, text = '') {
  const effect = {
    id: state.effectSeq += 1,
    type,
    text,
    x: item.x || 0,
    y: item.y || 0,
    w: item.w || 1,
    h: item.h || 1,
  };
  state.effects.push(effect);
  window.setTimeout(() => {
    state.effects = state.effects.filter((candidate) => candidate.id !== effect.id);
    renderBoard();
  }, 760);
}

function setRectVars(el, item) {
  el.style.setProperty('--x', item.x || 0);
  el.style.setProperty('--y', item.y || 0);
  el.style.setProperty('--w', item.w || 1);
  el.style.setProperty('--h', item.h || 1);
}

function blockVisual(block) {
  const texture = blockTexture(block);
  const sprite = blockSprite(block);
  const arrow = moveArrow(block);
  const label = escapeHtml(blockLabel(block));
  return [
    texture ? `<img class="blockTexture" src="${texture}" alt="">` : '',
    sprite ? `<img class="blockSprite" src="${sprite}" alt="">` : '',
    `<span class="blockLabel">${label}</span>`,
    arrow ? `<img class="moveGlyph" src="${arrow}" alt="">` : '',
  ].join('');
}

function specialVisual(cell) {
  const sprite = specialSprite(cell);
  const label = escapeHtml(specialLabel(cell));
  return [
    sprite ? `<img class="specialSprite" src="${sprite}" alt="">` : '',
    `<span class="blockLabel">${label}</span>`,
  ].join('');
}

function blockTexture(block) {
  if (block.type === 'target') return image.targetBlock;
  if (block.type === 'fixed' || block.moveDir === 'none') return image.fixedBlock;
  if (block.moveDir === 'horizontal') return image.horizontalBlock;
  if (block.moveDir === 'vertical') return image.verticalBlock;
  return '';
}

function blockSprite(block) {
  if (block.type === 'target') return characterSprite(block);
  if (block.type === 'magnet') return block.pole === 'S' ? image.magnetS : image.magnetN;
  if (block.type === 'locked') return image.locked;
  if (block.type === 'key') return image.key;
  if (block.type === 'ice') return iceSprite(block);
  return '';
}

function characterSprite(block) {
  const skin = block.skinId || 'cat_orange';
  const facing = normalizeFacing(block.facing || state.current?.exit?.direction || state.current?.exit?.side || 'right');
  return asset(`images/characters/${skin}_idle_${facing}.png`);
}

function normalizeFacing(value) {
  if (value === 'up' || value === 'top') return 'up';
  if (value === 'down' || value === 'bottom') return 'down';
  if (value === 'left') return 'left';
  return 'right';
}

function iceSprite(block) {
  const cracked = block.iceState === 'cracked';
  if ((block.h || 1) > (block.w || 1)) return cracked ? image.iceCrackedTall : image.iceIntactTall;
  if ((block.w || 1) > (block.h || 1)) return cracked ? image.iceCrackedWide : image.iceIntactWide;
  return cracked ? image.iceCrackedSquare : image.iceIntactSquare;
}

function specialSprite(cell) {
  if (cell.type === 'coin') return image.coin;
  if (cell.type === 'teleport') return image.teleport;
  if (cell.type === 'directional') return image.directional;
  return '';
}

function moveArrow(block) {
  if (block.type === 'target' || block.type === 'magnet' || block.type === 'ice' || block.type === 'key') return '';
  if (block.moveDir === 'horizontal') return image.moveHorizontal;
  if (block.moveDir === 'vertical') return image.moveVertical;
  return '';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function blockLabel(block) {
  if (block.type === 'target') return 'T';
  if (block.type === 'magnet') return block.pole || 'N';
  if (block.type === 'locked') return '锁';
  if (block.type === 'key') return '钥';
  if (block.type === 'ice') return block.iceState === 'cracked' ? '裂' : '冰';
  return block.id;
}

function specialLabel(cell) {
  if (cell.type === 'coin') return '$';
  if (cell.type === 'teleport') return cell.portalId || '门';
  if (cell.type === 'directional') return exitArrow(cell.dir || cell.direction || 'right');
  return cell.type || '?';
}

function exitArrow(side) {
  return side === 'left' ? '<' : side === 'top' ? '^' : side === 'bottom' ? 'v' : '>';
}

function isSelected(kind, idOrIndex) {
  return state.selected?.kind === kind && (state.selected.id === idOrIndex || state.selected.index === idOrIndex);
}

function boardPoint(event) {
  const rect = $('#board').getBoundingClientRect();
  const level = state.current;
  return {
    x: (event.clientX - rect.left) / (rect.width / level.width),
    y: (event.clientY - rect.top) / (rect.height / level.height),
  };
}

function startDrag(event, ref) {
  event.preventDefault();
  const item = itemFromRef(ref);
  if (!item) return;
  state.selected = ref;
  renderInspector();
  const point = boardPoint(event);
  state.drag = {
    ref,
    item,
    startPointer: point,
    startX: item.x || 0,
    startY: item.y || 0,
    axis: null,
    moved: false,
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  event.currentTarget.classList.add('dragging');
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp, { once: true });
}

function onPointerMove(event) {
  const drag = state.drag;
  if (!drag) return;
  const level = state.current;
  const point = boardPoint(event);
  const dx = point.x - drag.startPointer.x;
  const dy = point.y - drag.startPointer.y;
  drag.moved = Math.abs(dx) > 0.12 || Math.abs(dy) > 0.12;

  if (state.mode === 'edit') {
    drag.item.x = clamp(Math.round(drag.startX + dx), 0, level.width - (drag.item.w || 1));
    drag.item.y = clamp(Math.round(drag.startY + dy), 0, level.height - (drag.item.h || 1));
    renderBoard();
    return;
  }

  if (drag.ref.kind !== 'block') return;
  const block = drag.item;
  if (block.moveDir === 'none') return;
  if (!drag.axis) drag.axis = chooseAxis(block, dx, dy);
  if (!drag.axis) return;
  const range = getMoveRange(block, drag.axis);
  const value = drag.axis === 'horizontal'
    ? clamp(Math.round(drag.startX + dx), range.min, range.max)
    : clamp(Math.round(drag.startY + dy), range.min, range.max);
  if (drag.axis === 'horizontal') block.x = value;
  else block.y = value;
  renderBoard();
}

function onPointerUp() {
  const drag = state.drag;
  state.drag = null;
  window.removeEventListener('pointermove', onPointerMove);
  if (!drag) return;
  if (state.mode === 'play' && drag.ref.kind === 'block') {
    const deltaX = drag.item.x - drag.startX;
    const deltaY = drag.item.y - drag.startY;
    if (deltaX || deltaY) {
      state.steps += 1;
      collectCoinsAlongPath(drag.item, drag.startX, drag.startY, drag.item.x, drag.item.y);
      resolveSpecials(drag.item, { dx: Math.sign(deltaX), dy: Math.sign(deltaY) });
      checkWin();
    }
  }
  renderAll();
}

function chooseAxis(block, dx, dy) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (block.moveDir === 'horizontal') return absX > 0.05 ? 'horizontal' : null;
  if (block.moveDir === 'vertical') return absY > 0.05 ? 'vertical' : null;
  return absX >= absY ? 'horizontal' : 'vertical';
}

function itemFromRef(ref) {
  if (ref.kind === 'block') return state.current.blocks.find((block) => block.id === ref.id);
  if (ref.kind === 'cell') return state.current.specialCells[ref.index];
  if (ref.kind === 'exit') return state.current.exit;
  return null;
}

function onPaletteDrop(event) {
  event.preventDefault();
  if (state.mode !== 'edit') return updateStats('切到编辑模式后再拖入组件');
  const raw = event.dataTransfer.getData('application/json');
  if (!raw) return;
  const item = JSON.parse(raw);
  const point = boardPoint(event);
  const x = clamp(Math.floor(point.x), 0, state.current.width - (item.w || 1));
  const y = clamp(Math.floor(point.y), 0, state.current.height - (item.h || 1));
  if (item.kind === 'exit') {
    state.current.exit = {
      side: item.side || 'right',
      x,
      y,
      w: item.w || 1,
      h: item.h || 2,
      direction: item.side || 'right',
    };
    state.selected = { kind: 'exit' };
  } else if (item.kind === 'cell') {
    state.current.specialCells.push({ ...clone(item), x, y });
    delete state.current.specialCells[state.current.specialCells.length - 1].kind;
    delete state.current.specialCells[state.current.specialCells.length - 1].label;
    delete state.current.specialCells[state.current.specialCells.length - 1].color;
    state.selected = { kind: 'cell', index: state.current.specialCells.length - 1 };
  } else {
    const block = { ...clone(item), id: nextBlockId(), x, y };
    delete block.kind;
    delete block.label;
    delete block.color;
    if (block.type === 'target') {
      block.id = 'T';
      state.current.targetId = 'T';
      state.current.blocks = state.current.blocks.filter((candidate) => candidate.type !== 'target' && candidate.id !== 'T');
    }
    if (block.type === 'key' && !block.unlockTargetId) {
      const lock = state.current.blocks.find((candidate) => candidate.type === 'locked');
      block.unlockTargetId = lock?.id || '';
      block.keyId = `key-${state.current.levelId}`;
    }
    if (block.type === 'locked' && !block.lockId) block.lockId = `lock-${state.current.levelId}`;
    state.current.blocks.push(block);
    state.selected = { kind: 'block', id: block.id };
  }
  renderAll();
}

function nextBlockId() {
  const used = new Set(state.current.blocks.map((block) => block.id));
  const candidates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((id) => id !== 'T');
  for (const id of candidates) if (!used.has(id)) return id;
  let index = 2;
  while (used.has(`N${index}`)) index += 1;
  return `N${index}`;
}

function getMoveRange(block, axis) {
  const linked = block.type === 'magnet' ? magnetGroup(block) : [block];
  const start = axis === 'horizontal' ? block.x : block.y;
  let minDelta = 0;
  let maxDelta = 0;
  while (canPlaceGroup(linked, axis === 'horizontal' ? minDelta - 1 : 0, axis === 'vertical' ? minDelta - 1 : 0)) minDelta -= 1;
  while (canPlaceGroup(linked, axis === 'horizontal' ? maxDelta + 1 : 0, axis === 'vertical' ? maxDelta + 1 : 0)) maxDelta += 1;
  return { min: start + minDelta, max: start + maxDelta };
}

function canPlaceGroup(blocks, dx, dy) {
  const ignored = new Set(blocks.map((block) => block.id));
  return blocks.every((block) => canPlaceRect({ x: block.x + dx, y: block.y + dy, w: block.w, h: block.h }, ignored));
}

function canPlaceRect(rect, ignored = new Set()) {
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > state.current.width || rect.y + rect.h > state.current.height) return false;
  return !state.current.blocks.some((block) => {
    if (ignored.has(block.id)) return false;
    return rectsOverlap(rect, block);
  });
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function blocksTouchOrOverlap(a, b) {
  const overlap = rectsOverlap(a, b);
  const verticalSpan = a.y < b.y + b.h && a.y + a.h > b.y;
  const horizontalSpan = a.x < b.x + b.w && a.x + a.w > b.x;
  const horizontalTouch = verticalSpan && (a.x + a.w === b.x || b.x + b.w === a.x);
  const verticalTouch = horizontalSpan && (a.y + a.h === b.y || b.y + b.h === a.y);
  return overlap || horizontalTouch || verticalTouch;
}

function collectCoinsAlongPath(block, fromX, fromY, toX, toY) {
  const dx = Math.sign(toX - fromX);
  const dy = Math.sign(toY - fromY);
  const steps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
  for (let step = 0; step <= steps; step += 1) {
    const preview = { ...block, x: fromX + dx * step, y: fromY + dy * step };
    for (const cell of state.current.specialCells) {
      if (cell.type !== 'coin' || cell.collected) continue;
      if (rectsOverlap(preview, cell)) {
        cell.collected = true;
        const reward = Number(cell.rewardCoins || 3);
        state.coins += reward;
        pushEffect('coinFx', cell, `+${reward}`);
      }
    }
  }
}

function resolveSpecials(block, move) {
  damageIceIfBlocked(block, move);
  resolveTeleport(block);
  resolveKeyLocks();
  resolveMagnetForces(block);
}

function damageIceIfBlocked(block, move) {
  if (!move.dx && !move.dy) return;
  const linked = block.type === 'magnet' ? magnetGroup(block) : [block];
  const ignored = new Set(linked.map((item) => item.id));
  const blockers = [];
  for (const item of linked) {
    const rect = { x: item.x + move.dx, y: item.y + move.dy, w: item.w, h: item.h };
    state.current.blocks.forEach((candidate) => {
      if (!ignored.has(candidate.id) && candidate.type === 'ice' && rectsOverlap(rect, candidate)) blockers.push(candidate);
    });
  }
  blockers.forEach((ice) => {
    pushEffect('burstFx', ice);
    if (ice.iceState === 'cracked') state.current.blocks = state.current.blocks.filter((item) => item.id !== ice.id);
    else ice.iceState = 'cracked';
  });
}

function resolveTeleport(block) {
  const portals = state.current.specialCells.filter((cell) => cell.type === 'teleport');
  if (portals.length < 2) return;
  const portal = portals.find((cell) => rectsInside(block, cell));
  if (!portal || block.lastPortalId === portal.portalId) {
    if (!portal) block.lastPortalId = '';
    return;
  }
  const pair = portals.find((cell) => cell.portalId === portal.pairId);
  if (!pair) return;
  const nx = pair.x + (block.x - portal.x);
  const ny = pair.y + (block.y - portal.y);
  if (canPlaceRect({ x: nx, y: ny, w: block.w, h: block.h }, new Set([block.id]))) {
    pushEffect('portalFx', portal);
    block.x = nx;
    block.y = ny;
    block.lastPortalId = pair.portalId;
    pushEffect('portalFx', block);
  }
}

function rectsInside(a, b) {
  return a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
}

function resolveKeyLocks() {
  const keys = state.current.blocks.filter((block) => block.type === 'key');
  keys.forEach((key) => {
    const locked = state.current.blocks.find((block) => block.type === 'locked' && block.id === key.unlockTargetId);
    if (!locked || !blocksTouchOrOverlap(key, locked)) return;
    state.current.blocks = state.current.blocks.filter((block) => block.id !== key.id);
    locked.type = 'normal';
    locked.moveDir = locked.unlockedMoveDir || 'horizontal';
    pushEffect('magnetFx', locked);
  });
}

function resolveMagnetForces(origin) {
  for (let guard = 0; guard < 8; guard += 1) {
    const magnets = state.current.blocks.filter((block) => block.type === 'magnet');
    let changed = false;
    outer: for (let i = 0; i < magnets.length; i += 1) {
      for (let j = i + 1; j < magnets.length; j += 1) {
        const a = magnets[i];
        const b = magnets[j];
        if (magnetGroupIds(a).includes(b.id)) continue;
        const relation = magnetRelation(a, b);
        if (!relation || !magnetLineClear(relation, a, b)) continue;
        changed = a.pole !== b.pole ? attractMagnets(a, b, relation, origin) : repelMagnets(a, b, relation);
        if (changed) break outer;
      }
    }
    if (!changed) break;
  }
}

function magnetRelation(a, b) {
  const horizontalSpan = a.y < b.y + b.h && a.y + a.h > b.y;
  const verticalSpan = a.x < b.x + b.w && a.x + a.w > b.x;
  if (horizontalSpan) {
    const first = a.x <= b.x ? a : b;
    const second = first === a ? b : a;
    return { axis: 'horizontal', first, second, gap: second.x - (first.x + first.w) };
  }
  if (verticalSpan) {
    const first = a.y <= b.y ? a : b;
    const second = first === a ? b : a;
    return { axis: 'vertical', first, second, gap: second.y - (first.y + first.h) };
  }
  return null;
}

function magnetLineClear(relation, a, b) {
  if (relation.gap < 0) return false;
  return !state.current.blocks.some((block) => {
    if (block.id === a.id || block.id === b.id) return false;
    if (relation.axis === 'horizontal') {
      return block.y < relation.first.y + relation.first.h
        && block.y + block.h > relation.first.y
        && block.x >= relation.first.x + relation.first.w
        && block.x + block.w <= relation.second.x;
    }
    return block.x < relation.first.x + relation.first.w
      && block.x + block.w > relation.first.x
      && block.y >= relation.first.y + relation.first.h
      && block.y + block.h <= relation.second.y;
  });
}

function attractMagnets(a, b, relation, origin) {
  if (relation.gap === 0) {
    linkMagnets(a, b);
    pushEffect('magnetFx', a);
    pushEffect('magnetFx', b);
    return true;
  }
  const mover = origin?.type === 'magnet' && magnetGroupIds(b).includes(origin.id) ? b : a;
  const anchor = mover === a ? b : a;
  let changed = false;
  for (let guard = 0; guard < 10; guard += 1) {
    const current = magnetRelation(mover, anchor);
    if (!current || current.gap <= 0) break;
    const dir = current.axis === 'horizontal'
      ? (current.first === mover ? 'R' : 'L')
      : (current.first === mover ? 'D' : 'U');
    if (!moveMagnetGroup(mover, dir)) break;
    changed = true;
  }
  if (blocksTouchOrOverlap(mover, anchor)) {
    linkMagnets(mover, anchor);
    pushEffect('magnetFx', mover);
    pushEffect('magnetFx', anchor);
  } else if (changed) {
    pushEffect('magnetFx', mover);
  }
  return changed;
}

function repelMagnets(a, b, relation) {
  const dirA = relation.axis === 'horizontal' ? (relation.first === a ? 'L' : 'R') : (relation.first === a ? 'U' : 'D');
  const dirB = oppositeDir(dirA);
  const movedA = slideMagnet(a, dirA);
  const movedB = slideMagnet(b, dirB);
  if (movedA) pushEffect('magnetFx', a);
  if (movedB) pushEffect('magnetFx', b);
  return movedA || movedB;
}

function slideMagnet(block, dir) {
  let moved = false;
  while (moveMagnetGroup(block, dir)) moved = true;
  return moved;
}

function moveMagnetGroup(block, dir) {
  const group = magnetGroup(block);
  const { dx, dy } = DIRS[dir];
  if (!canPlaceGroup(group, dx, dy)) return false;
  group.forEach((item) => {
    item.x += dx;
    item.y += dy;
  });
  return true;
}

function oppositeDir(dir) {
  return dir === 'L' ? 'R' : dir === 'R' ? 'L' : dir === 'U' ? 'D' : 'U';
}

function linkMagnets(a, b) {
  const ids = [...new Set([...magnetGroupIds(a), ...magnetGroupIds(b)])].sort();
  state.current.blocks.forEach((block) => {
    if (block.type === 'magnet' && ids.includes(block.id)) block.linkedIds = ids;
  });
}

function magnetGroupIds(block) {
  if (block.type !== 'magnet') return [block.id];
  return [...new Set([block.id, ...(block.linkedIds || [])])].filter((id) => state.current.blocks.some((item) => item.id === id)).sort();
}

function magnetGroup(block) {
  const ids = magnetGroupIds(block);
  return state.current.blocks.filter((item) => ids.includes(item.id));
}

function checkWin() {
  const target = state.current.blocks.find((block) => block.id === state.current.targetId);
  const exit = state.current.exit;
  if (!target || !exit) return;
  const won = exit.side === 'right'
    ? target.y === exit.y && target.x + target.w >= state.current.width
    : exit.side === 'left'
      ? target.y === exit.y && target.x <= 0
      : exit.side === 'top'
        ? target.x === exit.x && target.y <= 0
        : target.x === exit.x && target.y + target.h >= state.current.height;
  if (won) updateStats('通关');
  if (won) pushEffect('coinFx', target, '完成');
}

function renderInspector() {
  const root = $('#inspector');
  const item = state.selected ? itemFromRef(state.selected) : null;
  if (!item) {
    root.innerHTML = '<p class="muted">选择棋盘上的组件后可编辑属性。</p>';
    return;
  }
  const fields = [
    ['id', '编号', 'text'],
    ['type', '类型', 'text'],
    ['x', 'X', 'number'],
    ['y', 'Y', 'number'],
    ['w', '宽', 'number'],
    ['h', '高', 'number'],
    ['moveDir', '移动', 'select:horizontal,vertical,both,none'],
    ['side', '出口边', 'select:right,left,top,bottom'],
    ['pole', '磁极', 'select:N,S'],
    ['iceState', '冰状态', 'select:intact,cracked'],
    ['portalId', '门编号', 'text'],
    ['pairId', '配对门', 'text'],
    ['dir', '方向', 'select:right,left,up,down'],
    ['unlockTargetId', '开锁目标', 'text'],
    ['unlockedMoveDir', '解锁移动', 'select:horizontal,vertical,both,none'],
    ['rewardCoins', '金币值', 'number'],
  ].filter(([key]) => key in item || ['x', 'y', 'w', 'h'].includes(key));

  root.innerHTML = '';
  fields.forEach(([key, label, type]) => {
    if (key === 'id' && state.selected.kind !== 'block') return;
    if (key === 'side' && state.selected.kind !== 'exit') return;
    const row = document.createElement('div');
    row.className = 'field';
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    let input;
    if (type.startsWith('select:')) {
      input = document.createElement('select');
      type.slice(7).split(',').forEach((option) => {
        const el = document.createElement('option');
        el.value = option;
        el.textContent = option;
        input.appendChild(el);
      });
    } else {
      input = document.createElement('input');
      input.type = type;
    }
    input.value = item[key] ?? '';
    input.addEventListener('change', () => updateField(item, key, input.value, type));
    row.append(labelEl, input);
    root.appendChild(row);
  });

  if (state.selected.kind !== 'exit' && state.mode === 'edit') {
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'danger';
    del.textContent = '删除组件';
    del.addEventListener('click', deleteSelected);
    root.appendChild(del);
  }
}

function updateField(item, key, value, type) {
  if (type === 'number') item[key] = Number(value);
  else item[key] = value;
  if (state.selected?.kind === 'exit' && key === 'side') item.direction = value;
  if (state.selected?.kind === 'block' && key === 'id') state.selected.id = value;
  renderAll();
}

function deleteSelected() {
  if (!state.selected || state.mode !== 'edit') return;
  if (state.selected.kind === 'block') {
    const block = itemFromRef(state.selected);
    if (block?.type === 'target') return updateStats('目标块不能删除');
    state.current.blocks = state.current.blocks.filter((item) => item.id !== state.selected.id);
  }
  if (state.selected.kind === 'cell') state.current.specialCells.splice(state.selected.index, 1);
  state.selected = null;
  renderAll();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function saveLevel() {
  const response = await fetch(`/api/levels/${state.current.levelId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: cleanForSave(state.current) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '保存失败');
  state.levels[state.currentIndex] = cleanForSave(state.current);
  updateStats(`已保存第 ${state.current.levelId} 关`);
}

function cleanForSave(level) {
  const clean = clone(level);
  clean.specialCells.forEach((cell) => delete cell.collected);
  clean.blocks.forEach((block) => delete block.lastPortalId);
  return clean;
}

$('#playBtn').addEventListener('click', () => {
  state.mode = 'play';
  state.current = normalizeLevel(state.levels[state.currentIndex]);
  state.steps = 0;
  state.coins = 0;
  renderAll();
});

$('#editBtn').addEventListener('click', () => {
  state.mode = 'edit';
  renderAll();
});

$('#saveBtn').addEventListener('click', () => saveLevel().catch((error) => updateStats(error.message)));
$('#levelSearch').addEventListener('input', renderLevelList);

loadLevels().catch((error) => {
  $('#pathText').textContent = error.message;
  updateStats(error.message);
});
