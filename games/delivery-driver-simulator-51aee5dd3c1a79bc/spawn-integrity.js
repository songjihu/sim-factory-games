'use strict';
function initSpawnIntegrity(){
function parkHome(){homeSpawn();gmAutoDrive=false;autoTrip=null;rageOvertake=null;keys.clear();joy.x=joy.y=0;carVelocity=0;hitCD=3;homeSave();save();updateHUD()}
const before=start;start=function(){before();parkHome()};
// Intro buttons were created before the home wrapper existed. Resolve start at click time.
for(const id of ['startv2','start']){const button=$(id);if(button)button.onclick=()=>start()}
const resume=$('continue');if(resume&&resume.onclick){const previous=resume.onclick;resume.onclick=()=>{previous();parkHome();toast('已从海棠公寓继续出发 · 订单与收入已保留')}}
// Repair the bad corner spawn from the first release without clearing any progress.
const edge=nearSegment(player),segment=citySegments[edge.index];
if(!Number.isFinite(player.x)||!Number.isFinite(player.y)||!inActiveRegion(player)||(!road(player.x,player.y)&&edge.d>segment.road.width/2+80))parkHome();
}
