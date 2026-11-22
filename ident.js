(() => {
  const actions = document.querySelector('.hero-actions');
  if (!actions || typeof HTMLDialogElement === 'undefined') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 39;
  const key = 'webplus-forge-v1';
  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'experience-replay';
  replay.innerHTML = '<span class="play-symbol" aria-hidden="true"></span>Rever a experiência';
  actions.after(replay);

  const dialog = document.createElement('dialog');
  dialog.className = 'forge-intro';
  dialog.setAttribute('aria-label', 'A forja da Web Plus e Atlas Fit');
  dialog.innerHTML = `<canvas class="forge-canvas" aria-hidden="true"></canvas>
    <div class="forge-vignette" aria-hidden="true"></div>
    <div class="forge-copy" aria-live="off"><span class="forge-eyebrow"></span><h2></h2><p></p></div>
    <div class="forge-endmark" aria-hidden="true"><img src="assets/ident/wordmark.webp" alt=""></div>`;
  document.body.append(dialog);
  const canvas = dialog.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const eyebrow = dialog.querySelector('.forge-eyebrow');
  const heading = dialog.querySelector('.forge-copy h2');
  const detail = dialog.querySelector('.forge-copy p');
  const endmark = dialog.querySelector('.forge-endmark');
  const logo = new Image();
  logo.src = 'assets/ident/wordmark.webp';
  let w=0,h=0,scale=1,elapsed=0,baseline=0,raf=0,previous=-1,focusBefore=null;
  const clamp = n => Math.max(0,Math.min(1,n));
  const smooth = (a,b,t) => { const x=clamp((t-a)/(b-a)); return x*x*(3-2*x); };
  const mix=(a,b,t)=>a+(b-a)*t;
  const rand=(i,s=1)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};
  const captions=[
    [0,'O INÍCIO DE TUDO','Toda ideia começa bruta.','Três peças. Uma visão.'],
    [7,'A PRIMEIRA CRIAÇÃO','Duas forças. Uma identidade.','Web Plus — tecnologia e estratégia.'],
    [18,'UM PRODUTO GANHA FORMA','Forjado para evoluir.','Atlas Fit — movimento e performance.'],
    [28,'POR TRÁS DE CADA CRIAÇÃO','Rhuan & Tiago','Duas visões. Uma construção.'],
    [34,'WEB PLUS','O futuro é construído.','']
  ];
  function resize(){
    if(!dialog.open)return;
    w=dialog.clientWidth;h=dialog.clientHeight;
    scale=Math.min(devicePixelRatio||1,1.5,1200/Math.max(w,h));
    canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    ctx.setTransform(scale,0,0,scale,0,0);
    draw(time());
  }
  function glow(x,y,r,color,opacity=1){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,color);g.addColorStop(1,'transparent');
    ctx.globalAlpha=opacity;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.globalAlpha=1;
  }
  function ingot(x,y,size,heat,angle=0){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    const bw=size*1.25,bh=size*.54;
    ctx.shadowColor=heat>.2?'#e78c37':'#000';ctx.shadowBlur=heat*24+18;
    const g=ctx.createLinearGradient(-bw/2,-bh/2,bw/2,bh/2);
    g.addColorStop(0,heat>.4?'#b76529':'#18212b');
    g.addColorStop(.32,heat>.65?'#f9b75d':'#52606b');
    g.addColorStop(.56,heat>.4?'#b86530':'#202a34');
    g.addColorStop(1,'#0b111a');
    ctx.fillStyle=g;ctx.beginPath();
    ctx.moveTo(-bw*.47,-bh*.5);ctx.lineTo(bw*.42,-bh*.5);
    ctx.lineTo(bw*.5,-bh*.3);ctx.lineTo(bw*.5,bh*.38);
    ctx.lineTo(bw*.38,bh*.5);ctx.lineTo(-bw*.48,bh*.5);
    ctx.lineTo(-bw*.55,bh*.27);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,211,137,'+(.12+heat*.65)+')';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }
  function plate(x,y,r,formation){
    ctx.save();ctx.translate(x,y);
    ctx.rotate((1-formation)*-.38);
    ctx.shadowColor='#df8e46';ctx.shadowBlur=16*formation;
    const ring=ctx.createLinearGradient(-r,-r,r,r);
    ring.addColorStop(0,'#6a7982');ring.addColorStop(.25,'#222b35');
    ring.addColorStop(.5,'#e2a85b');ring.addColorStop(.76,'#364653');ring.addColorStop(1,'#0b141e');
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.arc(0,0,r*.28,0,Math.PI*2,true);
    ctx.fillStyle=ring;ctx.fill('evenodd');
    ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle='#e0a764';ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);ctx.strokeStyle='#84929b';ctx.lineWidth=2;ctx.stroke();
    ctx.textAlign='center';ctx.fillStyle='#f4d5a1';
    ctx.font='800 '+Math.max(12,r*.19)+'px system-ui';ctx.fillText('ATLAS FIT',0,-r*.47);
    ctx.font='600 '+Math.max(10,r*.11)+'px system-ui';ctx.fillText('STRENGTH • MOTION',0,r*.62);
    ctx.restore();
  }
  function person(x,y,s){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    ctx.shadowColor='#c68a4c';ctx.shadowBlur=16;
    ctx.fillStyle='#070b11';ctx.strokeStyle='#98714e';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.ellipse(0,-94,18,23,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-18,-70);ctx.quadraticCurveTo(-39,-66,-43,-35);
    ctx.lineTo(-48,46);ctx.lineTo(-25,50);ctx.lineTo(-20,4);
    ctx.lineTo(-15,90);ctx.lineTo(0,90);ctx.lineTo(7,12);
    ctx.lineTo(13,90);ctx.lineTo(30,90);ctx.lineTo(27,-4);
    ctx.lineTo(39,48);ctx.lineTo(53,44);ctx.lineTo(39,-48);
    ctx.quadraticCurveTo(34,-69,18,-70);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.restore();
  }
  function draw(t){
    if(!ctx)return;
    const narrow=w<700;
    ctx.fillStyle='#070c13';ctx.fillRect(0,0,w,h);
    const cx=w*.5,cy=h*(narrow?.42:.49),unit=Math.min(w*.22,h*.31,230);
    glow(w*.51,h*.57,Math.max(w,h)*.65,'rgba(25,48,70,.54)');
    glow(w*.48,h*.79,Math.max(w,h)*.38,'rgba(169,83,34,.27)',smooth(1,8,t));
    ctx.save();ctx.globalAlpha=.13;
    for(let i=0;i<35;i++){
      const yy=h*(.2+i/45);ctx.strokeStyle=i%3?'#6b5036':'#506478';
      ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy+Math.sin(t*.12+i)*7);ctx.stroke();
    }
    ctx.restore();
    const heat=smooth(2,10,t);
    const forge=smooth(8,17,t);
    const atlas=smooth(17,26,t);
    const figures=smooth(27,33,t);
    const zoom=smooth(34,39,t);
    // Three metallic blanks enter the scene and are heated before being reshaped.
    const ingotEntry=smooth(.4,4,t);
    const spread=narrow?unit*.76:unit*1.2;
    if(forge<1){
      ctx.globalAlpha=ingotEntry*(1-forge);
      ingot(mix(cx-spread,cx-unit*.24,forge),cy-unit*.12,unit*.57*(1-forge*.55),heat,forge*.3);
      ingot(mix(cx+spread*.25,cx+unit*.24,forge),cy-unit*.16,unit*.57*(1-forge*.55),heat,-forge*.3);
      ctx.globalAlpha=1;
    }
    if(atlas<1){
      ctx.globalAlpha=ingotEntry*(1-atlas);
      ingot(cx+spread*.75,cy+unit*.66,unit*.48*(1-atlas*.55),smooth(12,21,t),-.15);
      ctx.globalAlpha=1;
    }
    // Glowing metal fragments move from the raw bars into the forged emblems.
    const sparks=smooth(3,31,t)*(1-smooth(33,37,t));
    ctx.save();
    for(let i=0;i<145;i++){
      const p=rand(i,2),q=rand(i,3),phase=(t*(.11+p*.12)+q)%1;
      const sx=cx+(p-.5)*unit*3.8;
      const sy=cy+(q-.5)*unit*2.5;
      const dx=(p-.5)*unit*.7,dy=(q-.5)*unit*.32;
      const u=smooth(0,1,phase);
      const x=mix(sx,cx+dx,u),y=mix(sy,cy+dy,u)-Math.sin(u*Math.PI)*unit*.2;
      ctx.globalAlpha=sparks*(.2+.7*(1-u));
      ctx.fillStyle=i%4?'#e4a15a':'#a6c1d4';
      ctx.fillRect(x,y,1+p*2.2,1+p*2.2);
    }
    ctx.restore();
    // Reveal the real brand artwork progressively; never show it at the start.
    if(forge>0){
      const logoWidth=narrow?Math.min(w*.76,430):Math.min(w*.42,580);
      const logoHeight=logoWidth*.35;
      ctx.save();
      ctx.globalAlpha=forge*(1-zoom);
      ctx.translate(cx-(narrow?0:unit*.35),cy-unit*.2);
      ctx.scale(1+zoom*5,1+zoom*5);
      ctx.shadowColor='#dfab65';ctx.shadowBlur=22*forge;
      if(logo.complete&&logo.naturalWidth){
        ctx.beginPath();ctx.rect(-logoWidth*.5,-logoHeight*.55,logoWidth*forge,logoHeight*1.1);ctx.clip();
        ctx.drawImage(logo,-logoWidth*.5,-logoHeight*.5,logoWidth,logoHeight);
      }else{
        ctx.fillStyle='#e5bc78';ctx.textAlign='center';ctx.font='700 '+Math.max(22,logoWidth*.11)+'px system-ui';ctx.fillText('WEB PLUS',0,0);
      }
      ctx.restore();
    }
    if(atlas>0){
      ctx.globalAlpha=atlas*(1-zoom);
      const r=narrow?unit*.38:unit*.49;
      plate(cx+(narrow?unit*.68:unit*1.36),cy+(narrow?unit*.75:unit*.57),r,atlas);
      ctx.globalAlpha=1;
    }
    if(figures>0){
      ctx.save();ctx.globalAlpha=figures*(1-zoom);
      glow(cx,cy-unit*.25,unit*2.1,'rgba(202,122,60,.23)',figures);
      person(cx-unit*.88,cy+unit*.65,unit/180*.85);
      person(cx-unit*.42,cy+unit*.67,unit/180*.81);
      ctx.restore();
    }
    if(zoom>0){
      glow(cx,cy,Math.max(w,h)*zoom*.9,'rgba(232,180,111,.65)',zoom);
      ctx.fillStyle='rgba(247,240,224,'+smooth(.76,1,zoom)+')';ctx.fillRect(0,0,w,h);
    }
    const idx=captions.reduce((n,c,i)=>t>=c[0]?i:n,0);
    if(idx!==previous){
      previous=idx;eyebrow.textContent=captions[idx][1];
      heading.textContent=captions[idx][2];detail.textContent=captions[idx][3];
    }
    const end=captions[idx+1]?.[0]??duration;
    const alpha=smooth(captions[idx][0],captions[idx][0]+1.1,t)*(1-smooth(end-1,end,t));
    dialog.style.setProperty('--copy-alpha',String(alpha*(1-zoom)));
    endmark.style.opacity=String(smooth(36.2,38,t)*(1-smooth(38.4,39,t)));
    dialog.style.opacity=String(1-smooth(38.4,39,t));
  }
  function time(){return Math.min(duration,elapsed+(baseline?(performance.now()-baseline)/1000:0));}
  function tick(){
    if(!dialog.open||document.hidden)return;
    const t=time();draw(t);
    if(t>=duration){dialog.close();return;}
    raf=requestAnimationFrame(tick);
  }
  function suspend(){elapsed=time();baseline=0;cancelAnimationFrame(raf);raf=0;}
  function resume(){if(!dialog.open||document.hidden)return;baseline=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
  function open(){
    if(dialog.open||reduced.matches)return;
    focusBefore=document.activeElement;elapsed=0;baseline=0;previous=-1;
    dialog.style.opacity='1';endmark.style.opacity='0';
    dialog.showModal();document.documentElement.classList.add('forge-open');
    resize();resume();
    try{sessionStorage.setItem(key,'1');}catch{}
  }
  dialog.addEventListener('cancel',e=>e.preventDefault());
  dialog.addEventListener('close',()=>{
    suspend();document.documentElement.classList.remove('forge-open');
    const target=focusBefore instanceof HTMLElement&&focusBefore!==document.body?focusBefore:document.querySelector('.hero h1');
    if(target){if(target.tagName==='H1')target.tabIndex=-1;target.focus({preventScroll:true});}
  });
  document.addEventListener('visibilitychange',()=>{if(dialog.open){if(document.hidden)suspend();else resume();}});
  addEventListener('resize',resize,{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches&&dialog.open)dialog.close();});
  replay.addEventListener('click',open);
  let seen=false;try{seen=sessionStorage.getItem(key)==='1';}catch{}
  if(!seen&&!reduced.matches&&!location.hash)open();
})();
