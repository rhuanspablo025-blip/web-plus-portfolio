const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function setup() {
  const media = new Map();
  let focused;
  function node() {
    const attrs = new Map(), classes = new Set(), handlers = new Map();
    return {inert:false, style:{setProperty(){}},
      getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),
      classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle(k,on){on?classes.add(k):classes.delete(k);},contains:k=>classes.has(k)},
      addEventListener(k,fn){handlers.set(k,[...(handlers.get(k)||[]),fn]);},
      emit(k,e={}){for(const fn of handlers.get(k)||[])fn(e);},
      querySelectorAll:()=>[],contains(target){return target===this;},focus(){focused=this;}
    };
  }
  const toggle=node(), nav=node(), link=node(), document=node();
  toggle.setAttribute('aria-expanded','false');nav.querySelectorAll=()=>[link];
  document.querySelector=s=>({'.menu-toggle':toggle,'#site-nav':nav}[s]||null);
  document.querySelectorAll=()=>[];document.documentElement={scrollHeight:1500};
  const context={window:{},document,innerHeight:800,scrollY:0,HTMLElement:function(){},
    matchMedia(q){if(!media.has(q)){const m=node();m.matches=q.includes('max-width');media.set(q,m);}return media.get(q);},
    addEventListener(){},requestAnimationFrame(){return 1;},cancelAnimationFrame(){},setTimeout,Date};
  vm.createContext(context);
  for(const file of ['script.js','motion.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
  return {toggle,nav,link,document,media,get focused(){return focused;}};
}
test('closed mobile navigation is inert; opening makes it accessible',()=>{
 const s=setup();assert.equal(s.nav.inert,true);s.toggle.emit('click');assert.equal(s.nav.inert,false);assert.equal(s.toggle.getAttribute('aria-expanded'),'true');
});
test('Escape closes the menu and restores focus',()=>{
 const s=setup();s.toggle.emit('click');s.document.emit('keydown',{key:'Escape'});assert.equal(s.nav.inert,true);assert.equal(s.focused,s.toggle);assert.equal(s.nav.classList.contains('open'),false);
});
test('outside press and navigation both close the mobile menu',()=>{
 const s=setup();s.toggle.emit('click');s.document.emit('pointerdown',{target:{}});assert.equal(s.nav.inert,true);
 s.toggle.emit('click');s.link.emit('click');s.nav.emit('click');assert.equal(s.nav.inert,true);
});
test('resizing to desktop never leaves the navigation inert',()=>{
 const s=setup();const m=s.media.get('(max-width: 760px)');m.matches=false;m.emit('change');assert.equal(s.nav.inert,false);
 m.matches=true;m.emit('change');assert.equal(s.nav.inert,true);
});
