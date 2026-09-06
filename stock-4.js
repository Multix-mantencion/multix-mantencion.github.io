window.MULTIX_BASE.stock.push(...[{"id":"stk-106","material":"llave stilson de 1200 mm","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-107","material":"palas","area":"Herramientas","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-108","material":"chuzo","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-109","material":"cautin tipo pistola","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-110","material":"flexible magnético","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-111","material":"Pie de metro","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-112","material":"Llave stilson 14\"","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-113","material":"Juego de llaves punta corona","area":"Herramientas","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-114","material":"Pistola calafatera","area":"Herramientas","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-115","material":"Martilo de goma","area":"Herramientas","initial":6,"destination":"","in":0,"out":0,"total":6},{"id":"stk-116","material":"Rodilleras para faenas","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-117","material":"Martillo carpintero","area":"Herramientas","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-118","material":"Llave flexible extractor de filtros (tipo cadena)","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-119","material":"Marco de sierra","area":"Herramientas","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-120","material":"discos de desbaste","area":"Herramientas","initial":4,"destination":"","in":0,"out":0,"total":4},{"id":"stk-121","material":"apolleta aluro metálico 400 w","area":"Luces","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-122","material":"apolleta busca bolla 1000w","area":"Luces","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-123","material":"ampólletas 100w luz fría","area":"Luces","initial":15,"destination":"","in":0,"out":0,"total":15},{"id":"stk-124","material":"ampolletas alógeno R7S 118 m","area":"Luces","initial":5,"destination":"","in":0,"out":0,"total":5},{"id":"stk-125","material":"alarma de incendio","area":"Luces","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-126","material":"Foco alogeno","area":"luces","initial":4,"destination":"","in":0,"out":0,"total":4},{"id":"stk-127","material":"Base T8 2*G13 para 2 tubos led 2x600 mm","area":"Luces","initial":4,"destination":"","in":0,"out":0,"total":4},{"id":"stk-128","material":"Luces emergenca 24v","area":"Luces","initial":4,"destination":"","in":0,"out":0,"total":4},{"id":"stk-129","material":"Abrazadera 32 - 35","area":"Modulo","initial":20,"destination":"","in":0,"out":0,"total":20},{"id":"stk-130","material":"Abrazadera 29 - 31","area":"Modulo","initial":13,"destination":"","in":0,"out":0,"total":13},{"id":"stk-131","material":"Abrazadera 80 - 85","area":"Modulo","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-132","material":"Abrazadera 122 - 130","area":"Modulo","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-133","material":"Abrazadera 52 - 57","area":"Modulo","initial":5,"destination":"","in":0,"out":0,"total":5},{"id":"stk-134","material":"filtro P552020","area":"Generador","initial":6,"destination":"DELTA","in":0,"out":2,"total":4},{"id":"stk-135","material":"ACEITE 15W40, 19 LITROS","area":"Generador","initial":9,"destination":"PEARSON","in":0,"out":1,"total":8},{"id":"stk-136","material":"aceite 10w30, 19 LITROS","area":"BOTES","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-137","material":"RELE MOTOR YAMAHA","area":"BOTES","initial":2,"destination":"","in":0,"out":0,"total":2},{"id":"stk-138","material":"HELICE YAMAHA","area":"BOTES","initial":1,"destination":"","in":0,"out":0,"total":1},{"id":"stk-139","material":"BUJIAS YAMAHA","area":"BOTES","initial":6,"destination":"","in":0,"out":0,"total":6},{"id":"stk-140","material":"MOTOR DE ARRANQUE","area":"BOTES","initial":1,"destination":"","in":0,"out":0,"total":1}]);

// Reglas de mantención por horómetro. Se instala al finalizar la carga del documento,
// después de app-core.js y de los ajustes visuales definidos en index.html.
document.addEventListener('DOMContentLoaded',()=>{
  const help=document.querySelector('.equipment-help');
  if(help) help.innerHTML='<b>Ingresa solo 2 datos:</b> HORÓMETRO ACTUAL y HORÓMETRO DE ÚLTIMA MANTENCIÓN. La próxima mantención se calcula sola: <b>Generadores cada 250 h</b> y <b>motores fuera de borda cada 300 h</b>.';

  const parseHours=v=>{
    const t=String(v??'').trim().replace(/\s/g,'').replace(/\./g,'').replace(',','.');
    if(!t||t==='-') return null;
    const n=Number(t);return Number.isFinite(n)?n:null;
  };
  const intervalFor=e=>{
    const t=((e?.type||'')+' '+(e?.name||'')).toLowerCase();
    if(t.includes('generador')||t.includes('generator')) return 250;
    if(t.includes('bote fb')||t.includes('motor fuera')||t.includes('fuera borda')) return 300;
    return null;
  };
  const fmt=n=>Number.isFinite(n)?String(Math.round(n*100)/100):'';
  const calcNext=e=>{
    const interval=intervalFor(e),last=parseHours(e?.last);
    if(interval!==null&&last!==null){e.next=fmt(last+interval);}
    return e?.next||'';
  };
  const calcStatus=e=>{
    if(['Inoperativo','En observación'].includes(e?.status)) return e.status;
    const current=parseHours(e?.current),next=parseHours(calcNext(e));
    if(current===null||next===null) return e?.status||'OK';
    if(current>=next) return 'Vencido';
    if(next-current<=50) return 'Próximo';
    return 'OK';
  };
  const intervalLabel=e=>{const n=intervalFor(e);return n===null?'Según programa':`${n} h`;};

  window.renderEqEditor=function(){
    const c=data.centers[currentCenter];
    equipmentEditor.innerHTML=c.equipment.map((e,i)=>{
      const next=calcNext(e),st=calcStatus(e);e.status=st;
      return `<div class="eq-card" data-eq-card="${i}">
        <div class="eq-card-head"><div><div class="eq-name">${esc(e.name||e.type||'Equipo')}</div><div class="eq-type">${esc(e.type||'Equipo')}</div></div><span class="eq-status ${esc(st)}" data-eq-status="${i}">${esc(st)}</span></div>
        <div class="eq-hours-grid">
          <label class="eq-field eq-current"><span>HORÓMETRO ACTUAL</span><input data-i="${i}" data-k="current" inputmode="decimal" value="${attr(e.current||'')}" placeholder="Ej: 13622"><small>Horas actuales del equipo</small></label>
          <label class="eq-field eq-current"><span>HORÓMETRO ÚLTIMA MANTENCIÓN</span><input data-i="${i}" data-k="last" inputmode="decimal" value="${attr(e.last||'')}" placeholder="Ej: 13450"><small>Horas cuando se realizó la última mantención</small></label>
          <div class="eq-info"><span>PRÓXIMA MANTENCIÓN</span><strong data-eq-next="${i}">${esc(next||'Sin dato')}</strong></div>
          <div class="eq-info"><span>INTERVALO</span><strong>${esc(intervalLabel(e))}</strong></div>
        </div>
        <div class="eq-notes"><span>N° SERIE / REGISTRO</span>${esc(e.reg||'Sin dato')}</div>
        ${e.notes?`<div class="eq-notes"><span>DETALLE DEL EQUIPO</span>${esc(e.notes)}</div>`:''}
      </div>`;
    }).join('')||'<div class="empty">Sin equipos registrados en este centro.</div>';
  };

  window.collectEq=function(){
    document.querySelectorAll('#equipmentEditor input[data-i]').forEach(el=>{
      const i=+el.dataset.i,e=data.centers[currentCenter].equipment[i];
      if(!e)return;
      if(el.dataset.k==='current'||el.dataset.k==='last') e[el.dataset.k]=el.value.trim();
    });
    data.centers[currentCenter].equipment.forEach(e=>{calcNext(e);e.status=calcStatus(e);});
  };

  equipmentEditor?.addEventListener('input',ev=>{
    const el=ev.target;if(!(el instanceof HTMLInputElement)||!el.dataset.i)return;
    const i=+el.dataset.i,e=data.centers[currentCenter]?.equipment?.[i];if(!e)return;
    if(el.dataset.k==='current'||el.dataset.k==='last')e[el.dataset.k]=el.value.trim();
    const next=calcNext(e),st=calcStatus(e);e.status=st;
    const nextEl=equipmentEditor.querySelector(`[data-eq-next="${i}"]`);if(nextEl)nextEl.textContent=next||'Sin dato';
    const statusEl=equipmentEditor.querySelector(`[data-eq-status="${i}"]`);if(statusEl){statusEl.textContent=st;statusEl.className='eq-status '+st;}
  });
});

// Carga del módulo v6 una vez que la aplicación base ya terminó de cargar.
window.addEventListener('load',()=>{
  if(document.querySelector('script[data-mx-v6]')) return;
  const s=document.createElement('script');
  s.src='overrides-v6.js?v=6';
  s.dataset.mxV6='1';
  document.body.appendChild(s);
});