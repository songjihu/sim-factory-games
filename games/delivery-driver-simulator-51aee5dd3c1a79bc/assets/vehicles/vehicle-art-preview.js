'use strict';
// Art-only adapter. No gameplay values, ownership, saves or collision sizes change.
const vehicleArt={ids:['byd-seagull','xiaomi-su7','xiaomi-yu7','aito-m9','maextro-s800','li-l9','nio-et5','xp-p7','zeekr-001','yangwang-u9'],images:new Map()};
function initVehicleArtPreview(){
 for(const id of vehicleArt.ids){const img=new Image();img.decoding='async';img.src='assets/vehicles/'+id+'-top-cartoon-v3.webp';vehicleArt.images.set(id,img)}
 const originalDraw=drawPlayerVehicle;
 drawPlayerVehicle=function(){const img=vehicleArt.images.get(garageState.selected);if(!img||!img.complete||!img.naturalWidth){originalDraw();return}ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle+Math.PI/2);ctx.imageSmoothingEnabled=true;ctx.drawImage(img,-10,-20,20,40);ctx.restore()};
 const style=document.createElement('style');style.textContent='.showroomhero .vehicle-art-side{display:block!important;width:100%!important;height:170px!important;object-fit:contain;margin:16px auto}';document.head.appendChild(style);
 const originalGarage=showGarage;
 showGarage=function(){originalGarage();const hero=document.querySelector('.showroomhero');if(!hero||!vehicleArt.ids.includes(garagePreview))return;const old=hero.querySelector('svg');if(!old)return;const side=document.createElement('img');side.className='vehicle-art-side';side.alt=(vehicleCatalog.find(v=>v.id===garagePreview)?.name||'座驾')+'侧视图';side.src='assets/vehicles/'+garagePreview+'-side-cartoon-v3.webp';side.onerror=()=>side.replaceWith(old);old.replaceWith(side)};
}
