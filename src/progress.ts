/** Progress belongs on stderr so native stdout and JSON reports retain their contracts. */
export class BuildProgress {
  private active?: {name:string;started:number};
  private readonly enabled:boolean;
  private readonly write:(text:string)=>void;
  constructor(enabled:boolean,write:(text:string)=>void=text=>process.stderr.write(text)) {this.enabled=enabled;this.write=write;}
  start(name:string):void {
    if(!this.enabled)return;
    this.complete();this.active={name,started:performance.now()};this.write(`[August] ${name}: started\n`);
  }
  complete():void {this.finish('completed');}
  fail():void {this.finish('failed');}
  private finish(state:'completed'|'failed'):void {
    if(!this.active)return;
    const {name,started}=this.active;this.active=undefined;
    this.write(`[August] ${name}: ${state} (${Math.max(0,performance.now()-started).toFixed(0)}ms)\n`);
  }
}
