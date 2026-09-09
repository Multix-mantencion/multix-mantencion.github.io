// MultiX v47 — edición fluida de horómetros: cálculo inmediato y guardado diferido
(function(){
'use strict';
const $=id=>document.getElementById(id);
const parseHours=v=>{const raw=String(v??'').trim();if(!raw||raw==='-')return null;const n=Number(raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null;};
const fmt=v=>{const n=parseHours(v);return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';};
let original=null;
let timer=null;
let pending=new Map();

function refresh(i,e){
  const nx=$('mx-v21-next-'+i),st=$('mx-v21-status-'+i);
  if(nx){
    const interval=parseHours(e?.interval)||((((e?.type||'')+' '+(e?.name||'')).toLowerCase().includes('generador'))?250:null);
    nx.innerHTML=`<b>${e?.next?fmt(e.next):'Ingresa última mantención'}</b><small>${interval!==null?'Automática: cada '+interval+' h':'Sin intervalo automático'}</small>`;
  }
  if(st)st.textContent=e?.status||'OK';
}
function flush(){
  if(timer){clearTimeout(timer);timer=null;}
  if(!original||!pending.size)return;
  const rows=[...pending.values()];pending.clear();
  rows.forEach(x=>{try{original(x.i,x.key,x.value);}catch(err){console.error('Error guardando horómetro',err);}});
}
function install(){
  const fn=window.mxEqV21Changed;
  if(typeof fn!=='function'||fn.__mxHoursPerformanceV47)return false;
  original=fn;
  function fast(i,key,value){
    if(key!=='current'&&key!=='last'){
      flush();
      return original(i,key,value);
    }
    const e=window.data?.centers?.[window.currentCenter]?.equipment?.[i] || (typeof data!=='undefined'&&typeof currentCenter!=='undefined'?data?.centers?.[currentCenter]?.equipment?.[i]:null);
    if(!e)return;
    const clean=String(value??'').trim();
    e[key]=clean;
    if(typeof window.mxRecalcEquipment==='function')try{window.mxRecalcEquipment(e);}catch(_){}
    refresh(i,e);
    pending.set(i+'|'+key,{i,key,value:clean});
    if(timer)clearTimeout(timer);
    timer=setTimeout(flush,700);
  }
  fast.__mxHoursPerformanceV47=true;
  window.mxEqV21Changed=fast;
  const host=$('equipmentEditor');
  if(host&&!host.dataset.mxHoursPerformanceV47){
    host.dataset.mxHoursPerformanceV47='1';
    host.addEventListener('focusout',()=>flush(),true);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
  window.addEventListener('beforeunload',flush);
  return true;
}
setTimeout(()=>{
  let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>30)clearInterval(t);},100);
},1200);
})();
