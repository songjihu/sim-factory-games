'use strict';
let steeringAngle=0;
function drivePhysicalCar(dt){steeringAngle=0;classicManualDrive(dt,0,0,false)}
function initPhysicalDriving(){const autoDriveBefore=driveVehicle;driveVehicle=function(dt,dx,dy,sprint){const manual=Math.hypot(joy.x,joy.y)>.08||['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys.has(k));if(manual&&(gmAutoDrive||rageOvertake)){gmAutoDrive=false;rageOvertake=null;autoTrip=null}if(gmAutoDrive||rageOvertake)return autoDriveBefore(dt,dx,dy,sprint);drivePhysicalCar(dt)};const startBefore=start;start=function(){steeringAngle=0;startBefore()};const bodyBefore=drawPlayerVehicle;drawPlayerVehicle=function(){ctx.save();ctx.translate(player.x,player.y);ctx.rotate(player.angle);ctx.fillStyle='#182432';for(const side of [-1,1]){ctx.fillRect(-15,side*10-2,9,4);ctx.save();ctx.translate(11,side*10);ctx.rotate(gmAutoDrive?0:steeringAngle);ctx.fillRect(-5,-2,10,4);ctx.restore()}ctx.restore();bodyBefore()};document.querySelector('.rightcontrols>span').textContent='摇杆 / WASD：推向哪就往哪 · 爆闪 / 创飞积攒，满球点击加速';}

// Horn and impacts share the existing orb and automatic overtake charge.
function addBoostCharge(amount){if(state!=='playing'||rageActive()||rageOvertake)return;rage=Math.min(100,rage+amount)}
function initEarnedBoost(){boost=false;const oldButton=$('boost');oldButton.hidden=true;oldButton.style.display='none';oldButton.onpointerdown=oldButton.onpointerup=oldButton.onpointercancel=()=>{};
const hornBefore=hornAndFlash;hornAndFlash=function(){const accepted=state==='playing'&&hornCooldown<=0;hornBefore();if(accepted)addBoostCharge(1)};
const hitBefore=hitVehicle;hitVehicle=function(car){const fresh=!car.flying&&!car.hidden;hitBefore(car);if(fresh&&car.flying)addBoostCharge(10)};}
const initPhysicalBeforeBoost=initPhysicalDriving;initPhysicalDriving=function(){initPhysicalBeforeBoost();initEarnedBoost()};
