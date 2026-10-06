import test from 'node:test';
import assert from 'node:assert/strict';
import {createDiagramNavigation} from '../docs/.vitepress/theme/diagram-navigation.ts';

function fixture(hash='#sequence-load') {
  const pending=new Map(),scrolls=[],elements=new Map();let serial=0;
  const emitter=()=>{const listeners=new Map();return {listeners,
    addEventListener(type,handler){const handlers=listeners.get(type)??new Set();handlers.add(handler);listeners.set(type,handlers);},
    removeEventListener(type,handler){listeners.get(type)?.delete(handler);},
    fire(type,target,details={}){for(const handler of listeners.get(type)??[])handler({type,target,button:0,...details});}};};
  let browser;
  class Element {
    constructor(tag,top,href,attributes={}){this.tag=tag;this.top=top;this.attributes={...attributes,...(href?{href}:{})};}
    matches(){return /^h[1-6]$/.test(this.tag);}
    closest(selector){return selector==='a[href]'?(this.tag==='a'?this:null):selector==='.vp-doc'?this:null;}
    getAttribute(name){return this.attributes[name]??null;}
    hasAttribute(name){return Object.hasOwn(this.attributes,name);}
    getBoundingClientRect(){return {top:this.top-browser.scrollY,bottom:this.top-browser.scrollY+24};}
  }
  const header={getBoundingClientRect:()=>({bottom:64})};
  const page={...emitter(),getElementById:id=>elements.get(id),querySelector:selector=>selector==='.VPNav'?header:null};
  browser={...emitter(),Element,location:new URL('https://wiki.example/project'+hash),scrollY:0,scrollX:0,
    getComputedStyle:()=>({paddingTop:'0px'}),
    requestAnimationFrame(fn){pending.set(++serial,fn);return serial;},
    cancelAnimationFrame(id){pending.delete(id);},
    scrollTo({top}){scrolls.push(top);this.scrollY=top;}};
  const heading=new Element('h3',2000);elements.set('sequence-load',heading);
  const navigation=createDiagramNavigation(browser,page,()=>['.VPLocalNav','.VPNav']);
  const flush=()=>{const callbacks=[...pending.values()];pending.clear();for(const callback of callbacks)callback();};
  return {browser,page,heading,elements,pending,scrolls,navigation,flush,link:(href,attributes)=>new Element('a',0,href,attributes)};
}

test('a deep section link stays at its heading as preceding lazy diagrams expand',()=>{
  const f=fixture();f.flush();assert.equal(f.heading.getBoundingClientRect().top,88);
  f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();
  assert.equal(f.heading.getBoundingClientRect().top,88);
  f.heading.top+=600;f.browser.fire('august:diagram-layout');f.browser.fire('august:diagram-layout');
  assert.equal(f.pending.size,1);f.flush();assert.equal(f.heading.getBoundingClientRect().top,88);
  f.navigation.stop();
});

test('reader gestures stop correction and a repeated same-section link restores it',()=>{
  for(const gesture of ['wheel','touchmove','pointerdown','keydown']) {
    const f=fixture();f.flush();f.page.fire(gesture);f.browser.scrollY=700;
    f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();assert.equal(f.browser.scrollY,700,gesture);
    f.page.fire('click',f.link('#sequence-load'));f.flush();assert.equal(f.heading.getBoundingClientRect().top,88,gesture);
    f.navigation.stop();
  }
});

test('stale routes, foreign links, malformed hashes and source anchors do not redirect a reader',()=>{
  const f=fixture();f.flush();f.browser.location=new URL('https://wiki.example/another#sequence-load');
  const previous=f.browser.scrollY;f.browser.fire('august:diagram-layout');f.flush();assert.equal(f.browser.scrollY,previous);
  f.page.fire('pointerdown');f.page.fire('click',f.link('https://other.example/project#sequence-load'));
  f.browser.fire('august:diagram-layout');f.flush();assert.equal(f.browser.scrollY,previous);
  for(const hash of ['#%invalid','#unknown','#source-L12']) {
    f.elements.set('source-L12',{matches:()=>false});f.browser.location=new URL('https://wiki.example/project'+hash);
    f.navigation.select();assert.doesNotThrow(f.flush);assert.equal(f.browser.scrollY,previous);
  }
  f.browser.location=new URL('https://wiki.example/project#sequence-load');f.browser.fire('hashchange');f.flush();
  assert.equal(f.heading.getBoundingClientRect().top,88);f.navigation.stop();
});

test('unmount cancels pending work and releases every browser and reader listener',()=>{
  const f=fixture();assert.equal(f.pending.size,1);f.navigation.stop();assert.equal(f.pending.size,0);
  f.browser.fire('hashchange');f.browser.fire('august:diagram-layout');f.page.fire('click',f.link('#sequence-load'));
  f.navigation.select();f.flush();assert.equal(f.scrolls.length,0);
  for(const handlers of [...f.page.listeners.values(),...f.browser.listeners.values()])assert.equal(handlers.size,0);
});


test('modified clicks, new-tab links and downloads leave the reader at their chosen position',()=>{
  const cases=[{button:1},{ctrlKey:true},{shiftKey:true},{altKey:true},{metaKey:true}];
  for(const details of cases) {
    const f=fixture();f.flush();f.page.fire('pointerdown');f.browser.scrollY=700;
    f.page.fire('click',f.link('#sequence-load'),details);
    f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();
    assert.equal(f.browser.scrollY,700,JSON.stringify(details));f.navigation.stop();
  }
  for(const attributes of [{target:'_blank'},{target:'_self'},{download:''}]) {
    const f=fixture();f.flush();f.page.fire('pointerdown');f.browser.scrollY=700;
    f.page.fire('click',f.link('#sequence-load',attributes));
    f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();
    assert.equal(f.browser.scrollY,700,JSON.stringify(attributes));f.navigation.stop();
  }
});

test('Back and Forward preserve saved reading positions through route updates and late diagram layouts',()=>{
  const f=fixture();f.flush();
  for(const scrollPosition of [700,1200]) {
    f.browser.fire('popstate',undefined,{state:{scrollPosition}});f.browser.scrollY=scrollPosition;
    f.browser.fire('hashchange');f.navigation.select();
    f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();
    assert.equal(f.browser.scrollY,scrollPosition);
  }
  f.page.fire('click',f.link('#sequence-load'),{defaultPrevented:true});f.flush();
  assert.equal(f.heading.getBoundingClientRect().top,88,'an explicit link resumes section navigation after history restoration');
  f.navigation.stop();
});

test('history entries without a saved position can select their heading',()=>{
  const f=fixture();f.flush();f.browser.fire('popstate',undefined,{state:{scrollPosition:700}});
  f.browser.fire('popstate',undefined,{state:{}});f.navigation.select();
  f.heading.top+=900;f.browser.fire('august:diagram-layout');f.flush();
  assert.equal(f.heading.getBoundingClientRect().top,88);f.navigation.stop();
});
