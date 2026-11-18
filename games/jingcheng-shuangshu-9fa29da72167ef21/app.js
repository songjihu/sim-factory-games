'use strict';
const $=id=>document.getElementById(id), STORE='jingcheng-shuangshu-v1';
let sessionToken=localStorage.getItem(STORE+'-session')||'';
let state={game:'jingcheng-shuangshu',version:1,profile:{},history:[],directives:[]},ready=false,online=false,busy=false,spent=0,maxTurns=24;
const defs=[
 ['name','姓名',['沈知微','柳照棠','温行舟','裴望舒','陆停云','叶疏桐']],
 ['age','年龄',['26岁','28岁','30岁','32岁','35岁','38岁']],
 ['identity','身份',['酒楼新掌柜','返京的厨师','游历归来的食评人','独立经营的茶商','抄写文书的女先生','暂住京城的旅人']],
 ['temper','性情',['沉静敏锐','爽朗坦诚','温柔坚定','疏离克制','随性好奇','直率谨慎']],
 ['world','世界与时代',['架空古代京城，双楼隔街相望','大宋风物的繁华都城','江南水城，商旅云集','架空女官与女商活跃的王朝','边城驿道旁的两家食肆','自定古代海港，女子可自由经商']],
 ['relationship','与她的关系',['争夺食客的同行，尚不熟悉','旧日合伙人，多年未见','互不相让的邻居，偶有善意','只在菜谱里交换过几封信','误会未解的旧友','素不相识，因一封误递的信结缘']],
 ['goal','此刻想要',['守住酒楼，也守住自己的选择','查明一份失传菜谱的来处','离开旧日安排，独立生活','替受困女子找到新的去处','解开当年的误会','过平静日子，看看会遇见谁']],
 ['tone','叙事偏好',['细腻慢热，日常与感情并重','轻松温暖，多些生活烟火','悬疑克制，侧重调查','坦诚明快，少些误会','群像互助，关系慢慢生长','偏重经营，情感自然发展']]
];
function toast(s){$('toast').textContent=s;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,6500)}
function show(id){for(const el of document.querySelectorAll('.view'))el.hidden=el.id!==id;window.scrollTo(0,0)}
function cache(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{toast('浏览器无法保存，请及时导出存档')}}
async function api(path,body){const res=await fetch((window.STORY_API||'/api/')+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(sessionToken?{'Authorization':'Bearer '+sessionToken}:{})},body:body?JSON.stringify(body):undefined});const data=await res.json();if(data.session){sessionToken=data.session;localStorage.setItem(STORE+'-session',sessionToken)}if(!res.ok)throw Error(data.error||'请求未完成');return data}
function apply(data){state=data.state;spent=data.spent??spent;maxTurns=data.maxTurns??maxTurns;cache();render()}
function render(){
 $('continueBtn').hidden=!state.history.length;
 $('status').textContent=!online?'离线只读 · 可回看与导出此浏览器保存的故事':ready?'AI服务已配置 · 每局最多24幕，按需生成':'AI未接通 · 可编辑人设；配置服务端密钥后才能生成故事';
 $('budget').textContent=`${state.history.length} / ${maxTurns} 幕`;
 if(!state.history.length){$('sendBtn').disabled=busy||!online;$('storyNotice').textContent=busy?'正在等候开篇，请勿关闭页面。':'尚未生成正文。AI未接通时可返回首页编辑人设。';return;}
 drawPage(state.history.length-1);
}
function drawPage(index){
 const h=state.history[index],p=h.page,last=index===state.history.length-1;
 $('turnLabel').textContent=`第 ${String(index+1).padStart(2,'0')} 幕${last?' · 此刻':' · 回看'}`;
 $('location').textContent=p.location;$('pageTitle').textContent=p.title;$('prose').replaceChildren();
 for(const para of p.text.split(/\n+/).filter(Boolean)){const el=document.createElement('p');el.textContent=para;$('prose').append(el)}
 if(p.ending){const el=document.createElement('p');el.textContent='— '+p.ending+' —';$('prose').append(el)}
 $('choices').replaceChildren();
 const ended=!!p.ending||state.history.length>=maxTurns;
 if(last&&!ended)for(const [i,text] of p.choices.entries()){const b=document.createElement('button');b.type='button';b.textContent=`${String(i+1).padStart(2,'0')}  ${text}`;b.disabled=busy||!online;b.onclick=()=>{ $('director').checked=false;$('action').value=text;updateCount();submitAction() };$('choices').append(b)}
 if(!last){const b=document.createElement('button');b.textContent='返回最新一幕 →';b.onclick=()=>drawPage(state.history.length-1);$('choices').append(b)}
 $('actionForm').hidden=!last||ended;
 $('sendBtn').disabled=busy||!online;
 $('storyNotice').textContent=!last?'正在回看旧文，续写会从最新一幕开始。':ended?'本篇暂告一段落。可在故事匣导出、回看，或另启新篇。':busy?'正在等候回信，请勿关闭页面。失败时保留原进度。':'行动建议只是起点。勾选导演指令可改写世界与既有设定。';
 $('reading').scrollTop=0;
}
function randomize(){for(const [key,,values] of defs)$('field-'+key).value=values[Math.floor(Math.random()*values.length)]}
function buildFields(){for(const [key,label,values] of defs){const wrap=document.createElement('label');wrap.textContent=label;if(['world','relationship','goal','tone'].includes(key))wrap.className='wide';const input=document.createElement('input');input.id='field-'+key;input.maxLength=1000;input.required=true;input.setAttribute('list','list-'+key);const list=document.createElement('datalist');list.id='list-'+key;for(const text of values){const option=document.createElement('option');option.value=text;list.append(option)}wrap.append(input,list);$('fields').append(wrap)}randomize()}
function openDialog(title){$('dialogTitle').textContent=title;$('dialogContent').replaceChildren();$('drawer').showModal()}
function button(text,fn){const b=document.createElement('button');b.className='secondary';b.textContent=text;b.onclick=fn;$('dialogContent').append(b);return b}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='京城双姝-存档.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function archive(){openDialog('故事匣');const p=document.createElement('p');p.textContent=`已写 ${state.history.length} 幕。本设备、本地址保存；未接账号同步。后端也保存权威进度。导出可迁移，导入会覆盖当前故事，但不会清除服务端累计预算。离线只能读已保存内容。`; $('dialogContent').append(p);button('导出当前存档',exportSave);button('导入存档',()=>{if(busy)return toast('请等待当前请求结束');$('importFile').click()});button('回看前文',()=>{$('drawer').close();review()});button('另启新篇',()=>{$('drawer').close();newStory()});}
function review(){openDialog('前文回看');if(!state.history.length){const p=document.createElement('p');p.textContent='尚未落笔。故事将在AI接通后生成。';$('dialogContent').append(p)}state.history.forEach((h,i)=>{const b=button(`${String(i+1).padStart(2,'0')} · ${h.page.title}`,()=>{$('drawer').close();show('story');drawPage(i)});b.className='review-row'})}
function newStory(){if(busy)return toast('请等待当前请求结束');if(state.history.length&&!confirm('开启新篇会替换当前故事，请先在故事匣导出。继续吗？'))return;randomize();show('setup')}
async function submitAction(){if(busy)return;if(!online)return toast('离线只读，请启动后端再续写');const action=$('action').value.trim();if(!action)return toast('先写下想做的事');busy=true;render();$('sendBtn').textContent='等候回信…';try{const data=await api('turn',{requestId:crypto.randomUUID(),revision:state.revision??state.history.length,action,director:$('director').checked});apply(data);$('action').value='';updateCount()}catch(e){toast(e.message)}finally{busy=false;$('sendBtn').textContent='落笔续写 →';render()}}
function updateCount(){$('count').textContent=`${$('action').value.length} / 2000`}
$('profileForm').onsubmit=async e=>{e.preventDefault();if(busy)return;if(!online)return toast('请启动本地后端后再开篇');busy=true;const profile={};for(const [key,label] of defs)profile[label]=$('field-'+key).value.trim();try{apply(await api('setup',{profile,revision:state.revision??state.history.length}));$('action').value='请根据我的自定义人设生成开篇，先让我置身一个可以自己决定如何回应的场景。';show('story');$('location').textContent='开篇';$('pageTitle').textContent='一封信，还未拆开';$('prose').textContent='';}catch(e){toast(e.message);return}finally{busy=false}await submitAction()};
$('actionForm').onsubmit=e=>{e.preventDefault();submitAction()};$('action').oninput=updateCount;$('newBtn').onclick=newStory;$('randomBtn').onclick=randomize;$('continueBtn').onclick=()=>{show('story');render()};$('backBtn').onclick=()=>show('home');$('homeLink').onclick=e=>{e.preventDefault();show('home')};$('archiveBtn').onclick=archive;$('reviewBtn').onclick=review;$('closeDialog').onclick=()=>$('drawer').close();
$('importFile').onchange=async()=>{const file=$('importFile').files[0];$('importFile').value='';if(!file)return;if(file.size>240000)return toast('存档过大');if(!online)return toast('导入需启动后端，以验证存档格式');if(!confirm('导入将替换当前故事，继续吗？'))return;try{const archive=JSON.parse(await file.text());apply(await api('import',{archive,revision:state.revision??state.history.length}));$('drawer').close();show(state.history.length?'story':'home');toast('存档已导入')}catch(e){toast(e.message)}};
async function init(){buildFields();try{const data=await api('state');online=true;ready=data.ready;apply(data)}catch{try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved?.game==='jingcheng-shuangshu'&&saved.version===1&&Array.isArray(saved.history))state=saved}catch{}render()}}
init();

window.addEventListener('storage',e=>{if(e.key===STORE){toast('另一标签的故事已更新，请刷新后继续');document.querySelectorAll('#story button,#profileForm button').forEach(b=>b.disabled=true)}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
