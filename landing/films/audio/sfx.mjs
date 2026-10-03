// Code-synthesised sound design for a film, timed to its beats (no samples, no libraries).
// node audio/sfx.mjs how-it-works   -> out/how-it-works-sfx.wav
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname);
const film = process.argv[2] || "how-it-works";
const cues = JSON.parse(fs.readFileSync(path.join(here, film + ".cues.json"), "utf8"));
const SR = 48000, N = Math.ceil(cues.duration * SR), L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

function add(t, buf, gain = 1, pan = 0) {
  const s0 = Math.round(t * SR), gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < buf.length && s0 + i < N; i++) if (s0 + i >= 0) { L[s0 + i] += buf[i] * gl; R[s0 + i] += buf[i] * gr; }
}
const env = (i, n, a, d) => { const t = i / SR; return Math.min(1, t / a) * Math.exp(-t / d); };
function pop(f0 = 900, f1 = 520, dur = 0.09) { const n = Math.round(dur * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const f = f0 + (f1 - f0) * (i / n); ph += (2 * Math.PI * f) / SR; b[i] = Math.sin(ph) * env(i, n, 0.002, dur / 4) + rnd() * 0.08 * Math.exp(-i / (SR * 0.004)); } return b; }
function tick() { const n = Math.round(0.03 * SR), b = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { lp += (rnd() - lp) * 0.5; b[i] = lp * Math.exp(-i / (SR * 0.004)) * 0.9; } return b; }
function click() { const n = Math.round(0.08 * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { ph += (2 * Math.PI * (140 - 60 * i / n)) / SR; b[i] = rnd() * Math.exp(-i / (SR * 0.003)) * 0.8 + Math.sin(ph) * Math.exp(-i / (SR * 0.02)) * 0.7; } return b; }
function whoosh(dur = 0.7, up = true) {
  const n = Math.round(dur * SR), b = new Float32Array(n); let lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) { const p = i / n, a = Math.sin(Math.PI * Math.pow(up ? p : 1 - p, 0.8)) ** 2, c = 0.02 + 0.25 * (up ? p : 1 - p); lp += (rnd() - lp) * c; lp2 += (lp - lp2) * c; b[i] = (lp - lp2 * 0.6) * a * 2.2; }
  return b;
}
function scribble(dur = 0.45) { const n = Math.round(dur * SR), b = new Float32Array(n); let lp = 0; for (let i = 0; i < n; i++) { const p = i / n; lp += (rnd() - lp) * 0.35; const am = 0.6 + 0.4 * Math.sin(2 * Math.PI * 23 * p * dur) ; b[i] = lp * am * Math.sin(Math.PI * p) * 0.5; } return b; }
function thump() { const n = Math.round(0.35 * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { ph += (2 * Math.PI * (90 * Math.exp(-i / (SR * 0.08)) + 40)) / SR; b[i] = Math.sin(ph) * Math.exp(-i / (SR * 0.12)); } return b; }
function shimmer(dur = 0.9) { const n = Math.round(dur * SR), b = new Float32Array(n), fs_ = [1568, 2093, 2637, 3136]; for (let i = 0; i < n; i++) { let v = 0; fs_.forEach((f, k) => { v += Math.sin((2 * Math.PI * f * i) / SR + k) * Math.max(0, Math.sin(Math.PI * (i / n - k * 0.12) / 0.6)); }); b[i] = v * 0.06 * Math.sin(Math.PI * i / n); } return b; }
/* a soft pad: Cmaj9 voicing, slow swell, very low level, so the UI sounds have a bed */
function pad(dur) {
  const n = Math.round(dur * SR), b = new Float32Array(n), notes = [130.81, 196.0, 246.94, 293.66, 329.63];
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; notes.forEach((f, k) => { v += Math.sin(2 * Math.PI * f * t + k) + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t + 2 * k); }); const a = Math.min(1, t / 2.5) * Math.min(1, (dur - t) / 2.5); b[i] = v * 0.012 * a * (0.85 + 0.15 * Math.sin(2 * Math.PI * 0.11 * t)); }
  return b;
}
const make = { pop: () => pop(), popHi: () => pop(1300, 800, 0.07), popLo: () => pop(620, 380, 0.11), tick, click, whoosh: () => whoosh(0.7), whooshShort: () => whoosh(0.4), whooshDown: () => whoosh(0.6, false), scribble: () => scribble(), thump, shimmer: () => shimmer() };
if (cues.pad) add(0, pad(cues.duration), cues.pad);
for (const c of cues.events) { const g = c.gain ?? 0.5, pan = c.pan ?? 0; (Array.isArray(c.t) ? c.t : [c.t]).forEach((t) => add(t, make[c.kind](), g, pan)); }
/* gentle limiter */
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const k = peak > 0.89 ? 0.89 / peak : 1;
const buf = Buffer.alloc(44 + N * 4); buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k)) * 32767), 46 + i * 4); }
const out = path.join(here, "..", "out"); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, film + "-sfx.wav"), buf);
console.log("wrote", film + "-sfx.wav", cues.duration + "s", cues.events.length, "cue groups");
