// MultiX v22 — reasignación de botes y actualización Playa Bonita
(function(){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};
function findAndRemoveBoat(match){
  for(const [center,c] of Object.entries(data?.centers||{})){
    const list=c?.equipment||[];
    const i=list.findIndex(e=>match(norm(e?.name),e));
    if(i>=0)return {equipment:list.splice(i,1)[0],from:center};
  }
  return null;
}
function ensureCenter(name){const c=data?.centers?.[name];if(!c)return null;c.equipment=Array.isArray(c.equipment)?c.equipment:[];return c;}
function install(){
  if(typeof data==='undefined'||!data?.centers)return false;
  const ganso=ensureCenter('Ganso'),pearson=ensureCenter('Pearson');if(!ganso||!pearson)return false;
  let rob=ganso.equipment.find(e=>norm(e.name).includes('robalo'));
  if(!rob){const found=findAndRemoveBoat(n=>n.includes('robalo'));rob=found?.equipment||null;if(rob)ganso.equipment.push(rob);}
  if(rob){rob.name='Róbalo';rob.type=rob.type||'Bote / Motor fuera de borda';}
  let playa=pearson.equipment.find(e=>norm(e.name).includes('playa bonita'));
  if(!playa){const found=findAndRemoveBoat(n=>n.includes('playa bonita')||n.includes('plata bonita'));playa=found?.equipment||null;if(playa)pearson.equipment.push(playa);}
  if(!playa){playa={id:'pearson-playa-bonita',name:'Playa Bonita',type:'Bote / Motor fuera de borda',brand:'Yamaha',model:'FT50CET',reg:'PMO-6601',current:'770',last:'',next:'',interval:'300',status:'OK',notes:'Motor Yamaha 64J · Serie L 1026008'};pearson.equipment.push(playa);}
  playa.name='Playa Bonita';playa.type='Bote / Motor fuera de borda';playa.brand='Yamaha';playa.model='FT50CET';playa.reg='PMO-6601';playa.current='770';playa.interval='300';
  const extra='Motor Yamaha 64J · Serie L 1026008';if(!String(playa.notes||'').includes('1026008'))playa.notes=(playa.notes?playa.notes+' · ':'')+extra;
  if(typeof window.mxRecalcEquipment==='function'){try{window.mxRecalcEquipment(playa);if(rob)window.mxRecalcEquipment(rob);}catch(_){}}
  data.meta=data.meta||{};data.meta.boatAssignmentsV22=true;persist();if(typeof renderAll==='function')renderAll();if(typeof currentCenter!=='undefined'&&currentCenter&&document.getElementById('editor')?.classList.contains('open')&&typeof renderEqEditor==='function')renderEqEditor();return true;
}
let n=0;const t=setInterval(()=>{n++;if(install()||n>100)clearInterval(t);},100);
})();

(function(){
  const scripts=[
    {id:'mxStartupStabilityV31Loader',src:'startup-stability-v31.js?v=41',err:'No se pudo cargar el estabilizador seguro'},
    {id:'mxDashboardExactV29Loader',src:'dashboard-exact-v29.js?v=41',err:'No se pudo cargar el estilo del inicio corporativo'},
    {id:'mxDashboardZonesTotalV32Loader',src:'dashboard-zones-total-v32.js?v=41',err:'No se pudo cargar el dashboard histórico por áreas'},
    {id:'mxStabilityWatchdogV40Loader',src:'stability-watchdog-v40.js?v=41',err:'No se pudo cargar la protección de estabilidad'},
    {id:'mxCommandDockV30Loader',src:'command-dock-v30.js?v=42',err:'No se pudo cargar la barra de comandos'},
    {id:'mxEquipmentPersistenceV33Loader',src:'equipment-persistence-v33.js?v=41',err:'No se pudo cargar la ficha maestra de equipos'},
    {id:'mxReport20260824V26Loader',src:'report-2026-08-24-v26.js?v=41',err:'No se pudo cargar el informe histórico 24-08 al 30-08'},
    {id:'mxReport20260901V28Loader',src:'report-2026-09-01-v28.js?v=41',err:'No se pudo cargar el informe histórico 01-09 al 06-09'},
    {id:'mxWorkLogV24Loader',src:'work-log-v24.js?v=41',err:'No se pudo cargar mantenimiento y fallas'},
    {id:'mxFailureHistoryRefreshV52Loader',src:'failure-history-refresh-v52.js?v=1',err:'No se pudo refrescar el acumulado histórico de fallas'},
    {id:'mxDashboardFailuresV34Loader',src:'dashboard-failures-v34.js?v=41',err:'No se pudo cargar el detalle de fallas abiertas'},
    {id:'mxFailureDeleteV50Loader',src:'failure-delete-v50.js?v=2',err:'No se pudo cargar la eliminación de fallas abiertas'},
    {id:'mxRequirementsProgrammingV36Loader',src:'requirements-programming-v36.js?v=41',err:'No se pudo cargar requerimientos y programaciones'},
    {id:'mxDashboardWorksHistoryLiteV42Loader',src:'dashboard-works-history-lite-v42.js?v=1',err:'No se pudo cargar el histórico simple de trabajos realizados'},
    {id:'mxDashboardOverdueEquipmentLiteV44Loader',src:'dashboard-overdue-equipment-lite-v44.js?v=1',err:'No se pudo cargar el detalle de equipos vencidos por horómetro'},
    {id:'mxEnsureDeltaCenterV45Loader',src:'ensure-delta-center-v45.js?v=1',err:'No se pudo restaurar Centro Delta'},
    {id:'mxEnsureArbolitoCenterV48Loader',src:'ensure-arbolito-center-v48.js?v=1',err:'No se pudo restaurar Centro Arbolito'},
    {id:'mxEquipmentSafetyRecoveryV49Loader',src:'equipment-safety-recovery-v49.js?v=1',err:'No se pudo cargar la recuperación segura de equipos'},
    {id:'mxEquipmentHoursPerformanceV47Loader',src:'equipment-hours-performance-v47.js?v=3',err:'No se pudo cargar la edición optimizada de equipos'},
    {id:'mxRequestsListV51Loader',src:'requests-list-v51.js?v=1',err:'No se pudo cargar el listado de solicitudes'},
    {id:'mxTabIsolationV41Loader',src:'tab-isolation-v41.js?v=41',err:'No se pudo cargar la separación de pestañas'}
  ];
  let i=0;
  function next(){if(i>=scripts.length)return;const x=scripts[i++];const existing=document.getElementById(x.id);if(existing){next();return;}const s=document.createElement('script');s.id=x.id;s.src=x.src;s.async=false;s.onload=next;s.onerror=()=>{console.error(x.err);next();};document.body.appendChild(s);}
  next();
})();
