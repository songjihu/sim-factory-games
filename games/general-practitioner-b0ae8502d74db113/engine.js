const Engine=(()=>{
 const ability=['clinical','research','talk','teach'],relations=['boss','team','family','mentor'];
 const cap=(x,a,b)=>Math.max(a,Math.min(b,x));
 function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
 const month=s=>Math.floor(s.week%48/4)+1;
 const date=s=>`${2026+Math.floor(s.week/48)}.${month(s)} · 第${s.week%4+1}周`;
 const age=s=>23+Math.floor(s.week/48);
 const rank=n=>n>=95?'S':n>=80?'A':n>=65?'B':n>=45?'C':n>=25?'D':'E';
 function fresh(seed=Date.now(),trait='沉稳',route=0){
  let s={version:2,seed:Number(seed)>>>0,week:0,trait,route,phase:'研究生',phaseStart:0,degree:D.routes[route].degree,cert:false,training:0,clinical:10,research:10,talk:10,teach:3,boss:50,team:50,family:55,mentor:50,health:95,mood:80,stress:25,money:25000,exp:0,sci:0,core:0,other:0,credits:0,completed:0,failed:0,grants:[],projects:[],submissions:[],papers:[],title:0,position:0,job:'病房',focus:'均衡',teaching:'正常',department:'普通全科',teamSkill:15,lifestyle:'运动',lifestyleWeeks:0,housing:D.routes[route].dorm?0:1,owned:false,mortgage:0,houseValue:0,priceIndex:1,leave:2,partner:'单身',affection:0,children:[],patients:[],nextPatient:1,admitted:0,discharged:0,followups:0,reputation:20,community:0,weekend:0,actions:{},pending:null,delayed:[],logs:[],history:[],monthly:[],lastNet:0,lastIncome:0,lastExpense:0,lastTitleReview:-1,lastGrant:{},seen:{},careerMoves:0,researchHonors:[],reminders:[],ending:null};
  s.birthplace=['北京','上海','成都','武汉'][Math.floor(random(s)*4)];s.gender=random(s)<.5?'女':'男';s.familyBackground=random(s)<.45?'老家有一套房':'普通家庭';s.clinical+=Math.floor(random(s)*7);s.research+=Math.floor(random(s)*7);s.talk+=Math.floor(random(s)*6);s.clinical+=route===0?6:0;s.research+=route===1?8:route===2?14:0;
  record(s,'进入'+D.routes[route].name+'，开始'+s.degree+'培养。',true);return s;
 }
 function record(s,text,milestone=false){s.logs.unshift({week:s.week,text});s.logs=s.logs.slice(0,200);if(milestone)s.history.unshift({week:s.week,text})}
 function normalize(s){for(let k of [...ability,...relations,'health','mood','reputation','teamSkill'])s[k]=cap(s[k],0,100);s.stress=cap(s.stress,0,360);s.leave=Math.max(0,s.leave);s.money=Math.round(s.money);s.exp=Math.max(0,s.exp)}
 function delta(s,e){for(let [k,v]of Object.entries(e)){if(k==='money'&&v<0&&s.money< -30000)continue;s[k]+=v}normalize(s)}
 function gate(s,id){return s.actions[id]!==s.week}
 function once(s,id,fn){if(!gate(s,id))return '本周已安排，下周可再次执行。';let r=fn();if(r)return r;s.actions[id]=s.week;normalize(s);return null}
 function qualification(s){if(s.phase==='研究生')return `${s.degree}第${Math.floor((s.week-s.phaseStart)/48)+1}年`;if(s.phase==='规培')return `社会规培第${Math.floor((s.week-s.phaseStart)/48)+1}年`;return '已获规培资格'}
 function title(s){return ['住院医师','主治医师','副主任医师','主任医师'][s.title]}
 function position(s){return ['普通医生','医疗组长','病区副主任','病区主任','返聘专家'][s.position]}
 function publishChoice(s,title,body,options,kind='event',meta={}){s.pending={title,body,options,kind,...meta}}
 function progression(s){let elapsed=s.week-s.phaseStart;
  if(s.phase==='研究生'&&elapsed>=(s.degree==='博士'?3:D.routes[s.route].years)*48){
   let req=['直博','博士'].includes(s.degree)?3:1;let have=s.degree==='专硕'?s.core+s.sci+s.other:s.core+s.sci;
   if(have<req||s.exp<8){if(s.week%12===0)publishChoice(s,'毕业考核尚未通过',`毕业需要${req}篇成果及8点积累。目前成果${have}篇、积累${s.exp.toFixed(1)}。延长培养期间继续领取补助。`,[{label:'继续完成毕业要求',effect:{stress:8},note:'培养延期一个季度，继续积累。'}],'notice');return}
   if(s.degree==='专硕'){s.phase='工作';s.cert=true;s.training=3;if(!s.owned&&s.housing===0){s.housing=1;record(s,'培养结束，迁出宿舍，改为合租。')}record(s,'专硕毕业，取得规培证书，进入住院医师岗位。',true)}
   else publishChoice(s,'毕业后的去向','学术培养结束，你需要决定下一站。',[
    {label:'进入社会规培 · 三年临床训练',code:'residency'},
    ...(s.degree==='学硕'?[{label:'申请继续读博 · 三年，科研与导师关系影响录取',code:'phd'}]:[]),
    {label:'离开临床，转入科研岗位',code:'researchCareer'}],'career');
  }
  if(s.phase==='规培'&&elapsed>=144){if(s.clinical>=35){s.phase='工作';s.cert=true;s.training=3;if(!s.owned&&s.housing===0){s.housing=1;record(s,'培养结束，迁出宿舍，改为合租。')}record(s,'通过规培结业考核，获得独立岗位资格。',true)}else if(s.week%12===0)record(s,'规培结业需要临床35，当前能力不足，延长培养。')}
 }
 function promotion(s){let clinical=[0,40,63,82],credits=[0,2,5,10],experience=[0,6,11,17];let target=s.title+1;
  if(target>3)return '已取得最高职称。';if(!s.cert)return '尚未取得规培资格。';if(s.week/48<experience[target]||s.clinical<clinical[target]||s.credits<credits[target])return `需生涯${experience[target]}年、临床${clinical[target]}、论文积分${credits[target]}。`;
  if(month(s)!==9)return '职称申报窗口为每年9月。';if(s.lastTitleReview===Math.floor(s.week/48))return '本年度已经评审过。';return null
 }
 function appoint(s,p){if(p===0)return null;if(p===4)return age(s)>=60&&s.title>=2?null:'返聘需60岁及副主任以上职称。';let c=[0,45,65,78],t=[0,1,2,3];if(s.title<t[p]||s.clinical<c[p]||s.team<45||s.boss<50)return `需${['','主治','副主任','主任'][p]}职称、临床${c[p]}、上级50、同事45。`;return null}
 function estimate(s,i){return cap(D.grants[i].chance+(s.research-45)/250+(s.mentor-50)/500+s.completed*.015,.08,.9)}
 function grantGate(s,i){let g=D.grants[i];if(month(s)!==g.apply)return `${g.apply}月申报`;if(s.lastGrant[i]===Math.floor(s.week/48))return '本年已申报';if(s.projects.some(p=>p.level>=i)||s.grants.some(p=>p.level>=i))return '已有同级或更高级在研／待审项目';if(s.research<g.ability)return `科研能力需${g.ability}`;if(i>=3&&s.degree!=='博士'&&s.degree!=='直博')return '国家项目需要博士学历';if(i===3&&age(s)>40)return '青年基金年龄要求40岁及以下';if(i>=4&&s.completed<2)return '需结题2项';if(s.exp<6)return '需积累6';return null}
 function admit(s){let id=s.nextPatient++;let types=['高血压长期照护','糖代谢异常随访','儿童反复不适评估','老年多病共存','出院康复衔接','睡眠与生活压力'];let p={id,name:['陈','王','李','周','赵','刘'][Math.floor(random(s)*6)]+'某',age:18+Math.floor(random(s)*65),type:types[Math.floor(random(s)*types.length)],stage:0,progress:8,trust:35+Math.floor(random(s)*20),risk:15+Math.floor(random(s)*30),visits:0,missed:0,admit:s.week,lastSeen:s.week,community:false,notes:[]};s.patients.push(p);s.admitted++;record(s,`${p.name}进入${s.job==='病房'?'病房':'门诊'}照护：${p.type}。`)}
 function patientAction(s,id,a){let p=s.patients.find(p=>p.id===id);if(!p)return '患者已转出。';return once(s,'patient'+id,()=>{
  if(a==='history'){p.stage=Math.max(1,p.stage);p.progress+=8;p.trust+=7;s.talk+=.7;s.stress+=3;p.notes.unshift('补充病史，记录生活方式、家庭支持与既往就诊资料。')}
  if(a==='review'){if(p.stage<1)return '请先完成病史与生活情况沟通。';p.stage=Math.max(p.stage,2);p.progress+=12+s.clinical/10;p.risk-=7;s.clinical+=.7;s.stress+=5;p.notes.unshift('联合上级复核资料并形成进一步评估计划。')}
  if(a==='plan'){if(p.stage>=3)return '照护计划已制定，请进行复诊随访。';if(p.stage<2)return '需要先完成团队评估。';p.stage=3;p.progress+=12;p.trust+=5;s.exp+=.25;s.stress+=3;p.notes.unshift('与患者共同约定照护目标和复查时间。')}
  if(a==='follow'){if(p.stage<3)return '请先形成连续照护计划。';p.progress+=10+s.talk/10;p.trust+=4;p.risk-=4;p.visits++;s.followups++;s.reputation+=.4;s.stress+=2;p.notes.unshift('核实计划执行、复诊障碍与生活中的变化。')}
  if(a==='community'){if(p.stage<3)return '请先完成评估与照护计划，再转入社区。';if(p.progress<65||p.trust<45||p.risk>50)return '转社区需照护进度65、信任45、风险不高于50。';p.community=true;p.progress=100;s.community++;s.reputation+=2;p.notes.unshift('与社区护士完成交接，进入基层长期随访。')}
  if(a==='discharge'){if(p.stage<3)return '请先完成评估与照护计划，再结束本阶段照护。';if(p.progress<80||p.risk>50)return '出院／结案需进度80、风险不高于50。';p.progress=100;s.discharged++;s.exp+=1;s.reputation+=1}
  p.lastSeen=s.week;p.missed=0;p.trust=cap(p.trust,0,100);p.risk=cap(p.risk,0,100);if(['community','discharge'].includes(a)){record(s,`${p.name}${p.community?'转社区长期管理':'完成本阶段照护'}，随访${p.visits}次。`,true);s.patients=s.patients.filter(x=>x.id!==id)}else record(s,`${p.name}：${p.notes[0]}`);
 })}
 function choose(s,index){let p=s.pending;if(!p||!p.options[index])return '没有待处理选择。';let o=p.options[index];if(o.code==='rest'&&s.money<8000)return '身心休整需要8000元，可选择降低负荷。';if(o.effect?.money<0&&s.money< -o.effect.money)return '资金不足，不能执行这项选择。';if(o.effect?.leave<0&&s.leave<1)return '年假不足，请选择其他方案。';s.pending=null;
  delta(s,o.effect||{});record(s,p.title+'：'+o.label+'。'+(o.note||''));
  if(p.kind==='event'){s.delayed.push({due:s.week+4,title:p.title,category:p.category,positive:index===0});s.seen[p.eventId]=(s.seen[p.eventId]||0)+1}
  if(o.code==='residency'){s.phase='规培';s.phaseStart=s.week;record(s,'进入三年社会规培。',true)}
  if(o.code==='phd'){if(random(s)<.45+s.research/200+s.mentor/500){s.phase='研究生';s.phaseStart=s.week;s.route=2;s.degree='博士';record(s,'考博录取，开始博士培养。',true)}else{s.phase='规培';s.phaseStart=s.week;record(s,'考博未录取，选择进入社会规培。',true)}}
  if(o.code==='researchCareer')finish(s,'学术转身');
  if(o.code==='revision'){let sub=s.submissions.find(x=>x.id===p.subId);if(sub){if(s.exp<3){sub.status='退稿';s.exp+=sub.cost/2;record(s,'返修积累不足，稿件撤回并返还部分积累。')}else{s.exp-=3;sub.status='返修中';sub.due=s.week+4;sub.chance=Math.min(.95,sub.chance+.22)}}}
  if(o.code==='withdraw'){let sub=s.submissions.find(x=>x.id===p.subId);if(sub){sub.status='撤稿';s.exp+=sub.cost/2}}
  if(o.code==='extend'){let pr=s.projects.find(x=>x.id===p.projectId);if(pr){pr.deadline+=48;pr.extended=true;s.stress+=15;record(s,'课题获一次延期，期限增加一年。')}}
  if(o.code==='failProject'){s.projects=s.projects.filter(x=>x.id!==p.projectId);s.failed++;s.reputation-=5;record(s,'课题未通过结题，信誉受影响。',true)}
  if(o.code==='rest'){s.stress=70;s.health=Math.max(30,s.health);s.mood=50;s.money-=8000;s.actions.weekend=s.week;record(s,'暂停额外工作，开始身心休整，本周不再额外加班。',true)}
  if(o.code?.startsWith('end:'))finish(s,o.code.slice(4));normalize(s);return null
 }
 function event(s,force=false){if(s.pending||s.ending)return;let eligible=D.events.map((e,i)=>({e,i})).filter(({e})=>e[6]!=='late'||age(s)>=55).filter(({e})=>e[6]!=='research'||s.research>=15).filter(({e})=>e[6]!=='family'||s.partner!=='单身'||s.family<50);let unseen=eligible.filter(x=>!s.seen[x.i]);let pool=unseen.length?unseen:eligible;let {e,i}=pool[Math.floor(random(s)*pool.length)];publishChoice(s,e[0],e[1],[{label:e[2],effect:e[3]},{label:e[4],effect:e[5]}],'event',{category:e[6],eventId:i})}
 function income(s){return s.phase==='研究生'?D.routes[s.route].stipend:s.phase==='规培'?6500:9500+s.title*4200+s.position*2200+Math.round(s.reputation*35)+(s.job==='病房'?1800:s.job==='门诊为主'?2400:800)}
 function expense(s){return 2600+(s.owned?900:Math.round(D.homes[s.housing].rent*s.priceIndex))+s.children.filter(c=>!c.adult).length*1800+(s.partner==='已婚'?1200:0)+(s.lifestyle==='放纵'?1800:s.lifestyle==='社交'?800:300)+(s.mortgage>0?Math.min(s.mortgage,2500)+1000:0)}
 function monthly(s){normalize(s);let beforeStress=s.monthStartStress??25,beforeHealth=s.health,beforeMood=s.mood,inc=income(s),out=expense(s);s.money+=inc-out;s.lastIncome=inc;s.lastExpense=out;s.lastNet=inc-out;s.monthStartStress=s.stress;if(s.mortgage>0)s.mortgage=Math.max(0,s.mortgage-2500);s.priceIndex=cap(s.priceIndex+(random(s)-.4)*.012,.7,2);
  s.health-=s.stress>200?3:s.stress>100?1.1:.2;s.mood-=s.stress>200?7:s.stress>100?2:0;s.family-=s.lifestyle==='顾家'?0:1.5;
  if(s.lifestyle==='顾家'){s.family+=2;s.affection+=2}if(s.partner!=='单身'&&s.affection<20&&s.week>100)record(s,'亲密关系需要更多陪伴与沟通。');
  let m={week:s.week,income:inc,expense:out,net:inc-out,stress:[beforeStress,s.stress],health:s.health-beforeHealth,mood:s.mood-beforeMood,project:s.projects.map(p=>p.name+' '+Math.floor(p.progress)+'%'),in:s.admitted,out:s.discharged};s.monthly.unshift(m);s.monthly=s.monthly.slice(0,60);s.admitted=0;s.discharged=0;
  for(let app of s.grants.filter(a=>a.due<=s.week)){let g=D.grants[app.level];if(random(s)<app.chance){s.projects.push({id:app.id,level:app.level,name:g.name,progress:0,budget:g.fund,spent:0,deadline:s.week+g.years*48,startSci:s.sci,startCore:s.core,extended:false});record(s,g.name+'获批，经费'+g.fund+'元进入项目专账。',true)}else record(s,g.name+'未获批，评审建议继续完善前期基础。')}s.grants=s.grants.filter(a=>a.due>s.week);
  if(s.patients.length<(s.job==='病房'?6:4))admit(s);
 }
 function finish(s,name){s.ending={name,week:s.week,score:Math.round(cap(s.clinical*.25+s.research*.15+s.teach*.1+s.reputation*.2+s.family*.1+s.health*.2,0,100)),title:title(s),money:s.money,sci:s.sci,core:s.core,completed:s.completed,children:s.children.length};record(s,'生涯结束：'+name,true)}
 function retirement(s){if(s.position===4)return '返聘专家';if(s.position>=3&&s.completed>=4)return '学科带头人';if(s.community>=40)return '社区守护者';if(s.sci>=15)return '科研领航';if(s.teach>=80&&s.teamSkill>=75)return '桃李满园';if(s.position>=3)return '病区掌舵人';if(s.clinical>=90&&s.reputation>=80)return '杏林名医';if(s.followups>=100&&s.reputation>=70)return '仁心仁术';if(s.community>=15)return '基层扎根';if(s.partner==='已婚'&&s.family>=80&&s.children.length)return '家庭港湾';if(s.family>=80)return '温暖余生';if(s.careerMoves>=2)return '跨城新章';if(s.title>=2)return '功成身退';return '平凡坚守'}
 function tick(s){if(s.pending||s.ending)return false;s.week++;s.lifestyleWeeks++;
  let work=s.job==='病房'?6:s.job==='科研为主'?3:s.job==='社区服务'?3.5:4.5,load=s.patients.length*.35+s.position*.45;
  s.stress+=(work+load)*(s.trait==='沉稳'?.8:1);let life=D.lifestyles.find(x=>x[0]===s.lifestyle);s.stress+=life[1];s.health+=life[2]*.25;s.mood+=life[3]+(s.trait==='乐天'?.6:0);s.stress+=(s.owned?-1:D.homes[s.housing].stress)*.3;
  let growth=s.phase==='研究生'&&s.route>0?.07:.18;s.clinical+=growth+(s.focus==='临床'?.17:0);s.research+=.06+(s.focus==='科研'?.18:0)+(s.job==='科研为主'?.15:0);s.talk+=(s.focus==='沟通'?.23:.08)*(s.trait==='敏感'?1.4:1);s.teach+=s.teaching==='手把手'?.18:s.teaching==='正常'?.06:.01;s.teamSkill+=s.teaching==='手把手'?.16:.06;if(s.teaching==='手把手')s.stress+=1.3;
  let accumulation=.10+s.research/400+(s.focus==='科研'?.2:0);s.exp+=accumulation*(s.projects.length?.5:1);if(s.lifestyle==='埋头干'){s.clinical+=.12;s.exp+=.15}if(s.lifestyle==='社交')s.team+=.15;if(s.lifestyle==='顾家'){s.family+=.2;s.affection+=.3}if(s.job==='社区服务')s.reputation+=.1;
  for(let p of s.patients){if(s.week-p.lastSeen>=4){p.missed++;p.risk=cap(p.risk+2,0,100);p.trust=cap(p.trust-1,0,100)}p.progress=Math.min(95,p.progress+(s.job==='病房'?1.2:.7))}
  for(let p of s.projects){if(p.progress>=100)continue;let step=.25+s.research/150+(s.job==='科研为主'?.25:0);if(p.budget>=300){p.progress=Math.min(100,p.progress+step);p.budget-=300;p.spent+=300}else if(s.week%12===0)record(s,p.name+'经费不足，进度暂停，可投入个人经费。')}
  for(let item of s.delayed.filter(x=>x.due<=s.week)){let k={clinical:'clinical',community:'reputation',teaching:'teach',research:'research',family:'family',relationship:'team',life:'health',career:'boss',late:'teach'}[item.category]||'talk';s[k]+=item.positive?1:.5;record(s,item.title+'后续：'+(item.positive?'投入转化为经验，安排得以落实。':'稳妥的安排保留了后续空间。'))}s.delayed=s.delayed.filter(x=>x.due>s.week);
  if(s.week%4===0)monthly(s);if(s.week%48===0){s.leave=3;record(s,'新年度年假已发放，职称申报在9月开放。');for(let c of s.children){if(s.week-c.born>=18*48&&!c.adult){c.adult=true;record(s,'孩子长大成人，开始自己的生活。',true)}}if(!s.owned&&s.housing===0&&s.phase==='工作'){s.housing=1;record(s,'培养阶段结束，迁出宿舍，改为合租。')}}
  normalize(s);if(s.health<=5){finish(s,'提前离岗');return true}if(s.money< -60000){finish(s,'经济转向');return true}if(age(s)>=65){finish(s,retirement(s));return true}
  for(let sub of s.submissions.filter(x=>['审稿中','返修中'].includes(x.status)&&x.due<=s.week)){let roll=random(s);if(roll<sub.chance){sub.status='录用';s.sci+=sub.sci||0;s.core+=sub.core||0;s.other+=!sub.sci&&!sub.core?1:0;s.credits+=sub.credit;s.papers.unshift({...sub,published:s.week});record(s,sub.name+'论文录用。',true)}else if(sub.status==='审稿中'&&roll<sub.chance+.25){sub.status='待返修';publishChoice(s,'论文返修意见','审稿人要求补充分析。返修需要3点积累，重新审稿4周。',[{label:'认真返修 · 积累−3',code:'revision'},{label:'撤回并返还一半投稿积累',code:'withdraw'}],'review',{subId:sub.id});break}else{sub.status='退稿';s.exp+=sub.cost/2;record(s,sub.name+'退稿，返还一半投稿积累。')}}
  if(s.pending)return true;
  for(let p of s.projects){let g=D.grants[p.level],enough=s.sci-p.startSci>=g.sci&&s.core-p.startCore>=g.core;if(p.progress>=100&&enough){s.completed++;s.projects=s.projects.filter(x=>x.id!==p.id);s.exp+=8;s.reputation+=3;record(s,p.name+'结题通过，剩余经费按项目规则封存。',true);if(s.completed===3)s.researchHonors.push('青年学术骨干')}else if(s.week>=p.deadline){publishChoice(s,'课题结题期限已到',`${p.name}需进度100%、SCI ${g.sci}篇、核心${g.core}篇（立项后的新增成果）。当前尚未达标。`,[...(!p.extended?[{label:'申请延期一年 · 压力+15',code:'extend'}]:[]),{label:'接受未通过结题',code:'failProject'}],'project',{projectId:p.id});break}}
  normalize(s);if(s.pending)return true;progression(s);if(s.pending)return true;
  if(s.stress>=220&&s.week%4===0){publishChoice(s,'负荷已经超出承受','你需要重新安排工作与生活。',[{label:'接受身心休整 · ¥8000',code:'rest'},{label:'降低负荷，暂缓额外任务',effect:{stress:-55,mood:5,exp:-2}},{label:'结束临床生涯，身心重整',code:'end:身心重整'}],'pressure');return true}
  if(s.autoTrip&&s.stress>=140&&s.leave>0&&s.money>=2500){s.leave--;s.money-=2500;s.stress-=70;s.mood+=8;record(s,'自动安排一次旅行，使用一周年假与2500元。')}if(s.week%5===0)event(s);normalize(s);return true
 }
 function action(s,type,arg){if(s.ending)return '本局已结束，可查看生涯或重新开局。';if(s.pending)return '请先处理待决定事项。';let result=null;
  if(type==='patient')return patientAction(s,arg.id,arg.action);
  if(type==='lifestyle'){if(s.lifestyle!==arg)s.lifestyleWeeks=0;s.lifestyle=arg}
  if(type==='job'){if(arg==='科研为主'&&s.research<25)return '科研重心需科研25。';s.job=arg}
  if(type==='focus')s.focus=arg;if(type==='teaching')s.teaching=arg;if(type==='department'){if(s.department===arg)return null;s.department=arg;s.stress+=3;record(s,'工作科室调整为'+arg)}
  if(type==='housing'){if(arg===0&&s.phase==='工作')return '在读与规培阶段才能申请宿舍。';if(s.owned)return '当前已入住自有住房。';if(s.housing===arg)return null;if(s.money<1000)return '搬家需1000元。';s.money-=1000;s.housing=arg;record(s,'搬入'+D.homes[arg].name+'，搬家支出1000元。')}
  if(type==='buy'){if(s.owned)return '已拥有住房。';let price=Math.round(900000*s.priceIndex),down=Math.round(price*.3);if(s.money<down)return '首付需'+down+'元。';s.money-=down;s.owned=true;s.mortgage=price-down;s.houseValue=price;s.family+=8;record(s,'购入住房，首付'+down+'，按月还贷3500元。',true)}
  if(type==='repay'){if(s.mortgage<=0)return '没有待还房贷。';let amount=Math.min(s.mortgage,50000);if(s.money<amount)return '提前还贷需要'+amount+'元。';s.money-=amount;s.mortgage-=amount}
  if(type==='autoTrip')s.autoTrip=!s.autoTrip;
  if(type==='rest')result=once(s,'rest',()=>{s.stress-=18;s.mood+=3;record(s,'短暂歇息，压力−18、心态+3。')});
  if(type==='team')result=once(s,'team',()=>{if(s.money<3000)return '团建需3000元。';s.money-=3000;s.team+=7;s.stress-=10;record(s,'组织团建，同事+7、压力−10。')});
  if(type==='shift')result=once(s,'shift',()=>{s.stress+=18;s.team+=5;s.money+=600;s.clinical+=.5;record(s,'主动替班，获得补贴600元，同事+5、压力+18。')});
  if(type==='trip'||type==='vacation')result=once(s,'vacation',()=>{if(s.actions.weekend===s.week)return '本周已安排科研或休整，不能再申请年假。';if(s.leave<1)return '需要一周年假。';if(type==='trip'&&s.money<2500)return '旅行需2500元。';s.leave--;s.stress-=type==='trip'?70:50;s.health+=3;s.mood+=8;if(type==='trip')s.money-=2500;record(s,'已安排一周年假，本周暂停额外任务。');s.actions.weekend=s.week});
  if(type==='weekend')result=once(s,'weekend',()=>{s.stress+=14;s.exp+=1*(s.projects.length?.5:1);s.research+=.5;s.weekend++;for(let p of s.projects)p.progress=Math.min(100,p.progress+1.4);record(s,'周末科研：压力+14，积累与在研进度增加。')});
  if(type==='social')result=once(s,'social',()=>{if(s.money<500)return '社交需500元。';s.money-=500;s.affection+=10;if(s.partner==='单身'&&s.affection>=30){s.partner='恋爱中';record(s,'你与一位互相理解的人开始交往。',true)}else record(s,'认真相处，亲密度+10。');s.mood+=4});
  if(type==='marry'){if(s.partner!=='恋爱中'||s.affection<60||s.money<20000)return '需恋爱中、亲密度60和20000元。';s.money-=20000;s.partner='已婚';s.family+=8;record(s,'你们决定共同生活。',true)}
  if(type==='family')result=once(s,'family',()=>{s.family+=5;s.affection+=5;s.stress-=8;record(s,'留出陪伴家人的时间，家庭+5、亲密度+5。')});
  if(type==='baby'){if(s.partner!=='已婚'||s.money<25000||s.children.length>=3)return '需已婚、25000元储备，最多三个孩子。';if(age(s)>50)return '当前阶段不再新增育儿计划。';s.money-=25000;s.children.push({born:s.week,adult:false});s.family+=8;s.stress+=15;record(s,'家庭迎来新成员，每月育儿支出增加。',true)}
  if(type==='mentor')result=once(s,'mentor',()=>{s.mentor+=4;s.research+=.8;s.stress+=4;record(s,'与导师讨论研究问题，导师关系+4。')});
  if(type==='promote'){result=promotion(s);if(!result){s.lastTitleReview=Math.floor(s.week/48);if(random(s)<.65+s.boss/300){s.title++;record(s,'职称评审通过，获聘'+title(s)+'。',true)}else record(s,'本年职称评审未通过，请继续完善条件。')}}
  if(type==='appoint'){result=appoint(s,arg);if(!result){s.position=arg;record(s,'岗位调整为'+position(s)+'。',true)}}
  if(type==='journal'){let j=D.journals[arg];if(s.exp<j.cost)return '需要积累'+j.cost+'。';if(s.submissions.filter(x=>['审稿中','返修中','待返修'].includes(x.status)).length>=3)return '最多同时处理三篇稿件。';let pr=s.projects.find(p=>p.budget>=j.fee);if(j.fee&&!pr&&s.money<j.fee)return '版面费不足：'+j.fee+'元。';s.exp-=j.cost;if(j.fee){if(pr){pr.budget-=j.fee;pr.spent+=j.fee}else s.money-=j.fee}let due=s.week+j.weeks[0]+Math.floor(random(s)*(j.weeks[1]-j.weeks[0]+1));s.submissions.push({...j,id:s.week+'-'+Math.floor(random(s)*1e9),due,status:'审稿中',chance:cap(j.chance+s.research/500,.1,.96)});record(s,j.name+'投稿，预计'+(due-s.week)+'周后收到意见。')}
  if(type==='grant'){result=grantGate(s,arg);if(!result){let g=D.grants[arg],months=(g.result-month(s)+12)%12;s.exp-=6;s.lastGrant[arg]=Math.floor(s.week/48);s.grants.push({id:s.week+'g'+arg,level:arg,due:s.week+months*4-s.week%4,chance:estimate(s,arg)});record(s,'申报'+g.name+'，'+g.result+'月公布结果。',true)}}
  if(type==='fund'){let p=s.projects.find(x=>x.id===arg);if(!p)return '项目不存在。';if(s.money<5000)return '需个人资金5000元。';s.money-=5000;p.budget+=5000;record(s,'个人投入5000元支持'+p.name)}
  if(type==='retire'){if(age(s)<60)return '60岁起可申请提前退休。';finish(s,retirement(s));}
  if(type==='move'){if(s.phase!=='工作')return '工作阶段才能申请调动。';if(s.money<10000)return '跨城调动需10000元。';s.money-=10000;s.careerMoves++;s.boss=45;s.team=45;s.stress+=20;record(s,'完成跨城调动，重新建立团队关系。',true)}
  if(type==='exit'){let options=[{label:'继续行医',effect:{}},{label:'转入公共卫生管理 · 结束本局',code:'end:公共卫生之路'},...['独立诊所','转入医企','公共卫生之路','学术转身','主动告别'].map(x=>({label:x+' · 结束本局',code:'end:'+x}))];publishChoice(s,'考虑另一条路','转行将结束本局，并生成独立生涯档案。',options,'exit')}
  normalize(s);return result
 }
 function validate(s){
  const fail=()=>{throw Error('存档数据损坏或不完整')},obj=x=>x&&typeof x==='object'&&!Array.isArray(x),finite=x=>typeof x==='number'&&Number.isFinite(x);
  if(!obj(s)||s.version!==2)fail();const template=fresh(1);for(let [k,v]of Object.entries(template)){if(typeof v==='number'&&!finite(s[k]))fail();if(typeof v==='string'&&typeof s[k]!=='string')fail();if(typeof v==='boolean'&&typeof s[k]!=='boolean')fail();if(Array.isArray(v)&&!Array.isArray(s[k]))fail()}
  if(!Number.isInteger(s.week)||s.week<0||s.week>5000||!Number.isInteger(s.route)||!D.routes[s.route]||!Number.isInteger(s.housing)||!D.homes[s.housing]||!Number.isInteger(s.title)||s.title<0||s.title>3||!Number.isInteger(s.position)||s.position<0||s.position>4||!['研究生','规培','工作'].includes(s.phase))fail();
  if(!D.traits.some(x=>x[0]===s.trait)||!D.lifestyles.some(x=>x[0]===s.lifestyle)||!['病房','门诊为主','科研为主','社区服务'].includes(s.job)||!['临床','沟通','科研','均衡'].includes(s.focus)||!['正常','点到为止','手把手'].includes(s.teaching))fail();
  for(let k of ['actions','lastGrant','seen']){if(!obj(s[k])||Object.values(s[k]).some(x=>!finite(x)))fail()}
  for(let k of [...ability,...relations,'health','mood','reputation','teamSkill'])if(s[k]<0||s[k]>100)fail();if(s.stress<0||s.stress>360||s.mortgage<0)fail();
  const records=a=>a.forEach(x=>{if(!obj(x)||!finite(x.week)||typeof x.text!=='string')fail()});records(s.logs);records(s.history);
  for(let p of s.patients){if(!obj(p)||!['id','age','stage','progress','trust','risk','visits','missed','admit','lastSeen'].every(k=>finite(p[k]))||typeof p.name!=='string'||typeof p.type!=='string'||!Array.isArray(p.notes)||p.notes.some(x=>typeof x!=='string')||!Number.isInteger(p.stage)||p.stage<0||p.stage>3)fail()}
  for(let p of s.projects)if(!obj(p)||!D.grants[p.level]||!['progress','budget','spent','deadline','startSci','startCore'].every(k=>finite(p[k]))||typeof p.name!=='string'||typeof p.id!=='string')fail();
  for(let a of s.grants)if(!obj(a)||!D.grants[a.level]||!finite(a.due)||!finite(a.chance)||typeof a.id!=='string')fail();
  for(let a of [...s.submissions,...s.papers])if(!obj(a)||typeof a.name!=='string'||typeof a.id!=='string'||!['审稿中','返修中','待返修','录用','退稿','撤稿'].includes(a.status)||!['due','chance','cost','credit'].every(k=>finite(a[k])))fail();
  for(let x of s.children)if(!obj(x)||!finite(x.born)||typeof x.adult!=='boolean')fail();
  for(let x of s.delayed)if(!obj(x)||!finite(x.due)||typeof x.title!=='string'||typeof x.category!=='string')fail();
  for(let x of s.monthly)if(!obj(x)||!['week','income','expense','net','health','mood','in','out'].every(k=>finite(x[k]))||!Array.isArray(x.stress)||x.stress.length!==2||x.stress.some(n=>!finite(n)))fail();
  if(s.pending!==null){let x=s.pending;if(!obj(x)||typeof x.title!=='string'||typeof x.body!=='string'||!Array.isArray(x.options)||!x.options.length)fail();for(let o of x.options){if(!obj(o)||typeof o.label!=='string')fail();if(o.effect&&(!obj(o.effect)||Object.entries(o.effect).some(([k,v])=>!finite(template[k])||!finite(v))))fail()}}
  return s
 }

 return {fresh,random,month,date,age,rank,record,normalize,delta,gate,qualification,title,position,promotion,appoint,estimate,grantGate,income,expense,action,choose,tick,validate,finish,retirement,event};
})();
