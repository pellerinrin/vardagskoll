/* Delas mellan sidan (index.html) och service worker (sw.js).
   Inga DOM-beroenden — måste kunna köras både i window och i en SW. */
'use strict';

const WDAYS = ['måndag','tisdag','onsdag','torsdag','fredag','lördag','söndag'];
const WDAYS_SHORT = ['mån','tis','ons','tor','fre','lör','sön'];
const MONTHS = ['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];

function pad2(n){ return String(n).padStart(2,'0'); }
function fmtDate(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
function parseDate(s){ const p=s.split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
function todayDate(){ const n=new Date(); return new Date(n.getFullYear(),n.getMonth(),n.getDate()); }
function addDays(d,n){ const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()); t.setDate(t.getDate()+n); return t; }
function wIdx(d){ return (d.getDay()+6)%7; } /* 0 = måndag */
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function humanDate(d){ return WDAYS[wIdx(d)]+' '+d.getDate()+' '+MONTHS[d.getMonth()]; }
function shortDate(d){ return cap(WDAYS_SHORT[wIdx(d)])+' '+d.getDate()+'/'+(d.getMonth()+1); }

function isoWeekInfo(d){
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + 3 - wIdx(t)); /* torsdagen i samma vecka */
  const jan4 = new Date(t.getFullYear(), 0, 4);
  const week1Mon = addDays(jan4, -wIdx(jan4));
  const week = 1 + Math.round((t - week1Mon) / (7*24*3600*1000));
  return { week: week, year: t.getFullYear() };
}
function weekKey(d){ const w=isoWeekInfo(d); return w.year+'-W'+pad2(w.week); }
function mondayOf(d){ return addDays(d, -wIdx(d)); }

/* ---- Gympapåminnelser (delad logik för sidan + bakgrundskoll i SW) ---- */
function gympaReminders(children){
  const out = [];
  const t = todayDate();
  for(const c of (children || [])){
    if(!c.gympa || !c.gympa.length) continue;
    for(let off = 0; off <= 2; off++){
      const d = addDays(t, off);
      if(c.gympa.includes(wIdx(d))) out.push({ child: c, date: d, off: off });
    }
  }
  out.sort((a,b) => a.off - b.off);
  return out;
}
function reminderText(r){
  const wd = WDAYS[wIdx(r.date)];
  if(r.off === 0) return 'Idag har ' + r.child.name + ' gympa – är gympapåsen med? 🤸';
  if(r.off === 1) return 'Imorgon (' + wd + ') har ' + r.child.name + ' gympa – packa gympapåsen ikväll! 👟';
  return 'På ' + wd + ' (om 2 dagar) har ' + r.child.name + ' gympa – kolla att gympakläderna är rena. 👟';
}

/* ---- Delade händelser med Skrivbordet (samma origin, egen app) ----
   Nyckel + format måste stämma överens med skrivbordet/shared.js:
   { 'YYYY-MM-DD': [ { type, label, source } ] } */
const SHARED_EVENTS_KEY = 'delade-handelser-v1';

function loadSharedEvents(){
  try{ return JSON.parse(localStorage.getItem(SHARED_EVENTS_KEY)) || {}; }
  catch(e){ return {}; }
}
function sharedEventsOn(ds){ return loadSharedEvents()[ds] || []; }

/* ---- Minimal IndexedDB-hjälp, funkar både på sidan och i service workern ---- */
const IDB_NAME = 'vardagskoll-db';
const IDB_STORE = 'meta';

function idbOpen(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if(!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value){
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key){
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
