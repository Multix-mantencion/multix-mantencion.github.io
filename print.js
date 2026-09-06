// MultiX v8 — Vista de informe dentro de la app + PDF real compatible con iPhone/Android
(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const escHtml=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const state=()=>typeof data!=='undefined'?data:null;
  const centerNames=()=>typeof CENTER_NAMES!=='undefined'?CENTER_NAMES:Object.keys(state()?.centers||{});
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  function parseHours(v){
    const raw=String(v??'').trim();
    if(!raw||raw==='-')return null;
    const n=Number(raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));
    return Number.isFinite(n)?n:null;
  }
  function equipmentInterval(e){
    const t=((e?.type||'')+' '+(e?.name||'')).toLowerCase();
    if(t.includes('generador'))return 250;
    if(t.includes('bote fb')||t.includes('motor fuera')||t.includes('fuera borda'))return 300;
    return null;
  }
  function recalcEquipment(e){
    if(typeof mxRecalcEquipment==='function'){
      try{mxRecalcEquipment(e);return;}catch(_){ }
    }
    const interval=equipmentInterval(e),last=parseHours(e?.last),cur=parseHours(e?.current);
    if(interval!==null&&last!==null)e.next=String(last+interval);
    const next=parseHours(e?.next);
    if(!['Inoperativo','En observación'].includes(e?.status)&&cur!==null&&next!==null){
      e.status=cur>=next?'Vencido':(next-cur<=50?'Próximo':'OK');
    }
  }
  function formatHours(v){
    const n=parseHours(v);
    return n===null?'Sin dato':new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';
  }
  function persist(){
    try{
      if(typeof mxPersistDraft==='function')return mxPersistDraft(true);
      if(typeof syncMeta==='function')syncMeta();
      const d=state(); if(d)localStorage.setItem('multixMantencion',JSON.stringify(d));
    }catch(_){ }
  }
  function photoMatchesEquipment(p,e,i){
    if(p?.targetType!=='equipment')return false;
    const key='equipment:'+(e.id||('idx-'+i));
    return p.targetKey===key||(p.targetId&&e.id&&p.targetId===e.id)||(p.targetName&&p.targetName===(e.name||e.type));
  }
  function componentPhotos(photos,id){return photos.filter(p=>p?.targetType==='component'&&p?.targetId===id);}
  function generalPhotos(photos){return photos.filter(p=>!p?.targetType||p.targetType==='general');}
  function hasText(v){return String(v||'').trim().length>0;}

  function installStyles(){
    if($('mxReportV8Styles'))return;
    const st=document.createElement('style');st.id='mxReportV8Styles';
    st.textContent=`
      .mx-report-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.mx-report-toolbar .btn{min-width:130px}
      .mx-report-status{background:#0a1924;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:13px;color:var(--muted);font-size:12px;line-height:1.45}.mx-report-status b{color:var(--teal)}
      .mx-overdue-box{border:1px solid #8f3339;background:#24171a;border-radius:14px;padding:13px 15px;margin-bottom:15px;color:#f4bdc0}.mx-overdue-box b{display:block;color:#ff656a;margin-bottom:7px}.mx-overdue-box div{font-size:12px;line-height:1.5}
      .mx-report-sheet-wrap{overflow:auto;padding:2px 0 28px}.mx-report-sheet{width:min(100%,850px);margin:0 auto;background:#fff;color:#172033;border-radius:16px;padding:30px 32px;box-shadow:0 8px 30px rgba(0,0,0,.28);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;line-height:1.4}
      .mx-report-brand{font-weight:850;letter-spacing:4px;font-size:18px;margin-bottom:12px}.mx-report-sheet .pr-title{font-size:28px;line-height:1.08;margin:0;color:#172033;font-weight:850}.mx-report-sheet .pr-sub{font-size:14px;color:#566171;margin:5px 0 18px}
      .mx-report-sheet .pr-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;border-bottom:3px solid #172033;padding-bottom:15px;margin-bottom:22px;font-size:13px}.mx-report-sheet .pr-meta b{display:block;color:#778191;font-size:10px;letter-spacing:.6px;text-transform:uppercase;margin-bottom:5px}
      .mx-report-sheet .pr-center{margin:0 0 26px}.mx-report-sheet .pr-center h2{font-size:19px;line-height:1.2;margin:0 0 15px;padding:10px 13px;background:#f2f4f6;border-radius:8px;color:#172033}.mx-report-sheet .pr-section{margin:13px 0}.mx-report-sheet .pr-section h3{font-size:13px;color:#0a8790;text-transform:uppercase;letter-spacing:.5px;margin:0 0 7px}.mx-report-sheet .pr-section p{font-size:14px;color:#3f4a5b;line-height:1.45;margin:4px 0;white-space:pre-wrap}
      .mx-report-sheet .pr-table{width:100%;border-collapse:collapse;table-layout:fixed;margin:6px 0 11px}.mx-report-sheet .pr-table th{font-size:9px;text-transform:uppercase;color:#778191;text-align:left;padding:7px 5px;border-bottom:1px solid #ccd4db}.mx-report-sheet .pr-table td{font-size:11px;vertical-align:top;padding:8px 5px;border-bottom:1px solid #e0e5e9;color:#283444;word-break:break-word}.mx-report-sheet .pr-equipment{margin-bottom:14px}
      .mx-report-sheet .pr-photo-section{margin:9px 0 16px}.mx-report-sheet .pr-photo-section h4{font-size:11px;text-transform:uppercase;color:#0a8790;margin:0 0 7px}.mx-report-sheet .pr-photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mx-report-sheet .pr-photos figure{margin:0;background:#f5f6f7;border-radius:9px;overflow:hidden}.mx-report-sheet .pr-photos img{display:block;width:100%;height:210px;object-fit:cover}.mx-report-sheet .pr-photos figcaption{font-size:10px;color:#596474;padding:7px 8px}.mx-report-sheet small{font-size:9px;color:#6a7481}
      .mx-report-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:14px}
      @media(max-width:760px){.mx-report-toolbar .btn{flex:1}.mx-report-sheet{padding:20px 18px;border-radius:14px}.mx-report-sheet .pr-title{font-size:23px}.mx-report-sheet .pr-meta{grid-template-columns:1fr 1fr;gap:11px;font-size:12px}.mx-report-sheet .pr-center h2{font-size:17px}.mx-report-sheet .pr-section p{font-size:13px}.mx-report-sheet .pr-table th{font-size:8px;padding:6px 3px}.mx-report-sheet .pr-table td{font-size:9px;padding:7px 3px}.mx-report-sheet .pr-photos{grid-template-columns:1fr}.mx-report-sheet .pr-photos img{height:auto;max-height:300px}}
    `;
    document.head.appendChild(st);
  }

  function photoBlock(list,title){
    if(!list?.length)return'';
    return `<div class="pr-photo-section"><h4>${escHtml(title)}</h4><div class="pr-photos">${list.map(p=>`<figure><img src="${p.data}" alt="Foto"><figcaption>${escHtml(p.component||p.targetName||'')}</figcaption></figure>`).join('')}</div></div>`;
  }
  function textSection(title,text){return hasText(text)?`<div class="pr-section"><h3>${escHtml(title)}</h3><p>${escHtml(text)}</p></div>`:'';}

  function buildReportHTML(){
    const d=state();if(!d)return'';
    if(typeof syncMeta==='function'){try{syncMeta();}catch(_){ }}
    const m=d.meta||{};const parts=[];
    parts.push(`<div class="mx-report-brand">MULTI X</div><h1 class="pr-title">INFORME TÉCNICO SEMANAL DE MANTENCIÓN</h1><div class="pr-sub">Área Mantención – ${escHtml(m.zone||'Puyuhuapi / Base Cisnes')}</div><div class="pr-meta"><div><b>FECHA</b>${escHtml(m.end||'Sin fecha')}</div><div><b>PERIODO</b>${escHtml(m.start||'Sin fecha')} al ${escHtml(m.end||'Sin fecha')}</div><div><b>ÁREA</b>${escHtml(m.area||'Operaciones')}</div><div><b>MECÁNICO EN EL ÁREA</b>${escHtml(m.mechanic||'-')}</div></div>`);
    centerNames().forEach(name=>{
      const c=d.centers?.[name];if(!c)return;const photos=c.photos||[];
      const meaningful=hasText(c.novelties)||hasText(c.works)||hasText(c.pending)||hasText(c.companies)||hasText(c.observations)||(c.equipment||[]).length||photos.length||c.plants?.osmosis?.status!=='Sin información'||c.plants?.treatment?.status!=='Sin información';
      if(!meaningful)return;
      parts.push(`<div class="pr-center"><h2>${escHtml(name.toUpperCase())}</h2>`);
      parts.push(textSection('Novedades',c.novelties),textSection('Trabajos realizados',c.works));
      if((c.equipment||[]).length){
        parts.push('<div class="pr-section"><h3>Equipos</h3>');
        c.equipment.forEach((e,i)=>{recalcEquipment(e);parts.push(`<div class="pr-equipment"><table class="pr-table"><thead><tr><th>Equipo</th><th>Actual</th><th>Últ. mant.</th><th>Próxima</th><th>Estado</th></tr></thead><tbody><tr><td><b>${escHtml(e.name||e.type||'Equipo')}</b>${e.reg?`<br><small>N° registro: ${escHtml(e.reg)}</small>`:''}${e.notes?`<br><small>${escHtml(e.notes)}</small>`:''}</td><td>${escHtml(formatHours(e.current))}</td><td>${escHtml(formatHours(e.last))}</td><td>${escHtml(formatHours(e.next))}</td><td>${escHtml(e.status||'')}</td></tr></tbody></table>${photoBlock(photos.filter(p=>photoMatchesEquipment(p,e,i)),'Fotografías — '+(e.name||e.type||'Equipo'))}</div>`);});
        parts.push('</div>');
      }
      const os=componentPhotos(photos,'osmosis'),tr=componentPhotos(photos,'treatment');
      const plant=[];if(c.plants?.treatment?.status&&c.plants.treatment.status!=='Sin información')plant.push(`<b>Planta de Tratamiento:</b> ${escHtml(c.plants.treatment.status)}${c.plants.treatment.detail?' — '+escHtml(c.plants.treatment.detail):''}`);if(c.plants?.osmosis?.status&&c.plants.osmosis.status!=='Sin información')plant.push(`<b>Planta de Ósmosis:</b> ${escHtml(c.plants.osmosis.status)}${c.plants.osmosis.detail?' — '+escHtml(c.plants.osmosis.detail):''}`);if(plant.length||os.length||tr.length)parts.push(`<div class="pr-section"><h3>Plantas</h3>${plant.length?`<p>${plant.join('<br>')}</p>`:''}${photoBlock(tr,'Fotografías — Planta de Tratamiento')}${photoBlock(os,'Fotografías — Planta de Ósmosis')}</div>`);
      const f=c.feeding||{},feedPhotos=componentPhotos(photos,'feeding');const fv=[['Blower',f.blower],['Selectoras',f.selectors],['Doser',f.dosers],['Tornillo',f.screw],['Variadores',f.vfd]].filter(x=>x[1]&&x[1]!=='Sin información');if(fv.length||hasText(f.notes)||feedPhotos.length)parts.push(`<div class="pr-section"><h3>Sistema de alimentación</h3><p>${fv.map(x=>escHtml(x[0]+': '+x[1])).join(' · ')}${hasText(f.notes)?'<br>'+escHtml(f.notes):''}</p>${photoBlock(feedPhotos,'Fotografías — Sistema de Alimentación')}</div>`);
      parts.push(textSection('Trabajos pendientes',c.pending),textSection('Empresas en terreno',c.companies),textSection('Observaciones',c.observations));
      const other=photos.filter(p=>p.targetType==='component'&&!['osmosis','treatment','feeding'].includes(p.targetId));const groups={};other.forEach(p=>{const k=p.targetName||'Componente';(groups[k]||(groups[k]=[])).push(p)});Object.entries(groups).forEach(([k,v])=>parts.push(photoBlock(v,'Fotografías — '+k)));
      parts.push(photoBlock(generalPhotos(photos),'Fotografías generales del centro'));
      const req=(d.requests||[]).filter(r=>r.center===name);if(req.length)parts.push(`<div class="pr-section"><h3>Solicitudes y requerimientos</h3><table class="pr-table"><thead><tr><th>Equipo</th><th>Material / repuesto</th><th>Solicitado a</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>${req.map(r=>`<tr><td>${escHtml(r.equipment||'')}</td><td>${escHtml(r.material||'')}</td><td>${escHtml(r.requestedTo||'')}</td><td>${escHtml(r.date||'')}</td><td>${escHtml(r.status||'')}</td></tr>`).join('')}</tbody></table></div>`);
      parts.push('</div>');
    });
    return parts.join('');
  }

  function overdueHTML(){
    const d=state(),items=[];if(!d)return'';
    centerNames().forEach(name=>(d.centers?.[name]?.equipment||[]).forEach(e=>{recalcEquipment(e);if(['Vencido','Inoperativo'].includes(e.status))items.push(`${name} — ${e.name||e.type||'Equipo'} (${e.status})`);}));
    if(!items.length)return'';
    return `<div class="mx-overdue-box"><b>⚠ MANTENCIONES / EQUIPOS CON ALERTA</b>${items.map(t=>`<div>• ${escHtml(t)}</div>`).join('')}</div>`;
  }

  function renderPreview(){
    persist();const host=$('mxReportPreview'),status=$('mxReportPreviewStatus');if(!host)return;
    const html=buildReportHTML();
    host.innerHTML=(overdueHTML()||'')+(html?`<div class="mx-report-sheet">${html}</div>`:'<div class="mx-report-empty">Aún no hay información en el borrador semanal.</div>');
    const d=state(),photos=centerNames().reduce((n,name)=>n+(d?.centers?.[name]?.photos?.length||0),0);
    if(status){const now=new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});status.innerHTML=`<b>Informe de avance semanal</b> · ${escHtml(d?.meta?.start||'Sin fecha')} → ${escHtml(d?.meta?.end||'Sin fecha')} · ${photos} foto${photos===1?'':'s'} · actualizado ${now}. Esta vista no cierra la semana.`;}
  }
  window.mxRenderReportPreview=renderPreview;

  function installPreviewUI(){
    installStyles();if($('mxReportTab'))return;
    const tabs=document.querySelector('.tabs');if(!tabs)return;
    const tab=document.createElement('button');tab.className='tab';tab.id='mxReportTab';tab.dataset.tab='report';tab.textContent='Informe';
    const history=tabs.querySelector('[data-tab="history"]');history?tabs.insertBefore(tab,history):tabs.appendChild(tab);
    const section=document.createElement('section');section.className='section';section.id='report';
    section.innerHTML=`<div class="panel"><div class="mx-report-toolbar"><button class="btn" id="mxRefreshReport">Actualizar vista</button><button class="btn" id="mxCopyReport">Copiar texto</button><button class="btn primary" id="mxCreatePdfFromPreview">Crear PDF</button></div><div class="mx-report-status" id="mxReportPreviewStatus"><b>Informe de avance semanal.</b> Aquí verás exactamente lo que llevas guardado, incluidas las fotografías.</div></div><div class="mx-report-sheet-wrap" id="mxReportPreview"></div>`;
    const historySection=$('history');historySection?.parentNode?.insertBefore(section,historySection);
    tab.onclick=()=>{persist();if(typeof switchTab==='function')switchTab('report');else{document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='report'));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));}setTimeout(renderPreview,20);};
    $('mxRefreshReport').onclick=renderPreview;
    $('mxCopyReport').onclick=()=>{renderPreview();const sheet=document.querySelector('#mxReportPreview .mx-report-sheet');if(!sheet)return;const text=sheet.innerText.trim();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>alert('Texto del informe copiado.')).catch(()=>alert('No se pudo copiar el texto.'));};
    $('mxCreatePdfFromPreview').onclick=()=>createPdfNative();
    const save=$('saveBtn');if(save)save.addEventListener('click',()=>setTimeout(()=>{if($('report')?.classList.contains('active'))renderPreview();},100),true);
  }

  let jsPdfPromise=null;
  function loadJsPDF(){
    if(window.jspdf?.jsPDF)return Promise.resolve(window.jspdf.jsPDF);
    if(jsPdfPromise)return jsPdfPromise;
    jsPdfPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.async=true;s.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error('No se pudo iniciar el generador PDF'));s.onerror=()=>reject(new Error('No se pudo cargar el generador PDF'));document.head.appendChild(s);});
    return jsPdfPromise;
  }

  async function createPdfNative(){
    persist();
    const btn=$('pdfBtn'),previewBtn=$('mxCreatePdfFromPreview');
    let viewer=null;
    if(isIOS()){
      try{viewer=window.open('','_blank');if(viewer){viewer.document.write('<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:-apple-system;padding:30px;color:#222">Generando informe PDF…</body>');viewer.document.close();}}catch(_){viewer=null;}
    }
    try{
      if(btn){btn.disabled=true;btn.textContent='Creando PDF…';}if(previewBtn){previewBtn.disabled=true;previewBtn.textContent='Creando PDF…';}
      const jsPDF=await loadJsPDF();
      const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
      const d=state();if(!d)throw new Error('No se encontraron datos del informe.');
      if(typeof syncMeta==='function'){try{syncMeta();}catch(_){ }}
      const W=210,H=297,L=14,R=14,T=14,B=15,CW=W-L-R;let y=T;
      const black=[24,32,45],muted=[91,102,116],teal=[16,128,140],red=[190,45,52],line=[220,225,230];
      const setColor=c=>pdf.setTextColor(c[0],c[1],c[2]);
      const addPage=()=>{pdf.addPage();y=T;pdf.setFont('helvetica','bold');pdf.setFontSize(8);setColor(muted);pdf.text('MULTI X · Informe Técnico Semanal de Mantención',L,8);};
      const ensure=h=>{if(y+h>H-B)addPage();};
      const wrapped=(text,width,size=9)=>{pdf.setFontSize(size);return pdf.splitTextToSize(String(text||''),width);};
      const paragraph=(text,size=9,color=muted,indent=0)=>{if(!hasText(text))return;pdf.setFont('helvetica','normal');pdf.setFontSize(size);setColor(color);const lines=wrapped(text,CW-indent,size),lh=size*0.42+1.3;for(const ln of lines){ensure(lh+1);pdf.text(ln,L+indent,y);y+=lh;}y+=1.5;};
      const section=(title)=>{ensure(8);pdf.setFont('helvetica','bold');pdf.setFontSize(9);setColor(teal);pdf.text(String(title).toUpperCase(),L,y);y+=5;};
      const centerTitle=name=>{ensure(12);pdf.setFillColor(242,244,246);pdf.roundedRect(L,y-1,CW,9,2,2,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(12);setColor(black);pdf.text(String(name).toUpperCase(),L+4,y+5);y+=13;};
      const equipmentCard=(e)=>{recalcEquipment(e);ensure(19);pdf.setDrawColor(line[0],line[1],line[2]);pdf.roundedRect(L,y,CW,16,1.5,1.5,'S');pdf.setFont('helvetica','bold');pdf.setFontSize(9);setColor(black);pdf.text(String(e.name||e.type||'Equipo'),L+3,y+5);pdf.setFontSize(7.5);setColor(['Vencido','Inoperativo'].includes(e.status)?red:muted);pdf.text(String(e.status||''),W-R-3,y+5,{align:'right'});pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);setColor(muted);pdf.text(`Actual: ${formatHours(e.current)}   |   Últ. mant.: ${formatHours(e.last)}   |   Próxima: ${formatHours(e.next)}`,L+3,y+10);if(e.reg)pdf.text(`Serie / registro: ${String(e.reg)}`,L+3,y+14);y+=19;if(e.notes)paragraph(e.notes,7.5,muted,2);};
      const imageSize=(dataUrl,maxW,maxH)=>{try{const p=pdf.getImageProperties(dataUrl),r=p.width/p.height;let w=maxW,h=w/r;if(h>maxH){h=maxH;w=h*r;}return[w,h];}catch(_){return[maxW,maxH];}};
      const photosBlock=(list,title)=>{if(!list?.length)return;section(title);const gap=4,colW=(CW-gap)/2,maxH=52;for(let i=0;i<list.length;i+=2){ensure(maxH+14);const row=list.slice(i,i+2);row.forEach((p,j)=>{const x=L+j*(colW+gap);try{const [iw,ih]=imageSize(p.data,colW,maxH);pdf.addImage(p.data,'JPEG',x,y,iw,ih,undefined,'FAST');const cap=String(p.component||p.targetName||'').slice(0,70);pdf.setFont('helvetica','normal');pdf.setFontSize(7);setColor(muted);pdf.text(cap,x,y+ih+4,{maxWidth:colW});}catch(_){pdf.setDrawColor(200);pdf.rect(x,y,colW,35);pdf.setFontSize(7);setColor(muted);pdf.text('No se pudo insertar esta fotografía',x+2,y+5,{maxWidth:colW-4});}});y+=maxH+8;}y+=1;};

      pdf.setFont('helvetica','bold');pdf.setFontSize(11);setColor(black);pdf.text('MULTI X',L,y);y+=7;pdf.setFontSize(18);pdf.text('INFORME TÉCNICO SEMANAL',L,y);y+=7;pdf.text('DE MANTENCIÓN',L,y);y+=7;pdf.setFont('helvetica','normal');pdf.setFontSize(9);setColor(muted);pdf.text(`Área Mantención – ${d.meta?.zone||'Puyuhuapi / Base Cisnes'}`,L,y);y+=8;
      pdf.setDrawColor(25,38,52);pdf.line(L,y,W-R,y);y+=6;const meta=[['FECHA',d.meta?.end||'-'],['PERIODO',`${d.meta?.start||'-'} al ${d.meta?.end||'-'}`],['ÁREA',d.meta?.area||'Operaciones'],['MECÁNICO',d.meta?.mechanic||'-']];meta.forEach(([k,v],i)=>{const x=L+(i%2)*(CW/2),yy=y+Math.floor(i/2)*13;pdf.setFont('helvetica','bold');pdf.setFontSize(7);setColor(muted);pdf.text(k,x,yy);pdf.setFont('helvetica','normal');pdf.setFontSize(9);setColor(black);pdf.text(String(v),x,yy+5,{maxWidth:CW/2-4});});y+=28;

      const overdue=[];centerNames().forEach(name=>(d.centers?.[name]?.equipment||[]).forEach(e=>{recalcEquipment(e);if(['Vencido','Inoperativo'].includes(e.status))overdue.push(`${name} — ${e.name||e.type||'Equipo'} (${e.status})`);}));if(overdue.length){section('Alertas de mantención');overdue.forEach(t=>paragraph('• '+t,8.5,red,2));y+=2;}

      centerNames().forEach(name=>{
        const c=d.centers?.[name];if(!c)return;const photos=c.photos||[];const meaningful=hasText(c.novelties)||hasText(c.works)||hasText(c.pending)||hasText(c.companies)||hasText(c.observations)||(c.equipment||[]).length||photos.length||c.plants?.osmosis?.status!=='Sin información'||c.plants?.treatment?.status!=='Sin información';if(!meaningful)return;
        centerTitle(name);
        if(hasText(c.novelties)){section('Novedades');paragraph(c.novelties);}if(hasText(c.works)){section('Trabajos realizados');paragraph(c.works);}
        if((c.equipment||[]).length){section('Equipos');c.equipment.forEach((e,i)=>{equipmentCard(e);photosBlock(photos.filter(p=>photoMatchesEquipment(p,e,i)),'Fotografías — '+(e.name||e.type||'Equipo'));});}
        const plantLines=[];if(c.plants?.treatment?.status&&c.plants.treatment.status!=='Sin información')plantLines.push(`Planta de Tratamiento: ${c.plants.treatment.status}${c.plants.treatment.detail?' — '+c.plants.treatment.detail:''}`);if(c.plants?.osmosis?.status&&c.plants.osmosis.status!=='Sin información')plantLines.push(`Planta de Ósmosis: ${c.plants.osmosis.status}${c.plants.osmosis.detail?' — '+c.plants.osmosis.detail:''}`);if(plantLines.length){section('Plantas');plantLines.forEach(t=>paragraph(t));}photosBlock(componentPhotos(photos,'treatment'),'Fotografías — Planta de Tratamiento');photosBlock(componentPhotos(photos,'osmosis'),'Fotografías — Planta de Ósmosis');
        const f=c.feeding||{},fv=[['Blower',f.blower],['Selectoras',f.selectors],['Doser',f.dosers],['Tornillo',f.screw],['Variadores',f.vfd]].filter(x=>x[1]&&x[1]!=='Sin información');if(fv.length||hasText(f.notes)){section('Sistema de alimentación');paragraph(fv.map(x=>x[0]+': '+x[1]).join(' · ')+(hasText(f.notes)?'\n'+f.notes:''));}photosBlock(componentPhotos(photos,'feeding'),'Fotografías — Sistema de Alimentación');
        if(hasText(c.pending)){section('Trabajos pendientes');paragraph(c.pending);}if(hasText(c.companies)){section('Empresas en terreno');paragraph(c.companies);}if(hasText(c.observations)){section('Observaciones');paragraph(c.observations);}
        const other=photos.filter(p=>p.targetType==='component'&&!['osmosis','treatment','feeding'].includes(p.targetId)),groups={};other.forEach(p=>{const k=p.targetName||'Componente';(groups[k]||(groups[k]=[])).push(p)});Object.entries(groups).forEach(([k,v])=>photosBlock(v,'Fotografías — '+k));photosBlock(generalPhotos(photos),'Fotografías generales del centro');
        const req=(d.requests||[]).filter(r=>r.center===name);if(req.length){section('Solicitudes y requerimientos');req.forEach(r=>paragraph(`${r.equipment||'Equipo'} — ${r.material||''} — ${r.status||''}${r.requestedTo?' — Solicitado a: '+r.requestedTo:''}`,8.2));}
        y+=3;
      });

      const total=pdf.getNumberOfPages();for(let p=1;p<=total;p++){pdf.setPage(p);pdf.setFont('helvetica','normal');pdf.setFontSize(7);setColor(muted);pdf.text(`Página ${p} de ${total}`,W-R,H-7,{align:'right'});}
      const filename=`Informe_Mantencion_MultiX_${(d.meta?.end||new Date().toISOString().slice(0,10)).replaceAll('/','-')}.pdf`;
      const blob=pdf.output('blob');const url=URL.createObjectURL(blob);
      if(viewer&&!viewer.closed){viewer.location.replace(url);}else if(isIOS()){window.location.href=url;}else{pdf.save(filename);setTimeout(()=>URL.revokeObjectURL(url),60000);}
      if(btn)btn.textContent='PDF creado ✓';if(previewBtn)previewBtn.textContent='PDF creado ✓';setTimeout(()=>{if(btn){btn.disabled=false;btn.textContent='Crear PDF';}if(previewBtn){previewBtn.disabled=false;previewBtn.textContent='Crear PDF';}},1800);
    }catch(err){console.error(err);try{viewer?.close();}catch(_){ }if(btn){btn.disabled=false;btn.textContent='Crear PDF';}if(previewBtn){previewBtn.disabled=false;previewBtn.textContent='Crear PDF';}alert('No se pudo crear el PDF: '+(err?.message||'error desconocido')+'. Revisa tu conexión e inténtalo nuevamente.');}
  }
  window.mxCreatePdfNative=createPdfNative;

  function install(){
    installPreviewUI();const pdfBtn=$('pdfBtn');if(pdfBtn){pdfBtn.textContent='Crear PDF';pdfBtn.title='Genera un archivo PDF real con el informe y las fotografías';}
    loadJsPDF().catch(()=>{});
    document.addEventListener('click',e=>{const b=e.target?.closest?.('#pdfBtn');if(!b)return;e.preventDefault();e.stopImmediatePropagation();createPdfNative();},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.addEventListener('load',()=>{installPreviewUI();const b=$('pdfBtn');if(b)b.textContent='Crear PDF';});
})();
