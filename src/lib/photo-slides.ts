import type { Slide } from "./server/catalog";

// Keep published slides first. Only explicitly enabled, labeled local samples
// fill empty slots; never repeat an uploaded photograph as another property.
export function completeSlides(published: Slide[], samples: Slide[]): Slide[] {
  const result = [...published];
  for (const sample of samples) {
    if (result.length >= 4) break;
    if (!result.some((slide) => slide.id === sample.id)) result.push(sample);
  }
  return result;
}
