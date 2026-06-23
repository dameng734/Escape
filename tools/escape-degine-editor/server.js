const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 5177);
const ESCAPE_ROOT = path.resolve(process.env.ESCAPE_ROOT || 'E:/codex/Escape');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ASSETS_DIR = path.join(ESCAPE_ROOT, 'assets');
const LEVELS_JSON = path.join(ESCAPE_ROOT, 'assets/data/levels.json');
const LEVELS_JS = path.join(ESCAPE_ROOT, 'assets/data/levels_data.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': MIME['.json'] });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function readLevels() {
  const raw = await fs.readFile(LEVELS_JSON, 'utf8');
  const levels = JSON.parse(raw);
  if (!Array.isArray(levels)) throw new Error('levels.json must contain an array');
  return levels;
}

async function writeLevels(levels) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await fs.copyFile(LEVELS_JSON, `${LEVELS_JSON}.bak-${stamp}`);
  await fs.copyFile(LEVELS_JS, `${LEVELS_JS}.bak-${stamp}`);
  await fs.writeFile(LEVELS_JSON, `${JSON.stringify(levels, null, 2)}\n`, 'utf8');
  await fs.writeFile(LEVELS_JS, `const LEVEL_DATA=${JSON.stringify(levels)};\nexport default LEVEL_DATA;\n`, 'utf8');
}

function summarizeComponents(levels) {
  const blockTypes = new Set();
  const specialTypes = new Set();
  const moveDirs = new Set();
  for (const level of levels) {
    for (const block of level.blocks || []) {
      if (block.type) blockTypes.add(block.type);
      if (block.moveDir) moveDirs.add(block.moveDir);
    }
    for (const cell of level.specialCells || []) {
      if (cell.type) specialTypes.add(cell.type);
    }
  }
  return {
    blockTypes: [...blockTypes].sort(),
    specialTypes: [...specialTypes].sort(),
    moveDirs: [...moveDirs].sort(),
  };
}

function validateLevel(level) {
  if (!level || typeof level !== 'object') throw new Error('Level payload is required');
  if (!Number.isFinite(Number(level.levelId))) throw new Error('levelId is required');
  if (!Number.isFinite(Number(level.width)) || !Number.isFinite(Number(level.height))) {
    throw new Error('width and height are required');
  }
  if (!Array.isArray(level.blocks)) throw new Error('blocks must be an array');
  if (!Array.isArray(level.specialCells)) level.specialCells = [];
  if (!level.exit || typeof level.exit !== 'object') throw new Error('exit is required');
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/levels') {
    const levels = await readLevels();
    return json(res, 200, {
      levels,
      paths: { root: ESCAPE_ROOT, levelsJson: LEVELS_JSON, levelsJs: LEVELS_JS },
      components: summarizeComponents(levels),
    });
  }

  const saveMatch = url.pathname.match(/^\/api\/levels\/(\d+)$/);
  if (req.method === 'POST' && saveMatch) {
    const levelId = Number(saveMatch[1]);
    const payload = await readBody(req);
    const incoming = payload.level;
    validateLevel(incoming);
    if (Number(incoming.levelId) !== levelId) throw new Error('URL levelId does not match payload');
    const levels = await readLevels();
    const index = levels.findIndex((level) => Number(level.levelId) === levelId);
    if (index < 0) throw new Error(`Level ${levelId} was not found`);
    levels[index] = incoming;
    await writeLevels(levels);
    return json(res, 200, { ok: true, savedLevelId: levelId, paths: { levelsJson: LEVELS_JSON, levelsJs: LEVELS_JS } });
  }

  return json(res, 404, { error: 'API route not found' });
}

async function serveStatic(req, res, url) {
  const requestPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const isAsset = requestPath.startsWith('/game-assets/');
  const rootDir = isAsset ? ASSETS_DIR : PUBLIC_DIR;
  const relativePath = isAsset ? requestPath.replace(/^\/game-assets\//, '/') : requestPath;
  const fullPath = path.normalize(path.join(rootDir, relativePath));
  if (!fullPath.startsWith(rootDir)) return send(res, 403, 'Forbidden');
  try {
    const data = await fs.readFile(fullPath);
    send(res, 200, data, { 'Content-Type': MIME[path.extname(fullPath)] || 'application/octet-stream' });
  } catch (error) {
    if (error.code === 'ENOENT') return send(res, 404, 'Not found');
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else await serveStatic(req, res, url);
  } catch (error) {
    json(res, 500, { error: error.message || String(error) });
  }
});

server.listen(PORT, () => {
  console.log(`Escape Degine editor running at http://localhost:${PORT}`);
  console.log(`Reading and saving levels under ${ESCAPE_ROOT}`);
});
