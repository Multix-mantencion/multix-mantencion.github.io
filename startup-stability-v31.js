// MultiX v31 — estabiliza el arranque y evita el parpadeo entre dashboards
(function(){
'use strict';
const STYLE_ID='mxStartupStabilityV31Style';
const HIDDEN='mx-startup-stabilizing';
function host(){return document.getElementById('summary');}
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent=`#summary.${HIDDEN}{visibility:hidden!important}#summary.${HIDDEN} *{animation:none!important;transition:none!important}`;
  document.head.appendChild(s);
}
function hide(){const h=host();if(h)h.classList.add(HIDDEN);}
function reveal(){const h=host();if(!h)return;requestAnimationFrame(()=>requestAnimationFrame(()=>h.classList.remove(HIDDEN)));}
function exactReady(){const h=host();return !!(window.__mxeV29Hooks&&h&&h.querySelector('.mxe-shell'));}
function patchRenderAll(){
  if(window.__mxStableRenderAllV31||typeof window.renderAll!=='function'||!window.__mxeV29Hooks)return false;
  window.__mxStableRenderAllV31=true;
  const old=window.renderAll;
  window.renderAll=function(){
    const h=host(),home=!!(h&&h.classList.contains('active'));
    if(home)h.classList.add(HIDDEN);
    const r=old.apply(this,arguments);
    setTimeout(()=>{
      if(home&&typeof window.renderSummary==='function')try{window.renderSummary();}catch(_){}
      reveal();
    },90);
    return r;
  };
  return true;
}
function settle(){
  if(exactReady()){
    patchRenderAll();
    reveal();
    return true;
  }
  return false;
}
installStyle();hide();
let tries=0;const t=setInterval(()=>{tries++;if(settle()||tries>200){clearInterval(t);reveal();}},50);
window.addEventListener('pageshow',()=>{if(!exactReady())hide();setTimeout(settle,0);});
})();
