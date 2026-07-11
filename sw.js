/* Service worker för Vardagskoll — gör appen installerbar och offline-bar. */
importScripts('./shared.js');

const CACHE_VERSION = 'vardagskoll-v2';
const APP_SHELL = [
  './',
  './index.html',
  './shared.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Nätverk först (för att alltid få senaste versionen när man är online),
   men faller tillbaka till cachen så appen fungerar utan uppkoppling. */
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const c of list){ if('focus' in c) return c.focus(); }
      if(self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});

/* Bästa-möjliga-försök: periodisk bakgrundskontroll av gympapåminnelser.
   Stöds bara i installerade PWA:er på Chrome/Edge för Android (inte iOS),
   och bara efter att webbläsaren bedömt appen som "väl använd". Om det inte
   stöds gör det ingenting — påminnelserna fungerar ändå varje gång appen öppnas. */
self.addEventListener('periodicsync', event => {
  if(event.tag === 'gympa-check') event.waitUntil(checkGympaInBackground());
});

/* Vissa webbläsare saknar periodicsync helt men stödjer vanlig 'sync' (engångs-återförsök);
   vi återanvänder samma kontroll där också, som extra säkerhetsnät. */
self.addEventListener('sync', event => {
  if(event.tag === 'gympa-check') event.waitUntil(checkGympaInBackground());
});

async function checkGympaInBackground(){
  try{
    const children = (await idbGet('children')) || [];
    const notified = (await idbGet('notified')) || {};
    const ts = fmtDate(todayDate());
    let changed = false;

    for(const r of gympaReminders(children)){
      if(r.off === 0) continue; /* notis skickas bara 1 och 2 dagar innan */
      const key = 'g-' + r.child.id + '-' + fmtDate(r.date) + '-' + r.off;
      if(notified[key]) continue;
      await self.registration.showNotification('Vardagskoll – gympapåminnelse', {
        body: reminderText(r),
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: key
      });
      notified[key] = ts;
      changed = true;
    }

    /* städa bort gamla nycklar (äldre än 14 dagar) */
    const limit = fmtDate(addDays(todayDate(), -14));
    for(const k of Object.keys(notified)){
      if(notified[k] < limit){ delete notified[k]; changed = true; }
    }

    if(changed) await idbSet('notified', notified);
  }catch(e){ /* best effort — misslyckas tyst */ }
}
