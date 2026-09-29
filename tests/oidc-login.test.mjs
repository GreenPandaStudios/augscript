import test from 'node:test';
import assert from 'node:assert/strict';
import {cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {createServer} from 'node:net';
import {createHash, createPublicKey, verify} from 'node:crypto';

const cli = resolve('bin/aug.mjs');
async function freePort() {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
function cookie(response, name) {
  const value = response.headers.getSetCookie().find(value => value.startsWith(name + '='));
  assert.ok(value, 'Missing cookie ' + name);
  assert.match(value, /HttpOnly/); assert.match(value, /SameSite=Lax/);
  return value.split(';')[0];
}
function hidden(html, name) {
  const match = new RegExp('name="' + name + '" value="([^"]+)"').exec(html);
  assert.ok(match, 'Missing form input ' + name);
  return match[1];
}
test('one August app acts as an OIDC provider and client, validates tokens and revokes sessions', {timeout:120000}, async () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-oidc-'));
  let server;
  try {
    cpSync(resolve('examples/oidc-login'), root, {recursive:true, filter:path => !path.includes('.aug-build')});
    const port = await freePort(); const base = `http://127.0.0.1:${port}`;
    for (const file of ['main.aug', 'common/settings.aug']) {
      const path = join(root, file);
      writeFileSync(path, readFileSync(path, 'utf8').replaceAll('8787', String(port)));
    }
    const built = spawnSync(process.execPath, [cli, 'build', root], {encoding:'utf8', timeout:60000});
    assert.equal(built.status, 0, built.stderr);
    server = spawn(join(root, '.aug-build', root.split('/').at(-1)), [], {stdio:['ignore','pipe','pipe']});
    let errors = ''; server.stderr.on('data', chunk => {errors += chunk;});
    const lines = createInterface({input:server.stdout});
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('OIDC startup timed out: ' + errors)), 15000);
      server.once('exit', code => {clearTimeout(timer); reject(new Error('OIDC app exited ' + code + ': ' + errors));});
      lines.on('line', line => {if (/August HTTP listening/.test(line)) {clearTimeout(timer); resolve();}});
    });
    const request = (path, options={}) => fetch(new URL(path, base), {redirect:'manual', signal:AbortSignal.timeout(15000), ...options});
    const api = await (await request('/openapi.json')).json(); assert.equal(api.openapi,'3.2.1'); assert.ok(api.paths['/provider/token']);
    assert.equal(api.paths['/provider/token'].post.requestBody.content['application/x-www-form-urlencoded'].schema.$ref.startsWith('#/components/schemas/'),true);
    assert.match(await (await request('/docs')).text(), /Contracts generated/);
    const discovery = await (await request('/provider/.well-known/openid-configuration')).json();
    assert.equal(discovery.issuer, base + '/provider');
    assert.deepEqual(discovery.code_challenge_methods_supported, ['S256']);
    const jwks = await (await request(discovery.jwks_uri)).json();
    assert.equal(jwks.keys.length, 1); assert.equal(jwks.keys[0].d, undefined);
    const providerKey = createPublicKey({key:jwks.keys[0], format:'jwk'});
    let response = await request('/'); assert.match(await response.text(), /Sign in/);
    assert.equal((await request('/me')).status, 401);

    async function authorization(start) {
      const loginCookie = cookie(start, 'aug_login');
      const location = start.headers.get('location'); assert.ok(location);
      const response = await request(location);
      assert.equal(response.status, 200, await response.clone().text());
      const html = await response.text();
      return {loginCookie, providerCookie:cookie(response, 'aug_authorize'), state:new URL(location).searchParams.get('state'),
        form:{request_id:hidden(html, 'request_id'), csrf:hidden(html, 'csrf'), username:'ada', password:'august-demo'}};
    }
    const login = await authorization(await request('/login/start'));
    for(const origin of [undefined,'null','https://evil.test']) {
      const headers={cookie:login.providerCookie,'content-type':'application/x-www-form-urlencoded'};
      if(origin!==undefined)headers.origin=origin;
      assert.equal((await request('/provider/login',{method:'POST',headers,body:new URLSearchParams(login.form)})).status,403);
    }
    for(const variant of ['browser','csrf','password']) {
      const rejected=await authorization(await request('/login/start'));
      const form={...rejected.form};if(variant==='csrf')form.csrf='wrong';if(variant==='password')form.password='wrong';
      const headers={origin:base,'content-type':'application/x-www-form-urlencoded'};if(variant!=='browser')headers.cookie=rejected.providerCookie;
      assert.equal((await request('/provider/login',{method:'POST',headers,body:new URLSearchParams(form)})).status,variant==='password'?401:403);
      assert.equal((await request('/provider/login',{method:'POST',headers:{...headers,cookie:rejected.providerCookie},body:new URLSearchParams(rejected.form)})).status,400);
    }
    response = await request('/provider/login', {method:'POST', headers:{cookie:login.providerCookie, origin:base, 'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(login.form)});
    assert.equal(response.status, 303, await response.clone().text());
    const callback = response.headers.get('location');
    const wrongState = new URL(callback); wrongState.searchParams.set('state', 'x'.repeat(43));
    assert.equal((await request(wrongState.href)).status, 400);
    response = await request(callback, {headers:{cookie:login.loginCookie}});
    assert.equal(response.status, 303, await response.clone().text());
    const sessionCookie = cookie(response, 'aug_session');
    const session = sessionCookie.slice('aug_session='.length);
    const [header, payload] = session.split('.').slice(0, 2).map(value => JSON.parse(Buffer.from(value, 'base64url')));
    assert.equal(header.typ, 'august-session+jwt'); assert.equal(header.kid, 'session-1');
    assert.equal(payload.iss, base + '/app'); assert.equal(payload.aud, 'august-app'); assert.equal(payload.sub, 'demo-ada');
    assert.ok(payload.exp > payload.iat); assert.equal(payload.exp - payload.iat, 900);
    response = await request('/me', {headers:{cookie:sessionCookie}});
    assert.equal(response.status, 200, await response.clone().text()); assert.deepEqual(await response.json(), {sub:'demo-ada', name:'Ada'});
    response = await request('/', {headers:{cookie:sessionCookie}}); assert.match(await response.text(), /Welcome, Ada/);
    assert.equal((await request(callback, {headers:{cookie:login.loginCookie}})).status, 400);
    const tampered = session.split('.'); tampered[1] = Buffer.from(JSON.stringify({...payload, sub:'attacker'})).toString('base64url');
    assert.equal((await request('/me', {headers:{cookie:'aug_session=' + tampered.join('.')}})).status, 401);
    assert.equal((await request('/logout', {method:'POST', headers:{cookie:sessionCookie, origin:base, 'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({csrf:'wrong'})})).status, 403);
    for(const origin of [undefined,'null','https://evil.test']) {
      const headers={cookie:sessionCookie,'content-type':'application/x-www-form-urlencoded'};
      if(origin!==undefined)headers.origin=origin;
      assert.equal((await request('/logout',{method:'POST',headers,body:new URLSearchParams({csrf:payload.csrf})})).status,403);
    }
    response = await request('/logout', {method:'POST', headers:{cookie:sessionCookie, origin:base, 'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({csrf:payload.csrf})});
    assert.equal(response.status, 303); assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
    assert.equal((await request('/me', {headers:{cookie:sessionCookie}})).status, 401);

    // An independent public OAuth client exercises PKCE, JWT/JWK interoperability and one-use codes.
    async function grant(verifier) {
      const query = new URLSearchParams({response_type:'code', client_id:'august-login-app', redirect_uri:base + '/login/callback', scope:'openid profile', state:'s'.repeat(43), nonce:'n'.repeat(43), code_challenge:createHash('sha256').update(verifier).digest('base64url'), code_challenge_method:'S256'});
      const response = await request('/provider/authorize?' + query); const html = await response.text();
      const result = await request('/provider/login', {method:'POST', headers:{cookie:cookie(response, 'aug_authorize'), origin:base, 'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({request_id:hidden(html,'request_id'), csrf:hidden(html,'csrf'), username:'ada', password:'august-demo'})});
      assert.equal(result.status, 303, await result.clone().text()); return new URL(result.headers.get('location')).searchParams.get('code');
    }
    const verifier = 'v'.repeat(43); const code = await grant(verifier);
    const form = {grant_type:'authorization_code', code, redirect_uri:base + '/login/callback', client_id:'august-login-app', code_verifier:verifier};
    const exchange = values => request('/provider/token', {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(values)});
    response = await exchange(form); assert.equal(response.status, 200, await response.clone().text());
    const tokens = await response.json(); const [first, second, signature] = tokens.id_token.split('.');
    assert.equal(verify('RSA-SHA256', Buffer.from(first + '.' + second), providerKey, Buffer.from(signature, 'base64url')), true);
    const claims = JSON.parse(Buffer.from(second, 'base64url')); assert.equal(claims.nonce, 'n'.repeat(43)); assert.equal(claims.aud, 'august-login-app');
    assert.equal((await request('/me', {headers:{cookie:'aug_session=' + tokens.id_token}})).status, 401);
    response = await request('/provider/userinfo', {headers:{authorization:'Bearer ' + tokens.access_token}}); assert.deepEqual(await response.json(), {sub:'demo-ada', name:'Ada'});
    response = await exchange(form); assert.equal(response.status, 400); assert.equal((await response.json()).error, 'invalid_grant');
    const wrongPkce = await grant(verifier);
    response = await exchange({...form, code:wrongPkce, code_verifier:'w'.repeat(43)}); assert.equal(response.status, 400); assert.equal((await response.json()).error, 'invalid_grant');
    assert.equal((await exchange({...form, code:wrongPkce})).status, 400);
    const raced=await grant(verifier);
    const exchanges=await Promise.all([exchange({...form,code:raced}),exchange({...form,code:raced})]);
    assert.deepEqual(exchanges.map(response=>response.status).sort(),[200,400]);
    response = await exchange({...form, code:'a'.repeat(43), extra:'rejected'}); assert.equal((await response.json()).error, 'invalid_request');
    response = await request('/provider/authorize?client_id=evil&redirect_uri=https://evil.invalid'); assert.notEqual(response.status, 303);
    assert.equal(server.exitCode, null, errors);
  } finally {
    if (server && server.exitCode === null) {server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve));}
    rmSync(root, {recursive:true, force:true});
  }
});
