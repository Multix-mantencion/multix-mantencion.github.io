// MultiX v9 — centros activos, plantas fijas y reporte solo con información semanal
(function(){
  'use strict';
  const ACTIVE=['Ganso','Puyuhuapi 2','Pearson','Arbolito','Delta'];
  const has=v=>String(v||'').trim().length>0;
  const norm=v=>String(v??'').trim();
  const clone=v=>JSON.parse(JSON.stringify(v));
  const names=()=>ACTIVE.filter(n=>data?.centers?.[n]);
  const eqKey=e=>String(e?.id||e?.reg||e?.name||'');
  const eqSnap=list=>(list||[]).map(e=>({key:eqKey(e),current:norm(e.current),last:norm(e.last)}));
  const reqIds=name=>(data.requests||[]).filter(r=>r.center===name).map(r=>String(r.id||'')).sort();
  function baseFor(name,c){return{equipment:eqSnap(c?.equipment),plants:clone(c?.plants||{}),feeding:clone(c?.feeding||{}),pending:norm(c?.pending),requestIds:reqIds(name)}}
  function eqChanged(list,old){const now=eqSnap(list),prev=old||[];if(now.length!==prev.length)return true;return now.some(n=>{const b=prev.find(x=>x.key===n.key);return !b||b.current!==n.current||b.last!==n.last;});}
  function changedFromFixed(name,c){const b=window.MULTIX_BASE?.equipment?.[name]||[];return eqChanged(c?.equipment,eqSnap(b));}
  function plantsHaveData(c){const p=c?.plants||{};return ['osmosis','treatment'].some(k=>has(p[k]?.detail)||(p[k]?.status&&p[k].status!=='Sin información'));}
  function feedingHasData(c){const f=c?.feeding||{};return has(f.notes)||['blower','selectors','dosers','screw','vfd'].some(k=>f[k]&&f[k]!=='Sin información');}
  function requestsChanged(name,old){const a=reqIds(name),b=(old||[]).slice().sort();return a.length!==b.length||a.some((x,i)=>x!==b[i]);}
  function meaningful(name,c){
    if(!ACTIVE.includes(name)||!c)return false;
    if(has(c.novelties)||has(c.works)||has(c.companies)||has(c.observations)||(c.photos||[]).length)return true;
    if(c.weekBaseline){
      if(norm(c.pending)!==norm(c.weekBaseline.pending))return true;
      if(eqChanged(c.equipment,c.weekBaseline.equipment))return true;
      if(JSON.stringify(c.plants||{})!==JSON.stringify(c.weekBaseline.plants||{}))return true;
      if(JSON.stringify(c.feeding||{})!==JSON.stringify(c.weekBaseline.feeding||{}))return true;
      if(requestsChanged(name,c.weekBaseline.requestIds))return true;
      return false;
    }
    if(has(c.pending)||changedFromFixed(name,c)||plantsHaveData(c)||feedingHasData(c))return true;
    return (data.requests||[]).some(r=>r.center===name&&String(r.id||'').startsWith('req-user-'));
  }
  window.MX_ACTIVE_CENTERS=ACTIVE.slice();
  window.mxMeaningfulCenter=meaningful;

  function blankCenter(){return{novelties:'',works:'',pending:'',companies:'',observations:'',equipment:[],plants:{osmosis:{status:'Sin información',detail:''},treatment:{status:'Sin información',detail:''}},feeding:{blower:'Sin información',selectors:'Sin información',dosers:'Sin información',screw:'Sin información',vfd:'Sin información',notes:''},photos:[]};}
  function filteredState(){
    const d=data,keep=new Set(names().filter(n=>meaningful(n,d.centers[n]))),centers={...d.centers};
    Object.keys(centers).forEach(n=>{if(!keep.has(n))centers[n]=blankCenter();});
    return {...d,centers};
  }
  async function withFiltered(fn){
    const original=data,stored=localStorage.getItem('multixMantencion');
    try{data=filteredState();return await fn();}
    finally{data=original;try{if(stored===null)localStorage.removeItem('multixMantencion');else localStorage.setItem('multixMantencion',stored);}catch(_){}}
  }
  function withFilteredSync(fn){
    const original=data,stored=localStorage.getItem('multixMantencion');
    try{data=filteredState();return fn();}
    finally{data=original;try{if(stored===null)localStorage.removeItem('multixMantencion');else localStorage.setItem('multixMantencion',stored);}catch(_){}}
  }

  function installDashboardRules(){
    if(window.__mxActiveDashInstalled)return;window.__mxActiveDashInstalled=true;
    calcStats=function(){let equipment=0,vencidos=0,generators=0,boats=0,motocomp=0;names().forEach(n=>{const c=data.centers[n];equipment+=(c.equipment||[]).length;(c.equipment||[]).forEach(e=>{if(typeof mxRecalcEquipment==='function')try{mxRecalcEquipment(e)}catch(_){};if(['Vencido','Inoperativo'].includes(e.status))vencidos++;const t=((e.type||'')+' '+(e.name||'')).toLowerCase();if(t.includes('gener'))generators++;if(t.includes('bote'))boats++;if(t.includes('moto'))motocomp++;});});const requests=(data.requests||[]).filter(r=>ACTIVE.includes(r.center)||r.center==='Área / Base Cisnes').length;return{centers:5,equipment,vencidos,generators,boats,motocomp,plants:10,requests};};
    renderStats=function(){const s=calcStats();stats.innerHTML=[['centros',s.centers],['equipos',s.equipment],['vencidos',s.vencidos,'warn'],['generadores',s.generators],['plantas',s.plants],['solicitudes',s.requests]].map(x=>`<div class="stat ${x[2]||''}"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');};
    renderCenters=function(){centerList.innerHTML=names().map(n=>{const c=data.centers[n],issues=typeof centerIssues==='function'?centerIssues(c):0,info=[`${(c.equipment||[]).length} equipos`,'2 plantas'];if(c.plants?.osmosis?.status!=='Sin información')info.push('Ósmosis '+c.plants.osmosis.status);if(c.plants?.treatment?.status!=='Sin información')info.push('Trat. aguas negras '+c.plants.treatment.status);return `<div class="center-card" onclick="openCenter('${n.replaceAll("'","\\'")}')"><h3>${n}</h3><div class="badges">${info.map(t=>`<span class="badge">${esc(t)}</span>`).join('')}${issues?`<span class="badge red">${issues} alerta${issues>1?'s':''}</span>`:'<span class="badge green">Sin alertas críticas</span>'}</div></div>`;}).join('');};
    renderSummary=function(){const a=[];names().forEach(n=>{const c=data.centers[n];if(c.novelties)a.push(`<div class="alert"><b>${esc(n)}</b> — ${esc(c.novelties)}</div>`)});summaryAlerts.innerHTML=a.length?a.join(''):'<div class="empty">Aún no hay novedades registradas.</div>';const att=[];names().forEach(n=>{const c=data.centers[n];(c.equipment||[]).forEach(e=>{if(typeof mxRecalcEquipment==='function')try{mxRecalcEquipment(e)}catch(_){};if(['Vencido','Inoperativo'].includes(e.status))att.push(`<div class="attention"><b>${esc(n)} — ${esc(e.name||e.type)}</b><div class="helper">${esc(e.status)} ${e.notes?'· '+esc(e.notes):''}</div></div>`)});Object.entries(c.plants||{}).forEach(([k,p])=>{if(p.status==='Inoperativa')att.push(`<div class="attention"><b>${esc(n)} — ${k==='osmosis'?'Planta de Ósmosis':'Planta de Tratamiento de Aguas Negras'}</b><div class="helper">${esc(p.detail||'')}</div></div>`)})});attentionList.innerHTML=att.length?att.join(''):'<div class="empty">No hay equipos marcados como vencidos o inoperativos.</div>';};
    renderFeeding=function(){feedingList.innerHTML=names().map(n=>{const f=data.centers[n].feeding||{},v=[['Blower',f.blower],['Selectoras',f.selectors],['Doser',f.dosers],['Tornillo',f.screw],['VFD',f.vfd]].filter(x=>x[1]&&x[1]!=='Sin información');if(!v.length&&!f.notes)return'';return `<div class="panel"><h2>${n}</h2><div class="badges">${v.map(x=>`<span class="badge ${x[1]==='Inoperativo'?'red':x[1]==='En observación'?'orange':'green'}">${x[0]}: ${x[1]}</span>`).join('')}</div>${f.notes?`<p class="helper">${esc(f.notes)}</p>`:''}</div>`}).join('')||'<div class="empty">Sin información de alimentación todavía.</div>';};
    renderRequests=function(){const rows=(data.requests||[]).map((r,i)=>({r,i})).filter(x=>ACTIVE.includes(x.r.center)||x.r.center==='Área / Base Cisnes');requestTable.innerHTML=rows.map(({r,i})=>`<tr><td>${esc(r.center)}</td><td>${esc(r.equipment)}</td><td>${esc(r.material)}${r.notes?`<div class="helper">${esc(r.notes)}</div>`:''}</td><td>${esc(r.requestedTo)}</td><td>${esc(r.date)}</td><td class="status ${esc(r.status)}">${esc(r.status)}</td><td><button class="btn small danger" onclick="delRequest(${i})">Eliminar</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Sin solicitudes</td></tr>';};
    if(typeof rCenter!=='undefined'&&rCenter){const selected=rCenter.value;rCenter.innerHTML='';[...ACTIVE,'Área / Base Cisnes'].forEach(n=>rCenter.add(new Option(n,n)));if([...rCenter.options].some(o=>o.value===selected))rCenter.value=selected;}
    const oldNew=newWeekly;newWeekly=function(){oldNew();names().forEach(n=>data.centers[n].weekBaseline=baseFor(n,data.centers[n]));data.meta=data.meta||{};data.meta.weekBaselineVersion=1;localStorage.setItem('multixMantencion',JSON.stringify(data));renderAll();};
    renderAll();
  }

  function installReportFilters(){
    if(window.__mxReportFilterInstalled)return;window.__mxReportFilterInstalled=true;
    const oldPdf=window.mxCreatePdfNative;
    const runPdf=()=>oldPdf?withFiltered(()=>oldPdf()):Promise.reject(new Error('Generador PDF no disponible'));
    window.mxCreatePdfNative=runPdf;
    window.addEventListener('click',e=>{const b=e.target?.closest?.('#pdfBtn');if(!b)return;e.preventDefault();e.stopImmediatePropagation();runPdf().catch(err=>alert(err.message));},true);
    const bind=()=>{
      const tab=document.getElementById('mxReportTab'),refresh=document.getElementById('mxRefreshReport'),create=document.getElementById('mxCreatePdfFromPreview');
      if(tab)tab.onclick=()=>{if(typeof switchTab==='function')switchTab('report');setTimeout(()=>withFilteredSync(()=>window.mxRenderReportPreview?.()),20);};
      if(refresh)refresh.onclick=()=>withFilteredSync(()=>window.mxRenderReportPreview?.());
      if(create)create.onclick=()=>runPdf().catch(err=>alert(err.message));
      const save=document.getElementById('saveBtn');if(save&&!save.dataset.mxFilteredPreview){save.dataset.mxFilteredPreview='1';save.addEventListener('click',()=>setTimeout(()=>{if(document.getElementById('report')?.classList.contains('active'))withFilteredSync(()=>window.mxRenderReportPreview?.());},220));}
    };
    bind();setTimeout(bind,500);
  }

  function wait(){let n=0;const t=setInterval(()=>{n++;if(typeof mxPersistDraft==='function'&&typeof window.mxCreatePdfNative==='function'&&document.getElementById('mxReportTab')){clearInterval(t);installDashboardRules();installReportFilters();}else if(n>80){clearInterval(t);installDashboardRules();installReportFilters();}},100);}
  window.addEventListener('load',wait);
})();
