// MultiX v16 — reemplaza el resumen Alimentación por Maquinaria Operaciones
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const attr=esc;
  const parse=v=>{const s=String(v??'').trim();if(!s||s==='-')return null;const n=Number(s.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null;};
  const fmt=v=>{const n=parse(v);return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';};
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}};

  function ensure(){
    if(typeof data==='undefined')return;
    if(!Array.isArray(data.operationsAssets))data.operationsAssets=[];
  }

  function intervalFor(e){
    const t=((e?.category||'')+' '+(e?.name||'')+' '+(e?.type||'')).toLowerCase();
    if(t.includes('generador'))return 250;
    if(t.includes('lancha')||t.includes('bote')||t.includes('fuera borda'))return 300;
    const custom=parse(e?.interval);return custom!==null?custom:null;
  }

  function recalc(e){
    const interval=intervalFor(e),last=parse(e.last),cur=parse(e.current);
    e.interval=interval===null?(e.interval||''):String(interval);
    e.next=interval!==null&&last!==null?String(last+interval):'';
    const next=parse(e.next);
    if(cur!==null&&next!==null)e.status=cur>=next?'Vencido':(next-cur<=50?'Próximo':'OK');
    else e.status=e.status||'OK';
    return interval;
  }

  function makeAsset(category){
    const isGen=category==='Generador Back Up',isBoat=category==='Lanchas rápidas';
    return {
      id:'ops-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
      category,
      name:isGen?'Generador Back Up':isBoat?'Lancha rápida':'Equipo',
      type:isGen?'Generador':isBoat?'Lancha rápida':'Otro',
      code:'',brand:'',model:'',current:'',last:'',next:'',interval:isGen?'250':isBoat?'300':'',status:'OK',notes:''
    };
  }

  function installStyles(){
    if($('mxOpsV16Styles'))return;
    const s=document.createElement('style');s.id='mxOpsV16Styles';s.textContent=`
      .ops-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px}.ops-head h2{margin:0}.ops-actions{display:flex;gap:8px;flex-wrap:wrap}.ops-actions .btn{white-space:nowrap}
      .ops-group{margin:18px 0}.ops-group-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.ops-group-title h3{margin:0;font-size:15px;color:var(--teal);text-transform:uppercase;letter-spacing:.5px}
      .ops-card{background:#0a1924;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}.ops-card-top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.ops-card-name{font-size:16px;font-weight:800}.ops-status{font-size:11px;font-weight:800;padding:5px 9px;border-radius:999px;background:#17352f;color:#a9e5d5}.ops-status.Vencido{background:#4a2025;color:#ffb9bc}.ops-status.Próximo{background:#4a3514;color:#ffd995}
      .ops-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.ops-grid label{display:flex;flex-direction:column;gap:5px}.ops-grid label span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;font-weight:700}.ops-grid input,.ops-grid select,.ops-grid textarea{width:100%;background:#0d2230;border:1px solid var(--line);color:var(--text);padding:10px;border-radius:8px;font-size:13px}.ops-grid .ops-hour input{border-color:var(--teal);font-size:16px;font-weight:800}.ops-grid .wide{grid-column:span 2}.ops-auto{background:#0d1d29;border:1px solid var(--line);border-radius:8px;padding:9px}.ops-auto span{display:block;font-size:10px;color:var(--muted);text-transform:uppercase}.ops-auto strong{display:block;margin-top:5px;font-size:14px}.ops-helper{font-size:10px;color:var(--teal);margin-top:3px}.ops-empty{padding:16px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);text-align:center}
      @media(max-width:760px){.ops-grid{grid-template-columns:1fr 1fr}.ops-grid .wide{grid-column:1/-1}.ops-actions{width:100%}.ops-actions .btn{flex:1}.ops-card-top{align-items:flex-start}.ops-card-top .btn{padding:8px}}
    `;document.head.appendChild(s);
  }

  function renameTabAndSection(){
    const tabs=[...document.querySelectorAll('.tab')];
    const tab=tabs.find(x=>/Alimentaci[oó]n/i.test((x.textContent||'').trim()))||document.querySelector('.tab[data-tab="feeding"]');
    if(tab){tab.textContent='Maquinaria Operaciones';tab.title='Maquinaria y equipos propios de Operaciones';}
    const section=$('feeding');
    if(section&&!$('mxOperationsMachinery')){
      section.innerHTML=`<div id="mxOperationsMachinery"></div>`;
    }
  }

  function field(i,key,label,value,cls='',placeholder=''){
    return `<label class="${cls}"><span>${label}</span><input data-ops-i="${i}" data-ops-k="${key}" value="${attr(value||'')}" placeholder="${attr(placeholder)}"></label>`;
  }

  function card(e,i){
    const interval=recalc(e);
    return `<div class="ops-card">
      <div class="ops-card-top"><div><div class="ops-card-name">${esc(e.name||'Equipo')}</div><div class="helper">${esc(e.category||'Maquinaria Operaciones')}</div></div><div style="display:flex;gap:8px;align-items:center"><span class="ops-status ${esc(e.status||'OK')}">${esc(e.status||'OK')}</span><button class="btn small danger" onclick="mxDeleteOpsAsset(${i})">Eliminar</button></div></div>
      <div class="ops-grid">
        ${field(i,'name','Nombre del equipo',e.name,'','Ej: Lancha rápida 1')}
        ${field(i,'code','Código / registro',e.code,'','Código interno o matrícula')}
        ${field(i,'brand','Marca',e.brand,'','Ej: Yamaha')}
        ${field(i,'model','Modelo',e.model,'','Ej: F200')}
        ${field(i,'current','Horómetro actual',e.current,'ops-hour','Ej: 1250')}
        ${field(i,'last','Horómetro última mantención',e.last,'ops-hour','Ej: 1100')}
        <div class="ops-auto"><span>Próxima mantención</span><strong id="mxOpsNext-${i}">${e.next?esc(fmt(e.next)):'Sin dato'}</strong><div class="ops-helper">${interval!==null?'Automática cada '+interval+' h':'Define un intervalo'}</div></div>
        ${field(i,'interval','Intervalo mantención (h)',e.interval,'','Ej: 250')}
        ${field(i,'notes','Observaciones',e.notes,'wide','Observaciones del equipo')}
      </div>
    </div>`;
  }

  function group(title,items,category){
    return `<div class="ops-group"><div class="ops-group-title"><h3>${esc(title)}</h3><button class="btn small" onclick="mxAddOpsAsset('${attr(category)}')">+ Agregar</button></div>${items.length?items.map(({e,i})=>card(e,i)).join(''):`<div class="ops-empty">Sin equipos registrados en esta categoría.</div>`}</div>`;
  }

  function render(){
    ensure();renameTabAndSection();const host=$('mxOperationsMachinery');if(!host)return;
    const mapped=data.operationsAssets.map((e,i)=>({e,i}));
    const boats=mapped.filter(x=>x.e.category==='Lanchas rápidas');
    const gens=mapped.filter(x=>x.e.category==='Generador Back Up');
    const other=mapped.filter(x=>!['Lanchas rápidas','Generador Back Up'].includes(x.e.category));
    host.innerHTML=`<div class="panel"><div class="ops-head"><div><h2>Maquinaria Operaciones</h2><div class="helper">Equipos que pertenecen a Operaciones y no a un centro específico.</div></div><div class="ops-actions"><button class="btn" onclick="mxAddOpsAsset('Lanchas rápidas')">+ Lancha rápida</button><button class="btn" onclick="mxAddOpsAsset('Generador Back Up')">+ Generador Back Up</button><button class="btn primary" onclick="mxAddOpsAsset('Otros equipos')">+ Otro equipo</button></div></div></div>${group('Lanchas rápidas',boats,'Lanchas rápidas')}${group('Generador Back Up',gens,'Generador Back Up')}${group('Otros equipos',other,'Otros equipos')}`;
  }

  window.mxAddOpsAsset=function(category){ensure();data.operationsAssets.push(makeAsset(category||'Otros equipos'));persist();render();};
  window.mxDeleteOpsAsset=function(i){const e=data?.operationsAssets?.[i];if(!e)return;if(!confirm(`¿Eliminar “${e.name||'este equipo'}” de Maquinaria Operaciones?`))return;data.operationsAssets.splice(i,1);persist();render();};

  function change(e){
    const el=e.target.closest('[data-ops-i][data-ops-k]');if(!el)return;
    const i=+el.dataset.opsI,k=el.dataset.opsK,item=data?.operationsAssets?.[i];if(!item)return;
    item[k]=el.value.trim();
    if(k==='name'){const card=el.closest('.ops-card');const n=card?.querySelector('.ops-card-name');if(n)n.textContent=item.name||'Equipo';}
    recalc(item);persist();
    const nx=$('mxOpsNext-'+i);if(nx)nx.textContent=item.next?fmt(item.next):'Sin dato';
    const st=el.closest('.ops-card')?.querySelector('.ops-status');if(st){st.textContent=item.status;st.className='ops-status '+item.status;}
    if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();
  }

  function hookNewWeek(){
    if(window.__mxOpsNewWeekHook||typeof window.newWeekly!=='function')return;window.__mxOpsNewWeekHook=true;
    const old=window.newWeekly;window.newWeekly=function(){const keep=JSON.parse(JSON.stringify(data.operationsAssets||[]));const r=old();data.operationsAssets=keep;persist();render();return r;};
  }

  function start(){ensure();installStyles();renameTabAndSection();render();document.addEventListener('input',change);document.addEventListener('change',change);hookNewWeek();
    const oldRender=window.renderFeeding;window.renderFeeding=function(){render();};
    if(typeof renderAll==='function')renderAll();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
