// MultiX v14 — caseta de ensilaje por centro + resumen sin contador total de equipos
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const STATUS=[['','Seleccionar...'],['Operativo','Operativo'],['Inoperativo','Inoperativo'],['En proceso','En proceso']];
  const blank=name=>({name:name||'',recirculation:'',grinding:'',acid:'',panels:'',lighting:'',notes:''});
  const has=v=>String(v||'').trim().length>0;
  const activeNames=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():['Ganso','Puyuhuapi 2','Pearson','Arbolito','Delta'];
  const ensure=(centerName,c)=>{if(!c.ensilage)c.ensilage=blank(centerName==='Ganso'?'PE-16':'');if(centerName==='Ganso'&&!has(c.ensilage.name))c.ensilage.name='PE-16';return c.ensilage;};
  const ensHas=e=>!!e&&(has(e.recirculation)||has(e.grinding)||has(e.acid)||has(e.panels)||has(e.lighting)||has(e.notes));
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){} };
  const options=v=>STATUS.map(([x,l])=>`<option value="${x}"${x===v?' selected':''}>${l}</option>`).join('');

  function removeProvisionalGanso(){
    const c=data?.centers?.Ganso;if(!c?.equipment)return;
    const ids=new Set(['ganso-salmex20-gen1','ganso-salmex20-gen2']);
    const before=c.equipment.length;
    c.equipment=c.equipment.filter(e=>!ids.has(String(e.id||''))||has(e.current)||has(e.last)||has(e.reg));
    if(c.equipment.length!==before)persist();
  }

  function installStyles(){
    if($('mxEnsilageV14Styles'))return;
    const s=document.createElement('style');s.id='mxEnsilageV14Styles';s.textContent=`
      .ensilage-panel{background:#0a1924;border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px}
      .ensilage-name{max-width:360px;margin-bottom:12px}.ensilage-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ensilage-grid .field{margin:0}.ensilage-grid select,.ensilage-grid input,.ensilage-grid textarea{width:100%}.ensilage-notes{grid-column:1/-1}.ensilage-note{font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4}
      @media(max-width:760px){.ensilage-grid{grid-template-columns:1fr}.ensilage-notes{grid-column:1}}
    `;document.head.appendChild(s);
  }

  function installEditorUI(){
    if($('mxEnsilagePanel'))return true;
    const photoHead=[...document.querySelectorAll('#editor .subhead')].find(x=>/Fotograf/i.test(x.textContent||''));
    if(!photoHead)return false;
    const head=document.createElement('div');head.className='subhead';head.id='mxEnsilageHead';head.textContent='Caseta de Ensilaje';
    const panel=document.createElement('div');panel.className='ensilage-panel';panel.id='mxEnsilagePanel';panel.innerHTML=`
      <div class="field ensilage-name"><label>Nombre / código de la caseta</label><input id="ensName" placeholder="Ej: PE-16"></div>
      <div class="ensilage-grid">
        <div class="field"><label>Bomba de recirculación</label><select id="ensRecirculation"></select></div>
        <div class="field"><label>Bomba de molienda</label><select id="ensGrinding"></select></div>
        <div class="field"><label>Bomba de ácido</label><select id="ensAcid"></select></div>
        <div class="field"><label>Tableros en general</label><select id="ensPanels"></select></div>
        <div class="field"><label>Iluminación interior</label><select id="ensLighting"></select></div>
        <div class="field ensilage-notes"><label>Observaciones</label><textarea id="ensNotes" placeholder="Observaciones de la caseta de ensilaje"></textarea></div>
      </div>
      <div class="ensilage-note">Estados disponibles: Operativo, Inoperativo y En proceso.</div>`;
    photoHead.parentNode.insertBefore(head,photoHead);photoHead.parentNode.insertBefore(panel,photoHead);
    ['ensRecirculation','ensGrinding','ensAcid','ensPanels','ensLighting'].forEach(id=>$(id).innerHTML=options(''));
    ['ensName','ensRecirculation','ensGrinding','ensAcid','ensPanels','ensLighting','ensNotes'].forEach(id=>{
      $(id).addEventListener(id==='ensNotes'||id==='ensName'?'input':'change',()=>{readEditor();persist();if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();});
    });
    return true;
  }

  function fillEditor(){
    if(!currentCenter||!data?.centers?.[currentCenter])return;
    const e=ensure(currentCenter,data.centers[currentCenter]);
    $('ensName').value=e.name||'';
    $('ensRecirculation').innerHTML=options(e.recirculation||'');
    $('ensGrinding').innerHTML=options(e.grinding||'');
    $('ensAcid').innerHTML=options(e.acid||'');
    $('ensPanels').innerHTML=options(e.panels||'');
    $('ensLighting').innerHTML=options(e.lighting||'');
    $('ensNotes').value=e.notes||'';
  }
  function readEditor(){
    if(!currentCenter||!data?.centers?.[currentCenter]||!$('ensName'))return;
    const e=ensure(currentCenter,data.centers[currentCenter]);
    e.name=$('ensName').value.trim();e.recirculation=$('ensRecirculation').value;e.grinding=$('ensGrinding').value;e.acid=$('ensAcid').value;e.panels=$('ensPanels').value;e.lighting=$('ensLighting').value;e.notes=$('ensNotes').value.trim();
  }

  function installOpenSaveHooks(){
    if(window.__mxEnsilageOpenSave)return;window.__mxEnsilageOpenSave=true;
    const oldOpen=window.openCenter;window.openCenter=function(name){const r=oldOpen(name);ensure(name,data.centers[name]);setTimeout(fillEditor,0);return r;};
    const oldSave=window.saveCurrentCenter;window.saveCurrentCenter=function(){readEditor();return oldSave();};
    const saveBtn=$('saveCenter');if(saveBtn)saveBtn.onclick=window.saveCurrentCenter;
    const oldNew=window.newWeekly;window.newWeekly=function(){const saved={};Object.keys(data?.centers||{}).forEach(n=>saved[n]=ensure(n,data.centers[n]).name||'');const r=oldNew();Object.keys(data?.centers||{}).forEach(n=>data.centers[n].ensilage=blank(saved[n]||(n==='Ganso'?'PE-16':'')));persist();if(typeof renderAll==='function')renderAll();return r;};
  }

  function installStats(){
    window.renderStats=function(){const s=calcStats();stats.innerHTML=[['centros',s.centers],['vencidos',s.vencidos,'warn'],['generadores',s.generators],['plantas',s.plants],['solicitudes',s.requests]].map(x=>`<div class="stat ${x[2]||''}"><div class="n">${x[1]}</div><div class="l">${x[0]}</div></div>`).join('');};
    renderStats();
  }

  function installMeaningful(){
    if(window.__mxEnsilageMeaningful)return;window.__mxEnsilageMeaningful=true;
    const old=window.mxMeaningfulCenter;
    window.mxMeaningfulCenter=function(name,c){if(!activeNames().includes(name))return false;return (typeof old==='function'&&old(name,c))||ensHas(ensure(name,c));};
  }

  function installPhotoTarget(){
    if(window.__mxEnsilagePhotoTarget)return;window.__mxEnsilagePhotoTarget=true;
    if(typeof window.mxPhotoTargetOptions==='function'){
      const oldOpts=window.mxPhotoTargetOptions;window.mxPhotoTargetOptions=function(selected='general'){let html=oldOpts(selected);if(!html.includes('component:ensilage')){const mark='</select>';html+=`<option value="component:ensilage"${selected==='component:ensilage'?' selected':''}>Caseta de Ensilaje</option>`;}return html;};
    }
    if(typeof window.mxTargetMeta==='function'){
      const oldMeta=window.mxTargetMeta;window.mxTargetMeta=function(value){if(value==='component:ensilage')return{targetType:'component',targetId:'ensilage',targetKey:value,targetName:'Caseta de Ensilaje'};return oldMeta(value);};
    }
  }

  function ensilageText(name,c){
    const e=ensure(name,c);if(!ensHas(e))return'';
    const lines=[];if(e.recirculation)lines.push('Bomba de recirculación: '+e.recirculation);if(e.grinding)lines.push('Bomba de molienda: '+e.grinding);if(e.acid)lines.push('Bomba de ácido: '+e.acid);if(e.panels)lines.push('Tableros en general: '+e.panels);if(e.lighting)lines.push('Iluminación interior: '+e.lighting);if(e.notes)lines.push('Observaciones: '+e.notes);
    return `CASETA DE ENSILAJE${e.name?' — '+e.name:''}\n`+lines.join('\n');
  }
  function patchPreview(){
    const root=$('mxReportPreview');if(!root)return;
    root.querySelectorAll('.mx-ensilage-report').forEach(x=>x.remove());
    root.querySelectorAll('.pr-center').forEach(sec=>{const title=sec.querySelector('h2')?.textContent?.trim().toLowerCase();const name=activeNames().find(n=>n.toLowerCase()===title);if(!name)return;const e=ensure(name,data.centers[name]);if(!ensHas(e))return;const div=document.createElement('div');div.className='pr-section mx-ensilage-report';const h=document.createElement('h3');h.textContent='Caseta de Ensilaje'+(e.name?' — '+e.name:'');const p=document.createElement('p');p.textContent=[e.recirculation&&'Bomba de recirculación: '+e.recirculation,e.grinding&&'Bomba de molienda: '+e.grinding,e.acid&&'Bomba de ácido: '+e.acid,e.panels&&'Tableros en general: '+e.panels,e.lighting&&'Iluminación interior: '+e.lighting,e.notes&&'Observaciones: '+e.notes].filter(Boolean).join('\n');div.append(h,p);const pending=[...sec.querySelectorAll('.pr-section')].find(x=>/Trabajos pendientes/i.test(x.querySelector('h3')?.textContent||''));pending?sec.insertBefore(div,pending):sec.appendChild(div);});
  }
  function installReportHooks(){
    if(window.__mxEnsilageReportHooks||typeof window.mxRenderReportPreview!=='function'||typeof window.mxCreatePdfNative!=='function')return false;window.__mxEnsilageReportHooks=true;
    const oldPreview=window.mxRenderReportPreview;window.mxRenderReportPreview=function(){const r=oldPreview();setTimeout(patchPreview,0);return r;};
    const tab=$('mxReportTab');if(tab)tab.onclick=()=>{if(typeof switchTab==='function')switchTab('report');setTimeout(()=>window.mxRenderReportPreview(),20);};const refresh=$('mxRefreshReport');if(refresh)refresh.onclick=()=>window.mxRenderReportPreview();
    const oldPdf=window.mxCreatePdfNative;window.mxCreatePdfNative=async function(){const backups=[],stored=localStorage.getItem('multixMantencion');try{activeNames().forEach(name=>{const c=data.centers[name],txt=ensilageText(name,c);if(!txt)return;backups.push([c,c.observations]);c.observations=(has(c.observations)?c.observations+'\n\n':'')+txt;});return await oldPdf();}finally{backups.forEach(([c,v])=>c.observations=v);try{if(stored===null)localStorage.removeItem('multixMantencion');else localStorage.setItem('multixMantencion',stored);}catch(_){}}};
    return true;
  }

  function start(){
    installStyles();removeProvisionalGanso();
    Object.entries(data?.centers||{}).forEach(([n,c])=>ensure(n,c));persist();
    let tries=0;const t=setInterval(()=>{tries++;if(installEditorUI()&&typeof window.openCenter==='function'&&typeof window.saveCurrentCenter==='function'&&typeof window.calcStats==='function'){installOpenSaveHooks();installStats();installMeaningful();installPhotoTarget();if(typeof renderAll==='function')renderAll();if(currentCenter&&$('editor')?.classList.contains('open'))fillEditor();if(installReportHooks()||tries>100)clearInterval(t);}else if(tries>100)clearInterval(t);},100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
