// MultiX v53 — edición fluida de ficha y horómetros, con guardado diferido seguro
(function(){
'use strict';
const SHADOW_KEY='multixHorometersV50';
const MASTER_KEY='multixEquipmentMasterV33';
const $=id=>document.getElementById(id);
const parseHours=v=>{const raw=String(v??'').trim();if(!raw||raw==='-')return null;const n=Number(raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null;};
const fmt=v=>{const n=parseHours(v);return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';};
const clone=v=>JSON.parse(JSON.stringify(v));
const HOUR_KEYS=new Set(['current','last']);
const EDIT_KEYS=new Set(['name','type','reg','brand','model','interval','current','last','notes']);
let shadowTimer=null;
let fullTimer=null;
let idleHandle=null;
let dirtyCenters=new Set();
let dirtyHourCenters=new Set();

function appData(){try{if(typeof data!=='undefined')return data;}catch(_){}return window.data;}
function activeCenter(){try{if(typeof currentCenter!=='undefined')return currentCenter;}catch(_){}return window.currentCenter||'';}
function equipmentAt(i){const d=appData(),c=activeCenter();return d?.centers?.[c]?.equipment?.[i]||null;}
function eqKey(e,i){return String(e?.id||e?.reg||e?.name||('eq-'+i));}
function intervalFor(e){const custom=parseHours(e?.interval);if(custom!==null)return custom;const t=((e?.type||'')+' '+(e?.name||'')).toLowerCase();if(t.includes('generador'))return 250;if(t.includes('bote')||t.includes('motor fuera')||t.includes('fuera borda')||t.includes('lancha'))return 300;return null;}
function recalc(e){if(typeof window.mxRecalcEquipment==='function'){try{return window.mxRecalcEquipment(e);}catch(_){}}
  const interval=intervalFor(e),last=parseHours(e?.last),cur=parseHours(e?.current);if(interval!==null)e.next=last===null?'':String(last+interval);const next=parseHours(e?.next);if(!['Inoperativo','En observación'].includes(e?.status)&&cur!==null&&next!==null)e.status=cur>=next?'Vencido':(next-cur<=50?'Próximo':'OK');return interval;
}
function refresh(i,e,key){
  const nx=$('mx-v21-next-'+i),st=$('mx-v21-status-'+i),type=$('mx-v21-type-'+i),title=$('mx-v21-title-'+i);
  if(nx){const interval=intervalFor(e);nx.innerHTML=`<b>${e?.next?fmt(e.next):'Ingresa última mantención'}</b><small>${interval!==null?'Automática: cada '+interval+' h':'Sin intervalo automático'}</small>`;}
  if(st)st.textContent=e?.status||'OK';
  if(type&&key==='type')type.textContent=e?.type||'Equipo';
  if(title&&key==='name')title.textContent=e?.name||'Equipo';
}
function readShadow(){try{return JSON.parse(localStorage.getItem(SHADOW_KEY)||'{}')||{};}catch(_){return {};}}
function writeShadowNow(){
  shadowTimer=null;
  const d=appData();if(!d?.centers||!dirtyHourCenters.size)return;
  const shadow=readShadow();
  dirtyHourCenters.forEach(center=>{
    const list=d.centers?.[center]?.equipment||[];shadow[center]=shadow[center]||{};
    list.forEach((e,i)=>{shadow[center][eqKey(e,i)]={id:e.id||'',reg:e.reg||'',name:e.name||'',current:e.current??'',last:e.last??'',next:e.next??'',status:e.status??'',savedAt:Date.now()};});
  });
  try{localStorage.setItem(SHADOW_KEY,JSON.stringify(shadow));}catch(_){}
  dirtyHourCenters.clear();
}
function scheduleShadow(){if(shadowTimer)clearTimeout(shadowTimer);shadowTimer=setTimeout(writeShadowNow,220);}
function mergeShadow(){const d=appData(),shadow=readShadow();if(!d?.centers)return;Object.entries(shadow).forEach(([center,rows])=>{const list=d.centers?.[center]?.equipment;if(!Array.isArray(list))return;Object.values(rows||{}).forEach(s=>{let e=list.find(x=>s.id&&x.id===s.id);if(!e&&s.reg)e=list.find(x=>String(x.reg||'')===String(s.reg));if(!e&&s.name)e=list.find(x=>String(x.name||'')===String(s.name));if(!e)return;['current','last','next','status'].forEach(k=>{if(s[k]!==undefined&&s[k]!==null&&String(s[k]).trim()!=='')e[k]=s[k];});recalc(e);});});}
function fullSaveNow(){
  fullTimer=null;
  if(idleHandle&&typeof cancelIdleCallback==='function')try{cancelIdleCallback(idleHandle);}catch(_){}
  idleHandle=null;
  const d=appData();if(!d?.centers||!dirtyCenters.size)return;
  if(dirtyHourCenters.size)writeShadowNow();
  try{localStorage.setItem('multixMantencion',JSON.stringify(d));}catch(err){console.error('No se pudo guardar ficha de equipos',err);}
  try{
    const master=JSON.parse(localStorage.getItem(MASTER_KEY)||'{}')||{};
    dirtyCenters.forEach(center=>{const list=d.centers?.[center]?.equipment;if(Array.isArray(list)&&list.length)master[center]=clone(list);});
    localStorage.setItem(MASTER_KEY,JSON.stringify(master));
  }catch(err){console.error('No se pudo actualizar ficha maestra de equipos',err);}
  dirtyCenters.clear();
  try{if(typeof renderStats==='function')renderStats();}catch(_){}
  try{if(typeof renderSummary==='function')renderSummary();}catch(_){}
}
function scheduleFullSave(delay=850){
  if(fullTimer)clearTimeout(fullTimer);
  fullTimer=setTimeout(()=>{
    fullTimer=null;
    if(typeof requestIdleCallback==='function')idleHandle=requestIdleCallback(fullSaveNow,{timeout:1600});
    else setTimeout(fullSaveNow,0);
  },delay);
}
function forceSafeSave(){
  if(shadowTimer){clearTimeout(shadowTimer);shadowTimer=null;}
  if(dirtyHourCenters.size)writeShadowNow();
  if(fullTimer){clearTimeout(fullTimer);fullTimer=null;}
  fullSaveNow();
}
function install(){
  const fn=window.mxEqV21Changed;
  if(typeof fn!=='function'||fn.__mxEquipmentEditPerformanceV53)return false;
  mergeShadow();
  function fast(i,key,value){
    if(!EDIT_KEYS.has(key))return fn(i,key,value);
    const e=equipmentAt(i);if(!e)return;
    e[key]=HOUR_KEYS.has(key)?String(value??'').trim():String(value??'');
    recalc(e);refresh(i,e,key);
    const c=activeCenter();if(c){dirtyCenters.add(c);if(HOUR_KEYS.has(key))dirtyHourCenters.add(c);}
    if(HOUR_KEYS.has(key))scheduleShadow();
    scheduleFullSave(key==='type'?250:(HOUR_KEYS.has(key)?1100:700));
  }
  fast.__mxEquipmentEditPerformanceV53=true;
  window.mxEqV21Changed=fast;
  const host=$('equipmentEditor');
  if(host&&!host.dataset.mxEquipmentEditPerformanceV53){
    host.dataset.mxEquipmentEditPerformanceV53='1';
    host.addEventListener('focusout',()=>scheduleFullSave(180),true);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)forceSafeSave();});
  window.addEventListener('pagehide',forceSafeSave);
  return true;
}
let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>60)clearInterval(t);},100);
})();
