// MultiX v28 — importa el informe oficial del 01-09-2026 al 06-09-2026 sin sobrescribir la semana actual
(function(){
'use strict';
const SOURCE_KEY='informe-multix-2026-09-01_2026-09-06-v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const equipment=(id,name,type,current,last,next,status,reg='',notes='',brand='',model='')=>({id,name,type,brand,model,reg,current,last,next,interval:'',status,notes});
const work=(id,date,equipmentName,maintenanceType,text,mechanic='',failureId='')=>({id,date,equipmentName,maintenanceType,text,mechanic,failureId,sourceKey:SOURCE_KEY});
const failure=(id,date,equipmentName,failureType,description,status)=>({id,date,equipmentName,failureType,description,status,sourceKey:SOURCE_KEY});
const req=(id,center,equipmentName,material,requestedTo,date,status,notes='')=>({id,center,equipment:equipmentName,material,requestedTo,date,status,notes,sourceKey:SOURCE_KEY});

function setCenter(snap,name,values){
  const c=snap.centers[name];if(!c)return;
  Object.assign(c,values);
  c.workLog=values.workLog||[];
  c.failureLog=values.failureLog||[];
  c.photos=[];
}

function buildSnapshot(){
  const snap=typeof newReport==='function'?newReport():{meta:{},centers:{},requests:[],history:[],stock:[],areaAssets:[]};
  snap.sourceKey=SOURCE_KEY;
  snap.meta={start:'2026-09-01',end:'2026-09-06',reportDate:'2026-09-06',zone:'Puyuhuapi / Base Cisnes',area:'Operaciones',mechanic:'Leonardo Becer'};
  snap.settings={...(clone(data?.settings||{})),activeCenters:['Ganso','Puyuhuapi 2','Pearson']};
  snap.stock=clone(data?.stock||[]);snap.areaAssets=clone(data?.areaAssets||[]);snap.baseVersion=data?.baseVersion||0;snap.history=[];

  setCenter(snap,'Ganso',{
    novelties:'Recepción Centro Ganso Salmex 20.\nRecepción Ensilaje PE-16.',
    works:'04-09-2026 — Puesta en marcha de equipos: Generadores, Plantas, Sistema de alimentación, Habitabilidad — Leonardo Becer\n05-09-2026 — Sistema de alimentación con falla en enlace de red Software AKVA Connect; revisión con técnico remoto AKVA previo contacto con personal de Sistemas de alimentación MultiX — Leonardo Becer',
    pending:'Conectar ensilaje a red eléctrica 380 V, solicitado a coordinador de operaciones. A espera de cable eléctrico.',
    companies:'Scale',
    observations:'Pontón proveniente de carena, llega en muy buen estado.\nNovedad: Generadores con sistema de sincronización y monitoreo remoto.',
    equipment:[
      equipment('hist-20260901-gan-g1','Generador 1','Generador','18468','18467','18717','OK','LGDF1074N12238E','Generadores con sistema de sincronización y monitoreo remoto.'),
      equipment('hist-20260901-gan-g2','Generador 2','Generador','20032','20031','20281','OK','LGDF1074N12238E','Generadores con sistema de sincronización y monitoreo remoto.'),
      equipment('hist-20260901-gan-gaux','Generador auxiliar','Generador','15712','15712','15962','OK','PR83526U064507D'),
      equipment('hist-20260901-gan-robalo','Róbalo','Bote / Motor fuera de borda','1173','872','1172','Vencido','MEL 584','Matrícula MEL 584 · Serie 1025384','Yamaha','FT50CET')
    ],
    plants:{
      treatment:{status:'Operativa',detail:''},
      osmosis:{status:'Operativa',detail:''}
    },
    feeding:{blower:'Operativo',selectors:'Operativo',dosers:'Sin información',screw:'Operativo',vfd:'Operativo',notes:'05-09-2026: falla en enlace de red Software AKVA Connect; sistema revisado con técnico remoto AKVA.'},
    workLog:[
      work('histw-20260901-gan-1','2026-09-04','General','Preventivo','Puesta en marcha de equipos: Generadores, Plantas, Sistema de alimentación y Habitabilidad.','Leonardo Becer'),
      work('histw-20260901-gan-2','2026-09-05','Sistema de Alimentación','Correctivo','Revisión de falla en enlace de red Software AKVA Connect con técnico remoto AKVA, previo contacto con personal de Sistemas de alimentación MultiX.','Leonardo Becer','histf-20260901-gan-akva')
    ],
    failureLog:[
      failure('histf-20260901-gan-akva','2026-09-05','Sistema de Alimentación','Control / Señal','Falla en enlace de red del Software AKVA Connect.','En proceso')
    ]
  });

  setCenter(snap,'Puyuhuapi 2',{
    novelties:'Centro se mantiene en condiciones productiva. Mecánicamente los equipos estables sin mayores novedades.',
    works:'03-09-2026 — Generador 1: Se realiza mantención y reparación a alternador — Leonardo Becker\n03-09-2026 — Selectora 4: arroja falla de entre posición, se deja alineado y operativo — Leonardo Becker\n03-09-2026 — Ósmosis: se realiza mantención — Leonardo Becker\n05-09-2026 — Reparación de tapa de registro estanque diario combustible — Servicios Ambientales (Sergio Luna)',
    pending:'Instalación de filtro zeolita.\nMantención Generadores.',companies:'Servicios Ambientales (Sergio Luna)',observations:'',
    equipment:[
      equipment('hist-20260901-p2-g1','Generador 1','Generador','3568','','','OK','J14T032844','Cummins · Modelo 160 · Serie J14T032844 · Pontón Mef 29. Alternador con conector roto; descargó la batería. Parámetro de batería: 6.9 V.','Cummins','160'),
      equipment('hist-20260901-p2-g2','Generador 2','Generador','31075','','','OK','CD6068C085506','Jonh Deere · Modelo - · Serie CD6068C085506','Jonh Deere','-'),
      equipment('hist-20260901-p2-gaux','Generador AUX','Generador','3288','','','OK','C22I430355','Cummins · Modelo - · Serie C22I430355','Cummins','-'),
      equipment('hist-20260901-p2-camargo','Camargo','Bote / Motor fuera de borda','80','','','OK','CIS 1746','Matrícula CIS 1746 · operativo','','FT50CET')
    ],
    plants:{
      treatment:{status:'Operativa',detail:'Sin novedades.'},
      osmosis:{status:'Operativa',detail:'Bypass filtro Zeolita, solicitado.'}
    },
    feeding:{blower:'Operativo',selectors:'En observación',dosers:'Sin información',screw:'Operativo',vfd:'Operativo',notes:'Se mantiene en observación selectora número 4.'},
    workLog:[
      work('histw-20260901-p2-1','2026-09-03','Generador 1','Correctivo','Mantención y reparación a alternador.','Leonardo Becker','histf-20260901-p2-alternador'),
      work('histw-20260901-p2-2','2026-09-03','Selectora 4','Correctivo','Se corrige falla de entre posición; se deja alineada y operativa.','Leonardo Becker','histf-20260901-p2-selectora4'),
      work('histw-20260901-p2-3','2026-09-03','Planta de Ósmosis','Preventivo','Se realiza mantención.','Leonardo Becker'),
      work('histw-20260901-p2-4','2026-09-05','Estanque diario de combustible','Correctivo','Reparación de tapa de registro de estanque diario de combustible.','Servicios Ambientales (Sergio Luna)')
    ],
    failureLog:[
      failure('histf-20260901-p2-alternador','2026-09-03','Generador 1','Eléctrica','Alternador con conector roto; descargó la batería. Parámetro de batería: 6.9 V.','Resuelta'),
      failure('histf-20260901-p2-selectora4','2026-09-03','Selectora 4','Control / Señal','Falla de entre posición; se deja alineada y operativa.','Resuelta'),
      failure('histf-20260901-p2-zeolita','2026-09-06','Planta de Ósmosis','Operacional','Filtro de zeolita operando en bypass; instalación de filtro pendiente.','Abierta')
    ]
  });

  setCenter(snap,'Pearson',{
    novelties:'Centro Pearson mantiene continuidad productiva sin intervenciones por temas mecánicos.',
    works:'01-09-2026 — Se intercambió doser 4 inoperativo por el Doser 6 — Leonardo Becker\n06-09-2026 — Se desconecta Generador Back Up — Leonardo Becker\n01-09-2026 — Se baja doser 7 para que personal del centro pueda limpiar su silo — Leonardo Becker',
    pending:'Desmontaje y montaje de motoreductor de doser 6.',companies:'',observations:'Generador Back Up desconectado.',
    equipment:[
      equipment('hist-20260901-pea-g1','Generador 1','Generador','331','250','500','OK','FGWPG182CSTY00391','Perkins · Modelo 165 · Pontón Mef 24','Perkins','165'),
      equipment('hist-20260901-pea-g2','Generador 2','Generador','13721','13200','13450','Vencido','FGWPEP48LRPC02945','Perkins · Modelo 165','Perkins','165'),
      equipment('hist-20260901-pea-gaux','Generador Aux','Generador','388','250','500','OK','FGWPEP65AJT500373','Perkins · Modelo 110','Perkins','110'),
      equipment('hist-20260901-pea-mc6735','Motocompresor 6735','Motocompresor','1875','','','OK','6735','MAQSUR · Actualizado 2026-07-13'),
      equipment('hist-20260901-pea-mc6973','Motocompresor 6973','Motocompresor','458','','','OK','6973','MAQSUR · Actualizado 2026-07-13'),
      equipment('hist-20260901-pea-playa','Playa Bonita','Bote / Motor fuera de borda','770','','','OK','PMO-6601','Motor Yamaha 64J · Serie L 1026008','Yamaha','FT50CET')
    ],
    plants:{
      treatment:{status:'Operativa',detail:'Se solicitó inversor de polaridad.'},
      osmosis:{status:'Operativa',detail:''}
    },
    feeding:{blower:'Operativo',selectors:'Operativo',dosers:'Inoperativo',screw:'Sin información',vfd:'Operativo',notes:'Programado cambio de motoreductor Doser 6, silo sin alimento.'},
    workLog:[
      work('histw-20260901-pea-1','2026-09-01','Doser 4','Correctivo','Se intercambió Doser 4 inoperativo por el Doser 6.','Leonardo Becker','histf-20260901-pea-doser4'),
      work('histw-20260901-pea-2','2026-09-06','Generador Back Up','Preventivo','Se desconecta Generador Back Up.','Leonardo Becker'),
      work('histw-20260901-pea-3','2026-09-01','Doser 7','Preventivo','Se baja Doser 7 para que personal del centro pueda limpiar su silo.','Leonardo Becker')
    ],
    failureLog:[
      failure('histf-20260901-pea-doser4','2026-09-01','Doser 4','Mecánica','Doser 4 inoperativo; se intercambia por Doser 6.','En proceso'),
      failure('histf-20260901-pea-doser6','2026-09-06','Doser 6','Mecánica','Motoreductor de Doser 6 requiere desmontaje y montaje; sistema Doser se reporta inoperativo.','Abierta')
    ]
  });

  const requests=[
    req('histreq-20260901-gan-robalo','Ganso','Bote Róbalo','Solicitud de pata fb','Ángelo Delgado','','Recibido','Solicitud consignada en el informe; Róbalo se encuentra asignado a Ganso.'),
    req('histreq-20260901-area-generadores','Área / Base Cisnes','Generadores','Filtros y aceite','Hardy Paredes','','Solicitado','El informe no indica centro específico para esta solicitud.')
  ];
  snap.requests=clone(requests);
  return snap;
}

function requestKey(r){return [r.center,r.equipment,r.material,r.requestedTo,r.date].map(norm).join('|');}
function install(){
  if(typeof data==='undefined'||!data?.centers)return false;
  data.history=Array.isArray(data.history)?data.history:[];
  let existing=data.history.find(h=>h?.sourceKey===SOURCE_KEY);
  if(!existing){
    const samePeriod=data.history.find(h=>h?.meta?.start==='2026-09-01'&&h?.meta?.end==='2026-09-06');
    if(!samePeriod){data.history.push(buildSnapshot());}
    else samePeriod.sourceKey=SOURCE_KEY;
    data.history.sort((a,b)=>String(b?.meta?.start||'').localeCompare(String(a?.meta?.start||'')));
  }
  const imported=buildSnapshot().requests;
  data.requests=Array.isArray(data.requests)?data.requests:[];
  const keys=new Set(data.requests.map(requestKey));
  imported.forEach(r=>{const k=requestKey(r);if(!keys.has(k)){data.requests.push(clone(r));keys.add(k);}});
  data.meta=data.meta||{};data.meta.importedReport20260901=true;
  try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(e){console.warn('No se pudo guardar el informe histórico 01-09 al 06-09',e);}
  if(typeof renderAll==='function')setTimeout(()=>renderAll(),60);
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},100);
})();
