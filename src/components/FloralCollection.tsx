import Image from "next/image";

const flowers = [
  ["img1", "Hotel guest room"], ["img8", "Hotel reception"],
  ["img2", "Guest room and seating"], ["img14", "Breakfast tray"],
  ["img15", "Hotel entrance"],
];

export function FloralCollection() {
  return (
    <section
      className="section container floral-collection"
      aria-labelledby="floral-title"
    >
      <div className="floral-collection-heading">
        <span className="eyebrow">EXPLORE OUR HOTEL</span>
        <h2 className="serif" id="floral-title">
          Rooms and reception.
          <br />
          <em>A closer look.</em>
        </h2>
        <p>Take a look at our guest rooms, reception and hotel spaces.</p>
      </div>
      <div className="floral-collection-grid">
        {flowers.map(([name, alt]) => (
          <div className="floral-collection-photo" key={name}>
            <Image
              src={`/images/${name}.png`}
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
