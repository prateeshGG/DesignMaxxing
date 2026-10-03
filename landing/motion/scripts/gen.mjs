// Generates the scene recipe (.scene.json) and its React binding (.tsx) pairs.
import fs from "node:fs";
const dir = new URL("../src/flute/scenes/", import.meta.url);
function write(id, title, description, def, tsx) {
  fs.writeFileSync(new URL(`${id}.scene.json`, dir), JSON.stringify({ version: 1, id, title, description, definition: def }, null, 2));
  fs.writeFileSync(new URL(`${id}.tsx`, dir), tsx);
}
const kf = (pairs, easing) => pairs.map(([timeMs, value]) => (easing ? { timeMs, value, easing } : { timeMs, value }));
const cam = (property, pairs) => ({ target: { kind: "camera" }, property, keyframes: kf(pairs) });
const surf = (id, property, pairs) => ({ target: { kind: "surface", id }, property, keyframes: kf(pairs) });

/* ---- 1. compare heroes: a slow survey across three real hero sections ---- */
{
  const W = 760, H = 428, GAP = 110;
  const ids = ["hero-a", "hero-b", "hero-c"];
  const imgs = ["stripe-hero", "linear-hero", "studio-hero"];
  const names = ["Stripe", "Linear", "Studio"];
  const tsx = `import { Surface } from "@webprodigies/flute";
const items = ${JSON.stringify(ids.map((id, i) => ({ id, img: imgs[i], name: names[i], x: i * (W + GAP) })))};
export default function CompareHeroes() {
  return (
    <Surface id="board" style={{ width: ${3 * W + 2 * GAP}, height: ${H + 60} }}>
      {items.map((it) => (
        <Surface key={it.id} id={it.id} style={{ position: "absolute", left: it.x, top: 0, width: ${W}, height: ${H + 52} }}>
          <div style={{ width: ${W}, height: ${H + 52}, background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.08)" }}>
            <img src={"/img/" + it.img + ".webp"} alt="" style={{ display: "block", width: ${W}, height: ${H}, objectFit: "cover", objectPosition: "top center" }} />
            <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 20px", font: "500 15px system-ui, sans-serif", color: "#0a0b0d", borderTop: "1px solid #e7e8ea", letterSpacing: ".02em" }}>{it.name} · Hero</div>
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
`;
  const total = 12000, span = 2 * (W + GAP);
  write("compare-heroes", "Compare heroes", "A slow survey across three real hero sections.", {
    width: 1280, height: 800,
    scene: { version: 3, camera: { perspective: 1500, rotateY: -16, rotateX: 4, x: -300, y: -156, z: 120 }, focus: { distance: 1250, fStop: 3.2, maxBlur: 8 },
      nodes: [{ id: "board" }, ...ids.map((id) => ({ id, parentId: "board" }))] },
    motion: { durationMs: total, speed: 1, tracks: [cam("x", [[0, -330], [6000, 1560], [12000, -330]])] },
  }, tsx);
}

/* ---- 2. page recording: a long real page, surveyed along its edge ---- */
{
  const PW = 900;
  const parts = [["stripe-hero", 541], ["stripe-logos", 47], ["p-bento1", 575], ["p-bento2", 462], ["p-banner", 373], ["p-stats", 313], ["p-burst", 347]].map(([n, h]) => [n, Math.round((h * PW) / 1280)]);
  const PH = parts.reduce((a, b) => a + b[1], 0);
  const tsx = `import { Surface } from "@webprodigies/flute";
const parts = ${JSON.stringify(parts)};
export default function PageRecording() {
  return (
    <Surface id="page" style={{ width: ${PW}, height: ${PH} }}>
      <div style={{ width: ${PW}, height: ${PH}, background: "#fff", borderRadius: 12, overflow: "hidden" }}>
        {parts.map(([n, h]) => <img key={n} src={"/img/" + n + ".webp"} alt="" style={{ display: "block", width: ${PW}, height: h }} />)}
      </div>
    </Surface>
  );
}
`;
  write("page-recording", "Page recording", "A camera travels down a real page along its edge.", {
    width: 1280, height: 800,
    scene: { version: 3, camera: { perspective: 1500, rotateY: -22, rotateX: 6, x: -250, y: -60, z: 80 }, focus: { distance: 1380, fStop: 3.6, maxBlur: 7 }, nodes: [{ id: "page" }] },
    motion: { durationMs: 14000, speed: 1, tracks: [cam("y", [[0, -80], [7000, PH - 760], [14000, -80]])] },
  }, tsx);
}

/* ---- 3. phones: three real mobile sections plate together ---- */
{
  const PW = 300, PHH = 640;
  const phones = [["linear-m-hero", 0, 50], ["linear-m-intake", 380, 0], ["linear-m-planning", 760, 70]];
  const tsx = `import { Surface } from "@webprodigies/flute";
const phones = ${JSON.stringify(phones.map(([img, x, y], i) => ({ id: "phone-" + i, img, x, y })))};
export default function Phones() {
  return (
    <Surface id="stage" style={{ width: 1060, height: 740 }}>
      {phones.map((p) => (
        <Surface key={p.id} id={p.id} style={{ position: "absolute", left: p.x, top: p.y, width: ${PW}, height: ${PHH} }}>
          <div style={{ width: ${PW}, height: ${PHH}, borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,.18)" }}>
            <img src={"/img/" + p.img + ".webp"} alt="" style={{ display: "block", width: ${PW}, height: "auto" }} />
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
`;
  const tr = [];
  phones.forEach((_, i) => {
    tr.push(surf("phone-" + i, "z", [[i * 500, 700], [i * 500 + 2600, 0], [8600 + i * 200, 0], [11200 + i * 200, 700]]));
    tr.push(surf("phone-" + i, "opacity", [[i * 500, 0], [i * 500 + 1400, 1], [9000 + i * 200, 1], [11200 + i * 200, 0]]));
  });
  tr.push(cam("x", [[0, -60], [12000, 60]]));
  write("phones", "Phone and desktop", "Three real mobile sections settle into place.", {
    width: 1280, height: 800,
    scene: { version: 3, camera: { perspective: 1700, rotateY: -16, rotateX: 8, x: -110, y: -40, z: 60 }, focus: { distance: 1500, fStop: 3.4, maxBlur: 8 },
      nodes: [{ id: "stage" }, ...phones.map((_, i) => ({ id: "phone-" + i, parentId: "stage" }))] },
    motion: { durationMs: 12000, speed: 1, tracks: tr },
  }, tsx);
}

/* ---- 4. wall: many real sections on one plane (closing section backdrop) ---- */
{
  const TW = 520, TH = 325, G = 40, COLS = 5, ROWS = 3;
  const imgs = ["stripe-hero", "linear-hero", "studio-hero", "stripe-bento1", "linear-changelog", "studio-case", "stripe-stats", "stripe-banner", "linear-testimonials", "linear-figures", "studio-logos", "linear-cta", "p-burst", "p-bento2", "stripe-logos"];
  const tiles = imgs.map((img, i) => ({ img, x: (i % COLS) * (TW + G), y: Math.floor(i / COLS) * (TH + G) }));
  const BW = COLS * TW + (COLS - 1) * G, BH = ROWS * TH + (ROWS - 1) * G;
  const tsx = `import { Surface } from "@webprodigies/flute";
const tiles = ${JSON.stringify(tiles)};
export default function Wall() {
  return (
    <Surface id="wall" style={{ width: ${BW}, height: ${BH} }}>
      {tiles.map((t, i) => (
        <Surface key={i} id={"tile-" + i} style={{ position: "absolute", left: t.x, top: t.y, width: ${TW}, height: ${TH} }}>
          <div style={{ width: ${TW}, height: ${TH}, borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(255,255,255,.1)" }}>
            <img src={"/img/" + t.img + ".webp"} alt="" style={{ display: "block", width: ${TW}, height: ${TH}, objectFit: "cover", objectPosition: "top left" }} />
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
`;
  write("wall", "Wall of sections", "A wall of real sections, surveyed diagonally.", {
    width: 1280, height: 800,
    scene: { version: 3, camera: { perspective: 1600, rotateY: -20, rotateX: 14, x: 200, y: 100, z: 160 }, focus: { distance: 1400, fStop: 2.8, maxBlur: 10 },
      nodes: [{ id: "wall" }, ...tiles.map((_, i) => ({ id: "tile-" + i, parentId: "wall" }))] },
    motion: { durationMs: 16000, speed: 1, tracks: [cam("x", [[0, 200], [8000, BW - 1500], [16000, 200]]), cam("y", [[0, 40], [8000, BH - 700], [16000, 40]])] },
  }, tsx);
}

/* ---- 5. plate: the sections of one real page converge and settle (closing section backdrop) ---- */
{
  const PW = 900;
  const parts = [["stripe-hero", 541], ["stripe-logos", 47], ["p-bento1", 575], ["p-bento2", 462], ["p-banner", 373], ["p-stats", 313], ["p-burst", 347]].map(([n, h]) => [n, Math.round((h * PW) / 1280)]);
  let y = 0;
  const placed = parts.map(([n, h], i) => { const o = { id: "part-" + i, img: n, y, h }; y += h + 14; return o; });
  const PH = y - 14;
  const tsx = `import { Surface } from "@webprodigies/flute";
const parts = ${JSON.stringify(placed)};
export default function Plate() {
  return (
    <Surface id="page" style={{ width: ${PW}, height: ${PH} }}>
      {parts.map((p) => (
        <Surface key={p.id} id={p.id} style={{ position: "absolute", left: 0, top: p.y, width: ${PW}, height: p.h }}>
          <img src={"/img/" + p.img + ".webp"} alt="" style={{ display: "block", width: ${PW}, height: p.h, borderRadius: 10 }} />
        </Surface>
      ))}
    </Surface>
  );
}
`;
  const tr = [];
  placed.forEach((p, i) => {
    tr.push(surf(p.id, "z", [[i * 450, 700], [i * 450 + 2600, 0], [10200, 0], [12600 + i * 100, 700]]));
    tr.push(surf(p.id, "opacity", [[i * 450, 0], [i * 450 + 1500, 1], [10600, 1], [12600 + i * 100, 0]]));
  });
  tr.push(cam("y", [[0, -60], [7000, PH * 0.45 - 400], [14000, -60]]));
  write("plate", "Plating a page", "The sections of one real page settle into place.", {
    width: 1280, height: 800,
    scene: { version: 3, camera: { perspective: 1700, rotateY: -18, rotateX: 8, x: -180, y: -60, z: 140 }, focus: { distance: 1560, fStop: 3.2, maxBlur: 8 },
      nodes: [{ id: "page" }, ...placed.map((p) => ({ id: p.id, parentId: "page" }))] },
    motion: { durationMs: 14000, speed: 1, tracks: tr },
  }, tsx);
}
console.log("generated");
