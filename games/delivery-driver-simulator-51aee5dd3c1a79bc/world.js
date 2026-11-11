'use strict';
// One continuous world. Rendering uses cached viewport tiles, never gameplay sectors.
const WORLD_W=16992,WORLD_H=13332,activeRegion=0;
const regionBounds={x:0,y:0,w:WORLD_W,h:WORLD_H};
let worldStored={};try{worldStored=JSON.parse(localStorage.getItem('danwang-v2-save'))||{}}catch{}
const gmSettings={disableLights:!!worldStored.gmSettings?.disableLights,tripleSpeed:!!worldStored.gmSettings?.tripleSpeed};
function inActiveRegion(p,pad=0){return p.x>=pad&&p.y>=pad&&p.x<=WORLD_W-pad&&p.y<=WORLD_H-pad}
function regionName(){return '霓港全城'}
const waterShapes=[shape([[85,-20],[250,-20],[285,35],[268,95],[215,125],[220,155],[170,167],[125,147],[90,105],[65,45]]),shape([[655,900],[672,924],[662,952],[630,985],[619,1008],[632,1042],[659,1090],[643,1115],[616,1051],[603,1015],[612,981],[644,948],[655,927],[644,908]])];
landShapes.splice(0,landShapes.length,
shape([[-80,-80],[920,-80],[915,135],[880,255],[850,335],[825,398],[795,461],[780,535],[802,605],[810,673],[790,721],[761,773],[746,867],[726,951],[680,1035],[635,1135],[-80,1135]]),
shape([[1174,476],[1215,482],[1244,533],[1263,591],[1279,663],[1260,751],[1235,831],[1204,889],[1163,869],[1115,814],[1084,737],[1067,656],[1076,575],[1098,522],[1141,495]]),
shape([[998,154],[1029,189],[1075,255],[1114,311],[1159,362],[1194,420],[1208,466],[1184,491],[1152,472],[1124,426],[1092,408],[1052,421],[1011,411],[974,402],[981,384],[1025,359],[1056,365],[1075,383],[1090,370],[1062,327],[1028,287],[1008,239],[989,194]]),
shape([[923,866],[969,841],[1018,820],[1062,837],[1095,877],[1133,932],[1126,968],[1088,990],[1032,1004],[984,978],[946,927]]),
shape([[845,583],[865,566],[886,567],[893,584],[878,603],[856,607]]),
shape([[909,559],[936,548],[949,560],[937,580],[917,582]]),
shape([[974,536],[995,528],[1009,543],[995,560],[980,557]]),
shape([[832,736],[851,731],[867,743],[864,771],[845,779],[829,762]]),
shape([[1010,713],[1034,718],[1043,759],[1034,784],[1015,779],[1006,747]]),
shape([[775,1008],[800,1010],[815,1039],[801,1063],[777,1052]])
);
Object.assign(cityExtent,{x:-120,y:-100,w:WORLD_W+240,h:WORLD_H+200});
cityRoads.forEach(r=>{const xs=r.points.map(p=>p.x),ys=r.points.map(p=>p.y);r.bounds={x:Math.min(...xs),y:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)}});
citySegments.forEach(s=>s.overWater=!land({x:(s.a.x+s.b.x)/2,y:(s.a.y+s.b.y)/2}));
// Keep all original named destinations, snapping each to the approved continuous graph.
places.forEach(p=>{let q=nearSegment(p);if(!land(q)){let best=null;for(const s of citySegments){if(s.overWater)continue;const a=project(p,s.a,s.b),d=dist(p,a);if(land(a)&&(!best||d<best.d))best={...a,d}}if(best)q=best}p.x=q.x;p.y=q.y});citySpawn={x:places[0].x,y:places[0].y};
cityMigrateSave=function(s){if(s.cityVersion===CITY_VERSION)return;const known=new Set(places.map(p=>p.name));s.bag=(s.bag||[]).filter(o=>known.has(o.from?.name)&&known.has(o.to?.name));s.market=(s.market||[]).filter(o=>known.has(o.from?.name)&&known.has(o.to?.name));const old=s.player&&nearSegment(s.player);s.player=old&&old.d<200?{x:old.x,y:old.y,angle:s.player.angle||0}:{...citySpawn,angle:0};s.cityVersion=CITY_VERSION;for(const o of s.bag)o.deadline=Math.max(o.deadline,s.elapsed+90)};

function terrainPath(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath()}
function renderWorldTerrain(c,b,detail){
c.fillStyle='#6698b5';c.fillRect(b.x,b.y,b.w,b.h);
landShapes.forEach((p,i)=>{terrainPath(c,p);c.strokeStyle='#477b90';c.lineWidth=42;c.lineJoin='round';c.stroke();c.strokeStyle=i===1?'#ecdbad':'#c3c4a0';c.lineWidth=i===1?24:10;c.stroke();c.fillStyle=i===0?'#8da98d':i===1?'#afba9f':'#9cb29a';c.fill()});
waterShapes.forEach(p=>{terrainPath(c,p);c.strokeStyle='#b5c2a1';c.lineWidth=12;c.stroke();c.fillStyle='#689caf';c.fill()});
if(!detail)return;
for(let y=Math.floor(b.y/92)*92;y<b.y+b.h;y+=92)for(let x=Math.floor(b.x/110)*110;x<b.x+b.w;x+=110){if(land({x,y}))continue;c.strokeStyle='#c8e0e344';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+16,y-6,x+32,y);c.quadraticCurveTo(x+48,y+6,x+64,y);c.stroke()}
for(let y=Math.floor(b.y/55)*55;y<b.y+b.h;y+=55)for(let x=Math.floor(b.x/55)*55;x<b.x+b.w;x+=55){const p={x,y};if(!land(p))continue;const q=nearSegment(p),n=noise(x,y);if(q.d<citySegments[q.index].road.width/2+20)continue;if(q.d>220||n<.3){if(n>.45)continue;c.fillStyle='#719878';c.beginPath();c.ellipse(x,y,12+n*18,9+n*12,0,0,7);c.fill();continue}const w=18+noise(x+3,y)*24,h=18+noise(x,y+3)*25;if([[x+w,y],[x,y+h],[x+w,y+h]].some(([x,y])=>!land({x,y})||nearSegment({x,y}).d<90))continue;c.fillStyle='#405f5540';c.fillRect(x+4,y+5,w,h);c.fillStyle=['#c5c9b8','#b5c0b2','#aab8ad','#c9bdaf'][Math.floor(n*4)];c.fillRect(x,y,w,h);c.strokeStyle='#7e9182';c.lineWidth=1;c.strokeRect(x,y,w,h)}
}
function renderWorldRoads(c,b,bridges=true){const list=cityRoads.filter(r=>r.bounds.right>=b.x-30&&r.bounds.x<=b.x+b.w+30&&r.bounds.bottom>=b.y-30&&r.bounds.y<=b.y+b.h+30);list.forEach(r=>strokeRoad(c,r,r.width+7,'#5d7974'));list.forEach(r=>strokeRoad(c,r,r.width+2,'#dad9bf'));list.forEach(r=>strokeRoad(c,r,r.width-3,'#8a9b90'));if(bridges){c.strokeStyle='#d1d9d2';c.lineWidth=2;for(const s of citySegments){if(!s.overWater||Math.max(s.a.x,s.b.x)<b.x-30||Math.min(s.a.x,s.b.x)>b.x+b.w+30||Math.max(s.a.y,s.b.y)<b.y-30||Math.min(s.a.y,s.b.y)>b.y+b.h+30)continue;const angle=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x),ox=Math.sin(angle)*(s.road.width/2+2),oy=-Math.cos(angle)*(s.road.width/2+2);for(const sign of [-1,1]){c.beginPath();c.moveTo(s.a.x+ox*sign,s.a.y+oy*sign);c.lineTo(s.b.x+ox*sign,s.b.y+oy*sign);c.stroke()}}}list.forEach(r=>drawLaneMarkings(c,r))}
const worldTiles=new Map(),WORLD_TILE=640;
function buildWorldOverview(){cityBase=document.createElement('canvas');const ratio=1600/cityExtent.w;cityBase.width=1600;cityBase.height=Math.ceil(cityExtent.h*ratio);const c=cityBase.getContext('2d');c.scale(ratio,ratio);c.translate(-cityExtent.x,-cityExtent.y);renderWorldTerrain(c,cityExtent,false);cityRoads.forEach(r=>strokeRoad(c,r,62,'#ded9bb'));cityRoads.forEach(r=>strokeRoad(c,r,28,'#617e79'))}
function drawWorldView(c,b){if(cityOverview){c.drawImage(cityBase,cityExtent.x,cityExtent.y,cityExtent.w,cityExtent.h);return}const pad=40;for(let y=Math.floor(b.y/WORLD_TILE);y<=Math.floor((b.y+b.h)/WORLD_TILE);y++)for(let x=Math.floor(b.x/WORLD_TILE);x<=Math.floor((b.x+b.w)/WORLD_TILE);x++){const key=x+','+y;let tile=worldTiles.get(key);if(!tile){tile=document.createElement('canvas');tile.width=tile.height=WORLD_TILE+pad*2;const tc=tile.getContext('2d'),bounds={x:x*WORLD_TILE-pad,y:y*WORLD_TILE-pad,w:WORLD_TILE+pad*2,h:WORLD_TILE+pad*2};tc.translate(-bounds.x,-bounds.y);renderWorldTerrain(tc,bounds,true);renderWorldRoads(tc,bounds,true);worldTiles.set(key,tile)}else{worldTiles.delete(key);worldTiles.set(key,tile)}c.drawImage(tile,pad,pad,WORLD_TILE,WORLD_TILE,x*WORLD_TILE,y*WORLD_TILE,WORLD_TILE,WORLD_TILE)}while(worldTiles.size>24)worldTiles.delete(worldTiles.keys().next().value)}
function showGM(){pauseDialog('GM 测试面板','<p>全城自由驾驶 · 水陆海桥地图</p><div class="gmgrid"><button id="gmlights">红绿灯：'+(gmSettings.disableLights?'已关闭':'正常')+'<small>点击切换</small></button><button id="gmspeed">驾驶速度：'+(gmSettings.tripleSpeed?'3 倍':'1 倍')+'<small>不加速倒计时</small></button></div><p class="muted">开关会随本机存档保存。</p>','');$('gmlights').onclick=()=>{gmSettings.disableLights=!gmSettings.disableLights;save();state=pausedFrom;showGM()};$('gmspeed').onclick=()=>{gmSettings.tripleSpeed=!gmSettings.tripleSpeed;save();state=pausedFrom;showGM()}}
function initWorldUI(){const button=document.createElement('button');button.id='gmopen';button.textContent='GM';button.className='gmopen';document.querySelector('.brand').appendChild(button);button.onclick=showGM;const hud=updateHUD;updateHUD=function(){hud();$('trafficlight').textContent=gmSettings.disableLights?'GM · 红绿灯已关闭':'前方路口 · '+trafficLight;$('weather').textContent='全城开放 · '+districtAt(player)+' · '+(gmSettings.tripleSpeed?'GM 3×':'正常驾驶')};updateHUD()}
