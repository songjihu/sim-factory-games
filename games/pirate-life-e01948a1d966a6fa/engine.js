/* 黑帆新生 v1.0.0 — standalone deterministic state transitions */
const Pirate=(()=>{
const KEY='G211-pirate-save-v1',countries=['英格兰','西班牙','法兰西','荷兰'],roles=['新人水手','木匠','枪手','掌舵手','船长'],shares=[4,4,5,8,10],motives=['逃亡','谋生','逐利','志向','复仇'];
const crew=[['奥伦·维克','船长',10,'谨慎守约'],['玛蕾·奎因','掌舵手',8,'公开身份的女航海家'],['布兰·科夫','水手长',5,'重视忠诚'],['伊沃·塞尔','枪手',5,'好胜'],['赛拉·莫恩','医生',5,'经全船同意随兄登船'],['芬恩·洛克','木匠',4,'重视船体'],['卢卡·戴恩','普通舵手',4,'愿意授课'],['埃里克·温','水手',4,'牵挂家人']];
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
function create(motive='谋生',gender='男',framed=false){return {version:1,rev:0,saved:0,name:['埃文·索恩','诺尔·哈文','莱恩·费恩','希尔·瓦尔'][Math.floor(Math.random()*4)],age:15+Math.floor(Math.random()*16),gender,hidden:gender==='女',motive,framed:motive==='逃亡'&&framed,background:motive==='逃亡'?(framed?'小镇书记之子，被伪造账本牵连，登船只为活着找回证人。':'贫寒码头工，因走私获罪后逃亡。'):motive==='复仇'?'普通商人家庭，被灰隼商队毁去生计，誓要追查其首领。':motive==='志向'?'渔民家庭，自幼向往海上自由，愿以黑帆为家。':motive==='逐利'?'破落商户之子，为传说中的巨额分红登上黑帆号。':'贫苦佃农之子，家中欠粮租，只求挣到下一年的口粮。',week:1,role:0,hp:90,combat:25,social:30,knowledge:22,moral:65,silver:30,food:70,hull:85,loyalty:50,fame:0,evidence:0,revenge:0,injury:0,compensation:false,licensed:false,peace:false,nation:0,heat:[0,0,0,0],favor:[0,0,0,0],service:0,disability:0,location:'deck',seen:[],log:['1620年，你在黑帆号签下名字，成为只有四股的新人。'],ending:null,event:null,result:null,turns:0};}
function event(id,title,text,opts,scene='deck'){return {id,title,text,opts,scene};}
const o=(label,hint,effect)=>({label,hint,effect});
function encounter(s){
if(s.ending)return null;
if(s.hp<=0)return event('death','海上长眠','船医合上了航海日志。',[]);
if(s.week>1&&s.week%16===0&&!s.peace)return event('peace','和平使节抵港','英西签订临时停战。所有针对西班牙的旧私掠许可即刻失效。', [o('收起旧许可证','许可作废；更换航线',{peace:true,licensed:false,knowledge:3}),o('趁消息未传开继续抢掠','西班牙与英格兰同时通缉',{peace:true,licensed:false,silver:110,heat0:25,heat1:35,moral:-10})],'port');
if(s.heat.some(x=>x>=75)&&s.week%3===0)return event('arrest','海军封锁线','军舰截断退路。通缉最高的国家要求你投降。', [o('寻求百姓联名请愿','该国民心≥60可获赦免；不足将受审',{special:'petition'}),o('以关系和银钱疏通','需180银或该国关系≥40',{special:'bribe'}),o('升满帆冲出封锁','战斗与船体决定胜负',{special:'escape'})],'battle');
if(s.loyalty<22)return event('mutiny','刀刃下的表决','船员拒绝继续听令。水手长要求重新表决船上权力。',[o('交出120银补发欠饷','需120银；忠诚+30',{cost:120,loyalty:30}),o('请船员重申章程','社交≥55保住席位；否则被流放',{special:'mutiny'}),o('承认失职，退回水手','降为新人；忠诚恢复',{role:0,loyalty:35})]);
if(s.week%12===0)return event('election','全员投票日','船长将航线与职位交给全员表决。你可以争取更高席位，反对者仍可能暗中结盟。',[o('竞选下一个职位','需声望、才学与忠诚；每次晋升一级',{special:'promote'}),o('支持现任并公开账目','忠诚+10，社交+4',{loyalty:10,social:4}),o('借酒散布流言','声望+8，忠诚−18，道德−8',{fame:8,loyalty:-18,moral:-8})]);
if(s.framed&&s.evidence>=5)return event('clear','封蜡证词','你终于凑齐伪造账本、证人和原始货单。港口法官愿意重审旧案。',[o('放下黑帆，申请重审','旧案清白；需道德≥55与任一国民心≥30',{special:'clear'}),o('继续航海，保留证据','才学+3；保留清白路线',{knowledge:3})],'port');
if(s.motive==='复仇'&&s.revenge>=5)return event('revenge','灰隼的最后航线','仇人已被困在礁湾。你决定这场追逐的收场方式。',[o('公开罪证交付法庭','复仇结局，道德+8',{special:'revenge'}),o('夺回家财后放其离去','获得240银，结束追查',{silver:240,revenge:-99,moral:5}),o('执意炮击仇船','高风险，通缉与战伤',{special:'revengeBattle'})],'battle');
if(s.location==='port')return portEvent(s);
const pool=events.filter(e=>!s.seen.includes(e.id)&&(!e.when||e.when(s)));if(!pool.length)s.seen=[];
const p=pool.length?pool:events.filter(e=>!e.when||e.when(s));return p[(s.turns*7+s.week*3)%p.length];
}
const events=[
event('merchant','西班牙满载商船','糖桶与银箱堆满甲板，对方升起白旗。许可与目标国决定这笔生意是否合法。',[o('接舷夺货，按章分股','根据职位分红，西班牙通缉上升',{special:'raid',target:1}),o('护送伤员进入港湾','西班牙民心+12，道德+6',{favor1:12,moral:6,social:2}),o('避开商船练习操帆','才学+4，战斗+2',{knowledge:4,combat:2})],'battle'),
event('english','英格兰邮船','船上有军方邮件，也有普通移民。英格兰签发的许可并不允许你抢劫本国船。',[o('抢夺军费','收入与英格兰通缉；可能吊销许可',{special:'raid',target:0}),o('提供淡水护送','英格兰民心+12，贡献+1',{favor0:12,service:1,moral:4}),o('交换航线情报','才学+5',{knowledge:5})]),
event('french','法兰西商队','对方提议付费请黑帆号护送。',[o('收取合理护航费','个人银+28，法兰西民心+9',{silver:28,favor2:9,service:1}),o('撕毁约定夺货','法兰西通缉增加',{special:'raid',target:2}),o('帮助落单小艇','健康−4，民心+15',{hp:-4,favor2:15,moral:6})]),
event('dutch','荷兰货栈船','商船挂出交易旗，船长让你提出建议。',[o('交换药材与木料','银−15，健康+12，船体+15',{cost:15,hp:12,hull:15,favor3:6}),o('劫走货物','荷兰通缉增加',{special:'raid',target:3}),o('请教海图','才学+6，社交+2',{knowledge:6,social:2})]),
event('storm','暴风压境','帆索在风里嘶鸣，一名水手被困桅杆。',[o('登桅救人','健康−12，忠诚+12，战斗+4',{hp:-12,loyalty:12,combat:4}),o('按海图避风','才学≥40可保全船体',{special:'storm'}),o('丢弃物资减重','补给−18，船体+5',{food:-18,hull:5})]),
event('loot','分红前的一枚银杯','银杯没有登账。船规写得很清楚：私藏战利品可被处死。',[o('交给水手长登账','忠诚+7，道德+4',{loyalty:7,moral:4}),o('偷偷藏进吊床','50%被揭发并判处死刑',{special:'steal'}),o('询问失主是否尚在船上','社交+4，道德+6',{social:4,moral:6})]),
event('duel','火药味的晚饭','枪手指责木匠偷吃口粮，两人拔出短刀。',[o('请船长见证决斗','依章调解，社交+5',{social:5,loyalty:3}),o('在甲板直接动手','受罚，健康−10，忠诚−12',{hp:-10,loyalty:-12,moral:-6}),o('查清口粮记录','才学+4，忠诚+6',{knowledge:4,loyalty:6})]),
event('drink','八点后的朗姆酒','新水手递来酒杯。船钟已经敲过八点。',[o('拒绝并收起酒桶','忠诚+4',{loyalty:4}),o('偷偷喝一杯','绑在甲板示众，健康−8',{hp:-8,loyalty:-8}),o('约好靠港再喝','社交+4',{social:4})]),
event('dice','吊床下的骰子','船规禁止在船上赌博。有人想把你拉进赌局。',[o('提醒他们收手','忠诚+5，道德+2',{loyalty:5,moral:2}),o('参与赌局','银−20，忠诚−10',{silver:-20,loyalty:-10}),o('请水手长调解','社交+3',{social:3})]),
event('family','码头上的家眷','木匠的妹妹无处可去。他请求全船同意让她随行。',[o('组织全体表决','社交+5；忠诚≥45一致通过',{special:'family'}),o('私自藏入货舱','违反章程，忠诚−18',{loyalty:-18,moral:-4}),o('资助她暂住岸上','银−20，道德+5',{cost:20,moral:5})],'port'),
event('sistership','同盟黑帆','同首领的友船拖着满载货艇经过。动手就违反同盟禁令。',[o('交换补给','补给+10，忠诚+3',{food:10,loyalty:3}),o('掠夺友船','被发现后流放结局',{special:'allyRaid'}),o('帮助修帆','船体−3，声望+6',{hull:-3,fame:6})]),
event('wounded','撤退时的呼救','甲板上还有受伤同伴。抛弃他们违反战斗章程。',[o('背着同伴撤离','健康−14，忠诚+15',{hp:-14,loyalty:15,moral:6}),o('用绳索拖回伤员','战斗+3，船体−8',{combat:3,hull:-8,loyalty:8}),o('独自弃船','军纪审判，死亡结局',{special:'desert'})],'battle'),
event('ransom','富商的赎金信','被俘富商愿意联系家人支付赎金。水手长等你建议。',[o('接受赎金后安全释放','个人银+55，道德−4，通缉+8',{silver:55,moral:-4,heat1:8}),o('归还行李送往港口','民心+12，道德+8',{favor1:12,moral:8}),o('索取商路情报后释放','才学+5，社交+3',{knowledge:5,social:3})]),
event('captives','货舱里的普通乘客','有人提议强迫普通乘客劳动，另有人要按宗教身份卖掉他们。你会怎样表态？',[o('送到安全港口','补给−12，各国民心+5，道德+10',{food:-12,allFavor:5,moral:10}),o('要求协助修船后释放','船体+10，道德−8，民心−5',{hull:10,moral:-8,allFavor:-5}),o('支持奴役提议','个人银+65，道德−25，各国民心−15',{silver:65,moral:-25,allFavor:-15})]),
event('sickness','船底的热病','坏血病与发热令两名水手无法站立。医生需要新鲜食物。',[o('拿出私人积蓄','银−25，健康+15，忠诚+8',{cost:25,hp:15,loyalty:8}),o('寻找海岛补给','才学+4，补给+8，船体−7',{knowledge:4,food:8,hull:-7}),o('继续赶路','健康−16，忠诚−7',{hp:-16,loyalty:-7})]),
event('training','枪手的午后课','伊沃答应教你短刀和火绳枪，但训练会消耗体力。',[o('练习接舷战','战斗+7，健康−4',{combat:7,hp:-4}),o('学习火药配比','才学+6',{knowledge:6}),o('替他修整炮架','忠诚+5，船体+4',{loyalty:5,hull:4})]),
event('chart','一张旧海图','卢卡指出礁线与潮流的位置。他说才学有时比火炮更可靠。',[o('认真测绘','才学+7',{knowledge:7}),o('询问他的家乡','社交+6',{social:6}),o('练习掌舵','战斗+3，才学+3',{combat:3,knowledge:3})]),
event('donation','饥饿的渔村','风灾带走粮仓。村民只能望着你的补给桶。',[o('捐出25银和口粮','各国民心+8，道德+8',{cost:25,food:-8,allFavor:8,moral:8}),o('留下部分食物','补给−10，民心+4，道德+4',{food:-10,allFavor:4,moral:4}),o('高价出售口粮','银+25，道德−10',{silver:25,food:-10,moral:-10})],'port'),
event('war','战时求援信','英格兰舰队请求你袭扰西班牙补给线。帮助一方会招致另一方记恨。',[o('协助护航军需','贡献+2，英民心+12，西通缉+12',{service:2,favor0:12,heat1:12,fame:5}),o('趁乱夺取军火','战斗检定，风险较高',{special:'warRaid'}),o('救助双方落水者','英西民心各+7，道德+6',{favor0:7,favor1:7,moral:6})],'battle'),
event('letter','盖着蜡印的口供','一名旧港书记认出你的姓氏，愿意谈谈那份失踪账本。',[o('支付旅费请他作证','银−30，证据+2',{cost:30,evidence:2}),o('用耐心换取信任','社交≥40获得证据',{special:'witness'}),o('留在船上执勤','忠诚+5',{loyalty:5})],'port'),
event('grey','灰隼的线索','酒馆里有人见过毁掉你家生计的商队。',[o('调查货单','银−15，复仇线索+2',{cost:15,revenge:2}),o('请当地水手辨认旗帜','社交+4，复仇线索+1',{social:4,revenge:1}),o('放下追逐练习航海','才学+5',{knowledge:5})],'port'),
event('injury','炮位上的事故','炮绳断裂，只有你来得及拉开同伴。',[o('舍身救人','失去一只眼，战斗上限90；获得补偿与额外股份',{special:'injury'}),o('用木板挡住反冲','健康−15，才学+4',{hp:-15,knowledge:4}),o('呼喊大家伏倒','健康−8，忠诚+4',{hp:-8,loyalty:4})],'battle'),
event('identity','秘密被看见','一名水手发现你一直隐瞒女性身份。他愿先听你解释。',[o('请求全体表决留船','社交与忠诚总和≥90可留船；否则被放逐',{special:'identity'}),o('私下请求船长庇护','支付40银，忠诚≥50可保密',{special:'hide'}),o('自愿在港口离船','结束本次航海',{ending:'岸上的新生'})]),
event('rumor','高涨的悬赏','酒馆墙上贴出你的画像。船员很兴奋，巡逻队却已在附近。',[o('低调离港','最高通缉−10，声望−3',{special:'cool'}),o('公开夸耀战绩','声望+10，各国通缉+8',{fame:10,allHeat:8}),o('帮助港口贫民','银−20，各国民心+6',{cost:20,allFavor:6,moral:5})],'port'),
event('reef','白沫下的礁石','海图上没有标出这片暗礁。掌舵手让你判断。',[o('放慢速度测深','才学+5，补给−5',{knowledge:5,food:-5}),o('冒险抄近路','船体−15，银+25',{hull:-15,silver:25}),o('修正航路标记','才学+3，声望+3',{knowledge:3,fame:3})]),
event('repair','开裂的龙骨','芬恩发现渗水。继续赶路可能让整条船沉没。',[o('出资紧急修理','银−30，船体+25',{cost:30,hull:25}),o('一起打补丁','船体+15，健康−5，才学+3',{hull:15,hp:-5,knowledge:3}),o('把维护拖到下一港','船体−12，忠诚−5',{hull:-12,loyalty:-5})]),
event('officer','官员的私人邀请','港务官愿意与你保持关系，但并不承诺永远庇护海盗。',[o('支付交际费用','银−25，英格兰民心+10，社交+5',{cost:25,favor0:10,social:5}),o('报告海盗袭击预警','贡献+1，英格兰民心+7',{service:1,favor0:7}),o('拒绝交往','道德+2',{moral:2})],'port'),
event('fair','岸上的赌桌','这里不受船上禁赌条款约束。酒馆人声喧哗。',[o('只听商路消息','才学+4，社交+2',{knowledge:4,social:2}),o('押上20银','一半机会赚30银，否则亏20银',{special:'gamble'}),o('请船员吃饭','银−20，忠诚+8',{cost:20,loyalty:8})],'port'),
event('book','被雨打湿的书','书里写着季风、药草与各地风俗。医生想修好它。',[o('学习医学','才学+6，健康+4',{knowledge:6,hp:4}),o('与医生交流','社交+5，忠诚+2',{social:5,loyalty:2}),o('卖给书商','银+15',{silver:15})]),
event('voteRoute','下一站去哪里','船长允许全船投票选择航线。多数人想追逐银船，少数人想回家。',[o('说服大家先补给','补给+15，社交+4',{food:15,social:4}),o('支持追逐银船','声望+6，补给−12',{fame:6,food:-12}),o('帮助少数人写家书','忠诚+6，道德+3',{loyalty:6,moral:3})]),
event('prize','被遗弃的小艇','小艇上只剩工具和一封求救信，远处似乎有人挥手。',[o('先搜救幸存者','补给−6，各国民心+6',{food:-6,allFavor:6,moral:5}),o('只搬走工具','船体+10，道德−5',{hull:10,moral:-5}),o('转交附近渔民','声望+4，道德+3',{fame:4,moral:3})]),
event('pension','伤员的未来','船员提议将共同收入的一部分设为伤残抚恤金。',[o('支持设立抚恤金','银−15，忠诚+10',{cost:15,loyalty:10,moral:4}),o('建议公开每次结算','社交+5，忠诚+5',{social:5,loyalty:5}),o('反对额外支出','银+10，忠诚−10',{silver:10,loyalty:-10})])];
events.find(e=>e.id==='identity').when=s=>s.hidden;
events.find(e=>e.id==='letter').when=s=>s.framed;
events.find(e=>e.id==='grey').when=s=>s.motive==='复仇'&&s.revenge>=0;
events.find(e=>e.id==='war').when=s=>!s.peace;
function portEvent(s){return event('port'+s.week,'托尔图加的账簿','药材、船坞与总督公署都在等待。靠港服务会花一周，你也可以立即离港。',[o('购买补给并修理','40银：补给+40，船体+25，健康+12',{cost:40,food:40,hull:25,hp:12}),o('看医生与研读海图','25银：健康+25，才学+6',{cost:25,hp:25,knowledge:6}),o('申请英格兰私掠许可','需60银、声望≥15；仅限战时西班牙商船',{special:'license'}),o('离港，驶向外海','练习操帆，回到航海事件',{location:'deck',knowledge:2})],'port');}
function apply(s,eff,rng=Math.random){let t=structuredClone({...s,event:null}),msg=[];if(eff.cost&&t.silver<eff.cost)return {state:s,error:'银钱不足，无法执行。请选择其他行动。'};
if(eff.cost)t.silver-=eff.cost;
for(const[k,v]of Object.entries(eff)){if(['special','cost','target'].includes(k))continue;if(k==='allFavor')t.favor=t.favor.map(n=>clamp(n+v));else if(k==='allHeat')t.heat=t.heat.map(n=>clamp(n+v));else if(/^favor\d$/.test(k))t.favor[+k.at(-1)]=clamp(t.favor[+k.at(-1)]+v);else if(/^heat\d$/.test(k))t.heat[+k.at(-1)]=clamp(t.heat[+k.at(-1)]+v);else if(typeof v==='number')t[k]+=v;else t[k]=v;}
let sp=eff.special,n=t.heat.indexOf(Math.max(...t.heat));
if(sp==='raid'||sp==='warRaid'){let target=eff.target??1,legal=t.licensed&&!t.peace&&target===1,chance=clamp(45+t.combat*.45+t.hull*.2-(sp==='warRaid'?25:0),10,95);if(rng()*100<chance){let gross=sp==='warRaid'?1800:1200,share=shares[t.role]+(t.compensation?1:0),total=45+share,payout=Math.floor(gross*share/total);t.silver+=payout;t.fame+=8;t.loyalty+=3;msg.push(`总战利品${gross}银；你按${share}/${total}股份分得${payout}银。`);}else{t.hp-=18;t.hull-=20;msg.push('接舷失败，船只与人员受伤。');}t.heat[target]=clamp(t.heat[target]+(legal?12:24));t.favor[target]=clamp(t.favor[target]-12);t.moral-=7;if(!legal&&t.licensed){t.licensed=false;t.heat[0]=clamp(t.heat[0]+20);msg.push('越权劫掠导致许可证被收回。');}}
if(sp==='promote'){if(t.role>=4)msg.push('你已是船长，投票确认了你的地位。');else if(t.fame>=10+t.role*10&&t.knowledge>=25+t.role*7&&t.loyalty>=50){t.role++;t.loyalty-=5;msg.push('多数票通过，你晋升为'+roles[t.role]+'。');if(t.role>=3)t.hidden=false;}else msg.push('票数不足：需要声望'+(10+t.role*10)+'、才学'+(25+t.role*7)+'与忠诚50。');}
if(sp==='license'){if(t.peace)msg.push('两国已停战，公署拒绝签发。');else if(t.silver>=60&&t.fame>=15){t.silver-=60;t.licensed=true;msg.push('获得英格兰针对西班牙商船的战时私掠许可。');}else return {state:s,error:'需要60银与15声望。'};}
if(sp==='petition'){if(t.favor[n]>=60){t.heat[n]=0;t.silver+=150;t.ending='万民请愿，赦免归乡';}else t.ending='绞架下的终章';}
if(sp==='bribe'){if(t.silver>=180||t.favor[n]>=40){if(t.favor[n]<40)t.silver-=180;t.heat[n]=30;msg.push('你脱离羁押，但通缉并未完全消失。');}else return {state:s,error:'需要180银，或被捕国民心40。'};}
if(sp==='escape'){if(t.combat+t.hull+rng()*50>=125){t.hull-=20;t.hp-=10;t.heat[n]-=15;msg.push('你冲出了封锁。');}else t.ending='绞架下的终章';}
if(sp==='mutiny'){if(t.social>=55){t.loyalty=45;msg.push('你的陈述赢回了多数船员。');}else t.ending='无名岛的流放者';}
if(sp==='clear'){if(t.moral>=55&&Math.max(...t.favor)>=30)t.ending='洗雪冤名，重回故乡';else msg.push('法官仍需要你善待平民的记录：道德55、任一国民心30。');}
if(sp==='revenge')t.ending='灰隼伏法，恩怨落幕';
if(sp==='revengeBattle'){t.hp-=25;t.heat[1]+=30;if(t.combat>=60)t.ending='炮烟里的复仇';else msg.push('炮击失败，仇船趁雾逃走。');}
if(sp==='storm'){if(t.knowledge>=40){t.hull-=3;t.fame+=4;msg.push('你找到了避风锚地。');}else{t.hull-=20;msg.push('判断错误，船体受损。');}}
if(sp==='steal'){if(rng()<.5)t.ending='私藏战利品的代价';else{t.silver+=75;t.moral-=20;msg.push('这一次没有被发现，但你已违背誓约。');}}
if(sp==='family'){t.social+=5;if(t.loyalty>=45){t.loyalty+=5;msg.push('全体一致同意家眷随行。');}else msg.push('有人投下反对票，必须在岸上安置。');}
if(sp==='allyRaid')t.ending='无名岛的流放者';if(sp==='desert')t.ending='弃船者的军纪审判';
if(sp==='witness'){if(t.social>=40){t.evidence++;msg.push('证人答应出庭。');}else{t.social+=4;msg.push('他仍不信任你，下次需要更好的说辞。');}}
if(sp==='injury'){t.hp-=20;t.disability=1;t.compensation=true;t.silver+=90;t.loyalty+=15;msg.push('失去一只眼；获90银抚恤，今后每次分红额外一股。');}
if(sp==='identity'){if(t.social+t.loyalty>=90){t.hidden=false;t.loyalty+=5;msg.push('全体表决允许你以真实身份留下。');}else t.ending='无名岛的流放者';}
if(sp==='hide'){if(t.silver>=40&&t.loyalty>=50){t.silver-=40;msg.push('船长暂时保守秘密。');}else return {state:s,error:'需要40银与忠诚50。'};}
if(sp==='cool'){t.heat[n]=Math.max(0,t.heat[n]-10);t.fame-=3;}
if(sp==='gamble'){if(t.silver<20)return {state:s,error:'需要20银作为赌本。'};t.silver+=rng()<.5?30:-20;msg.push('赌局结束，请查看钱袋变化。');}
if(sp==='navy'){if(t.service>=8&&t.favor[0]>=50&&t.role>=3)t.ending='受封入籍，海军新章';else return {state:s,error:'需要掌舵手以上、贡献8与英格兰民心50。'};}
if(sp==='retire'){if(t.silver>=650){t.silver-=650;t.ending=Math.max(...t.heat)>=50?'改名隐居，余生戒惧':'金盆洗手，港湾余生';}else return {state:s,error:'需要650银安家资金。'};}
if(sp==='seaEnd')t.ending='黑帆为家，终老海上';
t.turns++;t.week++;t.food-=5;if(t.food<=0){t.hp-=12;t.loyalty-=6;msg.push('补给耗尽：健康−12、忠诚−6。');}if(t.hull<=0)t.ending='风浪中的沉船';
for(const k of ['hp','combat','social','knowledge','moral','food','hull','loyalty','fame'])t[k]=clamp(t[k]);t.combat=Math.min(t.combat,[100,90,70,40][t.disability]);t.silver=Math.max(0,t.silver);t.heat=t.heat.map(v=>clamp(v));if(t.hp<=0)t.ending='海上长眠';if(t.moral<20){t.loyalty=clamp(t.loyalty-4);msg.push('连同伴也开始疏远毫无底线的你。');}
if(s.event)t.seen.push(s.event.id);t.event=null;t.result=msg.join(' ')||'选择已记入日志，船上的日子继续向前。';t.log.unshift(`第${s.week}周 · ${s.event?.title||'港口事务'}：${t.result}`);t.log=t.log.slice(0,80);return {state:t};}
function valid(s){return s&&s.version===1&&typeof s.name==='string'&&motives.includes(s.motive)&&Number.isInteger(s.week)&&s.week>0&&Number.isInteger(s.role)&&s.role>=0&&s.role<=4&&['hp','combat','social','knowledge','moral','food','hull','loyalty','fame'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)&&Number.isFinite(s.silver)&&s.silver>=0&&['heat','favor'].every(k=>Array.isArray(s[k])&&s[k].length===4&&s[k].every(n=>Number.isFinite(n)&&n>=0&&n<=100))&&Array.isArray(s.log)&&s.log.every(x=>typeof x==='string')&&Array.isArray(s.seen)&&['deck','port','battle'].includes(s.location)&&typeof s.hidden==='boolean'&&Number.isInteger(s.disability)&&s.disability>=0&&s.disability<=3;}
return {KEY,countries,roles,shares,motives,crew,create,encounter,apply,valid,events};})();
if(typeof module!=='undefined')module.exports=Pirate;
