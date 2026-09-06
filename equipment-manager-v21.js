// MultiX v21.2 — gestión de equipos por centro, optimizada para PC y móvil
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const attr=v=>esc(v).replace(/`/g,'&#096;');
  const parseHours=v=>{const raw=String(v??'').trim();if(!raw||raw==='-')return null;const n=Number(raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null;};
  const fmt=v=>{const n=parseHours(v);return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';};
  const intervalFor=e=>{const t=((e?.type||'')+' '+(e?.name||'')).toLowerCase();if(t.includes('generador'))return 250;if(t.includes('bote')||t.includes('motor fuera')||t.includes('fuera borda')||t.includes('lancha'))return 300;const custom=parseHours(e?.interval);return custom;};
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};

  function recalc(e){
    const interval=intervalFor(e),last=parseHours(e.last),cur=parseHours(e.current);
    if(interval!==null)e.next=last===null?'':String(last+interval);
    const next=parseHours(e.next);
    if(!['Inoperativo','En observación'].includes(e.status)&&cur!==null&&next!==null)e.status=cur>=next?'Vencido':(next-cur<=50?'Próximo':'OK');
    return interval;
  }
  window.mxRecalcEquipment=recalc;

  function ensureGansoGenerators(){
    const c=data?.centers?.Ganso;if(!c)return;
    c.equipment=Array.isArray(c.equipment)?c.equipment:[];
    const gen=c.equipment.filter(e=>String((e.type||'')+' '+(e.name||'')).toLowerCase().includes('generador'));
    const hasName=rx=>gen.some(e=>rx.test(String(e.name||'').toLowerCase()));
    const make=name=>({id:'ganso-'+name.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name,type:'Generador',brand:'',model:'',reg:'',current:'',last:'',next:'',status:'OK',notes:''});
    if(!hasName(/generador\s*1|principal\s*1/))c.equipment.push(make('Generador 1'));
    if(!hasName(/generador\s*2|principal\s*2/))c.equipment.push(make('Generador 2'));
    if(!gen.some(e=>/aux|auxiliar/.test(String(e.name||'').toLowerCase())))c.equipment.push(make('Generador auxiliar'));
    persist();
  }

  function installStyles(){
    if($('mxEqManagerV21Styles'))return;
    const s=document.createElement('style');s.id='mxEqManagerV21Styles';s.textContent=`
      .mx-eq-toolbar{display:flex;justify-content:flex-end;margin:0 0 12px}.mx-eq-add{background:#55d8ca;color:#09202a;border:0;border-radius:11px;padding:12px 17px;font-weight:900;cursor:pointer;font-size:14px}
      .mx-eq-card{border:1px solid #294555;border-radius:15px;padding:15px;margin:0 0 13px;background:#0b1c28}.mx-eq-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.mx-eq-title{font-size:20px;font-weight:900;color:var(--text)}.mx-eq-type{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin-top:3px}.mx-eq-actions{display:flex;align-items:center;gap:8px}.mx-eq-delete{border:1px solid #6d343d;background:#351d25;color:#ff9b9b;border-radius:9px;padding:7px 10px;font-weight:800;cursor:pointer}
      .mx-eq-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.mx-eq-field label{display:block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 5px}.mx-eq-field input,.mx-eq-field select{width:100%;box-sizing:border-box;background:#0d2230;border:1px solid #315164;color:var(--text);border-radius:9px;padding:11px 12px;font-size:14px;outline:none}.mx-eq-field.hours input{border-color:var(--teal);font-size:17px;font-weight:850}.mx-eq-auto{border:1px solid #315164;border-radius:9px;padding:10px 12px;background:#0a1720;min-height:42px}.mx-eq-auto b{display:block;font-size:16px}.mx-eq-auto small{color:var(--teal)}.mx-eq-notes{grid-column:1/-1}.mx-eq-notes textarea{width:100%;min-height:70px;box-sizing:border-box;background:#0d2230;border:1px solid #315164;color:var(--text);border-radius:9px;padding:11px 12px;resize:vertical}.mx-eq-status{font-weight:900;border-radius:999px;padding:6px 10px;background:#17382e;color:#a7dfcc;font-size:12px}.mx-eq-mobile-add{display:none;margin:14px 0 4px}
      @media(max-width:900px){.mx-eq-grid{grid-template-columns:1fr 1fr}.mx-eq-notes{grid-column:1/-1}}
      @media(max-width:620px){
        .mx-eq-grid{grid-template-columns:1fr}.mx-eq-notes{grid-column:1}.mx-eq-head{align-items:center}.mx-eq-toolbar{position:sticky;top:0;z-index:20;justify-content:stretch;padding:8px 0 10px;background:#07141d;margin-bottom:10px}.mx-eq-add{width:100%;font-size:16px;padding:14px 16px}.mx-eq-mobile-add{display:block}.mx-eq-mobile-add .mx-eq-add{position:relative}.mx-eq-card{padding:14px}.mx-eq-actions{gap:6px}.mx-eq-delete{padding:7px 9px}
      }
    `;document.head.appendChild(s);
  }

  function newEquipment(){return{id:'eq-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:'Nuevo equipo',type:'Otro',brand:'',model:'',reg:'',current:'',last:'',next:'',interval:'',status:'OK',notes:''};}

  window.mxAddCenterEquipment=function(){
    if(!currentCenter||!data?.centers?.[currentCenter])return;
    data.centers[currentCenter].equipment=data.centers[currentCenter].equipment||[];
    data.centers[currentCenter].equipment.push(newEquipment());persist();render();
    setTimeout(()=>{const cards=document.querySelectorAll('.mx-eq-card');cards[cards.length-1]?.scrollIntoView({behavior:'smooth',block:'center'});cards[cards.length-1]?.querySelector('input')?.focus();},80);
  };
  window.mxDeleteCenterEquipment=function(i){
    const list=data?.centers?.[currentCenter]?.equipment;if(!list?.[i])return;
    if(!confirm('¿Eliminar este equipo del centro?'))return;
    list.splice(i,1);persist();render();
  };
  window.mxEqV21Changed=function(i,key,value){
    const e=data?.centers?.[currentCenter]?.equipment?.[i];if(!e)return;
    e[key]=String(value??'').trim();recalc(e);persist();
    const nx=$('mx-v21-next-'+i),st=$('mx-v21-status-'+i),type=$('mx-v21-type-'+i),title=$('mx-v21-title-'+i);
    if(nx)nx.innerHTML=`<b>${e.next?esc(fmt(e.next)):'Ingresa última mantención'}</b><small>${intervalFor(e)!==null?'Automática: cada '+intervalFor(e)+' h':'Sin intervalo automático'}</small>`;
    if(st)st.textContent=e.status||'OK';
    if(type&&key==='type')type.textContent=e.type||'Equipo';
    if(title&&key==='name')title.textContent=e.name||'Equipo';
    if(typeof mxScheduleAutosave==='function')mxScheduleAutosave();
  };

  function typeOptions(value){
    const vals=['Generador','Bote / Motor fuera de borda','Motocompresor','Bomba','Tablero','Otro'];
    return vals.map(v=>`<option value="${esc(v)}"${v===value?' selected':''}>${esc(v)}</option>`).join('');
  }

  function render(){
    const host=$('equipmentEditor'),c=data?.centers?.[currentCenter];if(!host||!c)return;
    const list=c.equipment||[];
    const add=`<div class="mx-eq-toolbar"><button type="button" class="mx-eq-add" onclick="mxAddCenterEquipment()">+ Agregar equipo</button></div>`;
    const bottom=`<div class="mx-eq-mobile-add"><button type="button" class="mx-eq-add" onclick="mxAddCenterEquipment()">+ Agregar otro equipo</button></div>`;
    host.innerHTML=add+(list.length?list.map((e,i)=>{const interval=recalc(e);return `<div class="mx-eq-card">
      <div class="mx-eq-head"><div><div class="mx-eq-title" id="mx-v21-title-${i}">${esc(e.name||e.type||'Equipo')}</div><div class="mx-eq-type" id="mx-v21-type-${i}">${esc(e.type||'Equipo')}</div></div><div class="mx-eq-actions"><span class="mx-eq-status" id="mx-v21-status-${i}">${esc(e.status||'OK')}</span><button type="button" class="mx-eq-delete" onclick="mxDeleteCenterEquipment(${i})">Eliminar</button></div></div>
      <div class="mx-eq-grid">
        <div class="mx-eq-field"><label>Nombre del equipo</label><input value="${attr(e.name||'')}" oninput="mxEqV21Changed(${i},'name',this.value)" placeholder="Ej: Generador auxiliar"></div>
        <div class="mx-eq-field"><label>Tipo</label><select onchange="mxEqV21Changed(${i},'type',this.value)">${typeOptions(e.type||'Otro')}</select></div>
        <div class="mx-eq-field"><label>N° serie / código / registro</label><input value="${attr(e.reg||'')}" oninput="mxEqV21Changed(${i},'reg',this.value)" placeholder="Serie o código"></div>
        <div class="mx-eq-field"><label>Marca</label><input value="${attr(e.brand||'')}" oninput="mxEqV21Changed(${i},'brand',this.value)" placeholder="Ej: Perkins, Cummins"></div>
        <div class="mx-eq-field"><label>Modelo</label><input value="${attr(e.model||'')}" oninput="mxEqV21Changed(${i},'model',this.value)" placeholder="Modelo del equipo"></div>
        <div class="mx-eq-field"><label>Intervalo mantención</label><input inputmode="numeric" value="${attr(e.interval||'')}" oninput="mxEqV21Changed(${i},'interval',this.value)" placeholder="Auto según tipo"></div>
        <div class="mx-eq-field hours"><label>Horómetro actual</label><input inputmode="decimal" value="${attr(e.current||'')}" oninput="mxEqV21Changed(${i},'current',this.value)" placeholder="Ej: 13622"></div>
        <div class="mx-eq-field hours"><label>Horómetro última mantención</label><input inputmode="decimal" value="${attr(e.last||'')}" oninput="mxEqV21Changed(${i},'last',this.value)" placeholder="Ej: 13200"></div>
        <div class="mx-eq-field"><label>Próxima mantención</label><div class="mx-eq-auto" id="mx-v21-next-${i}"><b>${e.next?esc(fmt(e.next)):'Ingresa última mantención'}</b><small>${interval!==null?'Automática: cada '+interval+' h':'Sin intervalo automático'}</small></div></div>
        <div class="mx-eq-field mx-eq-notes"><label>Observaciones / detalle</label><textarea oninput="mxEqV21Changed(${i},'notes',this.value)" placeholder="Detalle del equipo">${esc(e.notes||'')}</textarea></div>
      </div>
    </div>`;}).join(''):'<div class="empty">Sin equipos registrados en este centro.</div>')+bottom;
  }

  function installOpenHook(){
    if(window.__mxEqManagerOpenHook||typeof window.openCenter!=='function')return;
    window.__mxEqManagerOpenHook=true;
    const oldOpen=window.openCenter;
    window.openCenter=function(name){const r=oldOpen(name);setTimeout(()=>{if(currentCenter===name)render();},40);return r;};
  }

  function install(){
    if(typeof data==='undefined'||typeof currentCenter==='undefined'||!$('equipmentEditor'))return false;
    ensureGansoGenerators();installStyles();window.renderEqEditor=render;
    window.collectEq=function(){(data?.centers?.[currentCenter]?.equipment||[]).forEach(recalc);persist();};
    installOpenHook();
    if(currentCenter&&$('editor')?.classList.contains('open'))render();
    if(!window.__mxEqManagerWatch){window.__mxEqManagerWatch=setInterval(()=>{const host=$('equipmentEditor');if(currentCenter&&$('editor')?.classList.contains('open')&&host&&!host.querySelector('.mx-eq-add'))render();},700);}
    return true;
  }
  function start(){let n=0;const t=setInterval(()=>{n++;if(install()){clearInterval(t);if(typeof renderAll==='function')renderAll();}else if(n>100)clearInterval(t);},100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(function(){
  if(document.getElementById('mxBoatAssignmentsV22'))return;
  const s=document.createElement('script');s.id='mxBoatAssignmentsV22';s.src='boat-assignments-v22.js?v=22';s.async=false;s.onerror=()=>console.error('No se pudo cargar la asignación de botes v22');document.body.appendChild(s);
})();
