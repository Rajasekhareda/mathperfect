
const MP = (() => {
  const costs = { worksheet_gen:10, activity:2, simulation:2, solver:5, question_download:8, exam_predict:25, video_play:3 };
  const guestQuota = { worksheet_gen:1, activity:1, simulation:1, solver:2, question_download:0, exam_predict:1, video_play:3 };
  const state = JSON.parse(localStorage.getItem('mp_session') || '{"role":"guest","tokens":0,"usage":{}}');
  function save(){ localStorage.setItem('mp_session', JSON.stringify(state)); render(); }
  function toast(msg){ const el=document.getElementById('toast'); if(!el) return alert(msg); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'), 3200); }
  function render(){ document.querySelectorAll('[data-token-pill]').forEach(el=>el.textContent=state.tokens||0); const read=document.getElementById('tokenReadout'); if(read) read.textContent=state.tokens||0; }
  function canAccess(action){
    const cost = costs[action] || 0;
    if(state.role === 'premium' || state.role === 'org'){
      if((state.tokens||0) >= cost){ state.tokens -= cost; save(); toast(`Premium access allowed. ${cost} tokens used.`); return true; }
      toast('Please recharge tokens to continue this premium action.'); return false;
    }
    const used = state.usage[action] || 0;
    const allowed = guestQuota[action] ?? 0;
    if(used < allowed){ state.usage[action] = used + 1; save(); toast(`Guest preview allowed. ${Math.max(0, allowed-used-1)} free tries left.`); return true; }
    toast('Guest preview limit reached. Activate premium for full access.'); return false;
  }
  function login(role){ state.role = role; if(role==='premium') state.tokens = Math.max(state.tokens||0, 250); if(role==='org') state.tokens = Math.max(state.tokens||0, 1200); save(); toast(`${role.toUpperCase()} demo activated.`); }
  function addTokens(n){ state.tokens=(state.tokens||0)+n; state.role='premium'; save(); toast(`${n} demo tokens added.`); }
  function resetSession(){ localStorage.removeItem('mp_session'); location.reload(); }
  function generateWorksheet(){ if(!canAccess('worksheet_gen')) return; const topic=document.getElementById('wsTopic')?.value||'Math'; const count = state.role==='guest' ? 5 : +(document.getElementById('wsCount')?.value||10); const out=document.getElementById('worksheetOutput'); const qs = Array.from({length:count},(_,i)=>`<li>${topic} practice question ${i+1}: solve and show your working.</li>`).join(''); out.innerHTML=`<h3>${topic} worksheet</h3><ol>${qs}</ol><p class="watermark">${state.role==='guest'?'MATHPERFECT DEMO':'PREMIUM'}</p>`; }
  function solveEquation(){ if(!canAccess('solver')) return; const out=document.getElementById('solverOutput'); out.innerHTML='<h3>Step-by-step solution</h3><ol><li>Start with: 2x + 5 = 17</li><li>Subtract 5 from both sides: 2x = 12</li><li>Divide by 2: x = 6</li><li>Check: 2(6)+5 = 17 ✓</li></ol>'; }
  document.addEventListener('DOMContentLoaded',()=>{
    render();
    const toggle=document.querySelector('.menu-toggle'); const nav=document.querySelector('.main-nav');
    toggle?.addEventListener('click',()=>{ const open=nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
    document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>canAccess(btn.dataset.action)));
    if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
  return { canAccess, login, addTokens, resetSession, generateWorksheet, solveEquation };
})();
