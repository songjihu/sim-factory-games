'use strict';
const VERSION='1.0.0', SAVE_KEY='G148-campus-heart-v1';
const PEOPLE=[{name:'林屿',role:'文学系 · 21岁',place:'library',like:'书页里的批注',hint:'比起热闹，更喜欢安静地一起做一件事。',date:'旧书展',need:12},{name:'周野',role:'建筑系 · 21岁',place:'court',like:'赛场边的鼓励',hint:'比赛结束后，他会先找那个说好要来的人。',date:'秋季友谊赛',need:10},{name:'沈知白',role:'音乐系 · 22岁',place:'music',like:'未完成的旋律',hint:'他希望作品被认真听完，而不是只被夸好听。',date:'双人排练',need:16}];
const PLACES=[['library','图书馆','林屿 · 安静的共同时间'],['court','篮球场','周野 · 一起迎风奔跑'],['music','排练室','沈知白 · 听见未说的话'],['quad','教学广场','课程 · 兼职 · 宿舍来信'],['lake','湖边长椅','休息 · 写下自己的心事'],['festival','校园祭','筹备 · 学期末的舞台']];
const fresh=()=>({schema:1,version:VERSION,week:1,ap:2,energy:75,study:35,money:35,craft:0,heart:[5,5,5],trust:[0,0,0],mem:[0,0,0],known:[false,false,false],visits:[0,0,0],promise:null,done:[],log:['新学期开始，你搬进了南汐大学的女生宿舍。'],ended:false,ending:'',eventWeek:0,eventText:'',revision:0});
const clamp=(v,min=0,max=100)=>Math.min(max,Math.max(min,v));
function add(s,e){for(const[k,v]of Object.entries(e)){if(['energy','study','money','craft'].includes(k))s[k]=clamp(s[k]+v,0,k==='money'?999:100)} }
function relate(s,i,h,t=0,m=0){s.heart[i]=clamp(s.heart[i]+h);s.trust[i]=clamp(s.trust[i]+t);s.mem[i]=clamp(s.mem[i]+m,0,20)}
function valid(s){if(!s||s.schema!==1||s.version!==VERSION)throw Error('存档版本不兼容');for(const k of ['week','ap','energy','study','money','craft','revision','eventWeek'])if(!Number.isInteger(s[k]))throw Error('存档数值损坏');if(typeof s.eventText!=='string'||s.eventWeek<0||s.eventWeek>s.week)throw Error('每周剧情存档损坏');if(s.week<1||s.week>13||s.ap<0||s.ap>2||s.energy<0||s.energy>100||s.study<0||s.study>100||s.money<0||s.money>999||s.craft<0||s.craft>100||s.revision<0)throw Error('存档数值越界');for(const k of ['heart','trust','mem','visits'])if(!Array.isArray(s[k])||s[k].length!==3||s[k].some(x=>!Number.isInteger(x)||x<0||x>(k==='mem'?20:k==='visits'?30:100)))throw Error('关系存档损坏');if(!Array.isArray(s.known)||s.known.length!==3||s.known.some(x=>typeof x!=='boolean')||!Array.isArray(s.done)||s.done.some(x=>typeof x!=='string')||!Array.isArray(s.log)||s.log.some(x=>typeof x!=='string')||typeof s.ended!=='boolean'||typeof s.ending!=='string')throw Error('存档结构损坏');if(s.promise!==null&&(!Number.isInteger(s.promise.i)||s.promise.i<0||s.promise.i>2||![s.week,s.week+1].includes(s.promise.week)))throw Error('约定记录损坏');return s}
function note(s,t){s.log.unshift(t);s.log=s.log.slice(0,40)}
function act(s,type,i){if(s.ended)throw Error('本局已结束');if(s.ap<=0)throw Error('本周时间已用完，请进入下一周');let msg='';
if(type==='meet'){if(s.energy<12)throw Error('精力不足12，请先休息');add(s,{energy:-12});s.visits[i]++;relate(s,i,7,4);msg=['你和林屿并肩读完一章书。他把最喜欢的一句留给你看。','你替周野记下练习数据。他认真地问，下次你还会来吗？','沈知白把耳机递过来，第一次让你听见他的未完成曲。'][i]}
if(type==='listen'){if(s.energy<8)throw Error('精力不足8，请先休息');add(s,{energy:-8});s.known[i]=true;relate(s,i,3,7);msg=PEOPLE[i].hint+' 你把这个偏好记住了。'}
if(type==='promise'){if(s.promise)throw Error('本周已有待兑现的约定');if(s.week>=12)throw Error('本学期已经没有下一周可预约');if(s.money<10)throw Error('零花不足10，请先兼职');add(s,{money:-10});s.promise={i,week:s.week+1};msg='你和'+PEOPLE[i].name+'约好下周去'+PEOPLE[i].date+'。已预留10零花；下周兑现会用一次行动和15精力。'}
if(type==='study'){if(s.energy<12)throw Error('精力不足12，请先休息');add(s,{energy:-12,study:12});msg='你完成了一份认真打磨的课程作业。学业+12。'}
if(type==='work'){if(s.energy<18)throw Error('精力不足18，请先休息');add(s,{energy:-18,money:22});msg='在校园书店值班半天，零花+22，精力−18。'}
if(type==='rest'){add(s,{energy:30});msg='湖面映着云。你暂时放下别人的期待，精力+30。'}
if(type==='craft'){if(s.energy<15||s.money<8)throw Error('筹备需要15精力与8零花');add(s,{energy:-15,money:-8,craft:14});msg='你和社长顾言把校园祭的展台搭好了一角。作品+14。'}
if(type==='keep'){if(!s.promise||![s.week,s.week+1].includes(s.promise.week))throw Error('当前没有可以兑现的约定');if(s.energy<15)throw Error('赴约需要15精力，请先休息');i=s.promise.i;add(s,{energy:-15});relate(s,i,s.known[i]?16:9,s.known[i]?14:8,1);msg='你如约来到'+PEOPLE[i].date+'。'+(s.known[i]?'你记得他的偏好，他也记得你说过的话。':'你们仍在试探彼此的节奏。')+' 获得一段共同回忆。';s.promise=null}
if(!msg)throw Error('未知行动');s.ap--;note(s,msg);return msg}
function next(s){if(s.ended)throw Error('本局已结束');if(s.promise&&s.promise.week===s.week){relate(s,s.promise.i,-8,-16);note(s,'你没能赴约，'+PEOPLE[s.promise.i].name+'的信任−16。');s.promise=null}add(s,{energy:16,study:-3,money:5});s.week++;s.ap=2;if(s.energy===0){s.ended=true;s.ending='先照顾好自己｜暂停学期，给身心一段恢复的时间。'}return s.week}
function finish(s,i){if(typeof s.eventText!=='string'||s.eventWeek<0||s.eventWeek>s.week)throw Error('每周剧情存档损坏');if(s.week<13)throw Error('学期尚未结束');s.ended=true;if(s.study<50)s.ending='慢一点也没关系｜你收到了补考通知。唐糖陪你重排复习表，心动的故事留待下学期。';else if(i>=0&&s.heart[i]>=65&&s.trust[i]>=50&&s.mem[i]>=2)s.ending='双向奔赴 · '+PEOPLE[i].name+'｜'+['林屿把写给你的批注夹进书页：下学期，我们一起把故事读完。','周野赛后没有冲向庆功的人群，而是走向你：以后每一场，都想给你留一个位置。','沈知白在返场时弹起你们改过的旋律：这首歌，还有下一段想和你一起写。'][i];else if(i>=0)s.ending='把心意留给风 · '+PEOPLE[i].name+'｜他珍惜这段相处，却还没有准备好开始恋爱。你尊重他的答案，故事停在真诚的朋友。';else s.ending=s.craft>=42?'各自闪耀｜作品在校园祭亮相，你也找到了喜欢的方向。独自向前，同样是值得记住的结局。':'这一页叫成长｜课程顺利结项，你和新朋友们一起走过学期。未来还有许多未完成。';note(s,s.ending);return s.ending}
const choice=(text,e,i=null,h=0,t=0)=>({text,e,i,h,t});
const EVENTS=[
['first','开学 · 错拿的笔记','图书馆借阅台前，一本写满批注的书落进了你的袋子。',1,1,0,()=>true,[choice('当面归还，问问那句批注',{},0,5,5),choice('交给服务台，先去赶课',{study:5}),choice('留张字条，约好归还时间',{},0,3,7)]],
['flyer','球场 · 风吹来的传单','周野的社团传单被风卷走，他正忙着拦住滚向路边的球。',2,3,1,()=>true,[choice('帮他收传单',{energy:-5},1,7,4),choice('替他向路人说明比赛',{energy:-3},1,4,6),choice('示意他先收好，自己去上课',{study:4})]],
['melody','排练室 · 没弹完的和弦','门没有关紧，琴声停在一个迟疑的和弦上。沈知白抬头看见了你。',2,4,2,()=>true,[choice('问他希望这首歌表达什么',{},2,4,7),choice('说刚才的停顿也很好听',{},2,6,2),choice('轻轻带上门，让他继续',{energy:5},2,1,4)]],
['room','宿舍 · 唐糖的夜宵','室友唐糖问你：这学期最想留下什么？',2,5,3,()=>true,[choice('一段认真相处的关系',{energy:8}),choice('一份能拿出手的作品',{craft:7}),choice('把自己的课业先做好',{study:7})]],
['rain','图书馆 · 突然下雨','林屿只有一把伞，你的作业还有最后一页。',3,7,0,s=>s.visits[0]>0,[choice('一起等雨停，先完成作业',{study:5},0,5,5),choice('借伞赶回宿舍，明天归还',{},0,3,6),choice('冒雨跑回去',{energy:-8},0,2,0)]],
['match','球场 · 替补席','周野今天没有上场。他把失落藏在一句玩笑里。',3,8,1,s=>s.visits[1]>0,[choice('问他想不想聊聊',{},1,3,8),choice('陪他练一组投篮',{energy:-7},1,8,4),choice('说下次一定赢，匆匆离开',{},1,2,-2)]],
['demo','排练室 · 试听邀请','沈知白发来一段小样，想听具体反馈。',3,8,2,s=>s.visits[2]>0,[choice('写下喜欢的段落与疑问',{energy:-5},2,6,8),choice('只回一句很好听',{},2,3,0),choice('说明在赶作业，明天认真听',{study:4},2,1,5)]],
['quiz','课程 · 突击小测','程老师宣布周五小测。你的复习计划被打乱。',4,4,3,()=>true,[choice('集中补习一晚',{energy:-10,study:12}),choice('和同学互相讲题',{energy:-5,study:7}),choice('这次先凭已有知识',{study:-4,energy:5})]],
['margin','图书馆 · 页边的一句话','林屿翻到一处划线，问你是否也有不同答案。',4,9,0,s=>s.trust[0]>=10,[choice('坦白自己的理解',{},0,5,8),choice('请他再讲一遍',{},0,4,5),choice('顺着他的说法回答',{},0,4,-3)]],
['shoes','球场 · 旧球鞋','周野想把第一双比赛鞋修好，大家却说换新的更方便。',4,9,1,s=>s.trust[1]>=10,[choice('陪他找修鞋店',{money:-5},1,7,7),choice('听他讲这双鞋的来历',{},1,3,8),choice('劝他直接买新的',{},1,1,-3)]],
['silence','排练室 · 安静的十分钟','沈知白说今天不想谈作品，只想坐一会。',4,9,2,s=>s.trust[2]>=10,[choice('坐在旁边，不急着填满沉默',{energy:4},2,5,8),choice('问要不要去湖边走走',{energy:-4},2,6,5),choice('不断讲笑话让他开心',{},2,2,-3)]],
['budget','生活 · 月末余额','这周有聚餐邀请，零花却有些吃紧。',5,9,3,s=>s.money<30,[choice('说明预算，下次再约',{energy:5}),choice('接书店临时班',{energy:-12,money:18}),choice('用10零花参加',{money:-10,energy:8})]],
['poster','校园祭 · 海报署名','社长顾言差点漏掉你的署名。',5,9,5,s=>s.craft>0,[choice('拿出草稿，平静说明贡献',{craft:8}),choice('先完成交付，再约时间谈',{energy:-5,craft:5}),choice('觉得麻烦，保持沉默',{craft:-3,energy:-3})]],
['mid','期中 · 成绩单','成绩公布了。程老师提醒，喜欢一个人时也别丢下自己的目标。',6,6,3,()=>true,[choice('重新安排固定自习',{study:10,energy:-8}),choice('向同学请教薄弱章节',{study:6}),choice('先休息，再找节奏',{energy:15})]],
['book','图书馆 · 旧书展门票','林屿提到周末的旧书展，有一整架绝版诗集。',6,10,0,s=>s.known[0],[choice('说你记得他喜欢的书',{},0,8,8),choice('聊聊自己的阅读清单',{study:3},0,5,5),choice('今天只想安静看书',{energy:5},0,1,4)]],
['cheer','球场 · 看台空位','比赛快开始了，周野朝看台上你站的位置挥手。',6,10,1,s=>s.known[1],[choice('认真看完比赛',{energy:-5},1,8,8),choice('帮忙拍一组比赛照',{craft:4},1,5,6),choice('先告诉他你需要提前走',{study:4},1,1,5)]],
['lyrics','排练室 · 你写的句子','沈知白想把你随口说的话写进歌词，先来征求同意。',6,10,2,s=>s.known[2],[choice('同意，也一起改一改',{craft:5},2,7,8),choice('希望保留为两人的私事',{},2,3,8),choice('婉拒，但感谢他询问',{},2,2,6)]],
['gossip','校园 · 传言','有人把你和他的合照发进群聊，配上了自作主张的标题。',7,10,3,s=>Math.max(...s.heart)>=30,[choice('先问对方想怎样处理',{energy:-3}),choice('说明只是私人相处，请停止传播',{energy:-5,craft:3}),choice('不回应，先关掉消息',{energy:5})]],
['tired','湖边 · 心事太满','你发现自己开始按别人的消息安排整天。',5,11,4,s=>s.energy<40,[choice('留一个只属于自己的下午',{energy:20}),choice('把安排写下来，删去一件',{energy:10,study:3}),choice('给唐糖打电话聊一聊',{energy:12})]],
['boundary','关系 · 被尊重的拒绝','对方邀请你临时出门，你已经约好和室友做作业。',7,11,3,s=>Math.max(...s.trust)>=20,[choice('说明已有安排，另约时间',{study:5}),choice('邀请大家一起完成作业',{study:3,energy:-3}),choice('放下作业立刻出门',{study:-7,energy:-5})]],
['mentor','课程 · 展示机会','程老师愿意让你代表小组做展示，但准备需要时间。',8,8,3,()=>true,[choice('承担展示，认真准备',{energy:-10,study:12,craft:5}),choice('与组员共同上台',{energy:-5,study:7}),choice('负责幕后资料整理',{study:5,craft:3})]],
['letter','图书馆 · 没寄出的信','林屿写了很久的信，还没想好要不要寄给远方的家人。',8,11,0,s=>s.trust[0]>=25,[choice('听他把想说的话说完',{},0,5,9),choice('分享自己的犹豫',{},0,7,7),choice('替他做决定',{},0,1,-5)]],
['injury','球场 · 暂停练习','周野今天只坐在场边，他答应过队友不再逞强。',8,11,1,s=>s.trust[1]>=25,[choice('陪他看队友训练',{energy:3},1,5,9),choice('聊比赛之外的爱好',{},1,7,6),choice('起哄让他再投一个',{},1,0,-7)]],
['stage','排练室 · 演出焦虑','沈知白担心自己的新歌不够讨喜。',8,11,2,s=>s.trust[2]>=25,[choice('说出你听见的真实感受',{},2,5,9),choice('陪他再排练一次',{energy:-7,craft:4},2,7,6),choice('保证所有人都会喜欢',{},2,3,-3)]],
['fair','校园祭 · 展位取舍','展位预算有限，顾言问该保留互动还是布景。',9,9,5,()=>true,[choice('保留互动，自己制作布景',{energy:-10,craft:12}),choice('简化规模，把核心做好',{craft:7}),choice('追加12零花升级布景',{money:-12,craft:12})]],
['future','湖边 · 下学期的计划','晚风里，你开始想象自己明年的样子。',9,11,4,()=>true,[choice('申请一直想去的课程',{study:7}),choice('做一份自己的创作',{craft:7}),choice('给未来的自己写信',{energy:10})]],
['photo','校园 · 合影之前','唐糖举起相机，问你要站在谁的旁边。',10,10,3,()=>true,[choice('林屿旁边',{},0,5,3),choice('周野旁边',{},1,5,3),choice('沈知白旁边',{},2,5,3)]],
['final','期末 · 最后一份作业','最后期限临近，图书馆比平时亮得更晚。',11,11,0,()=>true,[choice('先完成自己的课程结项',{energy:-8,study:12}),choice('分工核对，各自完成',{energy:-4,study:7}),choice('把精力留给校园祭',{craft:8,study:-5})]],
['festival','校园祭 · 灯亮的时候','舞台亮起来，你在来往的人群里看见熟悉的身影。',12,12,5,()=>true,[choice('把作品留在展台上',{craft:8}),choice('给朋友们留一张合照',{energy:8}),choice('去湖边，整理想说的话',{energy:10})]],
['ordinary','湖边 · 普通的一天','没有大事发生。你可以决定这一页记下什么。',1,12,4,()=>true,[choice('写一点自己的心事',{energy:8}),choice('整理课堂笔记',{study:4}),choice('给作品补上一笔',{craft:4})]]];
function eventFor(s){return EVENTS.find(e=>!s.done.includes(e[0])&&s.week>=e[3]&&s.week<=e[4]&&e[6](s))||EVENTS.at(-1)}
function resolve(s,id,k){if(s.eventWeek===s.week)throw Error('本周来信已经处理');const e=EVENTS.find(e=>e[0]===id);if(!e||k<0||k>=e[7].length||s.done.includes(id)&&id!=='ordinary')throw Error('事件已处理');const c=e[7][k];for(const key of ['money','energy'])if((c.e[key]||0)<0&&s[key]<-c.e[key])throw Error(key==='money'?'零花不足，换个选择吧':'精力不足，换个选择吧');add(s,c.e);if(c.i!==null)relate(s,c.i,c.h,c.t);if(id!=='ordinary')s.done.push(id);s.eventWeek=s.week;s.eventText=e[1]+'：'+c.text;note(s,s.eventText);return c.text}
if(typeof module!=='undefined')module.exports={VERSION,SAVE_KEY,PEOPLE,PLACES,fresh,valid,act,next,finish,eventFor,resolve,EVENTS};
