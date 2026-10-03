import { Surface } from "@webprodigies/flute";
const parts = [{"id":"part-0","img":"stripe-hero","y":0,"h":380},{"id":"part-1","img":"stripe-logos","y":394,"h":33},{"id":"part-2","img":"p-bento1","y":441,"h":404},{"id":"part-3","img":"p-bento2","y":859,"h":325},{"id":"part-4","img":"p-banner","y":1198,"h":262},{"id":"part-5","img":"p-stats","y":1474,"h":220},{"id":"part-6","img":"p-burst","y":1708,"h":244}];
export default function Plate() {
  return (
    <Surface id="page" style={{ width: 900, height: 1952 }}>
      {parts.map((p) => (
        <Surface key={p.id} id={p.id} style={{ position: "absolute", left: 0, top: p.y, width: 900, height: p.h }}>
          <img src={"/img/" + p.img + ".webp"} alt="" style={{ display: "block", width: 900, height: p.h, borderRadius: 10 }} />
        </Surface>
      ))}
    </Surface>
  );
}
