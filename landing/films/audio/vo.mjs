// Voiceover, one clip per line, placed on the film's timeline.
//
// Two ways to get the clips:
//   1. Fish Audio MCP connector (works on a free plan, uses package credits): generate each `vo` line
//      with text_to_speech, save the files as out/<film>-vo/line-<i>.mp3, then run
//        node audio/vo.mjs <film> --clips
//   2. Fish Audio API (needs API credit, which is separate from package credit):
//        FISH_API_KEY=... node audio/vo.mjs <film> [voiceId] [model]
// Either way each clip is trimmed of edge silence, sped up by the line's optional `tempo` (e.g. 1.05),
// checked against the next cue and mixed into out/<film>-vo.wav. Keys come from the environment only.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2), clipsMode = args.includes("--clips");
const [film = "how-it-works", voice = "839e7bdb6e1c428a8bba1fb784b7b1e2", model = "s1"] = args.filter((a) => !a.startsWith("--"));
const cues = JSON.parse(fs.readFileSync(path.join(here, film + ".cues.json"), "utf8"));
const out = path.join(here, "..", "out", film + "-vo"); fs.mkdirSync(out, { recursive: true });
const key = process.env.FISH_API_KEY;
if (!clipsMode && !key) { console.error("Set FISH_API_KEY, or make the clips with the Fish connector and pass --clips."); process.exit(1); }
const dur = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString();
const inputs = [], filters = [];
for (const [i, line] of cues.vo.entries()) {
  let src = ["mp3", "wav"].map((x) => path.join(out, `line-${i}.${x}`)).find((f) => fs.existsSync(f));
  if (!clipsMode) {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", model },
      body: JSON.stringify({ text: line.text, reference_id: voice, format: "wav", normalize: true, latency: "normal" }),
    });
    if (!res.ok) { console.error("Fish Audio", res.status, (await res.text()).slice(0, 200)); process.exit(2); }
    src = path.join(out, `line-${i}.wav`); fs.writeFileSync(src, Buffer.from(await res.arrayBuffer()));
  }
  if (!src) { console.error(`missing clip out/${film}-vo/line-${i}.mp3 for "${line.text}"`); process.exit(3); }
  /* trim edge silence, apply tempo, resample */
  const f = path.join(out, `line-${i}.trim.wav`);
  const af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse" + (line.tempo ? `,atempo=${line.tempo}` : "");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-af", af, "-ar", "48000", f]);
  const d = dur(f), next = cues.vo[i + 1]?.t ?? cues.duration;
  console.log(`line ${i}  ${line.t.toFixed(2)}s → ${(line.t + d).toFixed(2)}s  (next cue ${next.toFixed(2)}s)`);
  if (line.t + d > next + 0.05) console.warn(`  line ${i} runs ${(line.t + d - next).toFixed(2)}s into the next cue; shorten the text, add tempo or move the cue`);
  inputs.push("-i", f); filters.push(`[${i}:a]adelay=${Math.round(line.t * 1000)}|${Math.round(line.t * 1000)}[v${i}]`);
}
const mix = filters.join(";") + ";" + cues.vo.map((_, i) => `[v${i}]`).join("") + `amix=inputs=${cues.vo.length}:normalize=0,apad=whole_dur=${cues.duration}[vo]`;
execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", mix, "-map", "[vo]", "-t", String(cues.duration), "-ac", "2", path.join(here, "..", "out", film + "-vo.wav")]);
console.log("wrote", film + "-vo.wav");
