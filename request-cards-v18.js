// MultiX v18 — solicitudes en formato tarjetas, filtros y estado editable
(function(){
  'use strict';
  const STATES=['Solicitado','En curso','En tránsito','Recibido'];
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
  const activeCenters=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():null;
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};
  const normalizeStatus=s=>{
    const x=String(s||'').trim().toLowerCase();
    if(x==='recibido')return 'Recibido';
    if(x==='en curso')return 'En curso';
    if(x==='en transito'||x==='en tránsito')return 'En tránsito';
    return 'Solicitado';
  };
  const statusOptions=value=>STATES.map(s=>`<option value="${s}"${s===value?' selected':''}>${s}</option>`).join('');

  function parseDate(v){
    const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;
    return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
  }
  function formatDate(v){
    const d=parseDate(v);if(!d)return esc(v||'Sin fecha');
    return String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear();
  }
  function daysSince(v){
    const d=parseDate(v);if(!d)return null;
    const now=new Date();now.setHours(0,0,0,0);d.setHours(0,0,0,0);
    return Math.max(0,Math.floor((now-d)/86400000));
  }

  function installStyles(){
    if($('mxRequestCardsV18Styles'))return;
    const s=document.createElement('style');s.id='mxRequestCardsV18Styles';s.textContent=`
      #mxRequestCardsToolbar{display:grid;grid-template-columns:1.2fr 1fr 1fr auto;gap:10px;margin:14px 0 16px}
      #mxRequestCardsToolbar select,#mxRequestCardsToolbar input{width:100%;background:#0d2230;border:1px solid var(--line);color:var(--text);border-radius:10px;padding:11px 12px;font-size:14px;outline:none}
      #mxRequestCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:10px}
      .mx-request-card{background:#0b1c28;border:1px solid #294051;border-radius:15px;padding:15px;position:relative;min-width:0}
      .mx-request-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      .mx-request-center{font-size:19px;font-weight:900;line-height:1.2;color:var(--text)}
      .mx-request-delete{background:transparent;border:0;color:#8193a1;font-size:21px;cursor:pointer;padding:0 3px;line-height:1}
      .mx-request-delete:hover{color:#ff7d7d}
      .mx-request-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .mx-request-field{background:#0a1720;border:1px solid #294051;border-radius:9px;padding:10px 12px;min-height:47px;display:flex;align-items:center;overflow-wrap:anywhere}
      .mx-request-field.wide{grid-column:1/-1}
      .mx-request-field .label{display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
      .mx-request-field .value{font-size:15px;color:var(--text)}
      .mx-request-status{width:100%;background:#0a1720;border:1px solid #294051;border-radius:9px;padding:11px 12px;font-weight:900;font-size:15px;outline:none}
      .mx-request-status.solicitado{color:#ffc453;border-color:#6f5520}
      .mx-request-status.en-curso{color:#70cfff;border-color:#25617e}
      .mx-request-status.en-transito{color:#d7adff;border-color:#664482}
      .mx-request-status.recibido{color:#56d8bf;border-color:#216b5c}
      .mx-request-age{margin-top:10px;font-size:13px;font-weight:800;color:#ff6f6f}
      .mx-request-age.ok{color:#56d8bf}
      .mx-request-empty{grid-column:1/-1;padding:26px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px}
      @media(max-width:900px){#mxRequestCardsToolbar{grid-template-columns:1fr 1fr}#mxRequestCards{grid-template-columns:1fr}}
      @media(max-width:560px){#mxRequestCardsToolbar{grid-template-columns:1fr}.mx-request-fields{grid-template-columns:1fr}.mx-request-field.wide{grid-column:1}.mx-request-center{font-size:18px}}
    `;document.head.appendChild(s);
  }

  function ensureHost(){
    const tbody=$('requestTable');if(!tbody)return false;
    const table=tbody.closest('table');const wrap=table?.closest('.tablewrap')||table;
    if(wrap)wrap.style.display='none';
    if(!$('mxRequestCardsToolbar')){
      const toolbar=document.createElement('div');toolbar.id='mxRequestCardsToolbar';
      toolbar.innerHTML=`<select id="mxReqFilterCenter"><option value="">Todos los centros</option></select><select id="mxReqFilterStatus"><option value="">Todos los estados</option>${STATES.map(s=>`<option value="${s}">${s}</option>`).join('')}</select><input id="mxReqFilterPerson" placeholder="Filtrar por solicitado a"><button class="btn small" id="mxReqClearFilters">Limpiar filtros</button>`;
      (wrap||tbody).insertAdjacentElement('afterend',toolbar);
      const cards=document.createElement('div');cards.id='mxRequestCards';toolbar.insertAdjacentElement('afterend',cards);
      ['mxReqFilterCenter','mxReqFilterStatus','mxReqFilterPerson'].forEach(id=>$(id).addEventListener(id==='mxReqFilterPerson'?'input':'change',render));
      $('mxReqClearFilters').addEventListener('click',()=>{$('mxReqFilterCenter').value='';$('mxReqFilterStatus').value='';$('mxReqFilterPerson').value='';render();});
    }
    return true;
  }

  function populateCenterFilter(){
    const sel=$('mxReqFilterCenter');if(!sel)return;
    const current=sel.value;
    const allowed=activeCenters();
    const centers=[...new Set((data.requests||[]).map(r=>r.center).filter(Boolean).filter(n=>!allowed||allowed.includes(n)||n==='Área / Base Cisnes'))].sort((a,b)=>a.localeCompare(b,'es'));
    sel.innerHTML='<option value="">Todos los centros</option>'+centers.map(n=>`<option value="${esc(n)}"${n===current?' selected':''}>${esc(n)}</option>`).join('');
  }

  window.mxRequestCardStatusChanged=function(index,value,el){
    if(!data?.requests?.[index])return;
    const status=normalizeStatus(value);data.requests[index].status=status;data.requests[index].statusUpdatedAt=new Date().toISOString();persist();
    if(el)el.className='mx-request-status '+slug(status);
    render();
    if(typeof window.mxRenderReportPreview==='function'&&$('report')?.classList.contains('active'))setTimeout(()=>window.mxRenderReportPreview(),30);
  };

  function card(r,i){
    const status=normalizeStatus(r.status);if(r.status!==status)r.status=status;
    const days=daysSince(r.date);
    const age=status==='Recibido'?'<div class="mx-request-age ok">✓ Recibido</div>':(days===null?'':`<div class="mx-request-age">⚠ ${days} día${days===1?'':'s'} desde la solicitud</div>`);
    return `<article class="mx-request-card">
      <div class="mx-request-card-head"><div class="mx-request-center">${esc(r.center||'Sin centro')}</div><button class="mx-request-delete" title="Eliminar solicitud" aria-label="Eliminar solicitud" onclick="delRequest(${i})">🗑</button></div>
      <div class="mx-request-fields">
        <div class="mx-request-field wide"><div><span class="label">Equipo / Área</span><span class="value">${esc(r.equipment||'Sin equipo')}</span></div></div>
        <div class="mx-request-field wide"><div><span class="label">Material / Repuesto</span><span class="value">${esc(r.material||'Sin detalle')}</span>${r.notes?`<div class="helper">${esc(r.notes)}</div>`:''}</div></div>
        <div class="mx-request-field wide"><div><span class="label">Solicitado a</span><span class="value">${esc(r.requestedTo||'Sin dato')}</span></div></div>
        <div class="mx-request-field"><div><span class="label">Fecha</span><span class="value">${formatDate(r.date)}</span></div></div>
        <div><span class="label" style="display:block;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 4px 2px">Estado</span><select class="mx-request-status ${slug(status)}" onchange="mxRequestCardStatusChanged(${i},this.value,this)">${statusOptions(status)}</select></div>
      </div>${age}
    </article>`;
  }

  function render(){
    if(!ensureHost())return;
    populateCenterFilter();
    const allowed=activeCenters();
    const center=$('mxReqFilterCenter')?.value||'';
    const status=$('mxReqFilterStatus')?.value||'';
    const person=($('mxReqFilterPerson')?.value||'').trim().toLowerCase();
    const rows=(data.requests||[]).map((r,i)=>({r,i})).filter(({r})=>(!allowed||allowed.includes(r.center)||r.center==='Área / Base Cisnes')).filter(({r})=>!center||r.center===center).filter(({r})=>!status||normalizeStatus(r.status)===status).filter(({r})=>!person||String(r.requestedTo||'').toLowerCase().includes(person));
    $('mxRequestCards').innerHTML=rows.length?rows.map(({r,i})=>card(r,i)).join(''):'<div class="mx-request-empty">No hay solicitudes para los filtros seleccionados.</div>';
  }

  function install(){
    if(typeof data==='undefined'||!$('requestTable'))return false;
    installStyles();ensureHost();
    window.renderRequests=render;
    render();
    return true;
  }
  function start(){let tries=0;const t=setInterval(()=>{tries++;if(install())clearInterval(t);else if(tries>100)clearInterval(t);},100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
