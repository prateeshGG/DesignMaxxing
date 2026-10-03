// Mix sound design (+ voiceover when present) and attach it to the rendered film.
// node audio/mux.mjs how-it-works   -> out/<film>-sound.mp4 / .webm (the silent versions stay for autoplay)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname), out = path.join(here, "..", "out");
const film = process.argv[2] || "how-it-works";
const sfx = path.join(out, film + "-sfx.wav"), vo = path.join(out, film + "-vo.wav");
const hasVo = fs.existsSync(vo);
const ins = ["-i", path.join(out, film + ".mp4"), "-i", sfx].concat(hasVo ? ["-i", vo] : []);
// voice ducks the sound design a little when it speaks
const fc = hasVo ? "[2:a]asplit=2[vo][key];[1:a][key]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=300[bed];[bed][vo]amix=inputs=2:normalize=0,alimiter=limit=0.9[a]" : "[1:a]alimiter=limit=0.9[a]";
execFileSync("ffmpeg", ["-v", "error", "-y", ...ins, "-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", path.join(out, film + "-sound.mp4")]);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(out, film + ".webm"), "-i", path.join(out, film + "-sound.mp4"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "libopus", "-b:a", "128k", "-shortest", path.join(out, film + "-sound.webm")]);
console.log("wrote", film + "-sound.mp4/.webm", hasVo ? "(sound design + voiceover)" : "(sound design only; no voiceover yet)");
