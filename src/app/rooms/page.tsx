import { RoomCard, SectionTitle } from "@/components/Cards";
import DemoRooms from "@/components/DemoRooms";
import { demoMode } from "@/lib/platform";
import { visualCatalog as catalog } from "@/lib/server/visual-catalog";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Rooms",
  alternates: { canonical: "/rooms" },
};
export default async function RoomsPage() {
  if (demoMode) return <DemoRooms />;
  const data = await catalog();
  return (
    <main className="container content-shell">
      <section className="section">
        <SectionTitle
          eyebrow="ROOMS"
          title={
            <>
              Find your <em>kind of comfort.</em>
            </>
          }
          description="Browse published accommodation and search dates for a current quote."
        />
        {data.hotels.map((h) => (
          <section key={h.id}>
            <h2 className="serif">{h.name}</h2>
            <div className="rooms-grid">
              {data.rooms
                .filter((r) => r.hotelId === h.id)
                .map((r) => (
                  <RoomCard key={r.id} room={r} />
                ))}
            </div>
          </section>
        ))}
        {!data.rooms.length && (
          <p className="notice info">
            {data.error ||
              "Accommodation details are awaiting property confirmation."}
          </p>
        )}
      </section>
    </main>
  );
}
