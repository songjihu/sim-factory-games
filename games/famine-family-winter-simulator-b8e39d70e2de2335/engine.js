(function(root){'use strict';
const PEOPLE=[['阿爹','砍柴能手',1.5,1],['阿娘','熟悉野地',1,1.5],['奶奶','织补熟练',.6,.8],['阿禾','换工利落',1,1.1],['小满','只做轻活',.4,.5]];
const JOBS=[['rest','歇息','体力+12'],['gather','采集','粮+3，体力-8'],['wood','砍柴','柴+4，体力-10'],['work','换工','粮+4，体力-12'],['mend','织补','钱+3，体力-5']];
const EVENTS=[
['风口漏雪','屋顶的缝隙灌进冷风。',s=>s.roof<2,[['补一道苇席',{wood:-3,roof:1}],['裹紧旧被',{all:-4}]]],
['周婶敲门','邻家今天断了炊烟。',s=>s.food>=5,[['送两份粮，两日后回礼',{food:-2,trust:2,delay:5}],['借一个火种',{wood:-1,trust:1}]]],
['织坊急单','掌柜想赶在落雪前收齐棉絮。',s=>s.day>=2,[['让奶奶多赶一晚',{cash:5,person:2,hp:-8}],['照常歇息',{trust:1}]]],
['粮摊涨价','赶集的人说，明天粮价还要涨。',s=>s.cash>=4,[['四钱换六粮',{cash:-4,food:6}],['留钱修屋',{trust:1}]]],
['种袋受潮','种袋角落湿了一片。',s=>s.seed>=2,[['烧柴烘干',{wood:-2}],['挑出坏种',{seed:-2,food:1}]]],
['阿禾的主意','她想拿织品去邻村换粮。',s=>s.hp[3]>=35,[['带上路费',{cash:-2,food:5,hp:-3,person:3}],['留在家中',{hp:4,person:3}]]],
['小满捡穗','孩子发现场边遗漏的谷穗。',s=>s.day>=3,[['陪他一起捡',{food:3,all:-2}],['让他先回暖屋',{hp:6,person:4}]]],
['里正点名','村里修公仓需要人手。',s=>s.day>=4,[['出一束柴',{wood:-3,trust:3}],['出两钱',{cash:-2,trust:2}]]],
['寒夜咳嗽','奶奶夜里咳得睡不稳。',s=>s.hp[2]<70,[['熬粥暖身',{food:-2,hp:10,person:2}],['多添柴火',{wood:-2,hp:6,person:2}]]],
['破口的米缸','米缸边缘裂开一条缝。',s=>s.day>=4,[['买陶泥修补',{cash:-2,food:1}],['换成布袋',{food:-1}]]],
['旧锄换粮','有人愿意收旧农具。',s=>s.seed>=5,[['保留春耕家什',{trust:1}],['卖出一件',{cash:5,seed:-2}]]],
['林边脚印','有人走过林边，留下半捆干柴。',s=>s.day>=5,[['送去失物处',{wood:1,trust:2}],['背回家',{wood:4}]]],
['暖日晒被','短暂放晴，院里有了暖意。',s=>s.day>=6,[['全家晒被',{all:4}],['晾晒种袋',{seed:1}]]],
['换工邀约','周婶约阿爹明早搭棚。',s=>s.hp[0]>=40,[['答应帮忙',{person:0,hp:-5,food:4,trust:1}],['婉拒养力',{person:0,hp:5}]]],
['过路商贩','车上剩下些耐存的杂粮。',s=>s.day>=7,[['拿柴换粮',{wood:-3,food:4}],['拿钱换粮',{cash:-3,food:5}]]],
['院里的老树','老枝压在屋檐上。',s=>s.day>=7,[['修枝作柴',{all:-3,wood:5}],['请邻居帮忙',{trust:-2,wood:3}]]],
['孩子的饥饿','小满盯着锅底，没说话。',s=>s.hp[4]<70,[['添一碗粥',{food:-2,person:4,hp:10}],['围炉讲故事',{wood:-1,person:4,hp:4}]]],
['邻村消息','互助仓下周要开粮。',s=>s.day>=8,[['先帮着搬运',{all:-3,trust:2,delay:4}],['把家里安排好',{wood:1}]]],
['雪压柴垛','屋外的柴沾上雪水。',s=>s.day>=9,[['留火烘干',{wood:-1}],['舍掉湿柴',{wood:-3,trust:1}]]],
['掌柜结账','织坊掌柜来结清零活的钱。',s=>s.day>=10,[['拿现钱',{cash:4}],['折成口粮',{food:5}]]],
['一碗热汤','邻居端来冬夜的一碗汤。',s=>s.trust>=4,[['一家分着喝',{all:5}],['留给体弱的奶奶',{hp:13,person:2}]]],
['春耕约定','里正统计来年能下地的种粮。',s=>s.day>=12,[['郑重封好种袋',{seed:1,trust:1}],['先换眼前温饱',{seed:-2,food:5}]]],
['最后一场雪','门前积雪让出门更难。',s=>s.day>=14,[['清出一条路',{all:-4,wood:3}],['邻里轮流清扫',{trust:-2,all:2}]]],
['河面回暖','冰面边缘传来细水声。',s=>s.day>=16,[['修好春播篓',{wood:-2,seed:1}],['煮一锅团圆粥',{food:-3,all:6}]]]
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fresh(){return {schema:1,id:'G109',rev:0,day:1,food:20,seed:10,wood:15,cash:8,trust:3,roof:0,hp:[78,78,65,82,75],ration:5,aidDay:0,jobs:['wood','gather','mend','work','rest'],seen:[],event:null,phase:'plan',log:['冬日第一天。粮缸二十份，种袋十份，一家五口。'],pending:[],ending:'',lastMeal:5};}
function weather(s){return ['晴冷','小雪','寒潮','阴天','晴冷','大雪'][(s.day-1)%6]}
function can(s,d){return ['food','seed','wood','cash','trust'].every(k=>s[k]+(d[k]||0)>=0)}
function change(s,d){for(const k of ['food','seed','wood','cash','trust'])s[k]=clamp(s[k]+(d[k]||0),0,999);s.roof=clamp(s.roof+(d.roof||0),0,2);if(d.all)s.hp=s.hp.map(h=>clamp(h+d.all,0,100));if(d.person!==undefined)s.hp[d.person]=clamp(s.hp[d.person]+(d.hp||0),0,100);if(d.delay)s.pending.push({day:s.day+2,food:d.delay});}
function finish(s){if(s.hp.some(h=>h<=0)){s.ending='冬夜暂别';s.phase='end';s.event=null;return true}if(s.day>18){const avg=s.hp.reduce((a,b)=>a+b,0)/5;s.ending=s.seed>=8&&s.food>=12&&avg>=45&&s.trust>=8?'留种迎春':s.seed>=5&&avg>=25?'灶火仍暖':'艰难度冬';s.phase='end';s.event=null;return true}return false}
function settle(s){if(s.phase!=='plan')return '请先处理今日家事';let out={food:0,wood:0,cash:0};for(let i=0;i<5;i++){const j=s.jobs[i],h=s.hp[i],factor=(h<35?.5:1)*(s.lastMeal<5?.75:1);if(j==='rest')s.hp[i]=clamp(h+12,0,100);else{let amount=j==='gather'?3*PEOPLE[i][3]:j==='wood'?4*PEOPLE[i][2]:j==='work'?4*(i===3?1.3:1):i===2?4:3;out[j==='wood'?'wood':j==='mend'?'cash':'food']+=Math.max(1,Math.floor(amount*factor));s.hp[i]=clamp(h-({gather:8,wood:10,work:12,mend:5}[j]),0,100)}}for(const k in out)s[k]=clamp(s[k]+out[k],0,999);let heat=weather(s)==='寒潮'||weather(s)==='大雪'?4:2;heat=Math.max(1,heat-s.roof);const burned=Math.min(heat,s.wood);s.wood-=burned;const cold=burned<heat?(heat-burned)*3:0;const eat=Math.min(s.ration,s.food);s.food-=eat;s.lastMeal=eat;const nutrition=eat>=7?7:eat>=5?2:eat>=3?-5:-12;s.hp=s.hp.map(h=>clamp(h+nutrition-cold,0,100));s.log.unshift(`第${s.day}日 · ${weather(s)}：劳动得粮${out.food}、柴${out.wood}、钱${out.cash}；吃粮${eat}/${s.ration}，烧柴${burned}/${heat}。${eat<s.ration?'断粮，体力受损。':''}${cold?'缺柴受寒。':''}`);for(const p of s.pending.filter(p=>p.day<=s.day)){s.food=clamp(s.food+p.food,0,999);s.log.unshift(`邻里回礼送来${p.food}粮。`)}s.pending=s.pending.filter(p=>p.day>s.day);if(finish(s))return '';const idx=EVENTS.findIndex((e,i)=>!s.seen.includes(i)&&e[2](s)&&e[3].some(c=>can(s,c[1])));if(idx>=0){s.event=idx;s.phase='event'}else advance(s);return ''}
function advance(s){s.event=null;s.day++;s.phase='plan';finish(s)}
function choose(s,i){if(s.phase!=='event')return '当前没有家事';const e=EVENTS[s.event],c=e[3][i];if(!c||!can(s,c[1]))return '资源不足';change(s,c[1]);s.log.unshift(`第${s.day}日 · ${e[0]}：${c[0]}。`);s.seen.push(s.event);if(!finish(s))advance(s);return ''}
function act(s,a){if(s.phase!=='plan')return '先处理今日家事';const d={buy:{cash:-3,food:5},burnseed:{seed:-2,food:5},repair:{wood:-5,cash:-3,roof:1},aid:{food:-3,trust:2,delay:5}}[a];if(!d)return '未知操作';if(a==='aid'&&s.aidDay===s.day)return '今日已安排互助，明日再来';if(a==='repair'&&s.roof>=2)return '屋顶已修好';if(!can(s,d))return '资源不足';change(s,d);if(a==='aid')s.aidDay=s.day;s.log.unshift(`第${s.day}日 · ${ {buy:'三钱买五粮',burnseed:'动用两份种粮换五粮',repair:'修缮屋顶',aid:'邻里互助，送三粮，两日后回五粮'}[a]}。`);return ''}
function valid(s){return !!s&&s.schema===1&&s.id==='G109'&&Number.isSafeInteger(s.rev)&&s.rev>=0&&Number.isInteger(s.day)&&s.day>=1&&s.day<=19&&['food','seed','wood','cash','trust'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<=999)&&Number.isInteger(s.roof)&&s.roof>=0&&s.roof<=2&&Array.isArray(s.hp)&&s.hp.length===5&&s.hp.every(h=>Number.isInteger(h)&&h>=0&&h<=100)&&[3,5,7].includes(s.ration)&&Number.isInteger(s.lastMeal)&&s.lastMeal>=0&&s.lastMeal<=7&&Array.isArray(s.jobs)&&s.jobs.length===5&&s.jobs.every((j,i)=>JOBS.some(x=>x[0]===j)&&(i!==4||['rest','mend'].includes(j)))&&['plan','event','end'].includes(s.phase)&&Array.isArray(s.seen)&&s.seen.length<=24&&new Set(s.seen).size===s.seen.length&&s.seen.every(x=>Number.isInteger(x)&&x>=0&&x<24)&&((s.phase==='event'&&Number.isInteger(s.event)&&s.event>=0&&s.event<24&&!s.seen.includes(s.event))||(s.phase!=='event'&&s.event===null))&&Array.isArray(s.pending)&&s.pending.length<=100&&s.pending.every(p=>Number.isInteger(p.day)&&p.day>=1&&p.day<=20&&Number.isInteger(p.food)&&p.food>=0&&p.food<=10)&&Array.isArray(s.log)&&s.log.length<=1000&&s.log.every(t=>typeof t==='string'&&t.length<=500)&&['','留种迎春','灶火仍暖','艰难度冬','冬夜暂别'].includes(s.ending)&&(s.phase!=='end'||s.ending!=='')}
const api={PEOPLE,JOBS,EVENTS,fresh,weather,can,settle,choose,act,valid};if(typeof module!=='undefined')module.exports=api;root.Winter=api;
})(typeof window!=='undefined'?window:globalThis);
