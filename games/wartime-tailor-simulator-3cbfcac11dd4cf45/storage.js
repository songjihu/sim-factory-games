/* G206 local save transport and concurrent-tab guard. */
(() => {
'use strict';
const key='G-caifeng-1943-v1', E=ENGINE, C=CONTENT;
let lastRaw, locked=false, candidate=null;
try {lastRaw=localStorage.getItem(key);}catch{}
const originalSave=E.save, originalLoad=E.load;
function validate(s){
 if(E.valid(s))return E.valid(s);
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 if(!obj(s)||!obj(s.flags)||!obj(s.props))return '存档结构不完整';
 for(const k of ['money','rep','heart','craft','debt','month'])if(!Number.isInteger(s[k])||s[k]<0||s[k]>1000000)return '数值字段异常';
 if(s.rep>100||s.heart>100||s.month<1||s.month>12)return '数值越界';
 for(const k of ['taken','done','missed'])if(s[k].length>36||s[k].some(id=>typeof id!=='string'||!Object.hasOwn(C.customers,id))||new Set(s[k]).size!==s[k].length)return '订单记录异常';
 if(s.taken.length>2||s.log.length>60||s.log.some(x=>typeof x!=='string'||x.length>2000))return '记录长度异常';
 if(s.evDone.some(x=>!Number.isInteger(x)||x<1||x>12)||s.letters.some(x=>!C.letters.some(l=>l.n===x)))return '月份或信件记录异常';
 if(typeof s.ended!=='boolean'||typeof s.ownDress!=='boolean'||(s.ending!==null&&!Object.hasOwn(C.endings,s.ending)))return '结局记录异常';
 if(Object.entries(s.props).some(([k,v])=>!Object.hasOwn(C.props,k)||v!==true)||Object.values(s.flags).some(x=>typeof x!=='boolean'))return '状态标记异常';
 for(const k of ['pending','echoes'])if(s[k].length>36||s[k].some(p=>!obj(p)||!Object.hasOwn(C.customers,p.id)||!Object.hasOwn(E.CFG.repTier,p.tier)||!Number.isInteger(p.at)||p.at<1||p.at>15||!Number.isFinite(p.half)||p.half<0||p.half>10000||!Object.hasOwn(C.cloths,p.cloth)))return '回响记录异常';
 if(s.active){const a=s.active;if(!Object.hasOwn(C.customers,a.id)||!obj(a.fit)||!Array.isArray(a.looks)||!Array.isArray(a.asks)||a.looks.some(x=>!Number.isInteger(x)||x<0||x>=C.customers[a.id].hints.length)||a.asks.some(x=>!Number.isInteger(x)||x<0||x>=C.customers[a.id].asks.length)||new Set(a.looks).size!==a.looks.length||new Set(a.asks).size!==a.asks.length||Object.entries(a.fit).some(([k,v])=>!Object.hasOwn(C.slots,k)||!Number.isInteger(v)||v<0||v>2)||(a.cloth!==null&&!Object.hasOwn(C.cloths,a.cloth))||!['full','half','free'].includes(a.pay)||typeof a.hurry!=='boolean')return '手上订单异常';}
 return null;
}
const dialog=document.createElement('dialog');dialog.className='save-dialog';document.body.append(dialog);
function message(t){const el=document.getElementById('store-message');if(el)el.textContent=t;}
function open(){dialog.innerHTML='<h2>存档与说明</h2><p>进度仅保存在当前设备、浏览器和入口。换设备、清理数据或切换主备入口前，请导出；在另一入口导入恢复。没有云存档。</p><div class="save-actions"><button data-store="export">导出存档</button><label class="file-label">选择存档文件<input type="file" accept=".json,application/json" id="save-import"></label></div><p id="store-message" role="status">'+(locked?'另一标签页已更新进度。当前页已暂停写入，请载入最新存档。':'请选择要进行的操作。')+'</p><div class="save-actions">'+(locked?'<button data-store="reload">载入最新进度</button>':'')+'<button data-store="close">回到游戏</button></div>';if(!dialog.open)dialog.showModal();}
function conflict(){locked=true;open();}
E.load=()=>{const s=originalLoad();return s&&!validate(s)?s:null;};
E.save=s=>{try{const current=localStorage.getItem(key);if(locked||current!==lastRaw){conflict();return false;}const ok=originalSave(s);if(ok)lastRaw=localStorage.getItem(key);else{open();message('浏览器未能保存，请导出当前进度备份。');}return ok;}catch{open();message('本地存储不可用，请导出备份。');return false;}};
window.addEventListener('storage',ev=>{if(ev.key===key&&ev.newValue!==lastRaw)conflict();});
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-store]');if(locked&&!b&&!ev.target.closest('a[download]')){ev.stopImmediatePropagation();open();return;}if(!b)return;ev.stopImmediatePropagation();const action=b.dataset.store;
 if(action==='open')open();
 if(action==='close')dialog.close();
 if(action==='reload'){lastRaw=localStorage.getItem(key);locked=false;dialog.close();if(E.load())window.__CAIFENG.continueGame();else{open();message('最新存档无法读取，请导入有效备份。');}}
 if(action==='export'){const s=window.__CAIFENG?.S||E.load();if(!s){message('目前没有可导出的进度。');return;}const blob=new Blob([JSON.stringify({game_id:'G206',format:1,exported_at:new Date().toISOString(),save:s},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='裁缝一九四三-存档.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);message('存档已导出，请妥善保管。');}
 if(action==='commit'&&candidate){if(localStorage.getItem(key)!==lastRaw){candidate=null;conflict();message('选择文件后其他标签更新了进度，请重新检查后导入。');return;}locked=false;if(!originalSave(candidate)){message('无法写入存档，原有进度未替换。');return;}lastRaw=localStorage.getItem(key);candidate=null;dialog.close();window.__CAIFENG.continueGame();}
},true);
document.addEventListener('change',async ev=>{if(ev.target.id!=='save-import')return;const f=ev.target.files[0];candidate=null;dialog.querySelector('[data-store=commit]')?.remove();if(!f)return;if(f.size>150000){message('文件过大，已拒绝，原进度保留。');return;}try{const x=JSON.parse(await f.text());if(x.game_id&&x.game_id!=='G206')throw Error('这不是本游戏存档');const s=x.save||x;const err=validate(s);if(err)throw Error(err);candidate=s;message('有效存档：第'+s.month+'月，做过'+s.done.length+'件。导入将替换当前入口进度。');const b=document.createElement('button');b.dataset.store='commit';b.textContent='确认导入并替换';dialog.append(b);}catch(e){message('导入失败：'+e.message+'。原进度保留。');}});
window.CAIFENG_STORE={validate,get locked(){return locked;}};
})();
