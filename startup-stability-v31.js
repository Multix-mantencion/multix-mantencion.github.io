// MultiX v31.2 — estabilizador seguro: nunca bloquear la aplicación
(function(){
'use strict';
function reveal(){
  try{document.body&&document.body.classList.remove('mx-startup-loading');}catch(_){}
  try{document.getElementById('summary')?.classList.remove('mx-startup-stabilizing');}catch(_){}
}
function refresh(){
  reveal();
  try{if(typeof window.renderSummary==='function')window.renderSummary();}catch(e){console.warn('Dashboard no disponible todavía',e);}
}
reveal();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{reveal();setTimeout(refresh,80);},{once:true});
else setTimeout(refresh,0);
window.addEventListener('pageshow',()=>setTimeout(refresh,50));
setTimeout(reveal,500);
setTimeout(reveal,1500);
})();
