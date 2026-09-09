// MultiX v49 — recuperación segura de generadores Arbolito y protección contra borrado al ocultar centros
(function(){
'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const sameEq=(a,b)=>{if(a?.id&&b?.id&&a.id===b.id)return true;if(a?.reg&&b?.reg&&norm(a.reg)===norm(b.reg)&&norm(a.name)===norm(b.name))return true;return norm(a?.name)===norm(b?.name)&&norm(a?.type)===norm(b?.type);};
const isGenerator=e=>norm((e?.type||'')+' '+(e?.name||'')).includes('generador');
function persist(){try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){} }
function loadMaster(){try{return JSON.parse(localStorage.getItem('multixEquipmentMasterV33')||'{}')||{};}catch(_){return {};}}
function latestHistory(){
  const hist=[...(data?.history||[])].sort((a,b)=>String(b?.meta?.end||b?.meta?.start||'').localeCompare(String(a?.meta?.end||a?.meta?.start||'')));
  for(const h of hist){const list=h?.centers?.Arbolito?.equipment;if(Array.isArray(list)&&list.some(isGenerator))return list;}
  return [];
}
function sourceGenerators(){
  const master=loadMaster()?.Arbolito;if(Array.isArray(master)&&master.some(isGenerator))return master.filter(isGenerator);
  const hist=latestHistory();if(hist.length)return hist.filter(isGenerator);
  const base=window.MULTIX_BASE?.equipment?.Arbolito;return Array.isArray(base)?base.filter(isGenerator):[];
}
function recoverArbolito(){
  if(typeof data==='undefined'||!data?.centers?.Arbolito)return false;
  const c=data.centers.Arbolito;c.equipment=Array.isArray(c.equipment)?c.equipment:[];
  const src=sourceGenerators();if(!src.length)return true;
  let changed=false;
  src.forEach(g=>{if(!c.equipment.some(e=>sameEq(e,g))){c.equipment.push(clone(g));changed=true;}});
  if(changed){
    const m=loadMaster();m.Arbolito=clone(c.equipment);try{localStorage.setItem('multixEquipmentMasterV33',JSON.stringify(m));}catch(_){}
    persist();
    try{if(typeof renderCenters==='function')renderCenters();}catch(_){}
    try{if(typeof renderStats==='function')renderStats();}catch(_){}
    try{if(typeof currentCenter!=='undefined'&&currentCenter==='Arbolito'&&document.getElementById('editor')?.classList.contains('open')&&typeof renderEqEditor==='function')renderEqEditor();}catch(_){}
  }
  return true;
}
function protectActiveCenters(){
  if(typeof window.mxSetActiveCenters!=='function'||window.mxSetActiveCenters.__mxSafeV49)return false;
  function safeSet(list){
    const all=Object.keys(data?.centers||{}),valid=[...new Set((list||[]).filter(n=>all.includes(n)))];
    data.settings=data.settings||{};data.settings.activeCenters=valid;window.MX_ACTIVE_CENTERS=[...valid];persist();
    if(typeof renderAll==='function')try{renderAll();}catch(_){}
    return [...valid];
  }
  safeSet.__mxSafeV49=true;window.mxSetActiveCenters=safeSet;return true;
}
let tries=0;const t=setInterval(()=>{tries++;const a=recoverArbolito(),b=protectActiveCenters();if((a&&b)||tries>120)clearInterval(t);},100);
})();
