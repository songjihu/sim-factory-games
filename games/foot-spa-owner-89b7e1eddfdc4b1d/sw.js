'use strict';
const CACHE='foot-spa-G208-1.1.0-r1';
const FILES=['./','index.html','style.css','night.css','engine.js','app.js','manifest.webmanifest','assets/icon.png','assets/cover.webp','assets/hall.webp','assets/lounge.webp','assets/suite.webp','assets/service-pressure.webp','assets/service-herbal.webp','assets/service-shoulder.webp','assets/service-tea.webp',...Array.from({length:8},(_,i)=>'assets/staff-'+i+'.webp')];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('foot-spa-G208-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 const scope=new URL(self.registration.scope);
 if(!new URL(e.request.url).pathname.startsWith(scope.pathname))return;
 e.respondWith((async()=>{
  try{
   const r=await fetch(e.request);
   if(r.ok&&FILES.some(f=>new URL(f,scope).href===e.request.url)){
    const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));
   }
   return r;
  }catch{
   const cached=await caches.match(e.request);
   if(cached)return cached;
   if(e.request.mode==='navigate')return (await caches.match(new URL('./',scope).href))||Response.error();
   return Response.error();
  }
 })());
});
