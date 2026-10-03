// Mix music and voiceover and attach them to the rendered film. No synthesized sound effects.
// node audio/mux.mjs how-it-works   -> out/<film>-sound.mp4 / .webm (ship this file as the film; it autoplays muted)
//
// Chain: voice = high-pass 90 Hz, gentle compression, a little presence, de-ess (dry: no reverb).
//        music = licensed track from cues.music (offset so a downbeat lands on the main cut), faded in/out, with a small dip around 3 kHz so the voice sits on top,
//                ducked under the voice with a sidechain compressor.
//        master = loudness-normalised to -16 LUFS, true peak -1.5 dB.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname), out = path.join(here, "..", "out");
const film = process.argv[2] || "how-it-works";
const cues = JSON.parse(fs.readFileSync(path.join(here, film + ".cues.json"), "utf8"));
const D = cues.duration, vo = path.join(out, film + "-vo.wav"), m = cues.music;
const ins = ["-i", path.join(out, film + ".mp4")], parts = [];
let n = 1, voL = null, muL = null;
if (fs.existsSync(vo)) {
  ins.push("-i", vo); voL = `${n++}:a`;
  parts.push(`[${voL}]highpass=f=90,acompressor=threshold=0.1:ratio=3:attack=8:release=120:makeup=1.6,equalizer=f=3500:t=q:w=1:g=2.5,deesser=i=0.35,asplit=2[vo][key]`);
}
if (m) {
  ins.push("-i", path.join(here, m.file)); muL = `${n++}:a`;
  parts.push(`[${muL}]atrim=start=${m.offset}:duration=${D},asetpts=PTS-STARTPTS,aresample=48000,volume=${m.gain_db ?? 0}dB,equalizer=f=3000:t=q:w=1:g=-3,afade=t=in:d=${m.fade_in ?? 0.2},afade=t=out:st=${(D - (m.fade_out ?? 1.5)).toFixed(2)}:d=${m.fade_out ?? 1.5}[mu]`);
}
if (voL && muL) parts.push(`[mu][key]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=450:makeup=1[bed]`, `[bed][vo]amix=inputs=2:normalize=0[mix]`);
else parts.push(voL ? `[vo]anull[mix]` : `[mu]anull[mix]`);
parts.push(`[mix]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`);
execFileSync("ffmpeg", ["-v", "error", "-y", ...ins, "-filter_complex", parts.join(";"), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(D), "-movflags", "+faststart", path.join(out, film + "-sound.mp4")]);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(out, film + ".webm"), "-i", path.join(out, film + "-sound.mp4"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "libopus", "-b:a", "160k", "-shortest", path.join(out, film + "-sound.webm")]);
console.log("wrote", film + "-sound.mp4/.webm", `(${[voL && "voiceover", muL && "music"].filter(Boolean).join(" + ")})`);
