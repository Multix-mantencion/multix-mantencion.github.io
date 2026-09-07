// MultiX v30 — barra de comandos visible y funcional sobre la navegación inferior
(function(){
'use strict';
const $=id=>document.getElementById(id);

function installStyles(){
  if($('mxCommandDockV30Styles'))return;
  const s=document.createElement('style');
  s.id='mxCommandDockV30Styles';
  s.textContent=`
    #mxeBottomNav{z-index:101!important}
    body.mxe-home>.bottom{display:none!important}
    body:not(.mxe-home)>.bottom{
      display:block!important;
      bottom:calc(72px + env(safe-area-inset-bottom))!important;
      z-index:100!important;
      padding:8px max(12px,env(safe-area-inset-left)) 8px max(12px,env(safe-area-inset-right))!important;
      background:rgba(5,22,32,.98)!important;
      border-top:1px solid #244658!important;
      box-shadow:0 -8px 24px rgba(0,0,0,.25);
      backdrop-filter:blur(12px);
    }
    body:not(.mxe-home)>.bottom .bottom-inner{gap:8px!important}
    body:not(.mxe-home)>.bottom .btn{
      min-height:48px;
      padding:10px 8px!important;
      border-radius:12px!important;
      font-size:12px!important;
      font-weight:850!important;
      white-space:nowrap;
    }
    body:not(.mxe-home)>.bottom #saveBtn{border-color:#315d78;background:#10283a;color:#eaf6fb}
    body:not(.mxe-home)>.bottom #newBtn{background:#4b3514;border-color:#8a651e;color:#ffd98d}
    body:not(.mxe-home)>.bottom #pdfBtn{background:#32c6ad;border-color:#32c6ad;color:#06211c}
    body:not(.mxe-home) .app{padding-bottom:calc(178px + env(safe-area-inset-bottom))!important}
    .editor.open .editor-inner{padding-bottom:calc(190px + env(safe-area-inset-bottom))!important}
    .mx-command-toast{
      position:fixed;left:50%;transform:translateX(-50%);
      bottom:calc(142px + env(safe-area-inset-bottom));z-index:120;
      background:#103246;color:#eaf8ff;border:1px solid #2b718e;
      border-radius:999px;padding:9px 14px;font-size:12px;font-weight:800;
      box-shadow:0 8px 26px rgba(0,0,0,.35);pointer-events:none;
      opacity:0;transition:opacity .18s ease;
    }
    .mx-command-toast.show{opacity:1}
    @media(max-width:420px){
      body:not(.mxe-home)>.bottom .btn{font-size:11px!important;padding-left:5px!important;padding-right:5px!important}
    }
  `;
  document.head.appendChild(s);
}

function toast(text){
  let t=$('mxCommandToastV30');
  if(!t){t=document.createElement('div');t.id='mxCommandToastV30';t.className='mx-command-toast';document.body.appendChild(t);}
  t.textContent=text;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove('show'),1700);
}

function saveEditorDraft(){
  const editor=$('editor');
  if(!editor?.classList.contains('open')||typeof currentCenter==='undefined'||!currentCenter||typeof data==='undefined'||!data?.centers?.[currentCenter])return false;
  const c=data.centers[currentCenter];
  try{if(typeof window.collectEq==='function')window.collectEq();}catch(_){}
  const val=id=>$(id)?.value??'';
  c.novelties=val('cNov');
  if($('cWorks'))c.works=val('cWorks');
  c.pending=val('cPending');
  c.companies=val('cCompanies');
  c.observations=val('cObs');
  c.plants=c.plants||{};
  c.plants.osmosis={status:val('osmosisStatus')||'Sin información',detail:val('osmosisDetail')};
  c.plants.treatment={status:val('treatmentStatus')||'Sin información',detail:val('treatmentDetail')};
  c.feeding={
    blower:val('fBlower')||'Sin información',
    selectors:val('fSelectors')||'Sin información',
    dosers:val('fDosers')||'Sin información',
    screw:val('fScrew')||'Sin información',
    vfd:val('fVfd')||'Sin información',
    notes:val('fNotes')
  };
  try{localStorage.setItem('multixMantencion',JSON.stringify(data));}catch(_){}
  try{if(typeof window.mxPersistDraft==='function')window.mxPersistDraft(true);}catch(_){}
  const st=$('saveState');if(st)st.textContent='Avance guardado '+new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
  toast('Avance del centro guardado');
  return true;
}

function bindCommands(){
  const saveBtn=$('saveBtn'),newBtn=$('newBtn'),pdfBtn=$('pdfBtn');
  if(saveBtn&&!saveBtn.dataset.mxV30){
    saveBtn.dataset.mxV30='1';saveBtn.textContent='Guardar avance';
    const old=saveBtn.onclick;
    saveBtn.onclick=function(e){
      if(saveEditorDraft())return;
      if(typeof old==='function')return old.call(this,e);
    };
  }
  if(newBtn&&!newBtn.dataset.mxV30){
    newBtn.dataset.mxV30='1';newBtn.textContent='Nuevo informe';
    const old=newBtn.onclick;
    newBtn.onclick=function(e){saveEditorDraft();if(typeof old==='function')return old.call(this,e);};
  }
  if(pdfBtn&&!pdfBtn.dataset.mxV30){
    pdfBtn.dataset.mxV30='1';pdfBtn.textContent='Crear PDF';
    const old=pdfBtn.onclick;
    pdfBtn.onclick=function(e){saveEditorDraft();if(typeof old==='function')return old.call(this,e);};
  }
}

function refresh(){installStyles();bindCommands();}
function start(){
  refresh();
  let n=0;const t=setInterval(()=>{n++;refresh();if(n>80)clearInterval(t);},150);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
