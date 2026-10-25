'use strict';
const Manor=(()=>{
const VERSION=1,KEY='g053-zhumen-save-v1',people=['陆老夫人','二房许氏','账房周先生','庄头陈娘子','杜嬷嬷','世子赵怀瑾'];
const names={cash:'银两',prestige:'家望',harmony:'人心',clarity:'清账',land:'庄田',workshop:'工坊'};
const actions={
 audit:{name:'核查公账',icon:'账',cost:10,desc:'清账 +12，收回漏账 18两；二房信任 −3',e:{cash:8,clarity:12},rel:{1:-3,2:5},scene:'hall'},
 land:{name:'修渠置田',icon:'田',cost:35,desc:'付35两，庄田 +1；下月起连续3月各回款8两',e:{cash:-35,land:1},rel:{3:4},scene:'estate'},
 workshop:{name:'添置织机',icon:'织',cost:32,desc:'付32两，工坊 +1；每月收入 +6两',e:{cash:-32,workshop:1},rel:{4:3},scene:'estate'},
 visit:{name:'巡庄问事',icon:'巡',cost:8,desc:'付8两，人心 +8、清账 +4；庄头信任 +6',e:{cash:-8,harmony:8,clarity:4},rel:{3:6},scene:'estate'},
 council:{name:'召集议事',icon:'议',cost:12,desc:'付12两，人心 +7、家望 +5；各房信任 +3',e:{cash:-12,harmony:7,prestige:5},rel:{0:3,1:3,5:3},scene:'council'},
 school:{name:'延师设学',icon:'学',cost:18,desc:'付18两，家望 +9；世子与老夫人信任 +5',e:{cash:-18,prestige:9},rel:{0:5,5:5},scene:'council'},
 rest:{name:'整顿内务',icon:'理',cost:0,desc:'不花银两，人心 +4、清账 +3；总管信任 +3',e:{harmony:4,clarity:3},rel:{4:3},scene:'hall'},
 banquet:{name:'设席酬客',icon:'宴',cost:25,desc:'付25两，家望 +12；老夫人信任 +7',e:{cash:-25,prestige:12},rel:{0:7},scene:'council'}
};
// Event rows: id, title, prose, actor, minimum month, condition, choices.
const choice=(label,e={},rel={},debt=null,flag=null)=>({label,e,rel,debt,flag});
const events=[
['seal','家印到手，旧账未清','老夫人将家印交来：下月便是春祭，可公账里有一笔说不清的采买。',0,1,()=>true,[choice('先查账，再论排场',{clarity:10,prestige:-3},{0:-3,2:5}),choice('照旧办春祭，稳住门面',{cash:-20,prestige:10},{0:6}),choice('压减半数席面，亲自解释',{cash:-8,harmony:5},{0:2,4:3})]],
['seeds','春种借粮','陈娘子带来佃户请愿：借出种粮，会少一笔现银，秋后才有回报。',3,2,s=>s.month<=4,[choice('借出种粮，秋后归还',{cash:-18,harmony:7},{3:8},{after:4,amount:34,label:'佃户秋后还粮折银'},'seed'),choice('按契约收租，不另借粮',{cash:10,harmony:-9},{3:-7}),choice('减租一半，换取共修沟渠',{cash:-8,land:1},{3:4})]],
['cloth','二房要新衣','许氏说，别府夫人都换了新季衣裳，二房也不能失了体面。',1,2,()=>true,[choice('照公例发放，不另开口子',{clarity:6,harmony:-3},{1:-5,4:4}),choice('公账添补一套',{cash:-15,prestige:5},{1:8}),choice('请二房主持旧衣改制',{cash:-5,harmony:5},{1:3,4:3})]],
['ledger','对不上的签押','周先生发现总管旧年签押与库房出入不合，需要你定夺追查范围。',2,2,s=>s.clarity<85,[choice('逐笔查清，追回挪用',{cash:24,clarity:12,harmony:-5},{2:8,4:-5},null,'audit'),choice('给三日自陈，少惊动各房',{cash:10,clarity:7},{2:4,4:2}),choice('封存旧账，留待年终',{clarity:-10,harmony:3},{2:-5})]],
['weavers','织娘求添机','府里的织娘接到外单，添一架织机就能多接活，但工钱要现付。',4,2,s=>s.workshop<5,[choice('付银添机，按件结工钱',{cash:-24,workshop:1,harmony:3},{4:6}),choice('只接现有产能能做的单',{cash:8,prestige:2},{4:2}),choice('先接大单，许诺下月付账',{cash:28,prestige:3},{4:-3},{after:1,amount:-40,label:'织坊赊欠到期'})]],
['doctor','老夫人静养','老夫人膝痛，府医建议静养。本月若仍大开宴席，恐怕会劳累。',0,3,s=>s.people[0]<80,[choice('撤宴请医，亲自侍奉',{cash:-12,harmony:7,prestige:-2},{0:10}),choice('照常宴客，另派人照料',{cash:-8,prestige:5},{0:-6}),choice('改成家宴，各房轮流陪伴',{cash:-5,harmony:6},{0:5,1:3})]],
['exam','世子求游学','赵怀瑾想去外郡书院。银子花出去，短期却无人替他料理府外人情。',5,3,s=>!s.flags.includes('study'),[choice('资助游学，年底看成果',{cash:-22,prestige:-3},{5:10},{after:3,amount:16,label:'书院策论获赏折银'},'study'),choice('留府研读，请先生指点',{cash:-10,prestige:5},{5:3}),choice('先料理府务，再谈游学',{clarity:5},{5:-7})]],
['flood','暴雨压堤','连雨冲坏田埂，庄头请你决定：修堤、救苗还是先保银库。',3,4,s=>s.month<=8,[choice('拨银修堤，保住庄田',{cash:-26,land:1},{3:8},null,'levee'),choice('组织互助救苗',{cash:-10,harmony:6},{3:4}),choice('暂缓处置，先守银库',{cash:5,land:-1,harmony:-8},{3:-8})]],
['guest','贵客临门','侯爷旧友突然来访。全套仪仗费用不低，一桌清席又怕被轻看。',0,3,()=>true,[choice('盛宴接待，拓宽往来',{cash:-24,prestige:12},{0:6}),choice('清席谈事，以诚待客',{cash:-7,prestige:4},{0:2}),choice('婉辞改日，专心内务',{clarity:5,prestige:-6},{0:-4})]],
['wages','丫鬟工钱迟发','杜嬷嬷说旧例要到月底才发工钱，但几位家中急需用银。',4,3,s=>s.harmony<80,[choice('提前发足，修订发放日',{cash:-14,harmony:10},{4:8}),choice('先发急需者，其余按例',{cash:-6,harmony:4},{4:3}),choice('仍按旧例，不开先河',{harmony:-7,clarity:4},{4:-6})]],
['porcelain','库房碎瓷','一只名贵瓷瓶碎了，两名管事互相指责，账面索赔远高于实价。',2,4,s=>s.clarity>=55,[choice('查出虚报，按实价赔补',{cash:15,clarity:8},{2:7,4:2}),choice('从公账补齐，平息争执',{cash:-18,harmony:4},{4:3}),choice('罚全班管事，立威示众',{prestige:7,harmony:-10},{4:-8})]],
['lease','三年租约','城南商铺愿交一笔预付租金，但以后每月要少收一部分庄租。',2,4,s=>!s.flags.includes('lease'),[choice('收预租，承担三期抵扣',{cash:48},{2:3},{after:1,amount:-20,label:'预租抵扣',repeat:3},'lease'),choice('只签常租，细水长流',{cash:12,clarity:4},{2:5}),choice('修缮商铺再议',{cash:-18,workshop:1},{2:2})]],
['well','庄上新井','庄上水井干涸，打新井可解眼前困局，却要动用你留作秋祭的银子。',3,5,s=>s.month<=9,[choice('打井，祭礼从简',{cash:-20,land:1,prestige:-3},{3:8}),choice('雇车送水，先度本月',{cash:-8,harmony:3},{3:2}),choice('各户自行解决',{harmony:-9,prestige:3},{3:-9})]],
['dowry','姑娘的嫁妆','旁支姑娘出嫁，老夫人希望添妆，二房则说公账不能厚此薄彼。',1,5,()=>true,[choice('按亲疏定例，写入公账',{cash:-12,clarity:8},{0:3,1:3}),choice('厚添嫁妆，留足体面',{cash:-28,prestige:12},{0:8,1:-4}),choice('赠亲手整备的实用物',{cash:-7,harmony:5},{0:2})]],
['counterfeit','假印风波','外铺拿来盖着家印的欠条，你从未批准，周先生请求验印。',2,5,s=>s.clarity>=65,[choice('公示验印，追回假账',{cash:22,clarity:6,prestige:5},{2:8}),choice('私下议价，避免外传',{cash:-5,prestige:2},{2:-2}),choice('认下欠条，保住往来',{cash:-30,prestige:6,clarity:-8},{2:-8})]],
['tea','茶会座次','一场茶会的座次惹得两房不快，谁坐上席，便像你偏向了谁。',1,5,s=>s.people[1]<75,[choice('按长幼定座，公开礼单',{clarity:6,harmony:2},{0:4,1:-2}),choice('轮流作东，给两房台阶',{cash:-8,harmony:8},{1:6,0:2}),choice('请二房上席，暂缓争端',{prestige:4},{1:9,0:-6})]],
['silk','绸价上涨','绸行催你趁涨价出货，织娘担心一时抢单损了手艺。',4,6,s=>s.workshop>=2,[choice('按时交货，不贪超量',{cash:20,prestige:4},{4:5}),choice('加班赶单，赚一笔快银',{cash:40,harmony:-10},{4:-6}),choice('添工钱，接小批急单',{cash:14,harmony:5},{4:7})]],
['reconcile','二房来和解','许氏带着自己记的账来找你：有些旧例，也许可以一起改。',1,6,s=>s.people[1]>=55,[choice('共拟新例，分给实权',{clarity:10,harmony:6},{1:8}),choice('听取建议，家印仍由你掌',{clarity:5,prestige:4},{1:2}),choice('只收账本，不谈往事',{clarity:7,harmony:-4},{1:-7})]],
['harvest','秋粮入仓','新粮归仓，各房都想多留一些；卖粮能补银库，留粮更有底气。',3,7,s=>s.month<=10,[choice('半卖半留，按户分粮',{cash:20,harmony:7},{3:5}),choice('趁价高卖出',{cash:38,harmony:-5},{3:-3}),choice('留作冬粮，减免佃租',{cash:5,harmony:12},{3:9},null,'grain')]],
['repair','祠堂修缮','祠堂屋顶漏雨，工匠报了三个价；旧规矩要求用最贵的木料。',0,7,()=>true,[choice('查工料，修到够用',{cash:-14,clarity:5,prestige:3},{0:3}),choice('全套修缮，重振门楣',{cash:-32,prestige:14},{0:9}),choice('先补漏，明年再修',{cash:-5,prestige:-4},{0:-3})]],
['apprentice','庄头荐徒','陈娘子举荐一个会算账的年轻姑娘，希望府里给她试工机会。',3,7,s=>s.people[3]>=60,[choice('立试工约，按能力任用',{cash:-10,clarity:9,harmony:5},{3:6,2:4}),choice('先随账房旁听',{cash:-3,clarity:4},{2:2}),choice('仍用旧人，暂不增员',{harmony:-4},{3:-5})]],
['pilfer','冬衣被截','送往庄上的冬衣少了三箱。总管愿意自掏银子补上，只求别追究。',4,8,s=>s.clarity<75,[choice('补衣并查去向',{cash:-10,clarity:12,harmony:4},{4:-4,3:5}),choice('让总管补足，记一次过失',{clarity:4,harmony:2},{4:-3}),choice('不再过问，收下赔银',{cash:16,clarity:-9,harmony:-6},{4:3})]],
['poem','书院佳报','赵怀瑾的文章获书院称许，他想把赏银用于府学，而非添置衣冠。',5,8,s=>s.flags.includes('study')||s.people[5]>=65,[choice('准用于府学，记为他的功劳',{cash:-6,prestige:10,harmony:4},{5:9}),choice('收归公账，共渡年关',{cash:20,clarity:4},{5:-4}),choice('一半入学，一半补库',{cash:8,prestige:5},{5:4})]],
['credit','旧债上门','旧年商户拿来欠契，要你在本月还清，或加息延到年尾。',2,8,()=>true,[choice('现银结清，取回欠契',{cash:-25,clarity:8,prestige:3},{2:5}),choice('先还十两，其余下月清',{cash:-10},{2:1},{after:1,amount:-18,label:'旧债尾款'}),choice('以旧货抵债，折损声望',{prestige:-9,clarity:4},{2:-3})]],
['winter','冬日施粥','城外风雪，府门前来了求助的百姓。开仓会动用你留的年礼。',3,9,()=>true,[choice('开仓施粥，年礼从简',{cash:-18,harmony:10,prestige:3},{3:7,0:-2}),choice('联合邻府，各出一份',{cash:-8,harmony:5,prestige:4},{0:2}),choice('仅救助本庄佃户',{cash:-3,harmony:2,prestige:-3},{3:1})]],
['feast','寿宴规格','老夫人寿辰将近，坊间都在猜主母会如何操办。',0,9,()=>true,[choice('小宴重陪伴',{cash:-12,harmony:8},{0:7,5:4}),choice('大宴开府门',{cash:-35,prestige:15},{0:9}),choice('寿礼从简，捐给府学',{cash:-8,prestige:5},{0:-2,5:7})]],
['vote','年末议权','各房提出重新分派管事权。你可放出部分实权，也可以继续亲自掌管。',1,10,()=>true,[choice('权责分开，账目互查',{clarity:10,harmony:5},{1:5,2:5}),choice('按贡献分管各庄',{harmony:9,clarity:-2},{1:7,3:5}),choice('家印一统，逐事请示',{prestige:8,harmony:-7},{1:-7,4:-4})]],
['gift','年礼去留','族亲索要超例年礼，明示若不送就不来年宴。',0,10,()=>true,[choice('依例送礼，写明份额',{cash:-10,clarity:7},{0:1}),choice('加倍年礼，维系声望',{cash:-28,prestige:12},{0:6}),choice('不争座上客，礼到即可',{cash:-3,prestige:-4,harmony:3},{0:-3})]],
['bonus','工坊分红','织坊盘点出盈余，大家都等你决定分红还是留作周转。',4,10,s=>s.workshop>=3,[choice('分给织娘，再留周转',{cash:16,harmony:9},{4:8}),choice('全部留库，准备来年',{cash:35,harmony:-7},{4:-6}),choice('添一台机，来年再扩',{workshop:1,harmony:3},{4:4})]],
['closing','封账前夜','周先生把一年的账本摆在案上：今年的选择，终究要写进家史。',2,11,()=>true,[choice('公开各项收支，让众人签押',{clarity:8,harmony:4},{2:6,1:2}),choice('把盈余用于年终犒赏',{cash:-15,harmony:10},{4:6}),choice('留足来年周转，不再支出',{cash:8,prestige:-3},{2:2})]]
].map(([id,title,text,actor,min,when,choices])=>({id,title,text,actor,min,when,choices:[...choices,choice('变卖旧物应急，缩减本次安排',{cash:4,prestige:-8,harmony:-4})]}));
function create(seed=Date.now()%2147483647){return {version:VERSION,seed,month:1,phase:'action',ap:2,cash:160,prestige:52,harmony:58,clarity:48,land:2,workshop:1,allowance:'normal',people:[60,48,58,55,60,52],used:[],seen:[],flags:[],contracts:[],event:null,ending:null,last:null,log:['景朝·靖宁侯府。你接过家印，十二个月后，要交出一府的答卷。']};}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function apply(s,e={},rel={}){for(const [k,v] of Object.entries(e))s[k]+=v;for(const k of ['prestige','harmony','clarity'])s[k]=clamp(s[k],0,100);for(const k of ['land','workshop'])s[k]=clamp(s[k],0,8);for(const [i,v] of Object.entries(rel))s.people[i]=clamp(s.people[i]+v,0,100);}
function log(s,t){s.log.unshift(`${s.month}月 · ${t}`);s.log=s.log.slice(0,80);}
function check(s){if(s.cash<0)s.ending='银库告罄';else if(s.harmony<15)s.ending='众心离散';else if(s.prestige<15)s.ending='门望失守';if(s.ending)s.phase='end';}
function act(s,id){const a=actions[id];if(!a||s.phase!=='action'||s.ap<1||s.used.includes(id)||s.cash<a.cost||(id==='land'&&s.land>=8)||(id==='workshop'&&s.workshop>=8))return false;apply(s,a.e,a.rel);if(id==='land')for(let i=1;i<=3;i++)s.contracts.push({due:s.month+i,amount:8,label:'新庄田回款'});s.ap--;s.used.push(id);log(s,a.name+'：'+effect(a.e));return true;}
function pickEvent(s){if(s.month===1)return 'seal';const pool=events.filter(e=>!s.seen.includes(e.id)&&s.month>=e.min&&e.when(s));return (pool[(s.seed+s.month*13)%pool.length]||events.find(e=>e.id==='closing')).id;}
function openEvent(s){if(s.phase!=='action')return false;s.event=pickEvent(s);s.phase='event';return true;}
function choose(s,index){const e=events.find(x=>x.id===s.event),c=e?.choices[index];if(s.phase!=='event'||!c||s.cash+(c.e.cash||0)<0)return false;apply(s,c.e,c.rel);if(c.flag&&!s.flags.includes(c.flag))s.flags.push(c.flag);if(c.debt)for(let i=0;i<(c.debt.repeat||1);i++)s.contracts.push({due:s.month+c.debt.after+i,amount:c.debt.amount,label:c.debt.label});s.seen.push(e.id);log(s,e.title+' · '+c.label);s.last={title:e.title,choice:c.label,effect:effect(c.e),note:c.debt?`${s.month+c.debt.after}月起${c.debt.repeat||1}期：${c.debt.label}，每期${signed(c.debt.amount)}两`:'此事已记入府志'};s.phase='result';check(s);return true;}
function forecast(s){const season=s.month<=3?0:s.month<=6?1:s.month<=9?2:3;const rent=s.land*[9,8,14,7][season];const craft=s.workshop*6;const expense={frugal:22,normal:30,generous:42}[s.allowance];const leak=Math.ceil((100-s.clarity)/12)+(s.harmony<40?6:0);const due=s.contracts.filter(x=>x.due===s.month);return{rent,craft,expense,leak,due,net:rent+craft-expense-leak+due.reduce((a,c)=>a+c.amount,0)};}
function settle(s){if(s.phase!=='result')return false;const f=forecast(s);s.cash+=f.net;s.contracts=s.contracts.filter(x=>x.due>s.month);apply(s,{harmony:s.allowance==='frugal'?-5:s.allowance==='generous'?5:0,prestige:s.allowance==='frugal'?-2:s.allowance==='generous'?2:0,clarity:-3});log(s,`月结：租入${f.rent}、织坊${f.craft}、月例−${f.expense}、漏损−${f.leak}${f.due.length?'、契据'+signed(f.due.reduce((a,c)=>a+c.amount,0)):''}，合计${signed(f.net)}两。`);s.last=f;check(s);if(s.phase==='end')return true;if(s.month===12){s.ending=s.cash>=240&&s.harmony>=65&&s.prestige>=65&&s.clarity>=65?'中馈长明':s.cash>=260?'百业兴府':'门第尚存';s.phase='end';return true;}s.month++;s.ap=2;s.used=[];s.event=null;s.phase='action';return true;}
function allowance(s,id){if(s.phase!=='action'||!['frugal','normal','generous'].includes(id))return false;s.allowance=id;return true;}
const signed=v=>(v>0?'+':'')+v;
function effect(e){return Object.entries(e).map(([k,v])=>(names[k]||k)+' '+signed(v)+(k==='cash'?'两':'')).join(' · ')||'暂无数值变化';}
function valid(s){if(!s||typeof s!=='object'||s.version!==VERSION)return false;const keys=Object.keys(create());if(Object.keys(s).length!==keys.length||Object.keys(s).some(k=>!keys.includes(k)))return false;
if(!Number.isSafeInteger(s.seed)||s.seed<0||s.seed>2147483647||!Number.isInteger(s.month)||s.month<1||s.month>12||!['action','event','result','end'].includes(s.phase)||!Number.isInteger(s.ap)||s.ap<0||s.ap>2)return false;
if(!Number.isInteger(s.cash)||s.cash< -10000||s.cash>100000)return false;for(const k of ['prestige','harmony','clarity','land','workshop'])if(!Number.isInteger(s[k])||s[k]<0||s[k]>(['land','workshop'].includes(k)?8:100))return false;
if(!['frugal','normal','generous'].includes(s.allowance)||!Array.isArray(s.people)||s.people.length!==6||s.people.some(v=>!Number.isInteger(v)||v<0||v>100))return false;
for(const [key,allowed]of [['used',Object.keys(actions)],['seen',events.map(e=>e.id)],['flags',['seed','audit','study','levee','lease','grain']]])if(!Array.isArray(s[key])||s[key].some(v=>!allowed.includes(v))||new Set(s[key]).size!==s[key].length)return false;
if(s.used.length>2||s.ap+s.used.length!==2||!Array.isArray(s.log)||s.log.length>80||s.log.some(x=>typeof x!=='string'||x.length>300))return false;
if(!Array.isArray(s.contracts)||s.contracts.length>40||s.contracts.some(c=>!c||Object.keys(c).sort().join(',')!=='amount,due,label'||!Number.isInteger(c.due)||c.due<s.month||c.due>20||!Number.isInteger(c.amount)||Math.abs(c.amount)>100||typeof c.label!=='string'||c.label.length>40))return false;
if(s.event!==null&&!events.some(e=>e.id===s.event))return false;if(['event','result'].includes(s.phase)&&s.event===null)return false;
const endings=['银库告罄','众心离散','门望失守','中馈长明','百业兴府','门第尚存'];if(s.ending!==null&&!endings.includes(s.ending))return false;if((s.phase==='end')!==(s.ending!==null))return false;
if(s.last!==null&&(typeof s.last!=='object'||JSON.stringify(s.last).length>2000))return false;return true;}
return{VERSION,KEY,people,names,actions,events,create,apply,act,openEvent,choose,forecast,settle,allowance,valid,effect,signed};
})();
if(typeof module!=='undefined')module.exports=Manor;
