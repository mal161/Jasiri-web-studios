// Stops Jasiri dev servers: kills pid files + anything listening on 3000/4000.
// Usage: node scripts/stop.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

for (const f of ['api.pid', 'web.pid']) {
  try {
    const pid = Number(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
    if (pid) {
      process.kill(pid);
      console.log(`killed ${f} (pid ${pid})`);
    }
    fs.unlinkSync(path.join(__dirname, '..', f));
  } catch {
    // already gone
  }
}

try {
  const out = execSync('netstat -ano -p tcp', { stdio: 'pipe' }).toString();
  const pids = new Set();
  for (const line of out.split('\n')) {
    const m = line.match(/TCP\s+\S+:(3000|4000)\s+\S+\s+\S+\s+(\d+)/);
    if (m) pids.add(m[2]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
      console.log(`killed listener on port (pid ${pid})`);
    } catch {
      // already gone
    }
  }
} catch (e) {
  console.log('port sweep skipped: ' + e.message);
}
console.log('stopped');
