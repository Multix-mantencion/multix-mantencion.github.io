// MultiX v6: horómetros automáticos + fotos asociadas a equipos/componentes

function mxInstallV6UI(){
  const help=document.querySelector('.equipment-help');
  if(help)help.innerHTML='<b>Actualiza el HORÓMETRO ACTUAL y el HORÓMETRO DE ÚLTIMA MANTENCIÓN.</b> La próxima mantención se calcula automáticamente para Generadores (250 h) y Motores Fuera de Borda (300 h).';
  const photoInputEl=document.getElementById('photoInput');
  if(photoInputEl && !document.getElementById('photoTarget')){
    const field=photoInputEl.closest('.field');
    if(field){
      field.insertAdjacentHTML('beforebegin',`<div class="photo-upload-panel" id="mxPhotoControls"><div class="field"><label>¿A qué equipo o componente corresponde?</label><select id="photoTarget"><option value="general">General del centro</option></select></div><div class="field"><label>Componente / detalle de la foto</label><input id="photoComponent" placeholder="Ej: mezclador, motor, tapa de registro, filtración"></div><div class="helper" style="grid-column:1/-1">Ejemplo: selecciona “Robalo”, escribe “Mezclador” y luego sube las fotos. En el informe aparecerán debajo del equipo Robalo.</div></div>`);
      const oldHelp=field.querySelector('.helper'); if(oldHelp)oldHelp.textContent='Las fotos se comprimen para ahorrar espacio. Primero indica a qué equipo o componente corresponden.';
    }
  }
  if(!document.getElementById('mxV6Styles')){
    const st=document.createElement('style');st.id='mxV6Styles';st.textContent=`
#addEquipment{display:none}.equipment-help{font-size:12px;color:var(--muted);margin:-3px 0 13px}.equipment-help b{color:var(--teal)}
.eq-card{background:#0a1924;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}.eq-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.eq-name{font-size:16px;font-weight:800}.eq-type{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-top:3px}.eq-status{font-size:11px;font-weight:800;padding:5px 8px;border-radius:999px;background:#17352f;color:#a9e5d5;white-space:nowrap}.eq-status.Vencido,.eq-status.Inoperativo{background:#4a2025;color:#ffb9bc}.eq-status.Próximo{background:#4a3514;color:#ffd995}.eq-hours-grid{display:grid;grid-template-columns:1.2fr 1.2fr 1fr 1.1fr;gap:10px}.eq-field,.eq-info{display:flex;flex-direction:column;gap:5px}.eq-field span,.eq-info span,.eq-notes span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.65px;font-weight:700}.eq-field input{width:100%;background:#0d2230;border:1px solid var(--teal);color:var(--text);padding:12px;border-radius:9px;font-size:17px;font-weight:800;outline:none}.eq-field small,.eq-info small{font-size:10px;color:var(--teal)}.eq-info{background:#0d1d29;border:1px solid var(--line);border-radius:9px;padding:10px}.eq-info strong{font-size:14px;word-break:break-word}.eq-notes{margin-top:10px;border-top:1px solid var(--line);padding-top:10px;font-size:12px;color:#c9d6dd;line-height:1.4}.eq-notes span{display:block;margin-bottom:4px}
.photo-upload-panel{background:#0a1924;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.photo-linked{background:#0a1924;border:1px solid var(--line);border-radius:12px;padding:8px}.photo-linked select,.photo-linked input{width:100%;margin-top:6px;background:#0d1d29;border:1px solid var(--line);border-radius:8px;color:var(--text);padding:8px;font-size:12px}.photo-meta{padding:7px 2px 2px;display:flex;flex-direction:column;gap:2px}.photo-meta b{font-size:12px;color:var(--teal)}.photo-meta span{font-size:11px;color:var(--muted)}
@media(max-width:760px){.eq-hours-grid{grid-template-columns:1fr 1fr}.eq-info:last-child{grid-column:1/-1}.photo-upload-panel{grid-template-columns:1fr}}
@media print{.pr-equipment{break-inside:avoid;margin-bottom:10px}.pr-photo-section{margin:7px 0 11px;break-inside:avoid}.pr-photo-section h4{font-size:9px;text-transform:uppercase;margin:0 0 5px;color:#0f7e90}.pr-photos figure{margin:0}.pr-photos figcaption{font-size:8px;margin-top:2px;color:#4f5a63}.pr-photos img{width:100%;max-height:170px;object-fit:cover}.pr-photos{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}}`;
    document.head.appendChild(st);
  }
}
function mxParseHours(v){
  const raw=String(v??'').trim();
  if(!raw||raw==='-') return null;
  const t=raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.');
  const n=Number(t); return Number.isFinite(n)?n:null;
}
function mxFormatHours(v){
  const n=mxParseHours(v); return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';
}
function mxIntervalFor(e){
  const t=((e.type||'')+' '+(e.name||'')).toLowerCase();
  if(t.includes('generador')) return 250;
  if(t.includes('bote fb')||t.includes('motor fuera de borda')||t.includes('fuera borda')) return 300;
  return null;
}
function mxRecalcEquipment(e){
  const interval=mxIntervalFor(e), last=mxParseHours(e.last), cur=mxParseHours(e.current);
  if(interval!==null && last!==null) e.next=String(last+interval);
  const next=mxParseHours(e.next);
  if(!['Inoperativo','En observación'].includes(e.status)){
    if(cur!==null&&next!==null){
      if(cur>=next)e.status='Vencido';
      else if(next-cur<=50)e.status='Próximo';
      else e.status='OK';
    }
  }
  return interval;
}
renderEqEditor=function(){
  const c=data.centers[currentCenter];
  equipmentEditor.innerHTML=c.equipment.map((e,i)=>{
    const interval=mxRecalcEquipment(e);
    const auto=interval!==null;
    return `<div class="eq-card" data-eq-index="${i}">
      <div class="eq-card-head"><div><div class="eq-name">${esc(e.name||e.type||'Equipo')}</div><div class="eq-type">${esc(e.type||'Equipo')}</div></div><span id="mx-status-${i}" class="eq-status ${esc(e.status||'OK')}">${esc(e.status||'OK')}</span></div>
      <div class="eq-hours-grid">
        <label class="eq-field eq-current"><span>HORÓMETRO ACTUAL</span><input id="mx-current-${i}" data-i="${i}" data-k="current" inputmode="decimal" value="${attr(e.current||'')}" placeholder="Ej: 13622" oninput="mxEqInputChanged(${i},'current',this.value)"><small>Horas actuales del equipo.</small></label>
        <label class="eq-field eq-last"><span>HORÓMETRO ÚLTIMA MANTENCIÓN</span><input id="mx-last-${i}" data-i="${i}" data-k="last" inputmode="decimal" value="${attr(e.last||'')}" placeholder="Ej: 13200" oninput="mxEqInputChanged(${i},'last',this.value)"><small>Hora en que se hizo la última mantención.</small></label>
        <div class="eq-info"><span>PRÓXIMA MANTENCIÓN</span><strong id="mx-next-${i}">${esc(mxFormatHours(e.next))}</strong><small>${auto?'Automática: cada '+interval+' h':'Sin intervalo automático definido'}</small></div>
        <div class="eq-info"><span>N° SERIE / REGISTRO</span><strong>${esc(e.reg||'Sin dato')}</strong></div>
      </div>
      ${e.notes?`<div class="eq-notes"><span>DETALLE DEL EQUIPO</span>${esc(e.notes)}</div>`:''}
    </div>`;
  }).join('')||'<div class="empty">Sin equipos registrados en este centro.</div>';
};
function mxEqInputChanged(i,key,value){
  const e=data.centers[currentCenter].equipment[i]; if(!e)return;
  e[key]=value.trim(); mxRecalcEquipment(e);
  const next=document.getElementById(`mx-next-${i}`), st=document.getElementById(`mx-status-${i}`);
  if(next)next.textContent=mxFormatHours(e.next);
  if(st){st.textContent=e.status||'OK';st.className='eq-status '+(e.status||'OK');}
}
collectEq=function(){
  document.querySelectorAll('#equipmentEditor input[data-i][data-k]').forEach(el=>{
    const i=+el.dataset.i,k=el.dataset.k,e=data.centers[currentCenter].equipment[i]; if(e)e[k]=el.value.trim();
  });
  data.centers[currentCenter].equipment.forEach(mxRecalcEquipment);
};

const MX_COMPONENT_TARGETS=[
  ['component:osmosis','Planta de Ósmosis'],['component:treatment','Planta de Tratamiento'],['component:feeding','Sistema de Alimentación'],['component:structure','Pontón / Estructura'],['component:habitability','Habitabilidad'],['component:alarms','Alarmas'],['component:other','Otro componente']
];
function mxEquipmentTargetKey(e,i){return 'equipment:'+(e.id||('idx-'+i));}
function mxPhotoTargetOptions(selected='general'){
  const c=data.centers[currentCenter]; const opts=[['general','General del centro']];
  c.equipment.forEach((e,i)=>opts.push([mxEquipmentTargetKey(e,i),e.name||e.type||('Equipo '+(i+1))]));
  opts.push(...MX_COMPONENT_TARGETS);
  return opts.map(([v,n])=>`<option value="${attr(v)}"${v===selected?' selected':''}>${esc(n)}</option>`).join('');
}
function mxPopulatePhotoTargets(){
  const sel=document.getElementById('photoTarget'); if(!sel||!currentCenter)return;
  const previous=sel.value||'general'; sel.innerHTML=mxPhotoTargetOptions(previous);
  if(![...sel.options].some(o=>o.value===previous))sel.value='general';
}
function mxTargetMeta(value){
  if(value.startsWith('equipment:')){
    const c=data.centers[currentCenter];
    const idx=c.equipment.findIndex((e,i)=>mxEquipmentTargetKey(e,i)===value), e=idx>=0?c.equipment[idx]:null;
    return {targetType:'equipment',targetId:e?.id||value.slice(10),targetKey:value,targetName:e?.name||e?.type||'Equipo'};
  }
  if(value.startsWith('component:')){
    const name=MX_COMPONENT_TARGETS.find(x=>x[0]===value)?.[1]||'Componente';
    return {targetType:'component',targetId:value.slice(10),targetKey:value,targetName:name};
  }
  return {targetType:'general',targetId:'',targetKey:'general',targetName:'General del centro'};
}
function mxPhotoSelectedValue(p,i){
  if(p.targetKey)return p.targetKey;
  if(p.targetType==='equipment'){
    const c=data.centers[currentCenter]; const idx=c.equipment.findIndex(e=>(p.targetId&&e.id===p.targetId)||(p.targetName&&e.name===p.targetName));
    if(idx>=0)return mxEquipmentTargetKey(c.equipment[idx],idx);
  }
  if(p.targetType==='component'&&p.targetId)return 'component:'+p.targetId;
  return 'general';
}
const mxOpenCenterBase=openCenter;
openCenter=function(name){mxInstallV6UI();mxOpenCenterBase(name);mxPopulatePhotoTargets();};
addPhotos=async function(files){
  const targetValue=document.getElementById('photoTarget')?.value||'general';
  const component=(document.getElementById('photoComponent')?.value||'').trim();
  const meta=mxTargetMeta(targetValue);
  for(const f of files){
    const dataUrl=await compressImage(f);
    data.centers[currentCenter].photos.push({name:f.name,data:dataUrl,...meta,component});
  }
  renderPhotos();
};
renderPhotos=function(){
  const c=data.centers[currentCenter];
  photoGrid.innerHTML=c.photos.map((p,i)=>{
    const val=mxPhotoSelectedValue(p,i); const label=p.targetName||'General del centro';
    return `<div class="photo photo-linked"><img src="${p.data}" alt="Foto"><button onclick="delPhoto(${i})">×</button>
      <div class="photo-meta"><b>${esc(label)}</b>${p.component?`<span>${esc(p.component)}</span>`:''}</div>
      <select onchange="mxUpdatePhotoTarget(${i},this.value)">${mxPhotoTargetOptions(val)}</select>
      <input value="${attr(p.component||'')}" placeholder="Componente / detalle" onchange="mxUpdatePhotoComponent(${i},this.value)">
    </div>`;
  }).join('')||'<div class="empty">Aún no hay fotografías para este centro.</div>';
};
function mxUpdatePhotoTarget(i,value){
  const p=data.centers[currentCenter].photos[i]; if(!p)return;
  Object.assign(p,mxTargetMeta(value)); localStorage.setItem('multixMantencion',JSON.stringify(data));renderPhotos();
}
function mxUpdatePhotoComponent(i,value){
  const p=data.centers[currentCenter].photos[i]; if(!p)return;
  p.component=value.trim();localStorage.setItem('multixMantencion',JSON.stringify(data));renderPhotos();
}

function mxPhotoMatchesEquipment(p,e,i){
  if(p.targetType!=='equipment')return false;
  const key=mxEquipmentTargetKey(e,i);
  return p.targetKey===key||(p.targetId&&e.id&&p.targetId===e.id)||(p.targetName&&p.targetName===(e.name||e.type));
}
function mxPrintPhotos(list,title){
  if(!list.length)return '';
  return `<div class="pr-photo-section"><h4>${esc(title)}</h4><div class="pr-photos">${list.map(p=>`<figure><img src="${p.data}"><figcaption>${esc(p.component||p.targetName||'')}</figcaption></figure>`).join('')}</div></div>`;
}
function mxPrText(title,text){return text?`<div class="pr-section"><h3>${esc(title)}</h3><p>${esc(text).replace(/\n/g,'<br>')}</p></div>`:'';}
buildPrint=function(){
  syncMeta();
  const root=document.getElementById('printReport'),logo=document.querySelector('.brand img')?.src||''; const parts=[];
  parts.push(`${logo?`<img class="pr-logo" src="${logo}">`:''}<h1 class="pr-title">INFORME TÉCNICO SEMANAL DE MANTENCIÓN</h1><div class="pr-sub">Área Mantención – ${esc(data.meta.zone||'')}</div><div class="pr-meta"><div><b>FECHA</b>${esc(data.meta.end||'')}</div><div><b>PERIODO</b>${esc(data.meta.start||'')} al ${esc(data.meta.end||'')}</div><div><b>ÁREA</b>${esc(data.meta.area||'Operaciones')}</div><div><b>MECÁNICO EN EL ÁREA</b>${esc(data.meta.mechanic||'')}</div></div>`);
  CENTER_NAMES.forEach((name,centerIdx)=>{
    const c=data.centers[name], photos=c.photos||[];
    const hasContent=c.novelties||c.works||c.pending||c.companies||c.observations||c.equipment.length||photos.length||c.plants.osmosis.status!=='Sin información'||c.plants.treatment.status!=='Sin información'||Object.values(c.feeding).some(v=>v&&v!=='Sin información');
    if(!hasContent)return;
    parts.push(`<div class="pr-center ${centerIdx?'page-break':''}"><h2>${esc(name.toUpperCase())}</h2>`);
    parts.push(mxPrText('Novedades',c.novelties),mxPrText('Trabajos realizados',c.works));
    if(c.equipment.length){
      parts.push('<div class="pr-section"><h3>Equipos</h3>');
      c.equipment.forEach((e,i)=>{
        mxRecalcEquipment(e);
        parts.push(`<div class="pr-equipment"><table class="pr-table"><thead><tr><th>Equipo</th><th>Actual</th><th>Últ. mant.</th><th>Próxima</th><th>Estado</th></tr></thead><tbody><tr><td><b>${esc(e.name||e.type)}</b>${e.reg?`<br><small>N° registro: ${esc(e.reg)}</small>`:''}${e.notes?`<br><small>${esc(e.notes)}</small>`:''}</td><td>${esc(mxFormatHours(e.current))}</td><td>${esc(mxFormatHours(e.last))}</td><td>${esc(mxFormatHours(e.next))}</td><td>${esc(e.status||'')}</td></tr></tbody></table>${mxPrintPhotos(photos.filter(p=>mxPhotoMatchesEquipment(p,e,i)),'Fotografías — '+(e.name||e.type||'Equipo'))}</div>`);
      });
      parts.push('</div>');
    }
    const osPhotos=photos.filter(p=>p.targetType==='component'&&p.targetId==='osmosis');
    const trPhotos=photos.filter(p=>p.targetType==='component'&&p.targetId==='treatment');
    const feedPhotos=photos.filter(p=>p.targetType==='component'&&p.targetId==='feeding');
    const plantLines=[];
    if(c.plants.treatment.status!=='Sin información')plantLines.push(`<b>Planta de Tratamiento:</b> ${esc(c.plants.treatment.status)}${c.plants.treatment.detail?' — '+esc(c.plants.treatment.detail):''}`);
    if(c.plants.osmosis.status!=='Sin información')plantLines.push(`<b>Planta de Ósmosis:</b> ${esc(c.plants.osmosis.status)}${c.plants.osmosis.detail?' — '+esc(c.plants.osmosis.detail):''}`);
    if(plantLines.length||osPhotos.length||trPhotos.length)parts.push(`<div class="pr-section"><h3>Plantas</h3>${plantLines.length?`<p>${plantLines.join('<br>')}</p>`:''}${mxPrintPhotos(trPhotos,'Fotografías — Planta de Tratamiento')}${mxPrintPhotos(osPhotos,'Fotografías — Planta de Ósmosis')}</div>`);
    const fv=[['Blower',c.feeding.blower],['Selectoras',c.feeding.selectors],['Doser',c.feeding.dosers],['Tornillo',c.feeding.screw],['Variadores',c.feeding.vfd]].filter(x=>x[1]&&x[1]!=='Sin información');
    if(fv.length||c.feeding.notes||feedPhotos.length)parts.push(`<div class="pr-section"><h3>Sistema de alimentación</h3>${fv.length||c.feeding.notes?`<p>${fv.map(x=>`${x[0]}: ${esc(x[1])}`).join(' · ')}${c.feeding.notes?'<br>'+esc(c.feeding.notes):''}</p>`:''}${mxPrintPhotos(feedPhotos,'Fotografías — Sistema de Alimentación')}</div>`);
    parts.push(mxPrText('Trabajos pendientes',c.pending),mxPrText('Empresas en terreno',c.companies),mxPrText('Observaciones',c.observations));
    const otherComponent=photos.filter(p=>p.targetType==='component'&&!['osmosis','treatment','feeding'].includes(p.targetId));
    const byTarget={};otherComponent.forEach(p=>{const k=p.targetName||'Componente';(byTarget[k]||(byTarget[k]=[])).push(p)});Object.entries(byTarget).forEach(([k,v])=>parts.push(mxPrintPhotos(v,'Fotografías — '+k)));
    const general=photos.filter(p=>!p.targetType||p.targetType==='general');parts.push(mxPrintPhotos(general,'Fotografías generales del centro'));
    const req=(data.requests||[]).filter(r=>r.center===name);
    if(req.length)parts.push(`<div class="pr-section"><h3>Solicitudes y requerimientos</h3><table class="pr-table"><thead><tr><th>Equipo</th><th>Material / repuesto</th><th>Solicitado a</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${req.map(r=>`<tr><td>${esc(r.equipment)}</td><td>${esc(r.material)}</td><td>${esc(r.requestedTo)}</td><td>${esc(r.date)}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table></div>`);
    parts.push('</div>');
  });
  root.innerHTML=parts.join('');
};

mxInstallV6UI();
