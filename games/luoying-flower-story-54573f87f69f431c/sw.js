const CACHE='luoying-flower-story-54573f87f69f431c-v1.0.0';
const FILES=['./','index.html','style.css','app.js','config.js','assets/cover.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('luoying-flower-story-54573f87f69f431c-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin||!new URL(e.request.url).pathname.startsWith(new URL(self.registration.scope).pathname))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
