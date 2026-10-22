(function(root){'use strict';
const GOODS=[{name:'野菜',weight:1,price:2,food:2},{name:'菌子',weight:1,price:5,food:1},{name:'板栗',weight:2,price:7,food:4}];
const PEOPLE=[['阿禾','家里的账本，记着每一顿热饭。'],['小满','等你带回山栗，也盼着新学期。'],['林伯','识山路，愿意把经验传下去。'],['许婶','集市收货，雨天菌价更高。'],['周木匠','补背篓，也修山路的木桥。'],['巡山员小岑','护住幼苗，来年山里才有收成。']];
// All events have explicit eligibility and two different consequences.
const EVENTS=[
 ['雨后菌窝','雨水让菌子冒了头，但土坡湿滑。',s=>s.weather===1,[['绕路稳采：菌子+2，时辰-1',{bag:[0,2,0],time:-1}],['见好就收：体力+1',{stamina:1}]]],
 ['桥边的林伯','林伯背着工具，要去补一段护栏。',s=>s.day<=4,[['帮他搭把手：时辰-1，经验+2，人情+1',{time:-1,xp:2,trust:1}],['借道赶路：时辰+1',{time:1}]]],
 ['一片幼苗','路边的野菜刚刚抽芽。',s=>s.eco<7,[['留下这一片：生态+2，人情+1',{eco:2,trust:1}],['只采成熟叶：野菜+1，体力-1',{bag:[1,0,0],stamina:-1}]]],
 ['布袋漏了','小布袋磨出了一个洞。',s=>s.bag[0]>0,[['腾手缝好：时辰-1，经验+1',{time:-1,xp:1}],['分给路人：野菜-1，人情+2',{bag:[-1,0,0],trust:2}]]],
 ['栗树下的约定','许婶想订两份板栗，今天带回就能成交。',s=>s.bag[2]>=2,[['答应：板栗-2，现金+19',{bag:[0,0,-2],cash:19}],['留给家里：人情+1',{trust:1}]]],
 ['山雾渐浓','岔路口开始看不清脚印。',s=>s.depth>0,[['停下来认路：时辰-1，经验+2',{time:-1,xp:2}],['跟着旧标记：体力-2，时辰+1',{stamina:-2,time:1}]]],
 ['借一口水','运柴人想借你的水壶。',s=>s.stamina>=3,[['分半壶：体力-1，人情+2',{stamina:-1,trust:2}],['一起歇脚：时辰-1，体力+2',{time:-1,stamina:2}]]],
 ['被雨打湿的菌子','背篓里的菌子需要尽快处理。',s=>s.bag[1]>0&&s.weather===1,[['垫上干叶：时辰-1，经验+1',{time:-1,xp:1}],['挑掉一份：菌子-1，体力+1',{bag:[0,-1,0],stamina:1}]]],
 ['旧背篓','林伯有一只闲置背篓，愿意换些口粮。',s=>s.level===0&&s.food>=5,[['换背篓：口粮-4，容量+4',{food:-4,level:1}],['先修旧篓：经验+1',{xp:1}]]],
 ['巡山提醒','小岑提醒：这片林子要轮采。',s=>s.eco<=5,[['记下轮采点：生态+2，经验+1',{eco:2,xp:1}],['绕到远坡：体力-2，板栗+1',{stamina:-2,bag:[0,0,1]}]]],
 ['山脚卖茶','路口有一壶热茶，香气很暖。',s=>s.cash>=3,[['买茶歇脚：现金-3，体力+3',{cash:-3,stamina:3}],['问路：经验+1',{xp:1}]]],
 ['小满的画','出门前，小满把一家人的画塞进篓底。',s=>s.day>=3,[['小心收好：人情+1',{trust:1}],['给同行人看看：时辰-1，人情+2',{time:-1,trust:2}]]],
 ['山泉边的落果','山泉冲来几颗完好的栗子。',s=>s.depth===1,[['捡起晾干：板栗+1，时辰-1',{bag:[0,0,1],time:-1}],['先喝水：体力+2',{stamina:2}]]],
 ['泥路上的脚印','熟悉的脚印拐向一处新采点。',s=>s.xp>=3,[['谨慎探看：体力-2，菌子+2',{stamina:-2,bag:[0,2,0]}],['记下位置：经验+2',{xp:2}]]],
 ['路遇木匠','周木匠背着绳索，准备加固山桥。',s=>s.trust>=2,[['帮忙搬料：体力-2，人情+2',{stamina:-2,trust:2}],['用山货换绳：野菜-1，经验+2',{bag:[-1,0,0],xp:2}]]],
 ['收货人加价','许婶临时缺一批菌子。',s=>s.bag[1]>=2,[['当场成交：菌子-2，现金+13',{bag:[0,-2,0],cash:13}],['先留着：人情+1',{trust:1}]]],
 ['护林小牌','一块倒下的轮采标牌挡在路旁。',s=>s.day>=5,[['重新立起：时辰-1，生态+2',{time:-1,eco:2}],['记录位置：经验+1',{xp:1}]]],
 ['野菜老了','叶片发硬，卖相也不太好。',s=>s.bag[0]>=2,[['挑拣嫩叶：野菜-1，经验+2',{bag:[-1,0,0],xp:2}],['留作自家口粮：体力-1，口粮+1',{stamina:-1,food:1}]]],
 ['山路新岔口','一条窄路绕过了陡坡。',s=>s.depth>=1&&s.xp>=6,[['试着走：体力-1，时辰+2',{stamina:-1,time:2}],['做个路标：时辰-1，人情+2',{time:-1,trust:2}]]],
 ['秋风落栗','一阵风摇下了树上的熟栗。',s=>s.day>=6&&s.weather!==1,[['收拾落栗：板栗+2，体力-2',{bag:[0,0,2],stamina:-2}],['给后来人留些：生态+1，人情+1',{eco:1,trust:1}]]],
 ['同路的采山人','邻居想和你一起下山。',s=>s.trust>=4,[['分担背篓：时辰+1，体力+1',{time:1,stamina:1}],['交换经验：经验+2',{xp:2}]]],
 ['天晴的晾晒地','树隙里有一小块阳光。',s=>s.dryer&&s.bag[1]>0,[['练习晒菌：时辰-1，经验+2',{time:-1,xp:2}],['稍作休息：体力+1',{stamina:1}]]],
 ['林伯带徒','林伯说，下次可以带你认远坡。',s=>s.xp>=10,[['换一堂课：口粮-2，经验+4',{food:-2,xp:4}],['一起护林：生态+2，人情+1',{eco:2,trust:1}]]],
 ['最后一趟的心愿','阿禾说：家里有粮，比篓子装满更要紧。',s=>s.day>=10,[['留些力气：体力+2',{stamina:2}],['替家人采一把：野菜+2，体力-1',{bag:[2,0,0],stamina:-1}]]]
].map((x,i)=>({id:i,title:x[0],text:x[1],when:x[2],choices:x[3]}));
function fresh(mode='steady'){return {v:1,rev:0,day:1,phase:'home',food:8,cash:12,health:6,trust:0,xp:0,eco:6,level:0,dryer:false,depth:0,time:8,stamina:10,bag:[0,0,0],weather:0,steps:0,hunger:0,seen:[],event:null,log:['阿禾：撑过十二天秋收，给家里攒下过冬粮。'],ending:null,mode,seed:mode==='steady'?517:931};}
function rng(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function weight(s){return s.bag.reduce((n,v,i)=>n+v*GOODS[i].weight,0)}function cap(s){return 8+s.level*4}function back(s){return s.depth+1+(s.weather===1?1:0)}
function log(s,t){s.log.unshift(t);s.log=s.log.slice(0,40)}function clamp(s){for(const k of ['food','cash','xp','trust'])s[k]=Math.max(0,Math.min(999,s[k]));s.health=Math.max(0,Math.min(6,s.health));s.eco=Math.max(0,Math.min(10,s.eco));s.stamina=Math.max(0,Math.min(10,s.stamina));s.time=Math.max(0,Math.min(10,s.time));}
function effect(s,e){for(const [k,v]of Object.entries(e)){if(k==='bag'){v.forEach((n,i)=>s.bag[i]=Math.max(0,s.bag[i]+n))}else s[k]+=v}clamp(s);while(weight(s)>cap(s)){let i=s.bag.findIndex(n=>n>0);s.bag[i]--;log(s,'背篓超重，留下一份山货。')}}
function possible(s,e){return Object.entries(e).every(([k,v])=>k==='bag'?v.every((n,i)=>s.bag[i]+n>=0):!(v<0&&['cash','food','time','stamina'].includes(k)&&s[k]+v<0))}
function event(s){if(s.steps%2!==0||s.event!==null)return;const pool=EVENTS.filter(e=>!s.seen.includes(e.id)&&e.when(s));if(pool.length){const e=pool[Math.floor(rng(s)*pool.length)];s.event=e.id;s.seen.push(e.id)}}
function end(s){if(s.health<=0||s.hunger>=2){s.phase='end';s.ending='熬不过的秋寒';return}if(s.day>12){s.phase='end';s.ending=s.food>=24&&s.cash>=30&&s.eco>=5?'仓满人和':s.food>=8?'灶火未熄':'借粮过冬';}}
function act(s,a){if(s.phase==='end')return '这一局已结束';if(s.event!==null)return '请先处理山路事件';let msg='';
if(a==='depart'&&s.phase==='home'){s.phase='mountain';s.time=8;s.stamina=10;s.depth=0;s.steps=0;s.bag=[0,0,0];s.weather=(s.day*7+s.seed)%3;log(s,'上山了。留够时辰和体力，才能把山货带回家。');return '';}
if(s.phase==='mountain'){
 if(a==='return'){const need=back(s),late=Math.max(0,need-s.time,need-s.stamina);s.health-=late>0?1:0;if(late){s.bag=s.bag.map(n=>Math.floor(n*.5));log(s,'摸黑下山，摔伤损失健康1，山货损失一半。')}s.time=Math.max(0,s.time-need);s.stamina=Math.max(0,s.stamina-need);s.phase='market';s.event=null;log(s,'已到山脚集市。卖钱、留粮、晒干，各有用处。');clamp(s);end(s);return '';}
 if(a==='deeper'){if(s.depth>=2)return '已到最深采点';if(s.time<2||s.stamina<2)return '时辰或体力不足';if(s.depth===1&&s.xp<6)return '远坡需要经验6';s.depth++;s.time-=2;s.stamina-=2;s.xp++;msg='走进'+['山脚','竹溪','远坡'][s.depth]+'，采到菌子和板栗的机会增加。';}
 if(a==='rest'){if(s.time<1)return '时辰不足';s.time--;s.stamina=Math.min(10,s.stamina+3);msg='靠着树歇了一会儿，体力+3。';}
 if(['gentle','harvest'].includes(a)){let cost=a==='harvest'?3:2;if(s.time<1||s.stamina<cost)return '时辰或体力不足';if(weight(s)>=cap(s))return '背篓已满，请下山处理';s.time--;s.stamina-=cost;let i=s.depth===0?0:s.depth===1?(rng(s)<.55?1:0):(rng(s)<.6?2:1);let n=a==='harvest'?2:1;if(s.eco<=2)n=1;let got=0;while(n--&&weight(s)+GOODS[i].weight<=cap(s)){s.bag[i]++;got++}s.xp++;s.eco+=a==='gentle'?.5:-1;msg=got?'采到'+GOODS[i].name+'×'+got+'。'+(a==='harvest'?'翻采消耗了林地生机。':'留根轮采，林地慢慢恢复。'):'背篓放不下这份山货。';}
 if(!msg)return '当前不能这样操作';s.steps++;clamp(s);log(s,msg);event(s);return '';
}
if(s.phase==='market'&&a.startsWith('sell')){const i=+a.slice(4);if(!s.bag[i])return '没有这类山货';let price=GOODS[i].price+(i===1&&s.weather===1?2:0);s.cash+=s.bag[i]*price;log(s,GOODS[i].name+'售出，现金+'+s.bag[i]*price+'。');s.bag[i]=0;return '';}
if(s.phase==='market'&&a==='dry'){if(!s.dryer)return '需要先在家置办晒架';if(!s.bag[1])return '没有菌子可晒';s.food+=s.bag[1]*3;log(s,'菌子晒成干货，口粮+'+s.bag[1]*3+'。');s.bag[1]=0;return '';}
if(s.phase==='market'&&a==='night'){let add=s.bag.reduce((n,v,i)=>n+v*GOODS[i].food,0);s.food+=add;log(s,'留下山货折成口粮+'+add+'。'+(s.bag[1]?'鲜菌只按当晚食用折粮，不能隔夜囤。':''));s.bag=[0,0,0];night(s);return '';}
if(s.phase==='home'){
if(a==='rice'){if(s.cash<6)return '现金不足6';s.cash-=6;s.food+=6;log(s,'买回口粮6。');return '';}
if(a==='basket'){if(s.level>=2)return '背篓已是最大容量';let c=16+s.level*10;if(s.cash<c)return '现金不足'+c;s.cash-=c;s.level++;log(s,'周木匠换好背篓，容量增加4。');return '';}
if(a==='dryer'){if(s.dryer)return '已有晒架';if(s.cash<18)return '现金不足18';s.cash-=18;s.dryer=true;log(s,'晒架搭好了，菌子可以加工成耐存口粮。');return '';}
if(a==='lead'){if(s.xp<14||s.trust<5||s.cash<4)return '带队需要经验14、人情5、现金4';s.cash-=4;s.food+=7;s.trust++;log(s,'带邻居轮采，分得口粮7，现金-4，人情+1。');night(s);return '';}
if(a==='stay'){s.health=Math.min(6,s.health+2);s.eco+=1;log(s,'留家修整，健康+2、生态+1。');night(s);return '';}
}return '当前不能这样操作';}
function night(s){s.food-=3;if(s.food<0){s.food=0;s.hunger++;s.health-=2;log(s,'今晚缺粮，健康-2；连续两晚缺粮将结束。')}else{s.hunger=0;log(s,'一家人吃过晚饭，消耗口粮3。')}s.day++;s.phase='home';s.eco+=.5;clamp(s);end(s);}
function choose(s,i){const ev=EVENTS.find(e=>e.id===s.event);if(!ev||!ev.choices[i])return '无效选择';const c=ev.choices[i];if(!possible(s,c[1]))return '资源不足，无法这样选择';effect(s,c[1]);log(s,ev.title+'：'+c[0]);s.event=null;return '';}
function valid(s){if(!s||s.v!==1||!['home','mountain','market','end'].includes(s.phase))return false;const ranges={day:[1,13],food:[0,999],cash:[0,999],health:[0,6],trust:[0,999],xp:[0,999],eco:[0,10],level:[0,2],depth:[0,2],time:[0,10],stamina:[0,10],weather:[0,2],steps:[0,100],hunger:[0,2],rev:[0,Number.MAX_SAFE_INTEGER],seed:[0,4294967295]};if(!Object.entries(ranges).every(([k,[a,b]])=>Number.isFinite(s[k])&&s[k]>=a&&s[k]<=b))return false;if(!Array.isArray(s.bag)||s.bag.length!==3||!s.bag.every(n=>Number.isInteger(n)&&n>=0&&n<=16)||weight(s)>cap(s))return false;if(!Array.isArray(s.seen)||!s.seen.every(n=>Number.isInteger(n)&&n>=0&&n<EVENTS.length)||!Array.isArray(s.log)||s.log.length>40||!s.log.every(x=>typeof x==='string'&&x.length<=300))return false;return typeof s.dryer==='boolean'&&(s.event===null||Number.isInteger(s.event)&&!!EVENTS[s.event])&&(s.ending===null||['熬不过的秋寒','仓满人和','灶火未熄','借粮过冬'].includes(s.ending));}
const api={GOODS,PEOPLE,EVENTS,fresh,act,choose,valid,weight,cap,back,possible};root.Mountain=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
