// MultiX v42-lite — historial de trabajos realizados, sin modificar navegación ni gráficos
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const fmtDate=v=>{if(!v)return 'Sin fecha';const p=String(v).split('-');return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(v);};
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
const ORDER=['Ganso','Puyuhuapi 2','Puyuhuapi 1','Pearson','Delta','Arbolito','Camargo','Yelen','Refugio','Yalac','Yalak'];

function allCenterNames(){
  const raw=Object.keys((typeof data!=='undefined'&&data?.centers)||{}),out=[];
  ORDER.forEach(w=>{const hit=raw.find(r=>norm(r)===norm(w));if(hit&&!out.includes(hit))out.push(hit);});
  raw.forEach(r=>{if(!out.includes(r))out.push(r);});
  return out;
}
function currentZone(){
  const z=$('mxeZoneArea')?.value||'Todas las zonas';
  return ['Todas las zonas','Área Puyuhuapi','Área Refugio'].includes(z)?z:'Todas las zonas';
}
function centersFor(zone){
  const all=allCenterNames();
  if(zone==='Área Refugio')return all.filter(n=>REFUGIO_SET.has(norm(n)));
  if(zone==='Área Puyuhuapi')return all.filter(n=>!REFUGIO_SET.has(norm(n)));
  return all;
}
function snapshots(){return [data,...(Array.isArray(data?.history)?data.history:[])];}
function historicalWorks(zone){
  const centers=centersFor(zone),m=new Map();
  snapshots().forEach(s=>centers.forEach(center=>{
    const c=s?.centers?.[center];if(!c)return;
    (c.workLog||[]).forEach((w,i)=>{
      const k=w.id||`w|${center}|${w.date||''}|${w.text||''}|${w.equipmentName||''}|${i}`;
      if(!m.has(k))m.set(k,{...w,center});
    });
  }));
  return [...m.values()].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.center||'').localeCompare(String(b.center||''),'es'));
}

function installStyles(){
  if($('mxWorksHistoryLiteV42Styles'))return;
  const s=document.createElement('style');s.id='mxWorksHistoryLiteV42Styles';s.textContent=`
    .mxe-kpi.mx-work-history-lite{cursor:pointer;position:relative}
    .mxe-kpi.mx-work-history-lite:active{transform:scale(.985)}
    .mx-work-lite-modal{position:fixed;inset:0;z-index:360;background:rgba(1,10,16,.76);display:flex;align-items:flex-end;justify-content:center;padding:14px 10px calc(18px + env(safe-area-inset-bottom));backdrop-filter:blur(5px)}
    .mx-work-lite-modal[hidden]{display:none!important}
    .mx-work-lite-sheet{width:min(760px,100%);max-height:min(84vh,860px);overflow:hidden;border:1px solid #315a6f;border-radius:20px;background:#071a25;box-shadow:0 18px 60px rgba(0,0,0,.58);display:flex;flex-direction:column}
    .mx-work-lite-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 17px;border-bottom:1px solid #234351}
    .mx-work-lite-head h3{margin:0;color:#f1f7fa;font-size:20px}.mx-work-lite-head p{margin:4px 0 0;color:#8ca5b4;font-size:11px;line-height:1.35}
    .mx-work-lite-close{border:1px solid #34596b;background:#102838;color:#e3edf1;border-radius:10px;padding:9px 12px;font-weight:900}
    .mx-work-lite-total{margin:10px 12px 0;border:1px solid #315264;background:#0b2230;border-radius:12px;padding:9px 12px;color:#a9c0cd;font-size:11px;font-weight:900}.mx-work-lite-total b{color:#eef7fa;font-size:18px;margin-left:4px}
    .mx-work-lite-list{padding:12px;overflow:auto}.mx-work-lite-item{border:1px solid #294a5a;background:#0b2230;border-radius:14px;padding:12px;margin-bottom:10px}
    .mx-work-lite-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.mx-work-lite-center{font-weight:950;color:#f4f8fa;font-size:15px}.mx-work-lite-date{color:#65d7ef;font-size:11px;font-weight:900;white-space:nowrap}
    .mx-work-lite-eq{color:#87d7f0;font-size:12px;font-weight:850;margin-top:5px}.mx-work-lite-text{color:#dbe5ea;font-size:13px;line-height:1.42;margin-top:7px}.mx-work-lite-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.mx-work-lite-chip{border:1px solid #355365;border-radius:999px;padding:4px 7px;font-size:9px;color:#a9bdc8;font-weight:850}.mx-work-lite-empty{padding:28px 18px;text-align:center;color:#8fa8b8}
    @media(max-width:520px){.mx-work-lite-center{font-size:14px}.mx-work-lite-date{font-size:10px}}
  `;document.head.appendChild(s);
}
function ensureModal(){
  let m=$('mxWorkHistoryLiteV42');if(m)return m;
  m=document.createElement('div');m.id='mxWorkHistoryLiteV42';m.className='mx-work-lite-modal';m.hidden=true;
  m.innerHTML=`<div class="mx-work-lite-sheet"><div class="mx-work-lite-head"><div><h3>Trabajos realizados</h3><p id="mxWorkLiteSubtitle">Histórico de trabajos registrados.</p></div><button class="mx-work-lite-close" id="mxWorkLiteClose" type="button">Cerrar</button></div><div class="mx-work-lite-total">Total histórico:<b id="mxWorkLiteTotal">0</b></div><div class="mx-work-lite-list" id="mxWorkLiteList"></div></div>`;
  document.body.appendChild(m);
  $('mxWorkLiteClose').onclick=()=>m.hidden=true;
  m.addEventListener('click',e=>{if(e.target===m)m.hidden=true;});
  return m;
}
function renderModal(){
  const zone=currentZone(),rows=historicalWorks(zone),m=ensureModal();
  $('mxWorkLiteSubtitle').textContent=zone;
  $('mxWorkLiteTotal').textContent=String(rows.length);
  $('mxWorkLiteList').innerHTML=rows.length?rows.map(w=>`<article class="mx-work-lite-item"><div class="mx-work-lite-top"><div class="mx-work-lite-center">${esc(w.center||'Sin centro')}</div><div class="mx-work-lite-date">${esc(fmtDate(w.date))}</div></div><div class="mx-work-lite-eq">${esc(w.equipmentName||'General')}</div><div class="mx-work-lite-text">${esc(w.text||'Sin descripción')}</div><div class="mx-work-lite-meta"><span class="mx-work-lite-chip">${esc(w.maintenanceType||'Sin clasificar')}</span>${w.mechanic?`<span class="mx-work-lite-chip">Mecánico: ${esc(w.mechanic)}</span>`:''}</div></article>`).join(''):'<div class="mx-work-lite-empty">No hay trabajos realizados registrados para esta selección.</div>';
  m.hidden=false;
}
function findCard(){
  const host=$('summary');if(!host)return null;
  return [...host.querySelectorAll('.mxe-kpi')].find(c=>norm(c.textContent).includes('trabajos realizados'))||null;
}
function decorate(){
  const card=findCard();if(!card)return;
  card.classList.add('mx-work-history-lite');card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('title','Ver histórico de trabajos realizados');
}
function install(){
  installStyles();ensureModal();decorate();
  const host=$('summary');if(host&&!host.dataset.mxWorkLiteObserver){host.dataset.mxWorkLiteObserver='1';new MutationObserver(decorate).observe(host,{childList:true,subtree:true});}
  document.addEventListener('click',e=>{const card=e.target.closest?.('.mxe-kpi');if(card&&card===findCard())renderModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('mxWorkHistoryLiteV42');if(m&&!m.hidden)m.hidden=true;return;}const card=e.target.closest?.('.mxe-kpi');if(card&&card===findCard()&&(e.key==='Enter'||e.key===' ')){e.preventDefault();renderModal();}});
}
let tries=0;const t=setInterval(()=>{tries++;if(typeof data!=='undefined'&&$('summary')){clearInterval(t);install();}else if(tries>120)clearInterval(t);},100);
})();
