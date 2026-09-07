// MultiX v25 — interfaz corporativa + dashboard de mantenimiento
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const activeNames=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():['Ganso','Puyuhuapi 2','Pearson','Arbolito','Delta'];
const fmtDate=v=>{if(!v)return 'Sin fecha';const p=String(v).split('-');return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(v);};
const parseDate=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],12):null;};

function installStyles(){
 if($('mxCorporateUiV25Styles'))return;
 const s=document.createElement('style');s.id='mxCorporateUiV25Styles';s.textContent=`
  :root{--mx-navy:#07151f;--mx-card:#0b1c28;--mx-card2:#0d2230;--mx-line:#294555;--mx-cyan:#4fd8d0;--mx-blue:#4da7ff;--mx-red:#ff626e;--mx-green:#45d59f;--mx-amber:#ffc655;--mx-purple:#b988ff}
  #stats{display:none!important}
  #summary{padding-bottom:18px}.mx-dashboard{display:grid;gap:14px}.mx-dash-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;padding:4px 2px 2px}.mx-dash-title h2{font-size:24px;margin:0;color:var(--text)}.mx-dash-title p{margin:4px 0 0;color:var(--muted);font-size:13px}.mx-dash-filter{display:flex;align-items:center;gap:8px}.mx-dash-filter label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:800}.mx-dash-filter select{background:#0d2230;color:var(--text);border:1px solid var(--mx-line);border-radius:10px;padding:10px 12px;font-weight:800}
  .mx-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.mx-kpi{background:linear-gradient(180deg,#0d2230,#091923);border:1px solid var(--mx-line);border-radius:15px;padding:14px;min-height:90px}.mx-kpi .ico{font-size:21px;line-height:1}.mx-kpi .num{font-size:29px;font-weight:950;margin-top:9px;line-height:1}.mx-kpi .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-top:5px;font-weight:800}.mx-kpi.red{border-color:#75313b;background:linear-gradient(180deg,#291720,#101923)}.mx-kpi.red .num,.mx-kpi.red .ico{color:var(--mx-red)}.mx-kpi.green .ico{color:var(--mx-green)}.mx-kpi.blue .ico{color:var(--mx-blue)}.mx-kpi.amber .ico{color:var(--mx-amber)}.mx-kpi.purple .ico{color:var(--mx-purple)}
  .mx-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.mx-chart-card{background:linear-gradient(180deg,#0b1c28,#091821);border:1px solid var(--mx-line);border-radius:16px;padding:15px}.mx-chart-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:13px}.mx-chart-head b{font-size:16px}.mx-chart-head span{font-size:11px;color:var(--muted)}
  .mx-donut-layout{display:grid;grid-template-columns:190px 1fr;gap:18px;align-items:center}.mx-donut{width:170px;height:170px;border-radius:50%;position:relative;margin:auto}.mx-donut:after{content:'';position:absolute;inset:37px;border-radius:50%;background:#0b1c28;border:1px solid #223b4a}.mx-donut-center{position:absolute;inset:0;display:grid;place-content:center;text-align:center;z-index:2;font-weight:950;font-size:25px}.mx-donut-center small{font-size:11px;color:var(--muted);font-weight:700}.mx-legend{display:grid;gap:8px}.mx-legend-row{display:grid;grid-template-columns:10px 1fr auto;gap:8px;align-items:center;font-size:12px}.mx-dot{width:9px;height:9px;border-radius:50%}
  .mx-ranking{display:grid;gap:11px}.mx-rank-row{display:grid;grid-template-columns:minmax(90px,1fr) 2.2fr 28px;gap:9px;align-items:center}.mx-rank-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mx-rank-track{height:8px;border-radius:999px;background:#152c3a;overflow:hidden}.mx-rank-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--mx-cyan),var(--mx-blue))}.mx-rank-n{font-weight:900;text-align:right;font-size:12px}
  .mx-work-chart{display:grid;gap:12px}.mx-work-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:var(--muted)}.mx-work-legend span:before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}.mx-work-legend .c:before{background:var(--mx-red)}.mx-work-legend .p:before{background:var(--mx-blue)}.mx-work-legend .d:before{background:var(--mx-green)}.mx-work-bars{display:grid;gap:9px}.mx-work-row{display:grid;grid-template-columns:105px 1fr 30px;gap:8px;align-items:center}.mx-work-center{font-size:11px;color:#d7e5ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mx-stack{height:22px;background:#142b39;border-radius:7px;overflow:hidden;display:flex}.mx-stack span{height:100%;display:block}.mx-stack .c{background:var(--mx-red)}.mx-stack .p{background:var(--mx-blue)}.mx-stack .d{background:var(--mx-green)}.mx-work-total{font-size:11px;font-weight:900;text-align:right}
  .mx-corp-section{background:linear-gradient(180deg,#0b1c28,#091821);border:1px solid var(--mx-line);border-radius:16px;padding:14px;margin:12px 0}.mx-corp-section>.mx-corp-title{display:flex;gap:10px;align-items:flex-start;margin-bottom:11px}.mx-corp-section>.mx-corp-title .icon{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#0d3140;color:var(--mx-cyan);font-weight:950}.mx-corp-section>.mx-corp-title b{display:block;font-size:16px}.mx-corp-section>.mx-corp-title small{display:block;color:var(--muted);font-size:11px;margin-top:2px;line-height:1.35}
  .mx-corp-section.accent-teal{border-color:#2c8587}.mx-corp-section.accent-red{border-color:#74343e}.mx-corp-section.accent-purple{border-color:#60488a}.mx-corp-section.accent-blue{border-color:#315c78}
  #editor .grid2.mx-info-grid{background:#081923;border:1px solid #223d4d;border-radius:15px;padding:12px;margin-top:12px!important}#editor .grid2.mx-info-grid+.field{background:#081923;border:1px solid #223d4d;border-radius:15px;padding:12px;margin-top:10px}
  .mx-eq-section-title{margin:5px 0 9px;padding:10px 12px;background:#0a1a25;border:1px solid #294555;border-radius:12px}.mx-eq-section-title b{display:block;font-size:15px}.mx-eq-section-title small{display:block;color:var(--muted);font-size:11px;margin-top:2px}.mx-eq-toolbar{border:1px solid #2e8f91!important;background:#0a252d!important;border-radius:13px!important;padding:11px!important;display:grid!important;grid-template-columns:1fr auto!important;align-items:center!important;gap:10px!important;position:static!important}.mx-eq-toolbar:before{content:'Agregar nuevo equipo';font-weight:900;color:#dffbf8}.mx-eq-card{box-shadow:0 5px 18px rgba(0,0,0,.08)}
  #requests{display:none}.section#requests.active{display:block}.mx-requests-layout{display:grid;gap:14px}.mx-request-registered,.mx-request-new{border-radius:16px!important}.mx-request-registered{border-color:#4d3b68!important}.mx-request-new{border-color:#6a4da4!important;background:linear-gradient(180deg,#15152b,#0c1a27)!important}.mx-request-new h2,.mx-request-registered h2{margin-bottom:3px}.mx-request-sub{font-size:11px;color:var(--muted);margin-bottom:12px}.mx-request-new .req-form{background:#0a1720;border:1px solid #45376a;border-radius:12px;padding:12px}
  .mx-photo-records{border-color:#315c78}.mx-photo-new{border-color:#2e8f91}.mx-photo-records .photo-grid{margin-top:3px}.mx-photo-new input[type=file]{width:100%}
  #editor .subhead{margin-top:22px;padding-top:2px}.ensilage-panel{border-radius:14px!important}.mx-plant-shell,.mx-feed-shell,.mx-ens-shell{border:1px solid #294555;border-radius:16px;padding:12px;background:#081923;margin-top:8px}.mx-plant-shell{border-color:#315c78}.mx-feed-shell{border-color:#2c6c61}.mx-ens-shell{border-color:#705044}
  @media(max-width:960px){.mx-kpis{grid-template-columns:repeat(3,1fr)}.mx-donut-layout{grid-template-columns:1fr}.mx-chart-grid{grid-template-columns:1fr}.mx-donut{width:150px;height:150px}.mx-donut:after{inset:33px}}
  @media(max-width:620px){.mx-dash-head{align-items:stretch;flex-direction:column}.mx-dash-filter{display:grid;grid-template-columns:auto 1fr}.mx-kpis{grid-template-columns:1fr 1fr}.mx-kpi{min-height:82px}.mx-kpi .num{font-size:26px}.mx-chart-card{padding:13px}.mx-work-row{grid-template-columns:82px 1fr 25px}.mx-eq-toolbar{grid-template-columns:1fr!important}.mx-eq-toolbar:before{font-size:13px}.mx-request-new .req-form{padding:9px}}
 `;document.head.appendChild(s);
}

function rangeFor(mode){
 const now=new Date();now.setHours(23,59,59,999);let start=null,end=now;
 if(mode==='report'){
   start=parseDate(data?.meta?.start);end=parseDate(data?.meta?.end)||now;if(end)end.setHours(23,59,59,999);
   if(!start){start=new Date(now);start.setDate(start.getDate()-6);start.setHours(0,0,0,0);}
 }else if(mode==='30'){start=new Date(now);start.setDate(start.getDate()-29);start.setHours(0,0,0,0);}
 else if(mode==='90'){start=new Date(now);start.setDate(start.getDate()-89);start.setHours(0,0,0,0);}
 else if(mode==='year'){start=new Date(now.getFullYear(),0,1);}
 return {start,end};
}
function inRange(date,mode,isCurrent){
 if(mode==='all')return true;const d=parseDate(date);if(!d)return mode==='report'&&isCurrent;const {start,end}=rangeFor(mode);return (!start||d>=start)&&(!end||d<=end);
}
function records(mode){
 const names=activeNames(),workMap=new Map(),failMap=new Map();
 const addSnapshot=(snap,isCurrent)=>names.forEach(name=>{
   const c=snap?.centers?.[name];if(!c)return;
   (c.workLog||[]).forEach((w,i)=>{if(!inRange(w.date,mode,isCurrent))return;const k=w.id||`w:${name}:${w.date}:${w.text}:${i}`;if(!workMap.has(k))workMap.set(k,{...w,center:name});});
   (c.failureLog||[]).forEach((f,i)=>{if(!inRange(f.date,mode,isCurrent))return;const k=f.id||`f:${name}:${f.date}:${f.description}:${i}`;if(!failMap.has(k))failMap.set(k,{...f,center:name});});
 });
 addSnapshot(data,true);(data?.history||[]).forEach(h=>addSnapshot(h,false));
 return {works:[...workMap.values()],failures:[...failMap.values()]};
}
function countVencidos(){let n=0;activeNames().forEach(name=>(data?.centers?.[name]?.equipment||[]).forEach(e=>{if(e.status==='Vencido')n++;}));return n;}
function reqCount(mode){return (data?.requests||[]).filter(r=>activeNames().includes(r.center)||r.center==='Área / Base Cisnes').filter(r=>inRange(r.date,mode,true)).length;}
function donutGradient(rows,total){if(!total)return '#17303f';const colors=['#ff626e','#4da7ff','#45d59f','#ffc655','#b988ff','#31c6df','#7bd389','#ff8fa3'];let cur=0,parts=[];rows.forEach((r,i)=>{const a=cur/total*360;cur+=r.n;const b=cur/total*360;parts.push(`${colors[i%colors.length]} ${a}deg ${b}deg`);});return `conic-gradient(${parts.join(',')})`;}
function dashboardHtml(mode){
 const {works,failures}=records(mode),openFailures=failures.filter(f=>f.status!=='Resuelta'),reqs=reqCount(mode),venc=countVencidos();
 const centerCounts=activeNames().map(name=>({name,n:failures.filter(f=>f.center===name).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);const totalFailures=centerCounts.reduce((a,b)=>a+b.n,0);
 const equipMap={};failures.forEach(f=>{const k=String(f.equipmentName||'General').trim()||'General';equipMap[k]=(equipMap[k]||0)+1;});const equip=Object.entries(equipMap).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n).slice(0,7);const maxEq=Math.max(1,...equip.map(x=>x.n));
 const workRows=activeNames().map(name=>{const list=works.filter(w=>w.center===name);return{name,c:list.filter(w=>w.maintenanceType==='Correctivo').length,p:list.filter(w=>w.maintenanceType==='Preventivo').length,d:list.filter(w=>w.maintenanceType==='Predictivo').length,total:list.length};}).filter(x=>x.total>0);const maxWork=Math.max(1,...workRows.map(x=>x.total));
 const colors=['#ff626e','#4da7ff','#45d59f','#ffc655','#b988ff','#31c6df','#7bd389','#ff8fa3'];
 return `<div class="mx-dashboard">
  <div class="mx-dash-head"><div class="mx-dash-title"><h2>Hola, Equipo de Mantención</h2><p>Resumen operativo y comportamiento de mantenimiento.</p></div><div class="mx-dash-filter"><label>Período</label><select id="mxDashPeriod"><option value="report"${mode==='report'?' selected':''}>Semana actual</option><option value="30"${mode==='30'?' selected':''}>Últimos 30 días</option><option value="90"${mode==='90'?' selected':''}>Últimos 3 meses</option><option value="year"${mode==='year'?' selected':''}>Año actual</option><option value="all"${mode==='all'?' selected':''}>Todo</option></select></div></div>
  <div class="mx-kpis"><div class="mx-kpi green"><div class="ico">▦</div><div class="num">${activeNames().length}</div><div class="lbl">Centros activos</div></div><div class="mx-kpi red"><div class="ico">△</div><div class="num">${openFailures.length}</div><div class="lbl">Fallas abiertas</div></div><div class="mx-kpi purple"><div class="ico">▤</div><div class="num">${reqs}</div><div class="lbl">Solicitudes</div></div><div class="mx-kpi blue"><div class="ico">⌁</div><div class="num">${works.length}</div><div class="lbl">Trabajos registrados</div></div><div class="mx-kpi amber"><div class="ico">⚙</div><div class="num">${venc}</div><div class="lbl">Equipos vencidos</div></div></div>
  <div class="mx-chart-grid"><section class="mx-chart-card"><div class="mx-chart-head"><b>Fallas por centro</b><span>Total: ${totalFailures}</span></div>${totalFailures?`<div class="mx-donut-layout"><div class="mx-donut" style="background:${donutGradient(centerCounts,totalFailures)}"><div class="mx-donut-center">${totalFailures}<small>Fallas</small></div></div><div class="mx-legend">${centerCounts.map((r,i)=>`<div class="mx-legend-row"><span class="mx-dot" style="background:${colors[i%colors.length]}"></span><span>${esc(r.name)}</span><b>${r.n}</b></div>`).join('')}</div></div>`:'<div class="empty">Aún no hay fallas registradas para este período.</div>'}</section>
  <section class="mx-chart-card"><div class="mx-chart-head"><b>Equipos con más fallas</b><span>${failures.length} registros</span></div>${equip.length?`<div class="mx-ranking">${equip.map(r=>`<div class="mx-rank-row"><span class="mx-rank-name">${esc(r.name)}</span><span class="mx-rank-track"><span class="mx-rank-fill" style="width:${Math.max(6,r.n/maxEq*100)}%"></span></span><span class="mx-rank-n">${r.n}</span></div>`).join('')}</div>`:'<div class="empty">Sin información suficiente todavía.</div>'}</section></div>
  <section class="mx-chart-card"><div class="mx-chart-head"><b>Trabajos de mantenimiento por centro</b><div class="mx-work-legend"><span class="c">Correctivo</span><span class="p">Preventivo</span><span class="d">Predictivo</span></div></div>${workRows.length?`<div class="mx-work-bars">${workRows.map(r=>`<div class="mx-work-row"><span class="mx-work-center">${esc(r.name)}</span><span class="mx-stack" style="width:${Math.max(12,r.total/maxWork*100)}%">${r.c?`<span class="c" style="width:${r.c/r.total*100}%" title="Correctivo ${r.c}"></span>`:''}${r.p?`<span class="p" style="width:${r.p/r.total*100}%" title="Preventivo ${r.p}"></span>`:''}${r.d?`<span class="d" style="width:${r.d/r.total*100}%" title="Predictivo ${r.d}"></span>`:''}</span><span class="mx-work-total">${r.total}</span></div>`).join('')}</div>`:'<div class="empty">Los trabajos clasificados aparecerán aquí a medida que los registres.</div>'}</section>
  <div id="summaryAlerts" hidden></div><div id="attentionList" hidden></div>
 </div>`;
}
function renderDashboard(){const host=$('summary');if(!host)return;const mode=host.dataset.mxPeriod||'report';host.innerHTML=dashboardHtml(mode);const sel=$('mxDashPeriod');if(sel)sel.onchange=()=>{host.dataset.mxPeriod=sel.value;renderDashboard();};}

function decorateRequests(){
 const sec=$('requests');if(!sec||sec.dataset.mxCorp==='1')return;const panels=[...sec.children].filter(x=>x.classList?.contains('panel'));if(panels.length<2)return;
 const add=panels[0],registered=panels[1];sec.dataset.mxCorp='1';sec.classList.add('mx-requests-layout');registered.classList.add('mx-request-registered');add.classList.add('mx-request-new');sec.insertBefore(registered,add);
 const rh=registered.querySelector('h2');if(rh)rh.textContent='Solicitudes registradas';const ah=add.querySelector('h2');if(ah)ah.textContent='Crear nueva solicitud';
 if(rh&&!registered.querySelector('.mx-request-sub'))rh.insertAdjacentHTML('afterend','<div class="mx-request-sub">Revisa el estado de cada solicitud y actualízalo a medida que avance.</div>');
 if(ah&&!add.querySelector('.mx-request-sub'))ah.insertAdjacentHTML('afterend','<div class="mx-request-sub">Completa los campos para registrar una solicitud nueva.</div>');
}
function wrapNode(node,cls,title,subtitle,icon){if(!node||node.parentElement?.classList.contains(cls))return node?.parentElement;const w=document.createElement('section');w.className=`mx-corp-section ${cls}`;w.innerHTML=`<div class="mx-corp-title"><span class="icon">${icon}</span><div><b>${title}</b><small>${subtitle}</small></div></div>`;node.parentNode.insertBefore(w,node);w.appendChild(node);return w;}
function decorateCenter(){
 const editor=$('editor');if(!editor)return;
 const infoGrid=$('cNov')?.closest('.grid2');if(infoGrid)infoGrid.classList.add('mx-info-grid');
 const eq=$('equipmentEditor');if(eq&&!$('mxEqTitleV25')){const t=document.createElement('div');t.id='mxEqTitleV25';t.className='mx-eq-section-title';t.innerHTML='<b>Equipos registrados</b><small>Revisa los equipos del centro. El botón turquesa permite incorporar uno nuevo.</small>';eq.parentNode.insertBefore(t,eq);}
 const plantGrid=$('osmosisStatus')?.closest('.grid2');if(plantGrid&&!plantGrid.parentElement.classList.contains('mx-plant-shell'))wrapNode(plantGrid,'mx-plant-shell','Plantas del centro','Estado de Ósmosis y Tratamiento de aguas negras.','◉');
 const feedGrid=$('fBlower')?.closest('.grid3');if(feedGrid&&!feedGrid.parentElement.classList.contains('mx-feed-shell'))wrapNode(feedGrid,'mx-feed-shell','Sistema de alimentación','Estado de blower, selectoras, doser, tornillo y variadores.','⚙');
 const ens=$('mxEnsilagePanel');if(ens&&!ens.parentElement.classList.contains('mx-ens-shell'))wrapNode(ens,'mx-ens-shell','Caseta de ensilaje','Estado de bombas, tableros e iluminación.','▣');
 const grid=$('photoGrid'),input=$('photoInput');if(grid&&input&&!$('mxPhotoRecordsV25')){
   const inputField=input.closest('.field');
   const rec=document.createElement('section');rec.id='mxPhotoRecordsV25';rec.className='mx-corp-section mx-photo-records';rec.innerHTML='<div class="mx-corp-title"><span class="icon">▧</span><div><b>Fotografías registradas</b><small>Imágenes ya incorporadas al centro y asociadas a equipos o componentes.</small></div></div>';grid.parentNode.insertBefore(rec,grid);rec.appendChild(grid);
   const nw=document.createElement('section');nw.id='mxPhotoNewV25';nw.className='mx-corp-section mx-photo-new';nw.innerHTML='<div class="mx-corp-title"><span class="icon">＋</span><div><b>Agregar fotografías</b><small>Selecciona el equipo o componente correspondiente antes de subir las imágenes.</small></div></div>';inputField.parentNode.insertBefore(nw,inputField);nw.appendChild(inputField);
 }
}
function installHooks(){
 if(window.__mxCorporateUiHooksV25)return;window.__mxCorporateUiHooksV25=true;
 if(typeof window.renderSummary==='function')window.renderSummary=renderDashboard;
 if(typeof window.renderStats==='function')window.renderStats=function(){};
 if(typeof window.renderAll==='function'){
   const old=window.renderAll;window.renderAll=function(){const r=old();setTimeout(()=>{renderDashboard();decorateRequests();if($('editor')?.classList.contains('open'))decorateCenter();},20);return r;};
 }
 if(typeof window.openCenter==='function'){
   const old=window.openCenter;window.openCenter=function(name){const r=old(name);setTimeout(decorateCenter,120);return r;};
 }
}
function start(){installStyles();let tries=0;const t=setInterval(()=>{tries++;if(typeof data!=='undefined'&&$('summary')){installHooks();renderDashboard();decorateRequests();if($('editor')?.classList.contains('open'))decorateCenter();clearInterval(t);}else if(tries>100)clearInterval(t);},100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();