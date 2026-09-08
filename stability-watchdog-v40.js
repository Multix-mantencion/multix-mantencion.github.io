// MultiX v40 — watchdog de estabilidad del inicio
(function(){
'use strict';
let attempts=0;
function unstick(){
  attempts++;
  try{document.body&&document.body.classList.remove('mx-startup-loading');}catch(_){}
  const s=document.getElementById('summary');
  try{s&&s.classList.remove('mx-startup-stabilizing');}catch(_){}
  if(!s)return;
  const hasDashboard=!!s.querySelector('.mxe-shell');
  if(!hasDashboard&&typeof window.renderSummary==='function'){
    try{window.renderSummary();}catch(e){console.warn('No se pudo reconstruir el panel de inicio',e);}
  }
  const ready=!!s.querySelector('.mxe-shell');
  if(!ready){
    // Fallback: mantener la aplicación utilizable aunque el dashboard falle.
    try{document.body.classList.remove('mxe-home');}catch(_){}
    s.style.visibility='visible';
    s.style.display='block';
  }
}
function start(){unstick();setTimeout(unstick,400);setTimeout(unstick,1200);setTimeout(unstick,3000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('pageshow',()=>setTimeout(unstick,100));
window.addEventListener('error',()=>setTimeout(unstick,0));
window.addEventListener('unhandledrejection',()=>setTimeout(unstick,0));
})();
