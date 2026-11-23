# Flower Inn और Petal Inn — Next.js Project चलाने का आसान तरीका

आपको इस ZIP में दोनों होटलों की responsive website और admin dashboard का interactive **demo frontend** मिलेगा।

## Windows पर कैसे चलाएँ

1. ZIP extract करें।
2. VS Code में `flower-petal-hotel` folder खोलें।
3. Terminal → New Terminal खोलें।
4. नीचे दिए commands चलाएँ:

```powershell
node -v
npm install
Copy-Item .env.example .env.local
npm run dev
```

5. Chrome में खोलें: `http://localhost:3000`
6. Admin preview: `http://localhost:3000/admin`

Node.js 20.9+ होना चाहिए। पहली बार dependencies download करने के लिए internet चाहिए।

## इस ZIP में क्या चलता है?

- एक website पर Flower Inn और Petal Inn
- Home, hotels, rooms, room detail, gallery, offers, contact, FAQ pages
- Date, hotel, guests चुनकर available **demo** rooms खोजना
- Test guest details भरकर **demo booking** करना
- Booking summary page
- Admin में sample bookings देखना और status बदलना
- Admin से room की date-wise कीमत बदलना और वही कीमत search में दिखना
- Sample inventory block करना, reports और CSV export
- Reviews की reply draft बनाना और Google review URL से QR preview बनाना
- SEO tasks और CMS homepage heading बदलना

## कीमत कैसे बदलें?

1. `/admin/pricing` खोलें।
2. Hotel चुनें, Room चुनें।
3. Date range और प्रति रात price भरें।
4. Save करें।
5. `/search` में वही dates select करें। Updated demo rate दिखेगा।

## Booking कैसे check करें?

1. `/search` खोलें।
2. Hotel, check-in, check-out और guest select करें।
3. Room चुनें और checkout page पर **test** details डालें।
4. **Confirm demo booking** दबाएँ।
5. `/admin/bookings` में record देखें।

## बहुत जरूरी

**यह अभी production-ready hotel software नहीं है।** इसमें real Supabase authentication/database connection, live payment, OTA, Google Business Profile integration या customer notifications चालू नहीं हैं। Booking और prices सिर्फ इसी browser के localStorage में रहते हैं। किसी असली guest की booking इस demo में न लें।

Supabase का starter SQL `supabase/migrations/` folder में रखा है, लेकिन उसे किसी live database पर apply नहीं किया गया है। Full production system बनाने के लिए README और `docs/production-checklist.md` follow करें।

## Login के बारे में

Live login/signup अभी जानबूझकर disabled है क्योंकि केवल frontend से सुरक्षित authentication देना ठीक नहीं है। Backend और Supabase Auth जोड़ने के बाद customer और hotel staff login enable होंगे।

## अगर error आए

```powershell
npm install
npm run typecheck
npm run build
```

इन commands का output देखकर dependency/type errors ठीक किए जा सकते हैं। ZIP बनाने वाले offline environment में npm package install उपलब्ध नहीं था, इसलिए यहाँ Next.js production build नहीं चल सका।
