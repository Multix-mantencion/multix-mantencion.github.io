// MultiX v34 — Fallas abiertas como estado actual + detalle desplegable
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const REFUGIO_SET=new Set(['yelen','refugio','yalac','yalak']);
function allCenters(){return Object.keys(data?.centers||{});}
function centersFor(zone){const all=allCenters();if(zone==='Área Refugio')return all.filter(n=>REFUGIO_SET.has(norm(n)));if(zone==='Área Puyuhuapi')return all.filter(n=>!REFUGIO_SET.has(norm(n)));return all;}
function isOpenStatus(status){const s=norm(status);return s.includes('abiert')||s.includes('en proceso')||s.includes('pendiente');}
function failureKey(center,f){return [norm(center),norm(f?.equipmentName||f?.equipment||'General'),norm(f?.failureType||''),norm(f?.description||f?.detail||'')].join('|');}
function currentOpenFailures(zone){
  const allowed=new Set(centersFor(zone));
  const latest=new Map();
  const history=[...(Array.isArray(data?.history)?data.history:[])].sort((a,b)=>String(a?.meta?.end||a?.meta?.start||'').localeCompare(String(b?.meta?.end||b?.meta?.start||'')));
  const snaps=[...history,data];
  snaps.forEach(s=>{
    allowed.forEach(center=>{
      const c=s?.centers?.[center];if(!c)return;
      (c.failureLog||[]).forEach(f=>{latest.set(failureKey(center,f),{...f,center});});
    });
  });
  return [...latest.values()].filter(f=>isOpenStatus(f.status)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
}
function installStyles(){if($('mxFailuresV34Styles'))return;const s=document.createElement('style');s.id='mxFailuresV34Styles';s.textContent=`
.mxe-kpi.mx-open-failures{cursor:pointer;position:relative}.mxe-kpi.mx-open-failures:after{content:'Ver detalle';position:absolute;right:10px;bottom:8px;font-size:7px;font-weight:900;letter-spacing:.05em;text-transform:uppercase;color:#ff9298;opacity:.9}.mxe-kpi.mx-open-failures:active{transform:scale(.985)}
.mx-fail-modal{position:fixed;inset:0;z-index:300;background:rgba(1,10,16,.72);display:flex;align-items:flex-end;justify-content:center;padding:16px 12px calc(18px + env(safe-area-inset-bottom));backdrop-filter:blur(5px)}.mx-fail-modal[hidden]{display:none}.mx-fail-sheet{width:min(680px,100%);max-height:min(72vh,720px);overflow:hidden;border:1px solid #3c6174;border-radius:20px;background:#071a25;box-shadow:0 18px 60px rgba(0,0,0,.55);display:flex;flex-direction:column}.mx-fail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px;border-bottom:1px solid #244250}.mx-fail-head h3{margin:0;color:#f4f8fb;font-size:20px}.mx-fail-head p{margin:4px 0 0;color:#8fa8b8;font-size:12px}.mx-fail-close{border:1px solid #365768;background:#102838;color:#dfeaf0;border-radius:10px;padding:9px 12px;font-weight:900}.mx-fail-list{padding:12px;overflow:auto}.mx-fail-item{border:1px solid #294858;background:#0b2230;border-radius:14px;padding:13px;margin-bottom:10px}.mx-fail-row{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.mx-fail-center{font-weight:900;color:#f5f8fa;font-size:15px}.mx-fail-status{flex:0 0 auto;border-radius:999px;padding:5px 8px;background:#4b2028;color:#ff9aa0;font-size:10px;font-weight:900;text-transform:uppercase}.mx-fail-eq{margin-top:5px;color:#63d6f2;font-size:12px;font-weight:800}.mx-fail-desc{margin-top:7px;color:#d6e1e7;font-size:13px;line-height:1.4}.mx-fail-meta{margin-top:8px;color:#829cac;font-size:10px}.mx-fail-empty{padding:28px 18px;text-align:center;color:#8fa8b8}
`;
document.head.appendChild(s);}
function ensureModal(){let m=$('mxOpenFailuresModal');if(m)return m;m=document.createElement('div');m.id='mxOpenFailuresModal';m.className='mx-fail-modal';m.hidden=true;m.innerHTML='<div class="mx-fail-sheet"><div class="mx-fail-head"><div><h3>Fallas abiertas</h3><p id="mxFailSubtitle"></p></div><button type="button" class="mx-fail-close" id="mxFailClose">Cerrar</button></div><div class="mx-fail-list" id="mxFailList"></div></div>';document.body.appendChild(m);$('mxFailClose').onclick=()=>m.hidden=true;m.onclick=e=>{if(e.target===m)m.hidden=true;};return m;}
function currentZone(){return $('mxeZoneArea')?.value||$('summary')?.dataset?.mxeArea||'Todas las zonas';}
function openModal(){const zone=currentZone(),rows=currentOpenFailures(zone),m=ensureModal();$('mxFailSubtitle').textContent=`${zone} · ${rows.length} falla${rows.length===1?'':'s'} pendiente${rows.length===1?'':'s'} de cierre`;$('mxFailList').innerHTML=rows.length?rows.map(f=>`<article class="mx-fail-item"><div class="mx-fail-row"><div class="mx-fail-center">${esc(f.center)}</div><span class="mx-fail-status">${esc(f.status||'Abierta')}</span></div><div class="mx-fail-eq">${esc(f.equipmentName||f.equipment||'General')}</div><div class="mx-fail-desc">${esc(f.description||f.detail||'Sin descripción')}</div><div class="mx-fail-meta">${esc(f.date||'Sin fecha')}${f.failureType?' · '+esc(f.failureType):''}</div></article>`).join(''):'<div class="mx-fail-empty">No hay fallas abiertas en esta zona.</div>';m.hidden=false;}
function patchCard(){if(typeof data==='undefined')return;const summary=$('summary');if(!summary)return;const cards=[...summary.querySelectorAll('.mxe-kpi')];const card=cards.find(c=>norm(c.textContent).includes('fallas abiertas'));if(!card)return;const rows=currentOpenFailures(currentZone());card.classList.add('mx-open-failures');const num=card.querySelector('strong');if(num)num.textContent=String(rows.length);const em=card.querySelector('em');if(em)em.textContent='Estado actual';if(!card.dataset.mxFailV34){card.dataset.mxFailV34='1';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label','Ver fallas abiertas');card.onclick=openModal;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal();}};}}
function start(){installStyles();ensureModal();patchCard();const summary=$('summary');if(summary&&!window.__mxFailObsV34){window.__mxFailObsV34=new MutationObserver(()=>setTimeout(patchCard,20));window.__mxFailObsV34.observe(summary,{childList:true,subtree:true});}let n=0;const t=setInterval(()=>{n++;patchCard();if(n>120)clearInterval(t);},250);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
