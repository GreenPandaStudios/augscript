import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const base = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, base), 'utf8');
const inner = svg => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const render = (svg, path) => sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL(path, base)));
const logo = await read('media/augscript.svg');
await render(logo, 'media/augscript.png');
const banner = (await read('media/banner.svg')).replace(
  '<g id="august-logo" transform="translate(54 72) scale(.42)"></g>',
  `<g transform="translate(54 72) scale(.42)">${inner(logo)}</g>`);
await render(banner, 'media/banner.png');

// Use the shipped Explorer icons, so this legend cannot drift from their artwork.
const entries = [
  ['aug', 'module.aug', 'August source', '#79D3F5'],
  ['main', 'main.aug', 'Application startup', '#F8B64F'],
  ['export', 'export.aug', 'Public module surface', '#B58CEB'],
  ['config', 'main.yaml', 'Project configuration', '#48C7C5'],
];
const cards = [];
for (let index = 0; index < entries.length; index++) {
  const [icon, filename, description, color] = entries[index];
  const artwork = inner(await read(`icons/${icon}.svg`));
  cards.push(`<g transform="translate(${36 + index * 288} 98)">
    <rect width="264" height="208" rx="16" fill="#132A40" stroke="#26435B"/>
    <g transform="translate(100 20) scale(4)">${artwork}</g>
    <text x="132" y="116" text-anchor="middle" fill="${color}" font-size="22" font-weight="700">${filename}</text>
    <text x="132" y="151" text-anchor="middle" fill="#B7CBDC" font-size="16">${description}</text>
    <g transform="translate(64 175)">${artwork}</g>
    <text x="87" y="188" fill="#B7CBDC" font-size="13">Actual 16px size</text>
  </g>`);
}
const legend = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="344" viewBox="0 0 1200 344">
  <rect width="1200" height="344" rx="24" fill="#0C182B"/>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="40" y="57" fill="#F2F7FC" font-size="26" font-weight="700">Know a file's role at a glance</text>
    ${cards.join('\n')}
  </g>
</svg>`;
await writeFile(new URL('media/file-icons.svg', base), legend);
await render(legend, 'media/file-icons.png');
process.stdout.write('Rendered August extension logo, banner, and file icon legend.\n');
