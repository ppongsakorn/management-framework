// Diagram renderer: turns a small JSON spec into a static SVG string.
// Colours come from CSS custom properties (--c, --cbg, --ink, --ink2, --line,
// --paper) so the same SVG follows the page's group colour and light/dark theme.
// Text fields accept "|" as a line break.
/* eslint-disable */
var W=640;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
// An English term in parentheses — "บล็อกเวลาไว้ (Time Boxing)" or a line of its
// own "(Time Boxing)" — is set smaller and lighter than the Thai it explains.
var EN_LINE=/^\(\d*[A-Za-z][^()]*\)$/,EN_TAIL=/^(.*\S)\s+(\(\d*[A-Za-z][^()]*\))$/;
function en(t,fs){return '<tspan font-size="'+(fs*0.82).toFixed(1)+'" font-weight="400" opacity=".85">'+esc(t)+'</tspan>';}
function line(l,fs){var m;if(EN_LINE.test(l))return en(l,fs);if((m=EN_TAIL.exec(l)))return esc(m[1])+' '+en(m[2],fs);return esc(l);}
function tx(x,y,s,o){o=o||{};var lines=String(s).split('|'),fs=o.fs||13,lh=fs*1.35;
  var y0=o.top?y:y-(lines.length-1)*lh/2;var a=o.a||'middle';var out='<text x="'+x+'" y="'+y0+'" text-anchor="'+a+'" font-size="'+fs+'" fill="'+(o.c||'var(--ink)')+'"'+(o.w?' font-weight="'+o.w+'"':'')+(o.op?' opacity="'+o.op+'"':'')+'>';
  lines.forEach(function(l,i){out+='<tspan x="'+x+'" dy="'+(i?(EN_LINE.test(l)?fs*1.2:lh):0)+'">'+line(l,fs)+'</tspan>';});return out+'</text>';}
function nl(s){return String(s).split('|').length;}
function box(x,y,w,h,o){o=o||{};return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(o.r==null?8:o.r)+'" fill="'+(o.f||'var(--paper)')+'" stroke="'+(o.s||'var(--line)')+'" stroke-width="'+(o.sw||1.2)+'"'+(o.d?' stroke-dasharray="'+o.d+'"':'')+'/>';}
function arrow(x1,y1,x2,y2,o){o=o||{};return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(o.c||'var(--ink2)')+'" stroke-width="'+(o.w||1.6)+'" marker-end="url(#ah)"'+(o.d?' stroke-dasharray="'+o.d+'"':'')+'/>';}
function svg(h,body){return '<svg viewBox="0 0 '+W+' '+h+'" xmlns="http://www.w3.org/2000/svg" font-family="inherit"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--ink2)"/></marker></defs>'+body+'</svg>';}

var T={};
T.matrix=function(d){var H=380,L=110,Tp=40,gw=(W-L-30)/2,gh=(H-Tp-70)/2;var o='';
  var q=d.q;var pos=[[L,Tp],[L+gw,Tp],[L,Tp+gh],[L+gw,Tp+gh]];
  q.forEach(function(c,i){var x=pos[i][0],y=pos[i][1];o+=box(x+3,y+3,gw-6,gh-6,{f:c.hl?'var(--cbg)':'var(--paper)',s:c.hl?'var(--c)':'var(--line)',sw:c.hl?2:1.2});
    o+=tx(x+gw/2,y+22,c.t,{fs:14,w:600,c:'var(--c)',top:1});if(c.e)o+=tx(x+gw/2,y+gh/2+12,c.e,{fs:12,c:'var(--ink2)'});});
  o+=tx(L+gw/2,H-40,d.xl[0],{fs:12,c:'var(--ink2)'})+tx(L+gw*1.5,H-40,d.xl[1],{fs:12,c:'var(--ink2)'});
  o+=tx(L+gw,H-18,d.x,{fs:13,w:600});
  o+='<g transform="translate('+(L-22)+','+(Tp+gh/2)+') rotate(-90)">'+tx(0,0,d.yl[1],{fs:12,c:'var(--ink2)'})+'</g>';
  o+='<g transform="translate('+(L-22)+','+(Tp+gh*1.5)+') rotate(-90)">'+tx(0,0,d.yl[0],{fs:12,c:'var(--ink2)'})+'</g>';
  o+='<g transform="translate(30,'+(Tp+gh)+') rotate(-90)">'+tx(0,0,d.y,{fs:13,w:600})+'</g>';
  return svg(H,o);};
T.flow=function(d){var n=d.items.length,rows=n>4?2:1,per=Math.ceil(n/rows),H=rows*120+(d.note?40:20)+20;var gap=14,bw=(W-40-gap*(per-1))/per,bh=84;var o='';
  d.items.forEach(function(it,i){var r=Math.floor(i/per),c=i%per;if(d.rev)c=per-1-c;var x=20+c*(bw+gap),y=20+r*120;
    o+=box(x,y,bw,bh,{f:it.hl?'var(--cbg)':'var(--paper)',s:it.hl?'var(--c)':'var(--line)',sw:it.hl?2:1.2});
    o+=tx(x+bw/2,y+22,it.t,{fs:13,w:600,c:'var(--c)',top:1});if(it.e)o+=tx(x+bw/2,y+54+(nl(it.t)-1)*9,it.e,{fs:11.5,c:'var(--ink2)'});
    var last=(i%per===per-1)||i===n-1;
    if(!last){var dir=d.rev?-1:1;o+=arrow(x+(dir>0?bw+1:-1),y+bh/2,x+(dir>0?bw+gap-1:-gap+1),y+bh/2);}
    else if(rows>1&&i<n-1){o+=arrow(x+bw/2,y+bh+2,x+bw/2,y+bh+22);}
  });
  if(d.loop&&rows===1){var lx0=20+bw/2,lx1=20+(n-1)*(bw+gap)+bw/2,ly=20+bh+18;o+='<path d="M'+lx1+' '+(20+bh+2)+' V'+ly+' H'+lx0+' V'+(20+bh+4)+'" fill="none" stroke="var(--c)" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#ah)"/>';}
  if(d.note)o+=tx(W/2,H-24,d.note,{fs:12,c:'var(--ink2)'});
  return svg(H,o);};
T.cycle=function(d){var H=420,cx=W/2,cy=H/2,R=112,n=d.items.length,o='';
  o+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--c)" stroke-width="2" stroke-dasharray="6 5" opacity=".5"/>';
  d.items.forEach(function(it,i){var a=-Math.PI/2+i*2*Math.PI/n,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);
    var a2=a+Math.PI/n;o+='<path d="M'+(cx+R*Math.cos(a2-0.12))+' '+(cy+R*Math.sin(a2-0.12))+' L'+(cx+R*Math.cos(a2))+' '+(cy+R*Math.sin(a2))+'" stroke="var(--c)" stroke-width="2" marker-end="url(#ah)"/>';
    o+='<circle cx="'+x+'" cy="'+y+'" r="34" fill="var(--cbg)" stroke="var(--c)" stroke-width="2"/>';o+=tx(x,y+5,it.t,{fs:13,w:600,c:'var(--c)'});
    if(it.e){var ex=cx+(R+92)*Math.cos(a),ey=cy+(R+70)*Math.sin(a);o+=tx(Math.max(70,Math.min(W-70,ex)),ey+4,it.e,{fs:11.5,c:'var(--ink2)'});}});
  if(d.center)o+=tx(cx,cy+4,d.center,{fs:12,c:'var(--ink2)'});
  return svg(H,o);};
T.fishbone=function(d){var H=360,o='',hx=W-150,hy=H/2;
  o+='<line x1="30" y1="'+hy+'" x2="'+(hx-5)+'" y2="'+hy+'" stroke="var(--ink2)" stroke-width="2.5" marker-end="url(#ah)"/>';
  o+=box(hx,hy-36,140,72,{f:'var(--cbg)',s:'var(--c)',sw:2})+tx(hx+70,hy+4,d.head,{fs:12.5,w:600,c:'var(--c)'});
  d.bones.forEach(function(b,i){var col=i%3,top=i<3,bx=110+col*175,by=top?hy-120:hy+120;var jx=bx+60;
    o+='<line x1="'+bx+'" y1="'+by+'" x2="'+jx+'" y2="'+hy+'" stroke="var(--c)" stroke-width="1.8"/>';
    o+=tx(bx,top?by-40:by+52,b.t,{fs:13,w:600,c:'var(--c)'});
    b.items.forEach(function(it,j){var f=(j+1)/(b.items.length+1),x=bx+(jx-bx)*f,y=by+(hy-by)*f;o+='<line x1="'+(x-56)+'" y1="'+y+'" x2="'+x+'" y2="'+y+'" stroke="var(--line)" stroke-width="1.2"/>';o+=tx(x-58,y+4,it,{fs:11,a:'end',c:'var(--ink2)'});});});
  return svg(H,o);};
T.stack=function(d){var n=d.layers.length,lh=58,H=n*lh+40,o='';
  d.layers.forEach(function(l,i){var y=20+i*lh,f=d.shape==='pyramid'?0.35+0.65*(i/(n-1||1)):1,w=(W-160)*f,x=80+((W-160)-w)/2;
    if(d.shape==='iceberg'&&i===1)o+='<line x1="40" y1="'+(y-4)+'" x2="'+(W-40)+'" y2="'+(y-4)+'" stroke="var(--c)" stroke-width="1.5" stroke-dasharray="6 4"/>'+tx(W-44,y-10,'ผิวน้ำ',{fs:11,a:'end',c:'var(--c)'});
    o+=box(x,y,w,lh-8,{f:l.hl?'var(--cbg)':'var(--paper)',s:l.hl?'var(--c)':'var(--line)',sw:l.hl?2:1.2,r:d.shape==='pyramid'?4:8});
    o+=tx(x+16,y+(lh-8)/2+4,l.t,{fs:13,w:600,a:'start',c:'var(--c)'});if(l.e)o+=tx(x+w-16,y+(lh-8)/2+4,l.e,{fs:11.5,a:'end',c:'var(--ink2)'});});
  if(d.side)o+='<g transform="translate(24,'+(H/2)+') rotate(-90)">'+tx(0,0,d.side,{fs:12,c:'var(--ink2)'})+'</g>';
  return svg(H,o);};
T.pareto=function(d){var H=330,L=56,R=40,B=H-72,T0=36,n=d.items.length,tot=0;d.items.forEach(function(i){tot+=i.v;});
  var gap=10,bw=(W-L-R-gap*(n-1))/n,sc=function(p){return B-(B-T0)*p;},cum=0,pts=[],cut=null,o='';
  [0,0.5,1].forEach(function(p){o+='<line x1="'+L+'" y1="'+sc(p)+'" x2="'+(W-R)+'" y2="'+sc(p)+'" stroke="var(--line)" stroke-width="1"/>'+tx(L-8,sc(p)+4,Math.round(p*100)+'%',{fs:10.5,a:'end',c:'var(--ink2)'});});
  d.items.forEach(function(it,i){var over=cut===null;cum+=it.v;var x=L+i*(bw+gap),y=sc(it.v/tot);
    o+=box(x,y,bw,B-y,{f:over?'var(--c)':'var(--line)',s:'none',r:3});o+=tx(x+bw/2,y-7,it.v+'%',{fs:11,w:600,c:over?'var(--c)':'var(--ink2)'});
    o+=tx(x+bw/2,B+18+(String(it.t).split('|').length-1)*7.5,it.t,{fs:11,c:'var(--ink2)'});pts.push([x+bw/2,sc(cum/tot)]);if(cut===null&&cum/tot>=0.8)cut=i;});
  o+='<line x1="'+L+'" y1="'+sc(0.8)+'" x2="'+(W-R)+'" y2="'+sc(0.8)+'" stroke="var(--c)" stroke-width="1" stroke-dasharray="4 4"/>'+tx(W-R,sc(0.8)-6,'80%',{fs:11,a:'end',w:600,c:'var(--c)'});
  o+='<polyline points="'+pts.map(function(p){return p.join(',');}).join(' ')+'" fill="none" stroke="var(--ink)" stroke-width="1.6"/>';
  pts.forEach(function(p){o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.4"/>';});
  if(d.note)o+=tx(W/2,H-16,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};
T.lanes=function(d){var n=d.lanes.length,gap=12,lw=(W-40-gap*(n-1))/n,mx=0;d.lanes.forEach(function(l){mx=Math.max(mx,l.items.length);});var H=70+mx*44+(d.note?30:10),o='';
  d.lanes.forEach(function(l,i){var x=20+i*(lw+gap);o+=box(x,16,lw,H-30-(d.note?20:0),{f:l.hl?'var(--cbg)':'var(--bg)',s:l.hl?'var(--c)':'var(--line)',sw:l.hl?2:1,d:l.hl?'':''});
    o+=tx(x+lw/2,40,l.t,{fs:13,w:600,c:'var(--c)'});if(l.sub)o+=tx(x+lw/2,56,l.sub,{fs:11,c:'var(--ink2)'});
    l.items.forEach(function(it,j){var y=68+j*44;o+=box(x+8,y,lw-16,36,{f:'var(--paper)',r:6});o+=tx(x+lw/2,y+22,it,{fs:11.5});});});
  if(d.note)o+=tx(W/2,H-10,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};
T.radial=function(d){var n=d.spokes.length,two=d.spokes.some(function(s){return nl(s.t)>1;}),H=two?470:420,cx=W/2,cy=H/2,R=two?172:148,bw=150,o='';
  d.spokes.forEach(function(s,i){var a=-Math.PI/2+i*2*Math.PI/n,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a);
    var el=s.e?nl(s.e):0,tl=(nl(s.t)-1)*13,bh=30+el*15+tl;
    o+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="var(--line)" stroke-width="1.5"/>';
    o+=box(x-bw/2,y-bh/2,bw,bh,{f:s.hl?'var(--cbg)':'var(--paper)',s:s.hl?'var(--c)':'var(--line)',sw:s.hl?2:1.2});
    o+=tx(x,y-bh/2+20,s.t,{fs:12.5,w:600,c:'var(--c)',top:1});if(s.e)o+=tx(x,y-bh/2+24+tl+el*7.5+6,s.e,{fs:11,c:'var(--ink2)'});});
  o+='<circle cx="'+cx+'" cy="'+cy+'" r="54" fill="var(--cbg)" stroke="var(--c)" stroke-width="2"/>'+tx(cx,cy+4,d.center,{fs:12.5,w:600,c:'var(--c)'});
  return svg(H,o);};
T.table=function(d){var cols=d.cols.length,rows=d.rows.length,cw=(W-40)/cols,rh=36,H=30+rh*(rows+1)+(d.note?34:10),o='';
  d.cols.forEach(function(c,i){o+=box(20+i*cw,20,cw,rh,{f:'var(--cbg)',s:'var(--line)',r:0});o+=tx(20+i*cw+cw/2,42,c,{fs:12.5,w:600,c:'var(--c)'});});
  d.rows.forEach(function(r,j){r.forEach(function(v,i){var hl=d.hl&&d.hl[0]===j&&(d.hl[1]===i||d.hl[1]==null);o+=box(20+i*cw,20+rh*(j+1),cw,rh,{f:hl?'var(--cbg)':'var(--paper)',s:'var(--line)',r:0,sw:1});o+=tx(20+i*cw+cw/2,20+rh*(j+1)+22,v,{fs:12,w:hl?600:400,c:hl?'var(--c)':'var(--ink)'});});});
  if(d.note)o+=tx(W/2,H-12,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};
T.tree=function(d){var H=300,o='';var rx=W/2,ry=44;o+=box(rx-140,ry-24,280,48,{f:'var(--cbg)',s:'var(--c)',sw:2})+tx(rx,ry+5,d.q,{fs:13,w:600,c:'var(--c)'});
  var br=[d.yes,d.no];br.forEach(function(b,i){var bx=i?W*0.72:W*0.28,by=150;o+=arrow(rx+(i?60:-60),ry+25,bx,by-28);o+=tx((rx+bx)/2+(i?18:-18),by-42,b.l,{fs:12,w:600,c:'var(--ink2)'});
    o+=box(bx-130,by-26,260,52,{f:b.hl?'var(--cbg)':'var(--paper)',s:b.hl?'var(--c)':'var(--line)',sw:b.hl?2:1.2})+tx(bx,by+4,b.t,{fs:12.5,w:600});
    if(b.e){o+=arrow(bx,by+27,bx,by+70);o+=box(bx-130,by+72,260,52,{f:'var(--bg)',s:'var(--line)'})+tx(bx,by+102,b.e,{fs:11.5,c:'var(--ink2)'});}});
  return svg(H,o);};
T.split=function(d){var mx=Math.max(d.left.items.length,d.right.items.length),H=90+mx*34+(d.note?30:0),lw=(W-60)/2,o='';
  [d.left,d.right].forEach(function(s,i){var x=20+i*(lw+20);o+=box(x,16,lw,H-30-(d.note?24:0),{f:s.hl?'var(--cbg)':'var(--bg)',s:s.hl?'var(--c)':'var(--line)',sw:s.hl?2:1});
    o+=tx(x+lw/2,42,s.t,{fs:13.5,w:600,c:'var(--c)'});if(s.sub)o+=tx(x+lw/2,60,s.sub,{fs:11,c:'var(--ink2)'});
    s.items.forEach(function(it,j){var y=78+j*34;o+='<circle cx="'+(x+22)+'" cy="'+(y+6)+'" r="3.5" fill="var(--c)"/>';o+=tx(x+34,y+10,it,{fs:12,a:'start'});});});
  if(d.mid)o+='<g>'+box(W/2-16,H/2-30,32,32,{f:'var(--paper)',s:'var(--c)',r:16})+tx(W/2,H/2-9,d.mid,{fs:12,w:600,c:'var(--c)'})+'</g>';
  if(d.note)o+=tx(W/2,H-10,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};
T.rings=function(d){var n=d.rings.length,H=320,cx=170,cy=H/2,o='';
  for(var i=n-1;i>=0;i--){var r=48+i*44;o+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+(i===0?'var(--cbg)':'var(--paper)')+'" stroke="'+(i===0?'var(--c)':'var(--line)')+'" stroke-width="'+(i===0?2:1.2)+'"/>';
    o+=tx(cx,i===0?cy+5:cy-r+20,d.rings[i].t,{fs:12.5,w:600,c:i===0?'var(--c)':'var(--ink2)'});}
  var lx=350,rh=64,y0=cy-(n*rh)/2;
  d.rings.forEach(function(r,i){var y=y0+i*rh;
    o+='<circle cx="'+lx+'" cy="'+(y+16)+'" r="6" fill="'+(i===0?'var(--c)':'var(--paper)')+'" stroke="'+(i===0?'var(--c)':'var(--ink2)')+'" stroke-width="1.5"/>';
    o+=tx(lx+16,y+20,r.t,{fs:13,w:600,a:'start',c:i===0?'var(--c)':'var(--ink)'});if(r.e)o+=tx(lx+16,y+40,r.e,{fs:11.5,a:'start',c:'var(--ink2)'});});
  return svg(H,o);};
T.bars2=function(d){var n=d.items.length,H=300,L=40,B=H-60,gw=(W-L-30)/n,mx=0;d.items.forEach(function(i){mx=Math.max(mx,i.a,i.b);});var o='';
  d.items.forEach(function(it,i){var x=L+i*gw+gw*0.15,bw=gw*0.3;[it.a,it.b].forEach(function(v,k){var h=(B-50)*v/mx,y=B-h,xx=x+k*(bw+6);o+=box(xx,y,bw,h,{f:k?'var(--c)':'var(--line)',s:'none',r:3});o+=tx(xx+bw/2,y-6,it.f?it.f(v):v,{fs:11,w:600,c:k?'var(--c)':'var(--ink2)'});});
    o+=tx(x+bw+3,B+18,it.t,{fs:11.5,c:'var(--ink2)'});});
  o+='<rect x="'+L+'" y="'+(H-22)+'" width="12" height="12" fill="var(--line)"/>'+tx(L+18,H-12,d.la,{fs:11.5,a:'start',c:'var(--ink2)'});
  o+='<rect x="'+(L+150)+'" y="'+(H-22)+'" width="12" height="12" fill="var(--c)"/>'+tx(L+168,H-12,d.lb,{fs:11.5,a:'start',c:'var(--ink2)'});
  if(d.note)o+=tx(W-20,H-12,d.note,{fs:12,a:'end',c:'var(--ink)'});return svg(H,o);};
T.timeline=function(d){var n=d.points.length,H=210,y=100,o='';o+='<line x1="30" y1="'+y+'" x2="'+(W-30)+'" y2="'+y+'" stroke="var(--line)" stroke-width="2"/>';
  d.points.forEach(function(p,i){var x=60+i*(W-120)/(n-1||1);o+='<circle cx="'+x+'" cy="'+y+'" r="'+(p.hl?11:8)+'" fill="'+(p.hl?'var(--c)':'var(--paper)')+'" stroke="var(--c)" stroke-width="2"/>';
    o+=tx(x,y-30,p.t,{fs:12.5,w:600,c:'var(--c)'});if(p.e)o+=tx(x,y+40,p.e,{fs:11.5,c:'var(--ink2)'});});
  if(d.note)o+=tx(W/2,H-14,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};
T.gantt=function(d){var n=d.tasks.length,rh=34,H=60+n*rh,L=150,scale=(W-L-40)/d.total,o='';
  d.tasks.forEach(function(t,i){var y=30+i*rh;o+=tx(L-10,y+22,t.t,{fs:12,a:'end',c:t.cp?'var(--c)':'var(--ink2)',w:t.cp?600:400});o+=box(L+t.s*scale,y+6,t.d*scale,24,{f:t.cp?'var(--c)':'var(--line)',s:'none',r:4});o+=tx(L+t.s*scale+t.d*scale/2,y+22,t.d+' วัน',{fs:11,c:t.cp?'#fff':'var(--ink)',w:600});});
  for(var k=0;k<=d.total;k+=5){var x=L+k*scale;o+='<line x1="'+x+'" y1="24" x2="'+x+'" y2="'+(H-24)+'" stroke="var(--line)" stroke-dasharray="2 4"/>';o+=tx(x,H-8,'วัน '+k,{fs:10,c:'var(--ink2)'});}
  o+=tx(W-20,16,d.note,{fs:12,a:'end',c:'var(--c)',w:600});return svg(H,o);};
T.hier=function(d){var H=260,o='',rx=W/2;o+=box(rx-190,20,380,52,{f:'var(--cbg)',s:'var(--c)',sw:2})+tx(rx,40,d.root.t,{fs:13,w:600,c:'var(--c)'})+tx(rx,58,d.root.e,{fs:11.5,c:'var(--ink2)'});
  var n=d.kids.length,kw=(W-40-12*(n-1))/n;d.kids.forEach(function(k,i){var x=20+i*(kw+12),y=120;o+='<path d="M'+rx+' 72 L'+rx+' 96 L'+(x+kw/2)+' 96 L'+(x+kw/2)+' '+y+'" fill="none" stroke="var(--ink2)" stroke-width="1.4" marker-end="url(#ah)"/>';
    o+=box(x,y,kw,100,{})+tx(x+kw/2,y+22,k.t,{fs:12.5,w:600,c:'var(--c)'})+tx(x+kw/2,y+58,k.e,{fs:11.5,c:'var(--ink2)'});});
  if(d.note)o+=tx(W/2,H-12,d.note,{fs:12,c:'var(--ink2)'});return svg(H,o);};


export const DIAGRAM_TYPES = Object.keys(T);

export function renderDiagram(type, spec) {
  if (!T[type]) throw new Error(`unknown diagram type: ${type}`);
  return T[type](spec);
}
