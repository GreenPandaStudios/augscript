import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const minimum=-(1n<<63n),maximum=(1n<<63n)-1n;
const boundary=[minimum,minimum+1n,-maximum,-3037000500n,-3037000499n,-2n,-1n,0n,1n,2n,3037000499n,3037000500n,maximum-1n,maximum];
function run(source,backend){const root=mkdtempSync(join(tmpdir(),'aug-math-'));try{
 writeFileSync(join(root,'main.aug'),source);
 return spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:30000});
}finally{rmSync(root,{recursive:true,force:true});}}
for(const backend of ['c','llvm'])test('checked integer helpers agree with independent BigInt boundaries ('+backend+')',()=>{
 const pairs=boundary.flatMap(left=>boundary.map(right=>[left,right]));
 const source='import checkedAdd and checkedSubtract and checkedMultiply and checkedDivide and checkedNegate and checkedAbs and checkedSum from august.math\n'+
  'for (left, right) in ['+pairs.map(([left,right])=>'('+left+', '+right+')').join(', ')+'] {\n'+
  ['checkedAdd','checkedSubtract','checkedMultiply','checkedDivide'].map(name=>'try { print(value='+name+'(left, right)) } catch ArithmeticError error { print(value="overflow") }').join('\n')+'\n}\n'+
  'try { print(value=checkedNegate(value=-9223372036854775808)) } catch ArithmeticError error { print(value="overflow") }\n'+
  'try { print(value=checkedAbs(value=-9223372036854775807)); print(value=checkedSum(values=[1, -2, 3])) } catch ArithmeticError error { print(value="unexpected") }\n';
 const expected=pairs.flatMap(([left,right])=>[
  ()=>left+right,()=>left-right,()=>left*right,()=>left/right
 ].map(operation=>{try{const result=operation();return result<minimum||result>maximum?'overflow':String(result);}catch{return 'overflow';}}));
 expected.push('overflow',String(maximum),'2');
 const result=run(source,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected.join('\n')+'\n');
});
for(const backend of ['c','llvm'])test('exact decimal values parse, format, compute and reject hidden precision loss ('+backend+')',()=>{
 const source=`import Decimal and parseDecimal and formatDecimal and rescaleDecimal and addDecimals and subtractDecimals and multiplyDecimals and divideDecimals and compareDecimals from august.math
try {
 for text in ["0", "-0.00", "12.50", "001.2300", "-9223372036854775808", "0.000000000000000001"] {
  print(value=formatDecimal(value=parseDecimal(text)))
 }
 left = parseDecimal(text="0.10")
 right = parseDecimal(text="0.20")
 print(value=formatDecimal(value=addDecimals(left, right)))
 print(value=formatDecimal(value=subtractDecimals(left, right)))
 print(value=formatDecimal(value=multiplyDecimals(left, right)))
 print(value=formatDecimal(value=divideDecimals(left, right, scale=2)))
 print(value=formatDecimal(value=rescaleDecimal(value=parseDecimal(text="1.200"), scale=1)))
 print(value=compareDecimals(left=parseDecimal(text="1.0"), right=parseDecimal(text="1.00")))
 print(value=compareDecimals(left=Decimal(coefficient=9223372036854775807, scale=0), right=Decimal(coefficient=9223372036854775807, scale=18)))
 print(value=compareDecimals(left=parseDecimal(text="-2"), right=parseDecimal(text="-1.5")))
} catch Error error { print(value="unexpected") }
for text in ["", ".1", "1.", "1.2.3", "1.+2", "+1.2", "1e2", " 1.2", "1. 2", "NaN", "-.1", "١.٢", "9223372036854775808", "0.0000000000000000001"] {
 try { parseDecimal(text); print(value="accepted invalid input") } catch ConversionError error { print(value="invalid") }
}
try { Decimal(coefficient=1, scale=-1) } catch ConversionError error { print(value="invalid scale") }
try { Decimal(coefficient=1, scale=19) } catch ConversionError error { print(value="invalid scale") }
try { rescaleDecimal(value=Decimal(coefficient=1, scale=2), scale=1) } catch ArithmeticError error { print(value="precision loss") } catch ConversionError error { print(value="unexpected") }
try { divideDecimals(left=Decimal(coefficient=1, scale=0), right=Decimal(coefficient=3, scale=0), scale=2) } catch ArithmeticError error { print(value="inexact division") } catch ConversionError error { print(value="unexpected") }
try { addDecimals(left=Decimal(coefficient=9223372036854775807, scale=0), right=Decimal(coefficient=1, scale=0)) } catch ArithmeticError error { print(value="overflow") } catch ConversionError error { print(value="unexpected") }
`;
 const expected=['0','0.00','12.50','1.2300',String(minimum),'0.000000000000000001','0.30','-0.10','0.0200','0.50','1.2','0','1','-1',...Array(14).fill('invalid'),'invalid scale','invalid scale','precision loss','inexact division','overflow'];
 const result=run(source,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected.join('\n')+'\n');
});

for(const backend of ['c','llvm'])test('decimal comparison and formatting agree with a scaled BigInt oracle ('+backend+')',()=>{
 const values=[minimum,minimum+1n,-3037000500n,-12n,-1n,0n,1n,12n,3037000500n,maximum].flatMap(coefficient=>[0,2,18].map(scale=>({coefficient,scale})));
 const format=({coefficient,scale})=>{const sign=coefficient<0n?'-':'';const digits=String(coefficient<0n?-coefficient:coefficient).padStart(scale+1,'0');return sign+(scale?digits.slice(0,-scale)+'.'+digits.slice(-scale):digits);};
 const expected=values.map(format);
 const pairs=values.flatMap(left=>values.map(right=>[left,right]));
 expected.push(...pairs.map(([left,right])=>{const a=left.coefficient*10n**BigInt(18-left.scale);const b=right.coefficient*10n**BigInt(18-right.scale);return String(a<b?-1:a>b?1:0);}));
 const source='import Decimal and formatDecimal and compareDecimals from august.math\ntry {\n'+
  'values = ['+values.map(({coefficient,scale})=>'Decimal(coefficient='+coefficient+', scale='+scale+')').join(', ')+']\n'+
  'for value in values { print(value=formatDecimal(value)) }\nfor left in values { for right in values { print(value=compareDecimals(left, right)) } }\n'+
  '} catch Error error { print(value="unexpected") }\n';
 const result=run(source,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected.join('\n')+'\n');
});
for(const backend of ['c','llvm'])test('checked mathematics makes zero, scale and intermediate limits observable ('+backend+')',()=>{
 const source=`import Decimal and parseDecimal and formatDecimal and checkedSum and checkedAbs and multiplyDecimals and divideDecimals and rescaleDecimal from august.math
try {
 print(value=checkedSum(values=[]))
 print(value=formatDecimal(value=parseDecimal(text="${'0'.repeat(63)}1")))
 print(value=formatDecimal(value=divideDecimals(left=Decimal(coefficient=-125, scale=2), right=Decimal(coefficient=5, scale=1), scale=1)))
 print(value=formatDecimal(value=rescaleDecimal(value=Decimal(coefficient=0, scale=0), scale=18)))
} catch Error error { print(value="unexpected") }
try { parseDecimal(text="${'0'.repeat(64)}1") } catch ConversionError error { print(value="text limit") }
try { checkedSum(values=[9223372036854775807, 1, -1]) } catch ArithmeticError error { print(value="intermediate sum") }
try { checkedAbs(value=-9223372036854775808) } catch ArithmeticError error { print(value="abs overflow") }
try { multiplyDecimals(left=Decimal(coefficient=1, scale=18), right=Decimal(coefficient=1, scale=1)) } catch ConversionError error { print(value="scale overflow") } catch ArithmeticError error { print(value="unexpected") }
try { divideDecimals(left=Decimal(coefficient=1, scale=0), right=Decimal(coefficient=0, scale=0), scale=0) } catch ArithmeticError error { print(value="zero divisor") } catch ConversionError error { print(value="unexpected") }
try { divideDecimals(left=Decimal(coefficient=-9223372036854775808, scale=0), right=Decimal(coefficient=-1, scale=0), scale=0) } catch ArithmeticError error { print(value="division overflow") } catch ConversionError error { print(value="unexpected") }
`;
 const result=run(source,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'0\n1\n-2.5\n0.000000000000000000\ntext limit\nintermediate sum\nabs overflow\nscale overflow\nzero divisor\ndivision overflow\n');
});
