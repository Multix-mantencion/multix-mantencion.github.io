// MultiX v52 — refrescar acumulado histórico de fallas al registrar una falla actual
(function(){
'use strict';
function refreshDashboardFailures(){
  try{
    if(typeof window.renderSummary==='function'){
      window.renderSummary();
      return;
    }
    const zone=document.getElementById('mxeZoneArea');
    if(zone)zone.dispatchEvent(new Event('change',{bubbles:true}));
  }catch(e){console.warn('No se pudo refrescar el acumulado de fallas',e);}
}
function start(){
  document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('#mxFailureAddV24');
    if(!btn)return;
    setTimeout(refreshDashboardFailures,120);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
