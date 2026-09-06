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
      try{
        if(typeof window.buildPrint==='function') window.buildPrint();
        window.print();
      }catch(_){
        alert((err&&err.message)||'No se pudo crear el PDF.');
      }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>loadPdfLibrary().catch(()=>{}));
  else loadPdfLibrary().catch(()=>{});

  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#pdfBtn');
    if(!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    createPdf();
  },true);
})();

// MultiX: vista previa del borrador semanal dentro de la aplicación.
(function(){
  function photoCount(){
    try{return Object.values(window.data?.centers||{}).reduce((n,c)=>n+(c.photos?.length||0),0);}catch(_){return 0;}
  }

  function installPreviewStyles(){
    if(document.getElementById('mxReportPreviewStyles'))return;
    const st=document.createElement('style');
    st.id='mxReportPreviewStyles';
    st.textContent=`
      .mx-report-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
      .mx-report-status{background:#0a1924;border:1px solid var(--line);border-radius:12px;padding:11px 13px;margin-bottom:14px;color:var(--muted);font-size:12px;line-height:1.45}
      .mx-report-status b{color:var(--teal)}
      .mx-report-sheet-wrap{overflow:auto;padding:2px 0 24px}
      .mx-report-sheet{width:min(100%,850px);margin:0 auto;background:#fff;color:#172033;border-radius:17px;padding:30px 32px;box-shadow:0 8px 30px rgba(0,0,0,.28);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.4}
      .mx-report-sheet .pr-logo{height:38px;max-width:180px;object-fit:contain;margin-bottom:11px}
      .mx-report-sheet .pr-title{font-size:28px;line-height:1.08;margin:0;color:#172033;font-weight:850;letter-spacing:.2px}
      .mx-report-sheet .pr-sub{font-size:14px;color:#566171;margin:5px 0 18px}
      .mx-report-sheet .pr-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;border-bottom:3px solid #172033;padding-bottom:15px;margin-bottom:22px;font-size:13px}
      .mx-report-sheet .pr-meta b{display:block;color:#778191;font-size:10px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:5px}
      .mx-report-sheet .pr-center{margin:0 0 26px}
      .mx-report-sheet .pr-center.page-break{break-before:auto}
      .mx-report-sheet .pr-center h2{font-size:19px;line-height:1.2;margin:0 0 15px;padding:10px 13px;background:#f2f4f6;border-radius:8px;color:#172033}
      .mx-report-sheet .pr-section{margin:13px 0}
      .mx-report-sheet .pr-section h3{font-size:13px;color:#0a8790;text-transform:uppercase;letter-spacing:.5px;margin:0 0 7px}
      .mx-report-sheet .pr-section p,.mx-report-sheet .pr-section li{font-size:14px;color:#3f4a5b;line-height:1.45;margin:4px 0}
      .mx-report-sheet .pr-table{width:100%;border-collapse:collapse;table-layout:fixed;margin:6px 0 11px}
      .mx-report-sheet .pr-table th{font-size:9px;text-transform:uppercase;letter-spacing:.35px;color:#778191;text-align:left;padding:7px 5px;border-bottom:1px solid #ccd4db}
      .mx-report-sheet .pr-table td{font-size:11px;vertical-align:top;padding:8px 5px;border-bottom:1px solid #e0e5e9;color:#283444;word-break:break-word}
      .mx-report-sheet .pr-equipment{margin-bottom:14px}
      .mx-report-sheet .pr-photo-section{margin:9px 0 16px}
      .mx-report-sheet .pr-photo-section h4{font-size:11px;text-transform:uppercase;color:#0a8790;margin:0 0 7px}
      .mx-report-sheet .pr-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .mx-report-sheet .pr-photos figure{margin:0;background:#f5f6f7;border-radius:9px;overflow:hidden}
      .mx-report-sheet .pr-photos img{display:block;width:100%;height:210px;object-fit:cover}
      .mx-report-sheet .pr-photos figcaption{font-size:10px;color:#596474;padding:7px 8px}
      .mx-report-sheet small{font-size:9px;color:#6a7481}
      .mx-report-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:14px}
      .mx-report-draft-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#153a34;color:#a9e5d5;font-size:10px;font-weight:800;letter-spacing:.4px;margin-left:6px}
      @media(max-width:760px){
        .mx-report-toolbar .btn{flex:1;min-width:130px}
        .mx-report-sheet{padding:20px 18px;border-radius:14px}
        .mx-report-sheet .pr-title{font-size:23px}
        .mx-report-sheet .pr-meta{grid-template-columns:1fr 1fr;gap:11px;font-size:12px}
        .mx-report-sheet .pr-center h2{font-size:17px}
        .mx-report-sheet .pr-section p,.mx-report-sheet .pr-section li{font-size:13px}
        .mx-report-sheet .pr-table th{font-size:8px;padding:6px 3px}
        .mx-report-sheet .pr-table td{font-size:9px;padding:7px 3px}
        .mx-report-sheet .pr-photos{grid-template-columns:1fr}
        .mx-report-sheet .pr-photos img{height:auto;max-height:300px}
      }
    `;
    document.head.appendChild(st);
  }

  function renderPreview(){
    const host=document.getElementById('mxReportPreview');
    const status=document.getElementById('mxReportPreviewStatus');
    if(!host)return;
    try{
      if(typeof window.mxPersistDraft==='function')window.mxPersistDraft(true);
      if(typeof window.buildPrint!=='function'){
        host.innerHTML='<div class="mx-report-empty">Preparando la vista del informe… intenta nuevamente en unos segundos.</div>';
        return;
      }
      window.buildPrint();
      const source=document.getElementById('printReport');
      const html=source?.innerHTML?.trim()||'';
      host.innerHTML=html?`<div class="mx-report-sheet">${html}</div>`:'<div class="mx-report-empty">Aún no hay información en el borrador semanal.</div>';
      if(status){
        const now=new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
        const start=window.data?.meta?.start||'Sin fecha';
        const end=window.data?.meta?.end||'Sin fecha';
        status.innerHTML=`<b>Borrador semanal en curso</b> · ${start} → ${end} · ${photoCount()} foto${photoCount()===1?'':'s'} · vista actualizada ${now}. <span class="mx-report-draft-pill">NO CIERRA LA SEMANA</span>`;
      }
    }catch(err){
      console.error('Error mostrando vista previa',err);
      host.innerHTML='<div class="mx-report-empty">No se pudo preparar la vista del informe. Guarda el avance e inténtalo nuevamente.</div>';
    }
  }
  window.mxRenderReportPreview=renderPreview;

  function copyReportText(){
    const sheet=document.querySelector('#mxReportPreview .mx-report-sheet');
    if(!sheet)return;
    const text=sheet.innerText.trim();
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(text).then(()=>alert('Texto del informe copiado.')).catch(()=>{});
      return;
    }
    const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Texto del informe copiado.');
  }

  function installPreviewUI(){
    if(document.getElementById('mxReportTab'))return;
    installPreviewStyles();
    const tabs=document.querySelector('.tabs');
    if(!tabs)return;
    const tab=document.createElement('button');
    tab.className='tab';tab.id='mxReportTab';tab.dataset.tab='report';tab.textContent='Informe';
    const historyTab=tabs.querySelector('[data-tab="history"]');
    historyTab?tabs.insertBefore(tab,historyTab):tabs.appendChild(tab);

    const section=document.createElement('section');
    section.className='section';section.id='report';
    section.innerHTML=`<div class="panel"><div class="mx-report-toolbar"><button class="btn" id="mxRefreshReport">Actualizar vista</button><button class="btn" id="mxCopyReport">Copiar texto</button><button class="btn primary" id="mxCreatePdfFromPreview">Crear PDF</button></div><div class="mx-report-status" id="mxReportPreviewStatus"><b>Borrador semanal en curso.</b> Esta vista muestra lo que llevas guardado hasta ahora, incluidas las fotografías.</div></div><div class="mx-report-sheet-wrap" id="mxReportPreview"></div>`;
    const history=document.getElementById('history');
    history?.parentNode?.insertBefore(section,history);

    tab.onclick=()=>{
      if(typeof window.mxPersistDraft==='function')window.mxPersistDraft(true);
      if(typeof window.switchTab==='function')window.switchTab('report');
      setTimeout(renderPreview,30);
    };
    document.getElementById('mxRefreshReport').onclick=renderPreview;
    document.getElementById('mxCopyReport').onclick=copyReportText;
    document.getElementById('mxCreatePdfFromPreview').onclick=()=>document.getElementById('pdfBtn')?.click();

    const save=document.getElementById('saveBtn');
    save?.addEventListener('click',()=>setTimeout(()=>{
      if(document.getElementById('report')?.classList.contains('active'))renderPreview();
    },120));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPreviewUI);
  else installPreviewUI();
})();
