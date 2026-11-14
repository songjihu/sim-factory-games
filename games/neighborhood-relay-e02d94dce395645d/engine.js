(function(root,factory){if(typeof module==='object')module.exports=factory();else root.Relay=factory()})(this,function(){
'use strict';
const VERSION='1.0.0',ID='G219', LIMIT=84;
const places=[{name:'灶火集',x:24,y:25,kind:'餐食',person:'阿棠'},{name:'云台里',x:76,y:24,kind:'文件',person:'周砚'},{name:'榆树院',x:23,y:72,kind:'日用',person:'方婶'},{name:'河灯书屋',x:76,y:73,kind:'书刊',person:'小闻'}];
const people=['阿棠','周砚','方婶','小闻','杜师傅','林遥'];
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
function fresh(seed=Date.now()>>>0){let s={id:ID,version:VERSION,seed:seed>>>0,day:1,shift:0,cash:460,health:92,mood:76,battery:100,rep:50,skill:0,care:0,study:0,total:0,income:0,km:0,gear:{box:0,motor:0,rain:0},relations:[0,0,0,0,0,0],flags:{},seen:[],logs:[],phase:'work',orders:[],pending:null,ending:null,rev:0};s.orders=orders(s);return s}
function weather(s){return ['晴','晴','阵雨','晴','闷热','小雨','大风'][(s.day*3+s.shift)%7]}
function orders(s){return places.map((p,i)=>{let to=(i+1+Math.floor(rng(s)*3))%4;return {id:`${s.day}-${s.shift}-${i}`,from:i,to,pay:20+Math.floor(rng(s)*18)+Math.floor(s.rep/20)+(s.day>28?6:0),deadline:37+Math.floor(rng(s)*24),weight:1+(rng(s)>.72?1:0),client:Math.floor(rng(s)*4)}})}
function preview(s,ids,pace='steady'){
 let selected=ids.map(id=>s.orders.find(o=>o.id===id)).filter(Boolean),pos={x:50,y:50},time=0,km=0,pay=0,late=0,weight=0;
 const speed=pace==='quick'?0.77:pace==='gentle'?1.12:1,wet=/雨/.test(weather(s))?1.19:1;
 let details=selected.map(o=>{let a=places[o.from],b=places[o.to];let dist=(Math.hypot(pos.x-a.x,pos.y-a.y)+Math.hypot(a.x-b.x,a.y-b.y))/18;let mins=Math.ceil((dist*5+5)*speed*wet*(1-s.gear.motor*.07)*(1-Math.min(.15,s.skill*.0015)));time+=mins;km+=dist;pos=b;let delayed=time>o.deadline;if(delayed)late++;pay+=o.pay*(delayed?.65:1);weight+=o.weight;return {...o,arrival:time,late:delayed}});
 return {details,time,km:+km.toFixed(1),pay:Math.round(pay),late,weight,energy:Math.ceil(km*(3-s.gear.motor*.2)),health:Math.ceil(km*(pace==='quick'?2:pace==='gentle'?.7:1.1)),capacity:3+s.gear.box,valid:selected.length>0&&weight<=3+s.gear.box&&time<=100&&s.battery>=Math.ceil(km*(3-s.gear.motor*.2))};
}
const events=[
 ['开门第一盏灯','阿棠的早餐铺正在试营业，她想让你帮忙画一张附近住户的送餐顺序图。',['花半小时陪她理顺', {care:3,rel0:5,mood:3},'从今天起，她会替你留一份热粥。'],['先接楼上的商务单',{cash:28,skill:2},'路线记得更熟了，但小铺只来得及匆匆告别。']],
 ['找不到的门牌','榆树院两栋楼重号，方婶拿来了一张手绘巷道图。',['整理成共享路标',{care:4,rel2:5,skill:2},'共享路标留在了院口。'],['自己记住近路',{skill:5,mood:-2},'你记下了近路，其他新手还得摸索。']],
 ['雨棚下的两个人','小闻抱着怕潮的书稿，你的防水袋只够装一份。',['把袋子借给书稿',{rel3:6,care:3,cash:-10},'小闻把你的名字记在了致谢页。'],['自己买新防水袋',{cash:-24,rel3:3,skill:2},'两份包裹都干燥地到达了。']],
 ['杜师傅的扳手','修车铺打烊前还亮着灯，杜师傅愿意教你看轮胎磨损。',['留下学一会',{study:3,rel4:6,health:-3},'你学会了辨认磨损线。'],['付费做一次检修',{cash:-32,health:5,rel4:2},'车轮转得轻快了一点。']],
 ['电梯停在七楼','周砚的急件还剩十分钟，楼里电梯正在检修。',['联系收件人改到大堂',{rep:3,rel1:4,skill:2},'沟通比盲目赶路更有用。'],['爬楼送到门口',{cash:22,health:-8,rel1:3},'急件准时送到，你在台阶上喘了很久。']],
 ['夜校招生单','林遥在社区贴出夜校通知，课程每周两晚。',['报名路线与调度课',{cash:-60,study:7,rel5:4},'新的可能从一张报名表开始。'],['先替她送招生单',{care:3,rel5:5,cash:12},'你也成了社区的熟面孔。']],
 ['巷口施工','熟悉的桥突然围挡，新来的骑手停在路口发愁。',['带新人一起绕路',{care:4,skill:2,rep:2},'绕路多花了时间，也多了一位伙伴。'],['重新测出最短路径',{skill:6,mood:-2},'你在地图上标出了一条新路线。']],
 ['一份空白便签','书屋有个顾客想给家人送书，却不知道该写什么。',['陪他选一句寄语',{rel3:4,mood:6,care:2},'书里的话比到达时间更长久。'],['推荐门口的明信片',{cash:10,rel3:2},'一张明信片跟着书一起上路。']],
 ['午高峰拼单','两家店在同一条街，阿棠提议建立共享取餐架。',['帮忙搭起取餐架',{cash:-45,care:5,rel0:4,skill:3},'忙乱的取餐口有了固定顺序。'],['先练自己的接单节奏',{skill:6,cash:16},'你找到了一套更稳的工作节奏。']],
 ['脚踝发紧','连续几天上坡，你发现脚踝有些不适。',['暂停半天做恢复',{cash:-25,health:12,mood:4},'休息也是下一次出发的准备。'],['减慢节奏继续安排',{health:-5,cash:30,skill:2},'这笔收入到手了，身体也记下了代价。']],
 ['谁来接最后一单','年轻骑手的孩子放学了，他还差一份包裹。',['帮他完成收尾',{care:5,health:-4,rep:3},'街巷里有人开始主动为你留灯。'],['帮他联系值班同伴',{skill:4,care:2},'一通电话让工作重新排开。']],
 ['社区冰柜','闷热天气里，方婶想在门口放一台共享冷饮柜。',['分担一部分电费',{cash:-55,rel2:6,care:5},'你经过院口时总能喝到凉水。'],['帮忙约维修师傅',{rel2:3,rel4:3,study:2},'一条人脉把旧冰柜修好了。']],
 ['错别字的地址','一个新住户把街名写错了，系统准备算一次失败。',['联系对方确认',{rep:4,skill:3,mood:-2},'包裹交到正确的人手上。'],['请站点协助核对',{study:3,rep:2},'站点更新了地址备注。']],
 ['修车铺的空工位','杜师傅周末有半天空工位，问你要不要练手。',['试着更换旧刹车线',{study:6,rel4:5,cash:-20},'你第一次把自己的车修顺了。'],['帮他整理配件柜',{cash:25,rel4:3,care:2},'零件各有了自己的位置。']],
 ['看不见的楼梯','河边老楼没有无障碍坡道，一位住户总要托人拿物。',['帮她建立固定代收点',{care:6,rel2:3,rep:2},'新的代收点让一层楼都轻松了。'],['这次亲自送上楼',{care:3,health:-4,cash:15},'她给你倒了一杯温水。']],
 ['调度室的邀请','周砚认识的站点需要人试排周末路线。',['拿一晚做排线练习',{study:7,rel1:5,mood:-3},'表格上的城市有了新的层次。'],['继续跑熟悉的街区',{cash:42,skill:4},'你更清楚每条巷子的脾气。']],
 ['家里的一通电话','家人问你最近有没有按时吃饭。',['腾出时间认真聊聊',{mood:10,care:3},'有些路，可以慢一点走。'],['寄去一点生活费',{cash:-80,mood:6,care:4},'你在转账后补了一句：我很好。']],
 ['歪掉的招牌','阿棠的新招牌被风刮斜，店里只有她一个人。',['借工具一起固定',{care:4,rel0:6,health:-3},'以后每次经过，你都会抬头看一眼。'],['请杜师傅过来处理',{cash:-25,rel0:3,rel4:3},'熟人的手艺总让人放心。']],
 ['同伴的坏情绪','一位同伴因差评坐在路边，晚饭还没吃。',['分他一份饭',{cash:-18,mood:4,care:5},'今晚你们都没有独自吃饭。'],['一起复盘订单',{study:4,skill:3},'他找到了一处可以改进的细节。']],
 ['书屋的小展览','小闻想办一场街巷摄影展，缺一位递送邀请的人。',['串起住户与小店',{rel3:7,care:5,mood:3},'照片里的街区忽然有了声音。'],['尝试做路线导览',{skill:4,study:4,rel3:3},'你的路线图成了展览的一部分。']],
 ['旧电池回收日','维修铺在收旧电池，杜师傅喊你来帮忙登记。',['学习电池养护',{study:5,rel4:4,battery:20},'下一次补能更有数了。'],['帮忙通知整条街',{care:5,rep:3},'街区少了几块被遗忘的旧电池。']],
 ['一碗迟到的汤','阿棠试做了一份新汤，请你给一点真实评价。',['认真提出修改建议',{rel0:5,study:2,mood:4},'她把你的建议写在灶台旁。'],['帮她做午间试送',{cash:30,skill:3,rel0:3},'第一批新汤送进了写字楼。']],
 ['夜校的结课作业','林遥要求每人交一份真实街区改善提案。',['设计共享接驳点',{study:8,care:4,rel5:5},'你的提案开始有落地的模样。'],['整理个人职业履历',{study:5,rep:4,rel5:3},'你第一次认真写下自己学会了什么。']],
 ['中途的一次停留','河灯亮起时，街上难得安静。你想起很久没给自己留空。',['沿河散步',{mood:12,health:4},'你记住了今晚河面的颜色。'],['把这一段路画进日记',{mood:6,study:3,rel3:2},'地图上多了一条不为赶时间的线。']],
 ['取餐架的后续','共享取餐架使用频繁，大家想给它加一块清楚的值班牌。',['发起轮值约定',{care:7,rel0:4,rel1:3},'一个人的帮忙变成了整条街的习惯。'],['制作一张交接表',{study:6,skill:3},'每一份餐都有了可追溯的位置。']],
 ['书稿的回信','小闻带来新印好的书，扉页留着给你的短短一行字。',['送一本给夜校',{cash:-25,rel3:5,rel5:5,care:4},'故事走到了另一个灯光下。'],['留给自己作纪念',{mood:10,rel3:4},'这座城市第一次在书里记住你。']],
 ['有人愿意合伙','几位街坊聊起开一个社区接驳小站。你会选择哪种投入？',['先调查居民需要',{care:7,study:5,cash:-40},'一张清单让愿望变得具体。'],['先积累启动储备',{cash:65,skill:4},'你决定用更稳的积蓄承接未来。']],
 ['最后一页之前','这个季度快结束了，林遥问：接下来，你最想守住什么？',['守住人与街区',{care:6,mood:6,rel5:3},'答案留在每一次相遇中。'],['守住新的职业可能',{study:7,skill:3,rel5:4},'下一张时间表已经等着你。']]
].map((v,i)=>({id:i,title:v[0],text:v[1],choices:v.slice(2)}));
function apply(s,e){for(let [k,v]of Object.entries(e)){if(k.startsWith('rel'))s.relations[+k.slice(3)]=clamp(s.relations[+k.slice(3)]+v);else s[k]=(s[k]||0)+v}for(let k of ['health','mood','battery','rep'])s[k]=clamp(s[k]);s.cash=Math.round(s.cash)}
function log(s,t){s.logs.unshift(`第${s.day}天 · ${t}`);s.logs=s.logs.slice(0,100)}
function end(s,id){s.phase='end';s.ending=id;return s}
function check(s){if(s.health<=0)return end(s,'rest');if(s.cash < -400)return end(s,'restart');if(s.rep<=0)return end(s,'reset');return s}
function finishShift(s){s.shift++;if(s.shift>=3){s.phase='night';s.pending=null;let idx=Math.floor((s.day-1)/3);if(s.day%3===1&&idx<events.length&&!s.seen.includes(idx)){s.pending=idx;s.phase='event'}}else s.orders=orders(s);return check(s)}
function deliver(s,ids,pace){if(s.phase!=='work')throw Error('现在不能出发');if(!['steady','quick','gentle'].includes(pace))throw Error('节奏无效');if(new Set(ids).size!==ids.length||ids.some(id=>!s.orders.some(o=>o.id===id)))throw Error('委托已变化');let p=preview(s,ids,pace);if(!p.valid)throw Error('路线超时、载重超限或电量不足');if(s.health<12)throw Error('身体需要休息，先暂停这一班');apply(s,{cash:p.pay,battery:-p.energy,health:-p.health,mood:p.late?-3:1,rep:p.late?-p.late*2:1,skill:ids.length});if(pace==='quick'&&rng(s)<.18&&!s.gear.rain){apply(s,{health:-7,cash:-15});log(s,'快节奏增加磨损，换件支出15元。')}p.details.forEach(o=>s.relations[o.client]=clamp(s.relations[o.client]+1));s.total+=ids.length;s.income+=p.pay;s.km=+(s.km+p.km).toFixed(1);s.last={...p,rest:false};log(s,`完成${ids.length}份委托，收入¥${p.pay}，${p.late}份迟到。`);finishShift(s);return p}
function rest(s){if(s.phase!=='work')throw Error('当前不是工作班次');apply(s,{health:7,battery:35,mood:5,cash:-8});s.last={rest:true,pay:-8};log(s,'在补给亭休息，补电和热饮支出8元。');return finishShift(s)}
function event(s){let e=events[s.pending];if(!e)return null;if(e.id===24&&s.flags.event8!==0)return {...e,title:'还没搭起的取餐架',text:'当初没来得及做的共享架，今天阿棠又提了起来。街坊愿意一起分担。',choices:[['这次一起搭起来',{cash:-45,care:7,rel0:5},'迟一点的开始，也是一种开始。'],['先把交接流程写清楚',{study:6,skill:3},'共享架还没搭起，交接表先传开了。']]};if(e.id===25&&s.flags.event2!==0)return {...e,title:'雨天之后的书',text:'那天你为书稿买的防水袋，小闻一直记着。他送来一本新书。',choices:[['把书转赠夜校',{rel3:5,rel5:5,care:4},'一份心意又走了一站。'],['留在床头慢慢读',{mood:10,rel3:4},'书页里有这座城的温度。']]};return e}
function choose(s,n){if(s.phase!=='event')throw Error('没有待处理事件');let ev=event(s),c=ev.choices[n];if(!c)throw Error('无效选项');apply(s,c[1]);s.seen.push(ev.id);s.flags['event'+ev.id]=n;log(s,c[2]);s.pending=null;s.phase='night';return check(s)}
const activities=[{name:'做饭早睡',desc:'¥18 · 身体+18 心情+6',effect:{cash:-18,health:18,mood:6}},{name:'夜校进修',desc:'¥35 · 学习+4 身体+7',effect:{cash:-35,study:4,health:7,rel5:2}},{name:'街坊轮值',desc:'¥12 · 互助+4 身体+9',effect:{cash:-12,care:4,health:9,rel2:2}},{name:'河边散步',desc:'¥8 · 心情+14 身体+12',effect:{cash:-8,mood:14,health:12,rel3:1}}];
function nextDay(s,n){if(s.phase!=='night')throw Error('先完成今天的工作和事件');if(!activities[n])throw Error('请选择晚间安排');apply(s,activities[n].effect);let bill=28+(s.day%7===0?140:0);apply(s,{cash:-bill,battery:100,health:4});log(s,`${activities[n].name}；生活支出¥${bill}。`);check(s);if(s.phase==='end')return s;if(s.day>=LIMIT)return end(s,ending(s));s.day++;s.shift=0;s.phase='work';s.orders=orders(s);return s}
const gears={box:{name:'扩容配送箱',base:220,desc:'载重上限+1'},motor:{name:'传动调校',base:320,desc:'路线耗时-7%，每公里耗电减少'},rain:{name:'全天候护具',base:190,desc:'消除快节奏额外磨损'}};
function buy(s,k){if(s.phase==='end')throw Error('本季已结束');let g=gears[k];if(!g||s.gear[k]>=2||(k==='rain'&&s.gear[k]>=1))throw Error('已达到上限');let cost=g.base*(s.gear[k]+1);if(s.cash<cost)throw Error('储备不足');s.cash-=cost;s.gear[k]++;s.relations[4]=clamp(s.relations[4]+4);log(s,`升级${g.name}，花费¥${cost}。`)}
const endings={hub:['把灯留在街口','你和街坊一起办起了接驳小站。路线终于不再只是一个人的事情。'],planner:['下一班调度员','你把跑过的路写进调度表，站在了新的职业起点。'],craft:['轮子与扳手','修车铺的一张工位留给了你。曾经的故障变成了另一门手艺。'],savings:['把日子握稳','储备让你有了从容选择下一站的底气，新的生活由你安排。'],neighbor:['街区的熟面孔','比起订单数字，大家记住了你的名字。这座城有你的一盏灯。'],balance:['留给自己的河灯','你没有把每一分钟都卖给工作。健康、朋友与收入组成了自己的生活。'],road:['还在路上','这个季度并不完美，但你已经学会辨认自己的方向。下一程仍有余地。'],rest:['先把自己接回家','身体发出了不能再忽略的信号。休息之后，再决定下一程。'],restart:['换一种重新出发','储备跌破了周转线。你暂停接单，重新整理生活预算。'],reset:['重新建立信任','连续的延误耗尽了站点信任。先暂停，学会安排力所能及的路线。']};
function ending(s){if(s.care>=65&&s.cash>=6500)return 'hub';if(s.study>=75&&s.rep>=60)return 'planner';if(s.study>=40&&s.relations[4]>=35)return 'craft';if(s.cash>=10000)return 'savings';if(s.care>=65)return 'neighbor';if(s.health>=60&&s.mood>=65)return 'balance';return 'road'}
function retire(s){if(s.phase!=='night'||s.day<28)throw Error('第28天起，可在晚间决定下一站');return end(s,ending(s))}
function valid(s){if(!s||s.id!==ID||s.version!==VERSION)throw Error('不是本游戏当前版本的存档');for(let k of ['seed','day','shift','cash','health','mood','battery','rep','skill','care','study','total','income','km','rev'])if(!Number.isFinite(s[k]))throw Error('存档数值损坏');if(s.day<1||s.day>LIMIT||!Number.isInteger(s.day)||!Number.isInteger(s.shift)||s.shift<0||s.shift>3||s.cash< -1000||s.cash>1e8||s.rev<0)throw Error('存档范围无效');for(let k of ['health','mood','battery','rep'])if(s[k]<0||s[k]>100)throw Error('状态范围无效');for(let k of ['skill','care','study','total','income','km'])if(s[k]<0||s[k]>1e7)throw Error('成长数值无效');if(!s.gear||!Object.keys(gears).every(k=>Number.isInteger(s.gear[k])&&s.gear[k]>=0&&s.gear[k]<=(k==='rain'?1:2)))throw Error('装备损坏');if(!Array.isArray(s.relations)||s.relations.length!==6||s.relations.some(n=>!Number.isFinite(n)||n<0||n>100))throw Error('人物关系损坏');if(!Array.isArray(s.seen)||s.seen.some(n=>!Number.isInteger(n)||n<0||n>=events.length)||!Array.isArray(s.logs)||s.logs.length>100||s.logs.some(t=>typeof t!=='string'||t.length>500)||!s.flags||typeof s.flags!=='object')throw Error('日志损坏');if(!['work','event','night','end'].includes(s.phase))throw Error('阶段损坏');if(s.phase==='work'&&s.shift>=3||s.phase==='event'&&(!Number.isInteger(s.pending)||!events[s.pending])||s.phase==='end'&&!endings[s.ending])throw Error('进程损坏');if(!Array.isArray(s.orders)||s.orders.length!==4||s.orders.some(o=>!o||typeof o.id!=='string'||!Number.isInteger(o.from)||o.from<0||o.from>3||!Number.isInteger(o.to)||o.to<0||o.to>3||o.from===o.to||!Number.isInteger(o.client)||o.client<0||o.client>3||!Number.isFinite(o.pay)||o.pay<0||o.pay>100||!Number.isInteger(o.weight)||o.weight<1||o.weight>2||!Number.isFinite(o.deadline)||o.deadline<1||o.deadline>100))throw Error('委托损坏');return s}
return {VERSION,ID,LIMIT,places,people,events,event,activities,gears,endings,fresh,preview,deliver,rest,choose,nextDay,buy,retire,ending,valid,weather};
});
