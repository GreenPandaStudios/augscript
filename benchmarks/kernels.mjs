// Oracles are written independently of the August and C implementations.
export const kernels=[
  {name:'float',count:1000000,description:'Exact binary-fraction arithmetic with a loop-carried sum',expected:n=>{
    return 'true\n'+n+'\n';
  }},
  {name:'calls',count:200000,description:'Labeled function calls with dependent integer arithmetic',expected:n=>{
    let state=123;for(let i=0;i<n;i++)state=(state*48271+1)%2147483647;return state+'\n';
  }},
  {name:'list',count:100000,description:'Grow a list, snapshot it and sum its elements',expected:n=>(3*n*(n-1)/2)+'\n'},
  {name:'strings',count:20000,description:'Split a string and sum the byte lengths of its parts',expected:n=>23*n+'\n'},
  {name:'map-churn',count:4000,description:'Insert, replace, delete, refill and iterate in insertion order',expected:n=>{
    const map=new Map();for(let i=0;i<n;i++)map.set(i,i*3);
    for(let i=0;i<n;i+=2)map.delete(i);
    for(let i=0;i<n;i++)map.set(i,i*7);
    let sum=0,position=1;for(const [key,value] of map)sum+=key*position+++value;
    return sum+'\n'+map.size+'\n';
  }},
  {name:'errors',count:20000,description:'Interleave successful calls and caught checked failures',expected:n=>{
    let sum=0,errors=0;for(let i=0;i<n;i++)if(i%16===0)errors++;else sum+=i;
    return sum+'\n'+errors+'\n';
  }},
  {name:'records',count:50000,description:'Retain immutable records in a list and read their fields',expected:n=>n*(n-1)/2+'\n'},
  {name:'tasks',count:2000,description:'Start and join two tasks in each bounded scope',expected:n=>(3*n*(n-1)+5*n)+'\n'},
];
