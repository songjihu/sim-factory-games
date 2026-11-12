'use strict';
const compactDrivingHUD=true;
function initCompactHUD(){
 const before=updateHUD;
 updateHUD=function(){
  before();
  const order=goingHome?homeNavigationOrder:target(),destination=order?stop(order):null;
  const lines=[];
  if(destination){
   lines.push((goingHome?'回家':order.picked?'送餐':'取餐')+' · '+destination.name.replace('我的家 · ',''));
   const distance=distanceKm(player,destination);
   lines.push(km(distance)+(goingHome?'':' · '+(order.deadline<elapsed?'超时':'余 '+timeLeft(order.deadline-elapsed))));
   const speed=carVelocity*.45>=10?carVelocity*.45:estimatedCruiseKph();
   lines.push('预计 '+timeLeft(travelSeconds(distance,speed)));
  }else lines.push('自由驾驶');
  lines.push(gmSettings.disableLights?'信号灯关闭':trafficLight==='无信号路口'?'路口畅通':trafficLight);
  if(policeChase)lines.push(policeChase.escape>0?'脱离 '+Math.min(4,policeChase.escape).toFixed(1)+'/4s':'追逐 · 甩开90m');
  const text=lines.join('\n');if($('nav').textContent!==text)$('nav').textContent=text;
 };
 updateHUD();
}
