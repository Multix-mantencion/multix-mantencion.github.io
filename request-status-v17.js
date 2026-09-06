// MultiX v17 — estado editable en cada solicitud
(function(){
  'use strict';
  const STATES=['Solicitado','En curso','En tránsito','Recibido'];
  const escLocal=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const activeCenters=()=>typeof window.mxGetActiveCenters==='function'?window.mxGetActiveCenters():null;
  const persist=()=>{try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}if(typeof window.mxPersistDraft==='function')try{window.mxPersistDraft(true);}catch(_){}};
  const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'-');
  const options=value=>STATES.map(s=>`<option value="${s}"${s===value?' selected':''}>${s}</option>`).join('');

  function installStyles(){
    if(document.getElementById('mxRequestStatusV17Styles'))return;
    const st=document.createElement('style');st.id='mxRequestStatusV17Styles';st.textContent=`
      .request-status-select{min-width:132px;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-weight:800;background:#0d2230;color:var(--text);outline:none}
      .request-status-select.solicitado{color:#ffd37a;border-color:#80652d}
      .request-status-select.en-curso{color:#8bd8ff;border-color:#266383}
      .request-status-select.en-transito{color:#d7b6ff;border-color:#654487}
      .request-status-select.recibido{color:#78e6cf;border-color:#21745f}
      @media(max-width:760px){.request-status-select{min-width:145px}}
    `;document.head.appendChild(st);
  }

  function setupNewRequestSelector(){
    const sel=document.getElementById('rStatus');if(!sel)return;
    const current=STATES.includes(sel.value)?sel.value:'Solicitado';
    sel.innerHTML=options(current);sel.value=current;
  }

  window.mxRequestStatusChanged=function(index,value,el){
    if(!STATES.includes(value)||!data?.requests?.[index])return;
    data.requests[index].status=value;
    data.requests[index].statusUpdatedAt=new Date().toISOString();
    persist();
    if(el)el.className='request-status-select '+slug(value);
    if(typeof window.mxRenderReportPreview==='function'&&document.getElementById('report')?.classList.contains('active'))setTimeout(()=>window.mxRenderReportPreview(),30);
  };

  function render(){
    const table=document.getElementById('requestTable');if(!table)return;
    const active=activeCenters();
    const rows=(data.requests||[]).map((r,i)=>({r,i})).filter(({r})=>!active||active.includes(r.center)||r.center==='Área / Base Cisnes');
    table.innerHTML=rows.map(({r,i})=>{
      const status=STATES.includes(r.status)?r.status:'Solicitado';
      if(r.status!==status)r.status=status;
      return `<tr>
        <td>${escLocal(r.center)}</td>
        <td>${escLocal(r.equipment)}</td>
        <td>${escLocal(r.material)}${r.notes?`<div class="helper">${escLocal(r.notes)}</div>`:''}</td>
        <td>${escLocal(r.requestedTo)}</td>
        <td>${escLocal(r.date)}</td>
        <td><select class="request-status-select ${slug(status)}" onchange="mxRequestStatusChanged(${i},this.value,this)">${options(status)}</select></td>
        <td><button class="btn small danger" onclick="delRequest(${i})">Eliminar</button></td>
      </tr>`;
    }).join('')||'<tr><td colspan="7" class="empty">Sin solicitudes</td></tr>';
  }

  function install(){
    if(typeof data==='undefined'||!document.getElementById('requestTable'))return false;
    installStyles();setupNewRequestSelector();
    window.renderRequests=render;
    render();
    return true;
  }

  function start(){let tries=0;const t=setInterval(()=>{tries++;if(install())clearInterval(t);else if(tries>100)clearInterval(t);},100);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
