import { Flower2, Leaf } from "lucide-react";

export function FlowerAccent({ side = "left" }: { side?: "left" | "right" }) {
  return (
    <div className={`flower-accent flower-accent-${side}`} aria-hidden="true">
      <span className="flower-accent-halo" />
      <Flower2 className="flower-accent-bloom" strokeWidth={1} />
      <Flower2 className="flower-accent-bud" strokeWidth={1.2} />
      <Leaf className="flower-accent-leaf" strokeWidth={1} />
    </div>
  );
}
