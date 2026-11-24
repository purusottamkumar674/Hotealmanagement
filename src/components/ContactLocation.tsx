import { MapPin } from "lucide-react";
import { flowerListing } from "@/lib/visual-preview";
export function ContactLocation() {
  return (
    <section
      className="location-section"
      aria-labelledby="contact-location-title"
    >
      <h3 className="serif" id="contact-location-title">
        <MapPin size={22} aria-hidden="true" /> Find Hotel Flowers Inn
      </h3>
      <p>
        {flowerListing.address}, {flowerListing.city}, {flowerListing.state}{" "}
        {flowerListing.postalCode}, {flowerListing.country}.
      </p>
      <iframe
        title="Hotel Flowers Inn location in Patna"
        src="https://maps.google.com/maps?cid=16799175046952497779&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="property-actions">
        <a
          className="button button-dark"
          href="https://www.google.com/maps/dir//Hotel+Flowers+Inn-Best+Hotel+in+Patna/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x39ed59fa615ec29f:0xe922a8b30935b273?hl=en-IN"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get directions
        </a>
        <a
          className="button button-outline"
          href="https://www.google.com/maps?cid=16799175046952497779"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}
