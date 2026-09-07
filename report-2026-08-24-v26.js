// MultiX v26 — importa el informe oficial del 24-08-2026 al 30-08-2026 sin sobrescribir la semana actual
(function(){
'use strict';
const SOURCE_KEY='informe-multix-2026-08-24_2026-08-30-v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const equipment=(id,name,type,current,last,next,status,reg='',notes='')=>({id,name,type,brand:'',model:'',reg,current,last,next,interval:'',status,notes});
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
  snap.meta={start:'2026-08-24',end:'2026-08-30',reportDate:'2026-08-30',zone:'Puyuhuapi / Base Cisnes',area:'Operaciones',mechanic:'Sergio Neder'};
  snap.settings={...(clone(data?.settings||{})),activeCenters:['Arbolito','Delta','Pearson','Puyuhuapi 2','Puyuhuapi 1','Yelen']};
  snap.stock=clone(data?.stock||[]);snap.areaAssets=clone(data?.areaAssets||[]);snap.baseVersion=data?.baseVersion||0;snap.history=[];

  setCenter(snap,'Arbolito',{
    novelties:'Generadores con problemas de consumo, sobre consumo al alimentar y utilizar ensilaje.',
    works:'Se realizan mediciones de consumo generador 1 — Sergio Neder',
    pending:'Mantención bote',companies:'',observations:'',
    equipment:[
      equipment('hist-20260824-arb-g1','Generador 1','Generador','18072','18060','18310','OK','','Se realizan mediciones de consumo generador 1 — Sergio Neder'),
      equipment('hist-20260824-arb-g2','Generador 2','Generador','33278','33275','33525','OK'),
      equipment('hist-20260824-arb-mc6633','Motocompresor 6633','Motocompresor','2070','2039','2289','OK','6633'),
      equipment('hist-20260824-arb-mc6735','Motocompresor 6735','Motocompresor','18863','18762','19012','OK','6735'),
      equipment('hist-20260824-arb-basechonos','Base Chonos','Otro','2645','2300','2550','Vencido','','Bote')
    ],
    plants:{osmosis:{status:'Sin información',detail:''},treatment:{status:'Sin información',detail:''}},
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:''},
    workLog:[work('histw-20260824-arb-1','2026-08-24','Generador 1','Predictivo','Se realizan mediciones de consumo generador 1','Sergio Neder','histf-20260824-arb-overconsumo')],
    failureLog:[failure('histf-20260824-arb-overconsumo','2026-08-24','Generadores','Operacional','Problemas de consumo y sobreconsumo al alimentar y utilizar ensilaje.','En proceso')]
  });

  setCenter(snap,'Delta',{
    novelties:'Generador auxiliar sin filtros.',works:'',pending:'',
    companies:'Biocordillera: extracción de lodos y limpieza de los componentes de la planta de tratamientos.\nScale (alimentación): cambio de motor de selectora 3 y calibración.',observations:'',
    equipment:[
      equipment('hist-20260824-del-g1','Generador 1','Generador','9895','9802','10052','OK'),
      equipment('hist-20260824-del-g2','Generador 2','Generador','10318','10081','10331','Próximo'),
      equipment('hist-20260824-del-gaux','Generador Aux','Generador','6247','5997','6247','Vencido','','Generador auxiliar sin filtros'),
      equipment('hist-20260824-del-mc6249','Motocompresor 6249','Motocompresor','2760','2736','2986','OK','6249'),
      equipment('hist-20260824-del-sanluis','San Luis','Otro','731','450','700','Vencido','','Bote')
    ],
    plants:{
      treatment:{status:'Operativa',detail:'Limpieza de todos los componentes de la planta, encontrando gran cantidad de residuos. Extracción de lodos y regulación de flujos. Planta operativa, queda en observación.'},
      osmosis:{status:'Operativa',detail:'Falla en filtro de zeolita. Solicitado: Filtro de zeolita. Solicitado: Manguera alta presión.'}
    },
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:'Selectora 3: Cambio de motor y calibración.'},
    workLog:[
      work('histw-20260824-del-1','2026-08-24','Planta de Tratamiento','Preventivo','Limpieza de componentes, extracción de lodos y regulación de flujos.','Biocordillera'),
      work('histw-20260824-del-2','2026-08-24','Sistema de Alimentación','Correctivo','Cambio de motor y calibración de selectora 3.','Scale')
    ],
    failureLog:[failure('histf-20260824-del-zeolita','2026-08-24','Planta de Ósmosis','Operacional','Falla en filtro de zeolita.','Abierta')]
  });

  setCenter(snap,'Pearson',{
    novelties:'',works:'Cambio de mezclador de bote — Sergio Neder',pending:'Mantención bote',companies:'',observations:'',
    equipment:[
      equipment('hist-20260824-pea-g1','Generador 1','Generador','231','0','250','Próximo'),
      equipment('hist-20260824-pea-g2','Generador 2','Generador','13622','13487','13737','OK','','Solicitado: Batería'),
      equipment('hist-20260824-pea-gaux','Generador aux','Generador','289','0','250','Vencido'),
      equipment('hist-20260824-pea-mc6722','Motocompresor 6722','Motocompresor','258','250','500','OK','6722'),
      equipment('hist-20260824-pea-mc6973','Motocompresor 6973','Motocompresor','530','457','707','OK','6973'),
      equipment('hist-20260824-pea-robalo','Róbalo','Otro','1197','872','1122','Vencido','','Bote · Cambio de mezclador de bote — Sergio Neder')
    ],
    plants:{
      treatment:{status:'Operativa',detail:'Extracción de lodos, limpieza de componentes y regulación de flujos. Solicitado: Inversor de polaridad + cables de poder.'},
      osmosis:{status:'Operativa',detail:''}
    },
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'En observación',screw:'Sin información',vfd:'Sin información',notes:'Doser 4: muestra detenciones en la operación; se hacen pruebas con asistencia remota de Akva. Hasta el momento queda operativo y en revisión.'},
    workLog:[
      work('histw-20260824-pea-1','2026-08-24','Róbalo','Correctivo','Cambio de mezclador de bote.','Sergio Neder'),
      work('histw-20260824-pea-2','2026-08-24','Planta de Tratamiento','Preventivo','Extracción de lodos, limpieza de componentes y regulación de flujos.'),
      work('histw-20260824-pea-3','2026-08-24','Sistema de Alimentación','Correctivo','Pruebas por detenciones de Doser 4 con asistencia remota de Akva.','', 'histf-20260824-pea-doser4')
    ],
    failureLog:[failure('histf-20260824-pea-doser4','2026-08-24','Doser 4','Operacional','Detenciones durante la operación; queda operativo y en revisión tras pruebas con asistencia remota de Akva.','En proceso')]
  });

  setCenter(snap,'Puyuhuapi 2',{
    novelties:'Gotera en pieza 9 por cañería de agua caliente que se dirige al baño.\nGorgoreo de WC en baños de hombre y damas, posible obstrucción en cañería.',
    works:'Realización de mantención generador auxiliar — Jaime Avilez (Servicios Ambientales)',pending:'',companies:'',observations:'',
    equipment:[
      equipment('hist-20260824-p2-g1','Generador 1','Generador','3442','3422','3672','OK'),
      equipment('hist-20260824-p2-g2','Generador 2','Generador','30993','30829','31079','OK'),
      equipment('hist-20260824-p2-gaux','Generador Aux','Generador','3288','3288','3538','OK'),
      equipment('hist-20260824-p2-mc6378','Motocompresor 6378','Motocompresor','28148','28148','28398','OK','6378'),
      equipment('hist-20260824-p2-mc6696','Motocompresor 6696','Motocompresor','12836','12836','13086','OK','6696'),
      equipment('hist-20260824-p2-camargo','Camargo','Otro','61','0','250','OK','','Bote')
    ],
    plants:{
      treatment:{status:'Operativa',detail:''},
      osmosis:{status:'Operativa',detail:'Presostato de baja presión defectuoso, no detiene la planta al salir de parámetros. Filtro de zeolita tapado; al funcionar la planta baja la presión de golpe. Pruebas con Keepex por baja producción; según pruebas puede ser por membranas saturadas. Planta queda operando a baja producción. Solicitado: Filtro Zeolita, Presostato de baja y Membranas.'}
    },
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:''},
    workLog:[
      work('histw-20260824-p2-1','2026-08-24','Generador Aux','Preventivo','Realización de mantención generador auxiliar.','Jaime Avilez (Servicios Ambientales)'),
      work('histw-20260824-p2-2','2026-08-24','Planta de Ósmosis','Predictivo','Pruebas con Keepex por baja producción de la planta.','Keepex','histf-20260824-p2-bajaproduccion')
    ],
    failureLog:[
      failure('histf-20260824-p2-gotera','2026-08-24','Habitabilidad','Hidráulica','Gotera en pieza 9 por cañería de agua caliente que se dirige al baño.','Abierta'),
      failure('histf-20260824-p2-wc','2026-08-24','Habitabilidad','Hidráulica','Gorgoreo de WC en baños de hombre y damas; posible obstrucción en cañería.','Abierta'),
      failure('histf-20260824-p2-presostato','2026-08-24','Planta de Ósmosis','Control / Señal','Presostato de baja presión defectuoso; no detiene la planta al salir de parámetros.','Abierta'),
      failure('histf-20260824-p2-zeolita','2026-08-24','Planta de Ósmosis','Operacional','Filtro de zeolita tapado; al funcionar la planta baja la presión de golpe.','Abierta'),
      failure('histf-20260824-p2-bajaproduccion','2026-08-24','Planta de Ósmosis','Operacional','Baja producción; según pruebas puede ser por membranas saturadas. Planta queda operando a baja producción.','En proceso')
    ]
  });

  setCenter(snap,'Puyuhuapi 1',{
    novelties:'Bote se trasladó a centro Pearson.',works:'Recepción de bote Playa Bonita — Sergio Neder',pending:'',companies:'',observations:'',
    equipment:[equipment('hist-20260824-p1-playa','Playa Bonita','Otro','758','758','1008','OK','','Bote · Se trasladó a centro Pearson · Recepción de bote Playa Bonita — Sergio Neder')],
    plants:{osmosis:{status:'Sin información',detail:''},treatment:{status:'Sin información',detail:''}},
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:''},workLog:[],failureLog:[]
  });

  setCenter(snap,'Yelen',{
    novelties:'Centro con ciclo terminado.\nPontón despachado.',works:'Revisión y entrega de pontón — Jaime Avilez (Servicios Ambientales)',pending:'',companies:'',observations:'',
    equipment:[
      equipment('hist-20260824-yel-gp','Generador Principal','Generador','17175','17011','17261','OK'),
      equipment('hist-20260824-yel-ga','Generador Aux','Generador','17681','17600','17850','OK'),
      equipment('hist-20260824-yel-isla','Isla Cabras II','Otro','0','0','250','OK','','Bote')
    ],
    plants:{osmosis:{status:'Sin información',detail:''},treatment:{status:'Sin información',detail:''}},
    feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:''},
    workLog:[work('histw-20260824-yel-1','2026-08-24','Pontón','Preventivo','Revisión y entrega de pontón.','Jaime Avilez (Servicios Ambientales)')],failureLog:[]
  });

  const requests=[
    req('histreq-20260824-arb-1','Arbolito','Generadores','Filtros / Aceites','Hardy Paredes','2026-05-24','Solicitado'),
    req('histreq-20260824-del-1','Delta','Generadores','Filtros / Aceite','Hardy Paredes','2026-03-12','Recibido'),
    req('histreq-20260824-del-2','Delta','Planta de Ósmosis','Manguera alta presión','Juan / Keepex','2026-07-30','Solicitado'),
    req('histreq-20260824-del-3','Delta','Planta de Ósmosis','Filtro de zeolita','Juan / Keepex','2026-07-31','Solicitado'),
    req('histreq-20260824-pea-1','Pearson','Generadores','Filtro / Aceite','Hardy / Emilio','2026-08-08','Solicitado'),
    req('histreq-20260824-pea-2','Pearson','Pontón','2 detectores de humo','Juan Quintanilla','2026-08-10','Recibido'),
    req('histreq-20260824-pea-3','Pearson','Planta de Tratamiento','Inversor de polaridad + cables de poder','Alvaro / Keepex','2026-08-13','Solicitado'),
    req('histreq-20260824-pea-4','Pearson','Generador 2','Batería','Juan Quintanilla','2026-08-21','Solicitado'),
    req('histreq-20260824-pea-5','Pearson','Róbalo','Mezclador','Juan Quintanilla','2026-08-25','Recibido'),
    req('histreq-20260824-p2-1','Puyuhuapi 2','Generadores','Filtros / Aceite','Hardy / Juan','2026-08-01','Solicitado'),
    req('histreq-20260824-p2-2','Puyuhuapi 2','Planta de Ósmosis','Filtro Zeolita','Alvaro / Keepex','2026-08-22','Solicitado'),
    req('histreq-20260824-p2-3','Puyuhuapi 2','Planta de Ósmosis','Presostato de baja','Alvaro / Keepex','2026-08-22','Solicitado'),
    req('histreq-20260824-p2-4','Puyuhuapi 2','Planta de Ósmosis','Membranas','Alvaro / Keepex','2026-08-22','Solicitado'),
    req('histreq-20260824-area-1','Área / Base Cisnes','Herramientas','Solicitud de herramientas','Oscar Arias','','En curso','Centro/Pontón indicado en el informe: Mantención Delta.')
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
    const samePeriod=data.history.find(h=>h?.meta?.start==='2026-08-24'&&h?.meta?.end==='2026-08-30');
    if(!samePeriod){data.history.push(buildSnapshot());}
    else samePeriod.sourceKey=SOURCE_KEY;
    data.history.sort((a,b)=>String(b?.meta?.start||'').localeCompare(String(a?.meta?.start||'')));
  }
  const imported=buildSnapshot().requests;
  data.requests=Array.isArray(data.requests)?data.requests:[];
  const keys=new Set(data.requests.map(requestKey));
  imported.forEach(r=>{const k=requestKey(r);if(!keys.has(k)){data.requests.push(clone(r));keys.add(k);}});
  data.meta=data.meta||{};data.meta.importedReport20260824=true;
  try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(e){console.warn('No se pudo guardar el informe histórico',e);}
  if(typeof renderAll==='function')setTimeout(()=>renderAll(),60);
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>100)clearInterval(timer);},100);
})();
