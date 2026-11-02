(function(){'use strict';
const VERSION=1,KEY='g203-wusong-life-v1',META='g203-wusong-ends-v1';
const initial=()=>({v:VERSION,arc:'canon',step:0,energy:76,skill:52,money:40,yi:10,jie:10,lie:10,wounds:0,flags:{},history:[],phase:'story',rested:[],end:null,revision:0,updated:0});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function valid(s){return !!s&&s.v===VERSION&&Number.isInteger(s.step)&&s.step>=0&&s.step<=48&&(s.arc===undefined||['canon','retreat'].includes(s.arc))&&['story','result','rest','ending'].includes(s.phase)&&['energy','skill','money','yi','jie','lie','wounds','revision','updated'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&s.energy<=100&&s.skill<=100&&s.money<=999&&s.yi<=300&&s.jie<=300&&s.lie<=300&&s.wounds<=200&&Number.isInteger(s.revision)&&s.flags&&typeof s.flags==='object'&&!Array.isArray(s.flags)&&Object.keys(s.flags).every(k=>/^e\d+$/.test(k)&&Number.isInteger(s.flags[k])&&s.flags[k]>=0&&s.flags[k]<=2)&&Array.isArray(s.history)&&s.history.length===s.step&&s.history.every((r,i)=>r&&r.step===i&&[0,1,2].includes(r.choice)&&typeof r.text==='string'&&r.text.length<2000)&&Array.isArray(s.rested)&&s.rested.length<=8&&s.rested.every(x=>Number.isInteger(x)&&x>=1&&x<=8)&&(!s.end||['temple','home','blade'].includes(s.end))&&(s.phase!=='ending'||(s.step===48&&!!s.end))&&(s.step!==48||['result','ending'].includes(s.phase));}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return valid(s)?s:null;}catch{return null;}}
function spec(step,c,s){const battle=[3,15,20,28,40].includes(step);const cost=c===0?(step%5===0?4:2):c===1?0:(step%7===0?3:0);return {money:-cost,energy:c===0?-2:c===1?-(battle?(s?.skill>=65?9:12):6):4,skill:c===1?(battle?3:1):c===0?1:0,[['yi','lie','jie'][c]]:4};}
function ending(s){if(s.arc==='retreat')return 'home';if(s.lie>Math.max(s.yi,s.jie)&&s.lie>=65)return 'blade';return 'temple';}
function context(s,i){const f=s.flags;const a=[];if(s.arc==='retreat'&&i>=36)return '你先前保住哥哥、证人、无辜与军籍，并与故友约定退路。原著中的江南死局已经避开：此卷要把承诺落实为众人的安稳生活。';if(i===9&&f.e8===0)return '你在押送前托付街坊留意哥哥。这个曾经很小的安排，抢在了毒药之前。哥哥生还，后续剧情已改变。';
if(i===9&&f.e6===0)a.push('你曾陪哥哥走街，街坊认得你，郓哥更愿意把实情说全。');
if(i===10)a.push(f.e9===1?'此前的逼问让证人畏惧，你得先向他们保证不会迁怒。':'此前留下的证言与物证能互相印证，官府的推诿因此更刺眼。');
if(i===14)a.push(f.e13===0?'你没有白受饭食，施恩这次只能把整本账讲明。':'你已领下几日厚待，这次开口拒绝便更难了。');
if(i===19)a.push(f.e12===0?'十字坡相互试探后结下的交情，终于能替你传递消息。':'孙二娘仍记得你的谨慎或锋芒，张青答应设法接应。');
if(i===22)a.push(f.e21===1?'你带着未收住的怒火回来，今夜尤其容易把无涉的人也当成敌人。':'你在回城之前已给自己画过界限，此刻必须兑现。');
if(i===26)a.push(f.e22===1?'鸳鸯楼的过度杀戮仍压在心里。你得决定是否向朋友承认。':'你能坦白说出自己如何辨认主谋，也不会把清算说成荣耀。');
if(i===30)a.push(f.e29===2?'你曾把不害百姓写进步军队规，如今要把同样的要求带到朝廷面前。':'堂上争论正盛，那些没有座次的小卒还没有人替他们问话。');
if(i===33)a.push(f.e10!==1?'阳谷县那份供状教过你：没有留底的承诺，最容易被抹掉。':'你曾在衙门撕去官服，如今又见一份决定众人命运的文书。');
if(i===40)a.push(s.energy<35?'连续逞强已令你气力衰竭，强攻会让救援更加艰难。':'一路保留下的气力能帮你撑过这次重伤，却无法挽回已经失去的左臂。');
if(i===45)a.push(f.e33===1?'当初没有整理军籍，这次你需从幸存者口中重建病卒名册。':'你曾留下军籍与安置记录，现在可以据此为病卒安排照护。');
if(i===46)a.push(f.e22===1?'你知道自己曾伤及无辜。归乡授拳一线已关闭，余生仍能在自省中安顿。':'你曾在刀下守住无辜，这使归乡后教人护身而不恃强成为可能。');
if(i===47)a.push('目前倾向：'+(ending(s)==='blade'?'孤锋仍在催你向前。':ending(s)==='home'?'旧日承诺为归乡留住了人心。':'你正在学会把余生从恩仇中取回。'));
return a.join('');}
function choose(s,c){if(s.step>=48||s.phase!=='story'||![0,1,2].includes(c))throw Error('当前不能作此选择');const d=spec(s.step,c,s);if(s.money+d.money<0)throw Error('盘缠不足，请选另一种做法');const t=structuredClone(s),i=t.step,e=event(t,i),p=e[3+c].split('|');let txt=p[1];
for(const [k,n]of Object.entries(d))t[k]=clamp(t[k]+n,0,k==='money'?999:k==='energy'||k==='skill'?100:300);
if(t.energy<12){t.wounds=clamp(t.wounds+1,0,200);t.energy=30;t.money=Math.max(0,t.money-5);txt+=' 你因气力不支留下伤患，花去最多五文安置与疗伤，才得继续前行。';}
if(i===5){t.money+=c===1?18:8;txt+=c===1?' 赏银十八文入囊。':' 留作盘缠八文。';}
if(i===16&&c===1)t.money+=12;
if(i===40&&t.arc!=='retreat'){t.wounds++;t.energy=Math.max(20,t.energy-15);}
t.flags['e'+i]=c;if(t.step===35&&t.flags.e8===0&&[9,10,11,22,33,34].every(n=>t.flags['e'+n]!==1)&&t.yi>=90&&t.yi>=t.jie&&t.yi>=t.lie)t.arc='retreat';t.history.push({step:i,choice:c,text:txt,delta:d});t.step++;t.phase='result';return t;}
function advance(s){const t=structuredClone(s);if(t.phase!=='result')return t;if(t.step===48){t.end=ending(t);t.phase='ending';}else if(t.step%6===0&&!t.rested.includes(t.step/6)){t.phase='rest';}else t.phase='story';return t;}
function rest(s,c){if(s.phase!=='rest'||![0,1,2].includes(c))throw Error('休整状态无效');const t=structuredClone(s);if(c===0&&t.money<5)throw Error('盘缠不足');if(c===0){t.money-=5;t.energy=clamp(t.energy+32,0,100);}if(c===1){t.energy=clamp(t.energy+10,0,100);t.skill=clamp(t.skill+7,0,100);}if(c===2){t.energy=clamp(t.energy+20,0,100);t.yi+=2;t.jie+=2;}t.money=clamp(t.money+8,0,999);t.rested.push(t.step/6);t.phase='story';return t;}
function save(s,expected){let other;try{other=JSON.parse(localStorage.getItem(KEY));}catch{}if(other&&valid(other)&&other.revision>expected)throw Error('另一页面有较新进度。请先载入新进度，避免覆盖。');const t=structuredClone(s);t.revision=Math.max(expected,other?.revision||0)+1;t.updated=Date.now();localStorage.setItem(KEY,JSON.stringify(t));return t;}
function chapter(s,i=s.step){const n=Math.min(7,Math.floor(i/6));return s.arc==='retreat'&&n>=6?RETREAT_BOOK[n-6]:BOOK[n];}
function event(s,i=s.step){if(s.flags.e8===0&&BROTHER_EVENTS[i])return BROTHER_EVENTS[i];return chapter(s,i).events[i%6];}
window.Engine={chapter,event,KEY,META,initial,valid,load,spec,ending,context,choose,advance,rest,save};
})();
