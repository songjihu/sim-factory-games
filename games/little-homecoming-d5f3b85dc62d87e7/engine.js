/* 小小归途：原创虚构寻亲故事。G104 v1.0.0 */
const E={
version:1,
roles:[['林姐姐','社区社工','陪你寻访，保管资料与正式核验。'],['周奶奶','临时照护人','晚饭与休息，让奔波有个落脚点。'],['何师傅','修补匠','修复旧物，认出独特针脚。'],['唐阿姨','旧街裁缝','保存着当年的布样。'],['许伯伯','渡口管理员','记得那一年的停航与改签。'],['小禾','图书志愿者','整理旧报和小镇照片。'],['陈老师','档案协作员','核对授权记录，不向陌生人透露资料。'],['沈青','被寻找的家人','也在留下寻找小满的消息。']],
clues:[
{id:0,name:'半枚蓝鱼',icon:'◒',from:'随身旧物',text:'背面刻有一条不对称的小弧线。不是名字，而是一枚手作记号。'},
{id:1,name:'修补账页',icon:'▤',from:'旧街·修补台',text:'“给小满的小鱼”，落款沈青。纸上画着同样的小弧线。'},
{id:2,name:'旧渡票',icon:'▱',from:'协作室·物证袋',text:'九月十二日，柳湾至白沙。右下角另盖了改签章。'},
{id:3,name:'停航记录',icon:'≋',from:'渡口·公告栏',text:'当年九月十二日停航，乘客改道北岸。旧车站并非终点。'},
{id:4,name:'兔子布样',icon:'✿',from:'旧街·裁缝铺',text:'米白棉布，耳朵内衬有三朵红花。针脚从左往右收尾。'},
{id:5,name:'寻人留档',icon:'▧',from:'协作室·档案柜',text:'经授权查看的记录：沈青寻找孩子“小满”，提到三朵花的布兔。'},
{id:6,name:'相似照片',icon:'▣',from:'渡口·旧相册',text:'陌生孩子戴着相似围巾。照片只有模糊背影，不能证明身份。'},
{id:7,name:'邻居传闻',icon:'◇',from:'旧街·巷口',text:'有人说孩子去了旧车站。说话者并未亲眼见过，只是转述。'},
{id:8,name:'街区旧照',icon:'▥',from:'旧街·图书角',text:'桥头门牌曾改号。照片上的老铺如今就是修补台。'},
{id:9,name:'回访便笺',icon:'✉',from:'渡口·值班室',text:'许伯伯答应托协作员核对旧记录；两天后会有回音。'},
{id:10,name:'未寄出的信',icon:'♡',from:'协作室·来信匣',text:'“小满，如果你还记得那条小鱼……”收信地址已由林姐姐保管。'},
{id:11,name:'改签去向',icon:'↝',from:'渡口·线路簿',text:'改签名单的路线指向北岸，和停航记录一致。这里只能证明路线。'}],
chains:[{name:'小鱼与小满',pair:[0,1],desc:'手作记号和修补账页相互印证，沈青与小满确有旧物联系。'}, {name:'改签后的路',pair:[2,3],desc:'旧票并非失效线索：当日停航后改道北岸，解释了记忆里的渡口。'}, {name:'布兔的主人',pair:[4,5],desc:'独特针脚、三朵花与授权留档一致，为正式核验提供第三组依据。'}, {name:'相像就是家人',pair:null,desc:'相似外貌和传闻不构成身份凭据。请找独立记录相互核对。'}],
locations:[{id:'room',name:'协作室',sub:'旧物、授权档案、来信',image:'room',spots:[['bag','物证袋','找出旧渡票',25,79],['file','档案柜','信任45可查',73,32],['letter','来信匣','第4天有回音',72,78]]}, {id:'street',name:'雨后旧街',sub:'修补台、裁缝铺、图书角',image:'street',spots:[['repair','修补台','安心18 · 查账页',21,30],['cloth','裁缝铺','取得兔子布样',78,32],['photo','图书角','辨别旧照与传闻',70,83]]}, {id:'pier',name:'河畔渡口',sub:'公告栏、旧相册、值班室',image:'pier',spots:[['notice','公告栏','核对当日航情',24,40],['album','旧相册','相像≠身份',72,60],['visit','值班室','预约两日后回访',30,83]]}],
fresh(){return {version:1,day:1,ap:3,calm:76,trust:50,loc:'room',clues:[0],chains:[],used:[],events:[],pending:null,wait:null,confirmed:false,ended:null,log:['林姐姐把小鱼装进物证袋。十天里，我们一起找能被核实的答案。'],last:'先去协作室的物证袋看看，再沿地图寻访。'}},
log(s,t){s.last=t;s.log.unshift('第'+s.day+'天 · '+t);s.log=s.log.slice(0,60)},
apply(s,e){for(let k of ['calm','trust'])s[k]=Math.max(0,Math.min(100,s[k]+(e[k]||0)))},
give(s,id){if(!s.clues.includes(id))s.clues.push(id)},
ready(s){return !s.ended&&s.pending===null},
act(s,id){if(!this.ready(s))return {ok:false,text:'请先处理来信或查看结局。'};if(s.ap<1)return {ok:false,text:'今天脚步用完了，回家结算后再来。'};if(s.used.includes(id))return {ok:false,text:'今天已做过这件事。'};
const need={repair:'street',cloth:'street',photo:'street',bag:'room',file:'room',letter:'room',notice:'pier',album:'pier',visit:'pier'};
if(need[id]&&s.loc!==need[id])return {ok:false,text:'先到对应地点再查看。'};
if(id==='file'&&s.trust<45)return {ok:false,text:'授权查档需要信任45。请先休息或帮忙整理资料。'};
if(id==='repair'&&s.calm<18)return {ok:false,text:'安心不足18，先歇一歇，再交出珍贵旧物。'};
if(id==='letter'&&s.day<4)return {ok:false,text:'来信还在路上，第4天再来。'};
if(id==='confirm'&&(s.chains.length<3||s.trust<55))return {ok:false,text:'正式核验需要三条证据链和信任55。'};
if(id==='visit'&&s.wait!==null)return {ok:false,text:'回访已预约，耐心等候两天。'};
const known=['repair','cloth','photo','bag','file','letter','notice','album','visit','rest','help','rush','confirm'];if(!known.includes(id))return {ok:false,text:'未知操作。'};
s.ap--;s.used.push(id);let t='';
switch(id){case'bag':this.give(s,2);t='物证袋里找到旧渡票：请与渡口的停航记录一起核对。';break;
case'repair':this.give(s,1);this.apply(s,{calm:-18,trust:5});t='你把珍贵的小鱼交给何师傅比对。修补账页上，出现了“小满”和沈青的名字。';break;
case'cloth':this.give(s,4);this.apply(s,{calm:-7,trust:3});t='唐阿姨找出三朵花的兔子布样。试着与协作室的寻人留档连接。';break;
case'photo':this.give(s,8);this.give(s,7);this.apply(s,{calm:-5});t='旧照解释了门牌改号；“去旧车站”的说法只是转述，先别当结论。';break;
case'file':this.give(s,5);this.apply(s,{calm:-7,trust:3});t='陈老师在授权范围内出示寻人留档。三朵花的布兔，和旧街布样吻合。';break;
case'letter':this.give(s,10);this.apply(s,{calm:10});t='林姐姐读来信：“小满，我也一直在找你。”地址由社工保管，等待正式核验。';break;
case'notice':this.give(s,3);this.apply(s,{calm:-6});t='原来那天停航！旧渡票与停航记录可以解释当年的改道。';break;
case'album':this.give(s,6);this.apply(s,{calm:-4});t='照片背影很相像，但相貌不能证明亲属关系。';break;
case'visit':this.give(s,9);s.wait=s.day+2;this.apply(s,{trust:4});t='许伯伯答应回访。两天后由林姐姐转交结果，不必反复跑。';break;
case'rest':this.apply(s,{calm:25,trust:2});t='回到周奶奶的小桌边喝碗热汤。安心+25，信任+2。';break;
case'help':this.apply(s,{calm:-4,trust:12});t='和小禾一起整理资料，只把可核对的信息交给协作员。信任+12。';break;
case'rush':this.give(s,7);this.apply(s,{calm:-22,trust:-18});t='追着传闻跑了一圈，只有更多模糊说法。安心−22，信任−18。';break;
case'confirm':s.confirmed=true;this.apply(s,{calm:10});t='三组证据交给协作员，正式核验已完成。现在可以回家，迎接团圆。';break;}
this.log(s,t);return{ok:true,text:t}},
link(s,a,b,index){if(!this.ready(s)||s.ap<1)return{ok:false,text:'今天没有可用脚步，先结算。'};if(a===b||![a,b].every(x=>s.clues.includes(x))||!Number.isInteger(index)||index<0||index>3)return{ok:false,text:'请选择两条不同的已取得线索和一个关系。'};if(s.chains.includes(index))return{ok:false,text:'这条证据链已经核实，不必重复。'};s.ap--;const ch=this.chains[index];let good=ch.pair&&ch.pair.every(x=>[a,b].includes(x));let t;if(good){s.chains.push(index);this.apply(s,{calm:8,trust:5});t='已核实：'+ch.desc}else{this.apply(s,{calm:-10});t='证据尚不支持这个关系。'+(index===3?ch.desc:'看一看来源与物件描述，找到能相互印证的那一对。')};this.log(s,t);return{ok:!!good,text:t}},
event(s){return this.events.findIndex((e,i)=>!s.events.includes(i)&&e.test(s))},
night(s){if(!this.ready(s))return false;let i=this.event(s);s.pending=i<0?24:i;return true},
settle(s,choice){if(s.pending===null||s.ended||![0,1].includes(choice))return false;let i=s.pending,e=this.events[i];if(e){let ch=e.options[choice];this.apply(s,ch.e);if(ch.give!==undefined)this.give(s,ch.give);if(ch.wait)s.wait=s.day+2;s.events.push(i);this.log(s,e.title+'：'+ch.name)}else{this.apply(s,choice?{trust:3}:{calm:8});this.log(s,'小镇夜灯亮了。明天再继续。')};s.pending=null;
if(s.wait!==null&&s.day+1>=s.wait){this.give(s,11);s.wait=null;this.apply(s,{trust:5});this.log(s,'两日前的回访有了回音：许伯伯送来改签去向。')}
if(s.confirmed)s.ended='reunion';else if(s.calm<=0||s.trust<15)s.ended='shelter';else if(s.day>=10)s.ended=s.chains.length?'hope':'shelter';else{s.day++;s.ap=3;s.used=[];this.apply(s,{calm:4})}return true},
valid(s){return !!s&&s.version===1&&Number.isInteger(s.day)&&s.day>=1&&s.day<=10&&Number.isInteger(s.ap)&&s.ap>=0&&s.ap<=3&&['calm','trust'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)&&this.locations.some(l=>l.id===s.loc)&&['clues','chains','events','used','log'].every(k=>Array.isArray(s[k]))&&s.clues.length<=12&&s.clues.includes(0)&&s.clues.every(n=>Number.isInteger(n)&&n>=0&&n<12)&&new Set(s.clues).size===s.clues.length&&s.chains.every(n=>Number.isInteger(n)&&n>=0&&n<3&&this.chains[n].pair.every(x=>s.clues.includes(x)))&&new Set(s.chains).size===s.chains.length&&s.events.every(n=>Number.isInteger(n)&&n>=0&&n<24)&&s.used.every(x=>typeof x==='string'&&x.length<20)&&s.log.length<=60&&s.log.every(x=>typeof x==='string'&&x.length<=500)&&typeof s.last==='string'&&s.last.length<1000&&(s.pending===null||Number.isInteger(s.pending)&&s.pending>=0&&s.pending<=24)&&(s.wait===null||Number.isInteger(s.wait)&&s.wait>=1&&s.wait<=12)&&typeof s.confirmed==='boolean'&&(!s.confirmed||s.chains.length===3)&&(s.ended===null||['reunion','hope','shelter'].includes(s.ended))}
};
const ev=(title,text,test,a,ae,b,be,more={})=>({title,text,test,options:[{name:a,e:ae,...(more.a||{})},{name:b,e:be,...(more.b||{})}]});
E.events=[
ev('小鱼上的记号','林姐姐问：先听你讲记忆，还是先整理旧物？',s=>s.day===1,'慢慢讲给她听',{calm:8,trust:4},'先整理旧物',{trust:7,calm:-2}),
ev('旧物要不要离手','何师傅想留下小鱼做拓印，社工会保管交接。',s=>s.clues.includes(1),'同意留拓印',{trust:7,calm:-5},'今天先带回去',{calm:8}),
ev('被转述的方向','有人指向旧车站，但那是第三个人转述的话。',s=>s.clues.includes(7),'请协作员核查',{trust:8},'马上追过去',{calm:-15,trust:-7}),
ev('一碗热汤','周奶奶为你留了汤，桌边还有半小时安静时光。',s=>s.calm<45,'坐下休息',{calm:18},'一起整理资料',{calm:5,trust:6}),
ev('雨又落下来','渡口台阶湿滑，许伯伯建议改成电话回访。',s=>s.loc==='pier'&&s.day>=2,'委托社工回访',{trust:6},'今天先回去',{calm:8}),
ev('三朵小红花','唐阿姨记得有人反复挑选同样的布。',s=>s.clues.includes(4),'请她写下细节',{trust:6,calm:-3},'先不打扰',{calm:9}),
ev('授权的边界','协作员问能否在内部寻找记录里补上旧物特征。',s=>s.clues.includes(5),'只留物件特征',{trust:8},'贴出详细住址',{trust:-15,calm:-5}),
ev('远处来的信','林姐姐收到一封转交信，提到小鱼与旧兔子。',s=>s.day>=4&&!s.clues.includes(10),'一起读信',{calm:10,trust:4},'明天再读',{calm:7},{a:{give:10}}),
ev('同一张背影','相册里那个孩子像你，但围巾样式很常见。',s=>s.clues.includes(6),'标记为待核实',{trust:6},'直接叫对方家人',{trust:-13,calm:-10}),
ev('迟来的回音','回访需要等到两天后，急也不会更快。',s=>s.wait!==null,'耐心等待',{calm:9,trust:4},'反复催问',{calm:-8,trust:-4}),
ev('第一根线连上了','你终于把两件小事拼成可核实的故事。',s=>s.chains.length>=1,'画进关系树',{calm:10},'请社工复核',{trust:7}),
ev('小禾的旧照片','门牌改过号，旧照片能帮助找到当年修补铺。',s=>s.day>=3&&!s.clues.includes(8),'一起认门牌',{trust:4,calm:-3},'留到下次',{calm:7},{a:{give:8}}),
ev('不愿再失望','你担心这一次还是找错。林姐姐没有催你。',s=>s.day>=5&&s.calm<65,'说出担心',{calm:14,trust:4},'把话藏起来',{calm:-5,trust:2}),
ev('资料里的空白','有些细节只能通过正式核验确认。',s=>s.chains.length===2,'保留空白',{trust:8},'补上自己的猜想',{trust:-10}),
ev('北岸的方向','改签去向已经送到。原来旧记忆没有错，只是少了一段路。',s=>s.clues.includes(11),'谢谢许伯伯',{trust:6,calm:5},'继续整理路线',{trust:9,calm:-4}),
ev('风吹起旧票','渡票褪色的地方，林姐姐帮你装上透明保护套。',s=>s.clues.includes(2)&&s.day>=3,'认真收好',{calm:10},'誊抄日期',{trust:6}),
ev('巷口的热心人','对方想把整段经历发到公开群里。',s=>s.loc==='street'&&s.day>=4,'只经社工联系',{trust:10},'把全部资料公开',{trust:-18,calm:-5}),
ev('寻找也是双向的','留档说明对方也在找你，并非所有等待都没有回声。',s=>s.clues.includes(10),'写一张回信',{calm:12,trust:4},'等核验再写',{trust:7}),
ev('重新认识记忆','童年的记忆很珍贵，但有些日期可能记混。',s=>s.day>=6,'以记录交叉核对',{trust:9},'只信第一印象',{calm:-6,trust:-7}),
ev('三组依据齐了','现在可以交给协作员，安排正式核验。',s=>s.chains.length===3&&!s.confirmed,'准备资料',{trust:10,calm:5},'先安顿心情',{calm:16}),
ev('门前的小灯','周奶奶告诉你，今晚这里仍会留着灯。',s=>s.day>=7,'陪她吃晚饭',{calm:16},'帮她收拾',{calm:5,trust:7}),
ev('还没有答案','没有结论的今天，也可以记录已经排除的误会。',s=>s.day>=8&&s.chains.length<2,'写下排除理由',{trust:8},'休息一晚',{calm:13}),
ev('下一次约定','林姐姐会在十天后继续转交消息，寻找不会被倒计时抹去。',s=>s.day>=9,'留下回访约定',{trust:9,calm:6},'先照顾自己',{calm:16}),
ev('最后一页空白','结局不是一次猜测，而是你怎样对待线索与自己。',s=>s.day>=10,'整理到此为止',{trust:5},'把小鱼收好',{calm:10})
];
if(typeof module!=='undefined')module.exports=E;
