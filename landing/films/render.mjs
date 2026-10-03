// Renders a film to stills (storyboard) or to an MP4.
// node render.mjs <film> stills 0,2.5,6     -> out/<film>-<t>.png
// node render.mjs <film> video [fps]          -> out/<film>.mp4 (H.264) and out/<film>.webm (VP9)
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const [, , film, mode = "stills", arg, variant = ""] = process.argv;
const out = path.join(here, "out"); fs.mkdirSync(out, { recursive: true });
const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox", "--allow-file-access-from-files"] });
const DPR = +(process.env.DPR || 2);
const pg = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DPR });
const errs = []; pg.on("pageerror", (e) => errs.push(e.message));
await pg.goto("file://" + path.join(here, film + ".html") + (variant ? "?v=" + variant : ""));
await pg.evaluate(() => window.ready);
const dur = await pg.evaluate(() => window.DURATION);
const stageSize = await pg.evaluate(() => window.STAGE || [1440, 900]);
await pg.setViewportSize({ width: stageSize[0], height: stageSize[1] });
const outW = stageSize[0] >= stageSize[1] ? 1920 : 1080, outH = Math.round(outW * stageSize[1] / stageSize[0] / 2) * 2;
const tag = film + (variant ? "-" + variant : "");
const stage = await pg.$("#stage");
if (mode === "stills") {
  for (const t of (arg || "0").split(",").map(Number)) {
    await pg.evaluate((t) => window.seek(t), t);
    await stage.screenshot({ path: path.join(out, `${tag}-${String(t).replace(".", "_")}.png`) });
  }
} else {
  const fps = +(arg || 30), n = Math.round(dur * fps), dir = path.join(out, tag + "-frames");
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  for (let f = 0; f < n; f++) {
    await pg.evaluate((t) => window.seek(t), f / fps);
    await stage.screenshot({ path: path.join(dir, `f_${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 95 });
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(fps), "-i", path.join(dir, "f_%04d.jpg"), "-vf", `scale=${outW}:${outH}:flags=lanczos`, "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(out, tag + ".mp4")]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(fps), "-i", path.join(dir, "f_%04d.jpg"), "-vf", `scale=${outW}:${outH}:flags=lanczos`, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "33", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-an", path.join(out, tag + ".webm")]);
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(film, mode, "done", errs.length ? "errors: " + errs.join(" | ") : "");
await b.close();
