// MultiX v31.1 — carga inicial estable con indicador visible
(function(){
'use strict';
const STYLE_ID='mxStartupStabilityV31Style';
const HIDDEN='mx-startup-stabilizing';
const BODY='mx-startup-loading';
function host(){return document.getElementById('summary');}
function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;
  s.textContent=`
    body.${BODY}{background:linear-gradient(180deg,#001522,#00283a 46%,#001824)!important}
    body.${BODY} .topbar,body.${BODY} .stats,body.${BODY} .tabs,body.${BODY} .app>.meta,body.${BODY} .app>.period,body.${BODY} .app>.grid2:first-of-type{display:none!important}
    #summary.${HIDDEN}{display:block!important;visibility:visible!important;min-height:62vh!important;position:relative!important;padding:0!important;margin:0!important}
    #summary.${HIDDEN}>*{visibility:hidden!important;animation:none!important;transition:none!important}
    #summary.${HIDDEN}:after{content:'Cargando panel de mantención…';position:absolute;left:50%;top:34%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;min-width:220px;min-height:70px;padding:16px 20px;border-radius:16px;border:1px solid #0c6686;background:linear-gradient(180deg,#07344a,#052739);color:#dff8ff;font:800 14px/1.35 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.01em;box-shadow:0 12px 34px rgba(0,0,0,.22);visibility:visible!important;text-align:center}
  `;
  document.head.appendChild(s);
}
function hide(){const h=host();if(h)h.classList.add(HIDDEN);if(document.body)document.body.classList.add(BODY);}
function reveal(){const h=host();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(h)h.classList.remove(HIDDEN);if(document.body)document.body.classList.remove(BODY);}));}
function exactReady(){const h=host();return !!(window.__mxeZonesTotalV32&&h&&h.querySelector('.mxe-total-filter'));}
function patchRenderAll(){
  if(window.__mxStableRenderAllV31||typeof window.renderAll!=='function'||!window.__mxeZonesTotalV32)return false;
  window.__mxStableRenderAllV31=true;
  const old=window.renderAll;
  window.renderAll=function(){
    const h=host(),home=!!(h&&h.classList.contains('active'));
    if(home)hide();
    const r=old.apply(this,arguments);
    setTimeout(()=>{
      if(home&&typeof window.renderSummary==='function')try{window.renderSummary();}catch(_){}
      reveal();
    },70);
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
let tries=0;const t=setInterval(()=>{
  tries++;
  if(settle()){clearInterval(t);return;}
  if(tries>100){clearInterval(t);reveal();}
},50);
window.addEventListener('pageshow',()=>{if(!exactReady())hide();setTimeout(()=>{if(!settle())setTimeout(reveal,2500);},0);});
})();
