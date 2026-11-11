'use strict';
// Physical unit agreement: 1 world unit = 0.125 m; 1 simulated second = 1 real second.
const WORLD_METERS_PER_UNIT=.125;
function travelSeconds(kilometers,kph){return Math.max(0,kilometers)/Math.max(1,kph)*3600}
function timeLeft(seconds){const s=Math.max(0,Math.ceil(seconds));return s>=60?Math.floor(s/60)+'分'+String(s%60).padStart(2,'0')+'秒':s+'秒'}
function estimatedCruiseKph(){const v=vehicleStats(),base=v.speed*.45*(gmSettings.tripleSpeed?3:1),conditions=(day%3===0&&!hasVehicleSkill('rain')?.85:1)*(condition<30?.7:1)*(hunger<20||thirst<20?.65:1)*(battery<=0?.22:1);return Math.max(5,base*conditions*.7)}
function orderTravelPlan(o,origin=player){const approach=o.picked?0:distanceKm(origin,o.from),delivery=distanceKm(o.picked?origin:o.from,o.to),speed=estimatedCruiseKph();return {distance:approach+delivery,speed,driving:travelSeconds(approach+delivery,speed),preparation:o.picked?0:Math.max(0,o.readyAt-elapsed-travelSeconds(approach,speed)),buffer:30}}
function orderBudgetSeconds(o,origin=player){const p=orderTravelPlan(o,origin);return Math.ceil(p.driving+p.preparation+p.buffer)}
function initTravelTime(){
distanceKm=(a,b)=>cityRoute(a,b).length*WORLD_METERS_PER_UNIT/1000;
clockAt=seconds=>{const minutes=600+Math.floor(seconds/60);return String(Math.floor(minutes/60)%24).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')};
const spawnBefore=spawn;spawn=function(){spawnBefore();for(const o of market)o.duration=orderBudgetSeconds(o)};
const acceptBefore=accept;accept=function(id){const o=market.find(o=>o.id===id);if(o)o.duration=orderBudgetSeconds(o);acceptBefore(id)};
// Preserve existing orders and give enough time for the corrected physical route.
if(initialGarage.timingVersion!==1)for(const o of bag)o.deadline=Math.max(o.deadline,elapsed+orderBudgetSeconds(o,riderHome));for(const o of market)o.duration=orderBudgetSeconds(o);
const detailBefore=detail;detail=function(o){return detailBefore(o).replace(/剩余 \d+ 分钟/g,'剩余 '+timeLeft(o.deadline-elapsed)).replace(/\d+ 分钟内/g,timeLeft(o.duration)+'内')};
const marketBefore=marketCard;marketCard=function(o){const p=orderTravelPlan(o);return marketBefore(o).replace('<p class="ready">','<p class="ready">行驶预计 '+timeLeft(p.driving)+' · 按 '+Math.round(p.speed)+' km/h</p><p class="ready">')};
const hudBefore=updateHUD;updateHUD=function(){hudBefore();const o=target();if(!o||goingHome)return;const distance=distanceKm(player,stop(o)),actual=carVelocity*.45,speed=actual>=10?actual:estimatedCruiseKph(),eta=travelSeconds(distance,speed);const nav=$('nav');nav.textContent=nav.textContent.replace(/剩\s*\d+ 分钟/,'时限 '+timeLeft(o.deadline-elapsed))+' · 行驶预计 '+timeLeft(eta)+'（'+Math.round(speed)+' km/h）';};
updateHUD();save();
}

