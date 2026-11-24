import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import sharp from "sharp";
import { completeSlides } from "../src/lib/photo-slides.ts";

test("authorized local samples decode and match the license manifest", async () => {
  const manifest = JSON.parse(
    fs.readFileSync("public/images/credits.json", "utf8"),
  );
  for (const asset of manifest.assets) {
    const bytes = fs.readFileSync(asset.file);
    assert.equal(
      crypto.createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
    );
    const decoded = await sharp(bytes).metadata();
    assert.equal(decoded.width, asset.width);
    assert.equal(decoded.height, asset.height);
    assert.ok(asset.license && asset.illustrative);
  }
});

test("partial published slider retains originals and fills to four without duplicates", () => {
  const live = [{ id: "owner-photo", hotel: "flower-inn" }];
  const samples = Array.from({ length: 4 }, (_, i) => ({
    id: `sample-${i}`,
    hotel: i % 2 ? "petal-inn" : "flower-inn",
  }));
  const result = completeSlides(live, samples);
  assert.equal(result.length, 4);
  assert.equal(result[0], live[0]);
  assert.equal(new Set(result.map((s) => s.id)).size, 4);
  assert.deepEqual(completeSlides(live, []), live);
  assert.equal(completeSlides([...samples, ...live], samples).length, 5);
});

test('fallbacks remain property scoped and reject third-party hotlinks', async () => {
 const {imageCandidates}=await import('../src/components/HotelImage.tsx');
 const candidates=imageCandidates('https://images.unsplash.com/example.jpg','flower-inn');
 assert.ok(candidates.includes('/images/hotels/flower-inn/exterior.webp'));
 assert.ok(candidates.every(src=>!src.includes('petal-inn')&&!src.startsWith('http')));
 assert.deepEqual(imageCandidates('/images/hotels/flower-inn/exterior.webp','flower-inn',undefined,false),[]);
});
