/* 《裁缝 · 一九四三》界面层
 * 只负责画和收点击；规矩全在 engine.js。
 */
(() => {
"use strict";
const E = ENGINE, C = CONTENT;

const V = { scr: "boot", sub: "brief", result: null, settle: null, echo: -1 };
let S = null;

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SLOT = { s: "肩", w: "腰", l: "长", c: "袖" };

function save() { if (S) E.save(S); }
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("on"), 1800);
}
function money(n) { return "¥" + n; }

const ART = {shop: '苏记裁缝铺，缝纫机、裁案与布料架', cutting: '裁案上的剪刀、纸样与阴丹士林', finished: '窗边挂起的旗袍、花布上衣与补缀衣裳'};
function art(name, cls = '') {
  return `<figure class="art ${cls}"><img src="assets/${name}${cls === 'cover-art' ? '' : '-wide'}.webp" width="900" height="${cls === 'cover-art' ? 600 : name === 'shop' ? 380 : name === 'cutting' ? 288 : 414}" alt="${ART[name]}" ${name === 'shop' ? 'fetchpriority="high"' : 'loading="lazy"'} onerror="this.hidden=true;this.parentElement.classList.add('art-failed')"><figcaption>${ART[name]}</figcaption></figure>`;
}
function story(paragraphs, title = '听她慢慢说') {
  return `<details class="story"><summary>${esc(title)}</summary><div class="narr">${paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div></details>`;
}
function bench() {
  return `<div class="bench">${art('shop')}<div class="bench-tools"><button data-act="orders">订单夹<span>挑这个月的活</span></button><button data-act="letters">家书匣<span>${E.lettersOf(C,S).length} 封待读</span></button><button data-act="archive">旧账本<span>看看这一年</span></button></div></div>`;
}
/* ---------------- 顶栏 ---------------- */
function statBar() {
  const m = C.months[Math.min(S.month, 12) - 1];
  return `<div class="topbar"><button class="store-open" data-store="open" aria-label="存档与说明">存档</button>
    <div class="monthbox"><b>${esc(m.name)}</b><i>${esc(m.jie)}</i></div>
    <div class="stats">
      <span><small>钱</small><b class="${S.money < 20 ? "low" : ""}">${S.money}</b></span>
      <span><small>名声</small><b>${S.rep}</b></span>
      <span><small>心气</small><b class="${S.heart < 25 ? "low" : ""}">${S.heart}</b></span>
    </div>
  </div>`;
}

/* ---------------- 封面 ---------------- */
function scrBoot() {
  const has = !!E.load();
  S = null;
  $("#app").innerHTML = `
  <div class="cover">
    <div class="cover-visual">${art("shop", "cover-art")}<div class="cseal">${stamp()}</div></div>
    <h1>裁缝</h1>
    <div class="csub">一九四三 · 重庆</div>
    <div class="cplace">${esc(C.meta.place)}</div>
    ${story(C.meta.intro, "一把剪刀，撑起一家人的日子") }
    <div class="rule"></div>
    <div class="ctip">${esc(C.meta.rule)}</div><button class="cover-store" data-store="open">存档与说明 · 导入 / 导出</button>
    <div class="foot">
      ${has ? `<button class="half" data-act="continue">接着做</button><button class="primary" data-act="new">重新来过</button>`
            : `<button class="primary" data-act="new">摆开裁案</button>`}
    </div>
  </div>`;
}

function stamp() {
  return `<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
    <circle cx="40" cy="40" r="35" fill="none" stroke="#a34a3c" stroke-width="2" opacity=".55"/>
    <circle cx="40" cy="40" r="29" fill="none" stroke="#a34a3c" stroke-width="1" opacity=".35"/>
    <text x="40" y="34" text-anchor="middle" font-family="KaiTi,serif" font-size="15" fill="#a34a3c" opacity=".75">苏记</text>
    <text x="40" y="54" text-anchor="middle" font-family="KaiTi,serif" font-size="15" fill="#a34a3c" opacity=".75">裁缝</text>
  </svg>`;
}

/* ---------------- 月份 ---------------- */
function scrMonth() {
  const m = C.months[S.month - 1];
  const ev = E.monthEvent(C, S);
  const jobs = E.offers(C, S);
  const left = E.remaining(C, S);
  const ownErr = E.canOwnDress(C, S);

  $("#app").innerHTML = `
  ${statBar()}
  <div class="view">
    ${bench()}
    ${story(m.open, m.name + " · 巷子里的日子")}
    ${(m.street || []).length ? `<details class="story"><summary>街坊碎话</summary><div class="street">${m.street.map(x => `<span>${esc(x)}</span>`).join("")}</div></details>` : ""}

    ${ev ? `<div class="rule"></div>
    <details class="evbox" data-ev="${C.events.indexOf(ev)}">
      <summary class="evt">家事 · ${esc(ev.title)} <small>展开处理</small></summary>
      ${ev.text.map(p => `<p class="evp">${esc(p)}</p>`).join("")}
      <div class="evopts">
        ${ev.opts.map((o, i) => `<button data-evopt="${i}">${esc(o.t)}</button>`).join("")}
      </div>
    </details>` : ""}

    <div class="rule"></div>
    <div class="sect">这个月的单子 <span>还能接 ${left} 件</span></div>
    <div class="slips" id="orders">
      ${jobs.map(j => {
        const done = S.done.indexOf(j.id) >= 0 || S.taken.indexOf(j.id) >= 0;
        const gone = S.missed.indexOf(j.id) >= 0;
        return `<button class="slip ${done ? "done" : ""} ${gone ? "gone" : ""}" data-job="${j.id}" ${done || gone ? "disabled" : ""}>
          <span class="swho">${esc(j.who)}<i>${esc(j.tag)}</i></span>
          <span class="stitle">${esc(j.title)}</span>
          <span class="sfee">${money(j.fee)}${done ? " · 做过" : gone ? " · 人家走了" : ""}</span>
        </button>`;
      }).join("")}
    </div>
  </div>
  <div class="foot">
    ${E.lettersOf(C, S).length ? `<button class="half" data-act="letters">家书 ${E.lettersOf(C, S).length}</button>` : ""}
    ${ownErr ? "" : `<button class="half" data-act="own">给自己做</button>`}
    <button class="half" data-act="archive">这一年</button>
    ${S.active ? `<button class="primary" data-act="resume">接着做手上的</button>`
      : `<button class="primary" data-act="settle">收摊</button>`}
  </div>`;
}

/* ---------------- 接活 ---------------- */
function scrJob() {
  const a = S.active;
  if (!a) { V.scr = "month"; return render(); }
  if (V.sub !== "fit") V.sub = "brief";
  const j = C.customers[a.id];
  const pts = E.pointsLeft(S);
  const known = {};
  a.looks.forEach(i => { const h = j.hints[i]; if (h && h.slot) known[h.slot] = h.x; });

  const head = `
  ${statBar()}
  <div class="view">
    <div class="person">
      <div class="meta"><b>${esc(j.who)}</b><span>${esc(j.tag)}</span></div>
      <div class="fee">${money(j.fee)}</div>
    </div>
    <div class="jobtitle">${esc(j.title)}</div>
    ${story(j.brief)}`;

  if (V.sub === "brief") {
    $("#app").innerHTML = head + `
      <div class="observe-tabs"><button data-observe="look">看细节 · ${pts} 点工夫</button><button data-observe="ask">问一句 · 共用工夫</button></div><section class="observepanel" data-observe-panel="look">
      <div class="sect">看细节 <span>还剩 ${pts} 点工夫</span></div>
      <div class="looks">
        ${j.hints.map((h, i) => {
          const on = a.looks.indexOf(i) >= 0;
          return `<button class="look ${on ? "on" : ""}" data-look="${i}" ${on ? "disabled" : ""}>
            ${on ? esc(h.x) : (h.slot ? `看她的${SLOT[h.slot]}（${i + 1}）` : `看她这个人（${i + 1}）`)}
          </button>`;
        }).join("")}
      </div>
      </section><section class="observepanel" data-observe-panel="ask"><div class="sect">问一句 <span>问话也算工夫</span></div>
      <div class="asks">
        ${j.asks.map((q, i) => {
          const on = a.asks.indexOf(i) >= 0;
          return `<button class="ask ${on ? "on" : ""}" data-ask="${i}" ${on ? "disabled" : ""}>
            ${on ? "<b>「" + esc(q.a) + "」</b>" : "「" + esc(q.q) + "」"}
          </button>`;
        }).join("")}
      </div></section>
    </div>
    <div class="foot">
      <button class="half" data-act="desk">先放着</button>
      <button class="primary" data-act="tofit">量体裁衣</button>
    </div>`;
    return;
  }

  /* 量体 + 挑料 */
  $("#app").innerHTML = head + `
    <div class="rule"></div>
    <div class="work-visual">${art("cutting")}<div class="work-caption">裁案 · ${a.cloth ? esc(C.cloths[a.cloth].n) : "料子未定"}<span>尺寸 ${Object.keys(a.fit).length}/4</span></div></div>
    <div class="worktabs" role="group" aria-label="裁衣工序"><button data-work="measure">一 量体</button><button data-work="fabric">二 挑料</button><button data-work="payment">三 收钱</button></div>
    <section class="workpanel" data-panel="measure"><div class="sect">量体 <span>${Object.keys(a.fit).length} / 4</span></div>
    <div class="fits">
      ${["s", "w", "l", "c"].map(k => `
        <div class="fitrow">
          <span class="fl">${SLOT[k]}</span>
          <div class="fopts">
            ${C.slots[k].opts.map((o, i) => `<button class="fopt ${a.fit[k] === i ? "on" : ""}" data-fit="${k}" data-opt="${i}">${esc(o)}</button>`).join("")}
          </div>
        </div>
        ${known[k] ? `<div class="fhint">${esc(known[k])}</div>` : ""}
      `).join("")}
    </div>
    </section><section class="workpanel" data-panel="fabric"><div class="sect">挑料 <span>${a.cloth ? esc(C.cloths[a.cloth].n) : "还没挑"}</span></div>
    <div class="cloths">
      ${Object.keys(C.cloths).map(k => `<button class="cloth ${a.cloth === k ? "on" : ""}" data-cloth="${k}">
        <span class="swatch swatch-${k}" aria-hidden="true"></span><b>${esc(C.cloths[k].n)}</b><i>${esc(C.cloths[k].d)}</i>
      </button>`).join("")}
    </div>
    </section><section class="workpanel" data-panel="payment"><div class="sect">收钱</div>
    <div class="pays">
      <button class="pay ${a.pay === "full" ? "on" : ""}" data-pay="full">收全款</button>
      <button class="pay ${a.pay === "half" ? "on" : ""}" data-pay="half">先收一半</button>
      <button class="pay ${a.pay === "free" ? "on" : ""}" data-pay="free">不要钱</button>
    </div>
    <label class="hurry"><input type="checkbox" data-hurry ${a.hurry ? "checked" : ""}>赶工（多收两成，手会抖）</label><div class="order-summary">尺寸 ${Object.keys(a.fit).length}/4 · ${a.cloth ? esc(C.cloths[a.cloth].n) : "还没挑料"} · ${a.pay === "free" ? "不收钱" : a.pay === "half" ? "先收一半" : "收全款"}</div></section>
  </div>
  <div class="foot">
    <button class="half" data-act="tobrief">回去再问</button>
    <button class="primary" data-act="submit" ${E.ready(S) ? "" : "disabled"}>交活</button>
  </div>`;
}

/* ---------------- 交活 ---------------- */
function scrResult() {
  const r = V.result;
  $("#app").innerHTML = `
  ${statBar()}
  <div class="view">
    ${art("finished", "result-art")}<div class="tag">衣裳交出去了</div>
    <div class="card">
      <div class="ct">${esc(r.tier)}</div>
      <div class="cline">尺寸 ${r.fitN}/4${r.wrong.length ? " · " + r.wrong.map(w => w + "差了些").join("、") : " · 一寸不差"}</div>
      <div class="cline">${esc(r.clothLine)}</div>
    </div>
    <div class="narr"><p>${esc(r.body)}</p></div>
    <div class="narr dim"><p>${esc(r.hand)}</p></div>
    ${r.exit ? `<div class="narr dim"><p>${esc(r.exit)}</p></div>` : ""}
    <div class="kv"><span>收</span><b>${money(r.got)}</b></div>
    ${r.half ? `<div class="kv"><span>欠着</span><b>${money(r.half)}</b></div>` : ""}
    ${r.craft ? `<div class="kv"><span>手艺</span><b>+${r.craft}</b></div>` : ""}
    <div class="kv dim"><span>三个月后</span><b>会听说</b></div>
  </div>
  <div class="foot"><button class="primary" data-act="backdesk">送客</button></div>`;
}

/* ---------------- 月末 ---------------- */
function scrSettle() {
  const st = V.settle || { rent: E.CFG.rent, food: E.CFG.food, odd: E.CFG.odd, came: 0, left: 0 };
  $("#app").innerHTML = `
  <div class="view">
    <div class="tag">收摊 · 结账</div>
    <div class="settle">
      <div class="kv"><span>房租</span><b class="neg">−${st.rent}</b></div>
      <div class="kv"><span>吃喝</span><b class="neg">−${st.food}</b></div>
      <div class="kv"><span>杂活（改裤脚、补被面）</span><b>+${st.odd}</b></div>
      <div class="kv"><span>手上</span><b>${money(S.money)}</b></div>
      ${S.debt ? `<div class="kv"><span>欠账</span><b class="neg">${money(S.debt)}</b></div>` : ""}
      ${st.left ? `<div class="kv dim"><span>这个月放掉的单子</span><b>${st.left} 件</b></div>` : ""}
    </div>
    <div class="narr dim"><p>${st.came ? "邮差在门口放了几封信。" : "没有人来。"}</p></div>
  </div>
  <div class="foot"><button class="primary" data-act="nextmonth">过到下个月</button></div>`;
}

/* ---------------- 回响 ---------------- */
function scrEcho() {
  const list = S.echoes;
  if (!list.length) { V.scr = "month"; return render(); }
  const i = Math.min(V.echo < 0 ? 0 : V.echo, list.length - 1);
  const has = i >= 0;
  $("#app").innerHTML = `
  ${statBar()}
  <div class="view">
    <div class="tag">回响 ${i + 1} / ${list.length}</div>
    ${has ? (() => {
      const p = list[i];
      const c = C.customers[p.id];
      const x = (c.echo && (c.echo[p.tier] || c.echo["过得去"])) || C.echo[p.tier];
      return `<div class="card">
        <div class="ct">${esc(c.who)} · ${esc(p.tier)}</div>
        <div class="cline">${esc(c.title)}</div>
      </div>
      <div class="narr"><p>${esc(x)}</p></div>
      ${p.half ? `<div class="kv"><span>她把欠的一半送来了</span><b>${money(p.half)}</b></div>` : ""}`;
    })() : ""}
  </div>
  <div class="foot"><button class="primary" data-act="readecho">听说了</button></div>`;
}

/* ---------------- 家书 ---------------- */
function scrLetters() {
  const list = E.lettersOf(C, S);
  $("#app").innerHTML = `
  ${statBar()}
  <div class="view">
    <div class="tag">家书</div>
    ${list.length ? list.map(L => `<button class="letter" data-mail="${L.n}">
      <span class="lt">${esc(L.t)}</span>
      <span class="lp">${esc(L.body[0].slice(0, 24))}……</span>
    </button>`).join("") : `<div class="narr dim"><p>还没有信。</p></div>`}
    ${S.letters.length ? `<div class="sect">读过的</div>
      ${S.letters.map(n => { const L = C.letters.find(x => x.n === n); return L ? `<div class="read">${esc(L.t)} · ${esc(L.body[0].slice(0, 16))}……</div>` : ""; }).join("")}` : ""}
  </div>
  <div class="foot"><button data-act="back">回去</button></div>`;
}

/* ---------------- 这一年 ---------------- */
function scrArchive() {
  $("#app").innerHTML = `
  ${statBar()}
  <div class="view">
    <div class="tag">这一年</div>
    <div class="archive">
      ${S.log.length ? S.log.map(l => `<div class="lg">${esc(l)}</div>`).join("") : `<div class="narr dim"><p>还什么都没做。</p></div>`}
    </div>
    ${S.missed.length ? `<div class="sect">放掉的单子 <span>${S.missed.length} 件</span></div>
    <div class="missed">
      ${S.missed.map(id => { const c = C.customers[id]; return c ? `<div class="mi">
        <b>${esc(c.who)}</b>《${esc(c.title)}》
        <span>${esc((C.missedText && C.missedText[id]) || "")}</span>
      </div>` : ""; }).join("")}
    </div>` : ""}
  </div>
  <div class="foot"><button data-act="back">回去</button></div>`;
}

/* ---------------- 结局 ---------------- */
function scrEnding() {
  const id = S.ending || E.endingOf(C, S);
  const e = C.endings[id];
  $("#app").innerHTML = `
  <div class="view endwrap">
    ${art("finished", "ending-art")}<div class="endgrade">${esc(e.n)}</div>
    <div class="endtitle">${esc(e.title)}</div>
    <div class="narr">${e.text.map(p => `<p>${esc(p)}</p>`).join("")}</div>
    <div class="endstats">
      <span><small>钱</small><b>${S.money}</b></span>
      <span><small>名声</small><b>${S.rep}</b></span>
      <span><small>心气</small><b>${S.heart}</b></span>
      <span><small>手艺</small><b>${S.craft}</b></span>
      <span><small>做过</small><b>${S.done.length}</b></span>
    </div>
    <div class="dim small">${S.missed.length} 张单子放掉了。${S.ownDress ? "给自己做了一件。" : "没给自己做过一件。"}</div>
  </div>
  <div class="foot"><button class="primary" data-act="new">再摆一年</button></div>`;
}

/* ---------------- 渲染 ---------------- */
const SCREENS = { boot: scrBoot, month: scrMonth, job: scrJob, result: scrResult, settle: scrSettle, echo: scrEcho, letters: scrLetters, archive: scrArchive, ending: scrEnding };

function render() {
  document.querySelector("#app").dataset.screen = V.scr;
  (SCREENS[V.scr] || scrMonth)();
  document.querySelectorAll('.workpanel').forEach(el => { el.hidden = el.dataset.panel !== (V.work || 'measure'); });
  document.querySelectorAll('[data-work]').forEach(el => { el.classList.toggle('on', el.dataset.work === (V.work || 'measure')); el.setAttribute('aria-pressed', String(el.dataset.work === (V.work || 'measure'))); });
  document.querySelectorAll('[data-observe-panel]').forEach(el => el.hidden = el.dataset.observePanel !== (V.observe || 'look'));
  document.querySelectorAll('[data-observe]').forEach(el => { el.classList.toggle('on', el.dataset.observe === (V.observe || 'look')); });
  save();
  const v = document.querySelector(".view");
  if (v) v.scrollTop = 0;
}

function newGame() {
  S = E.fresh();
  V.scr = "month"; V.sub = "brief"; V.result = null; V.settle = null; V.echo = -1;
  render();
}

/* ---------------- 事件 ---------------- */
document.addEventListener("click", ev => {
  const b = ev.target.closest("button, input");
  if (!b) return;
  const act = b.dataset.act;
  if (b.dataset.observe) { V.observe = b.dataset.observe; render(); return; }
  if (b.dataset.work) { V.work = b.dataset.work; render(); return; }
  if (act === 'orders') { document.querySelector('#orders')?.scrollIntoView({block:'nearest',behavior:'smooth'}); return; }

  if (b.dataset.job) {
    if (!S) return;
    const err = E.canTake(C, S, b.dataset.job);
    if (err) { toast(err); return; }
    E.take(C, S, b.dataset.job);
    V.scr = "job"; V.sub = "brief"; V.observe = "look";
    render(); return;
  }
  if (b.dataset.look !== undefined) {
    try { const r = E.look(C, S, +b.dataset.look); if (r.x) render(); else toast("这处已经看过了"); }
    catch (e) { toast(e.message); }
    return;
  }
  if (b.dataset.ask !== undefined) {
    try { const r = E.ask(C, S, +b.dataset.ask); if (r.q !== undefined) render(); else toast("问过了"); }
    catch (e) { toast(e.message); }
    return;
  }
  if (b.dataset.fit) { E.pickFit(S, b.dataset.fit, +b.dataset.opt); render(); return; }
  if (b.dataset.cloth) { E.pickCloth(C, S, b.dataset.cloth); render(); return; }
  if (b.dataset.pay) { E.setPay(S, b.dataset.pay); render(); return; }

  if (b.dataset.evopt !== undefined) {
    try { const r = E.evChoose(C, S, +b.dataset.evopt); toast(r.t); render(); }
    catch (e) { toast(e.message); }
    return;
  }
  if (b.dataset.mail !== undefined) {
    const L = E.readLetter(C, S, +b.dataset.mail);
    $("#app").innerHTML = `${statBar()}
      <div class="view">
        <div class="tag">${esc(L.t)}</div>
        <div class="letterbig">${L.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      </div>
      <div class="foot"><button class="primary" data-act="back">收起来</button></div>`;
    return;
  }

  switch (act) {
    case "new": newGame(); break;
    case "continue": {
      const s = E.load();
      if (!s) { toast("档坏了，只能重来"); newGame(); break; }
      S = s; V.scr = S.ended ? "ending" : "month"; V.sub = "brief"; render(); break;
    }
    case "back":
      V.scr = S.active ? "job" : "month"; V.sub = "brief"; render(); break;
    case "desk":
      V.scr = "month"; V.sub = "brief"; render(); break;
    case "resume":
      if (!S.active) { V.scr = "month"; render(); break; }
      V.scr = "job";
      V.sub = E.ready(S) ? "fit" : (Object.keys(S.active.fit).length || S.active.cloth ? "fit" : "brief");
      render(); break;
    case "backdesk":
      V.scr = "month"; V.sub = "brief"; V.result = null; render(); break;
    case "tofit": V.work = "measure"; V.sub = "fit"; render(); break;
    case "tobrief": V.sub = "brief"; render(); break;
    case "submit": {
      try {
        V.result = E.deliver(C, S);
        V.scr = "result";
        render();
      } catch (e) { toast(e.message); }
      break;
    }
    case "settle": {
      try {
        V.settle = E.monthEnd(C, S);
        V.scr = S.ended ? "ending" : "settle";
        render();
      } catch (e) { toast(e.message); }
      break;
    }
    case "nextmonth": {
      V.settle = null;
      if (S.echoes.length) { V.scr = "echo"; V.echo = 0; }
      else { V.scr = "month"; V.sub = "brief"; }
      render();
      break;
    }
    case "readecho": {
      if (!S.echoes.length) { V.scr = "month"; render(); break; }
      const r = E.readEcho(C, S, 0);
      if (!S.echoes.length) { V.scr = "month"; V.echo = -1; }
      render();
      toast(r.repD ? (r.repD > 0 ? "名声 +" + r.repD : "名声 " + r.repD) : "听说了");
      break;
    }
    case "letters": V.scr = "letters"; render(); break;
    case "archive": V.scr = "archive"; render(); break;
    case "own": {
      const err = E.canOwnDress(C, S);
      if (err) { toast(err); break; }
      E.ownDress(C, S);
      toast("你给自己裁了一件");
      render();
      break;
    }
  }
});

document.addEventListener("change", ev => {
  if (ev.target && ev.target.dataset && ev.target.dataset.hurry !== undefined) {
    E.setHurry(S, ev.target.checked); render();
  }
});

/* ---------------- 启动 ---------------- */
window.__CAIFENG = { get S() { return S; }, V, render, newGame, E, C, continueGame: () => { const s = E.load(); if (s) { S = s; V.scr = "month"; render(); } } };
V.scr = "boot";
render();
})();
