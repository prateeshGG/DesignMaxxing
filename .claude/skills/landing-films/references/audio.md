# Sound

The founder rejected code-synthesized sound effects ("fush fush") and a roomy, flat voice. The bar is a real product-film mix: **an energetic, dry voice over licensed music**, nothing else.

1. **Cues file** (`landing/films/audio/<film>.cues.json`): `duration`, `vo` lines (`t`, `text`), `voice` (provider, id, delivery tags), `music` (`file`, `offset`, `gain_db`, `fade_in`, `fade_out`, `credit`). No synthesized events.
2. **Voice.** Use the Fish Audio **MCP connector** (`https://api.fish.audio/mcp`, OAuth; draws package credits, so it works on a free plan; the raw API needs separate API credit and returns 402 without it).
   - Pick an energetic, dry ad voice with a high task count. Never pick a voice that imitates a real person or a real channel's announcer. Current choice: "Upbeat Woman" `e107ce68d2a64e928c3a674781ce9d56`.
   - Add a delivery tag per line: `[excited]`, `[confident]`, `[upbeat]`. Tags cost bytes but are not spoken.
   - Check dryness by measuring how fast each clip decays after its last word: the chosen voice decays to −40 dB in 40–70 ms, the rejected one took 90–220 ms.
   - Download each `audio_url` to `out/<film>-vo/line-<i>.mp3`, then run `node audio/vo.mjs <film> --clips`. It trims edge silence, applies an optional per-line `tempo`, prints each line's span against the next cue, and mixes `out/<film>-vo.wav`.
3. **Music.** Use a licensed human-made track that permits commercial use, and credit it where the film is shown.
   - Current track: "Werq", Kevin MacLeod (incompetech.com), CC BY 4.0; credits in `audio/music/CREDITS.md`.
   - Sites behind bot checks (Mixkit, Pixabay, Uppbeat) are not scraped. ccMixter's API (`lic=by`) and incompetech allow direct downloads.
   - Choose by measurement, since nobody can listen here: tempo 115–128 BPM, bright spectrum, steady loudness over the needed window.
   - Set `offset` so a downbeat lands on the film's main cut (Werq: 125 BPM, 1.92 s bars, offset 0.89 s puts a downbeat on the 12.55 s cut).
4. **Mix:** `node audio/mux.mjs <film>`.
   - Voice: high-pass 90 Hz, 3:1 compression, +2.5 dB at 3.5 kHz, de-ess, no reverb.
   - Music: −7 dB, a −3 dB dip at 3 kHz, sidechain-ducked under the voice.
   - Master: loudness-normalised to −16 LUFS, true peak −1.5 dB.
   - Target the voice about 10 dB above the music while speaking, and check it by measuring the stems.
5. **Ship** the mixed file as the film: it autoplays muted, and a visible button unmutes it.
