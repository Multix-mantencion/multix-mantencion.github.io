// MultiX v60 — navegación final, directa y sin capas de wrappers
(function(){
'use strict';
const $=id=>document.getElementById(id);

function sections(){return [...document.querySelectorAll('.section')];}
function setNav(target){
  document.querySelectorAll('#mxeBottomNav [data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
  document.querySelectorAll('.tabs .tab[data-tab]').forEach(b=>{
    const real=target==='works'?'centers':target;
    b.classList.toggle('active',b.dataset.tab===real);
  });
}
function showSection(id,navTarget=id){
  const target=$(id);
  if(!target)return false;
  sections().forEach(el=>{
    const on=el.id===id;
    el.classList.toggle('active',on);
    if(on){el.style.removeProperty('display');el.removeAttribute('aria-hidden');}
    else{el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true');}
  });
  const home=id==='summary';
  document.body.classList.toggle('mxe-home',home);
  if(home){target.style.removeProperty('display');try{if(typeof window.renderSummary==='function')window.renderSummary();}catch(_){} }
  else target.style.setProperty('display','block','important');
  setNav(navTarget);
  window.scrollTo({top:0,behavior:'auto'});
  return true;
}
function openWorks(){
  if(!showSection('centers','works'))return;
  const preferred=(typeof currentCenter!=='undefined'&&currentCenter)||((typeof window.mxGetActiveCenters==='function'&&window.mxGetActiveCenters()[0])||'Ganso');
  setTimeout(()=>{try{if(preferred&&typeof window.openCenter==='function')window.openCenter(preferred);}catch(_){}},60);
}
function openReport(tries=0){
  if($('report')){
    showSection('report','report');
    try{if(typeof window.mxRenderReportPreview==='function')window.mxRenderReportPreview();}catch(_){}
    return;
  }
  if(tries<20)setTimeout(()=>openReport(tries+1),100);
  else showSection('history','report');
}
function navigate(target){
  if(target==='works'){openWorks();return;}
  if(target==='report'){openReport();return;}
  if(['summary','centers','requests','feeding','stock','history'].includes(target))showSection(target,target);
}
window.mxStableNavigateV60=navigate;

function installStyle(){
  if($('mxStableNavV60Style'))return;
  const s=document.createElement('style');s.id='mxStableNavV60Style';s.textContent=`
    .section:not(.active){display:none!important}
    #summary.active,#centers.active,#requests.active,#feeding.active,#stock.active,#history.active,#report.active{display:block!important}
    #mxeBottomNav{pointer-events:auto!important}
    #mxeBottomNav button{pointer-events:auto!important;touch-action:manipulation}
  `;document.head.appendChild(s);
}
function bind(){
  if(window.__mxStableNavV60Bound)return;window.__mxStableNavV60Bound=true;
  document.addEventListener('click',e=>{
    const bottom=e.target.closest?.('#mxeBottomNav [data-target]');
    if(bottom){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      navigate(bottom.dataset.target);return;
    }
    const top=e.target.closest?.('.tabs .tab[data-tab]');
    if(top){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      const t=top.dataset.tab;
      if(t==='report')openReport();else navigate(t);
      return;
    }
    const menu=e.target.closest?.('#mxeMenu [data-go]');
    if(menu){e.preventDefault();e.stopPropagation();navigate(menu.dataset.go);}
  },true);
}
function start(){
  installStyle();bind();
  const current=sections().find(s=>s.classList.contains('active'))?.id||'summary';
  showSection(current,current);
  setTimeout(()=>{const active=sections().find(s=>s.classList.contains('active'))?.id||'summary';showSection(active,active);},250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
