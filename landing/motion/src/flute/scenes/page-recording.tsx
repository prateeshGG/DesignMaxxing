import { Surface } from "@webprodigies/flute";
const parts = [["stripe-hero",380],["stripe-logos",33],["p-bento1",404],["p-bento2",325],["p-banner",262],["p-stats",220],["p-burst",244]];
export default function PageRecording() {
  return (
    <Surface id="page" style={{ width: 900, height: 1868 }}>
      <div style={{ width: 900, height: 1868, background: "#fff", borderRadius: 12, overflow: "hidden" }}>
        {parts.map(([n, h]) => <img key={n} src={"/img/" + n + ".webp"} alt="" style={{ display: "block", width: 900, height: h }} />)}
      </div>
    </Surface>
  );
}
