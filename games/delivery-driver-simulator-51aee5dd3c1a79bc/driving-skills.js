'use strict';
const wrongWayUnlockOrders=20;
garageState.skills={wrongWay:savedGarage.skills?.wrongWay===true};
let wrongWayHintAt=-999;
function unlockWrongWay(){if(garageState.skills.wrongWay)return false;if(totalDone<wrongWayUnlockOrders){toast('累计完成 20 单后可解锁逆行驾驶');return false}garageState.skills.wrongWay=true;save();toast('技能已解锁：逆行驾驶');return true}
function legalManualStep(from,to,dx,dy){if(garageState.skills.wrongWay||gmAutoDrive)return true;if(driveNodes.some((p,i)=>driveGraph[i].length>=3&&dist(p,to)<95))return true;const n=nearSegment(to),s=citySegments[n.index],len=dist(s.a,s.b),tx=(s.b.x-s.a.x)/len,ty=(s.b.y-s.a.y)/len,side=(to.x-n.x)*(-ty)+(to.y-n.y)*tx,along=dx*tx+dy*ty;if(Math.abs(along)<.2||Math.abs(side)<3)return true;if(side*along>=0)return true;
// A driver already on the wrong side may steer back towards their legal half.
const prev=project(from,s.a,s.b),previousSide=(from.x-prev.x)*(-ty)+(from.y-prev.y)*tx;if(side*along>previousSide*along+.001)return true;
if(elapsed-wrongWayHintAt>3){toast('当前车道禁止逆行 · 请靠右或在路口掉头');wrongWayHintAt=elapsed}return false}
function initDrivingSkills(){const before=showGarage;showGarage=function(){before();const box=document.createElement('div');box.className='drivingskill';box.innerHTML='<b>驾驶技能 · 逆行驾驶</b><small>解锁后逆行不触发警车追逐；自动驾驶仍靠右通行，闯红灯仍会被追逐。</small><button id="unlockwrongway" '+(garageState.skills.wrongWay||totalDone<20?'disabled':'')+'>'+(garageState.skills.wrongWay?'已解锁':'累计送达 '+Math.min(20,totalDone)+'/20 单 · '+(totalDone>=20?'点击解锁':'未解锁'))+'</button>';$('modalcontent').insertBefore(box,$('dialogclose'));$('unlockwrongway').onclick=()=>{if(unlockWrongWay()){state=pausedFrom;showGarage()}}};$('garageopen').onclick=showGarage;}
