import {mkdir,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
// Explicit stock sources, never Google Maps imagery. These are illustrative, not property photos.
const assets=[
 ['hotels/flower-inn/hero-1','photo-1566073771259-6a8506099945','Illustrative hotel terrace'],
 ['hotels/flower-inn/hero-2','photo-1611892440504-42a792e24d32','Illustrative warm guest bedroom'],
 ['hotels/flower-inn/hero-3','photo-1564501049412-61c2a3083791','Illustrative reception interior'],
 ['hotels/flower-inn/exterior','photo-1542314831-068cd1dbfeeb','Illustrative hotel exterior'],
 ['hotels/flower-inn/reception','photo-1564501049412-61c2a3083791','Illustrative hotel reception'],
 ['hotels/flower-inn/room-1','photo-1611892440504-42a792e24d32','Illustrative bedroom with warm tones'],
 ['hotels/flower-inn/room-2','photo-1590490360182-c33d57733427','Illustrative spacious bedroom'],
 ['hotels/petal-inn/hero-1','photo-1571896349842-33c89424de2d','Illustrative resort architecture'],
 ['hotels/petal-inn/hero-2','photo-1618773928121-c32242e63f39','Illustrative contemporary bedroom'],
 ['hotels/petal-inn/hero-3','photo-1551882547-ff40c63fe5fa','Illustrative hotel lounge'],
 ['hotels/petal-inn/exterior','photo-1571896349842-33c89424de2d','Illustrative resort exterior'],
 ['hotels/petal-inn/reception','photo-1551882547-ff40c63fe5fa','Illustrative reception lounge'],
 ['hotels/petal-inn/room-1','photo-1618773928121-c32242e63f39','Illustrative contemporary bedroom'],
 ['hotels/petal-inn/room-2','photo-1595576508898-0ad5c879a061','Illustrative guest suite'],
 ['accommodations/one-bhk','photo-1591088398332-8a7791972843','Illustrative apartment bedroom'],
 ['accommodations/two-bhk','photo-1600210492486-724fe5c67fb0','Illustrative apartment living room'],
 ['accommodations/three-bhk','photo-1600607687939-ce8a6c25118c','Illustrative apartment interior'],
 ['accommodations/deluxe-room','photo-1566665797739-1674de7a421a','Illustrative double bedroom'],
 ['accommodations/premium-room','photo-1590490360182-c33d57733427','Illustrative premium bedroom'],
 ['common/hotel-placeholder','photo-1542314831-068cd1dbfeeb','Illustrative hotel architecture'],
 ['common/room-placeholder','photo-1611892440504-42a792e24d32','Illustrative bedroom'],
 ['common/gallery-placeholder','photo-1551882547-ff40c63fe5fa','Illustrative interior'],
 ['common/dining','photo-1552566626-52f8b828add9','Illustrative dining interior'],
];
const fetched=new Map();const manifest=[];
for(const [name,id,alt] of assets){
 const url=`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=82`;
 if(!fetched.has(id)){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`Image download failed: ${id} (${response.status})`);fetched.set(id,Buffer.from(await response.arrayBuffer()));}
 const buffer=await sharp(fetched.get(id)).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:78,effort:5}).toBuffer();
 const file=`public/images/${name}.webp`;await mkdir(dirname(file),{recursive:true});await writeFile(file,buffer);
 const {width,height}=await sharp(buffer).metadata();manifest.push({file,source:url,license:'https://unsplash.com/license',alt,width,height,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex'),illustrative:true});
 console.log(`${file}: ${width}×${height}, ${Math.round(buffer.length/1024)} KB`);
}
await writeFile('public/images/credits.json',JSON.stringify({purpose:'Licensed illustrative website preview; not authentic Flower Inn or Petal Inn photographs.',retrieved:'2026-11-24',assets:manifest},null,2)+'\n');
