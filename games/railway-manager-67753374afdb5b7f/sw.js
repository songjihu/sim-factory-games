const CACHE='railway-G207-v1.2.2';
const ASSETS=['./','./index.html','./assets/terminal.webp','./assets/mountain.webp','./assets/depot.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('railway-G207-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.registration.scope))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())))});
