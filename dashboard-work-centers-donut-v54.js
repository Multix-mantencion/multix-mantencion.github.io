// MultiX v54 — gráfico circular de trabajos históricos por centro
(function(){
'use strict';
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
const ORDER=['Ganso','Puyuhuapi 2','Puyuhuapi 1','Pearson','Delta','Arbolito','Camargo','Yelen','Refugio','Yalac','Yalak'];
const COLORS=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8','#7bd389','#ff8fa3','#59e7df','#ff9b6a'];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function appData(){try{if(typeof data!=='undefined')return data;}catch(_){}return window.data;}
function allCenters(){const d=appData();const raw=Object.keys(d?.centers||{}),out=[];ORDER.forEach(w=>{const hit=raw.find(r=>norm(r)===norm(w));if(hit&&!out.includes(hit))out.push(hit);});raw.forEach(r=>{if(!out.includes(r))out.push(r);});return out;}
function centersFor(zone){const all=allCenters();if(zone==='Área Refugio')return all.filter(n=>REFUGIO_SET.has(norm(n)));if(zone==='Área Puyuhuapi')return all.filter(n=>!REFUGIO_SET.has(norm(n)));return all;}
function snapshots(){const d=appData();return d?[d,...(Array.isArray(d.history)?d.history:[])]:[];}
function historicalWorks(zone){
 const centers=centersFor(zone),m=new Map();
 snapshots().forEach(s=>centers.forEach(center=>{
  const list=s?.centers?.[center]?.workLog||[];
  list.forEach((w,i)=>{const k=w.id||`w|${center}|${w.date||''}|${w.text||''}|${w.equipmentName||''}|${i}`;if(!m.has(k))m.set(k,{...w,center});});
 }));
 let req=[];try{req=JSON.parse(localStorage.getItem('multixMaintenanceRequirementsV1')||'[]');if(!Array.isArray(req))req=[];}catch(_){req=[];}
 req.filter(r=>norm(r?.status)==='realizado'&&centers.includes(r?.center)).forEach((r,i)=>{
  const already=[...m.values()].some(w=>(r.id&&(w.requirementId===r.id||w.id==='work-req-'+r.id)));
  if(already)return;
  const k=r.id?'req|'+r.id:`req|${r.center||''}|${r.completedDate||r.date||''}|${r.description||''}|${i}`;
  if(!m.has(k))m.set(k,{id:k,center:r.center,date:r.completedDate||r.date||'',maintenanceType:r.maintenanceType||'Preventivo',equipmentName:r.equipmentName||'General',text:r.completionText||r.description||'',autoRequirement:true});
 });
 return [...m.values()];
}
function gradient(rows,total){if(!total)return'#153444';let cur=0;return`conic-gradient(${rows.map((r,i)=>{const a=cur/total*360;cur+=r.n;const b=cur/total*360;return`${COLORS[i%COLORS.length]} ${a}deg ${b}deg`;}).join(',')})`;}
function apply(){
 const d=appData(),summary=document.getElementById('summary');if(!d||!summary)return;
 const panel=summary.querySelector('.mxe-chart-pair .mxe-panel');if(!panel)return;
 const zone=document.getElementById('mxeZoneArea')?.value||summary.dataset?.mxeArea||'Todas las zonas';
 const centers=centersFor(zone),works=historicalWorks(zone);
 const rows=centers.map(name=>({name,n:works.filter(w=>w.center===name).length})).filter(r=>r.n>0).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name,'es'));
 const total=rows.reduce((a,b)=>a+b.n,0),sig=zone+'|'+rows.map(r=>r.name+':'+r.n).join('|');
 if(panel.dataset.mxWorkDonutSig===sig)return;panel.dataset.mxWorkDonutSig=sig;
 panel.innerHTML=`<div class="mxe-panel-title"><b>Trabajos de mantención por centro</b><span>Total histórico: ${total}</span></div>${total?`<div class="mxe-donut" style="background:${gradient(rows,total)}"><div>${total}<small>Trabajos</small></div></div><div class="mxe-legend">${rows.map((r,i)=>`<div><i style="background:${COLORS[i%COLORS.length]}"></i><span>${esc(r.name)}</span><b>${r.n}</b></div>`).join('')}</div>`:'<div class="mxe-empty">Sin trabajos de mantención registrados</div>'}`;
}
function schedule(){clearTimeout(schedule._t);schedule._t=setTimeout(apply,70);}
function start(){apply();document.addEventListener('change',e=>{if(e.target?.id==='mxeZoneArea')setTimeout(apply,80);},true);document.addEventListener('click',e=>{if(e.target?.closest?.('#mxWorkAddV24,#mxReqCompleteSave'))setTimeout(apply,180);},true);const summary=document.getElementById('summary');if(summary&&!window.__mxWorkCentersDonutObserverV54){window.__mxWorkCentersDonutObserverV54=new MutationObserver(schedule);window.__mxWorkCentersDonutObserverV54.observe(summary,{childList:true,subtree:true});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
