// MultiX v48 — asegurar Centro Arbolito en la lista de centros activos, sin alterar otros datos
(function(){
'use strict';
function persist(){try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}}
function ensureArbolito(){
  if(typeof data==='undefined'||!data?.centers?.Arbolito)return false;
  data.settings=data.settings||{};
  let active=Array.isArray(data.settings.activeCenters)?[...data.settings.activeCenters]:[];
  if(!active.length&&typeof window.mxGetActiveCenters==='function'){
    try{active=[...window.mxGetActiveCenters()];}catch(_){}
  }
  if(!active.includes('Arbolito')){
    active.push('Arbolito');
    data.settings.activeCenters=[...new Set(active)];
    persist();
  }
  window.MX_ACTIVE_CENTERS=[...(data.settings.activeCenters||active)];
  try{
    if(typeof rCenter!=='undefined'&&rCenter&&!Array.from(rCenter.options||[]).some(o=>o.value==='Arbolito')){
      const areaIndex=Array.from(rCenter.options||[]).findIndex(o=>o.value==='Área / Base Cisnes');
      const opt=new Option('Arbolito','Arbolito');
      if(areaIndex>=0)rCenter.add(opt,areaIndex);else rCenter.add(opt);
    }
  }catch(_){}
  try{if(typeof renderCenters==='function')renderCenters();}catch(_){}
  try{if(typeof renderStats==='function')renderStats();}catch(_){}
  try{if(typeof renderSummary==='function')renderSummary();}catch(_){}
  return true;
}
let n=0;const t=setInterval(()=>{n++;if(ensureArbolito()||n>120)clearInterval(t);},100);
})();
