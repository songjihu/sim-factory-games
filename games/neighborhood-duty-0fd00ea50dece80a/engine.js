(function(g){'use strict';const D=typeof module!=='undefined'&&module.exports?require('./data.js'):g.GameData;
const VERSION=1,KEY='G217-huaili-save-v1';
function fresh(){return {schema:VERSION,rev:0,started:false,day:1,shift:3,cash:680,trust:48,safety:62,support:[45,45,45,45,45,45],projects:[],queue:[],done:0,missed:0,seed:17,nextId:1,meeting:0,logs:['新任期：28天，把每一件小事办出回音。'],ending:null};}
function log(s,t){s.logs.unshift(t);s.logs=s.logs.slice(0,60);}
function clamp(s){s.trust=Math.max(0,Math.min(100,s.trust));s.safety=Math.max(0,Math.min(100,s.safety));s.support=s.support.map(x=>Math.max(0,Math.min(100,x)));}
function add(s){const id=(s.seed+s.day*3+s.nextId*7)%D.events.length; s.queue.push({uid:s.nextId++,event:id,due:s.day+2,checked:false,stage:'open',method:null});}
function finish(s,force=false){if(s.cash<=0||s.trust<=0){s.ending='整改交接';log(s,'预算或信任耗尽，居民决定提前更换负责人。');}else if(s.day>28||force){s.ending=s.trust>=72&&s.safety>=65&&s.projects.length>=2?'共治示范':s.trust>=40&&s.safety>=35?'稳步续约':'整改交接';log(s,'任期结算：'+s.ending+'。');}}
function result(ok,message){return {ok,message};}
function act(s,type,arg={}){if(s.ending&&type!=='noop')return result(false,'本轮已经结束，请开启新任期。');
if(type==='start'){if(s.started)return result(false,'已经上任。');s.started=true;add(s);add(s);log(s,'上任第一天：先选地点，再看工单，查证能避免花冤枉钱。');return result(true,'任期开始，今日有3个班次。');}
if(!s.started)return result(false,'请先接下值班钥匙。');
if(type==='endDay'){
 if(s.meeting)return result(false,'请先完成本周议事，选择工程或保留预算。');
 s.queue=s.queue.filter(q=>{if(q.due<=s.day){s.trust-=q.stage==='follow'?5:7;s.support[D.events[q.event].resident]-=4;s.missed++;log(s,'逾期：'+D.events[q.event].title+'，信任受损。');return false;}return true;});
 s.cash+=86+(s.projects.includes(3)?12:0);s.safety-=s.projects.includes(0)?1:3;if(s.projects.includes(2))s.safety+=1;
 if(s.safety<30){s.cash-=45;s.trust-=4;log(s,'设施连续低于30，临时抢修支出45，信任−4。');}
 log(s,'第'+s.day+'日结算：值班预算到账，未处理事项继续保留。');s.day++;s.shift=3;
 if(s.day<=28){if(s.queue.length<5)add(s);if(s.day%3===0&&s.queue.length<5)add(s);if(s.day%7===1)s.meeting=s.day-1;}
 clamp(s);finish(s);return result(true,s.ending?'任期已经结束。':'新的一天，班次恢复。');
}
if(type==='project'){
 if(!s.meeting)return result(false,'居民议事每7天开放一次。');
 if(arg.id===-1){log(s,'第'+s.meeting+'日议事：保留预算，为抢修留出余地。');s.meeting=0;return result(true,'居民同意暂缓工程，预算保留。');}
 const p=D.projects.find(x=>x.id===arg.id);if(!p||s.projects.includes(p.id))return result(false,'这项工程已完成或不存在。');
 if(s.cash<p.cost)return result(false,'预算不足，先保留预算或选择其他工程。');
 s.cash-=p.cost;s.projects.push(p.id);s.trust+=5;s.safety+=8;s.support=s.support.map((x,i)=>x+((i+p.need)%3===0?10:4));log(s,'居民议事通过：'+p.name+'，预算−'+p.cost+'。');s.meeting=0;clamp(s);return result(true,p.name+'投入使用，长期效果从今天生效。');
}
if(type==='care'){if(s.shift<1)return result(false,'今天班次用完了，交班后再来。');const i=arg.id;if(!Number.isInteger(i)||i<0||i>5)return result(false,'居民不存在。');s.shift--;s.support[i]+=6;s.trust+=1;log(s,'走访'+D.residents[i][0]+'，支持+6。');clamp(s);return result(true,'认真听完近况，居民支持+6，信任+1。');}
const q=s.queue.find(x=>x.uid===arg.uid);if(!q)return result(false,'工单已更新，请重新选择。');const e=D.events[q.event];
if(s.shift<1)return result(false,'今日班次用完，请交班后继续。');
if(type==='inspect'){if(q.stage!=='open'||q.checked)return result(false,'此工单已完成查证。');s.shift--;q.checked=true;log(s,'查证：'+e.title+'。');return result(true,e.fact);}
if(type==='resolve'){
 if(q.stage!=='open')return result(false,'已处理，请在次日回访。');
 const methods={self:{cost:28,gain:q.checked?7:2,safe:q.checked?6:1},pro:{cost:q.checked?64:90,gain:6,safe:9},joint:{cost:12,gain:q.checked?9:3,safe:q.checked?4:0}};const m=methods[arg.method];if(!m)return result(false,'请选择处理方式。');
 if(arg.method==='joint'&&s.support[e.resident]<35)return result(false,'这位居民支持低于35，需要先走访，才能组织共建。');
 if(s.cash<m.cost)return result(false,'预算不足，不能执行此方案。');s.cash-=m.cost;s.shift--;s.trust+=m.gain;s.safety+=m.safe;s.support[e.resident]+=m.gain;q.stage='follow';q.method=arg.method;q.ready=s.day+1;q.due=s.day+3;s.done++;log(s,e.title+'：'+({self:'现场处理',pro:'专业派工',joint:'居民共建'}[arg.method])+'，预算−'+m.cost+'，待次日回访。');clamp(s);return result(true,e.result+' 次日回访后才能正式销单。');
}
if(type==='follow'){if(q.stage!=='follow')return result(false,'工单尚未处理。');if(s.day<q.ready)return result(false,'请给方案一点时间，次日再回访。');s.shift--;s.trust+=4;s.support[e.resident]+=4;s.cash+=24;s.queue=s.queue.filter(x=>x.uid!==q.uid);log(s,'回访完成：'+e.title+'，返还节余24，信任+4。');clamp(s);return result(true,'居民确认问题没有复发。正式销单，节余24回到账上。');}
return result(false,'无法识别的操作。');}
function validate(s){if(!s||s.schema!==VERSION||typeof s.started!=='boolean'||!Number.isInteger(s.rev)||s.rev<0||!Number.isInteger(s.day)||s.day<1||s.day>29||!Number.isInteger(s.shift)||s.shift<0||s.shift>3||!Number.isFinite(s.cash)||s.cash< -1000||s.cash>1e7||!Number.isFinite(s.trust)||s.trust<0||s.trust>100||!Number.isFinite(s.safety)||s.safety<0||s.safety>100)return false;
 if(!Array.isArray(s.support)||s.support.length!==6||s.support.some(x=>!Number.isFinite(x)||x<0||x>100)||!Array.isArray(s.projects)||new Set(s.projects).size!==s.projects.length||s.projects.some(x=>!Number.isInteger(x)||x<0||x>3)||!Array.isArray(s.queue)||s.queue.length>5||!Array.isArray(s.logs)||s.logs.length>60||s.logs.some(x=>typeof x!=='string'||x.length>500)||![null,'整改交接','稳步续约','共治示范'].includes(s.ending))return false;
 if(!['done','missed','seed','nextId','meeting'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<1e7))return false;
 return new Set(s.queue.map(q=>q.uid)).size===s.queue.length&&s.queue.every(q=>q&&Number.isInteger(q.uid)&&q.uid>0&&q.uid<s.nextId&&Number.isInteger(q.event)&&q.event>=0&&q.event<D.events.length&&Number.isInteger(q.due)&&q.due>=1&&q.due<=32&&typeof q.checked==='boolean'&&['open','follow'].includes(q.stage)&&(q.stage==='open'||(Number.isInteger(q.ready)&&q.ready<=32&&['self','pro','joint'].includes(q.method))));
}
function parse(text){const s=JSON.parse(text);if(!validate(s))throw Error('存档格式或版本不正确，原进度未改动。');return s;}
const E={KEY,fresh,act,validate,parse};if(typeof module!=='undefined')module.exports=E;g.GameEngine=E;
})(typeof globalThis!=='undefined'?globalThis:this);
