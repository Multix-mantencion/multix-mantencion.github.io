// MultiX v51 — solicitudes en formato listado, sin cuadros
(function(){
'use strict';
const $=id=>document.getElementById(id);
function installStyles(){
  if($('mxRequestsListV51Styles'))return;
  const s=document.createElement('style');
  s.id='mxRequestsListV51Styles';
  s.textContent=`
    .mx-request-list-wrap{border:0!important;border-radius:0!important;overflow:visible!important;background:transparent!important}
    .mx-request-list-table{min-width:0!important;width:100%!important;border-collapse:collapse!important}
    .mx-request-list-table thead{display:none!important}
    .mx-request-list-table tbody{display:block!important;width:100%!important}
    .mx-request-list-table tbody tr{display:grid!important;grid-template-columns:1.15fr 1.15fr 2fr 1.15fr .9fr 1fr auto;align-items:center;gap:6px;width:100%;padding:10px 0;border-bottom:1px solid var(--line);background:transparent!important}
    .mx-request-list-table tbody tr:last-child{border-bottom:0}
    .mx-request-list-table tbody td{border:0!important;padding:3px 6px!important;min-width:0;font-size:13px;overflow-wrap:anywhere;background:transparent!important}
    .mx-request-list-table tbody td .helper{margin-top:3px}
    .mx-request-list-table .mx-req-empty{grid-column:1/-1;text-align:center;padding:18px!important;color:var(--muted)}
    @media(max-width:760px){
      .mx-request-list-table tbody tr{grid-template-columns:1fr auto;gap:4px 10px;padding:12px 0}
      .mx-request-list-table tbody td{grid-column:1/-1;padding:2px 0!important;display:flex;gap:7px;align-items:flex-start}
      .mx-request-list-table tbody td::before{content:attr(data-mx-label);flex:0 0 86px;color:var(--muted);font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em;padding-top:2px}
      .mx-request-list-table tbody td:nth-child(3){font-weight:700;color:var(--text)}
      .mx-request-list-table tbody td:last-child{grid-column:2;justify-self:end;display:block;padding-top:5px!important}
      .mx-request-list-table tbody td:last-child::before{display:none}
    }
  `;
  document.head.appendChild(s);
}
function patch(){
  const body=$('requestTable');
  if(!body)return false;
  const table=body.closest('table');
  const wrap=table?.closest('.tablewrap');
  if(!table||!wrap)return false;
  table.classList.add('mx-request-list-table');
  wrap.classList.add('mx-request-list-wrap');
  const labels=['Centro','Equipo','Solicitud','Solicitado a','Fecha','Estado',''];
  [...body.querySelectorAll('tr')].forEach(tr=>{
    const cells=[...tr.children];
    if(cells.length===1){cells[0].classList.add('mx-req-empty');return;}
    cells.forEach((td,i)=>td.setAttribute('data-mx-label',labels[i]||''));
  });
  return true;
}
function start(){
  installStyles();
  patch();
  let n=0;const t=setInterval(()=>{n++;if(patch()&&n>20)clearInterval(t);if(n>120)clearInterval(t);},250);
  const obs=new MutationObserver(()=>patch());
  obs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
