// MultiX v49 — navegación estable y separación simple entre secciones
(function(){
'use strict';
const $=id=>document.getElementById(id);
const SECTIONS=['summary','centers','feeding','requests','stock','history'];

function setNavActive(target){
  document.querySelectorAll('#mxeBottomNav [data-target]').forEach(b=>b.classList.toggle('active',b.dataset.target===target));
  document.querySelectorAll('.tabs .tab[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===target));
}

function applySection(id,navTarget=id){
  const real=SECTIONS.includes(id)?id:'summary';
  const home=real==='summary';
  document.body.classList.toggle('mxe-home',home);

  SECTIONS.forEach(name=>{
    const el=$(name);if(!el)return;
    const active=name===real;
    el.classList.toggle('active',active);
    if(active){
      el.style.removeProperty('display');
      el.removeAttribute('aria-hidden');
    }else{
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
    }
  });

  const activeEl=$(real);
  if(activeEl&&!home)activeEl.style.setProperty('display','block','important');
  if(home){
    const summary=$('summary');
    if(summary)summary.style.removeProperty('display');
  }
  setNavActive(navTarget);
}

function patchSwitchTab(){
  if(window.__mxStableNavPatchedV49||typeof window.switchTab!=='function')return false;
  window.__mxStableNavPatchedV49=true;
  const old=window.switchTab;
  window.switchTab=function(id){
    const r=old.apply(this,arguments);
    setTimeout(()=>{
      if(SECTIONS.includes(id))applySection(id,id);
      else if(id==='works')applySection('centers','works');
      else if(id==='report')applySection('history','report');
    },0);
    return r;
  };
  return true;
}

function openWorks(){
  if(typeof window.switchTab==='function')window.switchTab('centers');
  else applySection('centers','works');
  setNavActive('works');
}

function openReport(){
  const reportBtn=$('mxReportTab');
  if(reportBtn){
    reportBtn.click();
    document.body.classList.remove('mxe-home');
    setNavActive('report');
    return;
  }
  if(typeof window.switchTab==='function')window.switchTab('history');
  else applySection('history','report');
  setNavActive('report');
}

function navigate(target){
  if(target==='works'){openWorks();return;}
  if(target==='report'){openReport();return;}
  if(!SECTIONS.includes(target))return;
  if(typeof window.switchTab==='function')window.switchTab(target);
  else applySection(target,target);
  if(target==='summary'&&typeof window.renderSummary==='function')setTimeout(()=>{try{window.renderSummary();}catch(_){}},20);
}

function bindNavigation(){
  if(window.__mxStableNavClicksV49)return;
  window.__mxStableNavClicksV49=true;
  document.addEventListener('click',e=>{
    const bottom=e.target.closest('#mxeBottomNav [data-target]');
    if(bottom){
      e.preventDefault();
      e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      navigate(bottom.dataset.target);
      return;
    }
    const top=e.target.closest('.tabs .tab[data-tab]');
    if(top){
      e.preventDefault();
      e.stopPropagation();
      navigate(top.dataset.tab);
    }
  },true);
}

function safety(){
  document.querySelectorAll('[hidden]').forEach(el=>{if(el.matches('.mx-req-modal,.mx-req-complete-modal,.mx-fail-modal,.mx-resolution-modal,.mx-workhist-modal'))el.style.setProperty('display','none','important');});
  const active=SECTIONS.find(id=>$(id)?.classList.contains('active'))||'summary';
  applySection(active,active);
}

function start(){
  bindNavigation();
  patchSwitchTab();
  safety();
  setTimeout(()=>{patchSwitchTab();safety();},120);
  setTimeout(()=>{patchSwitchTab();safety();},600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
