const VERSION='1.0.0',KEY='G041-butterfly-v1',SCHEMA=1;
const ROLES=[['许岚','经纪人','通告现金流与档期'],['陈砚','导演','主演试镜与作品门槛'],['周闻','表演指导','台词与镜头训练'],['乔可','造型师','红毯概念与预案'],['陆舟','摄影师','入场、风雨与定点'],['沈芮','制片人','预算与最终发行']];
const LABELS={energy:'体力',cash:'资金',skill:'演技',heat:'热度',trust:'口碑',film:'作品'};
function fresh(){return {schema:SCHEMA,version:VERSION,rev:0,week:1,ap:3,energy:75,cash:45,skill:28,heat:35,trust:55,film:0,plan:0,concept:0,role:false,ended:false,stage:0,carpet:0,log:['雨夜照片登上热榜。经纪人提醒：镜头会移开，十二周后，拿什么让人留下？']}}
const ACTIONS={train:{title:'台词排练',who:2,desc:'在空镜前练一场告别戏',e:{cash:-8,energy:-13,skill:11,trust:2}},job:{title:'拍摄通告',who:0,desc:'一日品牌短片，收入可观但消耗体力',e:{energy:-18,cash:22,heat:8}},film:{title:'磨一场戏',who:1,desc:'和导演逐镜调整，让作品留下来',e:{cash:-10,energy:-16,skill:5,film:13,trust:4}},rest:{title:'关机休整',who:0,desc:'睡足一觉，热度先放一放',e:{energy:29,heat:-3}},plan:{title:'风雨预案',who:3,desc:'排练披风、站位和镜头动线，降低红毯风险',e:{cash:-7,energy:-7,plan:1,trust:3}},concept:{title:'造型共创',who:3,desc:'用光影与雨幕讲一个有起承转合的镜头故事',e:{cash:-10,energy:-8,concept:1,heat:4}},audition:{title:'主演试镜',who:1,desc:'演技≥48、口碑≥45可获主演资格；失败仍积累经验',e:{cash:-4,energy:-12}}};
function affordable(s,e){return Object.entries(e).every(([k,v])=>!(['cash','energy'].includes(k))||v>=0||s[k]+v>=0)}
function apply(s,e){for(const[k,v]of Object.entries(e))s[k]=Math.max(0,Math.min(['cash','plan','concept'].includes(k)?999:100,s[k]+v));if(s.energy===0||s.trust===0){s.ended=true;s.reason=s.energy===0?'透支停工':'信任耗尽'}return s}
function action(s,k){let a=ACTIONS[k];if(s.ended||s.ap<=0||!a)return{ok:false,text:'本周行动已用完，请进入周末。'};if(k==='audition'&&s.role)return{ok:false,text:'已获得主演资格，去片场磨戏吧。'};if(k==='film'&&!s.role)return{ok:false,text:'先通过主演试镜，才能进入主演项目。'};if(!affordable(s,a.e))return{ok:false,text:'资源不足，先接通告或休整。'};s.ap--;apply(s,a.e);let text=a.desc;if(k==='audition'){if(s.skill>=48&&s.trust>=45){s.role=true;s.film=Math.min(100,s.film+8);text='陈砚合上剧本：“这场戏，你留下。”主演资格已获得。'}else{s.skill=Math.min(100,s.skill+4);text='试镜未过。需要演技48、口碑45；表演指导给了你一次有用的复盘。'}}s.log.unshift('第'+s.week+'周 · '+a.title+'：'+text);return{ok:true,text}}
const opt=(t,e)=>({t,e});
const EVENTS=[
['雨夜出圈之后','许岚把三份邀约摊开：所有人都想复制那个雨夜镜头，你想留下什么？','先建立作品方向',opt('把热度换成训练预算',{cash:14,heat:4,energy:-7}),opt('发幕后练习，向作品引流',{skill:5,trust:7,heat:2}),opt('给自己一天恢复',{energy:15,heat:-4})],
['借来的聚光灯','短片讨论正在下降。没有人能一直靠同一张图生活。','热度低于30时',opt('接一场直播补曝光',{cash:12,heat:10,energy:-12}),opt('发布排练片段',{skill:5,trust:8}),opt('安静休息',{energy:14,heat:-3})],
['角色不是礼服','导演要求你脱掉造型，演一个说不出告别的人。','演技≥38',opt('反复拍到收工',{skill:9,energy:-12}),opt('请指导逐句分析',{cash:-10,skill:12}),opt('保留体力，明日再练',{energy:10,trust:2})],
['台词卡住的夜晚','镜子前的你记住了每个表情，却没说清角色为什么沉默。','演技不足38',opt('从人物小传开始',{skill:8,energy:-7}),opt('借助表演指导',{cash:-8,skill:10}),opt('先睡一觉',{energy:16})],
['一份有条件的邀请','摄影师愿意拍一组无修饰的现场肖像，要求你拿出完整的表达。','造型概念≥1',opt('坚持雨夜叙事概念',{heat:13,trust:4,energy:-9}),opt('展示搭建过程',{trust:9,skill:3}),opt('暂缓拍摄',{energy:9,heat:-3})],
['从哪里被记住','造型师问你：除了一套好看的衣服，你希望观众读到什么？','尚无造型概念',opt('写下雨夜成长概念',{concept:1,cash:-6}),opt('用一场戏回答',{skill:7,energy:-8}),opt('先处理通告',{cash:9,heat:3,energy:-8})],
['主演名额','试镜名单公布。获得资格只是开始，制片人需要看到稳定的投入。','已获主演资格',opt('承诺完成一次长镜头',{film:10,energy:-12,trust:5}),opt('先锁定创作预算',{cash:12,trust:2}),opt('与导演调整节奏',{energy:8,film:3})],
['落选后的早餐','主演名单里还没有你。经纪人没有安慰，只把下一份剧本放到桌上。','尚未通过主演试镜',opt('从失败录像找问题',{skill:10,energy:-9}),opt('接通告攒下一次机会',{cash:16,heat:4,energy:-10}),opt('停下来恢复',{energy:18,trust:2})],
['热榜的十分钟','采访只愿聊红毯。你有机会把话题引向作品，也可能失去传播机会。','热度≥45',opt('谈角色的具体难题',{trust:10,film:5,heat:-3}),opt('重现红毯定点',{heat:15,energy:-10}),opt('各留一半时间',{trust:4,heat:6,energy:-4})],
['没有镜头的周五','短片没有登上推荐页。导演发来一句话：把最后一场排完再说。','热度不足45',opt('把戏磨完',{skill:8,film:5,energy:-10}),opt('主动接一场访谈',{heat:12,cash:-5}),opt('让团队放一天假',{energy:16,trust:4})],
['红毯前的气象预警','陆舟带来下雨预报。提前排练的预案让你有了选择空间。','预案≥1',opt('把雨幕纳入镜头',{heat:12,trust:8,energy:-8}),opt('缩短路线保护团队',{trust:11,heat:4}),opt('按原计划但增加休息',{energy:9,heat:3})],
['披风沾水','没有排练的拖尾吸住雨水。造型师示意缩短动线，镜头正在等你。','尚无风雨预案',opt('临时换短路线',{trust:6,heat:-4}),opt('支付加急处理费',{cash:-12,plan:1,heat:5}),opt('硬撑完成全程',{heat:12,energy:-20,trust:-6})],
['片场的第四条','你的长镜头已经成型，但情绪转折还差一点。','作品≥20',opt('再拍一次',{film:13,skill:5,energy:-15}),opt('采用稳定版本',{film:7,trust:5}),opt('留预算给后期',{cash:9,film:3})],
['被占掉的档期','通告挤满了日历，作品进度却没有动。你需要重新排优先级。','作品不足20',opt('留出一整天练戏',{skill:10,energy:-10}),opt('偿还团队加班成本',{cash:-9,trust:10}),opt('先恢复状态',{energy:19})],
['匿名的专业意见','试映反馈说：人物终于像真实活过，但结尾还可以更克制。','演技≥58',opt('重剪结尾并补录',{film:14,cash:-10}),opt('保留表演，解释创作',{trust:8,film:6}),opt('交给导演判断',{trust:5,energy:10})],
['漂亮之外','观众记住造型，却仍叫不出角色名字。这个反馈刺耳但具体。','演技不足58',opt('练角色而非表情',{skill:12,energy:-13}),opt('发布创作笔记',{trust:9,heat:3}),opt('先把预算稳住',{cash:13,energy:-7})],
['团队愿意再等一次','制片人同意追加一个拍摄日，条件是你按时交付。','口碑≥65',opt('投入精力补齐作品',{film:14,energy:-14}),opt('自付追加预算',{film:12,cash:-12}),opt('按现有版本交付',{film:6,trust:4})],
['迟到的成本','行程延误已经让团队等待。你必须用具体行动修复信任。','口碑不足65',opt('承担加班费用',{cash:-12,trust:13}),opt('取消一场个人通告',{heat:-7,trust:12,energy:6}),opt('先道歉并按时补拍',{trust:6,energy:-8})],
['作品第一次被看见','看片会上有人问起下一部。你可以承诺，也可以把这部先做完。','作品≥45',opt('专注最终混音',{film:12,cash:-8}),opt('谈下一部的方向',{heat:10,trust:4}),opt('留一次团队休整',{energy:15,trust:3})],
['还差最后一段','项目进度落后。制片人给出两个排期，你只能守住一个。','作品不足45',opt('集中补课',{skill:9,energy:-11}),opt('把通告预算留给作品',{film:10,cash:-9}),opt('暂停额外曝光',{energy:16,heat:-5})],
['再走一次红毯','这一回你手里有角色、有作品。镜头前的沉默也有了内容。','作品≥60',opt('让主创一起站到镜头前',{trust:10,heat:8}),opt('讲一段角色的成长',{film:8,heat:5}),opt('克制地完成定点',{energy:8,trust:5})],
['同一盏灯下','红毯邀约又来了。你愿意重复一次出圈，还是把力气留给镜头之外？','作品不足60',opt('接住曝光机会',{heat:16,energy:-12}),opt('把角色再练一遍',{skill:10,energy:-10}),opt('恢复状态等待首映',{energy:18})],
['首映前夜','沈芮把最后一个预算表合上。十二周里做过的选择，都要在银幕上交卷。','已有主演项目',opt('补好最后一处细节',{film:10,cash:-8,energy:-6}),opt('照顾团队与自己',{trust:6,energy:12}),opt('安排最后一次采访',{heat:12,energy:-8})],
['镜头之外的新起点','这轮没有拿到主演，但你已经知道自己该补什么。最后一周依然有效。','尚无主演项目',opt('整理下一次试镜片段',{skill:10,trust:5}),opt('留住曝光窗口',{heat:12,energy:-8}),opt('认真休整再出发',{energy:18,trust:4})]
];
function eventFor(s){let predicates=[s.heat>=30,s.skill>=38,s.concept>=1,s.role,s.heat>=45,s.plan>=1,s.film>=20,s.skill>=58,s.trust>=65,s.film>=45,s.film>=60,s.role];return EVENTS[(s.week-1)*2+(predicates[s.week-1]?0:1)]}
function endWeek(s,i){if(s.ended||s.ap>0)return{ok:false,text:'先完成本周行动。'};let e=eventFor(s),o=e[3+i];if(!o||!affordable(s,o.e))return{ok:false,text:'资源不足，请换一个方案。'};apply(s,o.e);s.log.unshift('第'+s.week+'周 · '+e[0]+'：'+o.t);if(!s.ended){if(s.week===12){s.ended=true;s.reason='首映结算'}else{s.week++;s.ap=3;apply(s,{heat:-5,energy:7})}}return{ok:true,text:o.t}}
function ending(s){if(s.reason!=='首映结算')return['暂别聚光灯',s.reason+'。先把自己和团队照顾好，才有下一次开场。'];if(s.role&&s.film>=65&&s.skill>=65&&s.trust>=55)return['作品站稳了','雨夜让人看见你，角色让人记住你。第一部主演作品完成，下一次邀请开始谈创作。'];if(s.heat>=60&&s.trust>=45)return['聚光常客','你建立了稳定的曝光与合作。镜头仍然追随你，作品路线还有下一程。'];return['下一次开场','这轮积累还不足以站稳主角位置。把训练、预算和休息重新排序，再试一次。']}
function validate(s){if(!s||(s.lastScene!==undefined&&!(['dressing','studio','set','premiere'].includes(s.lastScene)))||(s.reason!==undefined&&!(['透支停工','信任耗尽','首映结算'].includes(s.reason)))||s.schema!==1||s.version!==VERSION||!Number.isInteger(s.week)||s.week<1||s.week>12||!Number.isInteger(s.ap)||s.ap<0||s.ap>3||!Number.isInteger(s.rev)||s.rev<0||typeof s.role!=='boolean'||typeof s.ended!=='boolean'||!Array.isArray(s.log)||s.log.length>500||s.log.some(x=>typeof x!=='string'||x.length>1000)||!Number.isInteger(s.stage)||s.stage<0||s.stage>2||!Number.isInteger(s.carpet)||s.carpet<0||s.carpet>3)return false;return ['energy','cash','skill','heat','trust','film','plan','concept'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=((['cash','plan','concept'].includes(k))?999:100))}
if(typeof module!=='undefined')module.exports={fresh,action,apply,affordable,eventFor,endWeek,ending,validate,ACTIONS,EVENTS};
