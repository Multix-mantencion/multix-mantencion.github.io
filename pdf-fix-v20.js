// MultiX v20 — corrige error jsPDF.text y entrega robusta en iPhone/móvil
(function(){
  'use strict';
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isMobile=()=>isIOS()||/Android|Mobile/i.test(navigator.userAgent);
  let lastUrl=null,lastFile=null,lastName='Informe_Mantencion_MultiX.pdf';

  function fileName(){
    try{
      const end=(typeof data!=='undefined'&&data?.meta?.end)?String(data.meta.end):new Date().toISOString().slice(0,10);
      return `Informe_Mantencion_MultiX_${end.replaceAll('/','-')}.pdf`;
    }catch(_){return 'Informe_Mantencion_MultiX.pdf';}
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function revoke(){if(lastUrl){try{URL.revokeObjectURL(lastUrl);}catch(_){}lastUrl=null;}}

  // Corrige un bug del generador anterior: plant.forEach(para) entregaba también índice y array
  // a la función de texto, lo que terminaba enviando coordenadas inválidas a jsPDF.text().
  async function runWithTextFix(fn){
    const realForEach=Array.prototype.forEach;
    Array.prototype.forEach=function(callback,thisArg){
      if(typeof callback==='function'&&callback.name==='para'){
        for(let i=0;i<this.length;i++)callback.call(thisArg,this[i]);
        return;
      }
      return realForEach.call(this,callback,thisArg);
    };
    try{return await fn();}
    finally{Array.prototype.forEach=realForEach;}
  }

  function installStyles(){
    if(document.getElementById('mxPdfFixV20Styles'))return;
    const s=document.createElement('style');s.id='mxPdfFixV20Styles';s.textContent=`
      .mx-pdf-modal{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:20px}
      .mx-pdf-box{width:min(100%,430px);background:#0f2230;color:#eaf4f5;border:1px solid #294555;border-radius:18px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.45)}
      .mx-pdf-box h3{margin:0 0 8px;font-size:21px}.mx-pdf-box p{margin:0 0 18px;color:#a8bac4;line-height:1.45;font-size:14px}
      .mx-pdf-actions{display:grid;gap:10px}.mx-pdf-actions button,.mx-pdf-actions a{display:block;width:100%;box-sizing:border-box;border-radius:11px;padding:13px 14px;text-align:center;text-decoration:none;font-weight:800;font-size:15px;border:1px solid #315365;background:#163347;color:#eef9fa;cursor:pointer}
      .mx-pdf-actions .primary{background:#58e0d0;color:#09202a;border-color:#58e0d0}.mx-pdf-actions .close{background:transparent;color:#b6c4cc}
    `;document.head.appendChild(s);
  }

  async function share(){
    if(!lastFile)return false;
    try{
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[lastFile]})){
        await navigator.share({files:[lastFile],title:'Informe Técnico Semanal de Mantención'});
        return true;
      }
    }catch(e){if(e?.name==='AbortError')return true;}
    return false;
  }

  function showModal(){
    installStyles();document.getElementById('mxPdfFixV20Modal')?.remove();
    const m=document.createElement('div');m.className='mx-pdf-modal';m.id='mxPdfFixV20Modal';
    m.innerHTML=`<div class="mx-pdf-box"><h3>PDF creado correctamente</h3><p>El informe ya fue generado. Puedes compartirlo, abrirlo o guardarlo desde aquí.</p><div class="mx-pdf-actions"><button class="primary" id="mxPdfShareV20">Compartir / Guardar PDF</button><a id="mxPdfOpenV20" href="${esc(lastUrl||'#')}" target="_blank" rel="noopener">Abrir PDF</a><a id="mxPdfDownloadV20" href="${esc(lastUrl||'#')}" download="${esc(lastName)}">Descargar PDF</a><button class="close" id="mxPdfCloseV20">Cerrar</button></div></div>`;
    document.body.appendChild(m);
    document.getElementById('mxPdfShareV20').onclick=async()=>{if(await share())return;document.getElementById('mxPdfDownloadV20')?.click();};
    document.getElementById('mxPdfCloseV20').onclick=()=>m.remove();
    m.addEventListener('click',e=>{if(e.target===m)m.remove();});
  }

  async function captureGeneratedUrl(oldCreate){
    let captured=null;
    const realOpen=window.open;
    const fakeViewer={closed:false,document:{write(){},close(){}},location:{replace(url){captured=url;}},close(){this.closed=true;}};
    window.open=()=>fakeViewer;
    try{await runWithTextFix(()=>oldCreate());}
    finally{window.open=realOpen;}
    return captured;
  }

  async function install(){
    let tries=0;
    while(typeof window.mxCreatePdfNative!=='function'&&tries<120){await new Promise(r=>setTimeout(r,100));tries++;}
    if(typeof window.mxCreatePdfNative!=='function'||window.mxCreatePdfNative.__mxPdfFixV20)return;
    const oldCreate=window.mxCreatePdfNative;

    const fixed=async function(){
      // En escritorio solo aplicamos la corrección al generador existente.
      if(!isMobile())return runWithTextFix(()=>oldCreate());
      try{
        const captured=await captureGeneratedUrl(oldCreate);
        if(!captured)throw new Error('El informe se generó, pero no se pudo obtener el archivo PDF.');
        const res=await fetch(captured);
        if(!res.ok)throw new Error('No se pudo preparar el PDF para el teléfono.');
        const blob=await res.blob();
        revoke();lastName=fileName();lastUrl=URL.createObjectURL(blob);
        try{lastFile=new File([blob],lastName,{type:'application/pdf'});}catch(_){lastFile=blob;}
        if(await share())return;
        showModal();
      }catch(err){
        console.error('PDF fix v20',err);
        alert('No se pudo crear el PDF: '+(err?.message||'error desconocido'));
      }
    };
    fixed.__mxPdfFixV20=true;
    window.mxCreatePdfNative=fixed;

    // Asegura que ambos botones usen esta versión aunque existan listeners antiguos.
    document.addEventListener('click',e=>{
      const b=e.target?.closest?.('#pdfBtn,#mxCreatePdfFromPreview');
      if(!b)return;
      e.preventDefault();e.stopImmediatePropagation();fixed();
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
