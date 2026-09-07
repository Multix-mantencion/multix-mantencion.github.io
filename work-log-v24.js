// MultiX v24.2 — trabajos clasificados + fallas con solución documentada
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const attr=v=>esc(v).replace(/`/g,'&#096;');
  const today=()=>new Date().toISOString().slice(0,10);
  const fmtDate=v=>{if(!v)return 'Sin fecha';const p=String(v).split('-');return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(v);};
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};
  const workTypes=['Correctivo','Preventivo','Predictivo'];
  const failureTypes=['Mecánica','Eléctrica','Control / Señal','Hidráulica','Neumática','Operacional','Otro'];
  const failureStates=['Abierta','En proceso','Solucionado'];

  function normalizeFailureState(v){const s=String(v||'').toLowerCase();if(s.includes('resuelt')||s.includes('solucion')||s.includes('cerrad'))return'Solucionado';if(s.includes('proceso'))return'En proceso';return'Abierta';}
  function ensure(c){
    if(!c)return {workLog:[],failureLog:[]};
    if(!Array.isArray(c.workLog)){
      c.workLog=[];
      const old=String(c.works||'').trim();
      if(old)c.workLog.push({id:'legacy-'+Date.now(),date:'',text:old,mechanic:'',maintenanceType:'Sin clasificar',equipmentName:'General',failureId:''});
    }
    c.workLog.forEach(w=>{if(!w.maintenanceType)w.maintenanceType='Sin clasificar';if(!w.equipmentName)w.equipmentName='General';if(w.failureId===undefined)w.failureId='';});
    if(!Array.isArray(c.failureLog))c.failureLog=[];
    c.failureLog.forEach(f=>{f.status=normalizeFailureState(f.status);});
    return {workLog:c.workLog,failureLog:c.failureLog};
  }
  function equipmentNames(c){const out=['General'];(c?.equipment||[]).forEach(e=>{const n=String(e?.name||e?.type||'').trim();if(n&&!out.includes(n))out.push(n);});['Planta de Ósmosis','Planta de Tratamiento','Sistema de Alimentación','Caseta de Ensilaje'].forEach(n=>{if(!out.includes(n))out.push(n);});return out;}
  function optionList(values,selected,placeholder){return (placeholder?`<option value="">${esc(placeholder)}</option>`:'')+values.map(v=>`<option value="${attr(v)}"${v===selected?' selected':''}>${esc(v)}</option>`).join('');}
  function equipmentOptions(c,selected){return optionList(equipmentNames(c),selected||'General','Seleccionar equipo / componente');}
  function failureLabel(f){return `${fmtDate(f.date)} · ${f.equipmentName||'General'} · ${f.description||f.failureType||'Falla'}`;}
  function failureOptions(c,selected){const list=ensure(c).failureLog;return `<option value="">Sin falla asociada</option>`+list.map(f=>`<option value="${attr(f.id)}"${f.id===selected?' selected':''}>${esc(failureLabel(f))}</option>`).join('');}
  function syncWorks(c){
    const {workLog,failureLog}=ensure(c);
    c.works=workLog.map(w=>{const f=failureLog.find(x=>x.id===w.failureId);const parts=[fmtDate(w.date),w.maintenanceType||'Sin clasificar',w.equipmentName||'General',String(w.text||'').trim()];if(String(w.mechanic||'').trim())parts.push('Mecánico: '+String(w.mechanic).trim());if(f)parts.push('Falla asociada: '+String(f.description||f.failureType||'').trim());return parts.filter(Boolean).join(' — ');}).join('\n');
    const ta=$('cWorks');if(ta&&currentCenter&&data?.centers?.[currentCenter]===c)ta.value=c.works;
  }
  function installStyles(){
    if($('mxMaintenanceV24Styles'))return;
    const s=document.createElement('style');s.id='mxMaintenanceV24Styles';s.textContent=`
      .mx-maint-box{margin-top:8px}.mx-section-title{font-weight:950;font-size:15px;letter-spacing:.04em;text-transform:uppercase;color:var(--teal);margin:12px 0 8px}
      .mx-work-list,.mx-failure-list{display:grid;gap:8px;margin-bottom:10px}.mx-empty{color:var(--muted);font-style:italic;padding:5px 2px 9px}
      .mx-work-item,.mx-failure-item{background:#0a1924;border:1px solid var(--line);border-radius:12px;padding:11px}
      .mx-work-top,.mx-failure-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px}.mx-date{font-weight:900;color:var(--teal);font-size:12px}
      .mx-badge{border:1px solid #315164;background:#0d2230;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:850;color:#dbe8ef}.mx-badge.correctivo{border-color:#743a43;color:#ffacb5}.mx-badge.preventivo{border-color:#305b70;color:#9edcff}.mx-badge.predictivo{border-color:#355d4b;color:#9ee6c1}
      .mx-work-text,.mx-failure-desc{font-size:14px;color:var(--text);line-height:1.35}.mx-muted{font-size:12px;color:var(--muted);margin-top:5px}
      .mx-del{border:1px solid #6d343d;background:#351d25;color:#ff9b9b;border-radius:8px;padding:7px 9px;font-weight:800;cursor:pointer;margin-left:auto}
      .mx-form{display:grid;grid-template-columns:145px 1fr 180px 1.4fr;gap:8px;align-items:end}.mx-form .field{margin:0}.mx-form input,.mx-form select{width:100%;box-sizing:border-box}
      .mx-span2{grid-column:span 2}.mx-add{height:44px;border:0;border-radius:10px;background:#193245;color:#eef9fa;font-weight:900;padding:0 18px;cursor:pointer}
      .mx-help{font-size:11px;color:var(--muted);margin:7px 0 16px;line-height:1.4}.mx-divider{border-top:1px solid var(--line);margin:18px 0 12px}
      .mx-failure-state{min-width:125px;border-radius:8px;padding:7px 8px;font-weight:850}.mx-failure-state.state-open{background:#402029;border:1px solid #743a43;color:#ff9da7}.mx-failure-state.state-process{background:#3e3218;border:1px solid #755d25;color:#ffd36d}.mx-failure-state.state-solved{background:#17392c;border:1px solid #2d6950;color:#9de0be}
      .mx-failure-resolution{margin-top:9px;padding:10px 11px;border-radius:10px;border:1px solid #2c694f;background:#102d23;color:#c7edd9;font-size:12px;line-height:1.45}.mx-failure-resolution b{color:#8de0b5}.mx-failure-resolution small{display:block;margin-top:5px;color:#86aa98}
      .mx-corp-card{border:1px solid #284454;border-radius:16px;padding:14px;margin:10px 0 14px;background:linear-gradient(180deg,#0b1c28,#091821)}
      .mx-corp-card.records{border-color:#294555}.mx-corp-card.entry{border-color:#2e8f91;box-shadow:inset 0 0 0 1px rgba(74,211,203,.08)}
      .mx-corp-card.failure-entry{border-color:#8b3b48}.mx-corp-card.failure-records{border-color:#603841}
      .mx-card-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:12px}.mx-card-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:#0d3140;color:#5ce0d4;font-weight:950;flex:0 0 auto}
      .mx-card-head b{display:block;font-size:16px;color:var(--text)}.mx-card-head small{display:block;color:var(--muted);font-size:11px;margin-top:3px;line-height:1.35}.failure-entry .mx-card-icon,.failure-records .mx-card-icon{background:#351d25;color:#ff8b97}
      .mx-corp-card .mx-help{margin:9px 1px 0}.mx-corp-card .mx-work-list,.mx-corp-card .mx-failure-list{margin-bottom:0}
      @media(max-width:980px){.mx-form{grid-template-columns:1fr 1fr}.mx-span2{grid-column:span 2}.mx-add{grid-column:1/-1}}
      @media(max-width:620px){.mx-form{grid-template-columns:1fr}.mx-span2,.mx-add{grid-column:1}.mx-add{height:48px}.mx-del{margin-left:0}.mx-work-top,.mx-failure-top{align-items:flex-start}.mx-failure-state{width:100%}}
    `;document.head.appendChild(s);
  }
  function installUI(){
    const ta=$('cWorks');if(!ta)return false;ta.style.display='none';let box=$('mxMaintenanceV24');if(box)return true;const old=$('mxWorkLogV23');if(old)old.remove();box=document.createElement('div');box.id='mxMaintenanceV24';box.className='mx-maint-box';box.innerHTML=`
      <div class="mx-section-title">Trabajos realizados</div>
      <section class="mx-corp-card records"><div class="mx-card-head"><span class="mx-card-icon">✓</span><div><b>Trabajos registrados</b><small>Trabajos ya guardados para este centro durante la semana.</small></div></div><div id="mxWorkListV24" class="mx-work-list"></div></section>
      <section class="mx-corp-card entry"><div class="mx-card-head"><span class="mx-card-icon">＋</span><div><b>Agregar nuevo trabajo</b><small>Completa los campos para crear un registro nuevo. No modifica los trabajos guardados.</small></div></div><div class="mx-form">
          <div class="field"><label>Fecha</label><input id="mxWorkDateV24" type="date"></div><div class="field"><label>Equipo / componente</label><select id="mxWorkEquipmentV24"></select></div><div class="field"><label>Tipo de mantenimiento</label><select id="mxWorkTypeV24">${optionList(workTypes,'Correctivo')}</select></div><div class="field"><label>Relacionado con una falla</label><select id="mxWorkFailureV24"></select></div><div class="field mx-span2"><label>Trabajo realizado</label><input id="mxWorkTextV24" placeholder="Ej: Cambio sensor de temperatura"></div><div class="field"><label>Mecánico</label><input id="mxWorkMechanicV24" placeholder="Nombre"></div><button type="button" id="mxWorkAddV24" class="mx-add">Guardar trabajo</button>
        </div><div class="mx-help">Clasificar cada trabajo permitirá medir correctamente el mantenimiento correctivo, preventivo y predictivo.</div></section>
      <div class="mx-divider"></div><div class="mx-section-title">Fallas</div>
      <section class="mx-corp-card records failure-records"><div class="mx-card-head"><span class="mx-card-icon">!</span><div><b>Fallas registradas</b><small>Historial de fallas reportadas para este centro.</small></div></div><div id="mxFailureListV24" class="mx-failure-list"></div></section>
      <section class="mx-corp-card entry failure-entry"><div class="mx-card-head"><span class="mx-card-icon">＋</span><div><b>Registrar nueva falla</b><small>Cada falla se registra una sola vez y luego puede vincularse a uno o más trabajos.</small></div></div><div class="mx-form">
          <div class="field"><label>Fecha</label><input id="mxFailureDateV24" type="date"></div><div class="field"><label>Equipo / componente</label><select id="mxFailureEquipmentV24"></select></div><div class="field"><label>Tipo de falla</label><select id="mxFailureTypeV24">${optionList(failureTypes,'Mecánica')}</select></div><div class="field"><label>Estado</label><select id="mxFailureStateV24">${optionList(failureStates,'Abierta')}</select></div><div class="field mx-span2"><label>Descripción de la falla</label><input id="mxFailureTextV24" placeholder="Ej: Baja presión de aceite"></div><button type="button" id="mxFailureAddV24" class="mx-add">Registrar falla</button>
        </div><div class="mx-help">Una falla se cuenta una sola vez aunque tenga varios trabajos asociados.</div></section>`;
    ta.parentNode.insertBefore(box,ta.nextSibling);$('mxWorkAddV24').onclick=addWork;$('mxFailureAddV24').onclick=addFailure;return true;
  }
  function stateClass(v){const s=normalizeFailureState(v);return s==='Solucionado'?'state-solved':s==='En proceso'?'state-process':'state-open';}
  function render(){
    if(!currentCenter||!data?.centers?.[currentCenter]||!$('mxMaintenanceV24'))return;
    const c=data.centers[currentCenter],{workLog,failureLog}=ensure(c);syncWorks(c);
    const eqW=$('mxWorkEquipmentV24'),eqF=$('mxFailureEquipmentV24'),rel=$('mxWorkFailureV24');if(eqW)eqW.innerHTML=equipmentOptions(c,eqW.value||'');if(eqF)eqF.innerHTML=equipmentOptions(c,eqF.value||'');if(rel)rel.innerHTML=failureOptions(c,rel.value||'');
    const d1=$('mxWorkDateV24'),d2=$('mxFailureDateV24'),m=$('mxWorkMechanicV24');if(d1&&!d1.value)d1.value=today();if(d2&&!d2.value)d2.value=today();if(m&&!m.value)m.value=String(data?.meta?.mechanic||'');
    $('mxWorkListV24').innerHTML=workLog.length?workLog.map((w,i)=>{const f=failureLog.find(x=>x.id===w.failureId),cls=String(w.maintenanceType||'').toLowerCase();return `<div class="mx-work-item"><div class="mx-work-top"><span class="mx-date">${esc(fmtDate(w.date))}</span><span class="mx-badge ${esc(cls)}">${esc(w.maintenanceType||'Sin clasificar')}</span><span class="mx-badge">${esc(w.equipmentName||'General')}</span><button type="button" class="mx-del" onclick="mxDeleteWorkV24(${i})">Eliminar</button></div><div class="mx-work-text">${esc(w.text||'')}</div><div class="mx-muted">${w.mechanic?'Mecánico: '+esc(w.mechanic):''}${f?`${w.mechanic?' · ':''}Falla asociada: ${esc(f.description||f.failureType||'')}`:''}</div></div>`;}).join(''):'<div class="mx-empty">Sin trabajos registrados esta semana.</div>';
    $('mxFailureListV24').innerHTML=failureLog.length?failureLog.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).map(f=>{const realIndex=failureLog.findIndex(x=>x.id===f.id),state=normalizeFailureState(f.status),resolution=f.resolution?`<div class="mx-failure-resolution"><b>Solución registrada</b>${esc(f.resolution)}<small>${f.resolvedDate?'Fecha: '+esc(fmtDate(f.resolvedDate)):''}${f.resolvedBy?`${f.resolvedDate?' · ':''}Responsable: ${esc(f.resolvedBy)}`:''}</small></div>`:'';return `<div class="mx-failure-item"><div class="mx-failure-top"><span class="mx-date">${esc(fmtDate(f.date))}</span><span class="mx-badge">${esc(f.equipmentName||'General')}</span><span class="mx-badge">${esc(f.failureType||'Otro')}</span><select class="mx-failure-state ${stateClass(state)}" onchange="mxFailureStateChangedV24(${realIndex},this.value)">${optionList(failureStates,state)}</select><button type="button" class="mx-del" onclick="mxDeleteFailureV24(${realIndex})">Eliminar</button></div><div class="mx-failure-desc">${esc(f.description||'')}</div>${resolution}</div>`;}).join(''):'<div class="mx-empty">Sin fallas registradas.</div>';
  }
  window.mxRefreshMaintenanceV24=render;
  function addWork(){const c=data?.centers?.[currentCenter];if(!c)return;const text=String($('mxWorkTextV24')?.value||'').trim();if(!text){alert('Escribe el trabajo realizado antes de guardar.');return;}const {workLog}=ensure(c);workLog.push({id:'work-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),date:$('mxWorkDateV24')?.value||today(),equipmentName:$('mxWorkEquipmentV24')?.value||'General',maintenanceType:$('mxWorkTypeV24')?.value||'Correctivo',failureId:$('mxWorkFailureV24')?.value||'',text,mechanic:String($('mxWorkMechanicV24')?.value||'').trim()});syncWorks(c);persist();$('mxWorkTextV24').value='';render();if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();}
  function addFailure(){const c=data?.centers?.[currentCenter];if(!c)return;const description=String($('mxFailureTextV24')?.value||'').trim();if(!description){alert('Describe la falla antes de guardarla.');return;}const {failureLog}=ensure(c);failureLog.push({id:'failure-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),date:$('mxFailureDateV24')?.value||today(),equipmentName:$('mxFailureEquipmentV24')?.value||'General',failureType:$('mxFailureTypeV24')?.value||'Otro',description,status:$('mxFailureStateV24')?.value||'Abierta',statusUpdatedDate:today()});persist();$('mxFailureTextV24').value='';render();if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();}
  window.mxDeleteWorkV24=function(i){const c=data?.centers?.[currentCenter],list=ensure(c).workLog;if(!list?.[i])return;if(!confirm('¿Eliminar este trabajo realizado?'))return;list.splice(i,1);syncWorks(c);persist();render();};
  window.mxDeleteFailureV24=function(i){const c=data?.centers?.[currentCenter],ctx=ensure(c),f=ctx.failureLog?.[i];if(!f)return;const linked=ctx.workLog.filter(w=>w.failureId===f.id).length;if(!confirm(linked?`Esta falla tiene ${linked} trabajo(s) asociado(s). ¿Eliminarla igualmente?`:'¿Eliminar esta falla?'))return;ctx.workLog.forEach(w=>{if(w.failureId===f.id)w.failureId='';});ctx.failureLog.splice(i,1);syncWorks(c);persist();render();};
  window.mxFailureStateChangedV24=function(i,value){
    const c=data?.centers?.[currentCenter],f=ensure(c).failureLog?.[i];if(!f)return;
    if(value==='Solucionado'){
      if(typeof window.mxRequestFailureResolution==='function'){window.mxRequestFailureResolution(currentCenter,f,{onCancel:render,onSaved:()=>{syncWorks(c);persist();render();}});}
      else{const text=prompt('Describe cómo se solucionó la falla:','');if(!String(text||'').trim()){render();return;}f.status='Solucionado';f.resolution=String(text).trim();f.resolvedDate=today();f.resolvedBy=String(data?.meta?.mechanic||'').trim();f.statusUpdatedDate=today();persist();render();}
      return;
    }
    f.status=value;f.statusUpdatedDate=today();persist();if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();render();
  };
  function installHooks(){
    if(window.__mxMaintenanceHooksV24)return;window.__mxMaintenanceHooksV24=true;
    if(typeof window.openCenter==='function'){const oldOpen=window.openCenter;window.openCenter=function(name){const r=oldOpen(name);setTimeout(()=>{ensure(data.centers[name]);render();},50);return r;};}
    if(typeof window.saveCurrentCenter==='function'){const oldSave=window.saveCurrentCenter;window.saveCurrentCenter=function(){if(currentCenter&&data?.centers?.[currentCenter])syncWorks(data.centers[currentCenter]);return oldSave();};const btn=$('saveCenter');if(btn)btn.onclick=window.saveCurrentCenter;}
    if(typeof window.newWeekly==='function'){const oldNew=window.newWeekly;window.newWeekly=function(){const savedFailures={};Object.entries(data?.centers||{}).forEach(([n,c])=>savedFailures[n]=JSON.parse(JSON.stringify(ensure(c).failureLog)));const r=oldNew();Object.entries(data?.centers||{}).forEach(([n,c])=>{c.workLog=[];c.works='';c.failureLog=savedFailures[n]||[];});persist();return r;};}
  }
  function start(){installStyles();let n=0;const t=setInterval(()=>{n++;if(typeof data!=='undefined'&&installUI()&&typeof window.openCenter==='function'){Object.values(data.centers||{}).forEach(c=>ensure(c));installHooks();persist();if(currentCenter&&$('editor')?.classList.contains('open'))render();clearInterval(t);}else if(n>100)clearInterval(t);},100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(function(){if(document.getElementById('mxCorporateUiV25Loader'))return;const s=document.createElement('script');s.id='mxCorporateUiV25Loader';s.src='corporate-ui-v25.js?v=25';s.async=false;s.onerror=()=>console.error('No se pudo cargar la interfaz corporativa v25');document.body.appendChild(s);})();