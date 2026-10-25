const CACHE='g053-zhumen-v1.0.0';const FILES=['./','./index.html','./engine.js','./app.js','./style.css','./manifest.webmanifest','./icon.svg',...['hall','estate','council'].flatMap(x=>['./art/'+x+'.webp','./art/'+x+'-short.webp'])];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('g053-zhumen-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});
