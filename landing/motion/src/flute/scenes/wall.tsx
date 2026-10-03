import { Surface } from "@webprodigies/flute";
const tiles = [{"img":"stripe-hero","x":0,"y":0},{"img":"linear-hero","x":560,"y":0},{"img":"studio-hero","x":1120,"y":0},{"img":"stripe-bento1","x":1680,"y":0},{"img":"linear-changelog","x":2240,"y":0},{"img":"studio-case","x":0,"y":365},{"img":"stripe-stats","x":560,"y":365},{"img":"stripe-banner","x":1120,"y":365},{"img":"linear-testimonials","x":1680,"y":365},{"img":"linear-figures","x":2240,"y":365},{"img":"studio-logos","x":0,"y":730},{"img":"linear-cta","x":560,"y":730},{"img":"p-burst","x":1120,"y":730},{"img":"p-bento2","x":1680,"y":730},{"img":"stripe-logos","x":2240,"y":730}];
export default function Wall() {
  return (
    <Surface id="wall" style={{ width: 2760, height: 1055 }}>
      {tiles.map((t, i) => (
        <Surface key={i} id={"tile-" + i} style={{ position: "absolute", left: t.x, top: t.y, width: 520, height: 325 }}>
          <div style={{ width: 520, height: 325, borderRadius: 10, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(255,255,255,.1)" }}>
            <img src={"/img/" + t.img + ".webp"} alt="" style={{ display: "block", width: 520, height: 325, objectFit: "cover", objectPosition: "top left" }} />
          </div>
        </Surface>
      ))}
    </Surface>
  );
}
