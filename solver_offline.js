/**
 * 离线批量求解器 — 从第4关开始，BFS求最优解步数，输出到Excel
 * 只处理基本块（target / normal / fixed），纯BFS保证最优
 */
const fs = require('fs');
const ExcelJS = require('exceljs');

const levels = JSON.parse(fs.readFileSync('assets/data/levels.json', 'utf8'));

// ── 求解器核心 ──

function solve(level) {
  const W = level.width;
  const H = level.height;
  const exit = level.exit;
  const targetId = level.targetId;
  const area = W * H;

  // 收集可移动块，fixed块编入staticGrid
  const movable = [];
  const staticGrid = new Uint8Array(area);
  for (const b of level.blocks) {
    if (b.type === 'target' || (b.type === 'normal' && b.moveDir !== 'none')) {
      movable.push(b);
    } else {
      for (let dy = 0; dy < b.h; dy++)
        for (let dx = 0; dx < b.w; dx++)
          staticGrid[(b.x + dx) * H + (b.y + dy)] = 1;
    }
  }
  const n = movable.length;
  const ti = movable.findIndex((b) => b.id === targetId);
  if (ti < 0) return { solvable: false, steps: -1, reason: 'no target block' };

  const bw = new Uint8Array(n);
  const bh = new Uint8Array(n);
  const canH = new Uint8Array(n);
  const canV = new Uint8Array(n);
  const isT = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    bw[i] = movable[i].w;
    bh[i] = movable[i].h;
    const md = movable[i].moveDir;
    canH[i] = (md === 'horizontal' || md === 'both') ? 1 : 0;
    canV[i] = (md === 'vertical' || md === 'both') ? 1 : 0;
    isT[i] = movable[i].id === targetId ? 1 : 0;
  }

  const tw = bw[ti], th = bh[ti];

  // 状态编码：每块 x*H+y 拼成逗号分隔字符串
  const makeKey = (pos) => {
    const parts = [];
    for (let i = 0; i < n; i++) parts.push(pos[i * 2] * H + pos[i * 2 + 1]);
    return parts.join(',');
  };

  // 构建占位图
  const buildGrid = (pos) => {
    const g = new Uint8Array(staticGrid);
    for (let i = 0; i < n; i++) {
      const bx = pos[i * 2], by = pos[i * 2 + 1];
      for (let dy = 0; dy < bh[i]; dy++)
        for (let dx = 0; dx < bw[i]; dx++)
          g[(bx + dx) * H + (by + dy)] = i + 2;
    }
    return g;
  };

  // 检查目标是否到达出口
  const isGoal = (pos) => {
    const tx = pos[ti * 2], ty = pos[ti * 2 + 1];
    if (exit.side === 'right') return ty === exit.y && tx + tw > W - 1;
    if (exit.side === 'left') return ty === exit.y && tx < 0;
    if (exit.side === 'top') return tx === exit.x && ty < 0;
    return tx === exit.x && ty + th > H - 1;
  };

  // 生成所有合法移动：每个可移动块每个方向滑1格（单步BFS保证最优）
  const genMoves = (pos, grid) => {
    const moves = [];
    for (let i = 0; i < n; i++) {
      const bx = pos[i * 2], by = pos[i * 2 + 1];
      const w = bw[i], h = bh[i];
      const me = i + 2;

      // 左
      if (canH[i] && bx > 0) {
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++)
          for (let dx = 0; dx < w && ok; dx++)
            if (grid[(bx - 1 + dx) * H + (by + dy)] && grid[(bx - 1 + dx) * H + (by + dy)] !== me) ok = false;
        if (ok) moves.push({ bi: i, ddx: -1, ddy: 0, dir: 'L', amount: 1 });
      }
      // 右
      if (canH[i] && bx + w < W) {
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++)
          for (let dx = 0; dx < w && ok; dx++)
            if (grid[(bx + 1 + dx) * H + (by + dy)] && grid[(bx + 1 + dx) * H + (by + dy)] !== me) ok = false;
        if (ok) moves.push({ bi: i, ddx: 1, ddy: 0, dir: 'R', amount: 1 });
      }
      // 上
      if (canV[i] && by > 0) {
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++)
          for (let dx = 0; dx < w && ok; dx++)
            if (grid[(bx + dx) * H + (by - 1 + dy)] && grid[(bx + dx) * H + (by - 1 + dy)] !== me) ok = false;
        if (ok) moves.push({ bi: i, ddx: 0, ddy: -1, dir: 'U', amount: 1 });
      }
      // 下
      if (canV[i] && by + h < H) {
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++)
          for (let dx = 0; dx < w && ok; dx++)
            if (grid[(bx + dx) * H + (by + 1 + dy)] && grid[(bx + dx) * H + (by + 1 + dy)] !== me) ok = false;
        if (ok) moves.push({ bi: i, ddx: 0, ddy: 1, dir: 'D', amount: 1 });
      }

      // 目标块向出口方向允许滑出边界
      if (isT[i]) {
        if (exit.side === 'right' && canH[i] && by === exit.y && bx + w === W) {
          moves.push({ bi: i, ddx: 1, ddy: 0, dir: 'R', amount: 1 });
        } else if (exit.side === 'left' && canH[i] && by === exit.y && bx === 0) {
          moves.push({ bi: i, ddx: -1, ddy: 0, dir: 'L', amount: 1 });
        } else if (exit.side === 'top' && canV[i] && bx === exit.x && by === 0) {
          moves.push({ bi: i, ddx: 0, ddy: -1, dir: 'U', amount: 1 });
        } else if (exit.side === 'bottom' && canV[i] && bx === exit.x && by + h === H) {
          moves.push({ bi: i, ddx: 0, ddy: 1, dir: 'D', amount: 1 });
        }
      }
    }
    return moves;
  };

  // BFS
  const initPos = new Int16Array(n * 2);
  for (let i = 0; i < n; i++) {
    initPos[i * 2] = movable[i].x;
    initPos[i * 2 + 1] = movable[i].y;
  }

  if (isGoal(initPos)) return { solvable: true, steps: 0 };

  const initKey = makeKey(initPos);
  const visited = new Set([initKey]);
  const queue = [{ pos: initPos, depth: 0 }];
  let head = 0;
  const maxNodes = 2000000;
  let expanded = 0;

  while (head < queue.length && expanded < maxNodes) {
    const { pos, depth } = queue[head++];
    expanded++;
    const grid = buildGrid(pos);
    const moves = genMoves(pos, grid);

    for (const move of moves) {
      const newPos = pos.slice();
      newPos[move.bi * 2] += move.ddx;
      newPos[move.bi * 2 + 1] += move.ddy;
      const newKey = makeKey(newPos);
      if (visited.has(newKey)) continue;
      visited.add(newKey);

      if (isGoal(newPos)) {
        return { solvable: true, steps: depth + 1 };
      }

      queue.push({ pos: newPos, depth: depth + 1 });
    }
  }

  return { solvable: false, steps: -1, reason: expanded >= maxNodes ? 'search space too large' : 'no solution' };
}

// ── 批量求解并输出Excel ──

async function main() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('关卡求解');

  sheet.columns = [
    { header: '关卡ID', key: 'levelId', width: 15 },
    { header: '关卡序号', key: 'index', width: 10 },
    { header: '棋盘', key: 'board', width: 10 },
    { header: '块数', key: 'blocks', width: 8 },
    { header: '是否有解', key: 'solvable', width: 10 },
    { header: '最优步数', key: 'steps', width: 10 },
    { header: '设计步数', key: 'bestSteps', width: 10 },
    { header: '备注', key: 'note', width: 25 },
  ];

  // 从第4关(index=3)开始
  const startIdx = 3;
  let solved = 0, unsolved = 0;

  for (let i = startIdx; i < levels.length; i++) {
    const lv = levels[i];
    const idx = i + 1; // 关卡序号从1开始

    process.stdout.write(`\r求解第 ${idx} 关 (${lv.levelId}) ... `);

    let result;
    try {
      result = solve(lv);
    } catch (e) {
      result = { solvable: false, steps: -1, reason: e.message };
    }

    if (result.solvable) {
      solved++;
      process.stdout.write(`✓ ${result.steps}步`);
    } else {
      unsolved++;
      process.stdout.write(`✗ ${result.reason || ''}`);
    }

    let note = '';
    if (result.solvable && lv.bestSteps && result.steps !== lv.bestSteps) {
      note = `设计${lv.bestSteps}步 vs 实际${result.steps}步`;
    }
    if (!result.solvable) note = result.reason || '';

    sheet.addRow({
      levelId: lv.levelId,
      index: idx,
      board: `${lv.width}x${lv.height}`,
      blocks: lv.blocks.length,
      solvable: result.solvable ? '是' : '否',
      steps: result.solvable ? result.steps : '',
      bestSteps: lv.bestSteps || '',
      note,
    });
  }

  console.log(`\n完成！有解: ${solved}, 无解: ${unsolved}`);

  const outPath = 'level_solver_result.xlsx';
  await workbook.xlsx.writeFile(outPath);
  console.log(`已写入: ${outPath}`);
}

main().catch(console.error);
