(() => {
  const actions = document.querySelector('.hero-actions');
  if (!actions || typeof HTMLDialogElement === 'undefined') return;

  const duration = 34;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const asset = file => 'assets/ident/' + file;
  const seenKey = 'webplus-studio-film-2';
  const beats = [
    { start: 0, art: 0, label: 'Estúdio digital · Minas Gerais', title: 'Ideias em<br><em>movimento.</em>', description: '' },
    { start: 7, art: 1, label: 'Produto próprio', title: 'Atlas<em>Fit.</em>', description: 'Fichas de treino e acompanhamento de alunos para professores e academias.' },
    { start: 15, art: 2, label: 'Ferramenta do estúdio', title: 'Comercial<br><em>Web Plus.</em>', description: 'Da primeira conversa ao acompanhamento de cada projeto.' },
    { start: 22.5, art: 0, label: 'Sócios da Web Plus', title: 'Rhuan <em>&</em> Tiago', description: '', team: true },
    { start: 28.5, art: 0, label: '', title: '', description: 'Sites, automações e produtos digitais.', signature: true }
  ];

  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'experience-replay';
  replay.innerHTML = '<span class="play-symbol" aria-hidden="true"></span>Assistir à abertura <small>34 segundos</small>';
  actions.after(replay);

  const dialog = document.createElement('dialog');
  dialog.className = 'ident';
  dialog.setAttribute('aria-label', 'Filme de apresentação da Web Plus');
  dialog.innerHTML = `
    <div class="ident-light" aria-hidden="true"></div>
    <canvas class="ident-rail" aria-hidden="true"></canvas>
    <div class="ident-grain" aria-hidden="true"></div>
    <div class="ident-top"><img class="ident-logotype" src="${asset('wordmark.webp')}" alt="Web Plus"></div>
    <div class="ident-sculpture" aria-hidden="true">
      <img src="${asset('signature.webp')}" alt="" width="720" height="720">
      <img data-still="${asset('atlas.webp')}" alt="" width="720" height="720">
      <img data-still="${asset('commercial.webp')}" alt="" width="720" height="720">
      <video muted playsinline preload="none" disablepictureinpicture></video>
    </div>
    <div class="ident-type" aria-live="off"></div>
    <div class="ident-controls">
      <button type="button" aria-label="Pausar apresentação" aria-pressed="false"><span class="ident-icon" aria-hidden="true"></span></button>
      <div class="ident-track" aria-hidden="true"><i></i></div>
      <span class="ident-clock" aria-hidden="true">00:34</span>
    </div>`;
  document.body.append(dialog);

  const captions = dialog.querySelector('.ident-type');
  const video = dialog.querySelector('video');
  const pauseButton = dialog.querySelector('button');
  const clock = dialog.querySelector('.ident-clock');
  const bar = dialog.querySelector('.ident-track i');
  const topMark = dialog.querySelector('.ident-logotype');
  const stills = [...dialog.querySelectorAll('.ident-sculpture img')];
  const rail = dialog.querySelector('.ident-rail');
  const pen = rail.getContext('2d');
  const copy = beats.map(beat => {
    const section = document.createElement('section');
    section.className = 'ident-caption';
    section.setAttribute('aria-hidden','true');
    if (beat.label) {
      const label = document.createElement('span');
      label.className = 'ident-label';
      label.textContent = beat.label;
      section.append(label);
    }
    const title = document.createElement('h2');
    title.className = 'ident-title';
    title.innerHTML = beat.signature
      ? `<img class="ident-lockup" src="${asset('wordmark.webp')}" alt="Web Plus">`
      : beat.title;
    section.append(title);
    if (beat.team) {
      const roles = document.createElement('dl');
      roles.className = 'ident-roles';
      roles.innerHTML = '<div><dt>Rhuan</dt><dd>Desenvolvimento e estratégia</dd></div><div><dt>Tiago</dt><dd>Comercial e parcerias</dd></div>';
      section.append(roles);
    } else if (beat.description) {
      const p = document.createElement('p');
      p.textContent = beat.description;
      section.append(p);
    }
    captions.append(section);
    return section;
  });

  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => { const n = clamp(value); return n*n*(3-2*n); };
  let elapsed = 0;
  let baseline = 0;
  let frame = 0;
  let paused = false;
  let active = -1;
  let lastPaint = -1;
  let lastSecond = -1;
  let runningVideo = false;
  let pendingSeek = false;
  let restoreFocus;
  let width = 0;
  let height = 0;
  let narrow = false;

  function resize() {
    if (!dialog.open) return;
    width = dialog.clientWidth;
    height = dialog.clientHeight;
    narrow = width <= 720 && height > width;
    // The decorative strands are soft and drawn only on a modest pixel surface.
    const scale = Math.min(1, 1100 / Math.max(1, width, height));
    rail.width = Math.round(width*scale);
    rail.height = Math.round(height*scale);
    pen?.setTransform(scale,0,0,scale,0,0);
    paint();
  }

  function strands(t) {
    if (!pen) return;
    pen.clearRect(0,0,width,height);
    const cycle = reducedMotion.matches ? 0 : t*.21;
    const crest = Math.sin(cycle)*.065;
    const low = narrow ? .53 : .81;
    const gold = pen.createLinearGradient(0,0,width,height*.5);
    gold.addColorStop(0,'rgba(170,103,39,0)');
    gold.addColorStop(.24,'rgba(210,144,67,.42)');
    gold.addColorStop(.44,'rgba(250,213,139,.8)');
    gold.addColorStop(.68,'rgba(149,136,102,.38)');
    gold.addColorStop(1,'rgba(75,124,163,.05)');
    pen.strokeStyle=gold;
    for(let i=0;i<22;i++){
      const v=i/21;
      pen.globalAlpha=.12+.34*Math.sin(Math.PI*v);
      pen.lineWidth=i===10?1.3:.7;
      pen.beginPath();
      pen.moveTo(-.1*width,(low+.14+v*.035)*height);
      pen.bezierCurveTo(.23*width,(low+.02+v*.09)*height,
        .35*width,(low-.2+crest-v*.1)*height,
        .56*width,(low-.09+crest+v*.018)*height);
      pen.bezierCurveTo(.74*width,(low-.03+crest+v*.13)*height,
        .92*width,(.52-crest-v*.13)*height,1.12*width,(.53+v*.28)*height);
      pen.stroke();
    }
    pen.globalAlpha=1;
  }

  function timeNow() {
    if (paused || !baseline) return elapsed;
    return Math.min(duration, elapsed+(performance.now()-baseline)/1000);
  }

  function paint() {
    const t = timeNow();
    let index = 0;
    for (let i=1; i<beats.length; i++) if (t>=beats[i].start) index=i;
    const beat = beats[index];
    const local = Math.max(0,t-beat.start);
    const remaining = (beats[index+1]?.start ?? duration)-t;
    const enter = reducedMotion.matches ? 1 : ease((local+.09)/.72);
    const exit = reducedMotion.matches ? 1 : ease(remaining/.52);
    if (index!==active) {
      if (active>=0) {
        copy[active].style.opacity='0';
        copy[active].setAttribute('aria-hidden','true');
      }
      copy[index].setAttribute('aria-hidden','false');
      active=index;
    }
    copy[index].style.opacity=String(enter*exit);
    copy[index].style.translate=`0 ${(1-enter)*15-(1-exit)*7}px`;
    topMark.style.opacity=beat.signature ? '0' : '1';
    bar.style.transform=`scaleX(${t/duration})`;
    const second=Math.ceil(duration-t);
    if(second!==lastSecond) {
      clock.textContent=`00:${String(second).padStart(2,'0')}`;
      lastSecond=second;
    }
    // Never hold the visitor at a loading screen. Show the rendered still whenever
    // autoplay, a slow connection, or a decoder prevents a synchronized frame.
    const showMovie = runningVideo && !pendingSeek && video.readyState>=2 && Math.abs(video.currentTime-t)<.45 && !reducedMotion.matches;
    video.style.opacity=showMovie ? '1':'0';
    stills.forEach((img,i)=>{
      img.style.opacity=(!showMovie && i===beat.art) ? '1':'0';
      if (!showMovie && i===beat.art) {
        img.style.transform=reducedMotion.matches ? 'none' : `scale(${1.1-.09*ease(local/6)}) rotate(${(1-ease(local/5))*-3}deg)`;
      }
    });
    const finish = reducedMotion.matches ? 1 : ease((duration-t)/.85);
    dialog.style.opacity=String(finish);
    dialog.style.setProperty('--veil',finish);
    strands(t);
  }

  function loop(now) {
    frame=0;
    if(!dialog.open || paused || document.hidden) return;
    if(timeNow()>=duration) { dialog.close(); return; }
    if(now-lastPaint>=1000/30) { paint(); lastPaint=now; }
    frame=requestAnimationFrame(loop);
  }

  function startVideo() {
    if(reducedMotion.matches || navigator.connection?.saveData || !video.src || document.hidden || paused) return;
    if(video.readyState>=1 && Math.abs(video.currentTime-timeNow())>.18) {
      pendingSeek=true;
      video.currentTime=timeNow();
    }
    video.play().catch(()=>{runningVideo=false;});
  }

  function suspend() {
    elapsed=timeNow();
    baseline=0;
    cancelAnimationFrame(frame);
    frame=0;
    video.pause();
  }

  function resume() {
    if(!dialog.open || paused || document.hidden) return;
    baseline=performance.now();
    startVideo();
    if(!frame) frame=requestAnimationFrame(loop);
  }

  function setPaused(value) {
    suspend();
    paused=value;
    pauseButton.setAttribute('aria-pressed',String(paused));
    pauseButton.setAttribute('aria-label',paused?'Continuar apresentação':'Pausar apresentação');
    if(!paused) resume();
  }

  video.addEventListener('playing',()=>{runningVideo=true;});
  video.addEventListener('waiting',()=>{runningVideo=false;});
  video.addEventListener('seeked',()=>{pendingSeek=false;});
  video.addEventListener('canplay',()=>{
    if(dialog.open && !paused && !document.hidden) startVideo();
  });

  function openFilm() {
    if(dialog.open) return;
    restoreFocus=document.activeElement;
    elapsed=0; baseline=0; active=-1; lastSecond=-1; lastPaint=-1; paused=false;
    runningVideo=false; pendingSeek=false;
    for(const section of copy) {section.style.opacity='0';section.setAttribute('aria-hidden','true');}
    for(const img of stills) if(img.dataset.still && !img.hasAttribute('src')) img.src=img.dataset.still;
    dialog.showModal();
    document.documentElement.classList.add('ident-open');
    pauseButton.setAttribute('aria-pressed','false');
    pauseButton.setAttribute('aria-label','Pausar apresentação');
    resize();
    if(!reducedMotion.matches && !navigator.connection?.saveData) {
      if(!video.hasAttribute('src')) video.src=asset('studio.mp4');
      else if(video.readyState>=1) video.currentTime=0;
    }
    resume();
    try { sessionStorage.setItem(seenKey,'1'); } catch {}
  }

  pauseButton.addEventListener('click',()=>setPaused(!paused));
  dialog.addEventListener('cancel',event=>{event.preventDefault();setPaused(!paused);});
  dialog.addEventListener('close',()=>{
    suspend();
    document.documentElement.classList.remove('ident-open');
    const target=restoreFocus instanceof HTMLElement && restoreFocus!==document.body ? restoreFocus : document.querySelector('.hero h1');
    if(target) { if(!target.hasAttribute('tabindex') && target.tagName==='H1') target.tabIndex=-1; target.focus({preventScroll:true}); }
  });
  document.addEventListener('visibilitychange',()=>{
    if (!dialog.open) return;
    if(document.hidden) suspend(); else resume();
  });
  addEventListener('resize',resize,{passive:true});
  reducedMotion.addEventListener('change',()=>{
    if(dialog.open && reducedMotion.matches) dialog.close();
  });
  replay.addEventListener('click',openFilm);
  let seen=false;
  try { seen=sessionStorage.getItem(seenKey)==='1'; } catch {}
  if(!seen && !reducedMotion.matches && !location.hash) openFilm();
})();
