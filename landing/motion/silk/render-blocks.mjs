// Renders a seamless looping "conveyor of wireframe sections" background (original artwork) to PNG frames.
// Usage: node render-blocks.mjs <wide|tall> <outDir> [frames]
import { chromium } from "playwright";
import fs from "node:fs";
const [, , kind, outDir, framesArg] = process.argv;
const FRAMES = +(framesArg || 360);
const size = kind === "tall" ? { w: 800, h: 1300 } : { w: 1920, h: 760 };
fs.mkdirSync(outDir, { recursive: true });
const html = `<!doctype html><body style="margin:0;background:#fff"><canvas id="c" width="${size.w}" height="${size.h}"></canvas><script>
const W=${size.w},H=${size.h},tall=${kind === "tall"};
const PAL=[['#f1f6d3','#dfe9a5'],['#e4eaff','#b9c6ff'],['#ffeadb','#ffc79d'],['#f3f3f0','#d9d9d3'],['#ffe3ee','#ffb8d3'],['#e9f1ff','#a9c4ff']];
const SEQ=[[300,0],[170,3],[420,1],[230,4],[360,2],[190,5],[280,0],[210,3],[400,1],[160,2]];
const GAP=26,RH=tall?150:132,RG=26;
const rows=[];for(let r=-8;r<=14;r++){rows.push({r,dir:(r%2?1:-1),off:(r*137)%900,sp:1})}
function rr(ctx,x,y,w,h,rad){ctx.beginPath();ctx.moveTo(x+rad,y);ctx.arcTo(x+w,y,x+w,y+h,rad);ctx.arcTo(x+w,y+h,x,y+h,rad);ctx.arcTo(x,y+h,x,y,rad);ctx.arcTo(x,y,x+w,y,rad);ctx.closePath()}
function block(ctx,x,y,w,h,pal,kindIdx){
  ctx.fillStyle=pal[0];rr(ctx,x,y,w,h,12);ctx.fill();
  ctx.fillStyle=pal[1];
  const m=16;
  if(kindIdx%3===0){ rr(ctx,x+m,y+m,w*.46,10,5);ctx.fill(); ctx.globalAlpha=.55; rr(ctx,x+m,y+m+22,w*.62,7,3.5);ctx.fill(); rr(ctx,x+m,y+m+38,w*.4,7,3.5);ctx.fill(); ctx.globalAlpha=1; rr(ctx,x+m,y+h-m-24,64,24,6);ctx.fill(); }
  else if(kindIdx%3===1){ const cw=(w-m*2-12)/3; for(let i=0;i<3;i++){ ctx.globalAlpha=.55; rr(ctx,x+m+i*(cw+6),y+m,cw,h-m*2,8);ctx.fill(); } ctx.globalAlpha=1; }
  else { ctx.globalAlpha=.7; ctx.beginPath();ctx.arc(x+m+14,y+m+14,14,0,6.3);ctx.fill(); ctx.globalAlpha=.55; rr(ctx,x+m+40,y+m+6,w*.4,8,4);ctx.fill(); rr(ctx,x+m+40,y+m+22,w*.28,7,3.5);ctx.fill(); rr(ctx,x+m,y+h-m-14,w-m*2,7,3.5);ctx.fill(); ctx.globalAlpha=1; }
}
function draw(p){
  const c=document.getElementById('c'),ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-9*Math.PI/180);ctx.transform(1,0,-.18,1,0,0);
  const P=SEQ.reduce((a,b)=>a+b[0]+GAP,0);
  for(const row of rows){
    const y=row.r*(RH+RG)-RH/2;
    let x=-W*1.2-((row.off+p*P*row.dir*(1+ (Math.abs(row.r)%3)*0))%P+P)%P;
    // shift by period so tiles cover width, loop period is exactly P*dir
    let i=Math.abs(row.r)%SEQ.length; let guard=0;
    x=-W*1.3-(((row.off - p*P*row.dir)%P)+P)%P;
    while(x<W*1.3&&guard++<80){const [w,pi]=SEQ[i%SEQ.length];block(ctx,x,y,w,RH,PAL[(pi+Math.abs(row.r))%PAL.length],i+Math.abs(row.r));x+=w+GAP;i++}
  }
  ctx.restore();
  // keep the headline area quiet, and melt into the white page at the edges
  let g=ctx.createRadialGradient(W/2,H*.46,H*.05,W/2,H*.46,tall?W*.95:W*.46);g.addColorStop(0,'rgba(255,255,255,.96)');g.addColorStop(.55,'rgba(255,255,255,.82)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createLinearGradient(0,H*.55,0,H);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'#fff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createLinearGradient(0,0,0,H*.14);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H*.14);
}
window.draw=draw;</script>`;
const b = await chromium.launch({ headless: true });
const pg = await b.newPage({ viewport: { width: size.w, height: size.h } });
await pg.setContent(html);
for (let f = 0; f < FRAMES; f++) {
  const url = await pg.evaluate((p) => { window.draw(p); return document.getElementById("c").toDataURL("image/png"); }, f / FRAMES);
  fs.writeFileSync(`${outDir}/f_${String(f).padStart(4, "0")}.png`, Buffer.from(url.split(",")[1], "base64"));
}
await b.close();
console.log("done", kind, FRAMES);
