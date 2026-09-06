// MultiX: exportación PDF compatible con celular (iPhone/Android) y computador.
(function(){
  let pdfLibPromise=null;

  function loadPdfLibrary(){
    if(window.html2pdf) return Promise.resolve(window.html2pdf);
    if(pdfLibPromise) return pdfLibPromise;
    pdfLibPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.async=true;
      s.onload=()=>resolve(window.html2pdf);
      s.onerror=()=>reject(new Error('No se pudo cargar el generador PDF'));
      document.head.appendChild(s);
    });
    return pdfLibPromise;
  }

  function installPdfStyles(){
    if(document.getElementById('mxPdfExportStyles')) return;
    const st=document.createElement('style');
    st.id='mxPdfExportStyles';
    st.textContent=`
      .mx-pdf-export{width:190mm;background:#fff;color:#111;font-family:Arial,sans-serif;padding:8mm;box-sizing:border-box;line-height:1.35}
      .mx-pdf-export .pr-logo{height:30px;margin-bottom:9px}
      .mx-pdf-export .pr-title{font-size:19px;font-weight:800;margin:0;color:#101923}
      .mx-pdf-export .pr-sub{font-size:10px;color:#59636c;margin:3px 0 12px}
      .mx-pdf-export .pr-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:9px;border-bottom:2px solid #152333;padding-bottom:9px;margin-bottom:13px}
      .mx-pdf-export .pr-meta b{display:block;font-size:8px;margin-bottom:3px;color:#4d5963}
      .mx-pdf-export .pr-center{margin-bottom:15px}
      .mx-pdf-export .pr-center h2{font-size:15px;margin:0 0 8px;color:#101923}
      .mx-pdf-export .pr-section{margin:7px 0}
      .mx-pdf-export .pr-section h3{font-size:9px;color:#0f7e90;margin:0 0 4px;text-transform:uppercase}
      .mx-pdf-export .pr-section p,.mx-pdf-export .pr-section li{font-size:9px;line-height:1.35;margin:3px 0}
      .mx-pdf-export .pr-table{width:100%;border-collapse:collapse;table-layout:fixed}
      .mx-pdf-export .pr-table th,.mx-pdf-export .pr-table td{font-size:8px;padding:5px 4px;border-bottom:1px solid #d7dde1;color:#111;vertical-align:top;word-wrap:break-word}
      .mx-pdf-export .pr-table th{color:#505961;text-transform:uppercase}
      .mx-pdf-export .pr-equipment,.mx-pdf-export .pr-photo-section{break-inside:avoid;page-break-inside:avoid;margin-bottom:9px}
      .mx-pdf-export .pr-photo-section h4{font-size:8px;text-transform:uppercase;margin:4px 0;color:#0f7e90}
      .mx-pdf-export .pr-photos{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}
      .mx-pdf-export .pr-photos figure{margin:0}
      .mx-pdf-export .pr-photos img{width:100%;max-height:160px;object-fit:cover}
      .mx-pdf-export .pr-photos figcaption{font-size:7px;color:#4f5a63;margin-top:2px}
      .mx-pdf-export small{font-size:7px}
    `;
    document.head.appendChild(st);
  }

  function fileName(){
    const end=(window.data?.meta?.end||new Date().toISOString().slice(0,10)).replaceAll('/','-');
    return `Informe_Mantencion_MultiX_${end}.pdf`;
  }

  async function createPdf(){
    const btn=document.getElementById('pdfBtn');
    const previous=btn?.textContent||'Exportar PDF';
    try{
      if(typeof window.mxPersistDraft==='function') window.mxPersistDraft(true);
      else if(typeof window.save==='function') window.save();

      if(typeof window.buildPrint!=='function') throw new Error('El informe todavía no está listo. Actualiza la página e inténtalo nuevamente.');
      window.buildPrint();
      const report=document.getElementById('printReport');
      if(!report||!report.innerHTML.trim()) throw new Error('No hay contenido para generar el informe.');

      if(btn){btn.disabled=true;btn.textContent='Creando PDF…';}
      installPdfStyles();
      const html2pdf=await loadPdfLibrary();

      const exportBox=document.createElement('div');
      exportBox.className='mx-pdf-export';
      exportBox.setAttribute('aria-hidden','true');
      exportBox.innerHTML=report.innerHTML;
      exportBox.style.position='fixed';
      exportBox.style.left='-10000px';
      exportBox.style.top='0';
      exportBox.style.zIndex='-1';
      document.body.appendChild(exportBox);

      try{
        await html2pdf().set({
          margin:[8,8,8,8],
          filename:fileName(),
          image:{type:'jpeg',quality:0.92},
          html2canvas:{scale:1.45,useCORS:true,logging:false,backgroundColor:'#ffffff'},
          jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
          pagebreak:{mode:['css','legacy'],avoid:['.pr-equipment','.pr-photo-section']}
        }).from(exportBox).save();
      } finally {
        exportBox.remove();
      }

      if(btn) btn.textContent='PDF creado ✓';
      setTimeout(()=>{if(btn){btn.disabled=false;btn.textContent=previous;}},1800);
    }catch(err){
      console.error('Error creando PDF',err);
      if(btn){btn.disabled=false;btn.textContent=previous;}
      // Respaldo especialmente útil en Safari/iPhone: abre el diálogo nativo inmediatamente.
      try{
        if(typeof window.buildPrint==='function') window.buildPrint();
        window.print();
      }catch(_){
        alert((err&&err.message)||'No se pudo crear el PDF.');
      }
    }
  }

  // Precarga la librería para que al tocar el botón en el celular responda de inmediato.
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>loadPdfLibrary().catch(()=>{}));
  else loadPdfLibrary().catch(()=>{});

  // Captura el clic antes que los manejadores antiguos. Así evitamos el setTimeout que Safari móvil puede bloquear.
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#pdfBtn');
    if(!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    createPdf();
  },true);
})();
