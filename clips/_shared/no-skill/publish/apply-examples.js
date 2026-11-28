// node apply-examples.js <file.json>: per slug, rewrite example as exampleSteps (+ the flattened example) and replace how/steps/origin/diagram when given. Run in the site repo root.
const fs=require('fs');const p='data/frameworks.json',raw=fs.readFileSync(p,'utf8'),d=JSON.parse(raw);
const upd=require(require('path').resolve(process.argv[2]));
const flat=(st)=>st.map((s)=>`${s.q?s.q+' ':''}${s.k?s.k+': ':''}${s.t}${s.note?` (${s.note})`:''}`).join(' → ');
for(const [slug,u] of Object.entries(upd)){const i=d.frameworks.findIndex(f=>f.slug===slug);if(i<0)throw new Error(slug);
 const f=d.frameworks[i],o={};
 for(const k of Object.keys(f)){if(k==='exampleSteps')continue;o[k]=f[k];if(k==='example'){o.example=flat(u.exampleSteps);o.exampleSteps=u.exampleSteps;}}
 for(const k of ['how','steps','origin','diagram'])if(u[k])o[k]=u[k];
 d.frameworks[i]=o;}
fs.writeFileSync(p,JSON.stringify(d,null,2)+(raw.endsWith('\n')?'\n':''));console.log('ok');
