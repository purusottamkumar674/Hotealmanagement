import "server-only";
import { completeSlides } from "../photo-slides";
import { catalog } from "./catalog";
import {
  previewHotels,
  previewRooms,
  previewPhotos,
  previewSlides,
  visualPreviewEnabled,
  type GalleryPhoto,
} from "../visual-preview";
export async function visualCatalog() {
  const data = await catalog();
  const hotels = visualPreviewEnabled
    ? previewHotels.map(
        (sample) => data.hotels.find((h) => h.id === sample.id) || sample,
      )
    : data.hotels;
  const enabled = (slug: string) =>
    visualPreviewEnabled &&
    data.hotelRows.find((h) => h.slug === slug)?.sample_images_enabled !==
      false;
  const rooms = hotels.flatMap((h) => {
    const real = data.rooms.filter((r) => r.hotelId === h.id);
    return real.length
      ? real
      : enabled(h.id)
        ? previewRooms.filter((r) => r.hotelId === h.id)
        : [];
  });
  const photos: GalleryPhoto[] = hotels.flatMap((h) => {
    const real = data.media
      .filter(
        (m) => m.active && m.hotel_id === h.databaseId && m.category !== "logo",
      )
      .map((m) => ({
        id: m.id,
        src: m.url,
        alt: m.alt_text,
        hotelId: h.id,
        hotelName: h.name,
        category: m.category,
        preview: false,
      }));
    return real.length
      ? real
      : enabled(h.id)
        ? previewPhotos.filter((p) => p.hotelId === h.id)
        : [];
  });
  return {
    ...data,
    hotels: hotels.map((h) => ({ ...h, samplesEnabled: enabled(h.id) })),
    rooms: rooms.map((r) => ({ ...r, samplesEnabled: enabled(r.hotelId) })),
    photos,
    slides: completeSlides(
      data.slides,
      previewSlides.filter((s) => enabled(s.hotel)),
    ),
    visualPreview:
      hotels.some((h) => h.preview) || rooms.some((r) => r.preview),
  };
}
export type VisualCatalog = Awaited<ReturnType<typeof visualCatalog>>;
