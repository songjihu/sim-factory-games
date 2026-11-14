(function(root){
'use strict';
const NAMES=['林舟','阿岚','周老师','许小满','陈阿姨','白川','叶小禾','陆远'];
const TYPES=['背包客','亲子客','摄影客','赶海客'];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const EVENTS=[
 ['初见海风','第一批旅人刚下船。要为他们留一盏灯吗？',1,'always',['热茶迎客',-35,4,0],['照常营业',0,0,0]],
 ['潮湿被褥','海风带来潮气，晾晒要占用一份精力。',2,'always',['彻底晾晒',0,3,-1],['添置除湿包',-65,2,0]],
 ['错峰早餐','亲子客希望早点吃到早餐。',3,'occupied',['提前开灶',-45,4,-1],['送水果篮',-70,3,0]],
 ['摄影来信','白川想拍一组旅舍照片。',4,'always',['借出露台',0,3,-1],['付费约拍',-120,6,0]],
 ['停航通知','风浪使船班减少，明日散客会变少。',5,'always',['开接驳车',-100,4,0],['告知客人耐心等候',0,1,0]],
 ['旧水管','水压不稳，维修师傅来敲门。',6,'always',['整段更换',-140,4,0],['自己临时修补',-35,0,-1]],
 ['捡来的贝壳','叶小禾想做一面贝壳墙。',7,'always',['一起布置',-50,4,-1],['买一幅海景画',-100,3,0]],
 ['安静的夜','早睡客和夜聊客作息冲突。',8,'occupied',['安排安静时段',0,3,-1],['赠送耳塞',-45,2,0]],
 ['小摊邀请','陈阿姨邀你一起参加周末市集。',9,'always',['摆出旅舍摊位',-80,5,-1],['只帮忙转发',0,1,0]],
 ['雨天困客','一场雨打乱了客人的赶海安排。',10,'occupied',['借出桌游和书',-60,4,0],['煮一锅姜茶',-25,2,-1]],
 ['老客留言','林舟寄来一张手写明信片。',11,'rep',['认真回信',0,3,-1],['装裱在前台',-55,3,0]],
 ['海盐堵塞','浴室喷头积起海盐。',12,'always',['集中清理',-30,3,-1],['请人处理',-100,3,0]],
 ['迟到的船','陆远的团队希望延迟入住。',14,'always',['留下热饭',-90,5,-1],['提供自助钥匙',-45,2,0]],
 ['岸边志愿日','码头在清理塑料垃圾。',15,'always',['带客人参加',-40,5,-1],['赞助工具',-110,4,0]],
 ['被遗忘的围巾','一位客人把围巾忘在房间。',16,'always',['寄回并附便条',-30,4,-1],['联系快递上门',-55,3,0]],
 ['亲子手工课','许小满愿意教大家做贝壳风铃。',18,'always',['准备材料',-100,5,0],['帮忙布置',-30,3,-1]],
 ['水电账单','旺季水电开支高于预计。',20,'always',['装节能灯',-140,3,0],['张贴节约提醒',-20,1,-1]],
 ['修船师傅','邻居愿意给旅舍修一张长木桌。',22,'always',['买好木料',-130,5,0],['一起修旧桌',-40,3,-1]],
 ['台风前夜','需要加固窗户和户外物件。',24,'always',['请师傅加固',-160,5,0],['亲自动手',-50,2,-1]],
 ['最后一间','老客临时想来，但客房很紧张。',26,'always',['帮找邻家旅舍',-55,4,0],['推荐下一班日期',0,1,0]],
 ['码头纪念册','阿岚要整理这一季的旅人故事。',28,'rep',['写下小筑故事',0,4,-1],['赞助印刷',-140,5,0]],
 ['夕照音乐会','海边要办一场小型音乐会。',31,'always',['赞助茶点',-160,5,0],['借出座椅',-40,2,-1]],
 ['慢下来的生意','周老师建议你留下长期客的角落。',35,'always',['整理阅读角',-180,6,0],['办一场读书茶会',-60,3,-1]],
 ['开海季留影','大家想在旅舍门前拍张合照。',40,'always',['准备丰盛晚饭',-200,7,0],['一起手写留言',-40,4,-1]]
];
function fresh(mode='balance'){return {schema:1,game:'G215',revision:0,day:1,slot:0,cash:2400,rep:42,energy:4,stock:12,price:150,staff:0,eco:0,ad:0,activity:null,mode,earned:0,spent:0,served:0,groups:0,rooms:Array.from({length:6},(_,i)=>({open:i<3,state:i<3?'ready':'locked',level:0,left:0,wear:0,guest:null})),offers:[],bookings:[],seen:[],pending:null,log:['海风吹进前台，三间旧客房等着开门。'],ended:false,result:null,seed:21501};}
function rand(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function log(s,t){s.log.unshift(t);s.log=s.log.slice(0,30);}
function pay(s,n){s.cash+=n;if(n>0)s.earned+=n;else s.spent-=n;}
function ready(s){return s.rooms.filter(r=>r.open&&r.state==='ready').length;}
function occupancy(s){return s.rooms.filter(r=>r.state==='stay').length;}
function total(s){return s.rooms.filter(r=>r.open).length;}
function reserved(s){return s.bookings.filter(b=>b.day===s.day+1).reduce((n,b)=>n+b.count,0);}
function generate(s){s.offers=[];const count=2+(s.rep>=60?1:0)+(s.ad>0?1:0);for(let i=0;i<count;i++){const type=Math.floor(rand(s)*4),left=1+Math.floor(rand(s)*3);s.offers.push({id:s.day*100+s.slot*10+i,name:NAMES[Math.floor(rand(s)*NAMES.length)],type,stay:left,budget:Math.round((125+type*15+rand(s)*65+s.rep*.35)/5)*5});} if(s.day===1&&s.slot===0)s.offers[0]={id:100,name:'林舟',type:0,stay:1,budget:180};}
function event(s){if(s.pending)return;for(let i=0;i<EVENTS.length;i++){const e=EVENTS[i];if(s.seen.includes(i)||s.day<e[2])continue;if(e[3]==='occupied'&&!occupancy(s))continue;if(e[3]==='rep'&&s.rep<55)continue;s.pending=i;break;}}
function start(mode){const s=fresh(mode);generate(s);event(s);return s;}
function groupOffer(s){return {name:NAMES[(s.day+2)%8]+'的'+['观鸟小队','海岛研学团','摄影采风团','徒步小队'][s.day%4],day:s.day+1,count:2+(s.day%2),rate:130+(s.day%5)*12,bonus:3+(s.day%3)};}
function act(s,a,arg){if(s.ended)return {ok:false,message:'这一季已经结束，请重玩开启新旅程。'};if(s.pending!==null&&a!=='event')return {ok:false,message:'请先处理前台来信。'};let msg='';
 if(a==='event'){const e=EVENTS[s.pending],c=e&&e[4+arg];if(!c)return {ok:false,message:'请选择处理方式'};if(s.energy+c[3]<0)return {ok:false,message:'精力不够，先用另一方案处理'};pay(s,c[1]);s.rep=clamp(s.rep+c[2],0,100);s.energy+=c[3];msg=e[0]+'：'+c[0]+'，口碑 +'+c[2];s.seen.push(s.pending);s.pending=null;}
 else if(a==='price'){s.price=clamp(s.price+arg,90,300);msg='挂牌价调整为 ¥'+s.price+' / 时段';}
 else if(a==='guest'){const g=s.offers[arg];if(!g)return {ok:false,message:'这位旅人已离开'};const r=s.rooms.find(r=>r.open&&r.state==='ready');if(!r)return {ok:false,message:'没有洁净空房，先安排清洁或推进时段'};if(s.stock<1)return {ok:false,message:'布草不足，请去补给'};if(g.budget<s.price){s.offers.splice(arg,1);msg=g.name+'预算 ¥'+g.budget+'，暂时告别了小筑。';}else if(s.slot+g.stay>=3&&reserved(s)>=ready(s)){return {ok:false,message:'明日团房需要预留，这位长住客会占用团房。'};}else {s.stock--;r.state='stay';r.left=g.stay;r.guest=g.name;r.wear++;const gain=s.price+20*r.level;pay(s,gain);s.served++;s.rep=clamp(s.rep+1+(r.level?1:0),0,100);s.offers.splice(arg,1);msg=g.name+'入住，收款 ¥'+gain+'，'+g.stay+' 时段后退房。';}}
 else if(a==='room'){const r=s.rooms[arg];if(!r)return {ok:false,message:'房间不存在'};if(!r.open){const cost=900+total(s)*140;if(s.cash<cost)return {ok:false,message:'扩建需要 ¥'+cost};pay(s,-cost);r.open=true;r.state='ready';msg='新客房竣工，等待第一位旅人。';}else if(r.state==='dirty'||r.state==='repair'){const repair=r.state==='repair';if(s.energy<1)return {ok:false,message:'精力不足，推进时段后恢复'};if(repair&&s.cash<70)return {ok:false,message:'维修需要 ¥70'};s.energy--;if(repair){pay(s,-70);r.wear=0;}r.state='ready';msg=repair?'维修完成，可重新迎客。':'清洁完成，房间恢复可入住。';}else if(r.state==='stay'){return {ok:false,message:r.guest+'还会住 '+r.left+' 时段，入住时已收房款。'};}else{if(r.level>=2)return {ok:false,message:'这间房已升至海景精品级'};const cost=350+r.level*250;if(s.energy<1||s.cash<cost)return {ok:false,message:'升级需 ¥'+cost+' 和 1 精力'};s.energy--;pay(s,-cost);r.level++;msg='房间升级，每次接待额外收入 ¥'+r.level*20+'。';}}
 else if(a==='stock'){if(s.cash<120)return {ok:false,message:'补给需 ¥120'};if(s.stock>50)return {ok:false,message:'布草仓已足够充裕'};pay(s,-120);s.stock+=12;msg='送来 12 份洁净布草。';}
 else if(a==='staff'){const cost=500+s.staff*350;if(s.staff>=3)return {ok:false,message:'服务团队已配齐'};if(s.cash<cost)return {ok:false,message:'招募需 ¥'+cost};pay(s,-cost);s.staff++;s.energy++;msg='伙伴加入，每时段精力 +1，每日工资 +¥65。';}
 else if(a==='eco'){if(s.eco>=3)return {ok:false,message:'节能改造已完成'};if(s.cash<400)return {ok:false,message:'节能改造需 ¥400'};pay(s,-400);s.eco++;msg='节能改造完成，每日固定成本减少 ¥25。';}
 else if(a==='ad'){if(s.cash<160||s.energy<1)return {ok:false,message:'推广需要 ¥160 和 1 精力'};pay(s,-160);s.energy--;s.ad=4;msg='海边小报刊登了小筑消息，接下来4时段多一位旅人。';}
 else if(a==='activity'){if(s.activity)return {ok:false,message:'本时段已有活动安排'};const costs=[90,150,60],reps=[4,6,3];if(!Number.isInteger(arg)||arg<0||arg>2)return {ok:false,message:'活动不存在'};if(s.cash<costs[arg]||s.energy<2)return {ok:false,message:'活动需 ¥'+costs[arg]+' 和 2 精力'};s.energy-=2;pay(s,-costs[arg]);s.rep=clamp(s.rep+reps[arg],0,100);s.activity=arg;const gain=occupancy(s)*[35,50,25][arg];pay(s,gain);msg=['清晨观鸟','码头海鲜宴','潮池导览'][arg]+'完成：口碑 +'+reps[arg]+'，住客体验收入 ¥'+gain+'。';}
 else if(a==='group'){const g=groupOffer(s);if(s.bookings.some(b=>b.day===g.day))return {ok:false,message:'明日团体排期已经确认'};if(total(s)<g.count)return {ok:false,message:'房间总量不够，先扩建'};if(s.rooms.filter(r=>r.open&&(r.state!=='stay'||r.left<=3-s.slot)).length<g.count)return {ok:false,message:'有长住客占用明日库存，暂时不能接团'};s.bookings.push(g);msg='已预订明日清晨 '+g.count+' 间，届时需准备足够洁净空房。';}
 else if(a==='next'){return advance(s);}
 else return {ok:false,message:'未知操作'};
 log(s,msg);return {ok:true,message:msg};
}
function advance(s){s.rooms.forEach(r=>{if(r.state==='stay'&&--r.left<=0){r.state=r.wear>=5?'repair':'dirty';log(s,r.guest+'退房，'+(r.state==='repair'?'需要检修':'等待清洁'));r.guest=null;}});s.slot++;s.activity=null;if(s.ad>0)s.ad--;let msg='新时段开始，服务精力恢复。';
 if(s.slot===3){const cost=180+s.staff*65-s.eco*25;pay(s,-cost);log(s,'第'+s.day+'日结算：运营成本 ¥'+cost);s.day++;s.slot=0;msg='清晨到了，新的旅人正在路上。';}
 s.energy=4+s.staff;
 if(s.day>42||s.cash< -600){s.ended=true;s.result=s.cash< -600?'风浪中的暂停':s.rep>=82&&s.groups>=6?'海湾口碑名宿':s.cash>=15000?'岸边经营家':'有灯等你归来';log(s,'这一季结束：'+s.result);return {ok:true,message:s.result};}
 if(s.slot===0){for(const b of s.bookings.filter(x=>x.day===s.day)){if(ready(s)>=b.count&&s.stock>=b.count){s.rooms.filter(r=>r.open&&r.state==='ready').slice(0,b.count).forEach(r=>{r.state='stay';r.left=2;r.guest=b.name;r.wear++;});s.stock-=b.count;pay(s,b.count*b.rate);s.groups++;s.served+=b.count;s.rep=clamp(s.rep+b.bonus,0,100);log(s,b.name+'入住，团房收入 ¥'+b.count*b.rate);}else{pay(s,-150);s.rep=clamp(s.rep-7,0,100);log(s,'团房未备齐，支付 ¥150 协调费，口碑 -7。');}}s.bookings=s.bookings.filter(b=>b.day>s.day);}
 generate(s);event(s);log(s,msg);return {ok:true,message:msg};
}
function valid(s){return !!s&&s.schema===1&&s.game==='G215'&&Number.isSafeInteger(s.revision)&&s.revision>=0&&Number.isInteger(s.day)&&s.day>=1&&s.day<=43&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=2&&['cash','rep','energy','stock','price','staff','eco','ad','earned','spent','served','groups','seed'].every(k=>Number.isFinite(s[k]))&&s.cash>=-10000&&s.cash<1e9&&s.rep>=0&&s.rep<=100&&s.energy>=0&&s.energy<=10&&s.stock>=0&&s.stock<=100&&s.price>=90&&s.price<=300&&s.staff>=0&&s.staff<=3&&s.eco>=0&&s.eco<=3&&Array.isArray(s.rooms)&&s.rooms.length===6&&s.rooms.every(r=>r&&typeof r.open==='boolean'&&['ready','locked','stay','dirty','repair'].includes(r.state)&&Number.isInteger(r.left)&&r.left>=0&&r.left<=3&&Number.isInteger(r.level)&&r.level>=0&&r.level<=2&&Number.isFinite(r.wear)&&r.wear>=0&&(r.guest===null||typeof r.guest==='string'))&&Array.isArray(s.offers)&&s.offers.length<=5&&s.offers.every(g=>g&&typeof g.name==='string'&&g.name.length<60&&Number.isInteger(g.type)&&g.type>=0&&g.type<4&&Number.isInteger(g.stay)&&g.stay>0&&g.stay<=3&&Number.isFinite(g.budget))&&Array.isArray(s.bookings)&&s.bookings.length<=2&&s.bookings.every(b=>b&&typeof b.name==='string'&&Number.isInteger(b.day)&&b.day>s.day&&b.day<=43&&Number.isInteger(b.count)&&b.count>=2&&b.count<=3&&Number.isFinite(b.rate)&&Number.isFinite(b.bonus))&&Array.isArray(s.seen)&&s.seen.every(n=>Number.isInteger(n)&&n>=0&&n<EVENTS.length)&& (s.pending===null||Number.isInteger(s.pending)&&s.pending>=0&&s.pending<EVENTS.length)&&Array.isArray(s.log)&&s.log.length<=30&&s.log.every(x=>typeof x==='string'&&x.length<300)&&typeof s.ended==='boolean'&&(s.result===null||['风浪中的暂停','海湾口碑名宿','岸边经营家','有灯等你归来'].includes(s.result))&&['balance','warm','profit'].includes(s.mode);}
const API={fresh,start,act,advance,valid,ready,occupancy,total,groupOffer,EVENTS,NAMES,TYPES};if(typeof module!=='undefined')module.exports=API;root.Engine=API;
})(typeof window!=='undefined'?window:globalThis);
