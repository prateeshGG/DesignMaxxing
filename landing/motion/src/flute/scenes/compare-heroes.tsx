import { Surface } from "@webprodigies/flute";
const items = [{"id":"hero-a","img":"stripe-hero","name":"Stripe","x":0},{"id":"hero-b","img":"linear-hero","name":"Linear","x":870},{"id":"hero-c","img":"studio-hero","name":"Studio","x":1740}];
export default function CompareHeroes() {
  return (
    <Surface id="board" style={{ width: 2500, height: 488 }}>
      {items.map((it) => (
        <Surface key={it.id} id={it.id} style={{ position: "absolute", left: it.x, top: 0, width: 760, height: 480 }}>
          <div style={{ width: 760, height: 480, background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,.08)" }}>
            <img src={"/img/" + it.img + ".webp"} alt="" style={{ display: "block", width: 760, height: 428, objectFit: "cover", objectPosition: "top center" }} />
            <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 20px", font: "500 15px system-ui, sans-serif", color: "#0a0b0d", borderTop: "1px solid #e7e8ea", letterSpacing: ".02em" }}>{it.name} · Hero</div>
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
