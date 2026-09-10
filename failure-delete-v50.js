// MultiX v50 — eliminar fallas del estado actual sin borrar el historial
(function(){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const isOpen=s=>{s=norm(s);return s.includes('abiert')||s.includes('en proceso')||s.includes('pendiente');};
function latestMatch(center,eq,desc,date){
  const snaps=[...(Array.isArray(window.data?.history)?window.data.history:[]),window.data];
  let found=null;
  snaps.forEach(s=>{
    const list=s?.centers?.[center]?.failureLog||[];
    list.forEach(f=>{
      if(!isOpen(f?.status))return;
      const feq=norm(f?.equipmentName||f?.equipment||'General');
      const fdesc=norm(f?.description||f?.detail||'Sin descripción');
      if(feq===norm(eq)&&fdesc===norm(desc)&&(!date||String(f?.date||'')===String(date)))found=f;
    });
  });
  return found;
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
    const keyEq=norm(source?.equipmentName||source?.equipment||'General'),keyDesc=norm(source?.description||source?.detail||'Sin descripción');
    f=c.failureLog.find(x=>norm(x?.equipmentName||x?.equipment||'General')===keyEq&&norm(x?.description||x?.detail||'Sin descripción')===keyDesc&&String(x?.date||'')===String(source?.date||''));
  }
  if(!f){f={...source};c.failureLog.push(f);}
  f.status='Eliminada';f.deletedFromOpen=true;f.deletedDate=new Date().toISOString().slice(0,10);
  persist();return true;
}
function installStyles(){
  if(document.getElementById('mxFailureDeleteV50Styles'))return;
  const s=document.createElement('style');s.id='mxFailureDeleteV50Styles';s.textContent=`
  .mx-fail-delete{margin-top:10px;border:1px solid #713842;background:#34171d;color:#ffb1b7;border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer}.mx-fail-delete:active{transform:scale(.98)}
  `;document.head.appendChild(s);
}
function patch(){
  const list=document.getElementById('mxFailList');if(!list)return;
  list.querySelectorAll('.mx-fail-item').forEach(item=>{
    if(item.dataset.mxDeleteV50)return;item.dataset.mxDeleteV50='1';
    const center=item.querySelector('.mx-fail-center')?.textContent?.trim()||'';
    const eq=item.querySelector('.mx-fail-eq')?.textContent?.trim()||'General';
    const desc=item.querySelector('.mx-fail-desc')?.textContent?.trim()||'Sin descripción';
    const meta=item.querySelector('.mx-fail-meta')?.textContent?.trim()||'';
    const date=(meta.match(/^\d{4}-\d{2}-\d{2}/)||[])[0]||'';
    const b=document.createElement('button');b.type='button';b.className='mx-fail-delete';b.textContent='Eliminar';b.setAttribute('aria-label','Eliminar esta falla de Fallas abiertas');
    b.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      if(!confirm(`¿Eliminar esta falla de “Fallas abiertas”?\n\n${center} · ${eq}\n${desc}`))return;
      const src=latestMatch(center,eq,desc,date);if(!src){alert('No se pudo identificar esta falla para eliminarla.');return;}
      if(!suppress(center,src)){alert('No se pudo eliminar la falla.');return;}
      item.remove();
      const left=list.querySelectorAll('.mx-fail-item').length;
      const sub=document.getElementById('mxFailSubtitle');if(sub)sub.textContent=`${document.getElementById('mxeZoneArea')?.value||'Todas las zonas'} · ${left} falla${left===1?'':'s'} pendiente${left===1?'':'s'} de cierre`;
      if(!left)list.innerHTML='<div class="mx-fail-empty">No hay fallas abiertas en esta zona.</div>';
      const card=[...document.querySelectorAll('#summary .mxe-kpi')].find(x=>norm(x.textContent).includes('fallas abiertas'));const n=card?.querySelector('strong');if(n)n.textContent=String(left);
    };
    item.appendChild(b);
  });
}
function start(){installStyles();patch();const obs=new MutationObserver(patch);obs.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
