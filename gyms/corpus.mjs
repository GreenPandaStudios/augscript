import assert from 'node:assert/strict';

// Fixed domains and independent oracles. Changing the generator changes its
// version; reports preserve every source unit for ordinary CLI replay.
export const generatorVersion=1;
const random=initial=>{let state=initial;return()=>((state=Math.imul(state,1664525)+1013904223|0)>>>0);};
const floatLiteral=value=>{
  const text=String(value);
  if(!text.includes('e'))return text.includes('.')?text:text+'.0';
  const [mantissa,exponent]=text.split('e'),negative=mantissa.startsWith('-'),unsigned=negative?mantissa.slice(1):mantissa;
  const point=(unsigned.indexOf('.')<0?unsigned.length:unsigned.indexOf('.'))+Number(exponent),digits=unsigned.replace('.','');
  const decimal=point<=0?'0.'+'0'.repeat(-point)+digits:point>=digits.length?digits+'0'.repeat(point-digits.length)+'.0':digits.slice(0,point)+'.'+digits.slice(point);
  return (negative?'-':'')+decimal;
};
export function generateGyms(seed,count){
  assert.ok(Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff,'Seed must be an unsigned 32-bit integer');
  assert.ok(Number.isInteger(count)&&count>=1&&count<=4096,'Vectors must be between 1 and 4096');
  const next=random(seed),fixtures=[];
  const wrap=value=>BigInt.asIntN(64,value);
  const literals=[0n,1n,-1n,7n,-7n,9223372036854775807n,-9223372036854775808n,9007199254740993n];
  const expression=depth=>{
    if(!depth||next()%3===0){const value=literals[next()%literals.length];return {text:value<0n?'('+value+')':String(value),value};}
    const left=expression(depth-1),right=expression(depth-1);
    let op=['+','-','*','/'][next()%4];if(op==='/'&&right.value===0n)op='+';
    const value=wrap(op==='+'?left.value+right.value:op==='-'?left.value-right.value:op==='*'?left.value*right.value:left.value/right.value);
    return {text:'('+left.text+' '+op+' '+right.text+')',value};
  };
  const arithmetic=Array.from({length:count},()=>expression(4));
  const source='try:\n    print(value=false and 1 / 0 == 0)\n    print(value=true or 1 / 0 == 0)\n'+arithmetic.map(item=>'    print(value='+item.text+')').join('\n')+'\ncatch ArithmeticError error:\n    print(value="unexpected")\n';
  fixtures.push({id:'arithmetic',vectors:count+2,files:{'main.aug':source},expected:'false\ntrue\n'+arithmetic.map(item=>item.value+'\n').join(''),
    mutant:{reason:'Eager evaluation violates short circuiting',files:{'main.aug':source.replace('false and','false or')}}});

  const numbers=[
    {text:'0',value:0n},{text:'-1',value:-1n},{text:'7',value:7n},
    {text:'9223372036854775807',value:9223372036854775807n},{text:'-9223372036854775808',value:-9223372036854775808n},
    {text:'0.0',value:0},{text:'-0.0',value:-0},{text:'1.5',value:1.5},{text:'-2.5',value:-2.5},
    {text:'9007199254740992.0',value:9007199254740992},
  ];
  const numericOperations={add:'+',subtract:'-',multiply:'*',divide:'/'};
  const numericBodies=Object.entries(numericOperations).map(([name,op])=>name+'(float left, float right) returns float'+(op==='/'?' unless ArithmeticError':'')+':\n    return left '+op+' right\n').join('');
  const numericLines=['import add and subtract and multiply and divide from operations'],numericOutputs=[];
  const checkNumber=(name,a,b)=>{
    const op=numericOperations[name],integer=typeof a.value==='bigint'&&typeof b.value==='bigint';
    let result;
    if(op==='/'&&Number(b.value)===0){
      numericLines.push('try:','    print(value='+name+'(left='+a.text+', right='+b.text+'))','catch ArithmeticError error:','    print(value="zero")');
      numericOutputs.push('zero');return;
    }
    if(integer)result=wrap(op==='+'?a.value+b.value:op==='-'?a.value-b.value:op==='*'?a.value*b.value:a.value/b.value);
    else {const left=Number(a.value),right=Number(b.value);result=op==='+'?left+right:op==='-'?left-right:op==='*'?left*right:left/right;}
    const text=typeof result==='number'?floatLiteral(result):String(result);
    const line='print(value='+name+'(left='+a.text+', right='+b.text+') == '+text+')';
    if(op==='/')numericLines.push('try:','    '+line,'catch ArithmeticError error:','    print(value="unexpected")');else numericLines.push(line);
    numericOutputs.push('true');
  };
  checkNumber('add',numbers[7],{text:'2.0',value:2});
  for(let index=0;index<count;index++)checkNumber(Object.keys(numericOperations)[next()%4],numbers[next()%numbers.length],numbers[next()%numbers.length]);
  numericLines.push('float huge = '+floatLiteral(1e308),'float infinite = huge * huge','float invalid = infinite - infinite','print(value=infinite > huge)','print(value=invalid != invalid)','print(value=invalid == invalid)');
  numericOutputs.push('true','true','false');
  const numericSource=numericLines.join('\n')+'\n';
  fixtures.push({id:'floating-point',vectors:count+4,files:{'main.aug':numericSource,'operations.aug':numericBodies},expected:numericOutputs.join('\n')+'\n',
    mutant:{reason:'A wrong numeric operation must not preserve its checked result',files:{'main.aug':numericSource,'operations.aug':numericBodies.replace('left + right','left - right')}}});

  const lines=['own Map<int, int> entries = {}','own Set<int> unique = {}','entries.set(key=1, value=7)','print(value=entries.take(key=1))','print(value=entries.length())'];
  const map=new Map(),set=new Set(),outputs=['7','0'];
  for(let i=0;i<count;i++){
    const key=next()%63-31,value=next()%1000-500,op=next()%8;
    if(op===0){lines.push('entries.set(key='+key+', value='+value+')');map.set(key,value);}
    if(op===1){lines.push('print(value=entries.take(key='+key+'))');outputs.push(String(map.has(key)?map.get(key):'null'));map.delete(key);}
    if(op===2){lines.push('print(value=entries.get(key='+key+'))');outputs.push(String(map.has(key)?map.get(key):'null'));}
    if(op===3){lines.push('print(value=entries.contains(key='+key+'))');outputs.push(String(map.has(key)));}
    if(op===4){lines.push('print(value=entries.length())');outputs.push(String(map.size));}
    if(op===5){lines.push('unique.add(value='+key+')');set.add(key);}
    if(op===6){lines.push('print(value=unique.contains(value='+key+'))');outputs.push(String(set.has(key)));}
    if(op===7){lines.push('print(value=unique.length())');outputs.push(String(set.size));}
  }
  const collections=lines.join('\n')+'\n';
  fixtures.push({id:'collections',vectors:count+2,files:{'main.aug':collections},expected:outputs.join('\n')+'\n',
    mutant:{reason:'Lookup must not replace removal',files:{'main.aug':collections.replace('entries.take(key=1)','entries.get(key=1)')}}});

  const pairs=[[-3,0],[3,0],...Array.from({length:count},()=>[next()%100-50,next()%100-50])];
  const operations='choose(int value, int boundary) returns int:\n    if value < boundary:\n        return value * 3\n    return value - boundary\n';
  const calls='import choose from operations\n'+pairs.map(([value,boundary])=>'print(value=choose(value='+value+', boundary='+boundary+'))').join('\n')+'\n';
  fixtures.push({id:'control-flow',vectors:pairs.length,files:{'main.aug':calls,'operations.aug':operations},
    expected:pairs.map(([value,boundary])=>(value<boundary?value*3:value-boundary)+'\n').join(''),
    mutant:{reason:'Reversing a branch changes its promised result',files:{'main.aug':calls,'operations.aug':operations.replace('value < boundary','value > boundary')}}});

  const indices=[-1,0,3,4,...Array.from({length:count},()=>next()%9-2)];
  const bounds=indices.map(index=>'try:\n    print(value=[1, 3, 5, 7].get(index='+index+'))\ncatch IndexError error:\n    print(value="bounds")').join('\n')+'\n';
  fixtures.push({id:'checked-bounds',vectors:indices.length,files:{'main.aug':bounds},
    expected:indices.map(index=>(index>=0&&index<4?String([1,3,5,7][index]):'bounds')+'\n').join(''),
    mutant:{reason:'A changed index must be noticed by the acceptance oracle',files:{'main.aug':bounds.replace('index=-1','index=0')}}});

  const resources='interface Disposable:\n    drop()\nResource() implements Disposable:\n    drop():\n        pass\n';
  const cleanup='import Resource from resources\nint index = 0\nwhile index < '+count+':\n    try:\n        scope:\n            own Resource resource = Resource()\n            throw FileError()\n    catch FileError error:\n        print(value="caught")\n    index = index + 1\nprint(value="done")\n';
  fixtures.push({id:'cleanup',vectors:count,files:{'main.aug':cleanup,'resources.aug':resources},expected:'caught\n'.repeat(count)+'done\n',drops:count,
    mutant:{reason:'Skipping the owned resource breaks cleanup evidence',files:{'main.aug':cleanup.replace('own Resource resource = Resource()','pass'),'resources.aug':resources}}});

  const taskOperation='compute(int value) returns int:\n    return value * 2 + 3\n';
  const tasks='import compute from operations\nint index = 0\nint checksum = 0\nwhile index < '+count+':\n    scope:\n        pending = start compute(value=index)\n        checksum = checksum + wait for pending\n    index = index + 1\nprint(value=checksum)\n';
  fixtures.push({id:'tasks',vectors:count,files:{'main.aug':tasks,'operations.aug':taskOperation},expected:(count*(count-1)+3*count)+'\n',
    mutant:{reason:'A task must return the independently expected value',files:{'main.aug':tasks,'operations.aug':taskOperation.replace('+ 3','+ 4')}}});
  return fixtures;
}

const resource='interface Disposable:\n    drop()\nResource() implements Disposable:\n    drop():\n        pass\nconsume(own Resource item):\n    pass\n';
export const negativeContracts=[
  {id:'move-twice',pattern:'moved|ownership',files:{'resources.aug':resource,'main.aug':'import Resource and consume from resources\nown Resource item = Resource()\nconsume(item=item)\nconsume(item=item)\n'}},
  {id:'alias-during-borrow',pattern:'borrow|alias',files:{'main.aug':'items = [1]\nalias = items\nborrow items:\n    items.append(value=2)\n    print(value=alias.length())\n'}},
  {id:'unhandled-error',pattern:'FileError|unhandled',files:{'operations.aug':'fail() unless FileError:\n    throw FileError()\n','main.aug':'import fail from operations\nfail()\n'}},
  {id:'unlabeled-input',pattern:'label|named',files:{'operations.aug':'accept(int value):\n    pass\n','main.aug':'import accept from operations\naccept(7)\n'}},
  {id:'native-without-unsafe',pattern:'unsafe',files:{'native.aug':'extern C accept(c_int value)\n','main.aug':'import accept from native\naccept(value=7)\n'}},
  {id:'task-outside-scope',pattern:'scope',files:{'operations.aug':'read() returns int:\n    return 7\n','main.aug':'import read from operations\npending = start read()\nprint(value=wait for pending)\n'}},
  {id:'immutable-record',pattern:'record|immutable|readonly|read.only',files:{'data.aug':'record Item(int value)\n','main.aug':'import Item from data\nitem = Item(value=7)\nitem.value = 8\n'}},
  {id:'private-export',pattern:'private|export',files:{'hidden.aug':'_secret() returns int:\n    return 7\n','export.aug':'export _secret from hidden\n','main.aug':'print(value=7)\n'}},
];
