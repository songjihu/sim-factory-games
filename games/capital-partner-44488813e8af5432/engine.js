/* Original fictional simulation. All money denominated in ten-thousand CNY. */
const E=(()=>{
const names=['衡星机器人','鲸川物流','青禾医研','云阶软件','北辰精工','远岸货运','澄明诊疗','知序科技','星拓装备','航路供应链','新芽药研','万象系统'];
const founders=['姚青','罗川','宋岚','许闻'];
const sectors=['硬科技','供应链','医疗','企业软件'];
const roles=[['沈砚','管理合伙人','决定资本去向，为每次判断承担结果。'],['顾宁','风控合伙人','先查现金流，再听增长故事。'],['周衡','财务总监','估值不是现金，退出还要打折。'],['陈蔚','LP代表','十二年后，看拿回多少钱。'],...founders.map((n,i)=>[n,sectors[i]+'创业者','尽调能揭示团队质量，经营支持可以改善基本面。'])];
function fresh(seed=Date.now()%1000000){return {schema:1,game:'G016',seed,year:1998,ap:4,cash:1000,trust:70,returned:0,invested:0,hold:[],seen:[],log:['1998年，澜岳资本首期基金成立。你受托管理1000万元。'],ended:false,started:true,rev:0,history:[1000],dd:{}}}
function rand(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296}
function pool(s){let n=s.year-1998;return [0,1,2].map((_,i)=>{let id=(n*3+i)%12,sec=id%4;return {id,name:names[id],sector:sec,founder:founders[sec],quality:35+(id*31+17)%56,ticket:100+(id%4)*35,price:300+(id%5)*90,description:['国产机器人替换进口零件，订单增长但研发烧钱。','签下跨省货运合同，周转账期很长。','临床服务需求稳定，但审批周期漫长。','订阅制企业系统，增长快且竞争激烈。'][sec]}})}
function nav(s){return s.cash+s.hold.reduce((a,h)=>a+h.value,0)}
function cycle(s,sec){return [-.13,.05,.12,-.04,.22,-.08,.16,.07,-.25,.14,.20,.06][(s.year-1998+sec*2)%12]}
function quote(s,h){return h.value*(h.age>=4?.92:h.age>=2?.78:.60)}
const events=Array.from({length:32},(_,i)=>({id:i,title:['产业订单潮','融资窗口收紧','机构收购邀约','关键人才流动','创始人补交财报','LP季度问询','技术路线争议','企业现金告急'][i%8],sector:Math.floor(i/8),kind:i%8}));
function eligible(s,e){return !s.seen.includes(e.id)&&(e.kind===5||s.hold.some(h=>h.sector===e.sector))&&(e.kind!==7||s.cash<400)&&(e.kind!==2||s.hold.some(h=>h.age>=2))}
function eventFor(s){return events.find(e=>eligible(s,e))||{id:100+s.year,title:'年度资本安排',kind:5,sector:0}}
function options(s,e){return [{text:e.kind===5?'向LP完整披露':'投入专项支持',cost:e.kind===5?0:25,trust:5,value:.09},{text:e.kind===5?'保留精简简报':'维持现有计划',cost:0,trust:-2,value:-.035},{text:'请风控牵头复核',cost:10,trust:3,value:.025}]}
function act(s,k,id){if(s.ended)return{ok:false,text:'基金已清算，请新开基金。'};if(s.pending)return{ok:false,text:'请先完成投委会议案。'};if(s.ap<1)return{ok:false,text:'本年精力用尽，请召开年度投委会。'};
let p=pool(s).find(p=>p.id===id),h=s.hold.find(h=>h.id===id),cost=0;
if(k==='dd'){if(!p||s.dd[id])return{ok:false,text:'该项目已完成尽调。'};cost=8}
if(k==='buy'){if(!p||h)return{ok:false,text:'项目已持有或不在本年项目池。'};cost=p.ticket}
if(k==='support'){if(!h)return{ok:false,text:'请先选择持仓。'};cost=20}
if(k==='follow'){if(!h)return{ok:false,text:'请先选择持仓。'};cost=75}
if(k==='sell'&&!h)return{ok:false,text:'请先选择持仓。'};
if(!['dd','buy','support','follow','sell','reserve'].includes(k))return{ok:false,text:'未知操作。'};
if(s.cash<cost)return{ok:false,text:'可用现金不足，无法执行。'};
s.cash-=cost;s.ap--;let text='';
if(k==='dd'){s.dd[id]=p.quality;text=`${p.name}尽调完成：团队质量${p.quality}分，${p.quality>=65?'执行扎实':'增长故事有待验证'}。`}
if(k==='buy'){s.hold.push({...p,value:cost,cost,age:0,support:0,share:Math.round(cost/p.price*1000)/10});s.invested+=cost;text=`签署投资：${p.name}，投入${cost}万，取得${s.hold.at(-1).share}%股权。`}
if(k==='support'){h.support++;h.quality=Math.min(95,h.quality+6);text=`为${h.name}安排经营顾问，质量提升6分，本年增长加成。`}
if(k==='follow'){h.cost+=75;h.value+=75;h.share+=3;s.invested+=75;text=`跟投${h.name}75万，持股增加3个百分点。`}
if(k==='sell'){let money=quote(s,h);s.cash+=money;s.returned+=money;s.hold=s.hold.filter(x=>x.id!==id);text=`退出${h.name}，到账${money.toFixed(1)}万。折价已结算，账面估值不再计入净资产。`}
if(k==='reserve'){s.trust=Math.min(100,s.trust+2);text='与LP沟通储备方案，信任+2，保留现金。'}
s.log.unshift(`${s.year}｜${text}`);return{ok:true,text}}
function meeting(s){if(s.ended||s.pending)return false;s.pending=eventFor(s);return true}
function settle(s,index){if(!s.pending||!Number.isInteger(index)||index<0||index>2)return{ok:false,text:'无效议案。'};let e=s.pending,o=options(s,e)[index];if(s.cash<o.cost)return{ok:false,text:'现金不足，请选择其他议案。'};s.cash-=o.cost;s.trust=Math.max(0,Math.min(100,s.trust+o.trust));s.seen.push(e.id);s.hold.filter(h=>h.sector===e.sector).forEach(h=>h.value*=1+o.value);
let dividend=0;for(let h of s.hold){let growth=(h.quality-50)/120+cycle(s,h.sector)+(rand(s)-.5)*.22+h.support*.035;h.value=Math.max(0,h.value*(1+growth));h.age++;h.support=0;if(h.age>=2&&growth>0){let d=h.value*.025;dividend+=d;s.cash+=d;s.returned+=d;h.value-=d}}
s.cash-=60;s.log.unshift(`${s.year}年报｜${e.title}：${o.text}。管理支出60万，分红到账${dividend.toFixed(1)}万。`);s.history.push(nav(s));s.last={year:s.year,event:e.title,decision:o.text,dividend,nav:nav(s),cash:s.cash};delete s.pending;
if(s.cash<0||s.trust<=0||s.year>=2009){s.ended=true;let liquidation=s.hold.reduce((a,h)=>a+quote(s,h),0);s.cash+=liquidation;s.returned+=liquidation;s.hold=[];s.ending=s.cash>=1800&&s.trust>0?'资本长青':s.cash>=1000&&s.trust>0?'守住本金':'清算失利';s.log.unshift(`基金到期清算：全部股权按退出折价变现${liquidation.toFixed(1)}万，最终现金${s.cash.toFixed(1)}万。`)}else{s.year++;s.ap=4;s.dd={}}return{ok:true,text:'年报已送达。'}}
function valid(s){if(!s||s.schema!==1||s.game!=='G016'||!Number.isInteger(s.seed)||!Number.isInteger(s.year)||s.year<1998||s.year>2009||!Number.isInteger(s.ap)||s.ap<0||s.ap>4||!Number.isFinite(s.cash)||s.cash< -10000||s.cash>1e9||!Number.isFinite(s.trust)||s.trust<0||s.trust>100||!Number.isFinite(s.returned)||!Number.isFinite(s.invested)||!Array.isArray(s.hold)||s.hold.length>12||!Array.isArray(s.log)||!s.log.every(x=>typeof x==='string')||!Array.isArray(s.seen)||!Array.isArray(s.history)||!s.history.every(Number.isFinite)||typeof s.dd!=='object'||s.dd===null)return false;let ids=new Set();for(let h of s.hold){if(!Number.isInteger(h.id)||h.id<0||h.id>11||ids.has(h.id)||typeof h.name!=='string'||!Number.isInteger(h.sector)||h.sector<0||h.sector>3||!['value','cost','age','support','share','quality'].every(k=>Number.isFinite(h[k])&&h[k]>=0&&h[k]<=1e9))return false;ids.add(h.id)}return !s.pending||Number.isInteger(s.pending.id)&&typeof s.pending.title==='string'&&Number.isInteger(s.pending.sector)&&s.pending.sector>=0&&s.pending.sector<=3}
return{fresh,pool,nav,cycle,quote,roles,sectors,events,eventFor,options,act,meeting,settle,valid};})();
if(typeof module!=='undefined')module.exports=E;
