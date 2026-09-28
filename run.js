// Boots the Jasiri Platform locally: Express API (:4000) + Next.js web (:3000).
// Usage: node run.js
// Servers run detached with output in api.log / web.log. Stop with Ctrl+C in
// their terminals, or: node -e "process.kill(require('fs').readFileSync('api.pid','utf8'))"
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const API_PORT = process.env.PORT || 4000;
const WEB_PORT = process.env.WEB_PORT || 3000;

async function up(url) {
  try {
    const r = await fetch(url);
    return r.ok;
  } catch {
    return false;
  }
}

function start(name, cmd, args, logFile, opts = {}) {
  const log = fs.openSync(path.join(ROOT, logFile), 'a');
  const child = spawn(cmd, args, {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', log, log],
    shell: process.platform === 'win32',
    ...opts
  });
  child.unref();
  fs.writeFileSync(path.join(ROOT, `${name}.pid`), String(child.pid));
  console.log(`${name} starting (pid ${child.pid}, logs -> ${logFile})`);
}

async function waitFor(label, url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await up(url)) {
      console.log(`${label} UP -> ${url}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log(`${label} FAILED to respond at ${url} within ${timeoutMs / 1000}s`);
  return false;
}

(async () => {
  const apiUrl = `http://localhost:${API_PORT}/api/health`;
  const webUrl = `http://localhost:${WEB_PORT}/`;

  if (!(await up(apiUrl))) {
    start('api', 'node', ['apps/api/src/server.js'], 'api.log', { env: { ...process.env, PORT: String(API_PORT) } });
  } else {
    console.log('api already running');
  }

  if (!(await up(webUrl))) {
    start('web', 'npm', ['run', 'dev', '--workspace=apps/web', '--', '-p', String(WEB_PORT)], 'web.log');
  } else {
    console.log('web already running');
  }

  const apiOk = await waitFor('api', apiUrl, 60000);
  const webOk = await waitFor('web', webUrl, 180000);

  if (apiOk && webOk) {
    console.log('\nJasiri Platform running:\n  web -> ' + webUrl + '\n  api -> ' + apiUrl);
  } else {
    console.log('\nOne or more servers failed. Check api.log / web.log for details.');
    process.exitCode = 1;
  }
})();
