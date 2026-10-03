// Renders a seamless looping silk-line background to PNG frames (then encoded with ffmpeg).
// Usage: node render.mjs <wide|tall> <outDir>
import { chromium } from "playwright";
import fs from "node:fs";
const [, , kind, outDir] = process.argv;
const FRAMES = 360;
const size = kind === "tall" ? { w: 800, h: 1300 } : { w: 1920, h: 760 };
fs.mkdirSync(outDir, { recursive: true });
const html = `<!doctype html><body style="margin:0;background:#fff"><canvas id="c" width="${size.w}" height="${size.h}"></canvas><script>
const STOPS=[[220,243,107],[255,157,61],[255,111,177],[47,85,255]];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), lerp=(a,b,t)=>a+(b-a)*t;
function col(u,a){const s=clamp(u,0,.999)*(STOPS.length-1),i=Math.floor(s),f=s-i,A=STOPS[i],B=STOPS[i+1];return 'rgba('+Math.round(lerp(A[0],B[0],f))+','+Math.round(lerp(A[1],B[1],f))+','+Math.round(lerp(A[2],B[2],f))+','+a+')'}
const W=${size.w},H=${size.h},tall=${kind === "tall"};
const cfg=tall?{n:70,x0:1.15,y0:-.02,x1:-.2,y1:1.02,wid:.62,lw:1.3,a:.5}:{n:130,x0:1.06,y0:-.1,x1:-.08,y1:1.1,wid:.5,lw:1.2,a:.5};
function draw(th){
  const c=document.getElementById('c'),ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  const M=90,m=Math.min(W,H),dx=cfg.x1-cfg.x0,dy=cfg.y1-cfg.y0,L=Math.hypot(dx*W,dy*H),nx=-(dy*H)/L,ny=(dx*W)/L;
  ctx.lineWidth=cfg.lw;
  for(let i=0;i<cfg.n;i++){const u=i/(cfg.n-1);ctx.beginPath();
    for(let j=0;j<=M;j++){const s=j/M;
      const cx=W*(cfg.x0+dx*s)+Math.sin(s*5.2+th)*W*.05;
      const cy=H*(cfg.y0+dy*s)+Math.cos(s*4.1+th)*H*.1;
      const wf=cfg.wid*(.25+.75*Math.pow(Math.abs(Math.sin(s*Math.PI*1.35+th+.6)),1.3));
      const off=(u-.5)*wf*m+Math.sin(u*6.2+s*9+2*th)*3;
      const px=cx+nx*off,py=cy+ny*off; j?ctx.lineTo(px,py):ctx.moveTo(px,py);}
    ctx.strokeStyle=col(u,cfg.a);ctx.stroke();}
  // fade to white at the edges so the video melts into the page
  let g=ctx.createLinearGradient(0,H*.62,0,H);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'#fff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  g=ctx.createLinearGradient(0,0,W*.12,0);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W*.12,H);
  g=ctx.createLinearGradient(W,0,W*.9,0);g.addColorStop(0,'rgba(255,255,255,.0)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(W*.9,0,W*.1,H);
}
window.draw=draw;</script>`;
const b = await chromium.launch({ headless: true });
const pg = await b.newPage({ viewport: { width: size.w, height: size.h } });
await pg.setContent(html);
for (let f = 0; f < FRAMES; f++) {
  const url = await pg.evaluate((th) => { window.draw(th); return document.getElementById("c").toDataURL("image/png"); }, (2 * Math.PI * f) / FRAMES);
  fs.writeFileSync(`${outDir}/f_${String(f).padStart(4, "0")}.png`, Buffer.from(url.split(",")[1], "base64"));
}
await b.close();
console.log("done", kind);
