(function(root){'use strict';
const VERSION='1.0.1',GOODS=[{name:'花蛤',price:4,food:2},{name:'海螺',price:7,food:2},{name:'青蟹',price:12,food:3}];
const PEOPLE=[['阿岚','料理家务与晾晒，盼着攒够过冬钱。'],['小汐','每天在窗边画下潮位。'],['陈伯','老渔人，教你辨潮与留种。'],['叶嫂','收鲜摊主，按鲜度结价。'],['周船匠','修冰箱、补船板。'],['林巡护','照看禁采区与幼蟹。']];
const EVENTS=[
['退潮后的幼蛤','沙面密密一片幼蛤。',s=>s.eco<8,[['留种：生态+2',{eco:2}],['清理垃圾：体力-1，口碑+2',{energy:-1,rep:2}]]],
['陈伯的潮尺','陈伯要在礁口重立潮尺。',s=>s.day<5,[['搭手：时间-1，经验+2',{time:-1,xp:2}],['记住标线：经验+1',{xp:1}]]],
['漏水的竹篓','篓底有个小洞，花蛤要漏出来了。',s=>s.bag[0]>0,[['补篓：时间-1，经验+1',{time:-1,xp:1}],['分给邻居：花蛤-1，口碑+2',{bag:[-1,0,0],rep:2}]]],
['礁洞的母蟹','洞中一只抱卵母蟹，身后还有成蟹。',s=>s.zone===2,[['放回母蟹：生态+2',{eco:2}],['守洞等成蟹：时间-1，青蟹+1',{time:-1,bag:[0,0,1]}]]],
['热汤送到岸边','阿岚送来一碗热汤。',s=>s.energy<=7,[['歇一歇：时间-1，体力+3',{time:-1,energy:3}],['留给晚归人：口碑+2',{rep:2}]]],
['退潮孤网','废网缠住了礁石。',s=>s.zone>0,[['清网：体力-2，生态+2，口碑+1',{energy:-2,eco:2,rep:1}],['标记位置：经验+1',{xp:1}]]],
['叶嫂的急单','午市想收一批活花蛤。',s=>s.bag[0]>=2,[['当场交货：花蛤-2，现金+11',{bag:[-2,0,0],cash:11}],['留作晚饭：口碑+1',{rep:1}]]],
['风从海面转向','风声变低，陈伯提醒该收手了。',s=>s.weather===1,[['提前收拾：体力+2',{energy:2}],['加固篓盖：时间-1，鲜度+1',{time:-1,fresh:1}]]],
['搁浅的小鱼','一条小鱼困在浅坑。',s=>s.zone===0,[['送回水里：时间-1，生态+2',{time:-1,eco:2}],['叫巡护帮忙：口碑+1',{rep:1}]]],
['好用的蟹夹','周船匠有一把旧蟹夹。',s=>s.xp>=3,[['换夹：现金-4，经验+3',{cash:-4,xp:3}],['请教手法：时间-1，经验+2',{time:-1,xp:2}]]],
['竹筒淡水','邻居的水壶空了。',s=>s.energy>=3,[['分水：体力-1，口碑+2',{energy:-1,rep:2}],['陪他回浅滩：时间-1，口碑+1',{time:-1,rep:1}]]],
['潮沟的新脚印','有人发现一片未采过的螺窝。',s=>s.zone===1&&s.xp>=4,[['慢慢找：时间-1，海螺+2',{time:-1,bag:[0,2,0]}],['记录轮采点：生态+1，经验+1',{eco:1,xp:1}]]],
['海风里的旧帆','旧帆可以遮住篓里的鲜货。',s=>s.fresh<=3,[['铺好：时间-1，鲜度+2',{time:-1,fresh:2}],['捐给修船队：口碑+2',{rep:2}]]],
['小汐的潮汐画','孩子把今日潮线画在纸上。',s=>s.day>=3,[['比对潮尺：经验+2',{xp:2}],['夸夸画作：口碑+1，体力+1',{rep:1,energy:1}]]],
['海螺收购价','叶嫂今天急收海螺。',s=>s.bag[1]>=2,[['交货：海螺-2，现金+18',{bag:[0,-2,0],cash:18}],['换米：海螺-1，口粮+4',{bag:[0,-1,0],food:4}]]],
['留种牌歪了','禁采区木牌倒在沙里。',s=>s.day>=4,[['扶正：时间-1，生态+2',{time:-1,eco:2}],['通知林巡护：口碑+1',{rep:1}]]],
['船匠的午饭','周船匠修船没顾上吃饭。',s=>s.food>=3,[['送饭：口粮-2，口碑+3',{food:-2,rep:3}],['搭把手：体力-1，经验+2',{energy:-1,xp:2}]]],
['雨后的淡水沟','淡水冲淡了这片滩。',s=>s.weather===1&&s.zone===0,[['转找高处：体力-1，海螺+1',{energy:-1,bag:[0,1,0]}],['歇滩养护：生态+2',{eco:2}]]],
['赶集的顺风车','邻居愿意替你捎一份鲜货。',s=>s.rep>=4&&s.bag[2]>0,[['托他卖蟹：青蟹-1，现金+15',{bag:[0,0,-1],cash:15}],['让出位置：口碑+2',{rep:2}]]],
['礁石上的盐花','旧盐场还能拾到洁净盐。',s=>s.day>=5,[['收盐学习：时间-1，经验+2',{time:-1,xp:2}],['修好导流沟：体力-1，生态+1',{energy:-1,eco:1}]]],
['巡护的邀约','林巡护邀你参加轮采巡查。',s=>s.rep>=5,[['一起巡查：时间-1，生态+2，经验+1',{time:-1,eco:2,xp:1}],['分享观察：经验+2',{xp:2}]]],
['起笼的老手','陈伯讲起养殖笼的水流位置。',s=>s.xp>=7,[['换堂课：口粮-2，经验+4',{food:-2,xp:4}],['先记下来：经验+1',{xp:1}]]],
['晚市涨价','船上的青蟹比今天少。',s=>s.day>=7&&s.bag[2]>0,[['卖一只：青蟹-1，现金+18',{bag:[0,0,-1],cash:18}],['留足家用：口碑+1',{rep:1}]]],
['过冬的约定','阿岚说：海还在，日子就有盼头。',s=>s.day>=10,[['约好轮采：生态+1，口碑+1',{eco:1,rep:1}],['歇够再走：体力+2',{energy:2}]]]
].map((x,i)=>({id:i,title:x[0],text:x[1],when:x[2],choices:x[3]}));
function fresh(mode='calm'){return {v:1,rev:0,day:1,phase:'home',food:9,cash:16,health:6,eco:7,xp:0,rep:0,ice:false,rack:false,boat:false,nursery:0,zone:0,time:8,energy:10,bag:[0,0,0],fresh:5,weather:0,tide:0,steps:0,hunger:0,event:null,seen:[],log:['阿岚：撑过十二天潮汛，留够过冬粮和修屋钱。'],ending:null,mode,seed:mode==='calm'?29029:8712};}
function rng(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296}function total(s){return s.bag.reduce((a,b)=>a+b,0)}function cap(s){return s.ice?12:9}function back(s){return s.zone+1+(s.weather===1?1:0)}function log(s,t){s.log.unshift(t);s.log=s.log.slice(0,40)}
function clamp(s){for(const k of ['cash','food','xp','rep'])s[k]=Math.max(0,Math.min(999,s[k]));for(const [k,n]of Object.entries({health:6,eco:10,energy:10,fresh:5,time:10}))s[k]=Math.max(0,Math.min(n,s[k]));}
function possible(s,e){for(const[k,v]of Object.entries(e)){if(k==='bag'){if(v.some((n,i)=>s.bag[i]+n<0))return false;if(total(s)+v.reduce((a,b)=>a+b,0)>cap(s))return false}else if(v<0&&s[k]+v<0)return false}return true}
function effect(s,e){for(const[k,v]of Object.entries(e)){if(k==='bag')v.forEach((n,i)=>s.bag[i]+=n);else s[k]+=v}clamp(s)}
function finish(s,why){if(why||s.day>12){s.phase='end';s.ending=why||(s.food>=15&&s.cash>=55&&s.eco>=6?'潮生富足':s.food>=3&&s.health>=3?'灯火守住':'借米过冬');log(s,s.ending)}}
function night(s){s.food-=3;if(s.food<0){s.food=0;s.hunger++;s.health-=2;log(s,'口粮不足，健康-2。连续两晚缺粮会结束。')}else{s.hunger=0;log(s,'全家晚饭消耗口粮3。')}if(s.nursery>0){s.nursery--;if(s.nursery===0){s.cash+=24;log(s,'养殖笼收成到账：现金+24。')}}s.day++;s.phase='home';s.eco+=.5;s.tide=(s.day+1)%3;s.weather=s.mode==='wind'&&s.day%3===0?2:Math.floor(rng(s)*3);clamp(s);finish(s,s.health<=0||s.hunger>=2?'风浪暂歇':null)}
function maybe(s){if(s.phase!=='shore'||s.event!==null||s.steps%2!==0)return;const arr=EVENTS.filter(e=>!s.seen.includes(e.id)&&e.when(s));if(arr.length){const e=arr[Math.floor(rng(s)*arr.length)];s.event=e.id;s.seen.push(e.id)}}
function retreat(s,forced){const cost=back(s);const late=s.time<cost||s.energy<cost;if(forced||late){s.health-=1;s.fresh=Math.max(1,s.fresh-2);log(s,'错过安全潮窗，救援返港：健康-1，鲜度-2。')}else{s.time-=cost;s.energy-=cost;log(s,'在涨潮前返港，按鲜度销售或留粮。')}s.phase='market';clamp(s);if(s.health<=0)finish(s,'风浪暂歇')}
function act(s,a){if(s.phase==='end')return '本局已结束，请重玩';if(s.event!==null)return '先处理眼前事件';
if(s.phase==='home'){
 if(a==='start'){s.phase='shore';s.zone=0;s.time=[8,7,6][s.tide]-(s.weather===1?1:0);s.energy=10;s.fresh=5;s.steps=0;s.bag=[0,0,0];log(s,'出发：潮窗'+s.time+'格。返港至少预留'+back(s)+'格时间与体力。');return '';}
 const opts={rice:[6,()=>{s.food+=6},'购入口粮6'],ice:[22,()=>{s.ice=true},'保冷箱启用：容量12，鲜度损耗减半'],rack:[18,()=>{s.rack=true},'晒架启用：鲜货可晒干折粮'],boat:[38,()=>{s.boat=true},'小船修好：晴日可出海'],seed:[12,()=>{s.nursery=3;s.eco-=1},'养殖笼投苗，三晚后收入24']};
 if(opts[a]){if((a==='ice'&&s.ice)||(a==='rack'&&s.rack)||(a==='boat'&&s.boat))return '设施已建好';if(a==='seed'&&(s.nursery||s.eco<4))return '投苗需要空笼与生态4';let[c,f,t]=opts[a];if(s.cash<c)return '现金不足'+c;s.cash-=c;f();log(s,t);clamp(s);return '';}
 if(a==='rest'){s.health+=2;s.eco+=1;log(s,'留家修整：健康+2，生态+1。');clamp(s);night(s);return '';}
 if(a==='sail'){if(!s.boat||s.weather!==0||s.xp<6||s.cash<5)return '出海需要小船、晴天、经验6、现金5';s.cash-=5;s.bag=[1,2,3];s.fresh=4;s.phase='market';s.xp+=2;log(s,'晴日近海作业：花蛤1、海螺2、青蟹3；船耗5。');return '';}
}
if(s.phase==='shore'){
 if(a==='return'){retreat(s,false);return '';}
 if(a==='move'){if(s.zone>=2)return '已到最外侧礁区';if(s.time<back(s)+3||s.energy<back(s)+3)return '不够深入并安全返港';s.zone++;s.time--;s.energy--;log(s,'走进'+['浅滩','潮沟','外礁'][s.zone]+'，返港需'+back(s)+'格。');}
 else if(a==='gentle'||a==='dig'){const c=a==='dig'?2:1;if(s.time<1||s.energy<c)return '时间或体力不足';if(total(s)>=cap(s))return '篓已满，先返港';s.time--;s.energy-=c;let n=a==='dig'?3:2;if(s.eco<4)n=1;n=Math.min(n,cap(s)-total(s));s.bag[s.zone]+=n;s.eco+=a==='dig'?-1.5:.3;s.xp++;log(s,(a==='dig'?'翻采':'择大留小')+'得到'+GOODS[s.zone].name+'×'+n+'；'+(a==='dig'?'生态-1.5':'生态+0.3')+'。');}
 else if(a==='pause'){if(s.time<2)return '没有足够时间歇脚';s.time--;s.energy+=2;log(s,'歇一格时间，体力+2。');}
 else return '当前不能这样操作';
 s.steps++;if(!s.ice||s.steps%2===0)s.fresh-=1;clamp(s);if(s.time===0||s.energy===0)retreat(s,true);else maybe(s);return '';
}
if(s.phase==='market'){
 if(a.startsWith('sell')){const i=Number(a.slice(4));if(!Number.isInteger(i)||!GOODS[i]||!s.bag[i])return '没有这类鲜货';const p=Math.max(1,Math.floor(GOODS[i].price*(.4+.12*s.fresh)));const n=s.bag[i];s.cash+=p*n;s.bag[i]=0;log(s,GOODS[i].name+'售出'+n+'份，现金+'+p*n+'。');clamp(s);return '';}
 if(a==='dry'){if(!s.rack)return '先在家搭晒架';if(!total(s))return '没有鲜货可晒';let n=total(s)*3;s.food+=n;s.bag=[0,0,0];log(s,'鲜货晒干：口粮+'+n+'。');clamp(s);return '';}
 if(a==='night'){let n=s.bag.reduce((a,v,i)=>a+v*GOODS[i].food,0);s.food+=n;s.bag=[0,0,0];log(s,'留下鲜货作口粮+'+n+'。鲜货不隔夜囤积。');night(s);return '';}
}return '当前不能这样操作';}
function choose(s,i){const e=EVENTS[s.event];if(!e||!e.choices[i])return '无效选择';if(!possible(s,e.choices[i][1]))return '资源或容量不足';effect(s,e.choices[i][1]);log(s,e.title+'：'+e.choices[i][0]);s.event=null;if(s.time===0||s.energy===0)retreat(s,true);return '';}
function valid(s){if(!s||s.v!==1||!['home','shore','market','end'].includes(s.phase)||!['calm','wind'].includes(s.mode))return false;const ranges={rev:[0,Number.MAX_SAFE_INTEGER],day:[1,13],food:[0,999],cash:[0,999],health:[0,6],eco:[0,10],xp:[0,999],rep:[0,999],nursery:[0,3],zone:[0,2],time:[0,10],energy:[0,10],fresh:[0,5],weather:[0,2],tide:[0,2],steps:[0,30],hunger:[0,2],seed:[0,4294967295]};if(!Object.entries(ranges).every(([k,[a,b]])=>Number.isFinite(s[k])&&(k==='eco'||Number.isInteger(s[k]))&&s[k]>=a&&s[k]<=b))return false;if(!['ice','rack','boat'].every(k=>typeof s[k]==='boolean'))return false;if(!Array.isArray(s.bag)||s.bag.length!==3||!s.bag.every(n=>Number.isInteger(n)&&n>=0&&n<=12)||total(s)>cap(s))return false;if(!Array.isArray(s.seen)||s.seen.length>24||new Set(s.seen).size!==s.seen.length||!s.seen.every(i=>Number.isInteger(i)&&!!EVENTS[i]))return false;if(!Array.isArray(s.log)||s.log.length>40||!s.log.every(t=>typeof t==='string'&&t.length<301))return false;if(s.event!==null&&(!Number.isInteger(s.event)||!EVENTS[s.event]||s.phase!=='shore'))return false;return s.phase==='end'?['风浪暂歇','潮生富足','灯火守住','借米过冬'].includes(s.ending):s.ending===null;}
const api={VERSION,GOODS,PEOPLE,EVENTS,fresh,act,choose,valid,total,cap,back,possible};root.Tide=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
