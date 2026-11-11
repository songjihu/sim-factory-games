'use strict';
let gameReady=false,gameLoopStarted=false;
function initGameReady(){
if(gameReady)return;
if(!citySegments.length||!road(riderHome.x,riderHome.y))throw Error('家门口路面初始化失败');
const startBefore=start;start=function(){if(!gameReady)return;startBefore();homeSpawn();gmAutoDrive=false;autoTrip=null;cityPan=null;cityOverview=false;openMap();resize();save();updateHUD()};
for(const id of ['start','startv2']){const button=$(id);if(button)button.onclick=()=>start()}
const resume=$('continue');if(resume?.onclick){const before=resume.onclick;resume.onclick=()=>{if(!gameReady)return;before();homeSpawn();cityPan=null;cityOverview=false;openMap();resize();save();updateHUD()}}
if(state==='intro')homeSpawn();cityPan=null;cityOverview=false;resize();gameReady=true;
const loader=$('bootstatus');if(loader)loader.hidden=true;
if(!gameLoopStarted){gameLoopStarted=true;last=performance.now();requestAnimationFrame(loop)}
}
