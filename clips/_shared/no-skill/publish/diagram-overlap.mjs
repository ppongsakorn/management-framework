// node diagram-overlap.mjs <out.png> <slug>: render one diagram from data/diagrams.json with the real font and count overlapping texts (run npm run data first).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data/diagrams.json','utf8')); const svg = d[process.argv[3]]?.svg ?? d[process.argv[3]];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:760,height:700}});
await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600&display=swap" rel="stylesheet"><style>body{font-family:'IBM Plex Sans Thai',sans-serif;--paper:#fff;--line:#ccc;--ink:#222;--ink2:#555;--c:#7c3aed;--cbg:#f3e8ff}</style><div style="width:720px">${typeof svg==='string'?svg:JSON.stringify(svg).slice(0,200)}</div>`);
await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const t=[...document.querySelectorAll('svg text')].map(e=>e.getBoundingClientRect());let n=0;for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++){const a=t[i],c=t[j];if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom)n++;}return 'texts '+t.length+' overlaps '+n}));
await p.locator('div').screenshot({path:process.argv[2]}); await b.close();
