(function(root){
'use strict';
const VERSION=1, ID='G031', KEY='g031-heiress-save-v1';
const people=[['父亲·林远山','稳健与家族信用','trust'],['母亲·沈澜','关怀与相处','care'],['兄长·林砚','能力与承担','skill'],['若宁·林若宁','尊重与边界','bond'],['顾问·周衡','财务与证据','evidence'],['独董·陈蔚','独立判断与公益','voice']];
const actions=[
 {id:'learn',name:'主持项目复盘',place:'board',desc:'专长+8，自主+3；消耗6资金、5精力',cost:6,delta:{skill:8,voice:3,energy:-5}},
 {id:'visit',name:'宅邸家宴',place:'estate',desc:'家族信任+7，关怀+5；消耗5资金、2精力',cost:5,delta:{trust:7,care:5,energy:-2}},
 {id:'talk',name:'与若宁平等协商',place:'gallery',desc:'若宁关系+9，自主+3；消耗3资金、3精力',cost:3,delta:{bond:9,voice:3,energy:-3}},
 {id:'audit',name:'调阅历史档案',place:'archive',desc:'证据+1，专长+3；消耗7资金、6精力',cost:7,delta:{evidence:1,skill:3,energy:-6}},
 {id:'charity',name:'主持公益方案',place:'gala',desc:'自主+7，关怀+4；消耗9资金、4精力',cost:9,delta:{voice:7,care:4,energy:-4}},
 {id:'rest',name:'书房留白日',place:'study',desc:'精力+17，自主+2；不花资金',cost:0,delta:{energy:17,voice:2}},
 {id:'consult',name:'完成独立顾问委托',place:'study',desc:'资金+12，专长+2；消耗9精力',cost:0,delta:{cash:12,skill:2,energy:-9}}
];
const projects=[{id:'heritage',name:'老店焕新',cost:24,pay:35,skill:0,desc:'稳健项目：季度回款35，信任+3'}, {id:'studio',name:'设计工作室',cost:34,pay:51,skill:35,desc:'需专长35：季度回款51，自主+4'}, {id:'venture',name:'新锐品牌',cost:42,pay:65,skill:55,desc:'需专长55：季度回款65；精力消耗6'}];
// 每条事件有独立门槛和三个可见的实际后果；状态不同会进入不同事件。
const events=[
 ['welcome','归家第一份授权','estate',s=>s.month===1,'家族让你接手一笔专项预算，签字之前，先决定你的立场。', ['亲自核对条款',{skill:5,voice:4,energy:-3}],['先办欢迎家宴',{cash:-8,trust:9,care:5}],['与若宁共同署名',{bond:10,voice:3}]],
 ['photo','合影站位','estate',s=>s.month>=2,'公关团队想把若宁从全家合照中移开。她没有开口，只看向你。',['保留她的位置',{bond:10,care:5,trust:-2}],['解释各自身份',{voice:6,trust:3}],['另拍姐妹合照',{cash:-5,bond:7,care:5}]],
 ['invoice','旧账里的重复付款','archive',s=>s.evidence>=1,'两张相同发票指向不同项目。周衡提醒你，公开前需要完整凭据。',['继续交叉核验',{evidence:1,energy:-6,skill:4}],['先暂停付款',{trust:-4,voice:7,cash:8}],['私下向父亲汇报',{trust:8,voice:-2}]],
 ['dinner','董事的私人晚宴','gala',s=>s.month>=2,'一位股东邀你出席，条件是承诺支持他的旧项目。',['拒绝预先承诺',{voice:8,trust:-3}],['携审查意见赴宴',{cash:-6,skill:5,trust:4}],['邀请独董同行',{care:3,voice:5,energy:-4}]],
 ['sibling','兄长的加急项目','board',s=>s.skill>=30,'林砚急需一份市场分析，但项目署名只留了他的名字。',['协商共同署名',{skill:6,voice:6,energy:-5}],['先完成交付',{trust:8,skill:4,energy:-8}],['提供付费顾问方案',{cash:10,voice:5,trust:-3}]],
 ['rumor','归家传闻','gallery',s=>s.month>=3,'一段剪辑视频把你的决定说成争产。回应也会消耗注意力。',['公布完整事实',{cash:-7,voice:8,trust:3}],['让家人一起说明',{bond:4,care:5,trust:4}],['专注手头项目',{skill:5,energy:4,trust:-3}]],
 ['fatigue','无人看见的疲惫','study',s=>s.energy<55,'连日会议后，连平常熟悉的数字都变得模糊。',['停下休息',{energy:18,trust:-2}],['委托团队接手',{cash:-8,energy:12,skill:3}],['减少应酬',{energy:10,voice:6,care:-2}]],
 ['mother','母亲收藏的旧画','gallery',s=>s.care>=25,'沈澜想把一幅旧画交给你，却担心你只把它当成资产。',['一起听完来历',{care:10,energy:3}],['为画作建档',{skill:4,evidence:1,cash:-4}],['邀请若宁一起看',{care:6,bond:7}]],
 ['bid','高价竞拍邀请','gala',s=>s.cash>=45,'晚宴主持人建议你举牌，价格已经超过你原定的预算。',['守住预算',{voice:7,skill:3}],['改为资助小项目',{cash:-12,care:8,voice:5}],['请团队核对用途',{energy:-4,evidence:1}]],
 ['studiooffer','工作室的邀请','gallery',s=>s.skill>=40,'独立设计师邀请你共创品牌。家族希望它成为集团附属部门。',['保留独立署名',{voice:9,skill:4,trust:-3}],['与集团共享资源',{trust:7,cash:8,voice:-3}],['先做小规模试验',{cash:-8,skill:7,voice:4}]],
 ['contract','授权里的模糊条款','archive',s=>s.month>=4,'新合同允许他人代签你的长期承诺。周衡把这一页单独折起。',['删除代签条款',{voice:9,trust:-3}],['加入复核程序',{skill:6,trust:4,energy:-4}],['收集旧版对照',{evidence:1,energy:-5}]],
 ['bondtest','若宁想搬出去','estate',s=>s.bond>=35,'她找到了自己的工作，不想再被称为谁的替代品。',['支持她的选择',{bond:10,voice:5}],['帮她核对租约',{cash:-6,bond:7,skill:4}],['约定固定见面',{care:7,bond:5,energy:-2}]],
 ['cashflow','账面富有的窘境','board',s=>s.cash<35,'资金被项目锁定，临时支出却已经到期。',['缩减接待开销',{cash:12,trust:-4}],['接顾问短单',{cash:16,energy:-10}],['让家人共担',{cash:10,care:4,voice:-4}]],
 ['public','公开发言机会','gala',s=>s.voice>=35,'记者问你：真正的继承，是接过资产还是承担决定？',['谈具体项目',{skill:6,voice:5}],['谈家人的边界',{care:6,bond:5}],['公开预算原则',{trust:5,voice:5,cash:-3}]],
 ['archivegift','被锁起的来信','archive',s=>s.evidence>=2,'旧管事交来一封信。信中没有阴谋，只有当年被错过的解释。',['向当事人求证',{evidence:1,care:6,energy:-4}],['先尊重隐私',{bond:6,voice:5}],['召开小范围沟通',{trust:6,care:6,cash:-5}]],
 ['pressure','父亲的交换条件','board',s=>s.month>=6,'林远山愿意为你争取支持，希望你把独立品牌交给集团。',['以业绩协商',{skill:7,voice:5,trust:-2}],['保留核心控制权',{voice:10,trust:-5}],['建立公平采购关系',{cash:-8,trust:7,skill:5}]],
 ['charitycheck','公益项目的回访','gala',s=>s.care>=40,'项目负责人邀请你看实际反馈。照片好看，结果却还需要改进。',['增加评估预算',{cash:-9,care:8,skill:5}],['亲自走访',{energy:-7,care:7,voice:5}],['公开改进进度',{trust:5,voice:6}]],
 ['oldfriend','旧朋友的周末','study',s=>s.month>=5,'从前的朋友说，你最近说话越来越像会议纪要。',['空出一整晚',{energy:12,care:5}],['一起聊新计划',{skill:4,voice:5,energy:3}],['真诚解释压力',{care:7,voice:3}]],
 ['director','独董的试题','board',s=>s.skill>=50,'陈蔚给你一份看似赚钱、实际侵占小股东权益的方案。',['否决并说明理由',{voice:9,trust:4}],['提出替代预算',{cash:-7,skill:7,voice:5}],['调取利益关系',{evidence:1,energy:-5}]],
 ['reunion','家宴前的空椅子','estate',s=>s.month>=7,'亲人忙于各自事务。今天要不要继续摆出完美家庭的样子？',['让聚会真实一点',{care:8,bond:6}],['改成各自邀约',{energy:-4,care:6,trust:4}],['把时间留给自己',{voice:7,energy:8}]],
 ['brandreturn','品牌开始被看见','gallery',s=>s.voice>=50,'客户认得你的作品，却不知道你是哪家的千金。',['以作品署名',{voice:7,skill:6,cash:6}],['介绍合作团队',{bond:4,care:4,skill:5}],['谨慎扩大规模',{cash:-10,skill:9}]],
 ['review','季度异议复盘','board',s=>s.month>=8,'上次没支持你的人送来具体意见。这一次有机会把分歧落到事情上。',['逐条答复',{trust:8,skill:5,energy:-5}],['邀请共同审核',{evidence:1,trust:4,energy:-4}],['保留不同意见',{voice:8,care:3}]],
 ['choice','继承之外的路','study',s=>s.month>=10,'考核接近尾声。你终于能区分自己想要的生活，和别人为你安排的生活。',['继续争取掌舵',{trust:7,skill:6,energy:-5}],['准备独立计划',{voice:9,cash:8}],['认真谈一次和解',{care:10,bond:5}]],
 ['ordinary','没有头条的一天','study',s=>true,'今天没有戏剧性的转折。只有一份计划，和仍由你决定的时间。',['把计划做扎实',{skill:4,trust:3,energy:-3}],['听听家人的近况',{care:5,bond:3}],['为自己留一点余裕',{energy:9,voice:3}]]
];
function fresh(){return {schema:VERSION,gameId:ID,revision:0,updatedAt:0,month:1,ap:2,cash:125,energy:80,trust:35,care:30,skill:25,bond:30,voice:25,evidence:0,investments:[],seen:[],votes:[],log:[],phase:'action',place:'estate',last:'归家的第一天。你的名字，终于写进授权书。',ending:null};}
function bound(s){for(const k of ['energy','trust','care','skill','bond','voice'])s[k]=Math.max(0,Math.min(100,s[k]));s.cash=Math.max(0,s.cash);s.evidence=Math.max(0,Math.min(30,s.evidence));return s;}
function fail(s){if(s.cash<=0||s.energy<=0){s.phase='end';s.ending=s.cash<=0?'预算失守':'暂别议事席';s.last='你需要暂停这场考核，重新整理资源与生活。一次退出，不是你人生的结论。';}return s;}
function delta(s,d){for(const[k,v]of Object.entries(d))s[k]+=v;return fail(bound(s));}
function effect(d){const names={cash:'资金',energy:'精力',trust:'家族信任',care:'关怀',skill:'专长',bond:'若宁关系',voice:'自主',evidence:'证据'};return Object.entries(d).map(([k,v])=>names[k]+(v>0?'+':'')+v).join(' · ');}
function record(s,t){s.last=t;s.log.unshift(`${s.month}月｜${t}`);s.log=s.log.slice(0,100);}
function act(s,id){s=structuredClone(s);const a=actions.find(x=>x.id===id);if(!a||s.phase!=='action'||s.ap<=0||s.cash<a.cost)return {ok:false,state:s,error:'当前无法进行此行动'};s.ap--;s.cash-=a.cost;s.place=a.place;delta(s,a.delta);record(s,a.name+'：'+effect({...a.delta,cash:(a.delta.cash||0)-a.cost}));return {ok:true,state:s};}
function invest(s,id){s=structuredClone(s);const p=projects.find(x=>x.id===id);if(!p||s.phase!=='action'||s.ap<1||s.cash<p.cost||s.skill<p.skill||s.investments.some(x=>x.id===id))return{ok:false,state:s,error:'资金、专长或行动不足，或此项目尚未回款'};s.ap--;s.cash-=p.cost;s.investments.push({id:p.id,due:Math.ceil(s.month/3)*3});s.place='board';if(id==='venture')delta(s,{energy:-6});record(s,`投入${p.cost}至${p.name}，${Math.ceil(s.month/3)*3}月底回款${p.pay}。`);return {ok:true,state:fail(s)};}
function currentEvent(s){if(s.event)return events.find(e=>e[0]===s.event);return events.find(e=>!s.seen.includes(e[0])&&e[3](s))||events[23];}
function openEvent(s){s=structuredClone(s);if(s.phase!=='action'||s.ap>0)return{ok:false,state:s};const e=currentEvent(s);s.event=e[0];s.phase='event';s.place=e[2];return{ok:true,state:s};}
function choose(s,n){s=structuredClone(s);if(s.phase!=='event'||!Number.isInteger(n)||n<0||n>2)return{ok:false,state:s};const e=currentEvent(s),o=e[5+n];if(o[1].cash&&s.cash+o[1].cash<0)return{ok:false,state:s,error:'资金不足'};delta(s,o[1]);s.seen.push(e[0]);record(s,e[1]+' · '+o[0]+'：'+effect(o[1]));delete s.event;if(s.phase!=='end')s.phase='settle';return{ok:true,state:s};}
function support(s){return [s.trust>=48,s.care>=48,s.skill>=48,s.bond>=48,s.skill>=42&&s.evidence>=2,s.voice>=48&&s.care>=38];}
function settle(s){s=structuredClone(s);if(s.phase!=='settle')return{ok:false,state:s};let msg='家族津贴+10，日常开支−7，精力−4。';delta(s,{cash:3,energy:-4});let paid=0;s.investments=s.investments.filter(i=>{if(i.due<=s.month){const p=projects.find(p=>p.id===i.id);paid+=p.pay;if(p.id==='heritage')delta(s,{trust:3});if(p.id==='studio')delta(s,{voice:4});return false;}return true;});s.cash+=paid;if(paid)msg+=` 项目回款+${paid}。`;if(s.month%3===0){const v=support(s);s.votes.push({month:s.month,count:v.filter(Boolean).length,members:v});msg+=` 季度议事支持${v.filter(Boolean).length}/6席。`;}record(s,msg);if(s.phase==='end')return{ok:true,state:s};if(s.month===12){s.phase='end';const v=support(s).filter(Boolean).length;s.ending=v>=4&&s.skill>=55?'新任掌舵人':s.voice>=65&&s.skill>=55&&s.cash>=50?'自立门户':s.care>=55&&s.bond>=45?'同席不同路':'尚未落定的继承';s.last={新任掌舵人:'四席以上投下支持票。你获得的是下一年的经营责任，也保留了自己的名字。',自立门户:'你带着能力、预算与自己的品牌离开，家族的姓氏不再是唯一的名片。',同席不同路:'你没有把所有人变成盟友，却让这张餐桌容得下不同的人生。',尚未落定的继承:'你完成了十二个月的尝试。决定权仍需要时间积累，下一次可以换一种走法。'}[s.ending];}else{s.month++;s.ap=2;s.phase='action';s.place='estate';}return{ok:true,state:s};}
function validate(s){if(!s||s.schema!==VERSION||s.gameId!==ID)throw Error('存档版本或游戏不匹配');const base=fresh();for(const k of Object.keys(base).filter(k=>typeof base[k]==='number'))if(!Number.isFinite(s[k]))throw Error('存档数值损坏');if(!Number.isInteger(s.month)||s.month<1||s.month>12||!Number.isInteger(s.ap)||s.ap<0||s.ap>2||!['action','event','settle','end'].includes(s.phase))throw Error('存档阶段损坏');for(const k of ['energy','trust','care','skill','bond','voice'])if(s[k]<0||s[k]>100)throw Error('存档数值越界');if(s.cash<0||s.cash>100000||s.evidence<0||s.evidence>30||s.revision<0)throw Error('存档数值越界');for(const k of ['investments','seen','votes','log'])if(!Array.isArray(s[k])||s[k].length>150)throw Error('存档列表损坏');if(s.seen.some(x=>!events.some(e=>e[0]===x))||s.log.some(x=>typeof x!=='string'||x.length>1000))throw Error('存档内容损坏');if(s.investments.some(x=>!projects.some(p=>p.id===x.id)||!Number.isInteger(x.due)||x.due<1||x.due>12))throw Error('项目数据损坏');if(new Set(s.investments.map(x=>x.id)).size!==s.investments.length)throw Error('重复项目');if(s.phase==='event'&&!events.some(e=>e[0]===s.event))throw Error('事件数据损坏');if(!['estate','board','gallery','archive','gala','study'].includes(s.place))throw Error('场景数据损坏');return structuredClone(s);}
const api={VERSION,ID,KEY,people,actions,projects,events,fresh,act,invest,currentEvent,openEvent,choose,settle,support,validate,effect};root.Game=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
