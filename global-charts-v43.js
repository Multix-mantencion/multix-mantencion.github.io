// MultiX v43 — gráficos del Inicio siempre globales, independientes del filtro de zona
(function(){
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const COLORS=['#ff5d66','#38a9ff','#35d5aa','#ffc34e','#a968ed','#2cc6e8','#7bd389','#ff8fa3','#59e7df','#ff9b6a'];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function centers(){return Object.keys((typeof data!=='undefined'&&data?.centers)||{});}
function snapshots(){return [data,...(Array.isArray(data?.history)?data.history:[])];}
function records(){
 const wm=new Map(),fm=new Map();
 snapshots().forEach(s=>centers().forEach(center=>{
  const c=s?.centers?.[center];if(!c)return;
  (c.workLog||[]).forEach((w,i)=>{const k=w.id||`w|${center}|${w.date||''}|${w.text||''}|${w.equipmentName||''}|${i}`;if(!wm.has(k))wm.set(k,{...w,center});});
  (c.failureLog||[]).forEach((f,i)=>{const k=f.id||`f|${center}|${f.date||''}|${f.description||''}|${f.equipmentName||''}|${i}`;if(!fm.has(k))fm.set(k,{...f,center});});
 }));
 return{works:[...wm.values()],failures:[...fm.values()]};
}
function family(name){const n=norm(name||'General');if(n.includes('gener'))return'Generadores';if(n.includes('bomba'))return'Bombas';if(n.includes('compres'))return'Compresores';if(n.includes('tablero'))return'Tableros eléctricos';if(n.includes('doser'))return'Doser';if(n.includes('select'))return'Selectoras';if(n.includes('osmosis'))return'Planta de Ósmosis';if(n.includes('tratamiento'))return'Planta de Tratamiento';if(n.includes('bote')||n.includes('robalo')||n.includes('camargo')||n.includes('bonita'))return'Botes / FB';return String(name||'General');}
function donut(rows,total){if(!total)return'#153444';let cur=0;return`conic-gradient(${rows.map((r,i)=>{const a=cur/total*360;cur+=r.n;const b=cur/total*360;return`${COLORS[i%COLORS.length]} ${a}deg ${b}deg`;}).join(',')})`;}
function build(){
 const rec=records(),names=centers();
 const centerCounts=names.map(name=>({name,n:rec.failures.filter(f=>f.center===name).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
 const fam={};rec.failures.forEach(f=>{const k=family(f.equipmentName);fam[k]=(fam[k]||0)+1;});
 const equipRank=Object.entries(fam).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n).slice(0,6);
 const workRows=names.map(name=>{const list=rec.works.filter(w=>w.center===name);return{name,c:list.filter(w=>w.maintenanceType==='Correctivo').length,p:list.filter(w=>w.maintenanceType==='Preventivo').length,d:list.filter(w=>w.maintenanceType==='Predictivo').length,total:list.length};}).filter(r=>r.total>0);
 return{centerCounts,equipRank,workRows};
}
function patch(){
 const summary=document.getElementById('summary'),shell=summary?.querySelector('.mxe-shell');
 if(!summary||!shell||shell.dataset.mxGlobalCharts==='1')return;
 const d=build(),totalF=d.centerCounts.reduce((a,b)=>a+b.n,0),maxEq=Math.max(1,...d.equipRank.map(x=>x.n)),maxWork=Math.max(1,...d.workRows.map(x=>x.total));
 const panels=summary.querySelectorAll('.mxe-chart-pair .mxe-panel');
 const failPanel=panels[0],rankPanel=panels[1],workPanel=summary.querySelector('.mxe-work-panel');
 if(failPanel){
  const total=failPanel.querySelector('.mxe-panel-title span');if(total)total.textContent='Total: '+totalF;
  const oldDonut=failPanel.querySelector('.mxe-donut'),oldLegend=failPanel.querySelector('.mxe-legend'),oldEmpty=failPanel.querySelector('.mxe-empty');
  if(totalF){
   if(oldEmpty)oldEmpty.remove();
   let dn=oldDonut;if(!dn){dn=document.createElement('div');dn.className='mxe-donut';dn.innerHTML='<div><span></span><small>Fallas</small></div>';failPanel.appendChild(dn);}dn.style.background=donut(d.centerCounts,totalF);const num=dn.querySelector('div');if(num)num.innerHTML=`${totalF}<small>Fallas</small>`;
   let lg=oldLegend;if(!lg){lg=document.createElement('div');lg.className='mxe-legend';failPanel.appendChild(lg);}lg.innerHTML=d.centerCounts.map((r,i)=>`<div><i style="background:${COLORS[i%COLORS.length]}"></i><span>${esc(r.name)}</span><b>${r.n}</b></div>`).join('');
  }else{if(oldDonut)oldDonut.remove();if(oldLegend)oldLegend.remove();if(!oldEmpty){const e=document.createElement('div');e.className='mxe-empty';e.textContent='Sin fallas registradas';failPanel.appendChild(e);}}
 }
 if(rankPanel){
  let rank=rankPanel.querySelector('.mxe-rank'),empty=rankPanel.querySelector('.mxe-empty');
  if(d.equipRank.length){if(empty)empty.remove();if(!rank){rank=document.createElement('div');rank.className='mxe-rank';rankPanel.appendChild(rank);}rank.innerHTML=d.equipRank.map((r,i)=>`<div class="mxe-rank-row"><span class="mxe-rank-icon">●</span><div><div class="mxe-rank-name"><span>${esc(r.name)}</span><b>${r.n}</b></div><div class="mxe-track"><i style="width:${Math.max(12,r.n/maxEq*100)}%;background:${COLORS[i%COLORS.length]}"></i></div></div></div>`).join('');}
  else{if(rank)rank.remove();if(!empty){empty=document.createElement('div');empty.className='mxe-empty';empty.textContent='Sin datos todavía';rankPanel.appendChild(empty);}}
 }
 if(workPanel){
  let chart=workPanel.querySelector('.mxe-vchart'),empty=workPanel.querySelector('.mxe-empty');
  if(d.workRows.length){if(empty)empty.remove();if(!chart){chart=document.createElement('div');chart.className='mxe-vchart';workPanel.appendChild(chart);}chart.innerHTML=d.workRows.map(r=>{const hc=r.c/maxWork*100,hp=r.p/maxWork*100,hd=r.d/maxWork*100;return`<div class="mxe-barcol"><b>${r.total}</b><div class="mxe-bar"><i class="d" style="height:${hd}%">${r.d||''}</i><i class="p" style="height:${hp}%">${r.p||''}</i><i class="c" style="height:${hc}%">${r.c||''}</i></div><span>${esc(r.name)}</span></div>`;}).join('');}
  else{if(chart)chart.remove();if(!empty){empty=document.createElement('div');empty.className='mxe-empty';empty.textContent='Los trabajos clasificados aparecerán aquí.';workPanel.appendChild(empty);}}
 }
 shell.dataset.mxGlobalCharts='1';
}
function schedule(){setTimeout(patch,30);setTimeout(patch,120);}
const obs=new MutationObserver(schedule);
function start(){const summary=document.getElementById('summary');if(!summary)return setTimeout(start,100);obs.observe(summary,{childList:true,subtree:true});summary.addEventListener('change',e=>{if(e.target?.id==='mxeZoneArea')schedule();},true);schedule();window.mxRefreshGlobalChartsV43=schedule;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();