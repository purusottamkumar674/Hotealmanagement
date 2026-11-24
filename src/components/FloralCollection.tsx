import Image from "next/image";

const flowers = [
  ["flow", "Pink lotus reflected in water"],
  ["flow1", "Red rose with dew drops"],
  ["flow2", "Golden sunflower in the evening light"],
  ["flow3", "Pink, red and yellow tulips"],
  ["flow4", "Purple orchids among green leaves"],
];

export function FloralCollection() {
  return (
    <section
      className="section container floral-collection"
      aria-labelledby="floral-title"
    >
      <div className="floral-collection-heading">
        <span className="eyebrow">INSPIRED BY NATURE</span>
        <h2 className="serif" id="floral-title">
          A little colour.
          <br />
          <em>A moment of calm.</em>
        </h2>
        <p>Flowers and petals — the inspiration behind our collection.</p>
      </div>
      <div className="floral-collection-grid">
        {flowers.map(([name, alt]) => (
          <div className="floral-collection-photo" key={name}>
            <Image
              src={`/${name}.png`}
              alt={alt}
              fill
              sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 20vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
