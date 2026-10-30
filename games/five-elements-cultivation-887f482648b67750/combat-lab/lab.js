'use strict';let state;
function startLab(){ActionBattle.stop();state={hero:'qinglan',hp:100,gear:0,levels:[1,1,1,1,1],tonics:3,seed:721,active:{n:0,battle:{spar:true,boss:false}}};let a=ActionCore.create({hero:'qinglan',trial:true,tonics:3});a.autoAttack=true;state.active.battle.arena=a;document.querySelector('.lab-end').hidden=true;document.querySelector('.action-overlay').hidden=false;document.querySelector('#auto').textContent='自动御剑 开';ActionBattle.mount(document.querySelector('#actionField'),state,{save(){},win(r){finish('试剑成功',r)},lose(r){finish('再练一次',r)}})}
function finish(title,r){let e=document.querySelector('.lab-end');e.hidden=false;e.querySelector('h2').textContent=title;e.querySelector('p').textContent=`用时 ${Math.round(r.time)} 秒 · 出招 ${r.attacks} 次 · 闪避 ${r.dodges} 次`}
for(let id of['reset','retry'])document.querySelector('#'+id).onclick=startLab;
document.querySelector('#auto').onclick=()=>{let a=state.active.battle.arena;a.autoAttack=!a.autoAttack;document.querySelector('#auto').textContent='自动御剑 '+(a.autoAttack?'开':'关')};
document.querySelector('#strike').onpointerdown=e=>{e.preventDefault();let v=ActionBattle.active;if(v&&!v.paused)ActionCore.attack(v.a)};
startLab();
