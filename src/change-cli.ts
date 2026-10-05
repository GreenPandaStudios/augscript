import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {analyzeChangeProject,canonical,checkedContext,CHANGE_SCHEMA,interfaceSnapshot,projectRevision,semanticGraph} from './change-context.ts';
import {applyCheckedChange,checkChangeCandidate,planCheckedChange} from './checked-change-requests.ts';
import {replayBoundedEvidence,runBoundedEvidence} from './bounded-evidence.ts';
import {recoverAnySourceChange} from './source-recovery.ts';

/** JSON is the compiler/agent exchange; source replacements inside requests are parser source units. */
export async function runChangeCommand(argv:string[]):Promise<number>{
  const [command,operation,path,input,...extra]=argv,root=resolve(path??process.cwd());
  const output=(value:unknown)=>process.stdout.write(JSON.stringify(value,null,2)+'\n');
  if(!path||operation!=='context'&&extra.length||!operation||operation==='--help'){
    process.stdout.write('aug change plan|check|apply PROJECT request-or-plan.json\naug change interfaces PROJECT\naug change diff PROJECT baseline-interfaces.json\naug change recover PROJECT\naug evidence run|replay PROJECT generator-or-record.json\n');return operation==='--help'?0:2;
  }
  try{
    if(command==='change'&&operation==='context'){
      const options=argv.slice(3),values=new Map<string,string>();
      for(let index=0;index<options.length;index++){
        const key=options[index];if(key==='--json')continue;
        if(!['--file','--name','--budget'].includes(key)||values.has(key)||!options[index+1]||options[index+1].startsWith('--'))throw new Error('Use aug change context PROJECT --file FILE [--name NAME] [--budget N].');
        values.set(key,options[++index]);
      }
      const file=values.get('--file');if(!file)throw new Error('Provide --file for request context.');
      const value=analyzeChangeProject(root),path=resolve(root,file),name=values.get('--name');
      const roots=[...value.project.definitions.values()].filter(def=>def.file===path&&(!name||def.name===name)).map(def=>def.id);
      if(!roots.length)throw new Error('No declaration matches the requested source and name.');
      const packet=checkedContext(value,roots,values.has('--budget')?Number(values.get('--budget')):100000);output(packet);return packet.coverage.requiredContextComplete?0:1;
    }
    if(command==='change'&&operation==='recover'){
      if(input)throw new Error('Recovery takes only the project directory.');
      output({...recoverAnySourceChange(root),currentRevision:projectRevision(analyzeChangeProject(root).project).revision});return 0;
    }
    const checked=()=>{const value=analyzeChangeProject(root);if(value.diagnostics.some(issue=>issue.severity!=='warning'))throw Object.assign(new Error('Check the complete project before using this operation.'),
      {report:{schema:CHANGE_SCHEMA,status:'rejected',revision:projectRevision(value.project).revision,diagnostics:value.diagnostics}});return value;};
    if(command==='change'&&operation==='interfaces'){
      if(input)throw new Error('Interface snapshots take only the project directory.');
      const value=checked();output({...projectRevision(value.project),interfaces:interfaceSnapshot(semanticGraph(value))});return 0;
    }
    if(!input)throw new Error('Provide the request, plan, generator or recorded evidence JSON file.');
    const value=JSON.parse(readFileSync(resolve(input),'utf8'));
    if(command==='change'){
      if(operation==='plan')output(planCheckedChange(root,value));
      else if(operation==='check'){const result=checkChangeCandidate(root,value);output(result);return result.status==='verified candidate'?0:1;}
      else if(operation==='apply')output(applyCheckedChange(root,value));
      else if(operation==='diff'){
        if(value.schema!==CHANGE_SCHEMA||!Array.isArray(value.interfaces))throw new Error('Use a revision-bearing interface snapshot as the baseline.');
        const current=checked(),revision=projectRevision(current.project),interfaces=interfaceSnapshot(semanticGraph(current)),before=new Map<string,string>(value.interfaces.map((fact:{id:string;shape:string})=>[fact.id,fact.shape])),after=new Map(interfaces.map(fact=>[fact.id,fact.shape]));
        output({schema:CHANGE_SCHEMA,baseRevision:value.revision,revision:revision.revision,changes:[...new Set([...before.keys(),...after.keys()])].sort().flatMap(symbol=>before.get(symbol)===after.get(symbol)?[]:[{symbol,before:before.get(symbol)??null,after:after.get(symbol)??null}]),interfaces});
      }else throw new Error('Unknown change operation. Use plan, check, apply, interfaces, diff or recover.');
    }else if(command==='evidence'){
      const result=operation==='run'?runBoundedEvidence(checked(),value):operation==='replay'?replayBoundedEvidence(checked(),value):undefined;
      if(!result)throw new Error('Unknown evidence operation. Use run or replay.');output(result);return result.behavior.status==='passed finite checks'?0:1;
    }
    return 0;
  }catch(error){const failure=error as Error&{code?:string;report?:Record<string,unknown>};
    output(failure.report?{schema:CHANGE_SCHEMA,status:'rejected',code:failure.code??'CHANGE',message:failure.message,...failure.report}:{schema:CHANGE_SCHEMA,status:'rejected',code:failure.code??'CHANGE',message:failure.message});return 1;}
}
