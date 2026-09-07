// MultiX v32 — inicio con histórico general y filtro por áreas
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
const ORDER=['Ganso','Puyuhuapi 2','Puyuhuapi 1','Pearson','Delta','Arbolito','Camargo','Yelen','Refugio','Yalac','Yalak'];
const icon=(name)=>{
 const common='class="mxe-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
 const p={
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
  trend:'<path d="M4 18V6M4 18h16M7 14l4-4 3 2 4-5"/>'
 };
 return `<svg ${common}>${p[name]||p.doc}</svg>`;
};
function allCenterNames(){
 const raw=Object.keys(data?.centers||{});
 const out=[];
 ORDER.forEach(w=>{const hit=raw.find(r=>norm(r)===norm(w));if(hit&&!out.includes(hit))out.push(hit);});
 raw.forEach(r=>{if(!out.includes(r))out.push(r);});
 return out;
}
function centersFor(zone){
 const all=allCenterNames();
 if(zone==='Área Refugio')return all.filter(n=>REFUGIO_SET.has(norm(n)));
 if(zone==='Área Puyuhuapi')return all.filter(n=>!REFUGIO_SET.has(norm(n)));
 return all;
}
function snapshots(){return [data,...(Array.isArray(data?.history)?data.history:[])];}
function totalRecords(zone){
 const centers=centersFor(zone),wm=new Map(),fm=new Map();
 snapshots().forEach(s=>centers.forEach(center=>{
  const c=s?.centers?.[center];if(!c)return;
  (c.workLog||[]).forEach((w,i)=>{const k=w.id||`w|${center}|${w.date||''}|${w.text||''}|${w.equipmentName||''}|${i}`;if(!wm.has(k))wm.set(k,{...w,center});});
  (c.failureLog||[]).forEach((f,i)=>{const k=f.id||`f|${center}|${f.date||''}|${f.description||''}|${f.equipmentName||''}|${i}`;if(!fm.has(k))fm.set(k,{...f,center});});
 }));
 return{works:[...wm.values()],failures:[...fm.values()]};
}
function totalRequests(zone){
 const centers=centersFor(zone),m=new Map();
 snapshots().forEach(s=>(s?.requests||[]).forEach((r,i)=>{
  const areaBase=r.center==='Área / Base Cisnes';
  const belongs=centers.includes(r.center)||(areaBase&&zone!=='Área Refugio');
  if(!belongs)return;
  const k=r.id||`r|${r.center||''}|${r.date||''}|${r.item||r.detail||r.material||''}|${r.to||''}|${i}`;
  if(!m.has(k))m.set(k,{...r});
 }));
 return [...m.values()];
}
function equipmentNow(zone){const out=[];centersFor(zone).forEach(c=>(data?.centers?.[c]?.equipment||[]).forEach(e=>out.push({...e,center:c})));return out;}
function pendingNow(zone){let n=0;centersFor(zone).forEach(c=>{const t=String(data?.centers?.[c]?.pending||'').trim();if(t)n+=t.split(/\n+/).filter(Boolean).length;});return n;}
function equipmentFamily(name){const n=norm(name||'General');if(n.includes('gener'))return'Generadores';if(n.includes('bomba'))return'Bombas';if(n.includes('compres'))return'Compresores';if(n.includes('tablero'))return'Tableros eléctricos';if(n.includes('doser'))return'Doser';if(n.includes('select'))return'Selectoras';if(n.includes('osmosis'))return'Planta de Ósmosis';if(n.includes('tratamiento'))return'Planta de Tratamiento';if(n.includes('bote')||n.includes('robalo')||n.includes('camargo')||n.includes('bonita'))return'Botes / FB';return String(name||'General');}
function donutGradient(rows,total){if(!total)return '#153444';const colors=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8','#7bd389','#ff8fa3','#59e7df','#ff9b6a'];let cur=0;return`conic-gradient(${rows.map((r,i)=>{const a=cur/total*360;cur+=r.n;const b=cur/total*360;return`${colors[i%colors.length]} ${a}deg ${b}deg`;}).join(',')})`;}
function dateTime(){const d=new Date();return{date:d.toLocaleDateString('es-CL',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).replace('.',''),time:d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false})};}
function build(zone){
 const centers=centersFor(zone),rec=totalRecords(zone),req=totalRequests(zone),eq=equipmentNow(zone),open=rec.failures.filter(f=>f.status!=='Resuelta').length,venc=eq.filter(e=>['Vencido','Inoperativo'].includes(e.status)).length,pending=pendingNow(zone);
 const centerCounts=centers.map(name=>({name,n:rec.failures.filter(f=>f.center===name).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
 const fam={};rec.failures.forEach(f=>{const k=equipmentFamily(f.equipmentName);fam[k]=(fam[k]||0)+1;});
 const equipRank=Object.entries(fam).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n).slice(0,6);
 const workRows=centers.map(name=>{const list=rec.works.filter(w=>w.center===name);return{name,c:list.filter(w=>w.maintenanceType==='Correctivo').length,p:list.filter(w=>w.maintenanceType==='Preventivo').length,d:list.filter(w=>w.maintenanceType==='Predictivo').length,total:list.length};}).filter(r=>r.total>0);
 return{centers,rec,req,eq,open,venc,pending,centerCounts,equipRank,workRows};
}
function dashboardHtml(zone){
 const z=['Todas las zonas','Área Puyuhuapi','Área Refugio'].includes(zone)?zone:'Todas las zonas';
 const d=build(z),dt=dateTime(),totalF=d.centerCounts.reduce((a,b)=>a+b.n,0),maxEq=Math.max(1,...d.equipRank.map(x=>x.n)),maxWork=Math.max(1,...d.workRows.map(x=>x.total)),colors=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8','#7bd389','#ff8fa3','#59e7df','#ff9b6a'];
 const logo=document.querySelector('.brand img')?.getAttribute('src')||'';
 const zoneOpts=['Todas las zonas','Área Puyuhuapi','Área Refugio'].map(n=>`<option value="${esc(n)}"${n===z?' selected':''}>${esc(n)}</option>`).join('');
 return `<div class="mxe-shell">
  <header class="mxe-header"><div class="mxe-logo">${logo?`<img src="${logo}" alt="MultiX">`:'<div class="mxe-wordmark">MULTI <b>X›</b><small>Mantención</small></div>'}</div><div class="mxe-head-actions"><button class="mxe-icon-btn" type="button" title="Alertas">${icon('bell')}<span class="mxe-red-dot"></span></button><button class="mxe-icon-btn" id="mxeMenuBtn" type="button" title="Menú">${icon('menu')}</button></div></header>
  <div class="mxe-greet"><div><h1>Hola, Equipo de Mantención</h1><p>Seguimiento y control de tus operaciones</p></div><div class="mxe-now"><span>${esc(dt.date)}</span><b>${esc(dt.time)}</b></div></div>
  <div class="mxe-filters"><div class="mxe-total-filter"><span>${icon('calendar')}<small>Cobertura</small></span><strong>Histórico general</strong></div><label><span>${icon('pin')}<small>Zona</small></span><select id="mxeZoneArea">${zoneOpts}</select><span class="mxe-zone-arrow">⌄</span></label></div>
  <div class="mxe-kpis">
   <article class="mxe-kpi cyan">${icon('building')}<div><strong>${d.centers.length}</strong><span>Centros Operativos</span><em>Total zona</em></div></article>
   <article class="mxe-kpi red">${icon('warning')}<div><strong>${d.open}</strong><span>Fallas abiertas</span><em>Histórico</em></div></article>
   <article class="mxe-kpi blue">${icon('doc')}<div><strong>${d.req.length}</strong><span>Solicitudes</span><em>Total histórico</em></div></article>
   <article class="mxe-kpi teal">${icon('wrench')}<div><strong>${d.rec.works.length}</strong><span>Trabajos realizados</span><em>Total histórico</em></div></article>
   <article class="mxe-kpi amber">${icon('gear')}<div><strong>${d.venc}</strong><span>Equipos vencidos</span><em>Estado actual</em></div></article>
   <article class="mxe-kpi red2">${icon('alert')}<div><strong>${d.pending}</strong><span>Pendientes críticos</span><em>Estado actual</em></div></article>
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
function installStyles(){if($('mxeZonesTotalV32Styles'))return;const s=document.createElement('style');s.id='mxeZonesTotalV32Styles';s.textContent=`
.mxe-total-filter{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px;border:1px solid #0d6382;border-radius:9px;background:linear-gradient(180deg,#063149,#02263a);padding:7px 8px;color:#e8f7ff;min-width:0}.mxe-total-filter>span{display:grid;grid-template-columns:auto 1fr;gap:6px;align-items:center}.mxe-total-filter .mxe-ico{color:#27c9f4;width:22px;height:22px}.mxe-total-filter small{font-size:9px;color:#a8bfd0;font-weight:700}.mxe-total-filter strong{font-size:11px;color:#f6fbff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mxe-zone-arrow{font-size:17px;color:#d8edf8;line-height:1}.mxe-kpi em{display:block;margin-top:5px;font-size:8px;font-style:normal;color:#8facbc;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
`;document.head.appendChild(s);}
function go(id){if(typeof window.switchTab==='function')window.switchTab(id);}
function bind(){const z=$('mxeZoneArea'),menu=$('mxeMenu'),mb=$('mxeMenuBtn');if(z)z.onchange=()=>{const h=$('summary');h.dataset.mxeArea=z.value;render();};if(mb&&menu)mb.onclick=()=>{menu.hidden=!menu.hidden;};if(menu)menu.onclick=e=>{const b=e.target.closest('[data-go]');if(!b)return;menu.hidden=true;go(b.dataset.go);};}
function render(){const host=$('summary');if(!host)return;const zone=host.dataset.mxeArea||'Todas las zonas';host.innerHTML=dashboardHtml(zone);bind();document.body.classList.add('mxe-home','mxe-ready');}
function installHooks(){if(window.__mxeZonesTotalV32)return;window.__mxeZonesTotalV32=true;window.renderSummary=render;if(typeof window.renderAll==='function'){const old=window.renderAll;window.renderAll=function(){const r=old();setTimeout(render,80);return r;};}if(typeof window.switchTab==='function'){const old=window.switchTab;window.switchTab=function(id){const r=old(id);setTimeout(()=>{if(id==='summary')render();},45);return r;};}}
function start(){installStyles();let n=0;const t=setInterval(()=>{n++;if(typeof data!=='undefined'&&$('summary')&&document.getElementById('mxeV29Styles')){installHooks();render();clearInterval(t);}else if(n>180){installHooks();render();clearInterval(t);}},100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
