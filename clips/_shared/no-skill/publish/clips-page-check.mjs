// node clips-page-check.mjs <site base url> <shot dir>: /clips and /mobile/clips at 1280 (light, dark), 360 and iPhone 13: items, posters loaded, overflow, phone tabs, video requests (must be 0).
const { chromium, devices } = await import(process.env.PLAYWRIGHT_MJS || '/opt/node-tools/node_modules/playwright/index.mjs');
const B = process.argv[2], S = process.argv[3]; const br = await chromium.launch();
for (const [name, opt, path] of [['desktop', { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 }, 'clips/'], ['desktop-dark', { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }, 'clips/'], ['phone360', { viewport: { width: 360, height: 760 }, isMobile: true, hasTouch: true }, 'mobile/clips/'], ['iphone', devices['iPhone 13'], 'mobile/clips/']]) {
  const p = await br.newPage(opt); const bad = []; p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().split('/').slice(-2).join('/')); });
  await p.goto(B + path, { waitUntil: 'networkidle' });
  for (let y = 0; y < 6000; y += 600) { await p.mouse.wheel(0, 600); await p.waitForTimeout(80); }
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ url: location.pathname, items: document.querySelectorAll('.clips li').length, imgs: [...document.querySelectorAll('.clips img')].filter((i) => i.complete && i.naturalWidth > 0).length, overflow: document.documentElement.scrollWidth - innerWidth, tabs: [...document.querySelectorAll('.m-tab')].map((t) => t.textContent.trim()), tabOverflow: (() => { const n = document.querySelector('.m-tabs'); return n ? n.scrollWidth - n.clientWidth : null; })(), nav: [...document.querySelectorAll('.nav a')].map((a) => a.textContent.trim()), first: document.querySelector('.clip')?.getAttribute('href'), videos: performance.getEntriesByType('resource').filter((e) => /\.webm/.test(e.name)).length }));
  console.log(name, JSON.stringify(r), bad.slice(0, 3).join(' '));
  await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `${S}/clips-${name}.png` }); await p.close();
}
await br.close();
