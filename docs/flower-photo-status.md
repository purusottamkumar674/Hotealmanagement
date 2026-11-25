# Flower Inn photographs and listing

Checked 24 November 2026.

Google Hotels identifies Hotel Flowers Inn–Best Hotel in Patna at Vishwamitra Path, North S.K. Puri, Boring Road, opposite A.N. College, Patna, Bihar 800013; telephone +91 93047 04520. Listed facilities include free Wi-Fi, free self-parking, air conditioning, room service and paid breakfast. Listed check-in is noon; check-out is 11 am. These are listing observations, not an owner warranty or changes to booking policies.

Source: https://www.google.com/travel/hotels/entity/ChoI8-TWybCWqpHpARoNL2cvMTFzeXN0NDh6NBAB

The supplied Maps identity is CID 16799175046952497779. Direct Maps retrieval was unavailable; no coordinates or Place ID were inferred. Google Hotels corroborates the address. No Google photographs were downloaded.

Update, 25 November 2026: the client supplied `public/images/img.png` through `img15.png` and requested that these replace the existing photography. All 16 supplied photographs are in the gallery. Heroes, accommodation cards and editorial sections use this collection. Former stock WebP files and unused flow PNG files were removed. `public/images/credits.json` now records the supplied files, dimensions and checksums. The brand logo is retained. The shared collection does not establish which room inventory or Petal Inn property each photograph represents.

## Admin workflow

Configure Supabase environment variables and apply the existing migrations, including `20261124010000_visual_media_controls.sql`. Sign in with a staff account assigned to the intended property. In Gallery, upload JPEG, PNG or WebP (maximum 8 MB), enter caption and rights note, confirm publication rights, select room association where appropriate and publish. Edit/replace retains the media identity; hide removes public visibility; usage/remove reviews hero and logo references and queues retryable storage cleanup.

In Hero Slides, assign published uploaded desktop/mobile images to slides. Uploaded photographs are scoped to each hotel. A partially configured slider fills up to four slots with enabled local samples. Disabling sample photography is respected, even if fewer than four slides remain. Room photographs must be associated with the actual room; property photographs are not represented as a specific room.

Supabase uploads cannot be verified live without configured credentials and a staff session. Automated checks cover database permissions and cross-property associations. Browser visual verification is outstanding because the browser runtime failed to initialize (`Cannot redefine property: process`). HTTP checks cover optimized images at 640/1920 widths and desktop/mobile page markup; they do not establish actual viewport layout.
