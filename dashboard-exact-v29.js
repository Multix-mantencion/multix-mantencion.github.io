// MultiX v29 — inicio/dashboard móvil corporativo basado en la maqueta aprobada
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const parseDate=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],12):null;};
const activeNames=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():['Ganso','Puyuhuapi 2','Pearson','Arbolito','Delta'];
const icon=(name,cls='')=>{
  const common=`class="mxe-ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;
  const paths={
    building:'<path d="M4 21V8h7v13M11 21V3h9v18M7 11h1M7 15h1M14 7h2M14 11h2M14 15h2M2 21h20"/>',
    warning:'<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17.5h.01"/>',
    doc:'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 11h6M9 15h6M9 19h4"/>',
    wrench:'<path d="M14.5 6.5a4 4 0 0 0-5-5L7 4l2 2-7 7a3 3 0 0 0 4 4l7-7 2 2 2.5-2.5a4 4 0 0 0-3-3Z"/>',
    gear:'<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-2.12 2.12-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V20.5h-3v-.09A1.8 1.8 0 0 0 10.4 18.8a1.8 1.8 0 0 0-2 .36l-.06.06-2.12-2.12.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 5 14H4.9v-3H5a1.8 1.8 0 0 0 1.64-1.1 1.8 1.8 0 0 0-.36-2l-.06-.06 2.12-2.12.06.06a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 11.5 4.5V4.4h3v.1a1.8 1.8 0 0 0 1.1 1.64 1.8 1.8 0 0 0 2-.36l.06-.06 2.12 2.12-.06.06a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 21 11h.1v3H21a1.8 1.8 0 0 0-1.6 1Z"/>',
    alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/>',
    pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    home:'<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    bars:'<path d="M5 21V11h4v10M10 21V5h4v16M15 21v-8h4v8M3 21h18"/>',
    trend:'<path d="M4 18V6M4 18h16M7 14l4-4 3 2 4-5"/>',
    chevron:'<path d="m8 10 4 4 4-4"/>'
  };
  return `<svg ${common}>${paths[name]||paths.doc}</svg>`;
};
function fmtPeriod(){
  const s=parseDate(data?.meta?.start),e=parseDate(data?.meta?.end);if(!s&&!e)return 'Semana actual';
  const mo=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const a=s||e,b=e||s;return `${String(a.getDate()).padStart(2,'0')} - ${String(b.getDate()).padStart(2,'0')} ${mo[b.getMonth()]} ${b.getFullYear()}`;
}
function rangeFor(mode,previous=false){
  const now=new Date();now.setHours(23,59,59,999);let start=null,end=null;
  if(mode==='report'){
    start=parseDate(data?.meta?.start);end=parseDate(data?.meta?.end)||new Date(now);
    if(!start){start=new Date(end);start.setDate(start.getDate()-6);}const days=Math.max(1,Math.round((end-start)/86400000)+1);
    if(previous){end=new Date(start);end.setDate(end.getDate()-1);start=new Date(end);start.setDate(start.getDate()-days+1);}
  }else if(mode==='30'||mode==='90'){
    const days=mode==='30'?30:90;end=new Date(now);start=new Date(end);start.setDate(start.getDate()-days+1);
    if(previous){end=new Date(start);end.setDate(end.getDate()-1);start=new Date(end);start.setDate(start.getDate()-days+1);}
  }else if(mode==='year'){
    const y=now.getFullYear()-(previous?1:0);start=new Date(y,0,1);end=new Date(y,11,31,23,59,59,999);
  }
  if(start)start.setHours(0,0,0,0);if(end)end.setHours(23,59,59,999);return{start,end};
}
function inRange(v,mode,previous=false){if(mode==='all')return true;const d=parseDate(v);if(!d)return false;const r=rangeFor(mode,previous);return(!r.start||d>=r.start)&&(!r.end||d<=r.end);}
function snapshots(){return [data,...(Array.isArray(data?.history)?data.history:[])];}
function records(mode,zone,previous=false){
  const allowed=zone&&zone!=='Todas'?[zone]:activeNames(),wm=new Map(),fm=new Map();
  snapshots().forEach(s=>allowed.forEach(center=>{const c=s?.centers?.[center];if(!c)return;(c.workLog||[]).forEach((w,i)=>{if(!inRange(w.date,mode,previous))return;const k=w.id||`${center}|${w.date}|${w.text}|${i}`;if(!wm.has(k))wm.set(k,{...w,center});});(c.failureLog||[]).forEach((f,i)=>{if(!inRange(f.date,mode,previous))return;const k=f.id||`${center}|${f.date}|${f.description}|${i}`;if(!fm.has(k))fm.set(k,{...f,center});});}));
  return{works:[...wm.values()],failures:[...fm.values()]};
}
function requests(mode,zone,previous=false){const allowed=zone&&zone!=='Todas'?[zone]:activeNames();return(data?.requests||[]).filter(r=>(allowed.includes(r.center)||r.center==='Área / Base Cisnes')&&inRange(r.date,mode,previous));}
function equipmentNow(zone){const allowed=zone&&zone!=='Todas'?[zone]:activeNames(),out=[];allowed.forEach(n=>(data?.centers?.[n]?.equipment||[]).forEach(e=>out.push({...e,center:n})));return out;}
function pendingNow(zone){const allowed=zone&&zone!=='Todas'?[zone]:activeNames();let n=0;allowed.forEach(c=>{const t=String(data?.centers?.[c]?.pending||'').trim();if(t)n+=t.split(/\n+/).filter(Boolean).length;});return n;}
function pct(cur,prev){if(prev===0)return cur===0?0:100;return Math.round((cur-prev)/prev*100);}
function deltaHtml(cur,prev){const p=pct(cur,prev),up=p>=0;return `<div class="mxe-delta ${up?'up':'down'}">${up?'▲':'▼'} ${p>0?'+':''}${p}%</div>`;}
function donutGradient(rows,total){if(!total)return '#153444';const colors=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8','#7bd389'];let cur=0;return`conic-gradient(${rows.map((r,i)=>{const a=cur/total*360;cur+=r.n;const b=cur/total*360;return`${colors[i%colors.length]} ${a}deg ${b}deg`;}).join(',')})`;}
function equipmentFamily(name){const n=String(name||'General').toLowerCase();if(n.includes('gener'))return'Generadores';if(n.includes('bomba'))return'Bombas';if(n.includes('compres'))return'Compresores';if(n.includes('tablero'))return'Tableros eléctricos';if(n.includes('doser'))return'Doser';if(n.includes('select'))return'Selectoras';if(n.includes('ósmosis')||n.includes('osmosis'))return'Planta de Ósmosis';if(n.includes('tratamiento'))return'Planta de Tratamiento';if(n.includes('bote')||n.includes('róbalo')||n.includes('robalo')||n.includes('camargo')||n.includes('bonita'))return'Botes / FB';return String(name||'General');}
function buildData(mode,zone){
  const cur=records(mode,zone,false),prev=records(mode,zone,true),req=requests(mode,zone,false),prevReq=requests(mode,zone,true),eq=equipmentNow(zone),venc=eq.filter(e=>['Vencido','Inoperativo'].includes(e.status)).length,open=cur.failures.filter(f=>f.status!=='Resuelta').length,pending=pendingNow(zone);
  const centers=(zone&&zone!=='Todas'?[zone]:activeNames());
  const centerCounts=centers.map(name=>({name,n:cur.failures.filter(f=>f.center===name).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const fam={};cur.failures.forEach(f=>{const k=equipmentFamily(f.equipmentName);fam[k]=(fam[k]||0)+1;});const equipRank=Object.entries(fam).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n).slice(0,6);
  const workRows=centers.map(name=>{const list=cur.works.filter(w=>w.center===name);return{name,c:list.filter(w=>w.maintenanceType==='Correctivo').length,p:list.filter(w=>w.maintenanceType==='Preventivo').length,d:list.filter(w=>w.maintenanceType==='Predictivo').length,total:list.length};}).filter(r=>r.total>0);
  return{cur,prev,req,prevReq,eq,venc,open,pending,centers,centerCounts,equipRank,workRows};
}
function dateTime(){const d=new Date();return{date:d.toLocaleDateString('es-CL',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).replace('.',''),time:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false})};}
function dashboardHtml(mode,zone){
  const z=zone||'Todas',d=buildData(mode,z),prevOpen=d.prev.failures.filter(f=>f.status!=='Resuelta').length,prevVenc=d.venc,prevPending=d.pending,dt=dateTime(),totalF=d.centerCounts.reduce((a,b)=>a+b.n,0),maxEq=Math.max(1,...d.equipRank.map(x=>x.n)),maxWork=Math.max(1,...d.workRows.map(x=>x.total)),colors=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8'];
  const logo=document.querySelector('.brand img')?.getAttribute('src')||'';
  const zoneOpts=['Todas',...activeNames()].map(n=>`<option value="${esc(n)}"${n===z?' selected':''}>${esc(n)}</option>`).join('');
  return `<div class="mxe-shell">
    <header class="mxe-header"><div class="mxe-logo">${logo?`<img src="${logo}" alt="MultiX">`:'<div class="mxe-wordmark">MULTI <b>X›</b><small>Mantención</small></div>'}</div><div class="mxe-head-actions"><button class="mxe-icon-btn" type="button" title="Alertas">${icon('bell')}<span class="mxe-red-dot"></span></button><button class="mxe-icon-btn" id="mxeMenuBtn" type="button" title="Menú">${icon('menu')}</button></div></header>
    <div class="mxe-greet"><div><h1>Hola, Equipo de Mantención</h1><p>Seguimiento y control de tus operaciones</p></div><div class="mxe-now"><span>${esc(dt.date)}</span><b id="mxeClock">${esc(dt.time)}</b></div></div>
    <div class="mxe-filters"><label><span>${icon('calendar')}<small>Semana</small></span><select id="mxePeriod"><option value="report"${mode==='report'?' selected':''}>${esc(fmtPeriod())}</option><option value="30"${mode==='30'?' selected':''}>Últimos 30 días</option><option value="90"${mode==='90'?' selected':''}>Últimos 3 meses</option><option value="year"${mode==='year'?' selected':''}>Año actual</option><option value="all"${mode==='all'?' selected':''}>Todo el historial</option></select>${icon('chevron','mini')}</label><label><span>${icon('pin')}<small>Zona</small></span><select id="mxeZone">${zoneOpts}</select>${icon('chevron','mini')}</label></div>
    <div class="mxe-kpis">
      <article class="mxe-kpi cyan">${icon('building')}<div><strong>${d.centers.length}</strong><span>Centros Operativos</span>${deltaHtml(d.centers.length,d.centers.length)}</div></article>
      <article class="mxe-kpi red">${icon('warning')}<div><strong>${d.open}</strong><span>Fallas abiertas</span>${deltaHtml(d.open,prevOpen)}</div></article>
      <article class="mxe-kpi blue">${icon('doc')}<div><strong>${d.req.length}</strong><span>Solicitudes</span>${deltaHtml(d.req.length,d.prevReq.length)}</div></article>
      <article class="mxe-kpi teal">${icon('wrench')}<div><strong>${d.cur.works.length}</strong><span>Trabajos realizados</span>${deltaHtml(d.cur.works.length,d.prev.works.length)}</div></article>
      <article class="mxe-kpi amber">${icon('gear')}<div><strong>${d.venc}</strong><span>Equipos vencidos</span>${deltaHtml(d.venc,prevVenc)}</div></article>
      <article class="mxe-kpi red2">${icon('alert')}<div><strong>${d.pending}</strong><span>Pendientes críticos</span>${deltaHtml(d.pending,prevPending)}</div></article>
    </div>
    <div class="mxe-chart-pair">
      <section class="mxe-panel"><div class="mxe-panel-title"><b>Fallas por centro</b><span>Total: ${totalF}</span></div>${totalF?`<div class="mxe-donut" style="background:${donutGradient(d.centerCounts,totalF)}"><div>${totalF}<small>Fallas</small></div></div><div class="mxe-legend">${d.centerCounts.map((r,i)=>`<div><i style="background:${colors[i%colors.length]}"></i><span>${esc(r.name)}</span><b>${r.n}</b></div>`).join('')}</div>`:'<div class="mxe-empty">Sin fallas registradas</div>'}</section>
      <section class="mxe-panel"><div class="mxe-panel-title"><b>Equipos con más fallas</b></div>${d.equipRank.length?`<div class="mxe-rank">${d.equipRank.map((r,i)=>`<div class="mxe-rank-row"><span class="mxe-rank-icon">${icon(i===0?'gear':i===1?'building':i===2?'wrench':'trend')}</span><div><div class="mxe-rank-name"><span>${esc(r.name)}</span><b>${r.n}</b></div><div class="mxe-track"><i style="width:${Math.max(12,r.n/maxEq*100)}%;background:${colors[i%colors.length]}"></i></div></div></div>`).join('')}</div>`:'<div class="mxe-empty">Sin datos todavía</div>'}</section>
    </div>
    <section class="mxe-panel mxe-work-panel"><div class="mxe-panel-title"><b>Trabajos de mantención por centro</b><span class="mxe-work-legend"><i class="c"></i>Correctivo <i class="p"></i>Preventivo <i class="d"></i>Predictivo</span></div>${d.workRows.length?`<div class="mxe-vchart">${d.workRows.map(r=>{const hc=r.c/maxWork*100,hp=r.p/maxWork*100,hd=r.d/maxWork*100;return`<div class="mxe-barcol"><b>${r.total}</b><div class="mxe-bar"><i class="d" style="height:${hd}%">${r.d||''}</i><i class="p" style="height:${hp}%">${r.p||''}</i><i class="c" style="height:${hc}%">${r.c||''}</i></div><span>${esc(r.name)}</span></div>`;}).join('')}</div>`:'<div class="mxe-empty">Los trabajos clasificados aparecerán aquí.</div>'}</section>
    <div id="summaryAlerts" hidden></div><div id="attentionList" hidden></div>
    <div id="mxeMenu" class="mxe-menu" hidden><button data-go="feeding">Maquinaria Operaciones</button><button data-go="stock">Stock Bodega Cisnes</button><button data-go="history">Historial</button></div>
  </div>`;
}
function installStyles(){if($('mxeV29Styles'))return;const s=document.createElement('style');s.id='mxeV29Styles';s.textContent=`
:root{--mxe-bg:#001926;--mxe-bg2:#002b3e;--mxe-card:#07344a;--mxe-line:#0c6686;--mxe-cyan:#14dbf4;--mxe-blue:#3ca9ff;--mxe-red:#ff5d66;--mxe-green:#31d6aa;--mxe-amber:#ffc34e;--mxe-text:#f6fbff;--mxe-muted:#a9bed0}
body.mxe-home{background:linear-gradient(180deg,#001522,#00283a 46%,#001824);color:var(--mxe-text)}
body.mxe-home .topbar,body.mxe-home .stats,body.mxe-home .tabs,body.mxe-home>.bottom,body.mxe-home .app>.meta,body.mxe-home .app>.period,body.mxe-home .app>.grid2:first-of-type{display:none!important}
body.mxe-home .app{max-width:1120px;padding:0!important;background:transparent}body.mxe-home #summary{padding:0!important;margin:0!important;display:block!important}
.mxe-shell{min-height:100vh;padding:calc(10px + env(safe-area-inset-top)) 14px calc(92px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% -10%,rgba(19,122,169,.22),transparent 37%)}
.mxe-header{display:flex;justify-content:space-between;align-items:center;padding:4px 2px 11px;border-bottom:1px solid rgba(80,190,225,.18)}.mxe-logo img{width:160px;max-width:42vw;height:auto;display:block;filter:brightness(1.35) saturate(1.05)}.mxe-wordmark{font-size:30px;font-weight:950;letter-spacing:.08em}.mxe-wordmark b{color:#ff5361}.mxe-wordmark small{display:block;font-size:12px;letter-spacing:0;text-align:center}.mxe-head-actions{display:flex;gap:7px}.mxe-icon-btn{position:relative;width:42px;height:42px;border:0;background:transparent;color:#d8edf8;padding:8px}.mxe-red-dot{position:absolute;width:8px;height:8px;background:#ff1e32;border-radius:50%;right:8px;top:6px}.mxe-ico{width:28px;height:28px;display:block}.mxe-ico.mini{width:18px;height:18px}
.mxe-greet{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:12px 3px 10px}.mxe-greet h1{font-size:20px;line-height:1.1;margin:0;font-weight:900}.mxe-greet p{margin:4px 0 0;color:#a9bed0;font-size:12px}.mxe-now{font-size:10px;text-align:right;color:#bfced9;line-height:1.6;white-space:nowrap}.mxe-now b{display:block;font-size:11px;color:#e5f4fb}
.mxe-filters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.mxe-filters label{position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:8px;border:1px solid #0d6382;border-radius:9px;background:linear-gradient(180deg,#063149,#02263a);padding:7px 8px;color:#e8f7ff;min-width:0}.mxe-filters label>span{display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center;pointer-events:none}.mxe-filters small{font-size:9px;color:#a8bfd0;font-weight:700}.mxe-filters select{appearance:none;border:0;background:transparent;color:#f6fbff;font-size:11px;font-weight:800;min-width:0;width:100%;padding:0}.mxe-filters select:focus{outline:none}.mxe-filters .mxe-ico{color:#27c9f4;width:22px;height:22px}.mxe-filters>label>.mini{color:#d8edf8;width:17px;height:17px}
.mxe-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mxe-kpi{display:grid;grid-template-columns:38px 1fr;align-items:center;gap:8px;min-height:84px;border:1px solid #0a6282;border-radius:9px;padding:10px;background:linear-gradient(145deg,#07334a,#042536);box-shadow:inset 0 0 22px rgba(7,112,151,.05)}.mxe-kpi>.mxe-ico{width:34px;height:34px}.mxe-kpi strong{display:block;font-size:25px;line-height:1;color:#fff}.mxe-kpi span{display:block;font-size:9px;color:#d5e5ed;margin-top:4px;line-height:1.08}.mxe-kpi.cyan>.mxe-ico,.mxe-kpi.blue>.mxe-ico{color:#44c9ff}.mxe-kpi.teal>.mxe-ico{color:#59e7df}.mxe-kpi.amber{border-color:#8c6c14;background:linear-gradient(145deg,#2b2d20,#172a2c)}.mxe-kpi.amber>.mxe-ico{color:#ffd362}.mxe-kpi.red,.mxe-kpi.red2{border-color:#9b3041;background:linear-gradient(145deg,#321d2a,#172636)}.mxe-kpi.red>.mxe-ico,.mxe-kpi.red2>.mxe-ico{color:#ff6470}.mxe-delta{font-size:9px!important;font-weight:900!important;margin-top:5px!important}.mxe-delta.up{color:#30dcaa!important}.mxe-delta.down{color:#ff5360!important}
.mxe-chart-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.mxe-panel{border:1px solid #0d5e7a;border-radius:9px;background:linear-gradient(180deg,#063149,#032535);padding:10px;min-width:0}.mxe-panel-title{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;margin-bottom:8px}.mxe-panel-title b{font-size:12px;line-height:1.15}.mxe-panel-title>span{font-size:9px;color:#b6c9d5;white-space:nowrap}.mxe-donut{width:112px;height:112px;border-radius:50%;position:relative;margin:4px auto 8px}.mxe-donut:after{content:'';position:absolute;inset:29px;background:#032535;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.06)}.mxe-donut>div{position:absolute;inset:0;display:grid;place-content:center;text-align:center;font-size:21px;font-weight:950;z-index:2}.mxe-donut small{display:block;font-size:9px;font-weight:700;margin-top:1px}.mxe-legend{display:grid;gap:4px}.mxe-legend>div{display:grid;grid-template-columns:8px minmax(0,1fr) 18px;gap:5px;align-items:center;font-size:9px}.mxe-legend i{width:8px;height:8px;border-radius:50%}.mxe-legend span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mxe-legend b{text-align:right}.mxe-rank{display:grid;gap:8px}.mxe-rank-row{display:grid;grid-template-columns:25px minmax(0,1fr);gap:6px;align-items:center}.mxe-rank-icon{color:#5ccafa}.mxe-rank-icon .mxe-ico{width:22px;height:22px}.mxe-rank-name{display:flex;justify-content:space-between;gap:5px;font-size:9px}.mxe-rank-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mxe-track{height:6px;background:#16455b;border-radius:99px;margin-top:4px;overflow:hidden}.mxe-track i{display:block;height:100%;border-radius:99px}.mxe-empty{color:#9fb5c4;text-align:center;font-size:10px;padding:24px 5px}
.mxe-work-panel{margin-top:8px}.mxe-work-legend{display:flex!important;gap:7px;align-items:center;flex-wrap:wrap;font-size:8px!important}.mxe-work-legend i{display:inline-block;width:7px;height:7px;border-radius:50%}.mxe-work-legend i.c{background:#ff5d66}.mxe-work-legend i.p{background:#38a9ff}.mxe-work-legend i.d{background:#35d5aa}.mxe-vchart{height:150px;display:flex;align-items:flex-end;justify-content:space-around;gap:7px;border-bottom:1px solid rgba(171,219,240,.2);padding:16px 4px 0;margin-top:4px}.mxe-barcol{height:100%;flex:1;min-width:0;display:grid;grid-template-rows:14px 1fr 30px;text-align:center;align-items:end}.mxe-barcol>b{font-size:10px}.mxe-bar{height:92px;display:flex;flex-direction:column;justify-content:flex-end;margin:0 auto;width:min(34px,82%);overflow:hidden;border-radius:2px 2px 0 0}.mxe-bar i{display:flex;align-items:center;justify-content:center;min-height:0;font-style:normal;font-size:8px;font-weight:900;color:white}.mxe-bar i.c{background:#ff5d66}.mxe-bar i.p{background:#38a9ff}.mxe-bar i.d{background:#35d5aa}.mxe-barcol>span{font-size:8px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;padding-top:5px}
.mxe-menu{position:fixed;right:14px;top:calc(61px + env(safe-area-inset-top));z-index:90;width:220px;border:1px solid #0d6687;border-radius:12px;background:#062638;box-shadow:0 18px 50px rgba(0,0,0,.45);padding:7px}.mxe-menu button{display:block;width:100%;text-align:left;border:0;background:transparent;color:#eaf7fc;padding:11px;border-radius:8px;font-weight:800}.mxe-menu button:hover{background:#0c3c51}
#mxeBottomNav{position:fixed;z-index:80;left:0;right:0;bottom:0;height:calc(72px + env(safe-area-inset-bottom));background:rgba(1,27,41,.97);border-top:1px solid #0c5670;display:grid;grid-template-columns:repeat(5,1fr);padding:6px 8px env(safe-area-inset-bottom);backdrop-filter:blur(12px)}#mxeBottomNav button{position:relative;border:0;background:transparent;color:#b5c6d4;font-size:9px;font-weight:800;display:grid;place-items:center;gap:1px;padding:4px}#mxeBottomNav button .mxe-ico{width:25px;height:25px}#mxeBottomNav button.active{color:#16ddf0}#mxeBottomNav button.active:after{content:'';position:absolute;left:24%;right:24%;bottom:0;height:3px;border-radius:5px;background:#19dff1}
@media(min-width:700px){.mxe-shell{padding-left:22px;padding-right:22px}.mxe-logo img{width:190px}.mxe-kpis{grid-template-columns:repeat(6,1fr)}.mxe-chart-pair{gap:12px}.mxe-donut{width:155px;height:155px}.mxe-donut:after{inset:40px}.mxe-panel-title b{font-size:15px}.mxe-rank-name,.mxe-legend>div{font-size:11px}.mxe-vchart{height:210px}.mxe-bar{height:145px;width:min(52px,75%)}.mxe-barcol>span{font-size:10px}#mxeBottomNav{max-width:1120px;margin:auto;left:50%;transform:translateX(-50%);width:100%}}
`;document.head.appendChild(s);}
function ensureBottomNav(){if($('mxeBottomNav'))return;const nav=document.createElement('nav');nav.id='mxeBottomNav';nav.innerHTML=`<button data-target="summary" class="active">${icon('home')}<span>Inicio</span></button><button data-target="centers">${icon('building')}<span>Centros</span></button><button data-target="requests">${icon('doc')}<span>Solicitudes</span></button><button data-target="works">${icon('wrench')}<span>Trabajos</span></button><button data-target="report">${icon('bars')}<span>Informe</span></button>`;document.body.appendChild(nav);nav.addEventListener('click',e=>{const b=e.target.closest('button[data-target]');if(!b)return;go(b.dataset.target);});}
function setNavActive(id){document.querySelectorAll('#mxeBottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.target===id||(id==='centers'&&b.dataset.target==='works')));}
function updateHomeClass(){const home=$('summary')?.classList.contains('active');document.body.classList.toggle('mxe-home',!!home);if(home)setNavActive('summary');}
function go(id){
  if(id==='works'){if(typeof window.switchTab==='function')window.switchTab('centers');setNavActive('works');const first=activeNames()[0];setTimeout(()=>{if(first&&typeof window.openCenter==='function')window.openCenter(first);},80);return;}
  if(id==='report'){
    const reportBtn=$('mxReportTab');if(reportBtn){reportBtn.click();setNavActive('report');return;}
    if(typeof window.switchTab==='function')window.switchTab('history');setNavActive('report');return;
  }
  if(typeof window.switchTab==='function')window.switchTab(id);setNavActive(id);setTimeout(updateHomeClass,0);
}
function bindDashboard(){const p=$('mxePeriod'),z=$('mxeZone'),menu=$('mxeMenu'),mb=$('mxeMenuBtn');if(p)p.onchange=()=>{const h=$('summary');h.dataset.mxePeriod=p.value;renderExact();};if(z)z.onchange=()=>{const h=$('summary');h.dataset.mxeZone=z.value;renderExact();};if(mb&&menu)mb.onclick=()=>{menu.hidden=!menu.hidden;};if(menu)menu.onclick=e=>{const b=e.target.closest('[data-go]');if(!b)return;menu.hidden=true;go(b.dataset.go);};}
function renderExact(){const host=$('summary');if(!host)return;const mode=host.dataset.mxePeriod||'report',zone=host.dataset.mxeZone||'Todas';host.innerHTML=dashboardHtml(mode,zone);bindDashboard();updateHomeClass();}
function installHooks(){if(window.__mxeV29Hooks)return;window.__mxeV29Hooks=true;const oldSummary=window.renderSummary;window.renderSummary=renderExact;if(typeof window.renderAll==='function'){const old=window.renderAll;window.renderAll=function(){const r=old();setTimeout(renderExact,35);return r;};}if(typeof window.switchTab==='function'){const old=window.switchTab;window.switchTab=function(id){const r=old(id);setTimeout(()=>{updateHomeClass();if(id==='summary')renderExact();else setNavActive(id);},10);return r;};}}
function start(){installStyles();ensureBottomNav();let n=0;const t=setInterval(()=>{n++;if(typeof data!=='undefined'&&$('summary')&&window.__mxCorporateUiHooksV25){installHooks();renderExact();updateHomeClass();clearInterval(t);}else if(n>160){installHooks();renderExact();updateHomeClass();clearInterval(t);}},100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();