'use strict';
// Arcade handling uses the original 160–265 speed / 260–485 acceleration envelope. Real specifications only influence relative performance.
const vehicleCatalog=[
  {
    "id": "byd-seagull",
    "name": "碧亚迪 海雀",
    "price": 0,
    "color": "#a9d9b4",
    "zero100": 13,
    "topKmh": 130,
    "trim": "55kW 入门版（零百、极速为游戏估算）",
    "estimated": true,
    "source": "https://bydcarsphilippines.com/vehicles/byd-seagull",
    "asset": "byd-seagull.png",
    "speed": 160,
    "accel": 260,
    "steer": 3.2,
    "range": 120
  },
  {
    "id": "xiaomi-su7",
    "name": "某米 SU7",
    "price": 4700,
    "color": "#70c8db",
    "zero100": 2.78,
    "topKmh": 265,
    "trim": "2024 Max 双电机四驱",
    "estimated": false,
    "source": "https://ir.mi.com/system/files-encrypted/nasdaq_kms/assets/2024/03/19/5-34-07/23Q4_EN_797121_%28Xiaomi%20RA%20Eng%29_AsPrint_Fullset_1652.pdf",
    "asset": "xiaomi-su7.png",
    "speed": 239,
    "accel": 460,
    "steer": 3.99,
    "range": 240
  },
  {
    "id": "xiaomi-yu7",
    "name": "某米 YU7",
    "price": 5600,
    "color": "#de8765",
    "zero100": 3.23,
    "topKmh": 253,
    "trim": "2025 Max 四驱",
    "estimated": false,
    "source": "https://prtimes.jp/main/html/rd/p/000000172.000098799.html",
    "asset": "xiaomi-yu7.png",
    "speed": 232,
    "accel": 435,
    "steer": 3.9200000000000004,
    "range": 260
  },
  {
    "id": "aito-m9",
    "name": "问境 M9",
    "price": 6600,
    "color": "#788b98",
    "zero100": 4.9,
    "topKmh": 220,
    "trim": "双电机纯电版（官网配置表）",
    "estimated": false,
    "source": "https://hima.auto/wenjie/m9-new/configuration/",
    "asset": "aito-m9.png",
    "speed": 213,
    "accel": 310,
    "steer": 3.7300000000000004,
    "range": 280
  },
  {
    "id": "maextro-s800",
    "name": "尊境 S800",
    "price": 7700,
    "color": "#b1a9cf",
    "zero100": 4.3,
    "topKmh": 210,
    "trim": "97kWh 双电机纯电版",
    "estimated": false,
    "source": "https://hima.auto/zunjie/s800/configuration/",
    "asset": "maextro-s800.png",
    "speed": 207,
    "accel": 335,
    "steer": 3.6700000000000004,
    "range": 270
  },
  {
    "id": "li-l9",
    "name": "某想 L9",
    "price": 3900,
    "color": "#d1c5ad",
    "zero100": 5.3,
    "topKmh": 180,
    "trim": "初代双电机增程版",
    "estimated": false,
    "source": "https://ir.lixiang.com/zh-hant/news-releases/news-release-details/li-auto-inc-unveils-li-l9-its-flagship-smart-suv/",
    "asset": "li-l9.png",
    "speed": 189,
    "accel": 285,
    "steer": 3.49,
    "range": 300
  },
  {
    "id": "nio-et5",
    "name": "某来 ET5",
    "price": 2100,
    "color": "#d8bf98",
    "zero100": 4,
    "topKmh": 200,
    "trim": "双电机四驱 Sport+",
    "estimated": false,
    "source": "https://www.nioauto.gr/media/Press%20Kit/PDFS/ET5%20Pricelist.pdf",
    "asset": "nio-et5.png",
    "speed": 201,
    "accel": 360,
    "steer": 3.6100000000000003,
    "range": 220
  },
  {
    "id": "xp-p7",
    "name": "某鹏 P7",
    "price": 1650,
    "color": "#b4bec8",
    "zero100": 3.7,
    "topKmh": 230,
    "trim": "2025 750 高性能四驱",
    "estimated": false,
    "source": "https://www.xiaopeng.com/news/company_news/5489.html",
    "asset": "xp-p7.png",
    "speed": 219,
    "accel": 410,
    "steer": 3.79,
    "range": 230
  },
  {
    "id": "zeekr-001",
    "name": "某氪 001",
    "price": 3200,
    "color": "#9fbdb5",
    "zero100": 3.8,
    "topKmh": 200,
    "trim": "欧洲 Sport Edition",
    "estimated": false,
    "source": "https://www.datocms-assets.com/128969/1751963523-press-release_zeekr-001-sport-edition_eu.pdf",
    "asset": "zeekr-001.png",
    "speed": 201,
    "accel": 385,
    "steer": 3.6100000000000003,
    "range": 250
  },
  {
    "id": "yangwang-u9",
    "name": "某望 U9",
    "price": 9000,
    "color": "#e3c256",
    "zero100": 2.36,
    "topKmh": 309.19,
    "trim": "2024 标准版",
    "estimated": false,
    "source": "https://www.byd.com/us/news-list/YANGWANG-Launched-the-U9-Priced-at-1-68-Million-RMB",
    "asset": "yangwang-u9.png",
    "speed": 265,
    "accel": 485,
    "steer": 4.25,
    "range": 180
  }
];
let initialGarage={};try{initialGarage=JSON.parse(localStorage.getItem('danwang-v2-save'))||{}}catch{}
const savedGarage=initialGarage.garageState&&typeof initialGarage.garageState==='object'?initialGarage.garageState:{};if(!Array.isArray(savedGarage.owned))savedGarage.owned=[];
const legacyVehicleMap={'byd-qin':'xiaomi-su7',mona:'xp-p7','byd-yuan':'xiaomi-yu7','xp-g6':'xiaomi-yu7','byd-seal':'zeekr-001','nio-et5t':'nio-et5','li-l6':'li-l9','nio-es6':'aito-m9','xp-g9':'aito-m9','nio-ec6':'maextro-s800','li-l7':'li-l9','li-l8':'li-l9'};
const migrateVehicle=id=>legacyVehicleMap[id]||id;
const migratedUpgrades={};for(const [id,u] of Object.entries(savedGarage.upgrades||{})){const target=migrateVehicle(id),out=migratedUpgrades[target]??={};for(const key of ['motor','handling','battery'])out[key]=Math.min(3,Math.max(out[key]||0,Number(u?.[key])||0))}
const legacyAllUnlocked=(savedGarage.owned||[]).length>=16;
const migratedOwned=legacyAllUnlocked?vehicleCatalog.map(v=>v.id):(savedGarage.owned||[]).map(migrateVehicle);
const migratedSelected=migrateVehicle(savedGarage.selected);
const validIDs=new Set(vehicleCatalog.map(v=>v.id));
const garageState={wallet:Math.max(0,Number(savedGarage.wallet??initialGarage.totalMoney??initialGarage.money)||0),owned:[...new Set(['byd-seagull',...migratedOwned.filter(id=>validIDs.has(id))])],selected:'byd-seagull',upgrades:migratedUpgrades};
if(garageState.owned.includes(migratedSelected))garageState.selected=migratedSelected;
let carVelocity=0;
function currentVehicle(){return vehicleCatalog.find(v=>v.id===garageState.selected)||vehicleCatalog[0]}
function vehicleStats(){const v=currentVehicle(),u=garageState.upgrades[v.id]||{};return {...v,accel:v.accel*(1+Math.min(3,Math.max(0,u.motor||0))*.06),speed:v.speed+Math.min(3,Math.max(0,u.motor||0))*12,steer:v.steer+Math.min(3,Math.max(0,u.handling||0))*.35,range:v.range+Math.min(3,Math.max(0,u.battery||0))*30}}
function buyVehicle(id){const v=vehicleCatalog.find(v=>v.id===id);if(!v)return false;if(!garageState.owned.includes(id)){if(garageState.wallet<v.price){toast('购车资金不足，继续配送攒钱');return false}garageState.wallet=Math.round((garageState.wallet-v.price)*10)/10;garageState.owned.push(id)}garageState.selected=id;carVelocity=0;save();return true}
function upgradeVehicle(kind){if(!['motor','handling','battery'].includes(kind))return false;const id=currentVehicle().id,u=garageState.upgrades[id]??={},level=Math.max(0,u[kind]||0),cost=(level+1)*100*(1+Math.floor(vehicleCatalog.findIndex(v=>v.id===id)/4));if(level>=3||garageState.wallet<cost)return false;garageState.wallet=Math.round((garageState.wallet-cost)*10)/10;u[kind]=level+1;save();return true}
function showGarage(){const v=vehicleStats(),u=garageState.upgrades[v.id]||{};pauseDialog('新能源车库','<p class="garagebank">购车资金 <b>¥'+garageState.wallet.toFixed(1)+'</b></p><p>当前座驾：'+v.name+' · 动力 '+v.speed+' · 续航 '+v.range+' 游戏公里</p><p class="muted">送单收入自动存入资金池，跨班次保留。全部车辆为虚构命名，价格与性能均为游戏设定。</p><div class="garageupgrades">'+[['motor','动力'],['handling','操控'],['battery','电池']].map(([key,name])=>{const level=u[key]||0,cost=(level+1)*100*(1+Math.floor(vehicleCatalog.findIndex(x=>x.id===v.id)/4));return '<button data-upgrade="'+key+'" '+(level>=3||garageState.wallet<cost?'disabled':'')+'>'+name+' '+level+'/3<small>'+(level>=3?'已满级':'¥'+cost)+'</small></button>'}).join('')+'</div><div class="garagecars">'+vehicleCatalog.map((c,i)=>{const owned=garageState.owned.includes(c.id),active=c.id===v.id;return '<article><span class="carpaint" style="background:'+c.color+'"></span><div><b>'+c.name+'</b><small>动力 '+c.speed+' · 续航 '+c.range+' · 阶段 '+(i+1)+'/16</small></div><button data-car="'+c.id+'" '+(active||!owned&&garageState.wallet<c.price?'disabled':'')+'>'+(active?'驾驶中':owned?'换上':'¥'+c.price+' 购入')+'</button></article>'}).join('')+'</div>','');document.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{if(buyVehicle(b.dataset.car)){state=pausedFrom;showGarage()}});document.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{if(upgradeVehicle(b.dataset.upgrade)){state=pausedFrom;showGarage()}})}
function angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function driveVehicle(dt,dx,dy,sprint){const v=vehicleStats(),input=Math.min(1,Math.hypot(dx,dy)),gm=gmSettings.tripleSpeed?3:1;let goal=input>.08?v.speed*(sprint?1.35:1)*gm*input:0;const desired=input>.08?Math.atan2(dy,dx):player.angle,near=nearSegment(player),s=citySegments[near.index],tangent=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x);let follow=Math.abs(angleDelta(desired,tangent))<Math.PI/2?tangent:tangent+Math.PI;
// Follow a broad bend when input points along the street; deliberate lateral input selects junctions.
const along=Math.abs(angleDelta(desired,follow));let steering=along<.65?follow:desired;const turn=Math.abs(angleDelta(player.angle,steering));goal*=Math.max(.28,1-turn/Math.PI*.8);carVelocity+=Math.max(-v.accel*2*gm*dt,Math.min(v.accel*gm*dt,goal-carVelocity));
const da=angleDelta(player.angle,steering),maxTurn=v.steer*dt;player.angle+=Math.max(-maxTurn,Math.min(maxTurn,da));let traveled=0;const steps=Math.max(1,Math.ceil(carVelocity*dt/3));for(let i=0;i<steps;i++){const step=carVelocity*dt/steps,p={x:player.x+Math.cos(player.angle)*step,y:player.y+Math.sin(player.angle)*step},q=nearSegment(p);if(q.d<s.road.width/2+3){const help=q.d>3?.38:.14,px=p.x+(q.x-p.x)*help,py=p.y+(q.y-p.y)*help;if(road(px,py)){traveled+=Math.hypot(px-player.x,py-player.y);player.x=px;player.y=py;continue}}carVelocity*=.65;break}return traveled}
function drawPlayerVehicle(){const v=currentVehicle();ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.shadowColor='#14243388';ctx.shadowBlur=5;round(-19,-10,38,20,5,hitCD>0&&frame%12<6?'#f6888d':v.color);ctx.shadowBlur=0;round(-7,-8,17,16,3,'#426576');ctx.fillStyle='#d7edf0';ctx.fillRect(7,-7,4,14);ctx.fillStyle='#fff0b5';ctx.fillRect(16,-8,3,5);ctx.fillRect(16,3,3,5);ctx.fillStyle='#d68b8b';ctx.fillRect(-19,-8,3,5);ctx.fillRect(-19,3,3,5);ctx.restore()}
function initGarageUI(){const button=document.createElement('button');button.id='garageopen';button.textContent='车库';button.className='gmopen';document.querySelector('.brand').appendChild(button);button.onclick=showGarage;const oldTick=tick;tick=function(dt){if(state!=='playing'){carVelocity=0;return}oldTick(dt)};const hud=updateHUD;updateHUD=function(){hud();$('boost').innerHTML='⚡ 加速<small>'+currentVehicle().name+' · '+Math.round(carVelocity*.15)+' km/h<span id="energy" hidden>'+Math.floor(energy)+'</span></small>'};updateHUD()}
