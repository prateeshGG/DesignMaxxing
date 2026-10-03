# Sound

1. **Cues file** (`landing/films/audio/<film>.cues.json`): `duration`, `pad` level, `events` (`kind`, `t` or a list of times, `gain`, `pan`), and `vo` lines (`t`, `text`). Times come straight from the film's timeline: pops on landings, ticks per typed character, a whoosh on the whip, a click on the cursor press, a thump on a cut, pen scribbles while callout lines draw.
2. **Sound design:** `node audio/sfx.mjs <film>` synthesises everything in code (no samples) and limits the peaks.
3. **Voiceover:** `FISH_API_KEY=... node audio/vo.mjs <film> [voiceId] [model]` calls Fish Audio TTS per line (`POST https://api.fish.audio/v1/tts`, header `model: s1`, body `{text, reference_id, format: "wav"}`), places each clip at its cue and warns when a line runs into the next one. Voices are found with `GET https://api.fish.audio/model?title=narrator&language=en`. The API needs **API credit**, which is separate from Fish Audio platform credit (a 402 means no API credit). The founder's free usage came through the Fish Audio connector, which can be used instead of the raw API when it is connected. Keep the key in the environment only.
4. **Mix:** `node audio/mux.mjs <film>` writes `<film>-sound.mp4/.webm`. The voice ducks the sound design. Keep the silent files for autoplay.
5. Keep sound subtle: mean level around −28 dB for the sound design, peaks under −3 dB.
