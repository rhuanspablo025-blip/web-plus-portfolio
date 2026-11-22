/* Small, event-driven interactions. No continuous render loop. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const stage = document.querySelector('main .hero-stage');
  const cards = [...document.querySelectorAll('main .work-card, main .person-card, main .service-card')];
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const range = root.scrollHeight - innerHeight;
    header?.style.setProperty('--read-progress', range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0);
    if (stage) stage.style.setProperty('--stage-drift', !reduce.matches && fine.matches ? `${Math.min(18, scrollY * .035)}px` : '0px');
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  addEventListener('scroll', scheduleScroll, {passive:true});
  addEventListener('resize', scheduleScroll, {passive:true});
  addEventListener('pageshow', scheduleScroll);
  updateScroll();

  const interactive = [...cards, ...document.querySelectorAll('main .hero-stage')];
  interactive.forEach(el => {
    let frame = 0, latest;
    const reset = () => {
      cancelAnimationFrame(frame); frame = 0; el.classList.remove('pointer-active');
      el.style.setProperty('--tilt-x','0deg'); el.style.setProperty('--tilt-y','0deg');
    };
    el.addEventListener('pointermove', e => {
      if (reduce.matches || !fine.matches || e.pointerType !== 'mouse') return;
      latest = {x:e.clientX,y:e.clientY};
      if (frame) return;
      frame=requestAnimationFrame(() => {
        frame=0;
        const box=el.getBoundingClientRect();
        const x=Math.max(0,Math.min(1,(latest.x-box.left)/box.width));
        const y=Math.max(0,Math.min(1,(latest.y-box.top)/box.height));
        el.style.setProperty('--light-x',`${x*100}%`);el.style.setProperty('--light-y',`${y*100}%`);
        el.style.setProperty('--tilt-x',`${(0.5-y)*4}deg`);el.style.setProperty('--tilt-y',`${(x-0.5)*5}deg`);
        el.classList.add('pointer-active');
      });
    },{passive:true});
    el.addEventListener('pointerleave',reset);
    el.addEventListener('pointercancel',reset);
    fine.addEventListener('change',reset); reduce.addEventListener('change',reset);
  });

  // Accent animations run once, when their section actually reaches the viewport.
  const accents = document.querySelectorAll('main .work-card,main .about-rule,main .manifesto,main .person-card,main .contact-section,main .bio-facts');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('detail-entered');observer.unobserve(entry.target);}
    }),{threshold:.18});
    accents.forEach(el=>observer.observe(el));
  } else accents.forEach(el=>el.classList.add('detail-entered'));

  document.querySelectorAll('main .button,main .experience-replay,.contact-section a.button').forEach(el=>{
    el.classList.add('press-feedback');
    el.addEventListener('pointerdown',e=>{
      if(reduce.matches || (e.button !== 0 && e.pointerType === 'mouse'))return;
      const bounds=el.getBoundingClientRect();
      const wave=document.createElement('span');wave.className='tap-wave';wave.setAttribute('aria-hidden','true');
      const size=Math.max(bounds.width,bounds.height)*2;
      Object.assign(wave.style,{width:`${size}px`,height:`${size}px`,left:`${e.clientX-bounds.left-size/2}px`,top:`${e.clientY-bounds.top-size/2}px`});
      el.querySelector('.tap-wave')?.remove();el.append(wave);
      wave.addEventListener('animationend',()=>wave.remove(),{once:true});
      setTimeout(()=>wave.remove(),800);
    },{passive:true});
  });

  // The mobile menu has a visible closing transition and cannot retain hidden focus.
  const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('#site-nav');
  if(toggle && nav){
    const mobile=matchMedia('(max-width: 760px)');
    function syncMenu(){nav.inert=mobile.matches && toggle.getAttribute('aria-expanded')!=='true';}
    function closeMenu(returnFocus=false){
      if(toggle.getAttribute('aria-expanded')!=='true') return;
      toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');nav.classList.remove('open');syncMenu();
      if(returnFocus)toggle.focus();
    }
    toggle.addEventListener('click',syncMenu);
    nav.addEventListener('click',syncMenu);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu(true);});
    document.addEventListener('pointerdown',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
    mobile.addEventListener('change',()=>{closeMenu();syncMenu();});syncMenu();
  }
  reduce.addEventListener('change',scheduleScroll);
})();
