// MultiX v33 — ficha maestra de equipos persistente entre semanas
(function(){
'use strict';
const MASTER_KEY='multixEquipmentMasterV33';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const clone=v=>JSON.parse(JSON.stringify(v));
const stableKeys=['name','type','brand','model','reg','interval','notes'];
const carryKeys=['current','last','next','status'];
function centers(){return Object.keys(data?.centers||{});}
function isHistorical(){return !!data?.sourceKey;}
function loadMaster(){try{return JSON.parse(localStorage.getItem(MASTER_KEY)||'{}')||{};}catch(_){return {};}}
function saveMaster(m){try{localStorage.setItem(MASTER_KEY,JSON.stringify(m));}catch(_){}}
function eqKey(e){return String(e?.id||'')||[norm(e?.reg),norm(e?.name),norm(e?.type)].join('|');}
function sameEq(a,b){if(a?.id&&b?.id&&a.id===b.id)return true;if(a?.reg&&b?.reg&&norm(a.reg)===norm(b.reg)&&norm(a.name)===norm(b.name))return true;return norm(a?.name)===norm(b?.name)&&norm(a?.type)===norm(b?.type);}
function latestHistoryEquipment(center){
  const hist=[...(data?.history||[])].sort((a,b)=>String(b?.meta?.end||b?.meta?.start||'').localeCompare(String(a?.meta?.end||a?.meta?.start||'')));
  for(const h of hist){const list=h?.centers?.[center]?.equipment;if(Array.isArray(list)&&list.length)return clone(list);}return [];
}
function mergeMissing(target,source){
  [...stableKeys,...carryKeys].forEach(k=>{if((target[k]===undefined||target[k]===null||String(target[k]).trim()==='')&&source[k]!==undefined&&source[k]!==null)target[k]=source[k];});
  return target;
}
function recoverFromHistory(){
  if(isHistorical()||!data?.centers)return;
  centers().forEach(center=>{
    const c=data.centers[center];c.equipment=Array.isArray(c.equipment)?c.equipment:[];
    const prev=latestHistoryEquipment(center);if(!prev.length)return;
    if(!c.equipment.length){c.equipment=clone(prev);return;}
    prev.forEach(pe=>{const cur=c.equipment.find(e=>sameEq(e,pe));if(cur)mergeMissing(cur,pe);else c.equipment.push(clone(pe));});
  });
}
function captureMaster(){
  if(isHistorical()||!data?.centers)return;
  const m=loadMaster();
  centers().forEach(center=>{const list=data.centers[center]?.equipment;if(Array.isArray(list)&&list.length)m[center]=clone(list);});
  saveMaster(m);
}
function applyMaster(){
  if(isHistorical()||!data?.centers)return;
  const m=loadMaster();
  centers().forEach(center=>{
    const c=data.centers[center];c.equipment=Array.isArray(c.equipment)?c.equipment:[];
    const fixed=Array.isArray(m[center])?m[center]:[];if(!fixed.length)return;
    if(!c.equipment.length){c.equipment=clone(fixed);return;}
    fixed.forEach(me=>{const cur=c.equipment.find(e=>sameEq(e,me));if(cur){stableKeys.forEach(k=>{if(me[k]!==undefined)cur[k]=me[k];});carryKeys.forEach(k=>{if((cur[k]===undefined||cur[k]===null||String(cur[k]).trim()==='')&&me[k]!==undefined)cur[k]=me[k];});}else c.equipment.push(clone(me));});
  });
}
function persist(){try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){} }
function installWeeklyPatch(){
  if(window.__mxEquipmentWeeklyV33||typeof window.newWeekly!=='function')return false;
  window.__mxEquipmentWeeklyV33=true;
  const old=window.newWeekly;
  window.newWeekly=function(){
    recoverFromHistory();captureMaster();
    const r=old.apply(this,arguments);
    setTimeout(()=>{applyMaster();captureMaster();persist();if(typeof window.renderAll==='function')try{window.renderAll();}catch(_){}},0);
    return r;
  };
  return true;
}
function wrap(name){
  const fn=window[name];if(typeof fn!=='function'||fn.__mxMasterV33)return false;
  function wrapped(){const r=fn.apply(this,arguments);setTimeout(()=>{if(!isHistorical()){captureMaster();persist();}},0);return r;}
  wrapped.__mxMasterV33=true;window[name]=wrapped;return true;
}
function lockCards(){
  document.querySelectorAll('.mx-eq-card').forEach(card=>{
    if(card.dataset.mxFixedV33)return;card.dataset.mxFixedV33='1';
    const actions=card.querySelector('.mx-eq-actions');
    if(actions){const b=document.createElement('button');b.type='button';b.className='mx-eq-edit-master';b.textContent='Editar ficha';actions.insertBefore(b,actions.querySelector('.mx-eq-delete'));
      b.onclick=()=>{const edit=!card.classList.contains('mx-eq-master-edit');card.classList.toggle('mx-eq-master-edit',edit);b.textContent=edit?'Bloquear ficha':'Editar ficha';applyLocks(card,!edit);};}
    const note=document.createElement('div');note.className='mx-eq-fixed-note';note.textContent='Ficha fija del equipo. En el uso semanal actualiza los horómetros; usa “Editar ficha” solo si cambia serie, marca, modelo o identificación.';
    card.querySelector('.mx-eq-grid')?.prepend(note);applyLocks(card,true);
  });
}
function applyLocks(card,locked){
  const fixedLabels=['nombre del equipo','tipo','n° serie / código / registro','marca','modelo','intervalo mantención','observaciones / detalle'];
  card.querySelectorAll('.mx-eq-field').forEach(field=>{const label=norm(field.querySelector('label')?.textContent);if(!fixedLabels.includes(label))return;field.classList.toggle('mx-eq-fixed-field',locked);field.querySelectorAll('input,select,textarea').forEach(el=>{if(el.tagName==='SELECT')el.disabled=locked;else el.readOnly=locked;});});
}
function styles(){if(document.getElementById('mxEquipmentPersistenceV33Styles'))return;const s=document.createElement('style');s.id='mxEquipmentPersistenceV33Styles';s.textContent=`
.mx-eq-edit-master{border:1px solid #32617a;background:#102b3c;color:#bdefff;border-radius:9px;padding:7px 10px;font-weight:850;cursor:pointer}.mx-eq-fixed-note{grid-column:1/-1;border:1px solid #245064;background:#0a2635;color:#9fc6d6;border-radius:10px;padding:9px 11px;font-size:11px;line-height:1.35}.mx-eq-fixed-field input[readonly],.mx-eq-fixed-field textarea[readonly],.mx-eq-fixed-field select:disabled{opacity:.72;background:#091923!important;border-color:#203c4b!important;color:#b7c8d2!important;cursor:not-allowed}.mx-eq-master-edit .mx-eq-fixed-field input,.mx-eq-master-edit .mx-eq-fixed-field textarea,.mx-eq-master-edit .mx-eq-fixed-field select{opacity:1!important}
`;
document.head.appendChild(s);}
function install(){
  if(typeof data==='undefined'||!data?.centers)return false;
  styles();recoverFromHistory();applyMaster();captureMaster();persist();
  installWeeklyPatch();wrap('mxEqV21Changed');wrap('mxAddCenterEquipment');wrap('mxDeleteCenterEquipment');
  lockCards();
  if(!window.__mxEqLockWatcherV33)window.__mxEqLockWatcherV33=setInterval(lockCards,500);
  return true;
}
let n=0;const t=setInterval(()=>{n++;if(install()||n>120)clearInterval(t);},100);
})();
