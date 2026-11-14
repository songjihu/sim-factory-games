(function(G){'use strict';
const key='life-crossroads-G216-v1',version='1.0.0';
const actions={
 work:{name:'认真上班',icon:'▣',time:2,desc:'收入随职级增长，健康−3',scene:'street'},
 learn:{name:'夜校进修',icon:'✎',time:1,desc:'¥600，技能+9，健康−2',cost:600},
 rest:{name:'好好生活',icon:'☕',time:1,desc:'¥180，健康+9，心情+6',cost:180},
 social:{name:'约个晚饭',icon:'♡',time:1,desc:'¥260，选定关系+9，心情+4',cost:260},
 pet:{name:'陪小猫晒太阳',icon:'♧',time:1,desc:'已领养时：羁绊+12，心情+9',cost:80},
 create:{name:'记录生活',icon:'◉',time:1,desc:'消耗灵感，涨粉与稿酬；重复创作会疲惫'},
 business:{name:'经营工作室',icon:'◇',time:2,desc:'已创业时按技能与口碑结算订单'},
 travel:{name:'出发看世界',icon:'↗',time:2,desc:'按所选路线花费，心情与灵感上升'}
};
const people=[['许映','合租室友','设计师，会把旧家具变成新的生活。'],['江屿','邻居','周末在河堤跑步，正在筹备摄影展。'],['陶然','同事','总能找到靠谱的学习资料。'],['林柚','老同学','在外地做社工，喜欢认真听你说话。'],['父亲','家人','话不多，但总会记得家里的那盏灯。'],['母亲','家人','给你寄来的包裹里总有家乡味道。'],['顾闻','创业伙伴','愿意一起试试小生意，重视兑现承诺。'],['周雨','旅友','在陌生城市也能找到便宜又好吃的小店。']];
const trips=[['河畔露营',900,12],['海岛慢行',2600,18],['古城漫游',1800,15],['雪山列车',4200,23],['沙漠星空',5600,26],['跨国背包',12000,32]];
const careers=[['产品设计',4200],['社区服务',3600],['软件开发',4800]];
function fresh(name='林初',career=0){return {schema:1,game:'G216',version,rev:0,name,career,q:0,money:18000,health:82,mood:70,skill:12,inspiration:36,fans:0,reputation:35,company:0,orders:0,level:0,house:0,deposit:0,pet:false,petBond:0,partner:-1,married:false,children:0,relationships:[35,22,28,26,65,65,20,18],focus:0,trip:0,visited:[],plan:[],log:['22岁春 · 拎着行李来到澄川，合租房月租900元。'],seen:[],pending:null,ended:false,ending:'',workCount:0,createCount:0,fulfilled:[],seed:Math.floor(Math.random()*2147483646)+1};}
function age(s){return 22+Math.floor(s.q/4)}
function rng(s){s.seed=(s.seed*16807)%2147483647;return s.seed/2147483647}
function cost(s,id){return id==='travel'?trips[s.trip][1]:(actions[id].cost||0)}
function used(s){return s.plan.reduce((n,id)=>n+actions[id].time,0)}
function add(s,id){if(s.ended||s.pending)return '请先完成当前事件';if(!actions[id])return '未知安排';if(used(s)+actions[id].time>6)return '这一季只剩 '+(6-used(s))+' 格时间';if(id==='pet'&&!s.pet)return '先在家中领养小猫';if(id==='business'&&!s.company)return '先在事业中开工作室';s.plan.push(id);return '';}
function money(s,n){if(s.money<n)return false;s.money-=n;return true}
function note(s,t){s.log.unshift(age(s)+'岁'+['春','夏','秋','冬'][s.q%4]+' · '+t);s.log=s.log.slice(0,240)}
function clamp(s){for(const x of ['health','mood','skill','inspiration','reputation','petBond'])s[x]=Math.max(0,Math.min(100,Math.round(s[x])));s.relationships=s.relationships.map(n=>Math.max(0,Math.min(100,Math.round(n))));s.money=Math.round(s.money);}
function asset(s){return s.money+s.deposit+s.house*320000+s.company*15000}
const events=[
 ['roof','楼上漏水了','房东说最快也要周末修。今晚的安排需要调整。',s=>s.q<12,[['找临住，花600换安心',{money:-600,health:4}],['自己收拾，花时间省费用',{health:-5,skill:2}]]],
 ['mentor','有人愿意带你','前辈邀请你参加一个长期项目，但要占用休息时间。',s=>s.workCount>2,[['接下项目，技能+8',{skill:8,health:-6}],['先守住边界',{mood:6}]]],
 ['call','未接来电','妈妈没有急事，只是问你有没有按时吃饭。',s=>s.q>2,[['买票回去看看，¥900',{money:-900,family:12,mood:5}],['认真打一通长电话',{family:5,inspiration:3}]]],
 ['cat','楼道里的小猫','雨停了，一只橘猫在楼道里等人。',s=>!s.pet,[['带去检查并领养，¥800',{money:-800,adopt:1,mood:8}],['联系靠谱领养人',{mood:3,reputation:3}]]],
 ['layoff','团队重组','熟悉的项目被取消，你需要重新找自己的位置。',s=>s.level>=1,[['学习新方向，¥1200',{money:-1200,skill:8}],['接受岗位调整',{money:900,mood:-5}]]],
 ['viral','一篇内容被看见','你记录的普通生活突然收获很多共鸣。',s=>s.fans>100,[['认真回复，慢慢经营',{fans:500,reputation:8}],['趁热接一单推广',{money:1800,reputation:-6}]]],
 ['friend','朋友的低谷','许映的方案被否定了，她问你今晚有没有空。',s=>s.relationships[0]>30,[['陪她沿河走一走',{relation:10,mood:4}],['发消息鼓励她',{relation:3,inspiration:4}]]],
 ['medical','体检提醒','检查显示你该调整作息了。这里的健康数值只是游戏设定。',s=>s.health<65,[['认真休养，¥1500',{money:-1500,health:15}],['从每天早睡开始',{health:6,money:-200}]]],
 ['client','一位挑剔的客户','客户希望临时追加需求，却没有增加预算。',s=>s.company>0,[['明确边界',{reputation:8,mood:-2}],['多做一版争口碑',{reputation:12,health:-5}]]],
 ['scam','快速赚钱的邀请','陌生人声称能保证高回报，还催你今天就转账。',s=>s.money>5000,[['拒绝并提醒朋友',{reputation:4}],['只听公开的风险说明',{skill:3}]]],
 ['rental','续租涨价','街区越来越热闹，房东提出了新的租金。',s=>!s.house&&s.q>7,[['搬去远一点的地方',{money:-900,mood:-3}],['协商并整理房间',{money:-1600,mood:5}]]],
 ['exhibit','城市摄影展','江屿想借你的一段文字，放在他的第一场展览里。',s=>s.relationships[1]>25,[['写一段城市散步记',{inspiration:10,relation:7}],['帮忙布置现场',{reputation:6,relation:9}]]],
 ['offer','另一座城市的机会','一份更高薪的工作，也意味着重新建立生活。',s=>s.skill>45,[['接受一次挑战',{money:5000,health:-6,relation:-5}],['留在熟悉的街区',{mood:7,relation:5}]]],
 ['repair','电脑突然罢工','文件还在，但机器需要修理。',s=>s.q>4,[['维修继续用，¥800',{money:-800,skill:3}],['更新设备，¥3200',{money:-3200,inspiration:10}]]],
 ['volunteer','社区需要帮手','陶然邀请你参与一次旧物交换活动。',s=>true,[['带着旧物去帮忙',{reputation:8,mood:5}],['给活动做一张海报',{skill:4,inspiration:6}]]],
 ['rain','一场计划外的雨','远行的第一天遇上暴雨，你的行程表被打乱了。',s=>s.visited.length>0,[['在小店等雨停',{inspiration:10,mood:4}],['改走室内路线，¥400',{money:-400,mood:9}]]],
 ['dinner','一张多出的椅子','周末家宴，父亲把你的座位一直留着。',s=>s.q>12,[['回家一起吃饭，¥600',{money:-600,family:10}],['约好下次团聚',{family:4,inspiration:5}]]],
 ['burnout','效率开始下降','看着排满的日程，你发现自己很久没有发呆了。',s=>s.workCount>8,[['给自己留白',{health:10,mood:8}],['换一种工作方法',{skill:7,health:-3}]]],
 ['school','孩子的开放日','孩子希望你来看看他们排练很久的小演出。',s=>s.children>0,[['到场陪伴',{relation:10,mood:8}],['录一段祝福',{relation:2,inspiration:5}]]],
 ['promise','一句没有兑现的话','你答应的约会，被工作一推再推。',s=>s.partner>=0,[['安排一次两人的周末，¥900',{money:-900,relation:13}],['坦诚讨论彼此期待',{relation:5,mood:3}]]],
 ['award','作品入选了','你做的小项目入选了一个社区展览。',s=>s.skill>35,[['到现场分享经验',{reputation:10,inspiration:8}],['整理作品集',{skill:6,fans:120}]]],
 ['petcare','橘猫不爱吃饭','兽医建议做一次检查。宠物的陪伴也需要责任。',s=>s.pet,[['去检查，¥1200',{money:-1200,petBond:12}],['预约基础检查，¥600',{money:-600,petBond:6}]]],
 ['partnerbiz','合作的分歧','顾闻认为应该先扩大团队，你更担心现金流。',s=>s.company>0,[['稳住现金',{money:1500,reputation:3}],['小步试单，¥2000',{money:-2000,reputation:12}]]],
 ['reunion','同学聚会','大家的生活看起来都比朋友圈里复杂。',s=>age(s)>=25,[['聊聊真实近况',{mood:9,relation:6}],['和老同学约个小项目',{skill:5,money:500}]]],
 ['slow','没有大事的一天','傍晚的风很好，今天没有什么值得发朋友圈。',s=>true,[['好好记住这个晚上',{mood:8,inspiration:7}],['给未来的自己写封信',{inspiration:12}]]],
 ['rentout','书桌旁的新想法','空出来的角落也许可以变成自己的小工作间。',s=>s.house>0,[['布置工作间，¥3000',{money:-3000,skill:6,inspiration:10}],['保留成阅读角，¥800',{money:-800,mood:10}]]],
 ['forty','年龄不是截止日期','朋友问你，现在开始学新东西会不会太晚。',s=>age(s)>=35,[['一起报名体验课，¥500',{money:-500,skill:8}],['做一份自己的练习计划',{inspiration:7,mood:7}]]],
 ['fund','一笔小小的结余','今年终于没有把每一分钱都安排得满满当当。',s=>s.money>40000,[['请家人吃顿饭，¥800',{money:-800,family:8,mood:7}],['捐给社区图书角，¥500',{money:-500,reputation:8}]]],
 ['sunset','父亲的旧照片','相册里，他也曾是一个站在路口的年轻人。',s=>age(s)>=40,[['听他讲过去',{family:10,inspiration:12}],['一起拍一张新的照片，¥300',{money:-300,family:12}]]],
 ['second','第二次出发','年轻同事认真地向你请教，你发现自己已经走了很远。',s=>age(s)>=45,[['把经验分享出去',{reputation:12,skill:3}],['试着做点没做过的事',{inspiration:15,mood:8}]]],
 ['community','街区的提案','居民们想把闲置地改成可以散步的小花园。',s=>age(s)>=30,[['出钱支持，¥1200',{money:-1200,reputation:12,mood:5}],['贡献设计与时间',{skill:5,reputation:9}]]],
 ['legacy','给未来留点什么','整理旧物时，你想起刚搬来时那个小小的行李箱。',s=>age(s)>=50,[['整理一册人生手记',{inspiration:12,fans:250}],['邀请老友再聚一次，¥900',{money:-900,relation:12,mood:10}]]]
];
function effect(s,e){for(const [k,n]of Object.entries(e)){if(k==='family'){s.relationships[4]+=n;s.relationships[5]+=n}else if(k==='relation')s.relationships[s.focus]+=n;else if(k==='adopt')s.pet=true;else s[k]+=n;}clamp(s)}
function checkEnd(s){if(s.health<=0||s.money< -30000||s.q>=152){s.ended=true;s.ending=s.health<=0?'先照顾好自己':s.money< -30000?'重整行囊':s.married&&s.relationships[s.partner]>=70?'灯火有人等':s.visited.length>=5?'把世界走成故乡':s.company>=2&&s.reputation>65?'小事业，大日子':asset(s)>=800000?'给未来留有余地':'自己的生活';note(s,'这一程结束了：'+s.ending);}}
function settle(s){if(s.ended||s.pending)return '先完成当前事件';if(!s.plan.includes('rest'))return '每季至少安排一次「好好生活」';if(used(s)<6)return '还有空格，先把这一季安排好';const required=s.plan.reduce((n,id)=>n+cost(s,id),0);if(s.money<required)return '当前现金不足以支付计划费用，请调整安排';let income=0;let oldLevel=s.level;for(const id of s.plan){s.money-=cost(s,id);if(id==='work'){let pay=careers[s.career][1]*(1+s.level*.4)*3;income+=pay;s.money+=pay;s.health-=3;s.skill+=2;s.workCount++;s.inspiration-=1;}if(id==='learn'){s.skill+=9;s.health-=2;}if(id==='rest'){s.health+=9;s.mood+=6;s.inspiration+=4;}if(id==='social'){s.relationships[s.focus]+=9;s.mood+=4;}if(id==='pet'){s.petBond+=12;s.mood+=9;}if(id==='create'){let gain=Math.round(40+s.skill*3+s.inspiration*5);if(s.inspiration<15){gain=Math.round(gain*.25);s.mood-=4;}s.fans+=gain;s.inspiration-=12;s.createCount++;if(s.fans>=1000){let fee=Math.round(200+s.fans*.025);s.money+=fee;income+=fee;}}
 if(id==='business'){let profit=Math.round((s.skill*90+s.reputation*65)*s.company*(.7+rng(s)*.6)-1500*s.company);s.money+=profit;income+=profit;s.orders++;s.reputation+=3;s.health-=4;}
 if(id==='travel'){let t=trips[s.trip];s.mood+=t[2];s.inspiration+=24;if(!s.visited.includes(s.trip))s.visited.push(s.trip);note(s,'到过'+t[0]+'，花费¥'+t[1]+'。');}}
 s.level=Math.min(5,Math.floor(s.skill/20),Math.floor(s.workCount/5));let expense=(s.house?1000:2700)+1800+(s.pet?360:0)+(s.married?900:0)+s.children*1500;s.money-=expense;s.deposit=Math.round(s.deposit*1.006);s.health-=age(s)>=50?3:1;s.mood-=3;s.relationships=s.relationships.map((n,i)=>n-(i===4||i===5?1:2));if(s.pet)s.petBond-=5;note(s,'季度入账¥'+Math.round(income)+'，生活支出¥'+expense+'。'+(s.level>oldLevel?'晋升至'+(s.level+1)+'级岗位！':''));s.plan=[];s.q++;clamp(s);checkEnd(s);if(!s.ended){let eligible=events.map((e,i)=>({e,i})).filter(({e,i})=>e[3](s)&&!s.seen.includes(i));if(!eligible.length)eligible=events.map((e,i)=>({e,i})).filter(({e})=>e[3](s));s.pending=eligible[Math.floor(rng(s)*eligible.length)].i;}return '';}
function choose(s,n){if(s.pending===null)return '没有待处理事件';let e=events[s.pending];if(!e||!e[4][n])return '无效选择';let delta=e[4][n][1];if(delta.money<0&&s.money< -delta.money)return '现金不足，试试另一项';effect(s,delta);note(s,e[1]+'：'+e[4][n][0]);if(!s.seen.includes(s.pending))s.seen.push(s.pending);s.pending=null;checkEnd(s);return '';}
function purchase(s,id){let msg='';if(s.ended||s.pending)return '请先完成当前事件';if(id==='adopt'){if(s.pet)return '已经有一只小猫';if(!money(s,800))return '需要¥800';s.pet=true;s.petBond=25;msg='领养了橘猫「面包」。每季照护¥360';}
 if(id==='house'){if(s.house)return '已经有自己的家';if(!money(s,320000))return '买房需要¥320000现金';s.house=1;msg='买下河边小居，每季房租改为维护费¥1000';}
 if(id==='company'){if(s.company)return '工作室已开业';if(s.skill<35)return '技能至少35';if(!money(s,18000))return '开业需要¥18000';s.company=1;msg='和顾闻开了小工作室，经营需安排2格时间';}
 if(id==='expand'){if(!s.company||s.company>=3)return '工作室可扩展到3级';if(!money(s,35000*s.company))return '扩展资金不足';s.company++;msg='工作室升至'+s.company+'级';}
 if(id==='deposit'){if(!money(s,10000))return '需要¥10000现金';s.deposit+=10000;msg='存入¥10000，每季利息0.6%（游戏设定）';}
 if(id==='withdraw'){if(s.deposit<10000)return '存款不足¥10000';s.deposit-=10000;s.money+=10000;msg='取回¥10000';}
 if(id==='date'){if(s.focus>=4&&s.focus<=5||s.focus===6)return '这位关系不走恋爱路线';if(s.partner>=0)return '当前已有伴侣';if(s.relationships[s.focus]<65)return '关系达到65再认真告白';s.partner=s.focus;msg='你们决定试着一起生活';}
 if(id==='marry'){if(s.partner<0)return '先建立恋爱关系';if(s.married)return '已经结婚';if(s.relationships[s.partner]<80)return '伴侣关系需达到80';if(!money(s,15000))return '需要¥15000筹备共同生活';s.married=true;msg='许下共同生活的承诺，每季家庭支出增加¥900';}
 if(id==='child'){if(!s.married)return '先建立稳定家庭';if(s.children>=2)return '目前最多养育两位孩子';if(age(s)>45)return '本局领养计划在45岁前开放';if(!money(s,10000))return '需预留¥10000';s.children++;msg='共同迎接新的家庭成员，每季养育支出¥1500';}
 if(msg)note(s,msg);clamp(s);return msg;}
function valid(s){if(!s||s.schema!==1||s.game!=='G216'||s.version!==version)return false;let nums=['rev','career','q','money','health','mood','skill','inspiration','fans','reputation','company','orders','level','house','deposit','petBond','partner','children','focus','trip','workCount','createCount','seed'];if(nums.some(k=>typeof s[k]!=='number'||!Number.isFinite(s[k])))return false;if(!Number.isInteger(s.q)||s.q<0||s.q>152||s.career<0||s.career>2||s.company<0||s.company>3||s.house<0||s.house>1||s.partner< -1||s.partner>7||s.focus<0||s.focus>7||s.trip<0||s.trip>5||s.deposit<0||s.fans<0||s.money< -1e8||s.money>1e10)return false;for(const x of ['health','mood','skill','inspiration','reputation','petBond'])if(s[x]<0||s[x]>100)return false;if(typeof s.name!=='string'||s.name.length>12||!s.name.trim())return false;if(!Array.isArray(s.relationships)||s.relationships.length!==8||s.relationships.some(n=>!Number.isFinite(n)||n<0||n>100))return false;if(!Array.isArray(s.plan)||s.plan.length>6||s.plan.some(id=>!actions[id])||used(s)>6)return false;if(!Array.isArray(s.log)||s.log.length>240||s.log.some(x=>typeof x!=='string'||x.length>500))return false;if(!Array.isArray(s.visited)||s.visited.some(n=>!Number.isInteger(n)||n<0||n>5)||!Array.isArray(s.seen)||s.seen.some(n=>!Number.isInteger(n)||n<0||n>=events.length))return false;if(s.pending!==null&&(!Number.isInteger(s.pending)||s.pending<0||s.pending>=events.length))return false;return ['pet','married','ended'].every(k=>typeof s[k]==='boolean');}
G.Life={key,version,actions,people,trips,careers,fresh,age,used,add,settle,choose,purchase,valid,asset,events,cost};
})(typeof module!=='undefined'?module.exports:window);
