'use strict';
// Shared charge orb: no lane binding or automatic steering during the burst.
let rageOvertake=null;
function initDrivingLayout(){
const controls=document.createElement('div');controls.className='drivingballs';document.querySelector('.mapwrap').appendChild(controls);controls.appendChild($('hornflash'));controls.appendChild($('boost'));
const orb=$('hornflash');orb.innerHTML='<span id="orbicon">☼</span><small id="orblabel">爆闪/创飞</small>';
let orbSignature='';function syncOrb(){const active=rageActive(),signature=[active,rage,active?rageSeconds.toFixed(1):''].join(':');if(signature===orbSignature)return;orbSignature=signature;orb.style.setProperty('--rage',(active?Math.min(100,rageSeconds*10):Math.min(100,rage))+'%');$('orbicon').textContent=active||rage>=100?'⇈':'☼';$('orblabel').textContent=active?'加速 '+rageSeconds.toFixed(1)+'s':rage>=100?'点击加速':'爆闪/创飞';orb.classList.toggle('ready',active||rage>=100);orb.setAttribute?.('aria-label',active?'加速中，剩余 '+rageSeconds.toFixed(1)+' 秒':'按住爆闪，创飞十辆可充满，满球点击激发')}
orb.onpointerdown=e=>{if(state!=='playing')return;if(rage>=100&&!rageActive()){flashHeld=false;activateRage();syncOrb();return}flashHeld=true;orb.setPointerCapture?.(e.pointerId);hornAndFlash()};orb.onpointerup=orb.onpointercancel=orb.onlostpointercapture=()=>{flashHeld=false};orb.onclick=()=>{};
const tickBefore=tick;tick=function(dt){tickBefore(dt);syncOrb()};const startBefore=start;start=function(){rageOvertake=null;startBefore();syncOrb()};syncOrb();
}
