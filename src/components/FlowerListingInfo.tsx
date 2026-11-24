import { flowerListing } from "@/lib/visual-preview";

export function FlowerListingInfo() {
  return (
    <section
      className="location-section"
      aria-label="Hotel Flowers Inn listing information"
    >
      <h3 className="serif">Hotel Flowers Inn, Patna</h3>
      <p>{flowerListing.address}, Patna, Bihar 800013, India.</p>
      <p>
        <a href={`tel:${flowerListing.phone}`}>+91 93047 04520</a>
      </p>
      <p>
        Google lists free Wi-Fi, free self-parking, air conditioning, room
        service and breakfast at an extra charge. Listed arrival time is 12 noon
        and departure time is 11 am.
      </p>
      <p className="source-note">
        Source:{" "}
        <a
          href={flowerListing.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Hotels listing
        </a>
        , checked 24 November 2026. Confirm facilities and arrival arrangements
        with the hotel before travel. These details apply to Flower Inn only.
      </p>
    </section>
  );
}
