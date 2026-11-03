'use strict';
const STORY=(()=>{
 const nodes={},items={},flagKeys=['boundary','proof','speed','joint','grip','legacyProof','legacyCare','legacyFamily'];
 const people={empress:{name:'沈令仪',role:'懿宁太后 · 你',art:'council',bio:'旧局已破，印仍在手。你要学会让决定真正被执行，也要接受自己的决定受到核验。'},east:{name:'陆静徽',role:'昭宁太后',art:'accounts',bio:'愿意合作，也会核你的账。她不靠永远退让维持两宫关系。'},prince:{name:'承珩',role:'亲王',art:'keys',bio:'有能办事的班底，也有不能无限承受的责任。他愿交接，不代表愿受永远含糊的指责。'},attendant:{name:'闻笙',role:'掌事宫女',art:'whisper',bio:'你独立消息的经手，也有自己想保护的人。忠心不意味着永远没有遗漏。'},guard:{name:'顾行舟',role:'宫门侍卫',art:'rain',bio:'希望两道相反的令能被查清，而不是让值夜的人凭贵人的口气猜。'},courier:{name:'赵砚',role:'内廷近侍',art:'rain',bio:'仍愿替你奔走，正在学会先报差错，而不是替你藏好差错。'},child:{name:'晏儿',role:'幼帝',art:'lesson',bio:'大人说都为他好，他更想知道自己为什么这样累。'}};
 const schemes={boundary:{fx:{power:3,court:1,silver:-2},tags:{boundary:1}},proof:{fx:{power:2,court:2,silver:-1},tags:{proof:1}},speed:{fx:{court:4,power:-2,bond:-1,silver:2},tags:{speed:1}},joint:{fx:{bond:3,power:1,silver:-1},tags:{joint:1}},grip:{fx:{power:5,bond:-3,court:-1,silver:-2},tags:{grip:1}}};
 const C=(label,result,type,extra={})=>({label,result,...schemes[type],...extra});
 CASES.forEach((c,k)=>{
  items['e'+k]={id:'e'+k,title:c.clue,text:c.detail,kind:'原件',chapter:k};
  items['r'+k]={id:'r'+k,title:'本案职责',text:'亲核：后续每次决定额外耗银1、权柄+1；限期委办：后续每次决定执行+1、权柄−1；共同覆核：后续每次决定两宫+1、耗银1。只对本案有效。银不足时不透支，办差只能动用现有资源。案首可以选不同权限，不会一次改变全部路线。',kind:'权限',chapter:k};
  items['p'+k]={id:'p'+k,title:'在场与责任',text:people[c.who].name+'负责本次回话。你是最终核准的人；把事情委给别人不等于能让别人承担所有后果。原件写出的只是可查事实，不能代替完整的判断。',kind:'人物',chapter:k};
  c.scenes.forEach((text,t)=>{
   const id='m'+(k*6+t);let options;
   if(t===0)options=[C('亲核 · 每次耗银1','你留在案前逐项核准，更多权柄与更多负担同时落到你身上。','boundary',{mandate:'direct'}),C('限期委办 · 承珩执行','承珩接下本案，须在案末交回执。办事更快，你也得付出不能事事先知的代价。','speed',{mandate:'delegate'}),C('共同覆核 · 两宫留底','另一宫也留下一本案册。你们都要付出核阅的工夫，意见不同时也得继续办事。','joint',{mandate:'joint'})];
   else options=c.choices[t].map(([label,result,type],i)=>C(label,result,type,t===2&&i===0?{need:'e'+k}:{}));
   if(k===1&&t===3)options[0].cost=6;
   nodes[id]={id,title:t===0?c.title:['','先问缘由','两纸对照','如何承办','当面回应','案末回执'][t],art:c.art,who:c.who,text,chapter:k,items:['e'+k,'r'+k,'p'+k],options,start:t===0,next:k===7&&t===5?'@route':'m'+(k*6+t+1),caseTitle:c.title,stage:t};
  });
 });
 const endingInfo={A:{title:'各守其任',subtitle:'有边界的同道，仍需日日兑现',art:'keys',text:'你没有把亲王变成无声的手，也没有让印只剩一次签押。新名册按约交回，门票到期作废，坏消息仍能入宫。承珩有时会反对你，但反对之后仍知道怎样办差。你得到的不是再无人争权的一生，而是一套争过之后还能交接的办法。',hook:'下一次有人想破例时，首先被这份约束拦住的，也可能正是你。'},B:{title:'两宫同衡',subtitle:'她能拦你，你也能继续与她共事',art:'accounts',text:'两份原本摆在一处，你们都保留看见、核问与拒绝的权利。曾经最难堪的采办账，也留在共同的案册里。承珩不必再猜哪一宫的口信算数，代价是你也不能只求另一宫支持自己的愿望。共同执掌不是永远同意，而是不同意时仍愿承担同一件事。',hook:'两颗印能落在一起，靠的不是两个人终于变得一样。'},C:{title:'印在，令不由己',subtitle:'便利连成了再难拆开的网',art:'council',text:'文书仍然会送来，你也仍然会盖印。可名册、门票、采办和幼帝的日程，都已经习惯先向王府问一句。承珩未曾公开夺走你的尊位；你是在一次次急着把事情办成时，把决定该怎样办的入口交到了他手里。你能重新开一条路，但需要比当初交出去更多的时间。',hook:'窗外又有人候旨。这次，你先问还有没有一份没誊成净稿的原件。'},D:{title:'孤印长明',subtitle:'你把每件事都拿回来，也把负担全留下',art:'alone',text:'最后一页留下你的亲笔覆核，几乎每一件事都要再送到案前。亲王交回了钥匙，两宫也不再替你承担自己无从决定的差错。你终于很少听见有人说此事已经办定，却在深夜看见成堆未发的文书。权柄没有旁落，你却没有因此得到更多安稳。',hook:'闻笙来添灯，你想让她先退下，开口时却问还有多少件没看。'}};
 for(const[k,e]of Object.entries(endingInfo))nodes['end'+k]={id:'end'+k,ending:k,...e,options:[],items:[],chapter:8};
 function pages(n,s){let text=n.text;if(n.id==='m6'&&s.flags.legacyProof)text+='§前局留下的核验副本还在。闻笙因此能比别人早半日找到这一批粮的来路；你曾经留下的原件，这一刻才真正派上用场。';if(n.id==='m18'&&s.flags.legacyFamily)text+='§前局里你曾为熟人留过情面。闻笙这次迟迟不说，也怕你会先将同样的情面给收来消息的旧人。';if(n.id==='m30'&&s.flags.legacyCare)text+='§晏儿还记得前局那夜你留在身边。这次他敢先说累，不必拿一场病来换你听见。';const out=[];for(const p of text.split('§')){let rest=p;while(rest.length>85){let cut=rest.slice(0,85).lastIndexOf('。');if(cut<35)cut=rest.slice(0,85).lastIndexOf('，');if(cut<35)cut=80;out.push(rest.slice(0,cut+1));rest=rest.slice(cut+1);}if(rest)out.push(rest);}return out;}
 return{nodes,items,people,flagKeys,chapters:CASES.map(c=>c.title),endingInfo,mainCount:48,pages};
})();
