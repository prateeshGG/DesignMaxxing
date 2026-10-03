# Motion craft with the engine

- **Rooms and camera.** Put scenes side by side on a wide `#world` (1440×900 per room) and drive `F.camera(world, F.track(t, CAM), blurNode, prevCam)`. `CAM` is a list of `[time, [x, y, scale], ease]`. A one-millisecond jump between two keys is a hard cut, so skip blur on that frame.
- **Motion blur.** `F.motionBlurFilter()` plus `F.camera` add directional blur only when on-screen speed exceeds about 48 px per frame. The filter sits on the scaled world, so the engine divides by the camera scale. Without that, pans smear.
- **Timing.** `F.e(t, a, b, 'outExpo')` for snappy pull-backs, `F.sp(t, a, b, bounce)` for pops and landings (one overshoot), `inOut` for camera moves. Stagger 0.14–0.3 s. Let holds breathe for 0.5–1 s.
- **Text.** `F.maskLine` plus `F.reveal(m, p, outP)`: lines slide up from behind a clip and leave upwards.
- **Light.** `F.sheen(card)` plus `F.sweep(el, p)` for a light band crossing a card as it lands.
- **Callouts (annotations).** `F.callout(room, { text, target: {x,y,w,h}, label: {x,y}, from: {x,y}, to: {x,y}, shape, pad })`:
  - a pill label placed in **empty space** (the margin outside the card, or a blank area of the screenshot), never on top of content;
  - one **straight arrow** from the label's edge (`from`) to the target (`to`, or the edge of the mark), with an arrowhead. The founder rejected curvy connectors;
  - a pen mark only where it helps: `shape: 'underline'` for a wide line of text, the default small ring for a compact target such as a button, `shape: 'arrow'` (no mark) for large art, where a ring looks oversized;
  - animate with `c.update(markP, arrowP, labelP)` in this order: label pops, arrow shoots out, then the mark draws (label → +0.25 s arrow → +0.6 s mark, about 1 s in all);
  - hold the camera until the whole callout has finished drawing, and frame it so label and target are both on screen and the view never runs past the room.
- **Art layer.** `F.engrave` (contour lines plus cross-hatching, masked into a corner), `F.pattern` (dots, diamonds, plus, brackets), `F.silk` (the hero line motif), `F.pixelSwap` (mosaic dissolve between two images). Redraw only rooms that are on screen.
- **Render.** `render.mjs` captures at device scale 2 and encodes 1920×1200 H.264 (CRF 22) plus VP9 (CRF 33). Grain adds bitrate, so keep it at about 0.035. Check several frames pulled from the encoded MP4 before calling it done.
