'use strict';
// All caches are bounded or weak: driving through new districts cannot grow them forever.
function initRuntimePerformance(){
const routes=new Map();let pointCount=0;
const routeBefore=cityRoute;
cityRoute=function(a,b){
 const end=b.arrival||b;
 // Reuse is limited to less than one world metre; destination coordinates remain exact.
 const key=[Math.round(a.x/6),Math.round(a.y/6),end.x,end.y].join(':');
 const cached=routes.get(key);
 if(cached&&dist(a,cached.origin)<=4.3){routes.delete(key);routes.set(key,cached);return cached.route}
 const route=routeBefore(a,b);
 if(cached){pointCount-=cached.route.points.length;routes.delete(key)}
 routes.set(key,{origin:{x:a.x,y:a.y},route});pointCount+=route.points.length;
 while(routes.size>96||pointCount>30000){const oldest=routes.keys().next().value;pointCount-=routes.get(oldest).route.points.length;routes.delete(oldest)}
 return route;
};
const ribbons=new WeakMap(),ribbonBefore=navigationRibbon;
navigationRibbon=function(points){let ribbon=ribbons.get(points);if(!ribbon){ribbon=ribbonBefore(points);ribbons.set(points,ribbon)}return ribbon};
const dashes=new WeakMap();
drawWorldRouteDashes=function(c,points){
 let pieces=dashes.get(points);
 if(!pieces){pieces=[];for(let i=1;i<points.length;i++)pieces.push(...worldDashPieces(points[i-1],points[i]));dashes.set(points,pieces)}
 c.setLineDash([]);c.beginPath();for(const [a,b]of pieces){c.moveTo(a.x,a.y);c.lineTo(b.x,b.y)}
 c.strokeStyle='#e1fffbc2';c.lineWidth=2;c.lineCap='round';c.stroke();
};
// Text does not need animation-rate route searches and DOM writes. Actions refresh immediately.
const hudBefore=updateHUD;let hudAt=-Infinity,hudKey='';
updateHUD=function(){
 const o=target(),key=[state,tab,viewMap,day,sound,online,garageState.selected,targetId,o?.picked,bag.length,market.length,done,money,garageState.wallet,goingHome,gmAutoDrive,gmSettings.tripleSpeed].join(':');
 if(key===hudKey&&elapsed>=hudAt&&elapsed-hudAt<.1)return;
 hudAt=elapsed;hudKey=key;hudBefore();
};
// Exposed only as diagnostics for bounded-cache regression checks.
window.drivingPerformanceStats=()=>({routes:routes.size,routePoints:pointCount,dashCells:roadDashLookup.size});
}
