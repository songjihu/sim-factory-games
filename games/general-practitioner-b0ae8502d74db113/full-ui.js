let sectionTabs={},newSeed=Date.now();const basicRender=render,basicDecision=decision;
function part(t){sectionTabs[page]=t;render()}
function notes(){let a=[];if(s.stress>=100)a.push('压力较高，安排休息或年假');if(s.projects.length)a.push('在研'+s.projects.length+'项，注意进度和新增论文');if(s.patients.some(p=>s.week-p.lastSeen>=4))a.push('有患者超过四周未随访');if(!Engine.promotion(s))a.push('本月可以申报职称');D.grants.forEach((g,i)=>{if(!Engine.grantGate(s,i))a.push(g.name+'申报窗口开放')});return a}
render=function(){basicRender();if(!s)return;document.title='全科医生 · 2.1.0';document.body.dataset.page=page;let view=$('view');
if(page!=='主页'){
 let children=[...view.childNodes],groups=[],current={name:page,nodes:[]};for(let n of children){if(n.nodeName==='H2'){if(current.nodes.length)groups.push(current);current={name:n.textContent,nodes:[n]}}else current.nodes.push(n)}if(current.nodes.length)groups.push(current);
 if(groups.length>1){let selected=sectionTabs[page]||groups[0].name;if(!groups.some(g=>g.name===selected))selected=groups[0].name;view.innerHTML='<div class="subnav">'+groups.map(g=>b(g.name,`part(${JSON.stringify(g.name)})`,g.name===selected)).join('')+'</div><div id="partbody"></div>';let body=$('partbody');groups.find(g=>g.name===selected).nodes.forEach(n=>body.append(n))}
}
if(page==='主页'){
 let sc=view.querySelector('.scene');if(sc){sc.className='workbench';sc.innerHTML='<img src="clinic.webp" alt="门诊诊室" width="112" height="155"><div><small>青禾综合医院 · '+s.department+'</small><h2>今日值班台</h2><div class="desk-actions">'+b('病历夹 · '+s.patients.length,"tab='患者';render()")+b('排班表',"openPage('工作')")+b('课题本',"openPage('科研')")+'</div></div>'}
 let tabs=view.querySelector('.tabs');if(tabs){let tail=document.createElement('div');tail.className='feed';while(tabs.nextSibling)tail.append(tabs.nextSibling);tabs.after(tail)}
 view.insertAdjacentHTML('beforeend','<div class="reminder">'+b('提醒 · '+notes().length,'showReminders()')+b('周末科研',call('weekend'))+'</div>');
}
let extra=$('globalbar');if(!extra){extra=document.createElement('div');extra.id='globalbar';$('nav').before(extra)}extra.innerHTML=b('推进一周','step()')+b(timer?'暂停':'连续推进','toggle()',!!timer)+'<small>'+Engine.date(s)+'</small>';
if(page==='工作'&&(!sectionTabs[page]||sectionTabs[page]==='工作'))view.querySelector('#partbody')?.insertAdjacentHTML('beforeend',b('申请返聘专家',call('appoint',4))+b('申请退休',call('retire')));
if(page==='更多'&&sectionTabs[page]==='个人档案')view.querySelector('#partbody')?.insertAdjacentHTML('beforeend','<h2>人员与关系</h2>'+D.staff.map((x,i)=>card('<b>'+x[0]+' · '+x[1]+'</b><p>'+x[2]+'</p>'+b('交流',`contact(${i})`))).join(''));
if(page==='生活'&&sectionTabs[page]==='一次性行动')view.querySelector('#partbody')?.insertAdjacentHTML('beforeend',b(s.autoTrip?'自动旅行：开':'自动旅行：关',call('autoTrip')));
if(page==='科研'&&sectionTabs[page]==='在研项目')view.querySelector('#partbody')?.insertAdjacentHTML('afterbegin','<div class="roomphoto"><img src="research.webp" alt="科研办公室" width="110" height="145"><p>研究要有进展，也要留出返修和结题的时间。</p></div>');
if(s.ending){stop();extra.innerHTML=b('再走一段人生','newGame()')+'<b>'+s.ending.name+' · '+s.ending.score+'分</b>'}
};
function contact(i){let key=i===0?'mentor':i===2?'boss':i===7?'family':'team';let id='contact'+i;if(s.actions[id]===s.week)return alert('本周已交流。');if(s.pending)return; s.actions[id]=s.week;s[key]+=3;s.stress+=2;Engine.normalize(s);Engine.record(s,'与'+D.staff[i][0]+'交流：'+D.staff[i][2]+'。关系提升，消耗少量精力。');persist();render()}
function showReminders(){$('modal').innerHTML='<h2>待办与提醒</h2>'+notes().map(x=>'<p>'+esc(x)+'</p>').join('')+b('返回','$("modal").close()');$('modal').showModal()}
decision=function(){basicDecision();if(!s.pending)return;let box=$('modal'),p=s.pending;box.querySelectorAll('button').forEach((el,i)=>{let eff=p.options[i].effect;if(eff)el.insertAdjacentHTML('beforeend','<small class="effects">'+Object.entries(eff).map(([k,v])=>({clinical:'临床',research:'科研',talk:'沟通',teach:'教学',boss:'上级',team:'同事',family:'家庭',mentor:'导师',stress:'压力',health:'健康',mood:'心态',money:'资金',leave:'年假',reputation:'声誉',exp:'积累'}[k]||k)+(v>=0?'+':'')+v).join(' · ')+'</small>')});};
newGame=function(){stop();newSeed=Date.now();traitMenu()};function traitMenu(){$('modal').innerHTML='<h2>新开一局 · 选择性格</h2><p>种子 '+newSeed+' · 相同种子与选择得到相同发展</p>'+D.traits.map(x=>b(x[0]+' · '+x[1],`selectedTrait='${x[0]}';routeMenu()`)).join('')+b('随机性格',"selectedTrait=D.traits[Math.floor(Math.random()*3)][0];routeMenu()")+b('换个种子','newSeed=Date.now();traitMenu()')+(s?b('返回当前生涯','$("modal").close()'):'');if(!$('modal').open)$('modal').showModal()}
start=function(i){s=Engine.fresh(newSeed,selectedTrait,i);revision=localStorage.getItem(KEY);persist();$('modal').close();page='主页';sectionTabs={};render()};
const originalStep=step,originalAct=doAct,originalPick=pick;function hasLock(){if(localStorage.getItem(KEY)!==revision){stop();alert('发现另一标签页的新进度，请刷新后继续，未覆盖另一页存档。');return false}return true}step=function(){if(hasLock())originalStep()};doAct=function(t,a){if(hasLock())originalAct(t,a)};pick=function(i){if(hasLock())originalPick(i)};
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue!==revision){stop();$('globalbar').innerHTML='<b>另一页已更新进度，请刷新</b>'}});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
