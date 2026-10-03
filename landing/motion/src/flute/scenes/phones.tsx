import { Surface } from "@webprodigies/flute";
const phones = [{"id":"phone-0","img":"linear-m-hero","x":0,"y":50},{"id":"phone-1","img":"linear-m-intake","x":380,"y":0},{"id":"phone-2","img":"linear-m-planning","x":760,"y":70}];
export default function Phones() {
  return (
    <Surface id="stage" style={{ width: 1060, height: 740 }}>
      {phones.map((p) => (
        <Surface key={p.id} id={p.id} style={{ position: "absolute", left: p.x, top: p.y, width: 300, height: 640 }}>
          <div style={{ width: 300, height: 640, borderRadius: 14, overflow: "hidden", background: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,.18)" }}>
            <img src={"/img/" + p.img + ".webp"} alt="" style={{ display: "block", width: 300, height: "auto" }} />
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
