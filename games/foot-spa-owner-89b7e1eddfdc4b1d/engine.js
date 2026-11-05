(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Spa=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION='1.1.0',GAME='G208';
const STAFF=[
 {id:0,name:'林悦',age:23,role:'耐心新人',skill:[45,34,29],salary:230,hire:1400,style:0,bio:'从前台转岗，沟通温柔，适合基础养足。先让她练短单，再慢慢培养。'},
 {id:1,name:'苏晴',age:28,role:'手法骨干',skill:[73,82,55],salary:380,hire:3000,style:1,bio:'擅长舒压，偏有力手法，老客多。长单交给她之前，看看后面有没有预约。'},
 {id:2,name:'陈雪',age:25,role:'服务能手',skill:[67,45,71],salary:310,hire:2200,style:0,bio:'细致安静，擅长草本护理。即使单价不高，也能让客人愿意再来。'},
 {id:3,name:'周远',age:30,role:'舒压专长',skill:[58,88,47],salary:400,hire:3400,style:2,bio:'手法扎实、喜欢聊天。适合重力度客人；安静型客人需要先提醒。'},
 {id:4,name:'唐宁',age:24,role:'细节控',skill:[57,48,78],salary:320,hire:2400,style:0,bio:'习惯先问水温与力度，护理专长好，但连续忙碌时需要充分休息。'},
 {id:5,name:'许曼',age:27,role:'快手接待',skill:[80,65,52],salary:350,hire:2700,style:1,bio:'基础项目熟练，节奏利落，适合午间赶时间的客人。'},
 {id:6,name:'陆川',age:26,role:'全能进修生',skill:[60,60,60],salary:310,hire:2300,style:1,bio:'三项比较均衡，适合灵活补位。坚持带教可以成为全能骨干。'},
 {id:7,name:'沈岚',age:32,role:'带教师傅',skill:[88,86,92],salary:520,hire:5500,style:0,bio:'经验丰富、服务沉稳。培训有额外效果，但师傅带教时也无法接单。'}
];
const PACKS=[
 {id:0,name:'暖足轻享',short:'养足',prep:80,price:98,duration:45,skill:0,cost:8,unlock:0,desc:'短单易翻台，适合新人练手'},
 {id:1,name:'舒压足道',short:'舒压',prep:140,price:158,duration:65,skill:1,cost:12,unlock:0,desc:'主力项目，重视力度和熟练度'},
 {id:2,name:'草本养护',short:'护理',prep:200,price:188,duration:75,skill:2,cost:18,unlock:1,desc:'需护理经验，适合安静服务'},
 {id:3,name:'雅间深度放松',short:'雅间',price:258,duration:90,skill:1,cost:22,unlock:2,prep:360,desc:'必须安排雅间席位，长单收益高'},
 {id:4,name:'肩颈舒缓',short:'肩颈',price:128,duration:40,skill:1,cost:10,unlock:0,prep:110,desc:'上班族短时舒缓，考验舒压手法'},
 {id:5,name:'茶香慢养',short:'茶养',price:218,duration:80,skill:2,cost:20,unlock:1,prep:260,desc:'温茶与草本护理，适合安静细致的服务'}
];
const TYPES=[
 {id:0,name:'午休白领',avatar:'公',pack:0,budget:130,patience:24,force:0,talk:0,desc:'赶时间，喜欢轻柔安静'},
 {id:1,name:'跑单司机',avatar:'车',pack:1,budget:185,patience:32,force:2,talk:1,desc:'希望力度到位，愿意聊两句'},
 {id:2,name:'附近街坊',avatar:'邻',pack:0,budget:115,patience:42,force:1,talk:1,desc:'关注价格，记得住熟悉的技师'},
 {id:3,name:'安静客人',avatar:'静',pack:2,budget:220,patience:36,force:0,talk:0,desc:'偏爱安静，重视水温和卫生'},
 {id:4,name:'运动爱好者',avatar:'动',pack:1,budget:190,patience:30,force:2,talk:0,desc:'重视手法，愿为专业买单'},
 {id:5,name:'品质客人',avatar:'雅',pack:3,budget:310,patience:40,force:1,talk:0,desc:'看重环境与服务细节'},
 {id:6,name:'朋友推荐',avatar:'荐',pack:1,budget:175,patience:35,force:1,talk:1,desc:'期待与朋友说的一样好'},
 {id:7,name:'下班常客',avatar:'熟',pack:0,budget:180,patience:38,force:1,talk:0,desc:'喜欢稳定服务，可能指定技师'}
];
const SHIFTS=[{name:'早班',time:'10—14',start:600,end:840},{name:'中班',time:'14—18',start:840,end:1080},{name:'晚班',time:'18—22',start:1080,end:1320}];
const NEEDS=[
 {name:'水温有点凉',good:'重新调温',bad:'先将就一下',result:'及时换水，细节受到认可'},
 {name:'手法再轻一点',good:'确认力度并调整',bad:'保持原来力度',result:'重新确认力度，客人放松下来'},
 {name:'想安静休息一会',good:'减少交谈与提醒',bad:'继续推荐项目',result:'保留安静，客人感到被尊重'},
 {name:'想喝杯温茶',good:'送一杯温茶',bad:'等服务结束再说',result:'温茶送到，客人心情变好'},
 {name:'希望加重一点力度',good:'询问承受范围再调整',bad:'按自己的节奏继续',result:'沟通后调整手法，反馈很好'},
 {name:'想确认剩余时间',good:'说明进度与结束时间',bad:'让客人继续等',result:'主动说明进度，客人不再着急'}
];
const UPGRADES=[
 {id:'tea',name:'迎客茶台',cost:1800,max:2,desc:'每级候客耐心+8分钟；温茶请求无需额外支出'},
 {id:'clean',name:'专职清洁',cost:2400,max:2,desc:'自动清洁空椅，每级缩短清洁时间；日支出+90'},
 {id:'ambience',name:'灯光隔音',cost:2200,max:2,desc:'每级结账满意度+4，增加舒适感'},
 {id:'herb',name:'草本护理台',cost:2600,max:1,desc:'解锁草本养护套餐'},
 {id:'rest',name:'员工休息室',cost:2000,max:2,desc:'每级休息恢复+30%，日终体力恢复更多'},
 {id:'rooms',name:'扩充侧厅／雅间',cost:6500,max:2,desc:'第1级增加2个侧厅席位；第2级增加2个雅间席位并解锁套餐'}
];
const EVENTS=[
 ['新人第一次独立接待','林悦想接一个短单练手，苏晴愿意在旁边看一看。','安排带教，花¥160','先继续常规接待',{cash:-160,skill:3,mood:5},{rep:0}],
 ['晚高峰前的休息','大家下午连续接了几单，晚班是否提前安排轮休？','准备加餐，花¥180','按原计划继续',{cash:-180,energy:18,mood:5},{energy:-5,mood:-2}],
 ['街坊希望透明定价','邻居想确认，套餐外会不会临时加价。','制作价目牌，花¥120','先口头说明',{cash:-120,rep:3},{rep:1}],
 ['毛巾供应延迟','常用供应商送货晚了，是否备一批应急耗材？','应急采购40份，¥400','继续用现有库存',{cash:-400,kits:40},{rep:0}],
 ['师傅想分享手法','苏晴提议在交班空隙做一次小课堂。','留出时间，花¥220','改天再安排',{cash:-220,skill:4,mood:3},{mood:-2}],
 ['客人忘了随身物品','前台发现客人落下的卡包，能否抽出时间联系？','主动联系并保管','忙完再整理',{rep:3},{rep:-2}],
 ['有人想临时换班','一位技师家里有事，希望今天少排一段。','批准调整，补贴¥150','说明情况，请她坚持',{cash:-150,mood:10,energy:10},{mood:-10}],
 ['天气骤冷','街边冷了起来，来店客人更在意热水和毛巾。','添置保温用品，¥200','按现有标准接待',{cash:-200,rep:3},{rep:-1}],
 ['企业团体咨询','附近办公室想合作，担心等太久。','接待小批次预约，¥250准备金','先把散客服务做好',{cash:-250,demand:2,rep:2},{rep:1}],
 ['培训预算怎么花','比起添装饰，团队希望先把基础手法练熟。','投入¥320技能训练','添一处小装饰，¥180',{cash:-320,skill:5},{cash:-180,rep:2}],
 ['差评需要回复','有人说昨天等候太久，是否认真回访？','回访并补偿，¥160','只解释当时人多',{cash:-160,rep:4},{rep:-3}],
 ['员工生日','小小一份关心，也会影响团队愿不愿意留下。','一起庆祝，¥180','口头送上祝福',{cash:-180,mood:12},{mood:2}],
 ['商圈活动邀请','人流会变多，团队接待能力够不够？','参加活动，¥300','保持平常营业',{cash:-300,demand:3},{rep:1}],
 ['客人询问会员储值','有人提议用高额储值快速回款。','仅做按次熟客预约','推出实惠回访券，¥180',{rep:2},{cash:-180,rep:3,demand:1}],
 ['预约迟到的沟通','前台建议明确迟到保留时限，减少争执。','完善预约提醒，¥100','仍然逐一电话解释',{cash:-100,rep:3},{mood:-2}],
 ['服务动作的细节','有人做得快，有人更细致，是否统一收尾流程？','培训收尾规范，¥240','保持个人习惯',{cash:-240,skill:3,rep:2},{rep:0}],
 ['员工推荐新同事','团队愿意帮忙招聘，但希望排班公平。','发推荐奖励，¥220','暂不扩大招聘',{cash:-220,mood:8},{rep:0}],
 ['老客夸赞新人','新人被第一次点名预约，大家建议鼓励一下。','发成长奖金，¥200','公开表扬',{cash:-200,mood:10,skill:2},{mood:5}],
 ['隔壁装修有噪声','安静型客人可能不满意。','临时增添软隔断，¥280','逐位提前说明',{cash:-280,rep:4},{rep:1}],
 ['交班时的遗漏','一位客人的力度偏好没写在交班本上。','完善记录，¥180','口头提醒',{cash:-180,skill:3,rep:2},{rep:0}],
 ['技师体力预警','大家建议把休息时间真正留在排班表里。','增加休息补贴，¥260','今天先口头提醒',{cash:-260,energy:25,mood:5},{energy:6}],
 ['熟客带来朋友','朋友想体验长套餐，但愿意先从基础项目开始。','准备试用礼，¥200','认真做好基础服务',{cash:-200,demand:2,rep:2},{rep:2}],
 ['卫生巡检','服务区需要核对清洁、消毒和用品存放。','补齐流程，¥300','先自查现有流程',{cash:-300,rep:5,kits:10},{rep:1}],
 ['这个月的团队会议','大家讨论：只追翻台，还是留下能回来的客人？','投入¥350复盘服务','一起复盘排班',{cash:-350,skill:4,mood:8},{energy:12,mood:5}]
];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function rng(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function log(s,text){s.log.unshift({day:s.day,time:s.time,text});s.log=s.log.slice(0,60);}
function fresh(seed=Date.now()>>>0){return {game:GAME,version:VERSION,seed,day:1,time:600,phase:'prep',offer:0,offerDay:0,cash:18000,rep:58,kits:60,rate:1,auto:false,marketing:0,staff:STAFF.slice(0,3).map((d,i)=>({id:d.id,skill:[...d.skill],energy:100,mood:80,shifts:i===0?[1,1,0]:i===1?[0,1,1]:[1,0,1],overtime:false,breakUntil:0,trainUntil:0,absent:false,regulars:0,jobs:0})),chairs:Array.from({length:4},(_,id)=>({id,room:0,job:null,dirty:false,clean:0})),queue:[],appointments:[],up:{tea:0,clean:0,ambience:0,herb:0,rest:0,rooms:0},branch:0,ids:1,arrival:600,dayStats:{income:0,cost:0,served:0,lost:0,ratings:[],requests:0,handled:0},total:{income:0,cost:0,served:0,lost:0,happy:0},history:[],reviews:[],log:[],event:null,eventDone:false,milestones:[],lastReport:null};}
function onDuty(s,w){return !w.absent&&w.shifts.some((v,i)=>v&&s.time>=SHIFTS[i].start&&s.time<SHIFTS[i].end);}
function jobFor(s,id){return s.chairs.find(c=>c.job&&c.job.staff===id);}
function status(s,w){if(w.absent)return '请假';if(jobFor(s,w.id))return '服务中';if(w.trainUntil>s.time)return '培训中';if(w.breakUntil>s.time)return '休息中';if(!onDuty(s,w))return '未当班';if(w.energy<12)return '体力不足';return '可接单';}
function available(s,w){return status(s,w)==='可接单';}
function unlocked(s,p){return p.unlock===0||(p.unlock===1?s.up.herb>0:s.up.rooms>=2);}
function spend(s,amount){if(!Number.isFinite(amount)||amount<0||s.cash<amount)return false;s.cash-=amount;s.dayStats.cost+=amount;s.total.cost+=amount;return true;}
function gain(s,amount){s.cash+=amount;s.dayStats.income+=amount;s.total.income+=amount;}
function guest(s,type,requested=null){const d=TYPES[type];let pref=d.pack;let budget=d.budget;if(!unlocked(s,PACKS[pref]))pref=pref===3?1:0;if(s.offerDay===s.day&&rng(s)<.38){pref=s.offer;budget=Math.max(budget,PACKS[pref].price*s.rate*1.08);}return {id:s.ids++,type,pack:pref,arrived:s.time,patience:d.patience+s.up.tea*8,budget:Math.round(budget*(1+(rng(s)-.5)*.16)),force:d.force,talk:d.talk,requested,appointment:false,greeted:false};}
function open(s){if(s.phase!=='prep')return '先处理上一天的结算';s.phase='open';s.arrival=s.time+24;s.queue.push(guest(s,0),guest(s,1));s.appointments=[{id:s.ids++,time:840,type:7,staff:s.staff[0].id,arrived:false},{id:s.ids++,time:1080,type:4,staff:s.staff[Math.min(1,s.staff.length-1)].id,arrived:false}];log(s,'开门迎客。先看客人偏好，再选择套餐和技师。');return true;}
function schedule(s,id,index){const w=s.staff.find(w=>w.id===id);if(!w||!Number.isInteger(index)||index<0||index>2)return '无效排班';const sh=[...w.shifts];sh[index]=1-sh[index];if(sh.reduce((a,b)=>a+b,0)>2&&!w.overtime)return '三段连班需要先开启加班许可，体力和情绪会承压';w.shifts=sh;log(s,STAFF[id].name+'调整了'+SHIFTS[index].name+'；正在服务的单会完成后交班。');return true;}
function overtime(s,id){const w=s.staff.find(w=>w.id===id);if(!w)return '无效员工';w.overtime=!w.overtime;if(!w.overtime&&w.shifts.every(Boolean))w.shifts[2]=0;return true;}
function rest(s,id){const w=s.staff.find(w=>w.id===id);if(!w||jobFor(s,id)||w.trainUntil>s.time)return '忙碌中，服务或培训结束后才能休息';w.breakUntil=s.time+45;log(s,STAFF[id].name+'开始休息45分钟。');return true;}
function train(s,id,k,mentor){const w=s.staff.find(w=>w.id===id);if(!w||!Number.isInteger(k)||k<0||k>2||jobFor(s,id)||w.trainUntil>s.time)return '当前不能培训';if(w.skill[k]>=99)return '此项技能已熟练';if(s.phase!=='open'&&s.phase!=='prep')return '营业准备或营业时可安排培训';let m=mentor===null?null:s.staff.find(w=>w.id===mentor);if(m&&(!available(s,m)||m.id===id||m.skill[k]<w.skill[k]+10))return '师傅需空闲在岗，且该技能至少高10点';if(mentor!==null&&!m)return '带教人不存在';const cost=m?180:260;if(!spend(s,cost))return '现金不足';const until=s.time+60;w.trainUntil=until;w.skill[k]=clamp(w.skill[k]+(m?8:5)+(m&&m.id===7?3:0),0,99);w.mood=clamp(w.mood+3,0,100);if(m)m.trainUntil=until;log(s,STAFF[id].name+(m?'跟随'+STAFF[m.id].name+'带教':'进行自主进修')+'，'+['养足','舒压','护理'][k]+'技能提升，60分钟内不能接单。');return true;}
function hire(s,id){const d=STAFF[id];if(!d||s.staff.some(w=>w.id===id))return '无法重复招聘';if(!spend(s,d.hire))return '招聘现金不足';s.staff.push({id,skill:[...d.skill],energy:100,mood:75,shifts:[0,1,1],overtime:false,breakUntil:0,trainUntil:0,absent:false,regulars:0,jobs:0});log(s,d.name+'入职，默认中晚班，请按需调整。');return true;}
function upgrade(s,id){const d=UPGRADES.find(u=>u.id===id);if(!d||s.up[id]>=d.max)return '已到最高等级';const cost=d.cost*(s.up[id]+1);if(!spend(s,cost))return '升级现金不足';s.up[id]++;if(id==='rooms'){const count=s.chairs.length;for(let i=0;i<2;i++)s.chairs.push({id:count+i,room:s.up.rooms===2?2:1,job:null,dirty:false,clean:0});}log(s,d.name+'升级到'+s.up[id]+'级。');return true;}
function supplies(s){if(s.kits>480)return '库存已充足';if(!spend(s,240))return '补货需要¥240';s.kits+=30;log(s,'购入30份清洁与服务用品。');return true;}
function greet(s,id){const g=s.queue.find(g=>g.id===id);if(!g||g.greeted)return '已经接待过';g.greeted=true;g.patience+=8;log(s,'为'+TYPES[g.type].name+'说明预计等候时间，耐心增加8分钟。');return true;}
function apologize(s,id){const g=s.queue.find(g=>g.id===id);if(!g)return '客人已离开';if(!spend(s,25))return '现金不足';s.queue=s.queue.filter(x=>x.id!==id);s.rep=clamp(s.rep+.4,0,100);log(s,'向'+TYPES[g.type].name+'致歉并送出回访券，支出¥25；客人离店。');return true;}
function match(s,g,w,p,opts){const k=w.skill[p.skill];const wait=s.time-g.arrived;let score=65+k*.22+s.up.ambience*4;let why=['手法熟练度 '+Math.round(k)];if(g.requested!==null){if(g.requested===w.id){score+=8;why.push('满足点钟 +8');}else{score-=18;why.push('未满足点钟 -18');}}if(g.pack===p.id){score+=6;why.push('套餐符合偏好 +6');}else{score-=8;why.push('套餐偏好不同 -8');}if(opts.force===g.force){score+=5;why.push('力度匹配 +5');}else{score-=8;why.push('力度不合适 -8');}if(opts.talk===g.talk){score+=4;why.push('交流方式匹配 +4');}else{score-=5;why.push('交流方式不合 -5');}if(w.energy<35){score-=15;why.push('技师疲劳 -15');}if(w.mood<35){score-=8;why.push('技师情绪低落 -8');}const pen=Math.min(18,wait*.3);score-=pen;if(pen>2)why.push('候客 '+Math.round(wait)+'分钟 -'+Math.round(pen));const price=Math.round(p.price*s.rate);if(price>g.budget){const bp=Math.min(22,(price/g.budget-1)*32);score-=bp;why.push('超出预算 -'+Math.round(bp));}if(opts.pace===1){score+=5;why.push('细致服务 +5');}if(opts.pace===2){score-=5;why.push('加快节奏 -5');}return {score,why,price};}
function assign(s,gid,sid,cid,pid,opts){if(s.phase!=='open')return '营业时才能派单';const g=s.queue.find(g=>g.id===gid),w=s.staff.find(w=>w.id===sid),c=s.chairs.find(c=>c.id===cid),p=PACKS[pid];if(!g||!w||!c||!p)return '客人或席位已变化';if(!available(s,w))return '这位技师当前无法接单';if(c.job||c.dirty||c.clean)return '该席位需要等待或清洁';if(!unlocked(s,p))return '套餐尚未解锁';if(pid===3&&c.room!==2)return '深度放松套餐需要雅间席位';if(s.kits<1)return '服务用品不足，请补货';if(!opts||![0,1,2].includes(opts.force)||![0,1].includes(opts.talk)||![0,1,2].includes(opts.pace))return '服务设置无效';const duration=Math.round(p.duration*(opts.pace===1?1.2:opts.pace===2?.8:1));if(s.time+duration>1320)return '本单会超过22:00闭店，请选择较短项目或利落节奏';if(!spend(s,p.cost))return '现金不足以准备服务耗材';s.kits--;const m=match(s,g,w,p,opts);const need=Math.floor(rng(s)*NEEDS.length);c.job={guest:g,staff:w.id,pack:p.id,start:s.time,duration,end:s.time+duration,score:m.score,why:m.why,price:m.price,need,needAt:s.time+Math.round(duration*.4),needDeadline:s.time+Math.round(duration*.4)+16,handled:false,needDone:false,opts:{...opts}};w.energy=clamp(w.energy-duration*.16,0,100);s.queue=s.queue.filter(x=>x.id!==gid);log(s,STAFF[sid].name+'为'+TYPES[g.type].name+'开始'+p.name+'，预计'+duration+'分钟。');return true;}
function respond(s,cid,good){const c=s.chairs.find(c=>c.id===cid),j=c&&c.job;if(!j||j.needDone||s.time<j.needAt)return '暂无待处理服务请求';if(good&&j.need===3&&!s.up.tea&&!spend(s,6))return '送茶需¥6，现金不足';j.needDone=true;j.handled=!!good;s.dayStats.requests++;if(good){j.score+=8;j.why.push('服务请求及时处理 +8');s.dayStats.handled++;log(s,STAFF[j.staff].name+'：'+NEEDS[j.need].result+'。');}else{j.score-=12;j.why.push('忽略服务请求 -12');log(s,'未满足客人服务请求，满意度下降。');}return true;}
function clean(s,cid){const c=s.chairs.find(c=>c.id===cid);if(!c||!c.dirty||c.job||c.clean)return '无需清洁';if(s.chairs.some(c=>c.clean>0)&&!s.up.clean)return '老板正在清洁另一席，请稍等';c.clean=Math.max(3,10-s.up.clean*3);log(s,(c.id+1)+'号席开始清洁。');return true;}
function finish(s,c){const j=c.job,w=s.staff.find(w=>w.id===j.staff),score=clamp(Math.round(j.score),0,100);const tip=score>=90?Math.round(j.price*.08):0;let revenue=j.price+tip;if(score<45)revenue=Math.round(j.price*.7);gain(s,revenue);s.dayStats.served++;s.total.served++;s.dayStats.ratings.push(score);s.rep=clamp(s.rep+(score-78)*.045,0,100);w.jobs++;w.skill[PACKS[j.pack].skill]=clamp(w.skill[PACKS[j.pack].skill]+.35,0,99);if(score>=85){w.regulars++;s.total.happy++;}w.mood=clamp(w.mood+(score>=85?1:-1),0,100);s.reviews.unshift({day:s.day,time:s.time,type:j.guest.type,staff:w.id,pack:j.pack,score,revenue,why:j.why,tip});s.reviews=s.reviews.slice(0,30);log(s,TYPES[j.guest.type].name+'结账¥'+revenue+'，满意度'+score+'；'+(score>=85?'愿意再次预约。':score<60?'需留意服务原因。':'服务结束。'));c.job=null;c.dirty=true;}
function autoAssign(s){for(const g of [...s.queue]){const p=PACKS[g.pack];const chairs=s.chairs.filter(c=>!c.job&&!c.dirty&&!c.clean&&(p.id!==3||c.room===2));if(!chairs.length)continue;let ws=s.staff.filter(w=>available(s,w));if(g.requested!==null&&ws.some(w=>w.id===g.requested))ws=ws.filter(w=>w.id===g.requested);else if(g.requested!==null&&s.time-g.arrived<18)continue;ws=ws.filter(w=>!s.appointments.some(a=>!a.arrived&&a.staff===w.id&&a.time>s.time&&a.time-s.time<p.duration+10));ws.sort((a,b)=>(b.skill[p.skill]+b.energy*.15)-(a.skill[p.skill]+a.energy*.15));if(ws[0])assign(s,g.id,ws[0].id,chairs[0].id,p.id,{force:g.force,talk:g.talk,pace:0});}}
function step(s,minutes=1){if(s.phase!=='open'||s.event)return;for(let n=0;n<minutes;n++){if(s.phase!=='open'||s.event)break;s.time++;
 for(const w of s.staff){if(!jobFor(s,w.id)){const resting=w.breakUntil>s.time||!onDuty(s,w);w.energy=clamp(w.energy+(resting?.28:.06)*(1+s.up.rest*.3),0,100);}if(w.shifts.every(Boolean)&&s.time%60===0){w.mood=clamp(w.mood-2,0,100);w.energy=clamp(w.energy-3,0,100);}}
 for(const c of s.chairs){if(c.clean){c.clean--;if(!c.clean)c.dirty=false;}if(c.job){const j=c.job;if(!j.needDone&&s.time>j.needDeadline){j.needDone=true;j.score-=14;j.why.push('服务请求超时 -14');s.dayStats.requests++;log(s,'有一单的服务请求未及时处理。');}if(s.time>=j.end)finish(s,c);}if(c.dirty&&!c.clean&&s.up.clean)clean(s,c.id);}
 for(const a of s.appointments){if(!a.arrived&&s.time>=a.time){a.arrived=true;const g=guest(s,a.type,a.staff);g.appointment=true;g.patience+=12;s.queue.push(g);log(s,'点钟预约到店，指定'+STAFF[a.staff].name+'。');}}
 for(const g of [...s.queue])if(s.time-g.arrived>g.patience){s.queue=s.queue.filter(x=>x.id!==g.id);s.rep=clamp(s.rep-(g.appointment?1.8:.65),0,100);s.dayStats.lost++;s.total.lost++;log(s,TYPES[g.type].name+'等候过久离店'+(g.appointment?'，点钟失约影响口碑。':'。'));}
 if(s.time>=s.arrival&&s.time<1260&&s.queue.length<12){let type=Math.floor(rng(s)*(s.up.rooms>=2?8:6));if(type===5&&s.up.rooms<2)type=6;const req=type===7&&s.total.happy>5?s.staff[Math.floor(rng(s)*s.staff.length)].id:null;s.queue.push(guest(s,type,req));const peak=s.time>=1080&&s.time<=1200;s.arrival=s.time+Math.round((peak?20:32)*(1.25-s.rep/200)/(1+s.marketing*.15));}
 if(!s.eventDone&&s.time>=960){s.eventDone=true;s.event=(s.day-1)%EVENTS.length;log(s,'有一件店务需要老板决定，营业时间已暂停。');break;}
 if(s.auto)autoAssign(s);
 if(s.cash < -3000||s.rep<15){s.phase='failed';s.lastReport={title:s.cash< -3000?'资金链吃紧':'口碑需要重建',body:'本次经营暂告一段落。可以导出留档，或从新的小店重新开始。'};break;}
 if(s.time>=1320)close(s);
 } }
function resolve(s,choice){if(s.event===null||![0,1].includes(choice))return '没有待决定店务';const e=EVENTS[s.event],fx=e[4+choice];if(fx.cash&&fx.cash<0&&s.cash< -fx.cash)return '现金不足，可选择另一种处理方式';if(fx.cash<0)spend(s,-fx.cash);else if(fx.cash)gain(s,fx.cash);if(fx.rep)s.rep=clamp(s.rep+fx.rep,0,100);if(fx.kits)s.kits+=fx.kits;if(fx.demand)s.marketing=Math.min(5,s.marketing+fx.demand);for(const w of s.staff){w.energy=clamp(w.energy+(fx.energy||0),0,100);w.mood=clamp(w.mood+(fx.mood||0),0,100);if(fx.skill)w.skill=w.skill.map(v=>clamp(v+fx.skill,0,99));}log(s,e[0]+'：'+e[2+choice]);s.event=null;return true;}
function close(s){
 for(const c of s.chairs)if(c.job){const j=c.job;if(!j.needDone){j.score-=8;j.why.push('收尾时未满足请求 -8');}j.why.push('闭店前完成本单');finish(s,c);}
 const lost=s.queue.length;s.dayStats.lost+=lost;s.total.lost+=lost;s.queue=[];if(lost)s.rep=clamp(s.rep-lost*.35,0,100);
 const salary=Math.round(s.staff.reduce((sum,w)=>sum+STAFF[w.id].salary*Math.max(.35,w.shifts.reduce((a,b)=>a+b,0)/2)*(w.shifts.every(Boolean)?1.15:1),0));const fixed=380+90+s.up.clean*90+s.up.rooms*120;const cost=salary+fixed;s.cash-=cost;s.dayStats.cost+=cost;s.total.cost+=cost;
 if(s.branch){const income=Math.round(2400+s.rep*20),cost=2300;gain(s,income);s.cash-=cost;s.dayStats.cost+=cost;s.total.cost+=cost;log(s,'分店回款¥'+income+'，固定成本¥'+cost+'。');}
 const d=s.dayStats;const avg=d.ratings.length?Math.round(d.ratings.reduce((a,b)=>a+b,0)/d.ratings.length):0;const r={day:s.day,income:d.income,cost:d.cost,net:d.income-d.cost,served:d.served,lost:d.lost,avg,salary,fixed,requests:d.requests,handled:d.handled,rep:Math.round(s.rep)};s.lastReport=r;s.history.push(r);s.history=s.history.slice(-60);s.phase='report';log(s,'闭店结算：净'+(r.net>=0?'赚':'支出')+'¥'+Math.abs(r.net)+'。');if(s.day===30||s.day===60){const title=s.rep>=82&&s.total.happy>=60?'街坊口碑店':s.total.income-s.total.cost>0?'稳步经营的小店':'仍在磨合的团队';r.milestone=title;s.milestones.push({day:s.day,title});}if(s.cash< -3000||s.rep<15){s.phase='failed';r.title=s.cash< -3000?'资金链吃紧':'口碑需要重建';r.body='可以查看账单总结，再开一间新店重新尝试。';}}
function nextDay(s){if(s.phase!=='report')return '先完成当天营业';s.day++;s.time=600;s.phase='prep';s.eventDone=false;s.event=null;s.dayStats={income:0,cost:0,served:0,lost:0,ratings:[],requests:0,handled:0};s.marketing=Math.max(0,s.marketing-1);s.appointments=[];for(const c of s.chairs){c.job=null;c.clean=0;c.dirty=false;}for(const w of s.staff){w.energy=clamp(w.energy+48+s.up.rest*12,0,100);w.mood=clamp(w.mood+3,0,100);w.trainUntil=0;w.breakUntil=0;w.absent=false;}if(s.day%7===0&&s.staff.length>3){const w=s.staff[Math.floor(rng(s)*s.staff.length)];w.absent=true;log(s,STAFF[w.id].name+'今天请假，请调整排班补位。');}return true;}
function branch(s){if(s.branch)return '已经开设分店';if(s.day<12||s.rep<70)return '需第12天起，口碑至少70';if(!spend(s,38000))return '开分店需要¥38,000';s.branch=1;log(s,'社区分店开业，每日按口碑结算营业回款和¥2300固定成本。');return true;}
function launchOffer(s,pid){if(!Number.isInteger(pid)||!PACKS[pid])return '方案不存在';const p=PACKS[pid];if(!['prep','open'].includes(s.phase))return '请在营业准备或营业期间推出方案';if(s.offerDay===s.day)return '今日主推已定，可在明天重新选择';if(!unlocked(s,p))return p.unlock===1?'需要先建设草本护理台':'需要先建设二级侧厅／雅间';if(!spend(s,p.prep))return '备料资金不足';s.offer=pid;s.offerDay=s.day;log(s,'今日主推「'+p.name+'」，备料支出¥'+p.prep+'；部分新客会按主推项目咨询。');return true;}
function validate(d){
 if(d&&d.game===GAME&&d.version==='1.0.0'){d=JSON.parse(JSON.stringify(d));d.version=VERSION;d.offer=0;d.offerDay=0;}
 const bad=m=>{throw Error(m);};const num=(v,a,b)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b;const int=(v,a,b)=>Number.isInteger(v)&&num(v,a,b);
 if(!d||d.game!==GAME||d.version!==VERSION)bad('存档不属于本游戏或版本不兼容');
 if(!int(d.seed,0,4294967295)||!int(d.day,1,100000)||!int(d.time,600,1320)||!['prep','open','report','failed'].includes(d.phase)||!num(d.cash,-1e7,1e10)||!num(d.rep,0,100)||!int(d.kits,0,1000000)||![.85,1,1.2].includes(d.rate)||typeof d.auto!=='boolean'||!int(d.marketing,0,5)||!int(d.ids,1,1e9)||!int(d.offer,0,5)||!int(d.offerDay,0,d.day)||![0,1].includes(d.branch))bad('基础数值无效');
 if(!Array.isArray(d.staff)||d.staff.length<1||d.staff.length>8||new Set(d.staff.map(w=>w.id)).size!==d.staff.length)bad('员工列表无效');
 for(const w of d.staff){if(!int(w.id,0,7)||!Array.isArray(w.skill)||w.skill.length!==3||w.skill.some(v=>!num(v,0,99))||!num(w.energy,0,100)||!num(w.mood,0,100)||!Array.isArray(w.shifts)||w.shifts.length!==3||w.shifts.some(v=>![0,1].includes(v))||typeof w.overtime!=='boolean'||typeof w.absent!=='boolean'||!int(w.breakUntil,0,1500)||!int(w.trainUntil,0,1500)||!int(w.regulars,0,1e8)||!int(w.jobs,0,1e8)||(!w.overtime&&w.shifts.every(Boolean)))bad('员工数据无效');}
 for(const u of UPGRADES)if(!d.up||!int(d.up[u.id],0,u.max))bad('设施等级无效');
 const guestValid=g=>{if(!g||!int(g.id,1,d.ids-1)||!int(g.type,0,7)||!int(g.pack,0,5)||!int(g.arrived,600,1320)||!int(g.patience,1,200)||!int(g.budget,1,10000)||!int(g.force,0,2)||![0,1].includes(g.talk)||(g.requested!==null&&!d.staff.some(w=>w.id===g.requested))||typeof g.appointment!=='boolean'||typeof g.greeted!=='boolean')bad('客人数据无效');};
 if(!Array.isArray(d.queue)||d.queue.length>20)bad('候客数据无效');d.queue.forEach(guestValid);
 if(!Array.isArray(d.chairs)||d.chairs.length!==4+d.up.rooms*2)bad('席位数量无效');
 const busy=new Set(),ids=new Set(d.queue.map(g=>g.id));
 for(let i=0;i<d.chairs.length;i++){const c=d.chairs[i];if(c.id!==i||c.room!==(i<4?0:i<6?1:2)||typeof c.dirty!=='boolean'||!int(c.clean,0,10)||(c.clean&&!c.dirty))bad('席位状态无效');if(c.job){const j=c.job;guestValid(j.guest);if(ids.has(j.guest.id)||busy.has(j.staff)||!d.staff.some(w=>w.id===j.staff)||c.dirty||c.clean||!int(j.pack,0,5)||!int(j.start,600,1320)||!int(j.duration,30,120)||!int(j.end,j.start,1440)||j.end!==j.start+j.duration||!num(j.score,-100,200)||!int(j.price,1,10000)||!int(j.need,0,5)||!int(j.needAt,j.start,j.end)||!int(j.needDeadline,j.needAt,1450)||typeof j.handled!=='boolean'||typeof j.needDone!=='boolean'||!Array.isArray(j.why)||j.why.length>30||j.why.some(t=>typeof t!=='string'||t.length>200)||!j.opts||!int(j.opts.force,0,2)||![0,1].includes(j.opts.talk)||!int(j.opts.pace,0,2))bad('服务进度无效');busy.add(j.staff);ids.add(j.guest.id);}}
 if(ids.size!==d.queue.length+busy.size)bad('客人编号重复');
 if(!Array.isArray(d.appointments)||d.appointments.length>4)bad('预约列表无效');for(const a of d.appointments)if(!int(a.id,1,d.ids-1)||!int(a.time,600,1320)||!int(a.type,0,7)||!d.staff.some(w=>w.id===a.staff)||typeof a.arrived!=='boolean')bad('预约数据无效');
 if(d.event!==null&&!int(d.event,0,EVENTS.length-1)||typeof d.eventDone!=='boolean')bad('事件无效');
 for(const obj of [d.dayStats,d.total]){if(!obj||['income','cost','served','lost'].some(k=>!num(obj[k],0,1e12)))bad('统计无效');}if(!Array.isArray(d.dayStats.ratings)||d.dayStats.ratings.length>500||d.dayStats.ratings.some(v=>!int(v,0,100))||!int(d.dayStats.requests,0,10000)||!int(d.dayStats.handled,0,10000)||!int(d.total.happy,0,1e9))bad('评分无效');
 if(!Array.isArray(d.history)||d.history.length>60||!Array.isArray(d.reviews)||d.reviews.length>30||!Array.isArray(d.log)||d.log.length>60||!Array.isArray(d.milestones)||d.milestones.length>10000)bad('历史记录无效');
 for(const r of d.history)if(!r||!int(r.day,1,d.day)||['income','cost','net','served','lost','avg','salary','fixed','requests','handled','rep'].some(k=>!num(r[k],-1e10,1e10)))bad('账单无效');
 for(const r of d.reviews)if(!r||!int(r.type,0,7)||!int(r.staff,0,7)||!int(r.pack,0,5)||!int(r.score,0,100)||!num(r.revenue,0,1e8)||!Array.isArray(r.why)||r.why.some(x=>typeof x!=='string'||x.length>200))bad('评价数据无效');
 for(const r of d.log)if(!r||typeof r.text!=='string'||r.text.length>500||!int(r.day,1,d.day)||!int(r.time,600,1320))bad('日志无效');
 for(const m of d.milestones)if(!m||!int(m.day,1,d.day)||!['街坊口碑店','稳步经营的小店','仍在磨合的团队'].includes(m.title))bad('阶段目标无效');
 if(d.lastReport!==null){const r=d.lastReport;if(!r||typeof r!=='object'||['title','body','milestone'].some(k=>r[k]!==undefined&&(typeof r[k]!=='string'||r[k].length>300)))bad('结算无效');for(const k of ['day','income','cost','net','served','lost','avg','salary','fixed','requests','handled','rep'])if(r[k]!==undefined&&!num(r[k],-1e10,1e10))bad('结算数值无效');}
 return JSON.parse(JSON.stringify(d));
}
return {VERSION,GAME,STAFF,PACKS,TYPES,SHIFTS,NEEDS,UPGRADES,EVENTS,fresh,onDuty,jobFor,status,available,unlocked,open,schedule,overtime,rest,train,hire,upgrade,supplies,greet,apologize,match,assign,respond,clean,autoAssign,step,resolve,nextDay,branch,launchOffer,validate,log};
});
