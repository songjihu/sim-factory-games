'use strict';
function canReachStop(p){return Math.min(dist(player,p),p.arrival?dist(player,p.arrival):Infinity)<=115}
function initOrderConfirmation(){
// Actions must refer to a live order and the stage shown when the control was drawn.
cardAction=function(action,id,stage){if(action==='accept'){accept(id);return}const o=bag.find(o=>o.id===id);if(!o||(stage!==undefined&&o.picked!==stage))return;targetId=id;if(!canReachStop(stop(o))){openMap(id);toast('尚未到达 '+stop(o).name+'，请先驶到路边停车点');return}interact();autoTrip=null;if(!bag.length){targetId=null;gmAutoDrive=false;carVelocity=0;renderPanel();updateHUD();toast('本次配送全部完成 · 可继续接单或回家收工')}};
function bindOrderConfirmations(){for(const b of document.querySelectorAll('[data-slide], [data-confirm]')){const id=Number(b.dataset.id),o=bag.find(o=>o.id===id);if(!o)continue;const stage=o.picked;let committed=false;const commit=()=>{if(committed)return;committed=true;panelClock=0;cardAction(b.dataset.slide||b.dataset.confirm,id,stage)};
if(b.dataset.slide){b.onpointerdown=()=>{panelClock=-30;b.value=0};b.oninput=()=>{panelClock=-30;if(Number(b.value)>=85)commit()};b.onpointerup=()=>{if(Number(b.value)>=85)commit();else{b.value=0;panelClock=0}};b.onchange=()=>{if(Number(b.value)>=85)commit();else{b.value=0;panelClock=0}};b.onpointercancel=()=>{b.value=0;panelClock=0}}else b.onclick=commit;}}
const panelBefore=renderPanel;renderPanel=function(){panelBefore();bindOrderConfirmations()};
// Detail rendering is also called independently on map entry.
const detailBefore=renderMapDetail;renderMapDetail=function(){detailBefore();bindOrderConfirmations()};renderPanel();
}
