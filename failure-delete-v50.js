// MultiX v50.1 — eliminar fallas del estado actual sin borrar el historial
(function(){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const isOpen=s=>{s=norm(s);return s.includes('abiert')||s.includes('en proceso')||s.includes('pendiente');};
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
function failureKey(center,f){return [norm(center),norm(f?.equipmentName||f?.equipment||'General'),norm(f?.failureType||''),norm(f?.description||f?.detail||'')].join('|');}
function currentZone(){return document.getElementById('mxeZoneArea')?.value||document.getElementById('summary')?.dataset?.mxeArea||'Todas las zonas';}
function centersFor(zone){
  const all=Object.keys(window.data?.centers||{});
  if(zone==='Área Refugio')return all.filter(n=>REFUGIO_SET.has(norm(n)));
  if(zone==='Área Puyuhuapi')return all.filter(n=>!REFUGIO_SET.has(norm(n)));
  return all;
}
function currentOpenRows(zone){
  const allowed=new Set(centersFor(zone));
  const latest=new Map();
  const history=[...(Array.isArray(window.data?.history)?window.data.history:[])].sort((a,b)=>String(a?.meta?.end||a?.meta?.start||'').localeCompare(String(b?.meta?.end||b?.meta?.start||'')));
  const snaps=[...history,window.data];
  snaps.forEach(s=>allowed.forEach(center=>{
    const c=s?.centers?.[center];if(!c)return;
    (c.failureLog||[]).forEach(f=>latest.set(failureKey(center,f),{record:f,center,snapshot:s}));
  }));
  return [...latest.values()].filter(x=>isOpen(x.record?.status)).sort((a,b)=>String(b.record?.date||'').localeCompare(String(a.record?.date||'')));
}
function persist(){
  try{localStorage.setItem('multixMantencion',JSON.stringify(window.data));}catch(_){}
  try{if(typeof window.mxPersistDraft==='function')window.mxPersistDraft(true);}catch(_){}
  try{if(typeof window.mxScheduleAutosave==='function')window.mxScheduleAutosave();}catch(_){}
}
function suppress(center,source){
  const c=window.data?.centers?.[center];if(!c||!source)return false;
  c.failureLog=Array.isArray(c.failureLog)?c.failureLog:[];
  const id=source.id||'';
  let f=id?c.failureLog.find(x=>x.id===id):null;
  if(!f){
    const key=failureKey(center,source);
    f=c.failureLog.find(x=>failureKey(center,x)===key)||null;
  }
  if(!f){f={...source};c.failureLog.push(f);}
  f.status='Eliminada';
  f.deletedFromOpen=true;
  f.deletedDate=new Date().toISOString().slice(0,10);
  persist();
  return true;
}
function installStyles(){
  if(document.getElementById('mxFailureDeleteV50Styles'))return;
  const s=document.createElement('style');s.id='mxFailureDeleteV50Styles';s.textContent=`
  .mx-fail-delete{margin-top:10px;border:1px solid #713842;background:#34171d;color:#ffb1b7;border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer}.mx-fail-delete:active{transform:scale(.98)}
  `;document.head.appendChild(s);
}
function refreshCounter(){
  const left=currentOpenRows(currentZone()).length;
  const sub=document.getElementById('mxFailSubtitle');
  if(sub)sub.textContent=`${currentZone()} · ${left} falla${left===1?'':'s'} pendiente${left===1?'':'s'} de cierre`;
  const card=[...document.querySelectorAll('#summary .mxe-kpi')].find(x=>norm(x.textContent).includes('fallas abiertas'));
  const n=card?.querySelector('strong');if(n)n.textContent=String(left);
  return left;
}
function patch(){
  const list=document.getElementById('mxFailList');if(!list)return;
  const items=[...list.querySelectorAll('.mx-fail-item')];
  items.forEach((item,domIndex)=>{
    if(item.dataset.mxDeleteV501)return;item.dataset.mxDeleteV501='1';
    const select=item.querySelector('.mx-fail-state');
    const rowIndex=Number.isFinite(Number(select?.dataset?.failIndex))?Number(select.dataset.failIndex):domIndex;
    const center=item.querySelector('.mx-fail-center')?.textContent?.trim()||'';
    const eq=item.querySelector('.mx-fail-eq')?.textContent?.trim()||'General';
    const desc=item.querySelector('.mx-fail-desc')?.textContent?.trim()||'Sin descripción';
    const b=document.createElement('button');b.type='button';b.className='mx-fail-delete';b.textContent='Eliminar';b.setAttribute('aria-label','Eliminar esta falla de Fallas abiertas');
    b.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      if(!confirm(`¿Eliminar esta falla de “Fallas abiertas”?\n\n${center} · ${eq}\n${desc}`))return;
      const rows=currentOpenRows(currentZone());
      const row=rows[rowIndex]||rows.find(x=>x.center===center&&norm(x.record?.equipmentName||x.record?.equipment||'General')===norm(eq)&&norm(x.record?.description||x.record?.detail||'Sin descripción')===norm(desc));
      if(!row?.record){alert('No se pudo identificar esta falla para eliminarla.');return;}
      if(!suppress(row.center,row.record)){alert('No se pudo eliminar la falla.');return;}
      const left=refreshCounter();
      item.remove();
      if(!left)list.innerHTML='<div class="mx-fail-empty">No hay fallas abiertas en esta zona.</div>';
    };
    item.appendChild(b);
  });
}
function start(){installStyles();patch();const obs=new MutationObserver(patch);obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
