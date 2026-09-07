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

  // Róbalo: se mueve desde el centro donde esté actualmente hacia Ganso, conservando sus datos.
  let rob=ganso.equipment.find(e=>norm(e.name).includes('robalo'));
  if(!rob){
    const found=findAndRemoveBoat(n=>n.includes('robalo'));
    rob=found?.equipment||null;
    if(rob)ganso.equipment.push(rob);
  }
  if(rob){rob.name='Róbalo';rob.type=rob.type||'Bote / Motor fuera de borda';}

  // Playa Bonita: se mueve a Pearson si ya existía en otro centro; si no, se crea.
  let playa=pearson.equipment.find(e=>norm(e.name).includes('playa bonita'));
  if(!playa){
    const found=findAndRemoveBoat(n=>n.includes('playa bonita')||n.includes('plata bonita'));
    playa=found?.equipment||null;
    if(playa)pearson.equipment.push(playa);
  }
  if(!playa){
    playa={id:'pearson-playa-bonita',name:'Playa Bonita',type:'Bote / Motor fuera de borda',brand:'Yamaha',model:'FT50CET',reg:'PMO-6601',current:'770',last:'',next:'',interval:'300',status:'OK',notes:'Motor Yamaha 64J · Serie L 1026008'};
    pearson.equipment.push(playa);
  }
  playa.name='Playa Bonita';
  playa.type='Bote / Motor fuera de borda';
  playa.brand='Yamaha';
  playa.model='FT50CET';
  playa.reg='PMO-6601';
  playa.current='770';
  playa.interval='300';
  const extra='Motor Yamaha 64J · Serie L 1026008';
  if(!String(playa.notes||'').includes('1026008'))playa.notes=(playa.notes?playa.notes+' · ':'')+extra;
  if(typeof window.mxRecalcEquipment==='function'){try{window.mxRecalcEquipment(playa);if(rob)window.mxRecalcEquipment(rob);}catch(_){}}

  data.meta=data.meta||{};data.meta.boatAssignmentsV22=true;
  persist();
  if(typeof renderAll==='function')renderAll();
  if(typeof currentCenter!=='undefined'&&currentCenter&&document.getElementById('editor')?.classList.contains('open')&&typeof renderEqEditor==='function')renderEqEditor();
  return true;
}
let n=0;const t=setInterval(()=>{n++;if(install()||n>100)clearInterval(t);},100);
})();

// Carga secuencial: informes históricos, trabajos/fallas y nuevo inicio corporativo.
(function(){
  const scripts=[
    {id:'mxReport20260824V26Loader',src:'report-2026-08-24-v26.js?v=29',err:'No se pudo cargar el informe histórico 24-08 al 30-08'},
    {id:'mxReport20260901V28Loader',src:'report-2026-09-01-v28.js?v=29',err:'No se pudo cargar el informe histórico 01-09 al 06-09'},
    {id:'mxWorkLogV24Loader',src:'work-log-v24.js?v=29',err:'No se pudo cargar mantenimiento y fallas v24'},
    {id:'mxDashboardExactV29Loader',src:'dashboard-exact-v29.js?v=29',err:'No se pudo cargar el inicio corporativo v29'}
  ];
  let i=0;
  function next(){
    if(i>=scripts.length)return;
    const x=scripts[i++];
    const existing=document.getElementById(x.id);
    if(existing){next();return;}
    const s=document.createElement('script');s.id=x.id;s.src=x.src;s.async=false;
    s.onload=next;
    s.onerror=()=>{console.error(x.err);next();};
    document.body.appendChild(s);
  }
  next();
})();
