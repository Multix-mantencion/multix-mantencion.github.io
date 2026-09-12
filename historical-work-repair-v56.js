// MultiX v56 — completa trabajos históricos oficiales que pudieron quedar incompletos en snapshots antiguos
(function(){
'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
const PERIODS={
  '2026-08-24|2026-08-30':{
    'Arbolito':[
      {id:'histw-20260824-arb-1',date:'2026-08-24',equipmentName:'Generador 1',maintenanceType:'Predictivo',text:'Se realizan mediciones de consumo generador 1',mechanic:'Sergio Neder',failureId:'histf-20260824-arb-overconsumo'}
    ],
    'Delta':[
      {id:'histw-20260824-del-1',date:'2026-08-24',equipmentName:'Planta de Tratamiento',maintenanceType:'Preventivo',text:'Limpieza de componentes, extracción de lodos y regulación de flujos.',mechanic:'Biocordillera',failureId:''},
      {id:'histw-20260824-del-2',date:'2026-08-24',equipmentName:'Sistema de Alimentación',maintenanceType:'Correctivo',text:'Cambio de motor y calibración de selectora 3.',mechanic:'Scale',failureId:''}
    ],
    'Pearson':[
      {id:'histw-20260824-pea-1',date:'2026-08-24',equipmentName:'Róbalo',maintenanceType:'Correctivo',text:'Cambio de mezclador de bote.',mechanic:'Sergio Neder',failureId:''},
      {id:'histw-20260824-pea-2',date:'2026-08-24',equipmentName:'Planta de Tratamiento',maintenanceType:'Preventivo',text:'Extracción de lodos, limpieza de componentes y regulación de flujos.',mechanic:'',failureId:''},
      {id:'histw-20260824-pea-3',date:'2026-08-24',equipmentName:'Sistema de Alimentación',maintenanceType:'Correctivo',text:'Pruebas por detenciones de Doser 4 con asistencia remota de Akva.',mechanic:'',failureId:'histf-20260824-pea-doser4'}
    ],
    'Puyuhuapi 2':[
      {id:'histw-20260824-p2-1',date:'2026-08-24',equipmentName:'Generador Aux',maintenanceType:'Preventivo',text:'Realización de mantención generador auxiliar.',mechanic:'Jaime Avilez (Servicios Ambientales)',failureId:''},
      {id:'histw-20260824-p2-2',date:'2026-08-24',equipmentName:'Planta de Ósmosis',maintenanceType:'Predictivo',text:'Pruebas con Keepex por baja producción de la planta.',mechanic:'Keepex',failureId:'histf-20260824-p2-bajaproduccion'}
    ],
    'Yelen':[
      {id:'histw-20260824-yel-1',date:'2026-08-24',equipmentName:'Pontón',maintenanceType:'Preventivo',text:'Revisión y entrega de pontón.',mechanic:'Jaime Avilez (Servicios Ambientales)',failureId:''}
    ]
  },
  '2026-09-01|2026-09-06':{
    'Ganso':[
      {id:'histw-20260901-gan-1',date:'2026-09-04',equipmentName:'General',maintenanceType:'Preventivo',text:'Puesta en marcha de equipos: Generadores, Plantas, Sistema de alimentación y Habitabilidad.',mechanic:'Leonardo Becer',failureId:''},
      {id:'histw-20260901-gan-2',date:'2026-09-05',equipmentName:'Sistema de Alimentación',maintenanceType:'Correctivo',text:'Revisión de falla en enlace de red Software AKVA Connect con técnico remoto AKVA, previo contacto con personal de Sistemas de alimentación MultiX.',mechanic:'Leonardo Becer',failureId:'histf-20260901-gan-akva'}
    ],
    'Puyuhuapi 2':[
      {id:'histw-20260901-p2-1',date:'2026-09-03',equipmentName:'Generador 1',maintenanceType:'Correctivo',text:'Mantención y reparación a alternador.',mechanic:'Leonardo Becker',failureId:'histf-20260901-p2-alternador'},
      {id:'histw-20260901-p2-2',date:'2026-09-03',equipmentName:'Selectora 4',maintenanceType:'Correctivo',text:'Se corrige falla de entre posición; se deja alineada y operativa.',mechanic:'Leonardo Becker',failureId:'histf-20260901-p2-selectora4'},
      {id:'histw-20260901-p2-3',date:'2026-09-03',equipmentName:'Planta de Ósmosis',maintenanceType:'Preventivo',text:'Se realiza mantención.',mechanic:'Leonardo Becker',failureId:''},
      {id:'histw-20260901-p2-4',date:'2026-09-05',equipmentName:'Estanque diario de combustible',maintenanceType:'Correctivo',text:'Reparación de tapa de registro de estanque diario de combustible.',mechanic:'Servicios Ambientales (Sergio Luna)',failureId:''}
    ],
    'Pearson':[
      {id:'histw-20260901-pea-1',date:'2026-09-01',equipmentName:'Doser 4',maintenanceType:'Correctivo',text:'Se intercambió Doser 4 inoperativo por el Doser 6.',mechanic:'Leonardo Becker',failureId:'histf-20260901-pea-doser4'},
      {id:'histw-20260901-pea-2',date:'2026-09-06',equipmentName:'Generador Back Up',maintenanceType:'Preventivo',text:'Se desconecta Generador Back Up.',mechanic:'Leonardo Becker',failureId:''},
      {id:'histw-20260901-pea-3',date:'2026-09-01',equipmentName:'Doser 7',maintenanceType:'Preventivo',text:'Se baja Doser 7 para que personal del centro pueda limpiar su silo.',mechanic:'Leonardo Becker',failureId:''}
    ]
  }
};
function install(){
  if(typeof data==='undefined'||!Array.isArray(data?.history))return false;
  let changed=false;
  data.history.forEach(snap=>{
    const key=`${snap?.meta?.start||''}|${snap?.meta?.end||''}`;
    const expected=PERIODS[key];if(!expected)return;
    Object.entries(expected).forEach(([center,works])=>{
      const c=snap?.centers?.[center];if(!c)return;
      c.workLog=Array.isArray(c.workLog)?c.workLog:[];
      const ids=new Set(c.workLog.map(w=>w?.id).filter(Boolean));
      works.forEach(w=>{if(!ids.has(w.id)){c.workLog.push(clone(w));ids.add(w.id);changed=true;}});
    });
  });
  if(changed){
    try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}
    try{if(typeof renderSummary==='function')renderSummary();}catch(_){}
  }
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(timer);},100);
})();
