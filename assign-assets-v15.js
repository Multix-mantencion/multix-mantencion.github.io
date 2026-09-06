// MultiX v15.1 — asignar o eliminar equipos de Área / Back Up / sin centro
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const escLocal=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const attrLocal=escLocal;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const assetKey=(e,i)=>String(e?.id||e?.reg||`${e?.group||''}|${e?.name||e?.type||''}|${e?.current||''}|${i}`);
  const centers=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():(typeof CENTER_NAMES!=='undefined'?[...CENTER_NAMES]:Object.keys(data?.centers||{}));
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}};

  function ensureTracking(){
    data.settings=data.settings||{};
    if(!Array.isArray(data.settings.assignedAreaAssets))data.settings.assignedAreaAssets=[];
    if(!Array.isArray(data.settings.deletedAreaAssets))data.settings.deletedAreaAssets=[];
  }

  function purgeProcessed(){
    ensureTracking();
    const done=new Set([...data.settings.assignedAreaAssets,...data.settings.deletedAreaAssets].map(String));
    if(!Array.isArray(data.areaAssets))data.areaAssets=[];
    if(!done.size)return;
    data.areaAssets=data.areaAssets.filter((e,i)=>!done.has(assetKey(e,i))&&!done.has(String(e.id||'')));
  }

  function installStyles(){
    if($('mxAssignAreaStyles'))return;
    const s=document.createElement('style');s.id='mxAssignAreaStyles';s.textContent=`
      .area-assign-select{min-width:145px;background:#0d2230;border:1px solid var(--line);color:var(--text);border-radius:8px;padding:8px;font-size:12px}
      .area-asset-actions{display:flex;gap:6px;flex-wrap:wrap}.area-assign-btn{white-space:nowrap}.area-assigned-empty{padding:18px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}
      @media(max-width:760px){.area-table{min-width:1080px}.area-assign-select{min-width:155px}}
    `;document.head.appendChild(s);
  }

  function centerOptions(selected=''){
    return `<option value="">Seleccionar centro</option>`+centers().map(n=>`<option value="${attrLocal(n)}"${n===selected?' selected':''}>${escLocal(n)}</option>`).join('');
  }

  function render(){
    if(typeof areaAssetList==='undefined'||!areaAssetList)return;
    const rows=Array.isArray(data.areaAssets)?data.areaAssets:[];
    if(!rows.length){
      areaAssetList.innerHTML='<div class="area-assigned-empty">No quedan equipos pendientes de asignar a un centro.</div>';
      return;
    }
    areaAssetList.innerHTML=`<div class="tablewrap"><table class="area-table"><thead><tr><th>Grupo</th><th>Equipo</th><th>Actual</th><th>Últ. mant.</th><th>Próxima</th><th>Estado</th><th>Detalle</th><th>Asignar a</th><th>Acciones</th></tr></thead><tbody>${rows.map((e,i)=>`<tr>
      <td>${escLocal(e.group||'Área')}</td>
      <td><b>${escLocal(e.name||e.type||'Equipo')}</b>${e.reg?`<div class="helper">N° ${escLocal(e.reg)}</div>`:''}</td>
      <td>${escLocal(e.current||'')}</td>
      <td>${escLocal(e.last||'')}</td>
      <td>${escLocal(e.next||'')}</td>
      <td class="status ${escLocal(e.status||'')}">${escLocal(e.status||'')}</td>
      <td>${escLocal(e.notes||'')}</td>
      <td><select class="area-assign-select" id="mxAreaCenter-${i}">${centerOptions()}</select></td>
      <td><div class="area-asset-actions"><button class="btn small primary area-assign-btn" onclick="mxAssignAreaAsset(${i})">Asignar</button><button class="btn small danger" onclick="mxDeleteAreaAsset(${i})">Eliminar</button></div></td>
    </tr>`).join('')}</tbody></table></div>`;
  }

  window.mxAssignAreaAsset=function(index){
    const item=data?.areaAssets?.[index];if(!item)return;
    const select=$(`mxAreaCenter-${index}`),center=select?.value||'';
    if(!center){alert('Selecciona primero el centro al que quieres asignar este equipo.');return;}
    if(!data.centers?.[center]){alert('Ese centro no está disponible.');return;}
    const label=item.name||item.type||'Equipo';
    if(!confirm(`¿Asignar “${label}” a ${center}?`))return;

    ensureTracking();
    const key=assetKey(item,index),copy=clone(item);
    copy.id=copy.id||('area-'+Date.now()+'-'+index);
    copy.name=copy.name||copy.type||'Equipo';
    copy.type=copy.type||copy.name||'Equipo';
    if(!copy.notes&&copy.group)copy.notes='Origen: '+copy.group;
    copy.assignedFromArea=true;
    copy.assignedCenter=center;
    copy.assignedAt=new Date().toISOString();
    if(typeof window.mxRecalcEquipment==='function'){try{window.mxRecalcEquipment(copy);}catch(_){}}

    const list=data.centers[center].equipment||(data.centers[center].equipment=[]);
    const exists=list.some(e=>(copy.id&&e.id===copy.id)||(copy.reg&&e.reg&&String(copy.reg)===String(e.reg)&&String(copy.name||'')===String(e.name||'')));
    if(!exists)list.push(copy);

    data.settings.assignedAreaAssets.push(String(item.id||key));
    data.settings.assignedAreaAssets=[...new Set(data.settings.assignedAreaAssets.map(String))];
    data.areaAssets.splice(index,1);
    persist();render();
    if(typeof renderCenters==='function')renderCenters();
    if(typeof renderStats==='function')renderStats();
    if(typeof renderSummary==='function')renderSummary();
    alert(`${label} fue asignado a ${center} y eliminado del listado de equipos sin centro.`);
  };

  window.mxDeleteAreaAsset=function(index){
    const item=data?.areaAssets?.[index];if(!item)return;
    const label=item.name||item.type||'Equipo',group=item.group?` (${item.group})`:'';
    if(!confirm(`¿Eliminar “${label}”${group} del listado de equipos sin centro?\n\nÚsalo cuando el equipo ya esté incorporado en su centro o cuando este registro sea duplicado.`))return;
    ensureTracking();
    const key=String(item.id||assetKey(item,index));
    data.settings.deletedAreaAssets.push(key);
    data.settings.deletedAreaAssets=[...new Set(data.settings.deletedAreaAssets.map(String))];
    data.areaAssets.splice(index,1);
    persist();render();
    if(typeof renderStats==='function')renderStats();
  };

  function install(){
    if(typeof data==='undefined'||typeof areaAssetList==='undefined')return false;
    installStyles();ensureTracking();purgeProcessed();persist();
    window.renderAreaAssets=render;render();return true;
  }

  function start(){let tries=0;const t=setInterval(()=>{tries++;if(install())clearInterval(t);else if(tries>100)clearInterval(t);},100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
