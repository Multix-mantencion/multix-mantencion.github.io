// MultiX v23 — trabajos realizados con fecha y mecánico por centro
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const attr=v=>esc(v).replace(/`/g,'&#096;');
  const today=()=>new Date().toISOString().slice(0,10);
  const fmtDate=v=>{if(!v)return 'Sin fecha';const p=String(v).split('-');return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(v);};
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};

  function ensure(c){
    if(!c)return [];
    if(!Array.isArray(c.workLog)){
      c.workLog=[];
      const old=String(c.works||'').trim();
      if(old)c.workLog.push({id:'legacy-'+Date.now(),date:'',text:old,mechanic:''});
    }
    return c.workLog;
  }
  function syncWorks(c){
    const list=ensure(c);
    c.works=list.map(w=>`${fmtDate(w.date)} — ${String(w.text||'').trim()}${String(w.mechanic||'').trim()?` — Mecánico: ${String(w.mechanic).trim()}`:''}`).join('\n');
    const ta=$('cWorks');if(ta&&currentCenter&&data?.centers?.[currentCenter]===c)ta.value=c.works;
  }
  function installStyles(){
    if($('mxWorkLogV23Styles'))return;
    const s=document.createElement('style');s.id='mxWorkLogV23Styles';s.textContent=`
      .mx-worklog{margin-top:8px}.mx-work-list{display:grid;gap:8px;margin-bottom:10px}.mx-work-empty{color:var(--muted);font-style:italic;padding:4px 2px 8px}.mx-work-item{display:grid;grid-template-columns:120px 1fr 180px auto;gap:8px;align-items:center;background:#0a1924;border:1px solid var(--line);border-radius:11px;padding:10px}.mx-work-date{font-weight:900;color:var(--teal);font-size:13px}.mx-work-text{font-size:14px;color:var(--text);line-height:1.35}.mx-work-mech{font-size:12px;color:var(--muted)}.mx-work-del{border:1px solid #6d343d;background:#351d25;color:#ff9b9b;border-radius:8px;padding:7px 9px;font-weight:800;cursor:pointer}.mx-work-form{display:grid;grid-template-columns:150px 1fr 220px auto;gap:8px;align-items:end}.mx-work-form .field{margin:0}.mx-work-form input{width:100%;box-sizing:border-box}.mx-work-add{height:44px;border:0;border-radius:10px;background:#193245;color:#eef9fa;font-weight:900;padding:0 18px;cursor:pointer}.mx-work-help{font-size:11px;color:var(--muted);margin-top:7px}
      @media(max-width:900px){.mx-work-item{grid-template-columns:110px 1fr auto}.mx-work-mech{grid-column:2/3}.mx-work-form{grid-template-columns:1fr 1fr}.mx-work-form .mx-work-desc{grid-column:1/-1}.mx-work-add{grid-column:1/-1;width:100%}}
      @media(max-width:620px){.mx-work-item{grid-template-columns:1fr auto}.mx-work-date{grid-column:1/2}.mx-work-text{grid-column:1/-1}.mx-work-mech{grid-column:1/2}.mx-work-form{grid-template-columns:1fr}.mx-work-form .mx-work-desc,.mx-work-add{grid-column:1}.mx-work-add{height:48px}}
    `;document.head.appendChild(s);
  }

  function installUI(){
    const ta=$('cWorks');if(!ta)return false;
    if($('mxWorkLogV23'))return true;
    ta.style.display='none';
    const box=document.createElement('div');box.id='mxWorkLogV23';box.className='mx-worklog';
    box.innerHTML=`<div id="mxWorkListV23" class="mx-work-list"></div><div class="mx-work-form"><div class="field"><label>Fecha</label><input id="mxWorkDateV23" type="date"></div><div class="field mx-work-desc"><label>Trabajo realizado</label><input id="mxWorkTextV23" placeholder="Ej: Mantención Generador 1"></div><div class="field"><label>Mecánico</label><input id="mxWorkMechanicV23" placeholder="Nombre"></div><button type="button" id="mxWorkAddV23" class="mx-work-add">+ Guardar trabajo</button></div><div class="mx-work-help">Cada registro queda guardado con su fecha y aparecerá de la misma forma en el informe semanal.</div>`;
    ta.parentNode.insertBefore(box,ta.nextSibling);
    $('mxWorkAddV23').onclick=addWork;
    return true;
  }

  function render(){
    if(!currentCenter||!data?.centers?.[currentCenter]||!$('mxWorkListV23'))return;
    const c=data.centers[currentCenter],list=ensure(c);syncWorks(c);
    $('mxWorkListV23').innerHTML=list.length?list.map((w,i)=>`<div class="mx-work-item"><div class="mx-work-date">${esc(fmtDate(w.date))}</div><div class="mx-work-text">${esc(w.text||'')}</div><div class="mx-work-mech">${w.mechanic?`Mecánico: ${esc(w.mechanic)}`:''}</div><button type="button" class="mx-work-del" onclick="mxDeleteWorkV23(${i})">Eliminar</button></div>`).join(''):'<div class="mx-work-empty">Sin registros esta semana.</div>';
    const d=$('mxWorkDateV23'),m=$('mxWorkMechanicV23');if(d&&!d.value)d.value=today();if(m&&!m.value)m.value=String(data?.meta?.mechanic||'');
  }
  function addWork(){
    if(!currentCenter||!data?.centers?.[currentCenter])return;
    const date=$('mxWorkDateV23')?.value||today(),text=String($('mxWorkTextV23')?.value||'').trim(),mechanic=String($('mxWorkMechanicV23')?.value||'').trim();
    if(!text){alert('Escribe el trabajo realizado antes de guardar.');return;}
    const c=data.centers[currentCenter],list=ensure(c);list.push({id:'work-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),date,text,mechanic});syncWorks(c);persist();if($('mxWorkTextV23'))$('mxWorkTextV23').value='';render();
    if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();
  }
  window.mxDeleteWorkV23=function(i){
    const c=data?.centers?.[currentCenter],list=ensure(c);if(!list?.[i])return;if(!confirm('¿Eliminar este trabajo realizado?'))return;list.splice(i,1);syncWorks(c);persist();render();
  };

  function installHooks(){
    if(window.__mxWorkLogHooksV23)return;window.__mxWorkLogHooksV23=true;
    if(typeof window.openCenter==='function'){
      const oldOpen=window.openCenter;window.openCenter=function(name){const r=oldOpen(name);setTimeout(()=>{ensure(data.centers[name]);render();},50);return r;};
    }
    if(typeof window.saveCurrentCenter==='function'){
      const oldSave=window.saveCurrentCenter;window.saveCurrentCenter=function(){if(currentCenter&&data?.centers?.[currentCenter])syncWorks(data.centers[currentCenter]);return oldSave();};
      const btn=$('saveCenter');if(btn)btn.onclick=window.saveCurrentCenter;
    }
    if(typeof window.newWeekly==='function'){
      const oldNew=window.newWeekly;window.newWeekly=function(){const r=oldNew();Object.values(data?.centers||{}).forEach(c=>{c.workLog=[];c.works='';});persist();return r;};
    }
  }
  function start(){
    installStyles();let n=0;const t=setInterval(()=>{n++;if(typeof data!=='undefined'&&installUI()&&typeof window.openCenter==='function'){Object.values(data.centers||{}).forEach(c=>ensure(c));installHooks();persist();if(currentCenter&&$('editor')?.classList.contains('open'))render();clearInterval(t);}else if(n>100)clearInterval(t);},100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
