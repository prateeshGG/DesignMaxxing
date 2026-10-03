// Voiceover with Fish Audio text-to-speech, one clip per line, placed on the film's timeline.
// FISH_API_KEY=... node audio/vo.mjs how-it-works [voiceId] [model]
// Needs API credit on the Fish Audio account (platform credit does not cover the API).
// The key is read from the environment only. Never write it into the repository.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname);
const [, , film = "how-it-works", voice = "839e7bdb6e1c428a8bba1fb784b7b1e2", model = "s1"] = process.argv;
const key = process.env.FISH_API_KEY;
if (!key) { console.error("Set FISH_API_KEY in the environment."); process.exit(1); }
const cues = JSON.parse(fs.readFileSync(path.join(here, film + ".cues.json"), "utf8"));
const out = path.join(here, "..", "out", film + "-vo"); fs.mkdirSync(out, { recursive: true });
const inputs = [], filters = [];
for (const [i, line] of cues.vo.entries()) {
  const res = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", model },
    body: JSON.stringify({ text: line.text, reference_id: voice, format: "wav", normalize: true, latency: "normal" }),
  });
  if (!res.ok) { console.error("Fish Audio", res.status, (await res.text()).slice(0, 200)); process.exit(2); }
  const f = path.join(out, `line-${i}.wav`); fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  const dur = +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();
  const next = cues.vo[i + 1]?.t ?? cues.duration;
  if (line.t + dur > next + 0.15) console.warn(`line ${i} runs ${(line.t + dur - next).toFixed(2)}s into the next cue; shorten the text or move the cue`);
  inputs.push("-i", f); filters.push(`[${i}:a]aresample=48000,adelay=${Math.round(line.t * 1000)}|${Math.round(line.t * 1000)}[v${i}]`);
}
const mix = filters.join(";") + ";" + cues.vo.map((_, i) => `[v${i}]`).join("") + `amix=inputs=${cues.vo.length}:normalize=0,apad=whole_dur=${cues.duration}[vo]`;
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", mix, "-map", "[vo]", "-t", String(cues.duration), "-ac", "2", path.join(here, "..", "out", film + "-vo.wav")]);
console.log("wrote", film + "-vo.wav");
