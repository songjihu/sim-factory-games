/* 《裁缝 · 一九四三》引擎
 * 纯状态机：不碰 DOM、不读时钟、不写 storage。
 * 所有数值进 CFG，逻辑里不出现魔数。
 */
const ENGINE = (() => {
"use strict";

const CFG = {
  money0: 60,        // 开年手上
  rep0: 18,          // 巷子里还没人认得你
  heart0: 64,        // 心气
  rent: 12,          // 每月房租
  food: 18,          // 每月吃喝
  odd: 9,            // 每月杂活（改裤脚、补被面）
  points: 4,         // 每单可用的工夫：看细节 + 问话共用
  perMonth: 2,       // 每月最多接两单
  echoAfter: 3,      // 三个月后听说这身衣裳的下场
  fitSlots: ["s", "w", "l", "c"],
  repTier: { "风光": 3, "体面": 2, "过得去": 0, "差一寸": -1, "出丑": -3 },
  tierOf: score => score >= 9 ? "风光" : score === 8 ? "体面" : score >= 6 ? "过得去" : score >= 4 ? "差一寸" : "出丑",
  dressCost: 30,     // 给自己做一件的本钱
  propCap: 3
};

const has = (a, x) => a.indexOf(x) >= 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const keys = o => Object.keys(o);

/* ---------------- 存档 ---------------- */
function fresh() {
  return {
    v: 1, month: 1,
    money: CFG.money0, rep: CFG.rep0, heart: CFG.heart0, craft: 0, debt: 0,
    taken: [], done: [], missed: [], active: null,
    pending: [], echoes: [], props: {}, flags: {}, log: [],
    evDone: [], letters: [], ownDress: false, ended: false, ending: null
  };
}

function valid(s) {
  if (!s || typeof s !== "object") return "空档";
  if (s.v !== 1) return "版本不对";
  const nums = ["month", "money", "rep", "heart", "craft", "debt"];
  for (const k of nums) if (typeof s[k] !== "number" || !isFinite(s[k])) return "字段坏了：" + k;
  if (s.month < 1 || s.month > 12) return "月份越界";
  for (const k of ["taken", "done", "missed", "pending", "echoes", "evDone", "letters", "log"]) {
    if (!Array.isArray(s[k])) return "字段坏了：" + k;
  }
  if (!s.props || typeof s.props !== "object") return "道具表坏了";
  if (!s.flags || typeof s.flags !== "object") return "旗标坏了";
  if (s.active !== null) {
    const a = s.active;
    if (typeof a.id !== "string") return "手上的单子坏了";
    if (!Array.isArray(a.looks) || !Array.isArray(a.asks)) return "工夫记录坏了";
    if (!a.fit || typeof a.fit !== "object") return "尺寸记录坏了";
  }
  return null;
}

function load() {
  try {
    const raw = localStorage.getItem("G-caifeng-1943-v1");
    if (!raw) return null;
    const s = JSON.parse(raw);
    return valid(s) ? null : s;
  } catch (e) { return null; }
}
function save(s) {
  try { localStorage.setItem("G-caifeng-1943-v1", JSON.stringify(s)); return true; }
  catch (e) { return false; }
}
function wipe() {
  try { localStorage.removeItem("G-caifeng-1943-v1"); } catch (e) {}
}

/* ---------------- 客人 ---------------- */
function customerOf(C, id) {
  const c = C.customers[id];
  if (!c) throw Error("没有这位客人：" + id);
  return c;
}
function monthOf(C, m) {
  const x = C.months[m - 1];
  if (!x) throw Error("没有这个月");
  return x;
}
function offers(C, s) {
  return monthOf(C, s.month).orders.map(id => customerOf(C, id));
}
function canTake(C, s, id) {
  if (s.ended) return "这一年的活做完了";
  if (s.active) return "手上还有一件没交";
  if (s.taken.length >= CFG.perMonth) return "这个月的功夫只够做两件了";
  if (!has(monthOf(C, s.month).orders, id)) return "这单不是这个月的";
  if (has(s.taken, id) || has(s.done, id)) return "已经做过了";
  if (has(s.missed, id)) return "人家已经走了";
  return null;
}
function take(C, s, id) {
  const err = canTake(C, s, id);
  if (err) throw Error(err);
  s.taken.push(id);
  s.active = { id, looks: [], asks: [], fit: {}, cloth: null, hurry: false, pay: "full" };
  return s.active;
}
function activeJob(C, s) {
  if (!s.active) throw Error("手上没有活");
  return customerOf(C, s.active.id);
}
function pointsLeft(s) {
  if (!s.active) return 0;
  const bonus = (s.props && s.props.ruler ? 1 : 0) + (s.props && s.props.lamp ? 1 : 0);
  return CFG.points + bonus - s.active.looks.length - s.active.asks.length;
}

/* ---------------- 听：看细节 / 问话 ---------------- */
function look(C, s, i) {
  const a = s.active;
  if (!a) throw Error("手上没有活");
  const c = activeJob(C, s);
  if (!c.hints[i]) throw Error("没有这处可看");
  if (has(a.looks, i)) return { again: true };
  if (pointsLeft(s) <= 0) throw Error("日头偏西了，工夫不够");
  a.looks.push(i);
  const h = c.hints[i];
  return { x: h.x, slot: h.slot, right: h.right, left: pointsLeft(s) };
}
function ask(C, s, i) {
  const a = s.active;
  if (!a) throw Error("手上没有活");
  const c = activeJob(C, s);
  if (!c.asks[i]) throw Error("没有这句话可问");
  if (has(a.asks, i)) return { again: true };
  if (pointsLeft(s) <= 0) throw Error("问得太多了，人家要烦");
  a.asks.push(i);
  const q = c.asks[i];
  return { q: q.q, a: q.a, k: q.k, left: pointsLeft(s) };
}

/* ---------------- 量 ---------------- */
function pickFit(s, slot, idx) {
  const a = s.active;
  if (!a) throw Error("手上没有活");
  if (!has(CFG.fitSlots, slot)) throw Error("没有这个尺寸");
  if (idx < 0 || idx > 2) throw Error("没有这个数");
  a.fit[slot] = idx;
  return a.fit;
}
function pickCloth(C, s, k) {
  const a = s.active;
  if (!a) throw Error("手上没有活");
  if (!C.cloths[k]) throw Error("没有这块料子");
  a.cloth = k;
  return k;
}
function setPay(s, mode) {
  if (!has(["full", "half", "free"], mode)) throw Error("没有这种收法");
  s.active.pay = mode;
}
function setHurry(s, on) { s.active.hurry = !!on; }

/* ---------------- 交活 ---------------- */
function ready(s) {
  const a = s.active;
  if (!a) return false;
  return CFG.fitSlots.every(k => a.fit[k] !== undefined) && !!a.cloth;
}
function judge(C, s) {
  const a = s.active, c = activeJob(C, s);
  let fitN = 0;
  const wrong = [];
  for (const k of CFG.fitSlots) {
    if (a.fit[k] === c.right[k]) fitN++;
    else wrong.push(k);
  }
  const occ = C.occ[c.occ];
  const clothT = has(occ.good, a.cloth) ? 2 : has(occ.ok, a.cloth) ? 1 : 0;
  let score = fitN * 2 + clothT - (a.hurry ? 1 : 0);
  score = clamp(score, 0, 10);
  return { fitN, wrong, clothT, score, tier: CFG.tierOf(score), occ: c.occ };
}

const SLOT_NAME = { s: "肩", w: "腰", l: "长", c: "袖" };

function deliver(C, s) {
  if (!ready(s)) throw Error("还没量完、没挑料");
  const a = s.active, c = activeJob(C, s), j = judge(C, s);
  const base = Math.round(c.fee * (a.hurry ? 1.2 : 1));
  let got = 0;
  if (a.pay === "full") got = base;
  else if (a.pay === "half") got = Math.round(base / 2);
  else got = 0;
  s.money += got;
  s.craft += j.fitN === 4 ? 2 : j.fitN === 3 ? 1 : 0;
  if (a.pay === "free") s.heart = clamp(s.heart + 2, 0, 100);
  if (j.tier === "出丑") s.heart = clamp(s.heart - 1, 0, 100);

  const half = a.pay === "half" ? base - got : 0;
  s.pending.push({
    id: c.id, tier: j.tier, at: s.month + CFG.echoAfter,
    half, free: a.pay === "free", cloth: a.cloth, occ: c.occ
  });
  s.done.push(c.id);
  s.log.unshift(`第${s.month}月 · ${c.who}《${c.title}》：${j.tier}（尺寸${j.fitN}/4）`);
  s.log = s.log.slice(0, 60);

  const out = {
    tier: j.tier, fitN: j.fitN, wrong: j.wrong.map(k => SLOT_NAME[k]),
    clothT: j.clothT, got, half, craft: j.fitN === 4 ? 2 : j.fitN === 3 ? 1 : 0,
    clothLine: C.clothLine[c.occ][j.clothT === 2 ? "good" : j.clothT === 1 ? "ok" : "bad"],
    body: c.body[j.tier] || c.body["过得去"],
    hand: c.hand,
    exit: c.exit || ""
  };
  s.active = null;
  return out;
}

/* ---------------- 月末 ---------------- */
function monthEnd(C, s) {
  if (s.active) throw Error("手上还有一件没交");
  const m = monthOf(C, s.month);
  const due = s.pending.filter(p => p.at <= s.month);
  s.pending = s.pending.filter(p => p.at > s.month);
  due.forEach(p => s.echoes.push(p));

  const left = m.orders.filter(id => !has(s.taken, id) && !has(s.done, id));
  left.forEach(id => { if (!has(s.missed, id)) s.missed.push(id); });
  s.taken = [];   // 新的一月，功夫重新算

  s.money -= CFG.rent + CFG.food;
  s.money += CFG.odd;
  if (s.money < 0) { s.debt += -s.money; s.money = 0; }

  const out = { rent: CFG.rent, food: CFG.food, odd: CFG.odd, came: due.length, left: left.length };
  s.month += 1;
  if (s.month > 12) {
    s.month = 12;
    s.ended = true;
    s.ending = endingOf(C, s);
  }
  return out;
}

/* ---------------- 回响 ---------------- */
function echoText(C, s, i) {
  const p = s.echoes[i];
  const c = C.customers[p.id];
  const t = C.echo[p.tier] || C.echo["过得去"];
  return { name: c.who, title: c.title, tier: p.tier, x: (c.echo && c.echo[p.tier]) || t };
}
function readEcho(C, s, i) {
  const p = s.echoes[i];
  if (!p) throw Error("没有这封回响");
  const dRep = CFG.repTier[p.tier] == null ? 0 : CFG.repTier[p.tier];
  s.rep = clamp(s.rep + dRep, 0, 100);
  if (p.half > 0 && (p.tier === "风光" || p.tier === "体面" || p.tier === "过得去")) {
    s.money += p.half;
  }
  if (p.tier === "风光") s.heart = clamp(s.heart + 2, 0, 100);
  if (p.tier === "出丑") s.heart = clamp(s.heart - 2, 0, 100);
  s.echoes.splice(i, 1);
  return { repD: dRep, half: p.half };
}

/* ---------------- 家事 ---------------- */
function monthEvent(C, s) {
  const e = C.events[s.month - 1];
  if (!e) return null;
  if (has(s.evDone, s.month)) return null;
  return e;
}
function evChoose(C, s, idx) {
  const e = monthEvent(C, s);
  if (!e) throw Error("这个月没有家事");
  const o = e.opts[idx];
  if (!o) throw Error("没有这个选法");
  const eff = o.eff || {};
  if (eff.money) s.money = Math.max(0, s.money + eff.money);
  if (eff.rep) s.rep = clamp(s.rep + eff.rep, 0, 100);
  if (eff.heart) s.heart = clamp(s.heart + eff.heart, 0, 100);
  if (eff.craft) s.craft = Math.max(0, s.craft + eff.craft);
  if (eff.debt) s.debt += eff.debt;
  if (o.flag) s.flags[o.flag] = true;
  s.evDone.push(s.month);
  s.log.unshift(`第${s.month}月 · ${e.title}：${o.t}`);
  s.log = s.log.slice(0, 60);
  return { t: o.t, x: o.x, eff };
}

/* ---------------- 信件 ---------------- */
function lettersOf(C, s) {
  return C.letters.filter(L => L.m <= s.month && !has(s.letters, L.n));
}
function readLetter(C, s, n) {
  const L = C.letters.find(x => x.n === n);
  if (!L) throw Error("没有这封信");
  if (s.month < L.m) throw Error("还没到");
  if (!has(s.letters, n)) {
    s.letters.push(n);
    if (L.heart) s.heart = clamp(s.heart + L.heart, 0, 100);
    if (L.flag) s.flags[L.flag] = true;
  }
  return L;
}

/* ---------------- 买东西 ---------------- */
function buy(C, s, k) {
  const p = C.props[k];
  if (!p) throw Error("没有这东西");
  if (s.props[k]) throw Error("已经置办过了");
  if (s.money < p.cost) throw Error("钱不够");
  s.money -= p.cost;
  s.props[k] = true;
  const eff = p.eff || {};
  if (eff.rep) s.rep = clamp(s.rep + eff.rep, 0, 100);
  if (eff.heart) s.heart = clamp(s.heart + eff.heart, 0, 100);
  if (eff.craft) s.craft += eff.craft;
  return p;
}
function pointBonus(C, s) {
  return (s.props.ruler ? 1 : 0) + (s.props.lamp ? 1 : 0);
}

/* ---------------- 给自己做一件 ---------------- */
function canOwnDress(C, s) {
  if (s.ownDress) return "已经做过了";
  if (s.month < 12) return "还没到年底";
  if (s.active) return "手上还有活";
  if (s.money < CFG.dressCost) return "连本钱都拿不出来";
  return null;
}
function ownDress(C, s) {
  const err = canOwnDress(C, s);
  if (err) throw Error(err);
  s.money -= CFG.dressCost;
  s.ownDress = true;
  s.heart = clamp(s.heart + 10, 0, 100);
  s.flags.ownDress = true;
  s.log.unshift("腊月 · 给自己裁了一件");
  return true;
}

/* ---------------- 结局 ---------------- */
function endingOf(C, s) {
  const f = s.flags;
  if (s.debt > 0 && s.money < CFG.rent) return "e_close";
  if (s.heart <= 10) return "e_numb";
  if (f.married) return "e_wife";
  if (f.manBack) return "e_man";
  if (f.partner) return "e_han";
  if (f.teachXiaoman && s.craft >= 12) return "e_xiaoman";
  if (s.ownDress && s.rep >= 45) return "e_dress";
  if (s.rep >= 72 && s.money >= 240) return "e_big";
  if (s.craft >= 18 && s.rep >= 55) return "e_master";
  if (f.movedShop && s.rep < 50) return "e_leave";
  if (s.rep >= 38) return "e_small";
  return "e_miss";
}
function endingText(C, s) {
  const id = s.ending || endingOf(C, s);
  return C.endings[id];
}

/* ---------------- 汇总 ---------------- */
function remaining(C, s) {
  return CFG.perMonth - s.taken.length;
}
function labelOf(C, c) { return c.title; }

const API = {
  CFG, fresh, valid, load, save, wipe,
  customerOf, offers, canTake, take, activeJob, pointsLeft,
  look, ask, pickFit, pickCloth, setPay, setHurry,
  ready, judge, deliver, monthEnd,
  echoText, readEcho, monthEvent, evChoose,
  lettersOf, readLetter, buy, pointBonus,
  canOwnDress, ownDress, endingOf, endingText, remaining, labelOf,
  SLOT_NAME
};
return API;
})();

if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;
