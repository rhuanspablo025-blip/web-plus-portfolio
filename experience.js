/* Scroll reveals and header treatment shared by all portfolio pages. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
})();
