'use strict';
let goingHome=false,homeStorage={};try{homeStorage=JSON.parse(localStorage.getItem('danwang-home'))||{}}catch{}
const homeAnchor=places.filter(p=>p.type!=='shop').sort((a,b)=>dist(a,{x:WORLD_W*.49,y:WORLD_H*.61})-dist(b,{x:WORLD_W*.49,y:WORLD_H*.61}))[0]||places[0];
const homeSegment=citySegments[nearSegment(homeAnchor).index],homeCenter=project(homeAnchor,homeSegment.a,homeSegment.b),homeAngle=Math.atan2(homeSegment.b.y-homeSegment.a.y,homeSegment.b.x-homeSegment.a.x),homeOffset=Math.max(0,homeSegment.road.width/2-24);
const riderHome={name:'我的家 · 海棠公寓',icon:'家',type:'home',address:'霓港市海棠公寓 · 路边停车位',x:homeCenter.x-Math.sin(homeAngle)*homeOffset,y:homeCenter.y+Math.cos(homeAngle)*homeOffset};
const homeNavigationOrder={picked:true,to:riderHome};
function homeSpawn(){Object.assign(player,{x:riderHome.x,y:riderHome.y,angle:homeAngle});carVelocity=0;joy.x=joy.y=0;playerLane=null;cityPan=null;cityOverview=false;traffic.length=0;updateLaneTraffic()}
function homeSave(){try{localStorage.setItem('danwang-home',JSON.stringify({v:2,goingHome,day}))}catch{}}
function beginHomeTrip(){goingHome=true;online=false;state='playing';closeModal();openMap();homeSave();save();toast('收工啦，沿导航回海棠公寓休息')}
function arriveHome(){goingHome=false;state='end';carVelocity=0;joy.x=joy.y=0;homeSpawn();homeSave();save();modal('<div class="eyebrow">海棠公寓 · 到家了</div><h2>今天辛苦了</h2><p>已完成 '+done+' 单，配送收入 ¥'+money.toFixed(1)+'。<br>车辆已停好。休息后补满体力、饮水与电量。</p><button class="start" id="sleepnext">睡一觉 · 第 '+(day+1)+' 天出发</button>');$('sleepnext').onclick=()=>{day++;hunger=thirst=battery=energy=100;start()}}
function initHomeUI(){
places.push(riderHome);
const startBefore=start;start=function(){goingHome=false;startBefore();homeSpawn();homeSave();save();updateHUD();toast('第 '+day+' 天 · 从海棠公寓出发，平安回家')};
const finishBefore=finish;finish=function(){if(goingHome)return;finishBefore();$('again').textContent='导航回家 · 结束今天';$('again').onclick=beginHomeTrip};
const tickBefore=tick;tick=function(dt){if(!goingHome){tickBefore(dt);return}if(state!=='playing')return;hitCD=Math.max(0,hitCD-dt);drivingFactor=1;driveVehicle(dt,0,0,boost||keys.has('Shift'));updateLaneTraffic(dt);updateFlyingTraffic(dt);if(canReachStop(riderHome)&&carVelocity<1){gmAutoDrive=false;autoTrip=null}};
const hudBefore=updateHUD;updateHUD=function(){hudBefore();if(goingHome){$('nav').textContent='回家 → 海棠公寓 · '+km(distanceKm(player,riderHome));$('trafficlight').textContent='已收工 · 回家不计时'}};
const detailBeforeHome=renderMapDetail;renderMapDetail=function(){if(!viewMap)return;if(goingHome){const html='<div class="empty">回家休息 · 海棠公寓<br>到家后开始下一天</div>';if($('mapdetail').innerHTML!==html)$('mapdetail').innerHTML=html;return}detailBeforeHome()};
const miniBefore=drawMiniNavigation;drawMiniNavigation=function(c,x,y,w,h,o){miniBefore(c,x,y,w,h,goingHome?homeNavigationOrder:o);c.save();c.fillStyle='#a9f0d0';c.font='bold 8px system-ui';c.textAlign='center';c.fillText('家',x+riderHome.x/WORLD_W*w,y+riderHome.y/WORLD_H*h-6);c.restore()};
const button=document.createElement('button');button.id='gohome';button.textContent='回家收工';document.querySelector('.maptools>div').appendChild(button);button.onclick=()=>{if(goingHome){openMap();return}if(bag.length){toast('还有 '+bag.length+' 单，请先送完或转单再回家');return}remaining=0;finish()};
// Migrate the old corner spawn even when the legacy save passed its road check.
const relocate=homeStorage.v!==2||!inActiveRegion(player)||nearSegment(player).d>250;
if(relocate){homeSpawn();goingHome=false;homeStorage.goingHome=false;homeSave();save()}
if(relocate&&remaining<=0){arriveHome()}else if(homeStorage.goingHome&&homeStorage.day===day)beginHomeTrip();else if(state==='end')finish();
// A resumed session must receive the same validation as a fresh start.
const resume=$('continue');if(resume&&resume.onclick){const resumeBefore=resume.onclick;resume.onclick=()=>{resumeBefore();if(!inActiveRegion(player)||nearSegment(player).d>250)homeSpawn();save();updateHUD()}}
updateHUD();
}
