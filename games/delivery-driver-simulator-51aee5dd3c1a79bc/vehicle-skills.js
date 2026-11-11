'use strict';
const vehicleSkillCatalog={
'byd-seagull':{key:'economy',name:'轻盈节能',description:'行驶耗电降低 30%，适合低成本跑单。'},
'xiaomi-su7':{key:'launch',name:'闪电起步',description:'起步加速度增加 25%，最高速度不变。'},
'xiaomi-yu7':{key:'terrain',name:'全地形通过',description:'驶离道路后的速度衰减减轻 40%。'},
'aito-m9':{key:'rain',name:'雨天稳驾',description:'免除雨天造成的 15% 行驶降速。'},
'maextro-s800':{key:'service',name:'贵宾礼遇',description:'每单结算额外增加 15% 配送收入。'},
'li-l9':{key:'supplies',name:'移动休息室',description:'饱腹和饮水的自然消耗降低 40%。'},
'nio-et5':{key:'regen',name:'制动回收',description:'松开驾驶输入减速时，按降速量回收电量。'},
'xp-p7':{key:'kitchen',name:'商家默契',description:'接单后剩余备餐等待缩短 40%。'},
'zeekr-001':{key:'durability',name:'耐久猎装',description:'行驶造成的车况损耗降低 50%。'},
'yangwang-u9':{key:'impact',name:'创飞增幅',description:'每次创飞充能由 10% 提高至 15%，爆闪充能不变。'}
};
function vehicleSkill(id=garageState.selected){return vehicleSkillCatalog[id]}
function hasVehicleSkill(key){return vehicleSkill()?.key===key}
function vehicleSkillCard(v,active,owned){const s=vehicleSkill(v.id);return '<div class="showroomskill"><div><b>专属技能 · '+s.name+'</b><small>'+s.description+'</small></div><span class="skillstatus">'+(active?'已生效':owned?'换上后生效':'购车后解锁')+'</span></div>'}
function nextVehicleGoal(){return vehicleCatalog.filter(v=>!garageState.owned.includes(v.id)).sort((a,b)=>a.price-b.price)[0]||null}
function initVehicleSkills(){
const statsBefore=vehicleStats;vehicleStats=function(){const v=statsBefore();return hasVehicleSkill('launch')?{...v,accel:v.accel*1.25}:v};
const gripBefore=drivingGrip;drivingGrip=function(p){const grip=gripBefore(p);return hasVehicleSkill('terrain')?1-(1-grip)*.6:grip};
const acceptBefore=accept;accept=function(id){const existed=bag.some(o=>o.id===id);acceptBefore(id);const o=bag.find(o=>o.id===id);if(!existed&&o&&hasVehicleSkill('kitchen')){o.readyAt=elapsed+Math.max(0,o.readyAt-elapsed)*.6;save();renderPanel();updateHUD()}};
const interactBefore=interact;interact=function(){const count=done,before=money,eligible=hasVehicleSkill('service');interactBefore();if(eligible&&done>count){const bonus=Math.round((money-before)*.15*10)/10;garageState.wallet=Math.round((garageState.wallet+bonus)*10)/10;money=Math.round((money+bonus)*10)/10;totalMoney=Math.round((totalMoney+bonus)*10)/10;save();updateHUD();toast('贵宾礼遇 · 本单额外收入 ¥'+bonus.toFixed(1))}};$('interact').onclick=()=>interact();
const chargeBefore=addBoostCharge;addBoostCharge=function(amount){chargeBefore(hasVehicleSkill('impact')&&amount===10?15:amount)};
const tickBefore=tick;tick=function(dt){const speed=carVelocity,coasting=!gmAutoDrive&&Math.hypot(joy.x,joy.y)<.08&&!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys.has(k));tickBefore(dt);if(state==='playing'&&coasting&&hasVehicleSkill('regen')&&speed>carVelocity)battery=Math.min(100,battery+(speed-carVelocity)*.003)};
const box=document.createElement('button');box.id='vehiclegoal';box.type='button';box.innerHTML='<div class="vehiclegoalhead"><span>可用资金 <b id="availablecash"></b></span><span id="nextcarname"></span></div><div class="vehiclegoalbody"><span class="vehiclegoaltrack" role="progressbar" aria-label="下一辆车购车进度" id="nextcarprogress"><i id="nextcarfill"></i></span><small id="nextcarremaining"></small></div>';document.querySelector('#game').insertBefore(box,document.querySelector('.mapwrap'));
box.onclick=()=>{garagePreview=(nextVehicleGoal()||currentVehicle()).id;showGarage()};
let signature='';const hudBefore=updateHUD;updateHUD=function(){hudBefore();const next=nextVehicleGoal(),key=[garageState.wallet.toFixed(1),next?.id||'',garageState.owned.length].join(':');if(key===signature)return;signature=key;const amount=Math.max(0,garageState.wallet),progress=next?Math.min(100,amount/Math.max(1,next.price)*100):100;$('availablecash').textContent='¥'+amount.toFixed(1);$('nextcarname').textContent=next?'下一辆 · '+next.name:'十款座驾已集齐';$('nextcarfill').style.width=progress+'%';$('nextcarprogress').setAttribute?.('aria-valuemin','0');$('nextcarprogress').setAttribute?.('aria-valuemax','100');$('nextcarprogress').setAttribute?.('aria-valuenow',String(Math.round(progress)));$('nextcarremaining').textContent=next?(amount>=next.price?'已可购买 · ¥'+next.price:'还差 ¥'+(next.price-amount).toFixed(1)+' / 车价 ¥'+next.price):'继续升级你的爱车'};updateHUD();
}
