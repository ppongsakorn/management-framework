// node verify-live.mjs <env: '' | dev/ | stg/> <shot dir> slug=text …: per slug and per size (desktop 1280 / iPhone 13), the story text is on the page, the clip plays (size, length) and nothing overflows sideways.
import { chromium, devices } from '/opt/node-tools/node_modules/playwright/index.mjs';
const env = process.argv[2] ?? '', S = process.argv[3]; const B = 'https://ppongsakorn.github.io/management-framework/' + env;
const expect = Object.fromEntries(process.argv.slice(4).map((a) => a.split('='))), slugs = Object.keys(expect);
const br = await chromium.launch();
for (const s of slugs) for (const dev of ['desktop', 'phone']) {
  const p = dev === 'desktop' ? await br.newPage({ viewport: { width: 1280, height: 900 } }) : await br.newPage({ ...devices['iPhone 13'] });
  await p.goto(B + 'frameworks/' + s + '/?x=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const story = (await p.content()).includes(expect[s]);
  try { await p.locator('[class*=ideo] button, button[aria-label*="คลิป"], button[aria-label*="เล่น"]').first().click({ timeout: 5000 }); } catch {}
  await p.waitForTimeout(4000);
  const v = await p.evaluate(() => { const v = document.querySelector('video'); return v ? { src: v.currentSrc.split('/').pop(), t: +v.currentTime.toFixed(1), dur: Math.round(v.duration), w: v.videoWidth, h: v.videoHeight, err: v.error && v.error.code } : null; });
  console.log(s, dev, 'story:', story, 'video:', JSON.stringify(v), 'overflow:', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await p.screenshot({ path: `${S}/v3-${s}-${dev}.png` }); await p.close();
}
await br.close();
