'use strict';
// Navigation ribbons omit driveway/vehicle-to-lane connectors; driving keeps them.
function navigationRibbon(route){const points=route.map(p=>({...p}));if(points.length<3)return points;const aligned=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy);if(l<.01)return false;const q=nearSegment({x:(a.x+b.x)/2,y:(a.y+b.y)/2}),s=citySegments[q.index],sx=s.b.x-s.a.x,sy=s.b.y-s.a.y;return Math.abs((dx*sx+dy*sy)/(l*Math.hypot(sx,sy)))>.87};
let first=0,last=points.length-1,d=0;while(first+2<last&&d<160&&!aligned(points[first],points[first+1])){d+=dist(points[first],points[first+1]);first++}d=0;while(last-2>first&&d<160&&!aligned(points[last-1],points[last])){d+=dist(points[last-1],points[last]);last--}
return points.slice(first,last+1)}
function initLaneNavigation(){
// Destinations belong on the sidewalk; their arrival point remains on the road.
for(const p of places){const q=nearSegment(p),s=citySegments[q.index],a=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x),nx=-Math.sin(a),ny=Math.cos(a),side=land({x:q.x+nx*(s.road.width/2+15),y:q.y+ny*(s.road.width/2+15)})?1:-1;
if(p===riderHome){p.markerX=q.x+nx*side*(s.road.width/2+15);p.markerY=q.y+ny*side*(s.road.width/2+15);continue}
p.x=q.x+nx*side*(s.road.width/2+15);p.y=q.y+ny*side*(s.road.width/2+15);if(road(p.x,p.y)){let found=false;for(let r=s.road.width/2+18;r<450&&!found;r+=12)for(let k=0;k<32;k++){const a=k*Math.PI/16,c={x:q.x+Math.cos(a)*r,y:q.y+Math.sin(a)*r};if(land(c)&&!road(c.x,c.y)){p.x=c.x;p.y=c.y;found=true;break}}}const aq=nearSegment(p),ar=citySegments[aq.index].road,ad=dist(p,aq)||1;p.arrival={x:aq.x+(p.x-aq.x)/ad*Math.max(0,ar.width/2-22),y:aq.y+(p.y-aq.y)/ad*Math.max(0,ar.width/2-22)};
}
const centerRoute=cityRoute;cityRoute=function(a,b){const endpoint=b.arrival||b,base=centerRoute(nearSegment(a),nearSegment(endpoint)),source=base.points.filter((p,i,arr)=>!i||dist(p,arr[i-1])>.1);if(source.length<2)return base;const points=[];
for(let i=0;i<source.length;i++){const p=source[i],prev=source[Math.max(0,i-1)],next=source[Math.min(source.length-1,i+1)],dx=next.x-prev.x,dy=next.y-prev.y,l=Math.hypot(dx,dy)||1,s=citySegments[nearSegment(p).index],offset=s.road.lanes===4?48:16;const candidate={x:p.x-dy/l*offset,y:p.y+dx/l*offset};points.push(road(candidate.x,candidate.y)?candidate:{...p})}
points.push({...endpoint});
// Round junctions without allowing smoothing to cut across a block.
for(let pass=0;pass<3;pass++){const smooth=[points[0]];for(let i=1;i<points.length-1;i++){const p=points[i],a=points[i-1],b=points[i+1],r=Math.min(24,dist(a,p)*.22,dist(p,b)*.22),da=dist(a,p)||1,db=dist(p,b)||1,u={x:p.x+(a.x-p.x)*r/da,y:p.y+(a.y-p.y)*r/da},v={x:p.x+(b.x-p.x)*r/db,y:p.y+(b.y-p.y)*r/db};if(road(u.x,u.y)&&road(v.x,v.y)&&road((u.x+v.x)/2,(u.y+v.y)/2))smooth.push(u,v);else smooth.push(p)}smooth.push(points.at(-1));points.splice(0,points.length,...smooth)}
// Project any off-pavement corner samples back onto the actual road geometry.
const safe=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(dist(a,b)/4));for(let k=1;k<=n;k++){const t=k/n,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(!road(p.x,p.y)){const q=nearSegment(p);p.x=q.x;p.y=q.y}safe.push(p)}}
let length=0;for(let i=1;i<safe.length;i++)length+=dist(safe[i-1],safe[i]);return {points:safe,length,key:base.key}};
const oldAutoDestination=autoDestination;autoDestination=function(){const p=oldAutoDestination();return p.arrival||p};autoTrip=null;
}

// Last-resort congestion recovery: recycle only stalled traffic, outside the viewport.
const trafficBeforeRecovery=updateLaneTraffic;
updateLaneTraffic=function(dt=0){const old=new Map(traffic.map(c=>[c,{x:c.x,y:c.y}]));trafficBeforeRecovery(dt);if(!dt)return;for(let i=0;i<traffic.length;i++){const c=traffic[i],p=old.get(c);if(!p||c.hidden||c.flying)continue;const waitingRed=vehicleHasRed(c);c.jamSeconds=waitingRed||dist(c,p)>.15?0:(c.jamSeconds||0)+dt;if(c.jamSeconds<7)continue;const minDistance=Math.max(1000,typeof cityCamera==='object'&&cityCamera.scale?Math.hypot(cw,ch)/cityCamera.scale:1000);const candidates=laneEdges.filter(e=>{const p=e.points[Math.floor(e.points.length/2)];return dist(p,player)>minDistance&&dist(p,player)<2400});let placed=false;for(const e of candidates){const lane={edge:e,dir:i%2?1:-1,at:e.length*.5,offset:e.lanes===4?48:16,arc:null},pose=laneSample(e,lane.at,lane.dir,lane.offset);if(traffic.some(o=>o!==c&&!o.hidden&&dist(o,pose)<100))continue;c.lane=lane;Object.assign(c,pose);c.speed=30;c.jamSeconds=0;placed=true;break}if(!placed){c.hidden=true;c.respawnAt=elapsed+2;c.jamSeconds=0}}};
