export type HotelId = 'flower-inn' | 'petal-inn';
export type Hotel = {
  id: HotelId; name: string; tagline: string; subtitle: string; description: string;
  image: string; gallery: string[]; highlight: string; accent: string;
  location: string; address: string; rating?: number;
  amenities: string[]; checkIn: string; checkOut: string;
};
export type Room = {
  id: string; hotelId: HotelId; slug: string; name: string; subtitle: string; description: string;
  image: string; gallery: string[]; baseRate: number; inventory: number;
  guests: number; size: string; bed: string; amenities: string[];
};
// Fixed public Unsplash demo image URLs. Replace with licensed real hotel photos before launch.
const u = (id: string, w = 1500) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export const PHOTOS = {
  hero: u('photo-1566073771259-6a8506099945', 2000),
  flower: u('photo-1542314831-068cd1dbfeeb'),
  petal: u('photo-1571896349842-33c89424de2d'),
  flowerLobby: u('photo-1564501049412-61c2a3083791'),
  flowerPool: u('photo-1582719508461-905c673771fd'),
  petalLobby: u('photo-1551882547-ff40c63fe5fa'),
  restaurant: u('photo-1552566626-52f8b828add9'),
  breakfast: u('photo-1547592180-85f173990554'),
  spa: u('photo-1540555700478-4be289fbecef'),
  room1: u('photo-1611892440504-42a792e24d32'),
  room2: u('photo-1590490360182-c33d57733427'),
  room3: u('photo-1591088398332-8a7791972843'),
  room4: u('photo-1618773928121-c32242e63f39'),
  room5: u('photo-1566665797739-1674de7a421a'),
  room6: u('photo-1595576508898-0ad5c879a061'),
};
export const HOTELS: Hotel[] = [
  {
    id: 'flower-inn', name: 'Flower Inn', tagline: 'A gentler way to stay.',
    subtitle: 'Thoughtful moments, beautifully made.',
    description: 'A warm, contemporary retreat shaped around the little things that make a stay feel special. Unwind in inviting interiors and discover a more considered kind of comfort.',
    image: PHOTOS.flower, gallery: [PHOTOS.flower, PHOTOS.flowerLobby, PHOTOS.flowerPool, PHOTOS.restaurant],
    highlight: 'Serene & understated', accent: 'Sage collection',
    location: 'Location to be confirmed', address: 'Official hotel address will be added after client verification',
    amenities: ['Wi-Fi', 'Comfortable stays', 'Room service', 'Guest assistance', 'Dining options', 'Parking (confirm)'],
    checkIn: '14:00', checkOut: '11:00',
  },
  {
    id: 'petal-inn', name: 'Petal Inn', tagline: 'A little more extraordinary.',
    subtitle: 'Stay beautifully. Feel completely at home.',
    description: 'Designed for travellers who notice every detail, Petal Inn pairs graceful spaces with an effortless sense of welcome. Here, every visit feels like a fresh discovery.',
    image: PHOTOS.petal, gallery: [PHOTOS.petal, PHOTOS.petalLobby, PHOTOS.spa, PHOTOS.breakfast],
    highlight: 'Elegant & expressive', accent: 'Rose collection',
    location: 'Location to be confirmed', address: 'Official hotel address will be added after client verification',
    amenities: ['Wi-Fi', 'Comfortable stays', 'Concierge assistance', 'Dining options', 'Family-friendly rooms', 'Parking (confirm)'],
    checkIn: '14:00', checkOut: '11:00',
  },
];
export const ROOMS: Room[] = [
  { id: 'fl-classic', hotelId: 'flower-inn', slug:'classic-room', name:'Classic Room', subtitle:'Comfort in every detail', description:'A restful space with warm textures, calming tones, and everything you need to slow down.', image:PHOTOS.room1, gallery:[PHOTOS.room1,PHOTOS.room2,PHOTOS.room3], baseRate:2899, inventory:8, guests:2, size:'260 sq ft (sample)', bed:'1 Queen Bed', amenities:['Air conditioning','Wi-Fi','Smart TV','Tea & coffee','Ensuite bathroom'] },
  { id: 'fl-premier', hotelId: 'flower-inn', slug:'premier-room', name:'Premier Room', subtitle:'A little room to linger', description:'Designed to give you room to exhale, with refined furnishings and a more spacious layout.', image:PHOTOS.room2, gallery:[PHOTOS.room2,PHOTOS.room3,PHOTOS.room1], baseRate:3899, inventory:6, guests:3, size:'340 sq ft (sample)', bed:'1 King Bed', amenities:['Air conditioning','Wi-Fi','Smart TV','Work desk','Seating area'] },
  { id: 'fl-suite', hotelId: 'flower-inn', slug:'flower-suite', name:'Flower Suite', subtitle:'An elevated escape', description:'Generous interiors, elevated comfort and thoughtful details that invite you to stay longer.', image:PHOTOS.room3, gallery:[PHOTOS.room3,PHOTOS.room1,PHOTOS.room2], baseRate:5699, inventory:3, guests:4, size:'460 sq ft (sample)', bed:'1 King Bed + Sofa', amenities:['Air conditioning','Wi-Fi','Living area','Smart TV','Premium bath'] },
  { id: 'pt-classic', hotelId: 'petal-inn', slug:'deluxe-room', name:'Deluxe Room', subtitle:'A haven of easy elegance', description:'Contemporary elegance meets the warmth of home in an inviting, light-filled room.', image:PHOTOS.room4, gallery:[PHOTOS.room4,PHOTOS.room5,PHOTOS.room6], baseRate:3199, inventory:9, guests:2, size:'280 sq ft (sample)', bed:'1 Queen Bed', amenities:['Air conditioning','Wi-Fi','Smart TV','Tea & coffee','Ensuite bathroom'] },
  { id: 'pt-premier', hotelId: 'petal-inn', slug:'signature-room', name:'Signature Room', subtitle:'Curated for memorable stays', description:'A considered balance of contemporary design and welcoming warmth, ideal for longer stays.', image:PHOTOS.room5, gallery:[PHOTOS.room5,PHOTOS.room6,PHOTOS.room4], baseRate:4299, inventory:5, guests:3, size:'360 sq ft (sample)', bed:'1 King Bed', amenities:['Air conditioning','Wi-Fi','City view (sample)','Work desk','Seating area'] },
  { id: 'pt-suite', hotelId: 'petal-inn', slug:'petal-suite', name:'Petal Suite', subtitle:'Your stay, beautifully reimagined', description:'Thoughtfully planned interiors and extra space for the occasions that deserve something special.', image:PHOTOS.room6, gallery:[PHOTOS.room6,PHOTOS.room4,PHOTOS.room5], baseRate:6299, inventory:3, guests:4, size:'500 sq ft (sample)', bed:'1 King Bed + Sofa', amenities:['Air conditioning','Wi-Fi','Separate lounge','Smart TV','Premium bath'] },
];
export const AMENITY_ICONS = ['Wifi', 'Coffee', 'ConciergeBell', 'Car', 'Waves', 'BedDouble'];
export const hotelById = (id: string) => HOTELS.find((h) => h.id === id);
export const roomById = (id: string) => ROOMS.find((r) => r.id === id);
export const roomsForHotel = (id: string) => ROOMS.filter((r) => r.hotelId === id);
export const money = (amount: number) => '₹' + Math.round(amount).toLocaleString('en-IN');
