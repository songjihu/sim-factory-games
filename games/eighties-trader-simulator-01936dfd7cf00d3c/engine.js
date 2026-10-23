(function(root){'use strict';
const GOODS=[['花布',16,2],['搪瓷',12,3],['橘子',7,1],['手表',55,1]],PLACES=['河口镇','省城站','山城集'];
const PEOPLE=[['陈嫂','花布摊主'],['老周','搪瓷批发'],['阿青','果园联络'],['许师傅','车站托运'],['小林','百货采购'],['阿慧','家中记账']];
const EVENTS=[
['雨棚漏水','陈嫂提醒花布怕湿。',s=>s.inv[0]>0,[['买油布',{cash:-12,rep:2}],['挪到走廊',{energy:-8}]]],
['喜事将近','小林替婚庆队问花布货源。',s=>s.day>=2,[['先送样布',{cash:-8,rep:4,order:0}],['只报现价',{cash:6}]]],
['果园早熟','阿青急着找人接一批果子。',s=>s.day>=2,[['付订金，隔日取款',{cash:-20,delay:38}],['带回两筐尝鲜',{add:2,qty:2}]]],
['托运新规','许师傅要求易碎品垫好。',s=>s.inv[1]>0,[['加固木箱',{cash:-10,rep:2}],['亲自搬运',{energy:-10}]]],
['母亲来信','家里想添一床棉被。',s=>s.day>=3,[['寄回十五元',{cash:-15,family:10}],['写信报平安',{family:2}]]],
['庙会消息','山城集下周有大集。',s=>s.day>=3,[['买一份摊位册',{cash:-6,rep:3}],['自己去打听',{energy:-6,rep:1}]]],
['旧货争议','买家发现手表走时不稳。',s=>s.inv[3]>0,[['出钱检修',{cash:-14,rep:5}],['收回样品',{remove:3,qty:1,rep:1}]]],
['同行搭车','老周想和你合租车厢。',s=>s.day>=4,[['分担车费',{cash:-8,energy:12}],['各走各路',{energy:3}]]],
['邻摊借钱','陈嫂临时差一笔进货钱。',s=>s.cash>=30,[['借二十，三日后回款',{cash:-20,delay:25,rep:3}],['帮忙守摊',{energy:-5,rep:2}]]],
['车站夜风','长椅上过夜省钱却熬人。',s=>s.energy<65,[['住招待所',{cash:-12,energy:20}],['买碗热面',{cash:-4,energy:8}]]],
['赊账请求','熟客希望先拿货后付款。',s=>s.rep>=12,[['收订金再供货',{cash:12,rep:2}],['坚持现结',{rep:-1,cash:5}]]],
['包装回收','旧木箱还能换几个零钱。',s=>s.day>=5,[['整理卖出',{cash:9,energy:-3}],['留给下批货',{rep:2}]]],
['同行压价','隔壁摊突然清仓。',s=>s.day>=6,[['做售后口碑',{cash:-6,rep:5}],['暂避锋芒',{energy:6}]]],
['家中修屋','阿慧说屋瓦需要修补。',s=>s.day>=6,[['寄回二十元',{cash:-20,family:12}],['约好月底再修',{family:-3,cash:2}]]],
['采购员来访','小林在找稳定供应者。',s=>s.rep>=18,[['接下搪瓷单',{order:1,rep:2}],['先做小批生意',{cash:10}]]],
['小巷捷径','搬运工说近路能省脚力。',s=>s.day>=7,[['请人带路',{cash:-5,energy:12}],['沿大路走',{energy:-3,rep:1}]]],
['果筐回潮','阿青教你挑掉熟透的果子。',s=>s.inv[2]>=2,[['挑一筐送邻摊',{remove:2,qty:1,rep:4}],['付钱加快售出',{cash:-5,rep:2}]]],
['诚实秤砣','陈嫂请你帮忙校秤。',s=>s.day>=8,[['花半天帮忙',{energy:-8,rep:5}],['借她工具',{rep:2}]]],
['远方订单','山城商店想要花布。',s=>s.day>=9,[['登记三匹订单',{order:0}],['给出进货建议',{rep:3}]]],
['车票余量','许师傅留了一个座位。',s=>s.energy<60,[['付八元坐车',{cash:-8,energy:16}],['留给老人',{rep:4,energy:-3}]]],
['年节汇款','阿慧等着这笔家用。',s=>s.day>=10,[['多寄三十元',{cash:-30,family:18}],['先寄十元',{cash:-10,family:5}]]],
['铺面邀约','老周愿意给你留个柜台。',s=>s.rep>=24,[['交定金',{cash:-25,rep:10}],['继续流动经营',{cash:8,energy:5}]]],
['旧客回头','之前的熟客又来挑货。',s=>s.day>=12,[['送些包装袋',{cash:-4,rep:4}],['现钱结小单',{cash:14}]]],
['月底盘账','阿慧提醒货压在手里不算家用。',s=>s.day>=14,[['寄回二十',{cash:-20,family:10}],['再留一轮本钱',{energy:5}]]]
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function fresh(){return {schema:1,id:'G108',rev:0,day:1,place:0,cash:180,energy:85,family:40,rep:8,inv:[0,0,0,0],seen:[],pending:[],order:null,phase:'trade',event:null,ending:'',log:['一辆单车、一百八十元，十六天后带着家用回家。'],moves:0};}
function price(s,i){return Math.max(2,Math.round(GOODS[i][1]*[[.78,1.22,1.05,1.16],[1.20,.74,1.32,.82],[1.28,1.1,.70,1.3]][s.place][i]*(1+(((s.day*7+i*3)%7)-3)*.06)));}
function load(s){return s.inv.reduce((a,n,i)=>a+n*GOODS[i][2],0)}
function can(s,d){return ['cash','energy','family','rep'].every(k=>s[k]+(d[k]||0)>=0)&&(!(d.remove!==undefined)||s.inv[d.remove]>=d.qty)}
function change(s,d){for(const k of ['cash','energy','family','rep'])s[k]=clamp(s[k]+(d[k]||0),0,k==='cash'?99999:100);if(d.add!==undefined&&load(s)+d.qty*GOODS[d.add][2]<=24)s.inv[d.add]+=d.qty;if(d.remove!==undefined)s.inv[d.remove]-=d.qty;if(d.delay)s.pending.push({day:s.day+2,cash:d.delay});if(d.order!==undefined)s.order={good:d.order,qty:3,due:s.day+3,reward:GOODS[d.order][1]*5};}
function trade(s,i,n){if(s.phase!=='trade')return '先处理今日见闻';if(!Number.isInteger(i)||i<0||i>3||![1,-1].includes(n))return '无效买卖';let p=price(s,i);if(n===1){if(s.cash<p)return '本钱不足';if(load(s)+GOODS[i][2]>24)return '货架已满，先出货';s.cash-=p;s.inv[i]++}else{if(!s.inv[i])return '手中没有这类货';s.cash+=Math.floor(p*.9);s.inv[i]--}s.log.unshift(`${GOODS[i][0]}${n===1?'进货':'出货'}一件，${n===1?'-':'+'}${n===1?p:Math.floor(p*.9)}元。`);return '';}
function end(s){if(s.energy<=0){s.phase='end';s.ending='半途歇脚'}else if(s.cash<=0&&load(s)===0){s.phase='end';s.ending='本钱见底'}else if(s.day>16){s.phase='end';s.ending=s.cash>=400&&s.family>=45&&s.rep>=20?'货通南北':s.cash>=180&&s.family>=25?'小栈有成':'平安归家'}if(s.phase==='end')s.event=null;}
function next(s){s.day++;s.phase='trade';s.event=null;s.moves=0;end(s)}
function travel(s,to,mode){if(s.phase!=='trade')return '先处理见闻';if(!Number.isInteger(to)||to<0||to>2||to===s.place)return '请选择另一座市场';if(!['bike','bus'].includes(mode))return '无效运输';const fee=mode==='bus'?16:3;if(s.cash<fee)return '路费不足';s.cash-=fee;s.energy=clamp(s.energy-(mode==='bus'?7:18),0,100);const lost=mode==='bike'&&s.day%3===0?Math.min(1,s.inv[1]):0;s.inv[1]-=lost;const rot=Math.min(s.inv[2],mode==='bus'?0:1);s.inv[2]-=rot;s.place=to;s.family=Math.max(0,s.family-2);s.log.unshift(`第${s.day}日抵达${PLACES[to]}：路费${fee}，体力-${mode==='bus'?7:18}，橘子损耗${rot}，搪瓷破损${lost}。`);for(const p of s.pending.filter(p=>p.day<=s.day)) {s.cash+=p.cash;s.log.unshift(`旧款到账${p.cash}元。`)}s.pending=s.pending.filter(p=>p.day>s.day);if(s.order&&s.day>s.order.due){s.rep=Math.max(0,s.rep-4);s.log.unshift('订单逾期，信用-4。');s.order=null;}end(s);if(s.phase==='end')return '';const e=EVENTS.findIndex((e,i)=>!s.seen.includes(i)&&e[2](s)&&e[3].some(c=>can(s,c[1])));if(e>=0){s.phase='event';s.event=e}else next(s);return '';}
function choose(s,i){if(s.phase!=='event')return '当前没有见闻';const e=EVENTS[s.event],c=e[3][i];if(!c||!can(s,c[1]))return '资源不足';change(s,c[1]);s.log.unshift(e[0]+'：'+c[0]);s.seen.push(s.event);next(s);return '';}
function act(s,a){if(s.phase!=='trade')return '请先处理见闻';if(a==='rest'){if(s.moves>=1)return '今天已安排休整或汇款';if(s.cash<10)return '休整需要十元';s.cash-=10;s.energy=clamp(s.energy+28,0,100);s.moves++;s.log.unshift('住店休整：钱-10，体力+28。');return ''}if(a==='remit'){if(s.moves>=1)return '今天已安排休整或汇款';if(s.cash<20)return '汇款需要二十元';s.cash-=20;s.family=clamp(s.family+14,0,100);s.moves++;s.log.unshift('汇给家里二十元，家计+14。');return ''}if(a==='order'){if(!s.order)return '暂时没有订单';if(s.inv[s.order.good]<3)return '需要同类货三件';s.inv[s.order.good]-=3;s.cash+=s.order.reward;s.rep=clamp(s.rep+5,0,100);s.log.unshift('按时交单，收到'+s.order.reward+'元，信用+5。');s.order=null;return ''}return '无效操作';}
function valid(s){return !!s&&s.id==='G108'&&s.schema===1&&Number.isSafeInteger(s.rev)&&s.rev>=0&&Number.isInteger(s.day)&&s.day>=1&&s.day<=17&&Number.isInteger(s.place)&&s.place>=0&&s.place<=2&&['cash','energy','family','rep'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<=(k==='cash'?99999:100))&&Array.isArray(s.inv)&&s.inv.length===4&&s.inv.every(n=>Number.isInteger(n)&&n>=0&&n<=24)&&load(s)<=24&&['trade','event','end'].includes(s.phase)&&((s.phase==='event'&&Number.isInteger(s.event)&&s.event>=0&&s.event<24)||(s.phase!=='event'&&s.event===null))&&Array.isArray(s.seen)&&s.seen.length<=24&&new Set(s.seen).size===s.seen.length&&s.seen.every(n=>Number.isInteger(n)&&n>=0&&n<24)&&Array.isArray(s.pending)&&s.pending.length<=24&&s.pending.every(p=>Number.isInteger(p.day)&&p.day>=1&&p.day<=19&&Number.isInteger(p.cash)&&p.cash>=0&&p.cash<=100)&&(!s.order||(Number.isInteger(s.order.good)&&s.order.good>=0&&s.order.good<=3&&s.order.qty===3&&Number.isInteger(s.order.due)&&s.order.due>=1&&s.order.due<=19&&s.order.reward===GOODS[s.order.good][1]*5))&&Array.isArray(s.log)&&s.log.length<=5000&&s.log.every(t=>typeof t==='string'&&t.length<500)&&[0,1].includes(s.moves)&&['','货通南北','小栈有成','平安归家','半途歇脚','本钱见底'].includes(s.ending)&&(s.phase!=='end'||s.ending!=='');}
const api={GOODS,PLACES,PEOPLE,EVENTS,fresh,price,load,can,trade,travel,choose,act,valid};if(typeof module!=='undefined')module.exports=api;root.Trader=api;})(typeof window!=='undefined'?window:globalThis);
