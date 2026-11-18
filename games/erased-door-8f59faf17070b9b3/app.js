const $=id=>document.getElementById(id), KEY='erased-door-v1-save';
const pools={
 '姓名':['林予安','沈知微','许听澜','江晚禾','陆青梧','陈望舒','苏映棠','叶清和'],
 '年龄':['23','25','27','29','31','34'],
 '身份':['避难所记录员','流动医生','无线电维修师','旧城测绘员','物资运输员','地下档案管理员','独行摄影师','临时巡夜人'],
 '性格':['谨慎而不冷漠','温柔但有底线','直率且重承诺','沉静而善于观察','外向且善于交涉','独立并保留好奇'],
 '随身物品':['褪色的城市地图','一只旧录音笔','半本防水手记','刻着陌生日期的铜钥匙','修过三次的手电','一封尚未寄出的信'],
 '与她的关系':['只见过一面的陌生人','失联已久的旧友','曾一起值夜的同伴','有过误会的邻居','彼此知名却尚未相识','曾被她救过的同行者'],
 '世界背景':['连续暴雨后的失联城市，避难所靠手写规则维持秩序。','停电后的沿海城市，风里偶尔传来不存在的广播。','被浓雾围住的山城，居民依照门板留言交换消息。','长夜笼罩的旧城，幸存者正在重新建立生活。','交通中断的边境小城，避难所的规则每天都在变化。','末日初期的城市地下通道，旧秩序尚未完全瓦解。'],
 '此行目标':['查清门上规则是谁擦去的','寻找失踪同伴的下落','修好通向城外的电台','决定是否与她离开避难所','找到能让所有人安全过夜的办法','弄清随身物品里的秘密'],
 '叙事偏好':['悬疑慢热，感情克制，保留日常细节。','更侧重共同求生，感情自然生长。','细腻女性情感，悬念逐步揭晓。','偏文学的静谧氛围，不写血腥。','多一些对白与试探，少些宏大阴谋。','探索与重建，允许温暖和希望。']
};
let state=null,token='',index=0,busy=false,noticeTimer,status=null,readOnly=false,pendingId=null,pendingAction='';
function notify(t){$('notice').textContent=t;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,6500);}
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify({version:1,state,token,readOnly}));}catch{notify('浏览器无法保存，请及时导出存档。');}updateContinue();}
function updateContinue(){$('continue').hidden=!state?.pages?.length;}
function show(name){for(const n of ['home','setup','reader'])$(n).hidden=n!==name;document.body.classList.toggle('reading',name==='reader');window.scrollTo(0,0);}
async function api(route,data,withToken=true){
 const r=await fetch((window.STORY_API_BASE||new URL('./api/',location.href).href)+route,{method:data===undefined?'GET':'POST',headers:{...(data!==undefined?{'Content-Type':'application/json'}:{}),...(withToken&&token?{Authorization:'Bearer '+token}:{})},...(data!==undefined?{body:JSON.stringify(data)}:{})});
 let j;try{j=await r.json();}catch{throw Error('服务响应异常，请确认本地服务仍在运行。');}if(!r.ok){const e=Error(j.error||'操作失败');e.status=r.status;throw e;}return j;
}
function makeFields(){const root=$('fields');root.replaceChildren();for(const [k,values] of Object.entries(pools)){
 const div=document.createElement('div');div.className='field'+(['世界背景','此行目标','叙事偏好'].includes(k)?' wide':'');
 const label=document.createElement('label');label.htmlFor='f-'+k;label.textContent=k;
 const input=document.createElement(['世界背景','叙事偏好'].includes(k)?'textarea':'input');input.id='f-'+k;input.name=k;input.required=true;input.maxLength=500;
 if(k==='年龄'){input.type='number';input.min='18';input.max='100';input.step='1';}else if(input.tagName==='INPUT')input.type='text';else input.rows=2;
 const list=document.createElement('datalist');list.id='d-'+k;for(const v of values){const o=document.createElement('option');o.value=v;list.append(o);}if(input.tagName==='INPUT')input.setAttribute('list',list.id);
 div.append(label,input,list);root.append(div);
 }randomize();}
function randomize(){for(const [k,vs] of Object.entries(pools))$('f-'+k).value=vs[Math.floor(Math.random()*vs.length)];}
function setBusy(v){busy=v;for(const el of document.querySelectorAll('#composer button,#profileForm button,#syncBtn,#restartBtn,#saveBtn'))el.disabled=v;$('action').disabled=v;$('sendBtn').textContent=v?'书写中…':'续写 ↗';if(v)$('readerNote').textContent='正在书写，通常需要十几秒。请留在当前页面；刷新后可同步已完成的进度。';}
function render(){
 if(!state)return;index=Math.max(0,Math.min(index,state.pages.length-1));const p=state.pages[index];
 $('pageLabel').textContent=`故事手记 · ${String(index+1).padStart(2,'0')} / ${String(state.pages.length).padStart(2,'0')}`;
 $('place').textContent=p?.location||'门外的风尚未停歇';$('chapterTitle').textContent=p?.title||'等待第一行字';
 const root=$('storyText');root.replaceChildren();for(const t of (p?.text||'人设已记录。点击下方按钮，让故事开始。').split(/\n+/).filter(Boolean)){const para=document.createElement('p');para.textContent=t;root.append(para);}
 $('ending').hidden=!p?.ending;$('ending').textContent=p?.ending||'';
 const suggestions=$('suggestions');suggestions.replaceChildren();const historical=index<state.pages.length-1;
 const addButton=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;suggestions.append(b);};
 if(historical)addButton('回到最新一页 →',()=>{index=state.pages.length-1;render();});
 else if(!readOnly&&!p?.ending&&state.pages.length<24){if(!p)addButton('让 AI 写下开场 →',()=>turn('根据我的人设生成原创开场。'));else for(const c of p.choices)addButton(c,()=>{$('action').value=c;$('action').focus();});}
 const closed=readOnly||historical||!!p?.ending||state.pages.length>=24;
 $('actionForm').hidden=closed;
 $('readerNote').textContent=readOnly?'此份故事只读。原服务可识别的导出存档才能继续生成。':historical?'正在回看旧页；回到最新页后继续行动。':p?.ending?'这一段故事已收束。可导出留念，或重开写下另一种可能。':state.pages.length>=24?'本局已达24页上限，可导出存档后重开。':`自动保存在此浏览器 · 本局最多24页 · 剩余调用机会 ${state.limits?.remainingCalls??'—'}（含失败尝试）`;
 $('syncBtn').hidden=readOnly;$('storyScroll').scrollTop=0;show('reader');
}
async function sync(silent=false){if(!token||readOnly)return;try{const s=await api('session');if(s.revision>state.revision){pendingId=null;pendingAction='';}state=s;index=state.pages.length-1;saveLocal();if(!$('reader').hidden)render();if(!silent)notify('已同步最新进度。');}catch(e){if(!silent)notify(e.message);}}
async function turn(action){if(busy||readOnly)return;if(!action.trim()){notify('先写下你的行动或导演指令。');return;}
 if(pendingId&&pendingAction!==action){await sync(true);if(pendingId){notify('上一次请求状态尚未确定，请先同步，或用原输入重试。');return;}}
 setBusy(true);const requestId=pendingId||crypto.randomUUID();pendingId=requestId;pendingAction=action;
 try{state=await api('turn',{requestId,revision:state.revision,action});pendingId=null;index=state.pages.length-1;$('action').value='';saveLocal();render();}
 catch(e){
  // 网络异常保留幂等请求ID；服务返回错误说明该尝试已结束，下次明确重试使用新ID。
  if(e.status)pendingId=null;
  if(e.status===409){await sync(true);render();}notify(e.message+'\n原剧情与输入会保留。');
 }finally{setBusy(false);if(state&&!$('reader').hidden){const value=$('action').value;render();$('action').value=value;}}
}
function snapshot(){return {format:'erased-door-save',version:1,game:'门上规则被擦掉——温雪晴从外面进来了',profile:state.profile,pages:state.pages,actions:state.actions,revision:state.revision,limits:state.limits};}
function download(data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='门上规则-故事存档-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
async function exportSave(){if(!state)return;try{download(readOnly?snapshot():await api('export',{}));notify('存档已导出，请妥善保存。');}catch{download(snapshot());notify('已导出只读故事。服务恢复后可重新导出可续写存档。');}}
function validateSave(x){
 if(x?.format!=='erased-door-save'||x.version!==1||!x.profile||!Array.isArray(x.pages)||x.pages.length>24||!Array.isArray(x.actions)||x.actions.length!==x.pages.length)throw Error('存档格式不支持或内容不完整。');
 if(Object.values(x.profile).some(v=>typeof v!=='string'||v.length>500))throw Error('人设数据不正确。');
 for(const p of x.pages){if(!p||typeof p.title!=='string'||p.title.length>40||typeof p.location!=='string'||p.location.length>80||typeof p.text!=='string'||p.text.length>1600||!Array.isArray(p.choices)||p.choices.length>4||p.choices.some(v=>typeof v!=='string'||v.length>100)||typeof p.ending!=='string')throw Error('剧情数据不完整。');}
 return x;
}
$('create').onclick=()=>{if(state?.pages?.length){$('restartDialog').showModal();return;}show('setup');};
$('continue').onclick=async()=>{index=state.pages.length-1;render();await sync(true);};
$('homeLink').onclick=e=>{e.preventDefault();if(!busy)show('home');};
$('random').onclick=randomize;
$('profileForm').onsubmit=async e=>{e.preventDefault();if(busy)return;setBusy(true);try{const profile=Object.fromEntries(new FormData(e.target));const s=await api('new',{profile},false);token=s.token;delete s.token;state=s;readOnly=false;pendingId=null;index=0;saveLocal();render();}catch(e){notify(e.message);}finally{setBusy(false);}if(state&&!state.pages.length&&!$('reader').hidden)await turn('根据我的人设生成原创开场。');};
$('actionForm').onsubmit=e=>{e.preventDefault();turn($('action').value);};
$('saveBtn').onclick=exportSave;$('syncBtn').onclick=()=>sync();
$('historyBtn').onclick=()=>{const list=$('historyList');list.replaceChildren();state.pages.forEach((p,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+' · '+p.title;const small=document.createElement('small');small.textContent=p.location+' · '+(state.actions[i]||'').slice(0,100);b.append(small);b.onclick=()=>{index=i;render();$('historyDialog').close();};list.append(b);});$('historyDialog').showModal();};
$('closeHistory').onclick=()=>$('historyDialog').close();$('restartBtn').onclick=()=>$('restartDialog').showModal();$('cancelRestart').onclick=()=>$('restartDialog').close();$('confirmRestart').onclick=()=>{$('restartDialog').close();show('setup');randomize();};
$('importHome').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>210000)throw Error('存档过大，无法导入。');const x=validateSave(JSON.parse(await f.text()));let s;try{s=await api('import',x,false);token=s.token;delete s.token;readOnly=false;}catch{s=x;token='';readOnly=true;}state=s;pendingId=null;index=s.pages.length-1;saveLocal();render();notify(readOnly?'已导入为只读故事。':'已恢复原服务最新进度。');}catch(err){notify(err instanceof SyntaxError?'存档不是有效 JSON，原进度未变。':err.message);}finally{e.target.value='';}};
makeFields();
try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored?.version===1&&stored.state){validateSave({format:'erased-door-save',version:1,...stored.state});state=stored.state;token=stored.token||'';readOnly=!!stored.readOnly;updateContinue();}}catch{notify('本机存档无法读取，请导入备份。');}
api('status',undefined,false).then(s=>{status=s;$('connection').textContent=s.configured?'DeepSeek Flash · AI 叙事服务已配置':'AI 尚未接通 · 请配置本机凭据后重启';}).catch(()=>$('connection').textContent='叙事服务暂未连接 · 已存故事仍可回看');
window.addEventListener('online',()=>notify('网络已恢复，可同步进度后继续。'));
window.addEventListener('offline',()=>notify('当前离线。可回看已保存文字，生成剧情需要联网。'));
window.addEventListener('storage',e=>{if(e.key===KEY)notify('另一页面更新了本机存档；继续前请点击同步。');});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
