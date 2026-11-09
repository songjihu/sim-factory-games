const CACHE='railway-G207-v1.2.2';
const ASSETS=['./','./index.html','./assets/terminal.webp','./assets/mountain.webp','./assets/depot.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('railway-G207-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
// 图片走缓存优先：页面每 500ms 重建 <img>，若每次都回源会让 Safari 短暂无图可画而闪烁。
// 静态资源在 install 阶段已预缓存，这里直接命中缓存，仅在缺缓存时才回源补一份。
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;
 if(new URL(e.request.url).pathname.indexOf('/assets/')>-1){
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return res}).catch(()=>Response.error())));
  return;
 }
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));
});
