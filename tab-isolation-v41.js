// MultiX v41 — separa correctamente Inicio y Centros
(function(){
'use strict';
const SECTION_IDS=['summary','centers','feeding','requests','stock','history'];
const $=id=>document.getElementById(id);

function installStyle(){
  if($('mxTabIsolationV41Style'))return;
  const s=document.createElement('style');
  s.id='mxTabIsolationV41Style';
  s.textContent=`
    .section:not(.active){display:none!important}
    body.mxe-home #summary:not(.active){display:none!important}
    body:not(.mxe-home) #summary:not(.active){display:none!important}
    #centers.active,#feeding.active,#requests.active,#stock.active,#history.active{display:block!important}
  `;
  document.head.appendChild(s);
}

function currentSection(){
  return SECTION_IDS.find(id=>$(id)?.classList.contains('active'))||'summary';
}

function syncVisualState(){
  const id=currentSection();
  const isHome=id==='summary';
  document.body.classList.toggle('mxe-home',isHome);
  const summary=$('summary');
  if(summary){
    if(isHome){summary.style.removeProperty('display');summary.removeAttribute('aria-hidden');}
    else{summary.style.setProperty('display','none','important');summary.setAttribute('aria-hidden','true');}
  }
  SECTION_IDS.filter(x=>x!=='summary').forEach(x=>{
    const el=$(x);if(!el)return;
    if(x===id){el.style.removeProperty('display');el.removeAttribute('aria-hidden');}
    else el.setAttribute('aria-hidden','true');
  });
  document.querySelectorAll('#mxeBottomNav [data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
  document.querySelectorAll('.tabs .tab[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
}

function forceSection(id){
  if(!SECTION_IDS.includes(id))return;
  SECTION_IDS.forEach(x=>$(x)?.classList.toggle('active',x===id));
  syncVisualState();
}

function patchSwitchTab(){
  if(window.__mxTabIsolationPatchedV41||typeof window.switchTab!=='function')return false;
  window.__mxTabIsolationPatchedV41=true;
  const old=window.switchTab;
  window.switchTab=function(id){
    const r=old.apply(this,arguments);
    if(SECTION_IDS.includes(id))setTimeout(()=>forceSection(id),35);
    else setTimeout(syncVisualState,35);
    return r;
  };
  return true;
}

function bindClicks(){
  if(window.__mxTabIsolationClicksV41)return;
  window.__mxTabIsolationClicksV41=true;
  document.addEventListener('click',e=>{
    const b=e.target.closest('.tabs .tab[data-tab],#mxeBottomNav [data-target]');
    if(!b)return;
    const id=b.dataset.tab||b.dataset.target;
    if(SECTION_IDS.includes(id))setTimeout(()=>forceSection(id),50);
  },true);
}

function observe(){
  if(window.__mxTabIsolationObserverV41)return;
  window.__mxTabIsolationObserverV41=true;
  const root=document.querySelector('.app')||document.body;
  new MutationObserver(()=>syncVisualState()).observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
}

function start(){
  installStyle();bindClicks();patchSwitchTab();observe();syncVisualState();
  let n=0;const t=setInterval(()=>{n++;patchSwitchTab();syncVisualState();if(n>40)clearInterval(t);},100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
