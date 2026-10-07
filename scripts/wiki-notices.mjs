import {createHash} from 'node:crypto';
import {existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const noticeName = /^(licen[cs]e|copying|notice|copyright)([._-].*)?$/i;
const safeFile = name => typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name);
function regularFile(path) {
  if (!lstatSync(path).isFile()) throw new Error(`Notice input must be a regular file: ${path}`);
  const bytes = readFileSync(path);
  if (!bytes.length || bytes.length > 2_000_000) throw new Error(`Invalid notice size: ${path}`);
  return bytes;
}
function packageName(path) {
  const name = path.split('node_modules/').at(-1);
  if (!/^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)) throw new Error(`Invalid locked package path: ${path}`);
  return name;
}

/** Preserve full license texts for installed, locked documentation-build inputs.
 * This conservative inventory includes build-only inputs; it is not a browser SBOM.
 * An explicitly reviewed, nonredistributed native helper can record an unavailable text.
 * No dependency downloads, package scripts, or source mutations occur here. */
export function writeWikiNotices(root, outDir) {
  root = resolve(root); outDir = resolve(outDir);
  const lockBytes = regularFile(join(root, 'package-lock.json'));
  const lock = JSON.parse(lockBytes);
  const overrides = JSON.parse(regularFile(join(root, 'docs/third-party-licenses/inputs.json')));
  const reviewed = JSON.parse(regularFile(join(root, 'docs/third-party-licenses/notices.json')));
  const records = [], omitted = [], outputs = new Map();
  const add = (path, bytes) => {
    if (outputs.has(path) && !outputs.get(path).equals(bytes)) throw new Error(`Conflicting notice: ${path}`);
    outputs.set(path, bytes);
    return {file: path, sha256: sha256(bytes)};
  };
  for (const [path, entry] of Object.entries(lock.packages).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
    if (!path) continue;
    if (!/^node_modules\/(?:@?[A-Za-z0-9._-]+\/)*@?[A-Za-z0-9._-]+$/.test(path) || path.split('/').some(p => p === '.' || p === '..'))
      throw new Error(`Invalid locked package path: ${path}`);
    const name = packageName(path), directory = join(root, path);
    if (!existsSync(join(directory, 'package.json'))) {
      if (!entry.optional) throw new Error(`Missing documentation-build input: ${path}`);
      omitted.push({path, name, version: entry.version, reason: 'Optional input is not installed on this build host.'});
      continue;
    }
    const metadata = JSON.parse(regularFile(join(directory, 'package.json')));
    if (metadata.name !== name || metadata.version !== entry.version) throw new Error(`Documentation input differs from lock: ${path}`);
    if (typeof entry.resolved !== 'string' || !entry.resolved.startsWith('https://registry.npmjs.org/') || typeof entry.integrity !== 'string')
      throw new Error(`Missing pinned documentation source: ${path}`);
    const notices = [];
    const files = readdirSync(directory).sort().filter(file => noticeName.test(file) && safeFile(file));
    const pin = reviewed.packages.find(item => item.path === path && item.name === name && item.version === entry.version);
    const buildOnly = overrides.buildOnly?.find(item => item.name === name && item.version === entry.version && item.sourceIntegrity === entry.integrity);
    const override = overrides.packages.find(item => item.name === name && item.version === entry.version);
    const expected = pin?.notices ?? (override ? [] : null);
    if (!expected || (pin?.sourceIntegrity ?? override?.sourceIntegrity) !== entry.integrity)
      throw new Error(`Review original notice identities for ${name}@${entry.version}`);
    if (JSON.stringify(files) !== JSON.stringify(expected.map(file => file.file).sort()))
      throw new Error(`Changed original notice inventory: ${name}`);
    for (const file of files) {
      const bytes = regularFile(join(directory, file));
      if (sha256(bytes) !== expected.find(item => item.file === file)?.sha256) throw new Error(`Changed original notice: ${name}/${file}`);
      notices.push({...add(`npm/${encodeURIComponent(path)}/${file}`, bytes), source: `${path}/${file}`});
    }
    if (!notices.length && !buildOnly) {
      if (!override || override.sourceIntegrity !== entry.integrity) throw new Error(`Review a full license text for ${name}@${entry.version}`);
      if (!safeFile(override.file) || !/^[a-f0-9]{64}$/.test(override.sha256)) throw new Error(`Invalid notice override: ${name}`);
      const bytes = regularFile(join(root, 'docs/third-party-licenses', override.file));
      if (sha256(bytes) !== override.sha256) throw new Error(`Changed reviewed notice: ${name}`);
      notices.push({...add(`npm/${encodeURIComponent(path)}/${override.file}`, bytes), source: override.source});
    }
    records.push({path, name, version: entry.version, license: metadata.license ?? entry.license ?? null,
      sourceArchive: entry.resolved, sourceIntegrity: entry.integrity, repository: metadata.repository ?? null, notices,
      ...(buildOnly ? {noticeStatus: 'build-only-not-redistributed', noticeReview: buildOnly} : {})});
  }
  const fontDirectory = join(root, 'docs/public/third-party');
  const fonts = JSON.parse(regularFile(join(fontDirectory, 'Inter-provenance.json')));
  const fontLicense = regularFile(join(fontDirectory, 'Inter-OFL-1.1.txt'));
  if (sha256(fontLicense) !== fonts.licenseSha256) throw new Error('Inter license differs from its reviewed source.');
  if (!Array.isArray(fonts.fonts) || !fonts.fonts.length || new Set(fonts.fonts.map(font => font.file)).size !== fonts.fonts.length)
    throw new Error('Invalid Inter font inventory.');
  const actualFonts = readdirSync(join(root, 'node_modules/vitepress/dist/client/theme-default/fonts')).filter(file => /\.(woff2?|ttf|otf)$/.test(file)).sort();
  if (JSON.stringify(actualFonts) !== JSON.stringify(fonts.fonts.map(font => font.file).sort()))
    throw new Error('Inter font inventory differs from the complete VitePress font input set.');
  for (const font of fonts.fonts) {
    if (!safeFile(font.file) || !/^[a-f0-9]{64}$/.test(font.sha256)) throw new Error('Invalid font identity.');
    if (sha256(regularFile(join(root, 'node_modules/vitepress/dist/client/theme-default/fonts', font.file))) !== font.sha256)
      throw new Error(`Inter font differs from the reviewed VitePress input: ${font.file}`);
  }
  add('Inter-OFL-1.1.txt', fontLicense);
  add('Inter-provenance.json', Buffer.from(JSON.stringify(fonts, null, 2) + '\n'));
  add('August-MIT.txt', regularFile(join(root, 'LICENSE')));
  const manifest = {schema: 1, scope: 'Installed locked documentation-build inputs, including inputs not delivered to browsers. Not an embedded-code SBOM or a license-compliance certification.',
    lockSha256: sha256(lockBytes), packages: records, omittedOptionalInputs: omitted, fonts};
  const text = ['August documentation: third-party notices', '', manifest.scope, '',
    'August source and documentation: see August-MIT.txt.',
    'Inter 4.000: see Inter-OFL-1.1.txt and Inter-provenance.json.',
    'Exact package versions, npm source archives and integrity values: manifest.json.',
    'ELKJS is distributed under EPL-2.0. Its source and build instructions are available under that license at https://github.com/kieler/elkjs/tree/0.9.3 .',
    'The ELKJS release documents its Eclipse Layout Kernel source baseline and additional changes: https://github.com/kieler/elkjs/releases/tag/0.9.3 .',
    'These source references supplement the original package license texts below.',
    ...records.filter(record => record.noticeReview).map(record => `${record.name}@${record.version}: ${record.noticeReview.reason} Source: ${record.noticeReview.source}`), ''];
  for (const record of records) for (const notice of record.notices) {
    text.push(`===== ${record.name}@${record.version} — ${notice.source} =====`, outputs.get(notice.file).toString('utf8'), '');
  }
  add('NOTICE.txt', Buffer.from(text.join('\n') + '\n'));
  add('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  // Validate every input before writing the completed site inventory.
  for (const [path, bytes] of outputs) {
    const destination = join(outDir, 'third-party', path);
    mkdirSync(resolve(destination, '..'), {recursive: true});
    writeFileSync(destination, bytes);
  }
  return manifest;
}

/** Prevent the reviewed native build-only exception from becoming website code. */
export function rejectBuildOnlyWikiInputs(bundle) {
  for (const chunk of Object.values(bundle)) {
    if (chunk.type !== 'chunk') continue;
    for (const id of Object.keys(chunk.modules))
      if (/[/\\]node_modules[/\\]@napi-rs[/\\]lzma(?:-|[/\\])/.test(id))
        throw new Error('The nonredistributed LZMA build helper appears in wiki output; review its complete license/source closure before distribution.');
  }
}
