/* Web Plus brand film. Native dialog keeps keyboard focus inside the experience. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero-actions');
  const revealTargets = document.querySelectorAll('.section-title-row,.about-layout,.service-card,.work-card,.person-card,.profile-card,.bio-layout,.portfolio-item');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.08});
    revealTargets.forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--reveal-delay', `${i % 3 * 70}ms`); observer.observe(el); });
    reduced.addEventListener('change', e => { if(e.matches) {observer.disconnect();revealTargets.forEach(el=>el.classList.add('is-visible'));} });
  }
  const header = document.querySelector('.header');
  let scrollPending = false;
  addEventListener('scroll', () => { if(scrollPending) return; scrollPending = true; requestAnimationFrame(() => {header?.classList.toggle('scrolled', scrollY > 30);scrollPending = false;}); }, {passive:true});
  if (!hero || typeof HTMLDialogElement === 'undefined') return;
  const replay = document.createElement('button');
  replay.className = 'experience-replay'; replay.type = 'button';
  replay.innerHTML = '<span class="play-symbol" aria-hidden="true"></span> Viva a experiência <small>42 segundos</small>';
  hero.after(replay);
  const dialog = document.createElement('dialog');
  dialog.className = 'brand-film'; dialog.setAttribute('aria-label', 'A experiência Web Plus');
  const atlas = document.querySelector('.atlas-visual')?.outerHTML || '';
  const crm = document.querySelector('.crm-visual')?.outerHTML || '';
  const scenes = [
    {name:'Essência',start:0,html:`<div class="film-logo-art"><div class="film-orbit"></div><div class="film-orbit orbit-two"></div><img src="assets/webplus.jpg" width="768" height="768" alt="Logo Web Plus"><div class="logo-halo"></div></div><div class="film-copy"><span class="film-eyebrow">WEB PLUS · IDEIAS EM MOVIMENTO</span><h2>O digital começa<br>com uma <em>sensação.</em></h2><p>A de que sua próxima ideia pode ir além.</p></div>`},
    {name:'Propósito',start:7,html:`<div class="film-type"><span class="film-eyebrow">É SOBRE O QUE FICA.</span><h2>Sentir.<br><em>Confiar.</em><br>Se conectar.</h2><div class="film-values"><span>Dedicação no processo.</span><span>Cuidado em cada detalhe.</span><span>Profissionalismo na entrega.</span></div></div><div class="feeling-rings" aria-hidden="true"><i></i><i></i><i></i></div>`},
    {name:'AtlasFit',start:14,html:`<div class="film-copy"><span class="film-eyebrow">NOSSO UNIVERSO / ATLASFIT</span><h2>Tecnologia.<br>Com <em>propósito.</em></h2><p>Treino, acompanhamento e gestão.<br>Um produto pensado para quem move pessoas.</p><span class="film-tag">SaaS próprio · em desenvolvimento</span></div><div class="film-product">${atlas}<span class="film-caption">Composição ilustrativa do produto</span></div>`},
    {name:'Comercial',start:23,html:`<div class="film-copy"><span class="film-eyebrow">NOSSO UNIVERSO / COMERCIAL WEB PLUS</span><h2>Conexões viram<br><em>possibilidades.</em></h2><p>Da primeira conversa ao próximo projeto.<br>Organização para dar direção a cada oportunidade.</p></div><div class="film-product">${crm}<span class="film-caption">Composição ilustrativa da ferramenta</span></div>`},
    {name:'Pessoas',start:30,html:`<div class="film-people"><span class="film-eyebrow">POR TRÁS DE CADA ENTREGA</span><h2>Gente que pensa.<br>Gente que <em>faz.</em></h2><div class="film-founders"><div><b>Rhuan</b><span>Desenvolvimento<br>Estratégias e soluções</span></div><div><b>Tiago</b><span>Comercial e vendas<br>Networking</span></div></div><p>Dois olhares. O mesmo compromisso com seu projeto.</p></div>`},
    {name:'Seu próximo passo',start:36,html:`<div class="film-end"><span class="film-eyebrow">WEB PLUS</span><h2>Seu próximo passo<br>merece ser<br><em>extraordinário.</em></h2><p>Vamos construir essa experiência juntos.</p><button type="button" class="film-enter">Conhecer a Web Plus</button></div>`}
  ];
  dialog.innerHTML = `<div class="film-ambient" aria-hidden="true"></div><header class="film-top"><span class="film-signature">web<span>plus.</span></span><span class="film-descriptor">UMA EXPERIÊNCIA WEB PLUS</span><button class="film-skip" type="button" autofocus>Pular abertura</button></header><div class="film-stage">${scenes.map((s,i)=>`<section class="film-scene scene-${i}" aria-hidden="true" inert>${s.html}</section>`).join('')}</div><footer class="film-controls"><div class="film-control-row"><button class="film-pause" type="button">Pausar</button><span class="film-current" aria-live="polite"></span><span class="film-time" aria-hidden="true">00:00 / 00:42</span></div><nav class="film-chapters" aria-label="Capítulos da abertura">${scenes.map((s,i)=>`<button type="button" data-scene="${i}" aria-label="Ver capítulo: ${s.name}"><span>${s.name}</span><i></i></button>`).join('')}</nav></footer>`;
  document.body.append(dialog);
  const sections = [...dialog.querySelectorAll('.film-scene')];
  const chapters = [...dialog.querySelectorAll('[data-scene]')];
  const pauseButton = dialog.querySelector('.film-pause');
  let elapsed = 0, last = 0, frame = 0, active = -1, paused = false, previousFocus;
  const duration = 42;
  function render() {
    const index = scenes.findLastIndex(scene => elapsed >= scene.start);
    if(active !== index) {
      active = index;
      sections.forEach((el,i)=>{el.classList.toggle('active',i===index);el.inert=i!==index;el.setAttribute('aria-hidden',String(i!==index));});
      dialog.querySelector('.film-current').textContent = scenes[index].name;
      chapters.forEach((el,i)=>{if(i===index) el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    }
    chapters.forEach((el,i)=>{const end=scenes[i+1]?.start??duration;el.style.setProperty('--chapter-progress',Math.max(0,Math.min(1,(elapsed-scenes[i].start)/(end-scenes[i].start))));});
    dialog.querySelector('.film-time').textContent = `00:${String(Math.floor(elapsed)).padStart(2,'0')} / 00:42`;
  }
  function tick(now) {
    if(!dialog.open) return;
    if(!paused && !document.hidden) elapsed += (now-last)/1000;
    last=now;
    if(elapsed>=duration){closeFilm();return;}
    render(); frame=requestAnimationFrame(tick);
  }
  function syncPause() {dialog.classList.toggle('film-paused',paused||document.hidden);pauseButton.textContent=paused?'Continuar':'Pausar';pauseButton.setAttribute('aria-pressed',String(paused));}
  function openFilm() {
    if(dialog.open) return;
    previousFocus=document.activeElement;elapsed=0;active=-1;paused=reduced.matches;
    dialog.showModal();document.documentElement.classList.add('film-open');render();syncPause();
    last=performance.now();frame=requestAnimationFrame(tick);
    try{sessionStorage.setItem('webplus-film-v1','seen');}catch{}
  }
  function cleanup() {cancelAnimationFrame(frame);document.documentElement.classList.remove('film-open');(previousFocus instanceof HTMLElement && previousFocus!==document.body ? previousFocus : replay).focus({preventScroll:true});}
  function closeFilm(){if(dialog.open)dialog.close();}
  dialog.addEventListener('close',cleanup);
  dialog.querySelector('.film-skip').addEventListener('click',closeFilm);
  dialog.querySelector('.film-enter').addEventListener('click',closeFilm);
  pauseButton.addEventListener('click',()=>{paused=!paused;last=performance.now();syncPause();});
  chapters.forEach((button,i)=>button.addEventListener('click',()=>{elapsed=scenes[i].start;last=performance.now();render();}));
  document.addEventListener('visibilitychange',()=>{last=performance.now();syncPause();});
  reduced.addEventListener('change',e=>{if(e.matches){paused=true;syncPause();}});
  replay.addEventListener('click',openFilm);
  let seen=false;try{seen=sessionStorage.getItem('webplus-film-v1')==='seen';}catch{}
  if(!seen && !reduced.matches && !location.hash) openFilm();
})();
