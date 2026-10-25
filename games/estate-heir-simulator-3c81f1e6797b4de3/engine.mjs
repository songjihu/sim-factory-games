export const VERSION='1.0.0', GAME='G105', KEY='G105-estate-save-v2';
export const PEOPLE=[['沈毓','祖母','重视庄园秩序'],['沈岚','姑母','在意家族体面'],['沈越','堂弟','期待得到机会'],['许知微','财务主管','坚持账目边界'],['周衡','庄园总管','看重安排兑现'],['罗晴','员工代表','关心休息与士气']];
export const TEAMS=[['礼宾组','接待'],['工程组','维保'],['园艺组','温室']];
export const JOBS=[['接待','安排访客与晚宴',0,{order:3},1],['维保','提前处理设备隐患',4,{order:7},4],['温室','修整花房与展区',3,{order:3,morale:2},2],['休整','给团队补回休息',0,{morale:5},5]];
const C=(label,effect,why,extra={})=>({label,effect,why,...extra});
const E=(id,day,who,scene,title,text,choices,when=()=>true)=>({id,day,who,scene,title,text,choices,when});
export const EVENTS=[
 E('ledger',1,3,'study','第一笔签字权','你接管庄园的第一天，账册上有一笔没有说明的家族招待费。',[
 C('公开复核全部招待费',{cash:4,order:3,r3:7,r1:-4},'财务开始复核。姑母认为你让家人难堪。',{flag:'audit'}),C('暂时封存，先维持体面',{order:2,r1:6,r3:-6},'姑母替你圆场，但财务记下了这次让步。',{flag:'sealed'}),C('自掏专项预算补齐凭证',{cash:-8,r1:3,r3:3},'问题被平稳处理，代价由庄园现金承担。')]),
 E('room',1,2,'hall','同一间会客厅','堂弟要在会客厅拍短片，祖母却已约好老友喝茶。谁的日程优先，由你决定。',[
 C('按预约，把拍摄改到下午',{order:5,r0:5,r2:-4},'祖母的预约得到尊重，堂弟不太服气。'),C('让堂弟先拍，请祖母换房间',{r2:7,r0:-6,order:-3},'年轻人的项目开了头，祖母记住了被临时换房。'),C('加开布景，分区使用',{cash:-6,r0:2,r2:3},'两边都留下来，但多花了一笔布景费用。')]),
 E('orchid',2,2,'garden','温室还是派对','堂弟想把温室改成周末派对场地，园艺师提醒兰花经不起连夜搬动。',[
 C('保留温室，另找派对地点',{r2:-3,morale:4,r5:4},'兰花不用搬家，员工松了一口气。',{flag:'flowers'}),C('批准派对，安排夜间搬花',{cash:-5,morale:-6,r2:8},'堂弟很高兴，搬运班却要加班。',{flag:'party'}),C('只开放外廊，设人数上限',{cash:-3,order:3,r2:2},'派对缩小规模，温室保住了。')]),
 E('leave',2,5,'hall','一张调休单','礼宾组连续接待，罗晴带来三份调休申请。今晚还有客人。',[
 C('批调休，付费请临时礼宾',{cash:-7,morale:7,r5:6},'休假落实，临时人手填上空缺。'),C('本周先顶住，明天补偿',{morale:-3,r5:-2},'罗晴把明天的补偿写进了工作群。',{delay:{after:1,need:6,ok:{cash:-6,morale:9,r5:6},bad:{morale:-12,r5:-10},text:'补休承诺：支付6现金安排替班'}}),C('精简接待，今晚按时下班',{order:-4,morale:5,r1:-3},'晚宴少了几道流程，员工准时离岗。')]),
 E('car',2,4,'hall','两份用车单','祖母复诊与姑母接机撞在同一时段。车队只够一边。',[
 C('先安排复诊，接机外包',{cash:-6,r0:6,r1:1},'两份行程都有了落点。'),C('先接机，改约复诊',{r1:7,r0:-8,order:-3},'姑母满意，祖母对改约很不高兴。'),C('借合作方的车，欠个人情',{order:2,r4:3,r3:-3},'周衡协调到车辆，财务担心人情账。')]),
 E('gift',2,1,'garden','太贵的伴手礼','姑母想把接待礼升级，财务说这会吞掉一整天的周转金。',[
 C('用温室花束代替',{cash:-2,r1:-2,morale:2},'礼物有庄园特色，姑母觉得不够排场。'),C('照单升级礼盒',{cash:-11,r1:8,r3:-4},'体面保住了，财务要求你盯紧余额。'),C('只为主要客人保留礼盒',{cash:-5,order:3,r1:2},'礼单压缩后，接待仍然完整。')]),
 E('storm',3,4,'study','暴雨前的屋顶','维修队发现旧翼屋顶渗水。今晚可能下雨。',[
 C('立即抢修旧翼',{cash:-9,order:8,r4:6},'屋顶补好了，维修队也有了清晰优先级。'),C('关闭旧翼，调换客房',{order:-3,cash:2,r1:-4},'避免继续花钱，客房安排变得紧张。'),C('先做应急挡雨，明天补修',{cash:-3,order:3},'挡雨布只是临时办法，明天仍需支付。',{delay:{after:1,need:5,ok:{cash:-5,order:7,r4:3},bad:{order:-13,r4:-8},text:'屋顶补修：预留5现金'}})]),
 E('receipt',3,3,'study','复核有了回音','复核发现一笔重复报销，收款方是姑母介绍的供应商。',[
 C('追回款项，更换供应商',{cash:9,r3:7,r1:-7},'重复款退回来了，姑母认为你不留情面。'),C('给供应商一次整改机会',{cash:4,order:2,r1:2},'部分退款到账，合作暂时保留。'),C('不再追究，补齐制度',{r3:-4,r1:5,order:3},'你换来了短暂平静，但财务不认可这个结果。')],s=>s.flags.includes('audit')),
 E('sealed',3,3,'study','封存的账目被问起','员工听说家族招待费不用说明，开始质疑为什么调休费总要审批。',[
 C('重新公开账目',{order:4,r3:6,r1:-5,morale:3},'公开解释修复了一些信任。'),C('给员工加发补贴',{cash:-8,morale:6,r5:4},'补贴缓和了不满，但账目依旧没说清。'),C('坚持封存决定',{order:-4,morale:-7,r1:4},'家人暂时没有意见，员工沉默了。')],s=>s.flags.includes('sealed')),
 E('chef',3,5,'hall','主厨要走了','主厨收到了别处邀请。他想要的不是涨薪，而是固定休息日。',[
 C('签下轮休表，调整菜单',{cash:-4,morale:7,r5:5},'轮休写进安排，主厨决定留下。'),C('临时涨薪挽留',{cash:-8,morale:3,r3:-2},'主厨暂时留下，排班问题仍在。'),C('接受离职，简化宴会',{cash:3,order:-6,r1:-4},'省下开支，却失去了熟悉的厨房节奏。')]),
 E('guest',3,1,'hall','名单之外的客人','姑母临时加了八位客人，座位与预算都已排满。',[
 C('礼貌谢绝临时加席',{order:5,r1:-5,r3:4},'既定安排得以执行，姑母觉得没面子。'),C('增开一桌',{cash:-9,r1:7,morale:-3},'客人入席，礼宾忙得不可开交。'),C('改成小型茶会',{cash:-4,order:2,r1:2},'换了接待形式，大家都有了位置。')]),
 E('pitch',4,2,'garden','堂弟的第一份项目书','沈越想用庄园空置车库办摄影展，希望你拨启动金。',[
 C('拨小额试办，要求复盘',{cash:-5,r2:6,order:2},'他终于有机会证明自己，也知道需要交代结果。',{flag:'pilot'}),C('直接批准全部预算',{cash:-13,r2:10,r3:-5},'堂弟兴奋开工，财务质疑审批标准。',{flag:'bigshow'}),C('暂缓，先把本周事务做完',{cash:2,r2:-6,r3:3},'现金保住了，他把项目书收了回去。')]),
 E('privacy',4,0,'study','访客要看家族旧信','一位熟客想借旧信办展。祖母说，信里还有在世亲人的私事。',[
 C('仅提供经同意的节选',{cash:-3,r0:6,order:3},'展览能继续，私人部分仍由家人保管。'),C('拒绝出借',{r0:8,r1:-4},'祖母放心了，姑母要重新解释接待计划。'),C('全本交出换赞助',{cash:10,r0:-12,r1:3},'赞助到位，但祖母认为你越过了边界。')]),
 E('fatigue',4,5,'hall','员工开始出错','连续紧张让礼宾送错了房间，罗晴请求今天放慢接待。',[
 C('减少流程，安排轮休',{order:-3,morale:10,r5:7},'接待缩水，团队终于缓了过来。'),C('付费增援一晚',{cash:-8,morale:6,order:4},'多一组人手把错误收住了。'),C('按原计划执行',{order:-7,morale:-9,r5:-7},'勉强完成，更多人对下次安排失去信心。')],s=>s.morale<58),
 E('contract',4,3,'study','年度采购合同','供应商愿意降价，条件是一次预付三个月费用。',[
 C('只签本周订单',{cash:-3,r3:4},'单价高一点，周转金留在手里。'),C('预付换折扣',{cash:-12,order:7,r3:2},'采购暂时稳定，但余额更紧了。'),C('拆分两家供应',{cash:-5,order:4,r4:3},'流程复杂一点，临时断供风险降低了。')]),
 E('photos',4,1,'garden','客人发出了庄园照片','一张未获同意的花房合影被发到公开账号，家人意见不一。',[
 C('请客人移除私人部分',{r0:4,r1:-3,order:3},'边界讲清楚了，接待气氛有点尴尬。'),C('征求家人同意再保留',{cash:-2,r0:2,r1:2},'沟通花了时间，照片最终只留下公共场景。'),C('借热度扩大接待',{cash:6,r0:-7,morale:-4},'预约多了，家人和团队都担心被打扰。')]),
 E('pilotresult',5,2,'garden','试办展的复盘','堂弟按约带来收支表：规模小，账却算得清楚。',[
 C('按成果拨第二笔预算',{cash:-4,r2:8,r3:4},'小项目得到了有条件的继续支持。'),C('给他下一次独立负责权',{r2:6,order:4,r4:-2},'他学着自己协调，周衡担心还需磨合。'),C('先结清本次，不扩张',{cash:5,r2:-2,r3:5},'试办结余回到庄园，项目保持小规模。')],s=>s.flags.includes('pilot')),
 E('bigresult',5,3,'study','展览超支了','摄影展的临时设备费超过估算，财务把补款单放在你面前。',[
 C('补款并冻结扩张',{cash:-8,order:3,r2:-2,r3:5},'窟窿补上了，以后要先核成本。'),C('让堂弟自己协商缩减',{order:-4,r2:3,r3:3},'设备变少，他开始学着处理自己的承诺。'),C('继续加码撑场面',{cash:-14,r2:8,r3:-7},'展厅很漂亮，现金压力也更大了。')],s=>s.flags.includes('bigshow')),
 E('inventory',5,3,'study','仓库里的一批闲置品','盘点时发现几套多年未用的宴会器具。保留、转让还是改作员工休息区用品？',[
 C('转让闲置，补充周转金',{cash:6,r3:4,r0:-3},'空置的器具有了去处，祖母有一点舍不得。'),C('改作员工休息区用品',{cash:-2,morale:6,r5:5},'后台多了可用的桌椅，团队很珍惜。'),C('整理后保留备用',{order:4,r4:4},'仓库变得清楚，下次接待不必临时寻找。')]),
 E('sponsor',5,1,'hall','附带条件的赞助','合作方愿意资助周末晚宴，但想占用庄园一整周拍摄。',[
 C('限制在公共区域两天',{cash:7,order:2,r0:1},'收入少一点，私人空间留了下来。'),C('全盘接受',{cash:15,order:-8,r0:-6,morale:-4},'现金宽裕了，日常秩序受了影响。'),C('拒绝额外占用',{r0:5,r1:-4,order:4},'晚宴需自己筹备，家人保有安静。')]),
 E('flowers',5,4,'garden','保住的兰花开了','被留下的兰花正好赶上晚宴，园艺组希望用它做庄园主景。',[
 C('让园艺组署名布展',{cash:-2,morale:6,r5:4},'作品和劳动都被看见了。'),C('做小型赏花会',{cash:5,order:3,r0:3},'小而稳的接待带来了一笔结余。'),C('把鲜花送给姑母',{r1:7,r5:-3},'姑母喜欢这份心意，园艺师有些失落。')],s=>s.flags.includes('flowers')),
 E('party',5,5,'garden','派对后的草坪','派对结束，草坪受损，清理人员还在等你的安排。',[
 C('请专业团队修复',{cash:-7,order:6,morale:3},'损耗被认真处理，团队不用连夜补救。'),C('让堂弟带队恢复',{r2:-3,order:3,r5:5},'沈越第一次亲自收拾活动后果。'),C('推迟修复，照常接待',{order:-7,morale:-5,cash:2},'眼前省下现金，草坪问题留到了晚宴。')],s=>s.flags.includes('party')),
 E('pay',6,3,'study','结账日到了','厨房、运输和清洁的尾款一起到期。现金必须有先后。',[
 C('按期结清本周尾款',{cash:-10,order:7,morale:4,r3:5},'合作方和员工都看到你按约结账。'),C('协商分期，先付一半',{cash:-5,order:-2,r3:1},'现金压力缓了一点，信用账上多了说明。'),C('卖掉闲置摆件抵款',{cash:5,r0:-6,r3:3},'账结清了，祖母舍不得那些旧物。')]),
 E('rumor',6,0,'hall','谁来坐主位','家族会前有人传言，你只偏袒某一边。祖母要你解释这一周。',[
 C('公开日程和收支依据',{order:5,r0:4,r3:4},'你的决定有迹可循，争论开始回到事实。'),C('私下逐一谈，安排茶会',{cash:-5,r0:3,r1:3,r2:3},'各方听到了解释，但沟通也占了资源。'),C('强调最终决定权在你',{order:-3,r0:-5,r2:-4},'权力说清了，支持却没有增加。')]),
 E('bonus',6,5,'hall','晚宴前的奖励','罗晴建议把节余变成员工奖金；姑母想升级晚宴灯光。',[
 C('发放团队奖励',{cash:-7,morale:8,r5:7,r1:-2},'员工愿意再撑一把，晚宴保持原规格。'),C('升级灯光',{cash:-7,r1:7,morale:-3},'大厅更亮了，后台有人叹了口气。'),C('留作应急周转',{cash:2,r3:5,r5:-3},'余额更安全，但大家期待的回报落空了。')]),
 E('outage',6,4,'study','晚宴前突然停电','备用电源能撑住厨房或灯光，完整保障需要请外部电工。',[
 C('先保厨房，改成烛光晚宴',{order:3,r1:-2,morale:3},'晚宴形式变化，厨房仍能按时出餐。'),C('请外部电工全力保障',{cash:-8,order:8,r4:5},'故障及时处理，原计划得以继续。'),C('先保灯光，临时改冷餐',{r1:4,morale:-5,order:-3},'大厅依旧体面，厨房承受了临时变化。')]),
 E('vote',7,0,'hall','表决前最后一问','祖母问你：庄园今后靠一个人的威信，还是大家认可的安排？',[
 C('把预算与排班规则写下来',{order:5,r0:3,r3:4,r4:3},'决定成为可追踪的规则。'),C('设立家族与员工联席会',{morale:5,r2:3,r5:4,r1:-2},'更多人有机会说出诉求。'),C('所有事项继续由你亲批',{order:2,r0:2,morale:-6},'权力集中，团队也等着更多批示。')]),
 E('final',7,4,'hall','把钥匙交给谁','周衡把庄园钥匙放在桌上。最后一笔结余，你想留给哪里？',[
 C('留足下周周转',{cash:5,r3:4},'家族会议看到一份可继续执行的账。'),C('投入员工培训',{cash:-5,morale:7,r5:5,r4:3},'团队看到了下一周的成长空间。'),C('修复老宅纪念室',{cash:-6,order:5,r0:6},'祖母的旧物有了妥善安放之处。')]),
 E('reserve',7,3,'study','最后一道预算线','财务提醒，表决之外还有明天的水电与薪资。',[
 C('划出应急准备金',{cash:4,r3:5,r1:-2},'准备金让未来安排更稳。'),C('平分余力给家族与团队',{cash:-4,r1:3,r5:3},'两边都收到了一点心意。'),C('本周到此，不再新增安排',{order:3,r4:3},'既定事务完成，等待会议表决。')])
];
export const clamp=n=>Math.max(0,Math.min(100,n));
export function initial(seed=Date.now()%2147483647){return {schema:2,game:GAME,version:VERSION,seed,day:1,phase:'plan',cash:65,order:55,morale:58,rel:[52,48,45,51,52,48],flags:[],used:[],teams:[null,null,null],slot:0,current:null,log:[],pending:[],feedback:null,ending:null,rev:0};}
function note(s,t){s.log.unshift({day:s.day,text:t});s.log=s.log.slice(0,60);}
function effect(s,e){for(const [k,v]of Object.entries(e)){if(/^r[0-5]$/.test(k))s.rel[+k[1]]=clamp(s.rel[+k[1]]+v);else s[k]=clamp(s[k]+v);}}
export function votes(s){return s.rel.map((v,i)=>({name:PEOPLE[i][0],yes:v>=50&&(i!==3||s.cash>=15)&&(i!==4||s.order>=35)&&(i!==5||s.morale>=35)}));}
export function finish(s,failed=false){s.phase='end';const n=votes(s).filter(x=>x.yes).length;s.ending=failed?'试任提前终止':n>=5&&Math.min(s.cash,s.order,s.morale)>=35?'众望所归的执掌人':n>=4?'有条件的接班人':'钥匙暂交他人';note(s,`${s.ending} · ${n}/6票`);}
function broken(s){if(Math.min(s.cash,s.order,s.morale)<=0){finish(s,true);return true;}return false;}
export function assign(s,team,job){if(s.phase!=='plan'||!Number.isInteger(team)||!TEAMS[team]||(job!==null&&(!Number.isInteger(job)||!JOBS[job])))return false;s.teams[team]=job;return true;}
export function cost(s){return s.teams.reduce((n,j)=>n+(j===null?0:JOBS[j][2]),0);}
export function chooseEvent(s){const list=EVENTS.filter(e=>e.day===s.day&&!s.used.includes(e.id)&&e.when(s));if(!list.length)throw Error('事件池不足');const weighted=list.filter(e=>['receipt','sealed','pilotresult','bigresult','flowers','party','fatigue'].includes(e.id));const pool=s.slot===0&&weighted.length?weighted:list;const e=pool[(s.seed+s.day*7+s.slot*3)%pool.length];s.current=e.id;s.phase='event';}
export function startDay(s){if(s.phase!=='plan'||s.teams.includes(null))return {ok:false,message:'请为三支团队分别安排工作。'};if(cost(s)>s.cash)return {ok:false,message:'周转金不足，请减少维保或温室投入。'};s.cash-=cost(s);s.teams.forEach((j,i)=>{effect(s,JOBS[j][3]);s.rel[JOBS[j][4]]=clamp(s.rel[JOBS[j][4]]+2);if(TEAMS[i][1]===JOBS[j][0])effect(s,{order:3});});note(s,'今日排班：'+s.teams.map((j,i)=>`${TEAMS[i][0]}→${JOBS[j][0]}`).join('、'));s.slot=0;chooseEvent(s);return {ok:true};}
export function canChoose(s,c){return !c.effect.cash||c.effect.cash>=0||s.cash>=-c.effect.cash;}
export function decide(s,n){if(s.phase!=='event'||!Number.isInteger(n))return false;const e=EVENTS.find(e=>e.id===s.current),c=e?.choices[n];if(!c||!canChoose(s,c))return false;effect(s,c.effect);if(c.flag&&!s.flags.includes(c.flag))s.flags.push(c.flag);if(c.delay)s.pending.push({...c.delay,due:s.day+c.delay.after});s.used.push(e.id);note(s,`${e.title}：${c.label}`);s.feedback={title:c.label,text:c.why,effect:c.effect,scene:e.scene,promise:c.delay?.text||''};s.phase='feedback';return true;}
export function advance(s){if(s.phase==='feedback'){if(broken(s))return;s.slot++;if(s.slot<2){chooseEvent(s);return;}const results=[];effect(s,{cash:6,order:-4,morale:-4});results.push('庄园日常结余 +6现金；维护消耗 −4秩序、−4士气。');for(const p of s.pending.filter(p=>p.due<=s.day)){const ok=s.cash>=p.need;effect(s,ok?p.ok:p.bad);results.push(p.text+'：'+(ok?'已兑现':'余额不足，失约'));}s.pending=s.pending.filter(p=>p.due>s.day);note(s,results.join(' '));s.feedback={title:`第${s.day}天 · 日终账`,text:results.join('\n'),scene:s.day%2?'study':'garden',effect:{}};s.phase='night';broken(s);}else if(s.phase==='night'){if(s.day>=7){finish(s);return;}s.day++;s.teams=[null,null,null];s.phase='plan';s.feedback=null;}}
export function validate(s){const fail=()=>{throw Error('存档损坏或版本不兼容，当前进度未被替换。');};if(!s||s.schema!==2||s.game!==GAME||s.version!==VERSION||!Number.isInteger(s.seed)||s.seed<0||!Number.isInteger(s.day)||s.day<1||s.day>7||!['plan','event','feedback','night','end'].includes(s.phase))fail();for(const k of ['cash','order','morale'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>100)fail();if(!Array.isArray(s.rel)||s.rel.length!==6||s.rel.some(x=>!Number.isFinite(x)||x<0||x>100))fail();if(!Array.isArray(s.teams)||s.teams.length!==3||s.teams.some(x=>x!==null&&(!Number.isInteger(x)||x<0||x>3)))fail();if(!Number.isInteger(s.slot)||s.slot<0||s.slot>2||!Number.isSafeInteger(s.rev)||s.rev<0)fail();for(const k of ['flags','used'])if(!Array.isArray(s[k])||s[k].length>40||s[k].some(x=>typeof x!=='string'))fail();if(s.flags.some(x=>!['audit','sealed','flowers','party','pilot','bigshow'].includes(x))||s.used.some(x=>!EVENTS.some(e=>e.id===x))||new Set(s.used).size!==s.used.length)fail();if(!Array.isArray(s.log)||s.log.length>60||s.log.some(x=>!x||!Number.isInteger(x.day)||typeof x.text!=='string'||x.text.length>1200))fail();if(!Array.isArray(s.pending)||s.pending.length>5)fail();const allowed=EVENTS.flatMap(e=>e.choices.filter(c=>c.delay).map(c=>c.delay));for(const p of s.pending){if(!p||!Number.isInteger(p.due)||p.due<1||p.due>8||!allowed.some(a=>JSON.stringify({...a,due:p.due})===JSON.stringify(p)))fail();}if(s.phase==='event'&&!EVENTS.some(e=>e.id===s.current&&e.day===s.day&&!s.used.includes(e.id)&&e.when(s)))fail();if(['feedback','night'].includes(s.phase)&&(!s.feedback||typeof s.feedback.title!=='string'||typeof s.feedback.text!=='string'||!['hall','study','garden'].includes(s.feedback.scene)||s.feedback.text.length>2400))fail();if(s.feedback){if(typeof s.feedback.title!=='string'||s.feedback.title.length>160||typeof s.feedback.text!=='string'||s.feedback.text.length>2400||!['hall','study','garden'].includes(s.feedback.scene)||!s.feedback.effect||typeof s.feedback.effect!=='object'||Array.isArray(s.feedback.effect)||Object.entries(s.feedback.effect).some(([k,v])=>!['cash','order','morale','r0','r1','r2','r3','r4','r5'].includes(k)||!Number.isFinite(v)||Math.abs(v)>100)||(s.feedback.promise!==undefined&&(typeof s.feedback.promise!=='string'||s.feedback.promise.length>160)))fail();}if(s.phase==='end'&&!['试任提前终止','众望所归的执掌人','有条件的接班人','钥匙暂交他人'].includes(s.ending))fail();return structuredClone(s);}
