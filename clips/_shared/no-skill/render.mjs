// render.mjs <size dir> [check t1,t2,...]: frame-by-frame capture through window.__frameAt, piped to ffmpeg (or stills for a check)
const { chromium } = await import(process.env.PLAYWRIGHT_MJS || '/opt/node-tools/node_modules/playwright/index.mjs');
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path';
const dir = path.resolve(process.argv[2]), check = process.argv[3];
const tl = JSON.parse(fs.readFileSync(dir + '/timeline.json')); const W = tl.width, H = tl.height, fps = tl.fps || 30;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.m4a': 'audio/mp4' };
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(b); } }); }).listen(0);
const port = srv.address().port;
const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
pg.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await pg.goto(`http://127.0.0.1:${port}/index.html?capture`); await pg.evaluate(() => window.__ready);
const issues = await pg.evaluate(() => window.__issues); if (issues.length) console.error('ISSUES', issues.slice(0, 20));
if (check) {
  fs.mkdirSync(dir + '/check', { recursive: true });
  for (const t of check.split(',').map(Number)) { await pg.evaluate((t) => window.__frameAt(t), t); await pg.screenshot({ path: `${dir}/check/t${t.toFixed(1)}.png` }); }
} else {
  fs.mkdirSync(dir + '/out', { recursive: true });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', dir + '/audio.m4a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', `${dir}/out/${tl.slug}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(tl.duration * fps);
  for (let i = 0; i < N; i++) {
    await pg.evaluate((t) => window.__frameAt(t), i / fps);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(path.basename(dir), i, '/', N);
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
}
await br.close(); srv.close();
