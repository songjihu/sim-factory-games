'use strict';
const Engine=(()=>{
 const GAME='G202',SCHEMA=1,VERSION='1.0.0',KEY='G202.empress.save.v1',META='G202.empress.library.v1';
 const clone=x=>JSON.parse(JSON.stringify(x));
 function fresh(){return{game:GAME,schema:SCHEMA,version:VERSION,node:'m0',page:0,phase:'read',result:null,route:null,stats:{power:52,bond:48,court:48,silver:44},flags:{},evidence:[],log:[],checkpoints:[],seen:[],revision:0,savedAt:0,startedAt:Date.now()};}
 function hash(x){let n=2166136261;for(const ch of x)n=Math.imul(n^ch.charCodeAt(0),16777619);return(n>>>0).toString(16);}
 function envelope(s){const data=clone(s);return{format:'G202.save',schema:SCHEMA,data,checksum:hash(JSON.stringify(data))};}
 function valid(s){if(!s||s.game!==GAME||s.schema!==SCHEMA||!STORY.nodes[s.node]||!['read','choice','result','ending'].includes(s.phase))throw Error('存档格式或章节不兼容');
  if(!Number.isInteger(s.page)||s.page<0||s.page>50||!Number.isInteger(s.revision)||s.revision<0)throw Error('存档进度损坏');
  if(!s.stats||Object.keys(s.stats).length!==4||!['power','bond','court','silver'].every(k=>Number.isFinite(s.stats[k])&&s.stats[k]>=0&&s.stats[k]<=100))throw Error('存档数值损坏');
  if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||Object.entries(s.flags).some(([k,v])=>!STORY.flagKeys.includes(k)||!Number.isInteger(v)||Math.abs(v)>500))throw Error('存档记录损坏');
  if(!Array.isArray(s.evidence)||s.evidence.length>150||s.evidence.some(k=>!STORY.items[k]))throw Error('存档证物损坏');
  if(!Array.isArray(s.log)||s.log.length>150||s.log.some(x=>!STORY.nodes[x.node]||!Number.isInteger(x.choice)||!STORY.nodes[x.node].options[x.choice]))throw Error('存档选择记录损坏');
  if(!Array.isArray(s.seen)||s.seen.some(k=>!STORY.nodes[k])||!Array.isArray(s.checkpoints)||s.checkpoints.length>20)throw Error('存档回溯记录损坏');
  if(s.route!==null&&!['A','B','C','D'].includes(s.route))throw Error('存档路线损坏');
  if(s.node[0]!=='m'&&s.node!==('end'+s.route)&&s.node[0]!==s.route)throw Error('存档路线与章节不符');
  if(s.node[0]==='m'&&s.route!==null)throw Error('共同章节的路线记录不符');
  if(STORY.nodes[s.node].ending&&s.phase!=='ending')throw Error('结局状态不符');
  if(s.phase==='result'&&(!s.result||typeof s.result.text!=='string'||s.result.text.length>3000||!s.result.delta||typeof s.result.delta!=='object'||Object.values(s.result.delta).some(x=>!Number.isFinite(x))))throw Error('存档反馈损坏');
  for(const c of s.checkpoints){if(!c||!STORY.nodes[c.node]||!c.stats||!['power','bond','court','silver'].every(k=>Number.isFinite(c.stats[k])&&c.stats[k]>=0&&c.stats[k]<=100)||!c.flags||Array.isArray(c.flags)||Object.entries(c.flags).some(([k,v])=>!STORY.flagKeys.includes(k)||!Number.isInteger(v)||Math.abs(v)>500)||!Array.isArray(c.evidence)||c.evidence.some(k=>!STORY.items[k])||!Number.isInteger(c.logLength)||c.logLength<0||c.logLength>s.log.length||!(c.route===null||['A','B','C','D'].includes(c.route)))throw Error('存档章节记录损坏');}
  return s;}
 function decode(text){if(text.length>1000000)throw Error('存档文件过大');const e=JSON.parse(text);if(e.format!=='G202.save'||e.schema!==SCHEMA||e.checksum!==hash(JSON.stringify(e.data)))throw Error('存档校验失败，请使用本游戏导出的完整文件');return valid(e.data);}
 function library(){try{const x=JSON.parse(localStorage.getItem(META)||'{}');return{endings:Array.isArray(x.endings)?x.endings.filter(x=>['A','B','C','D','X'].includes(x)):[],seen:Array.isArray(x.seen)?x.seen.filter(x=>STORY.nodes[x]):[]};}catch{return{endings:[],seen:[]};}}
 let state=fresh(),baseline=null,conflict=false,storageOK=true;
 function load(){try{const raw=localStorage.getItem(KEY);if(raw){state=decode(raw);baseline=raw;}return true;}catch(e){return e.message;}}
 function persist(){try{const current=localStorage.getItem(KEY);if(current!==baseline){conflict=true;return false;}state.revision++;state.savedAt=Date.now();const raw=JSON.stringify(envelope(state));localStorage.setItem(KEY,raw);baseline=raw;storageOK=true;return true;}catch{storageOK=false;return true;}}
 function transact(fn){if(conflict)return false;const before=clone(state);fn();if(!persist()){state=before;return false;}return true;}
 function enter(id){state.node=id;state.page=0;state.phase='read';state.result=null;const n=STORY.nodes[id];if(!state.seen.includes(id))state.seen.push(id);
  if(n.start&&!state.checkpoints.some(x=>x.node===id)){state.checkpoints.push({node:id,stats:clone(state.stats),flags:clone(state.flags),evidence:[...state.evidence],logLength:state.log.length,route:state.route});}
  if(n.ending){state.phase='ending';try{const l=library();l.endings=[...new Set([...l.endings,n.ending])];l.seen=[...new Set([...l.seen,...state.seen])];localStorage.setItem(META,JSON.stringify(l));}catch{}}
 }
 const count=k=>state.flags[k]||0;
 function route(){if(count('truce')>=5&&count('terms')>=1)return'D';if(count('joint')>=6&&count('honest')>=2&&state.stats.bond>=45)return'B';if(count('delegate')>=5)return'C';return'A';}
 function available(o){if(o.need&&!state.evidence.includes(o.need))return'先查验：'+STORY.items[o.need].title;if(o.cost&&state.stats.silver<o.cost)return'库银不足 '+o.cost+' 筹';return null;}
 function choose(i){const n=STORY.nodes[state.node],o=n.options[i];if(state.phase!=='choice'||!o||available(o))return false;return transact(()=>{const delta={};for(const[k,v]of Object.entries(o.fx||{})){const old=state.stats[k];state.stats[k]=Math.max(0,Math.min(100,old+v));delta[k]=state.stats[k]-old;}if(o.cost){state.stats.silver-=o.cost;delta.silver=(delta.silver||0)-o.cost;}for(const[k,v]of Object.entries(o.tags||{}))state.flags[k]=(state.flags[k]||0)+v;state.log.push({node:n.id,choice:i,label:o.label});state.phase='result';state.result={text:o.result,delta};});}
 function next(){const n=STORY.nodes[state.node];return transact(()=>{if(state.phase==='read'){const pages=STORY.pages(n,state);if(state.page<pages.length-1)state.page++;else state.phase=n.options.length?'choice':'ending';}else if(state.phase==='result'){if(n.next==='@route'){state.route=route();enter(state.route+'0');}else enter(typeof n.next==='function'?n.next(state):n.next);}});}
 function inspect(id){if(!STORY.items[id]||!STORY.nodes[state.node].items.includes(id))return false;return transact(()=>{if(!state.evidence.includes(id))state.evidence.push(id);});}
 function restart(){try{baseline=localStorage.getItem(KEY);}catch{}conflict=false;state=fresh();enter('m0');return persist();}
 function reloadLatest(){conflict=false;return load();}
 function importSave(text){const s=decode(text);try{baseline=localStorage.getItem(KEY);}catch{}state=s;conflict=false;return persist();}
 function rewind(id){const c=state.checkpoints.find(x=>x.node===id);if(!c)return false;return transact(()=>{state.stats=clone(c.stats);state.flags=clone(c.flags);state.evidence=[...c.evidence];state.log=state.log.slice(0,c.logLength);state.route=c.route;state.checkpoints=state.checkpoints.slice(0,state.checkpoints.indexOf(c));enter(id);});}
 if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue!==baseline){conflict=true;window.dispatchEvent(new Event('game-save-conflict'));}});
 return{GAME,KEY,VERSION,get s(){return state;},get conflict(){return conflict;},get storageOK(){return storageOK;},load,persist,next,choose,inspect,available,restart,reloadLatest,importSave,rewind,library,export:()=>JSON.stringify(envelope(state),null,2),valid,decode,route};
})();
if(typeof module!=='undefined')module.exports=Engine;
