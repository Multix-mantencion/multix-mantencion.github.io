// MultiX v44-lite — detalle de equipos vencidos por horómetro, sin modificar navegación ni gráficos
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
const ORDER=['Ganso','Puyuhuapi 2','Puyuhuapi 1','Pearson','Delta','Arbolito','Camargo','Yelen','Refugio','Yalac','Yalak'];

function parseHours(v){
  const raw=String(v??'').trim();
  if(!raw||raw==='-')return null;
  const n=Number(raw.replace(/\s/g,'').replace(/\./g,'').replace(',','.'));
  return Number.isFinite(n)?n:null;
}
function fmtHours(v){
  const n=parseHours(v);if(n===null)return 'Sin dato';
  return new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(n)+' h';
}
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
function overdueEquipment(zone){
  const rows=[];
  centersFor(zone).forEach(center=>{
    const list=data?.centers?.[center]?.equipment||[];
    list.forEach(e=>{
      const current=parseHours(e.current),next=parseHours(e.next);
      const overdueByHours=current!==null&&next!==null&&current>=next;
      const markedOverdue=norm(e.status)==='vencido';
      if(!overdueByHours&&!markedOverdue)return;
      rows.push({...e,center,currentHours:current,nextHours:next,overdueHours:(current!==null&&next!==null)?Math.max(0,current-next):null});
    });
  });
  return rows.sort((a,b)=>(b.overdueHours??-1)-(a.overdueHours??-1)||String(a.center||'').localeCompare(String(b.center||''),'es')||String(a.name||'').localeCompare(String(b.name||''),'es'));
}

function installStyles(){
  if($('mxOverdueEquipmentLiteV44Styles'))return;
  const s=document.createElement('style');s.id='mxOverdueEquipmentLiteV44Styles';s.textContent=`
    .mxe-kpi.mx-overdue-equipment-lite{cursor:pointer;position:relative}
    .mxe-kpi.mx-overdue-equipment-lite:active{transform:scale(.985)}
    .mx-overdue-modal{position:fixed;inset:0;z-index:362;background:rgba(1,10,16,.76);display:flex;align-items:flex-end;justify-content:center;padding:14px 10px calc(18px + env(safe-area-inset-bottom));backdrop-filter:blur(5px)}
    .mx-overdue-modal[hidden]{display:none!important}
    .mx-overdue-sheet{width:min(760px,100%);max-height:min(84vh,860px);overflow:hidden;border:1px solid #5b5330;border-radius:20px;background:#071a25;box-shadow:0 18px 60px rgba(0,0,0,.58);display:flex;flex-direction:column}
    .mx-overdue-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 17px;border-bottom:1px solid #3b402d}
    .mx-overdue-head h3{margin:0;color:#f1f7fa;font-size:20px}.mx-overdue-head p{margin:4px 0 0;color:#aab3a0;font-size:11px;line-height:1.35}
    .mx-overdue-close{border:1px solid #5d5a39;background:#2b2a19;color:#f1ead0;border-radius:10px;padding:9px 12px;font-weight:900}
    .mx-overdue-total{margin:10px 12px 0;border:1px solid #625a2f;background:#2a2514;border-radius:12px;padding:9px 12px;color:#d9c98b;font-size:11px;font-weight:900}.mx-overdue-total b{color:#fff3bf;font-size:18px;margin-left:4px}
    .mx-overdue-list{padding:12px;overflow:auto}.mx-overdue-item{border:1px solid #4c4930;background:#151f22;border-radius:14px;padding:12px;margin-bottom:10px}
    .mx-overdue-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.mx-overdue-center{font-weight:950;color:#f4f8fa;font-size:15px}.mx-overdue-status{color:#ffd96a;font-size:10px;font-weight:950;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
    .mx-overdue-eq{color:#f4df93;font-size:13px;font-weight:900;margin-top:5px}.mx-overdue-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.mx-overdue-cell{border:1px solid #38454a;border-radius:10px;padding:8px;background:#0b1820}.mx-overdue-cell small{display:block;color:#8298a3;font-size:9px;text-transform:uppercase;letter-spacing:.05em;font-weight:850}.mx-overdue-cell b{display:block;color:#e8f0f3;font-size:13px;margin-top:3px}.mx-overdue-cell.alert b{color:#ffd96a}
    .mx-overdue-meta{margin-top:9px;color:#91a5af;font-size:10px;line-height:1.4}.mx-overdue-empty{padding:28px 18px;text-align:center;color:#8fa8b8}
    @media(max-width:520px){.mx-overdue-center{font-size:14px}.mx-overdue-grid{grid-template-columns:1fr 1fr}}
  `;document.head.appendChild(s);
}
function ensureModal(){
  let m=$('mxOverdueEquipmentLiteV44');if(m)return m;
  m=document.createElement('div');m.id='mxOverdueEquipmentLiteV44';m.className='mx-overdue-modal';m.hidden=true;
  m.innerHTML=`<div class="mx-overdue-sheet"><div class="mx-overdue-head"><div><h3>Equipos vencidos</h3><p id="mxOverdueSubtitle">Equipos con mantención preventiva vencida por horómetro.</p></div><button class="mx-overdue-close" id="mxOverdueClose" type="button">Cerrar</button></div><div class="mx-overdue-total">Vencidos por horómetro:<b id="mxOverdueTotal">0</b></div><div class="mx-overdue-list" id="mxOverdueList"></div></div>`;
  document.body.appendChild(m);
  $('mxOverdueClose').onclick=()=>m.hidden=true;
  m.addEventListener('click',e=>{if(e.target===m)m.hidden=true;});
  return m;
}
function renderModal(){
  const zone=currentZone(),rows=overdueEquipment(zone),m=ensureModal();
  $('mxOverdueSubtitle').textContent=`${zone} · Mantención preventiva vencida por horómetro`;
  $('mxOverdueTotal').textContent=String(rows.length);
  $('mxOverdueList').innerHTML=rows.length?rows.map(e=>`<article class="mx-overdue-item"><div class="mx-overdue-top"><div class="mx-overdue-center">${esc(e.center||'Sin centro')}</div><div class="mx-overdue-status">Vencido</div></div><div class="mx-overdue-eq">${esc(e.name||e.type||'Equipo')}</div><div class="mx-overdue-grid"><div class="mx-overdue-cell"><small>Horómetro actual</small><b>${esc(fmtHours(e.current))}</b></div><div class="mx-overdue-cell"><small>Próxima mantención</small><b>${esc(fmtHours(e.next))}</b></div><div class="mx-overdue-cell"><small>Última mantención</small><b>${esc(fmtHours(e.last))}</b></div><div class="mx-overdue-cell alert"><small>Horas vencidas</small><b>${e.overdueHours===null?'Según estado':esc(new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(e.overdueHours)+' h')}</b></div></div><div class="mx-overdue-meta">${e.type?`Tipo: ${esc(e.type)}`:''}${e.interval?` · Intervalo: ${esc(fmtHours(e.interval))}`:''}${e.reg?` · Código/registro: ${esc(e.reg)}`:''}</div></article>`).join(''):'<div class="mx-overdue-empty">No hay equipos con mantención preventiva vencida por horómetro en esta selección.</div>';
  m.hidden=false;
}
function findCard(){
  const host=$('summary');if(!host)return null;
  return [...host.querySelectorAll('.mxe-kpi')].find(c=>norm(c.textContent).includes('equipos vencidos'))||null;
}
function decorate(){
  const card=findCard();if(!card)return;
  card.classList.add('mx-overdue-equipment-lite');card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('title','Ver equipos vencidos por horómetro');
}
function install(){
  installStyles();ensureModal();decorate();
  const host=$('summary');if(host&&!host.dataset.mxOverdueLiteObserver){host.dataset.mxOverdueLiteObserver='1';new MutationObserver(decorate).observe(host,{childList:true,subtree:true});}
  document.addEventListener('click',e=>{const card=e.target.closest?.('.mxe-kpi');if(card&&card===findCard())renderModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('mxOverdueEquipmentLiteV44');if(m&&!m.hidden)m.hidden=true;return;}const card=e.target.closest?.('.mxe-kpi');if(card&&card===findCard()&&(e.key==='Enter'||e.key===' ')){e.preventDefault();renderModal();}});
}
let tries=0;const t=setInterval(()=>{tries++;if(typeof data!=='undefined'&&$('summary')){clearInterval(t);install();}else if(tries>120)clearInterval(t);},100);
})();
