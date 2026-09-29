const [workload, countText] = process.argv.slice(2), count = Number(countText);
if (workload === 'startup') console.log(7);
else if (workload === 'cpu') {
  let state = 123;
  for (let i = 0; i < count; i++) {
    const product = state * 48271;
    state = product - Math.trunc(product / 2147483647) * 2147483647;
  }
  console.log(state);
} else if (workload === 'collections') {
  const values = new Map(), unique = new Set();
  for (let i = 0; i < count; i++) { values.set(i, i * 3); unique.add(i); }
  let checksum = 0;
  for (const [key, value] of values) if (unique.has(key)) checksum += value;
  console.log(checksum); console.log(values.size === unique.size);
} else if (workload === 'json') {
  let checksum = 0;
  for (let i = 0; i < count; i++) {
    const value = JSON.parse('{"id":7,"message":"hello","values":[1,2,3]}');
    checksum += value.id + JSON.stringify(value).length;
  }
  console.log(checksum);
} else if (workload === 'http') {
  const { default: http } = await import('node:http');
  http.createServer((req, res) => {
    if (req.method !== 'GET' || req.url !== '/bench') { res.writeHead(404); res.end(); return; }
    const body = JSON.stringify({ id: 7, message: 'hello' });
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }); res.end(body);
  }).listen(0, '127.0.0.1', function () { console.log('PORT ' + this.address().port); });
} else throw new Error('Unknown workload');
