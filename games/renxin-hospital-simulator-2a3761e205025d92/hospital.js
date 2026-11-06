// Hospital redesign: presentation layer, original clinical rules retained.
let caseStep='history';
const oldClinic=pgClinic,oldReports=pgReports,oldDept=pgDept,oldSave=pgSave,oldRender=render;
const stepNames=[['history','问诊'],['exam','查体'],['tests','检查'],['diagnosis','诊断'],['treatment','处置']];
function pgOverview(){
 const left=Math.max(0,S.today.slots-S.today.booked),critical=S.queue.filter(id=>DIS_MAP[S.patients[id].dis].critical).length;
 return `<div class="hospital-title"><div><div class="eyebrow">RENXIN · HOSPITAL SIMULATOR</div><h1>今日值班大厅</h1></div><div class="shift-clock">${fmtClock(S.clock)}<small>第 ${S.day} 天 · ${S.ended?'已结班':'门诊值班中'}</small></div></div>
 <div class="dashboard"><section><div class="floor-map"><img src="assets/hospital.webp" alt="仁心医院微缩院区：诊室、检验区与办公室"><div class="floor-label">1F / 门诊医疗中心</div>
 <button class="floor-marker clinic" onclick="switchTab('clinic')">01 诊室<small>${S.active?'患者诊疗中':'进入接诊'}</small></button>
 <button class="floor-marker lab" onclick="switchTab('reports')">02 医技中心<small>检验 · 影像报告</small></button>
 <button class="floor-marker office" onclick="switchTab('dept')">03 医务办公室<small>科研 · 科室升级</small></button>
 <button class="floor-marker reception" onclick="bookPatient()" ${left<=0||S.ended?'disabled':''}>分诊台 · 现场挂号<small>剩余 ${left} 个号源</small></button><span class="map-legend">点击地点进入工作区域</span></div>
 <div class="duty-health"><span>♡ 当班精力 ${Math.round(S.health)}</span><div class="bar ${S.health<40?'red':''}"><i style="width:${S.health}%"></i></div><button onclick="drinkCoffee()">☕ ¥80</button></div>
 <div class="mini-ledger" style="margin-top:10px"><div><small>医师职称 · ${RANKS[S.rank].name}</small><b>${S.exp} <span style="font-size:10px;font-weight:400">经验</span></b></div><div><small>累计接诊 / 今日绩效</small><b>${S.total.seen} <span style="font-size:10px;font-weight:400">例 / ${fmtY(S.today.income)}</span></b></div></div></section>
 <section><div class="board"><div class="board-heading"><span>＋ 门诊分诊叫号屏</span><small>${deptLabel()}</small></div><div class="board-numbers"><div><small>候诊人数</small><b>${String(S.queue.length).padStart(2,'0')}</b></div><div><small>优先处置</small><b style="color:${critical?'#ffb7a7':'#b9dccb'}">${String(critical).padStart(2,'0')}</b></div><div><small>今日完成</small><b>${String(S.today.seen).padStart(2,'0')}</b></div></div><div class="board-footer">${critical?'● 危重患者已优先排列，请及时接诊':'● 门诊运转正常 · 操作时才推进时间'}</div></div>
 <div class="section-label">候诊区 <small>已挂号 ${S.today.booked} / ${S.today.slots}</small></div><div class="waiting-list">${S.queue.length?queueRows():'<div class="empty-ward">候诊区暂无患者<br>在院区分诊台办理现场挂号</div>'}</div>
 <div class="shift-actions"><button class="btnp" onclick="${S.active?"switchTab('clinic')":S.queue.length?"startClinic(S.patients[S.queue[0]])":left>0&&!S.ended?'bookPatient()':S.ended?'nextDay()':'endDay()'}">${S.active?'返回诊室 · 继续诊疗':S.queue.length?'叫号接诊 →':left>0&&!S.ended?'接待下一位患者':S.ended?'开启下一天':'门诊结束 · 查看日报'}</button><button class="btno" onclick="switchTab('records')">病历档案</button></div><p class="welcome-note">先收集线索，再做判断。每一次选择都影响你的医师生涯。</p></section></div>`;
}
function roomMast(asset,no,title,sub){return `<div class="room-mast"><img src="assets/${asset}.webp" alt="${title}场景"><div><div class="eyebrow">RENXIN / ${no}</div><h2>${title}</h2><p>${sub}</p></div></div>`;}
pgReports=function(){return roomMast('laboratory','02','医技中心','查阅检查结果，把每一条线索带回诊室。')+oldReports();};
pgDept=function(){return roomMast('office','03','医务办公室','升级医疗条件，安排科研，规划下一阶段的成长。')+oldDept();};
pgClinic=function(){
 let h=oldClinic();
 if(!S.active)return roomMast('consultation','01','门诊诊室','从候诊患者中叫号，开始今天的诊疗工作。')+h;
 return `<div class="case-jacket"><div class="case-top"><span>仁心医院 / 门诊病历夹</span><span>CONFIDENTIAL</span></div>${h}<div class="record-stamp">仁心 · 守护每一次托付</div></div>`;
};
render=function(){
 oldRender();
 document.querySelector('.duty-strip').innerHTML=`<span><i class="status-dot"></i>${deptLabel()} · ${RANKS[S.rank].name}</span><span>仁心医院 · v1.0.0</span>`;
 if(S.tab!=='clinic'||!S.active)return;
 const jacket=document.querySelector('.case-jacket'),cards=[...jacket.children].filter(n=>n.classList.contains('card'));
 if(cards.length<2)return;
 const p=S.patients[S.active],d=DIS_MAP[p.dis];
 if(p.phase==='treat'&&!['history','exam','treatment'].includes(caseStep))caseStep='treatment'; else if(p.phase!=='treat'&&caseStep==='treatment')caseStep='diagnosis';
 const slots={history:cards[1],exam:cards[2],tests:p.phase==='work'?cards[3]:null,diagnosis:p.phase==='work'?cards[4]:null,treatment:p.phase==='treat'?cards[3]:null};
 const nav=document.createElement('div');nav.className='workflow';
 nav.innerHTML=stepNames.map(([id,label],i)=>{const complete=id==='history'?p.hIdx>=d.h.length:id==='exam'?p.sIdx>=d.s.length:id==='tests'?Object.keys(p.tests).length>0:id==='diagnosis'?p.phase==='treat':false;return `<button class="${caseStep===id?'current ':''}${complete?'complete':''}" onclick="selectCaseStep('${id}')" ${!slots[id]?'disabled':''}><b>${complete?'✓':String(i+1).padStart(2,'0')}</b>${label}</button>`;}).join('');
 cards[0].after(nav);
 Object.entries(slots).forEach(([id,n])=>{if(n){n.hidden=id!==caseStep;n.classList.add('clinical-section');}});
};
function selectCaseStep(id){caseStep=id;S._scroll=0;render();}
const originalStartClinic=startClinic;
startClinic=function(p){caseStep='history';originalStartClinic(p);};
pgSave=function(){return oldSave().replace('<button class="btno" onclick="doReset()">',`<div class="save-grid"><button class="btno" onclick="exportHospitalSave()">导出存档</button><button class="btno" onclick="showImport()">导入存档</button></div><div class="notice">进度保存在当前设备的当前浏览器。主入口与备用入口不会自动同步；切换前请导出，在另一入口导入。</div><button class="btno" onclick="doReset()">`);};
function exportHospitalSave(){const data=JSON.stringify({game:'G209',version:'1.0.0',state:S},null,2),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='仁心医院-第'+S.day+'天.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('已导出，请保管好存档','ok');}
function showImport(){ $('modalRoot').innerHTML=`<div class="overlay"><div class="modal"><div class="m-title">恢复医院进度</div><p class="pg-sub">选择已导出的 JSON 存档。恢复前会保留当前进度备份。</p><input type="file" id="hospitalImport" accept=".json,application/json" onchange="readHospitalImport(this)"><div style="height:15px"></div><button class="btno" onclick="closeModal()">取消</button></div></div>`;}
function validateHospitalSave(x){const o=x&&x.game==='G209'?x.state:x; if(!o||typeof o!=='object'||!Number.isInteger(o.day)||o.day<1||!DEPTS.some(d=>d.id===o.dept)||!Number.isFinite(o.cash)||!Number.isFinite(o.rep)||!Number.isFinite(o.health)||o.health<0||o.health>100||!Number.isInteger(o.rank)||!RANKS[o.rank]||!Number.isFinite(o.exp)||!Number.isFinite(o.clock)||!o.today||!o.total||!o.up||!Array.isArray(o.history)||!Array.isArray(o.queue)||!o.patients||typeof o.patients!=='object')throw Error('存档格式不完整');
 for(const k of ['slots','booked','seen','income','cost','cured','dispute','death'])if(!Number.isFinite(o.today[k]))throw Error('当日记录损坏');
 for(const k of ['seen','income','cured','dispute','death'])if(!Number.isFinite(o.total[k]))throw Error('累计记录损坏');
 for(const k of ['lab','img','icu','nurse','doc'])if(!Number.isInteger(o.up[k])||o.up[k]<0)throw Error('升级记录损坏');
 for(const [id,p] of Object.entries(o.patients)){if(!p||p.id!==id||!DIS_MAP[p.dis]||!['work','treat','done'].includes(p.phase)||!p.vitals||!Array.isArray(p.ruled)||!p.tests||!Number.isInteger(p.hIdx)||!Number.isInteger(p.sIdx)||typeof p.name!=='string'||/[<>]/.test(p.name)||typeof p.cc!=='string'||/[<>]/.test(p.cc))throw Error('病历内容损坏');}
 if(o.queue.some(id=>!o.patients[id])||(o.active&&!o.patients[o.active]))throw Error('患者记录不完整');
 if(!['overview','clinic','reports','records','dept','save'].includes(o.tab))o.tab='overview';return o;
}
async function readHospitalImport(el){try{const file=el.files[0];if(!file||file.size>3000000)throw Error('文件过大或未选择');const raw=JSON.parse(await file.text()),next=validateHospitalSave(raw);if(!confirm('恢复到第 '+next.day+' 天？当前进度会备份在本机。'))return;localStorage.setItem(SAVE_KEY+'_before_import',JSON.stringify(S));S=next;S._scroll=0;save();closeModal();toast('存档已恢复','ok');}catch(e){toast('无法导入：'+e.message,'err');}}
// Guard a stale tab from silently overwriting a newer save.
let saveLocked=false;
const rawSave=save;
save=function(){if(saveLocked)return;rawSave();};
window.addEventListener('storage',e=>{if(e.key===SAVE_KEY&&e.newValue&&e.newValue!==JSON.stringify(S)){saveLocked=true;$('modalRoot').innerHTML='<div class="overlay"><div class="modal"><div class="m-title">另一页面更新了医院进度</div><p class="pg-sub">当前页面已暂停写入，刷新后继续最新进度。</p><button class="btnp" onclick="location.reload()">读取最新进度</button></div></div>';}});
// Existing prototype saves remain readable in the same browser origin.
if(!localStorage.getItem(SAVE_KEY)){try{const legacy=JSON.parse(localStorage.getItem('renxin_doctor_v2'));if(legacy){validateHospitalSave(legacy);S=legacy;save();closeModal();}}catch(e){}}
render();


