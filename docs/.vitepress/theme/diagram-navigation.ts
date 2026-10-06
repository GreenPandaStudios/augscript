/** Keep an explicitly selected heading in view while lazy diagrams change the page. */
export type ScrollOffset = number | string | string[] | {selector:string | string[]; padding:number};
export function createDiagramNavigation(browser:Window & typeof globalThis,page:Document,configuredOffset:()=>ScrollOffset) {
  let intent:{path:string;hash:string}|undefined,frame=0,stopped=false,restoredURL:string|undefined;
  const offset=()=>{
    const configured=configuredOffset();
    const value=typeof configured==='object'&&!Array.isArray(configured)?configured.selector:configured;
    const padding=typeof configured==='object'&&!Array.isArray(configured)?configured.padding:24;
    if(typeof value==='number')return value;
    for(const selector of typeof value==='string'?[value]:value){
      const bottom=page.querySelector(selector)?.getBoundingClientRect().bottom;
      if(bottom!==undefined&&bottom>=0)return bottom+padding;
    }
    return 0;
  };
  const settle=()=>{
    frame=0;
    if(stopped||!intent||intent.path!==browser.location.pathname||intent.hash!==browser.location.hash)return;
    let id:string;
    try{id=decodeURIComponent(intent.hash.slice(1));}catch{return;}
    const target=page.getElementById(id);
    if(!target?.matches('h1,h2,h3,h4,h5,h6')||!target.closest('.vp-doc'))return;
    const padding=Number.parseFloat(browser.getComputedStyle(target).paddingTop)||0;
    const delta=target.getBoundingClientRect().top-offset()+padding;
    if(Math.abs(delta)>1)browser.scrollTo({left:browser.scrollX,top:Math.max(0,browser.scrollY+delta),behavior:'instant'});
  };
  const layout=()=>{if(!stopped&&intent&&!frame)frame=browser.requestAnimationFrame(settle);};
  const select=()=>{
    if(stopped||restoredURL===browser.location.href)return;
    intent=browser.location.hash?{path:browser.location.pathname,hash:browser.location.hash}:undefined;
    layout();
  };
  const release=()=>{intent=undefined;if(frame)browser.cancelAnimationFrame(frame);frame=0;};
  const restored=(event:PopStateEvent)=>{
    release();
    // VitePress restores a positive saved position instead of selecting the hash.
    const saved=event.state?.scrollPosition;
    restoredURL=typeof saved==='number'&&Number.isFinite(saved)&&saved>0?browser.location.href:undefined;
  };
  const clicked=(event:MouseEvent)=>{
    // VitePress has already prevented ordinary link clicks in window capture.
    if(event.button!==0||event.ctrlKey||event.shiftKey||event.altKey||event.metaKey||
      !(event.target instanceof browser.Element)||event.target.closest('button'))return;
    const link=event.target.closest('a[href]');
    if(!link||link.closest('.vp-raw')||link.hasAttribute('download')||link.hasAttribute('target'))return;
    let destination:URL;
    try{destination=new URL(link.getAttribute('href')!,browser.location.href);}catch{return;}
    if(destination.origin!==browser.location.origin)return;
    restoredURL=undefined;
    if(destination.pathname===browser.location.pathname&&destination.search===browser.location.search&&destination.hash){
      intent={path:destination.pathname,hash:destination.hash};layout();
    }
  };
  const gestures=['wheel','touchmove','pointerdown','keydown'];
  for(const gesture of gestures)page.addEventListener(gesture,release,{passive:true});
  page.addEventListener('click',clicked);
  browser.addEventListener('hashchange',select);
  browser.addEventListener('popstate',restored);
  browser.addEventListener('august:diagram-layout',layout);
  select();
  return {select,stop(){stopped=true;release();for(const gesture of gestures)page.removeEventListener(gesture,release);page.removeEventListener('click',clicked);browser.removeEventListener('hashchange',select);browser.removeEventListener('popstate',restored);browser.removeEventListener('august:diagram-layout',layout);}};
}
