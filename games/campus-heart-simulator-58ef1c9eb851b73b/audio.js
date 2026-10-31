/* Original procedural score for Campus Heart. No recordings or third-party samples. */
(() => {
  'use strict';
  const KEY='G148-campus-heart-audio-v1', defaults={music:true,sfx:true,musicVolume:28,sfxVolume:45};
  let prefs={...defaults},ctx,bus,fxBus,timer=null,unlocked=false,current='letters',nextTime=0,step=0,lastTap=-1;
  let revision=0,errors=0,notes=0,clicks=0,voices=new Set();
  try{const x=JSON.parse(localStorage.getItem(KEY));if(x)for(const k of Object.keys(defaults)){if(typeof defaults[k]==='boolean'&&typeof x[k]==='boolean')prefs[k]=x[k];if(typeof defaults[k]==='number'&&Number.isFinite(x[k]))prefs[k]=Math.max(0,Math.min(100,x[k]))}}catch{}
  const themes={
    letters:{name:'书页与春信',bpm:72,root:60,scale:[0,2,4,7,9],chords:[0,5,9,7],melody:[0,2,3,2,1,2,4,3,2,1,0,1,2,3,1,0],wave:'sine'},
    daylight:{name:'放学后的晴空',bpm:94,root:62,scale:[0,2,4,7,9],chords:[0,7,9,5],melody:[0,1,2,3,2,1,4,3,2,3,4,3,1,2,1,0],wave:'triangle'},
    rehearsal:{name:'未寄出的旋律',bpm:66,root:57,scale:[0,3,5,7,10],chords:[0,5,8,3],melody:[0,2,3,4,3,2,1,2,0,1,3,2,1,0,2,0],wave:'sine'},
    lantern:{name:'后台留一盏灯',bpm:76,root:60,scale:[0,2,4,7,9],chords:[0,9,5,7],melody:[2,3,2,0,1,2,4,3,2,1,2,0,3,2,1,0],wave:'sine'},
    winter:{name:'冬夜慢慢靠近',bpm:60,root:59,scale:[0,2,3,7,9],chords:[0,5,8,7],melody:[0,2,4,3,2,1,0,1,2,3,2,1,0,2,1,0],wave:'sine'},
    memories:{name:'把心动写进明天',bpm:70,root:60,scale:[0,2,4,7,9],chords:[0,5,9,7],melody:[0,3,4,3,2,1,2,3,4,3,2,0,1,2,1,0],wave:'sine'}
  };
  function choose(art,ending){if(ending||['graduation','station','seaside'].includes(art))return'memories';if(['winter','dorm','zhou-night'].includes(art))return'winter';if(['court','quad','festival','spring'].includes(art))return'daylight';if(['music','shen-stage'].includes(art))return'rehearsal';if(['guyan','gu-backstage','xingyao','lu-photo'].includes(art))return'lantern';return'letters'}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}}
  function level(g,value){if(!ctx)return;g.gain.cancelScheduledValues(ctx.currentTime);g.gain.setTargetAtTime(value,ctx.currentTime,.04)}
  function tone(midi,at,duration,volume,wave,target,tag='music'){
    if(!ctx||ctx.state!=='running')return;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type=wave;oscillator.frequency.value=440*2**((midi-69)/12);
    const entry={oscillator,gain,tag};voices.add(entry);oscillator.connect(gain);gain.connect(target);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
    oscillator.start(at);oscillator.stop(at+duration+.03);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();voices.delete(entry)};
    if(tag==='music')notes++;
  }
  function silenceMusic(){if(!ctx)return;for(const v of voices)if(v.tag==='music'){v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setTargetAtTime(0,ctx.currentTime,.08);try{v.oscillator.stop(ctx.currentTime+.4)}catch{}}}
  function stop(){if(timer!==null)clearInterval(timer);timer=null;silenceMusic()}
  function schedule(){if(!ctx||ctx.state!=='running'||document.hidden||!prefs.music||!prefs.musicVolume)return;const t=themes[current],beat=60/t.bpm/2;
    while(nextTime<ctx.currentTime+.18){const bar=Math.floor(step/8)%4,chord=t.root+t.chords[bar];
      if(step%8===0){tone(chord-12,nextTime,beat*7,.16,'sine',bus);for(const offset of [0,7,12])tone(chord+offset,nextTime,beat*6,.035,'sine',bus)}
      if(step%2===0||current==='daylight'){const i=t.melody[Math.floor(step/2)%t.melody.length];tone(t.root+12+t.scale[i],nextTime,beat*1.7,.12,t.wave,bus)}
      if(step%2===1)tone(chord+[0,7,12,7][Math.floor(step/2)%4],nextTime,beat*1.3,.055,'sine',bus);
      step=(step+1)%64;nextTime+=beat;
    }
  }
  function start(){stop();if(!ctx||ctx.state!=='running'||document.hidden||!prefs.music||!prefs.musicVolume)return;step=0;nextTime=ctx.currentTime+.12;level(bus,prefs.musicVolume/100*.5);schedule();timer=setInterval(schedule,80)}
  async function activate(){try{if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();bus=ctx.createGain();fxBus=ctx.createGain();bus.gain.value=prefs.musicVolume/100*.5;fxBus.gain.value=prefs.sfxVolume/100*.42;
      const master=ctx.createDynamicsCompressor();master.threshold.value=-12;master.ratio.value=5;bus.connect(master);fxBus.connect(master);master.connect(ctx.destination);
      ctx.onstatechange=()=>{if(ctx.state!=='running')stop();else if(!document.hidden&&prefs.music&&timer===null)start()};}
    if(ctx.state!=='running')await ctx.resume();unlocked=ctx.state==='running';if(unlocked&&prefs.music&&timer===null&&!document.hidden)start();
  }catch{errors++}}
  function click(command){if(!prefs.sfx||!prefs.sfxVolume||!ctx||ctx.state!=='running'||document.hidden)return;const now=ctx.currentTime;if(now-lastTap<.045)return;lastTap=now;clicks++;level(fxBus,prefs.sfxVolume/100*.42);
    const close=['close','galleryprev','gallerynext','map','people'].includes(command),confirm=['choose','new','next','book','finish','partner'].includes(command);
    tone(close?76:81,now+.003,.09,.15,'sine',fxBus,'sfx');if(confirm)tone(88,now+.04,.14,.09,'sine',fxBus,'sfx');
  }
  function set(key,value){prefs[key]=typeof defaults[key]==='boolean'?!!value:Math.max(0,Math.min(100,Number(value)||0));revision++;save();if(ctx){level(bus,prefs.musicVolume/100*.5);level(fxBus,prefs.sfxVolume/100*.42)}if(key==='music'||key==='musicVolume')start()}
  function scene(art,ending=false){const next=choose(art,ending);if(next===current)return;current=next;revision++;if(unlocked)start()}
  function panel(){return `<h2>让心动有回声</h2><p>当前配乐：${themes[current].name}</p><div class="choices"><button data-cmd="audio-music" aria-pressed="${prefs.music}">背景音乐：${prefs.music?'开':'关'}</button><button data-cmd="audio-sfx" aria-pressed="${prefs.sfx}">点击音效：${prefs.sfx?'开':'关'}</button></div><label class="sound-setting">音乐音量 <output id="music-value">${prefs.musicVolume}%</output><input aria-label="音乐音量" data-audio-volume="musicVolume" type="range" min="0" max="100" value="${prefs.musicVolume}"></label><label class="sound-setting">音效音量 <output id="sfx-value">${prefs.sfxVolume}%</output><input aria-label="音效音量" data-audio-volume="sfxVolume" type="range" min="0" max="100" value="${prefs.sfxVolume}"></label><p class="fine">轻触后开始播放，切到后台会暂停。设置仅保存在当前浏览器，与剧情存档独立。首次在静音设备上游玩，请同时检查系统音量。</p>`}
  document.addEventListener('click',e=>{const b=e.target.closest('button,label.file-label');if(!b||b.disabled)return;const cmd=(b.dataset.cmd||'file').split(':')[0];const ready=activate();if(cmd==='audio-music')set('music',!prefs.music);if(cmd==='audio-sfx')set('sfx',!prefs.sfx);ready.then(()=>click(cmd))},true);
  document.addEventListener('input',e=>{const k=e.target.dataset.audioVolume;if(!['musicVolume','sfxVolume'].includes(k))return;activate();set(k,e.target.value);const output=document.getElementById(k==='musicVolume'?'music-value':'sfx-value');if(output)output.value=prefs[k]+'%'});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(ctx)ctx.suspend().catch(()=>{})}else if(unlocked)activate()});
  window.addEventListener('pagehide',()=>{stop();if(ctx)ctx.suspend().catch(()=>{})});
  window.addEventListener('pageshow',()=>{if(unlocked&&!document.hidden)activate()});
  window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{const x=JSON.parse(e.newValue);if(x&&typeof x.music==='boolean'&&typeof x.sfx==='boolean'){for(const k of Object.keys(defaults)){if(typeof defaults[k]==='boolean')prefs[k]=x[k];else if(Number.isFinite(x[k]))prefs[k]=Math.max(0,Math.min(100,x[k]))}if(ctx){level(fxBus,prefs.sfxVolume/100*.42);start()}}}catch{}});
  window.CampusAudio={scene,panel,themes,debug:()=>({prefs:{...prefs},theme:current,title:themes[current].name,context:ctx?.state||'not-created',unlocked,timer:timer!==null,notes,clicks,voices:voices.size,revision,errors})};
})();
