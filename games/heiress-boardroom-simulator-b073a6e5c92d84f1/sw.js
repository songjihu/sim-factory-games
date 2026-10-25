const CACHE='g031-heiress-v1.0.0';
const FILES=['./','index.html','style.css','engine.js','app.js','manifest.webmanifest','icon.svg',...['estate','board','gallery','archive','gala','study'].flatMap(x=>['art/'+x+'.webp','art/'+x+'-short.webp']),'art/estate-hero.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('g031-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||new Response('暂时离线；请联网打开一次以缓存资源',{status:503}))));});
