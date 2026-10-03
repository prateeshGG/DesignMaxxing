// Sharp section capture for films and demos.
// node capture.mjs <name> <url> [width=1440] [height=900] [dpr=2] [mobile=0] [outDir=./capture]
// Writes <name>-motion-full.png (animations running), <name>-still-full.png (reduced motion, frozen)
// and <name>-rects.json (section boxes measured from the DOM). Crop with crop.py.
import { chromium } from "playwright";
import fs from "node:fs";
const [, , name, url, W = "1440", H = "900", DPR = "2", MOBILE = "0", OUT = "./capture"] = process.argv;
if (!name || !url) { console.error("usage: node capture.mjs <name> <url> [w h dpr mobile outDir]"); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
for (const mode of ["motion", "still"]) {
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: +DPR, isMobile: MOBILE === "1", hasTouch: MOBILE === "1", reducedMotion: mode === "still" ? "reduce" : "no-preference", locale: "en-US" });
  const pg = await ctx.newPage();
  await pg.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await pg.waitForTimeout(2000);
  const h = await pg.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await pg.evaluate((y) => window.scrollTo(0, y), y); await pg.waitForTimeout(220); }   // trigger lazy images and reveals
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(3000);                                          // let counters and reveals settle
  if (mode === "still") await pg.addStyleTag({ content: "*,*::before,*::after{animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}" });
  if (mode === "still") {
    const rects = await pg.evaluate(() => [...document.querySelectorAll("header, section, footer, main > div")].map((el) => { const r = el.getBoundingClientRect(); return { tag: el.tagName, y: Math.round(r.top + scrollY), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width), text: (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 70) }; }).filter((r) => r.h > 60 && r.w > innerWidth * 0.6));
    fs.writeFileSync(`${OUT}/${name}-rects.json`, JSON.stringify(rects, null, 1));
  }
  await pg.screenshot({ path: `${OUT}/${name}-${mode}-full.png`, fullPage: true, timeout: 120000 });
  await ctx.close();
}
await b.close();
console.log("captured", name);
