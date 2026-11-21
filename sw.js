/* Poker Licznik 4.3.0 — kontrolowana aktualizacja i pamięć offline. */
const CACHE='poker-licznik-v11-szybki-wybor-430';
const PREFIX='poker-licznik-';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  for(const item of ASSETS){const res=await fetch(new Request(item,{cache:'reload'}));if(!res.ok)throw new Error('Brak zasobu: '+item);await cache.put(item,res);}
  // Nowego workera aktywujemy dopiero po zgodzie użytkownika (chyba że to pierwsza instalacja).
 }));
});
self.addEventListener('message',event=>{if(event.data && event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith(PREFIX)&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Numer wersji ZAWSZE pochodzi z sieci, nie ze starej pamięci cache.
 if(url.pathname.endsWith('/version.json')){event.respondWith(fetch(request,{cache:'no-store'}));return;}
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   try{
    const res=await fetch(request,{cache:'no-store'});
    if(res.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',res.clone());}
    return res;
   }catch(e){return (await caches.match('./index.html'))||Response.error();}
  })());
  return;
 }
 event.respondWith((async()=>{
  const cached=await caches.match(request);
  if(cached)return cached;
  return fetch(request);
 })());
});
