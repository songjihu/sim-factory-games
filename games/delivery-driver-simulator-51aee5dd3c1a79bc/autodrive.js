'use strict';
let gmAutoDrive=false,autoTrip=null;
function autoDestination(){const order=target();return goingHome?riderHome:order?stop(order):riderHome}
function initAutoDrive(){
const panelBefore=showGM;showGM=function(){panelBefore();const b=document.createElement('button');b.id='gmautodrive';b.innerHTML='自动导航驾驶：'+(gmAutoDrive?'已开启':'已关闭')+'<small>点击'+(gmAutoDrive?'关闭':'开启')+' · 手动操作可接管</small>';document.querySelector('.gmgrid').appendChild(b);b.onclick=()=>{gmAutoDrive=!gmAutoDrive;autoTrip=null;if(gmAutoDrive){joy.x=joy.y=0;keys.clear();resumeDialog();openMap();toast('GM 自动驾驶已开启 · 手动操作随时接管')}else{state=pausedFrom;showGM()}}};$('gmopen').onclick=showGM;
const manualDrive=driveVehicle;driveVehicle=function(dt,dx,dy,sprint){
if(!gmAutoDrive)return manualDrive(dt,dx,dy,sprint);
if(Math.hypot(joy.x,joy.y)>.08||['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys.has(k))){gmAutoDrive=false;autoTrip=null;toast('已切换手动驾驶');return manualDrive(dt,dx,dy,sprint)}
const destination=autoDestination();if(dist(player,destination)<25){carVelocity=0;return}
if(!autoTrip||autoTrip.destination!==destination||dist(player,autoTrip.last)>180){const points=cityRoute(player,destination).points.map(p=>({...p}));if(points.length<2)return;autoTrip={destination,...makeLaneGeometry(points),at:0,lateral:0,last:{...player}}}
const trip=autoTrip,base=laneSample(trip,trip.at,1,0),tx=Math.cos(base.angle),ty=Math.sin(base.angle),nx=-ty,ny=tx,near=directionalRoad(base,0),four=near&&near.s.road.lanes===4;
const cars=traffic.filter(c=>!c.hidden&&!c.flying),relative=c=>{const dx=c.x-base.x,dy=c.y-base.y;return {front:dx*tx+dy*ty,side:dx*nx+dy*ny,heading:Math.cos((c.angle||0)-base.angle)}};
const leader=cars.map(c=>({c,...relative(c)})).filter(c=>c.front>0&&c.front<220&&Math.abs(c.side)<24&&c.heading>.5).sort((a,b)=>a.front-b.front)[0];
const atJunction=cityJunctions.some(p=>dist(p,base)<100),passingClear=four&&!atJunction&&cars.every(c=>{const r=relative(c);return !(r.front>-100&&r.front<220&&Math.abs(r.side+32)<27)}),outerClear=cars.every(c=>{const r=relative(c);return !(r.front>-85&&r.front<150&&Math.abs(r.side)<27)});
let wanted=trip.lateral< -8?-32:0;if(leader&&passingClear)wanted=-32;if(wanted<0&&(!four||atJunction||(!leader&&outerClear)))wanted=0;
const lateral=trip.lateral+Math.max(-24*dt,Math.min(24*dt,wanted-trip.lateral));let goal=vehicleStats().speed*(gmSettings.tripleSpeed?3:1)*drivingFactor;if(wanted!==0||Math.abs(lateral)>1)goal=Math.min(goal,180);if(vehicleHasRed(player))goal=0;else if(player.rightOnRedPermit)goal=Math.min(goal,35);
for(const c of cars){const r=relative(c);if(r.front>0&&r.front<150&&Math.abs(r.side-lateral)<27){const safe=55+carVelocity*.3,available=Math.max(0,r.front-safe);goal=Math.min(goal,available*1.8+(r.heading>.5?Math.max(0,c.speed||0):0));if(r.front<55)goal=0}}
carVelocity+=(goal-carVelocity)*(1-Math.exp(-dt*(goal<carVelocity?9:3)));let budget=carVelocity*dt;
// Validate each swept step; no contact launches or passing through another vehicle.
const steps=Math.max(1,Math.ceil(Math.max(budget,Math.abs(lateral-trip.lateral))/3)),oldLateral=trip.lateral;let blocked=false;
for(let i=1;i<=steps;i++){const at=Math.min(trip.length,trip.at+budget/steps),side=oldLateral+(lateral-oldLateral)*i/steps,pose=laneSample(trip,at,1,side);if((!road(pose.x,pose.y)&&(road(player.x,player.y)||nearSegment(pose).d>nearSegment(player).d+.001))||cars.some(c=>dist(c,pose)<70&&vehicleOverlap(pose,c))){carVelocity=Math.max(0,carVelocity-vehicleStats().accel*8*dt);blocked=true;break}trip.at=at;trip.lateral=side;Object.assign(player,pose)}
trip.last={...player};if(trip.at>=trip.length-.1){carVelocity=0;autoTrip=null}

};
}
