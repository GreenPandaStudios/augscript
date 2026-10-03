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
  '<g id="august-logo" transform="translate(50 45) scale(.45)"></g>',
  `<g transform="translate(50 45) scale(.45)">${inner(logo)}</g>`);
await render(banner, 'media/banner.png');

// Render the actual Explorer assets in both themes, including their 16px size.
const entries = [
  ['aug', 'source.aug', 'Source'],
  ['main', 'main.aug', 'Startup'],
  ['export', 'export.aug', 'Exports'],
  ['config', 'main.yaml', 'Configuration'],
];
const rows = [];
for (const [variant, y, background, foreground, secondary] of [
  ['', 0, '#202923', '#EBEFEA', '#ADB9B0'],
  ['-light', 184, '#F5F4EF', '#293E34', '#67746C'],
]) {
  rows.push(`<rect y="${y}" width="1000" height="184" fill="${background}"/>`);
  for (let index = 0; index < entries.length; index++) {
    const [icon, filename, description] = entries[index];
    const artwork = inner(await read(`icons/${icon}${variant}.svg`));
    const x = 36 + index * 246;
    rows.push(`<g transform="translate(${x} ${y + 32})">
      <g transform="translate(0 2) scale(2.5)">${artwork}</g>
      <text x="0" y="76" fill="${foreground}" font-size="19">${filename}</text>
      <text x="0" y="102" fill="${secondary}" font-size="14">${description}</text>
      <g transform="translate(0 119)">${artwork}</g>
      <text x="25" y="132" fill="${secondary}" font-size="12">16 px</text>
    </g>`);
  }
}
const legend = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="368" viewBox="0 0 1000 368">
  <g font-family="Arial, Helvetica, sans-serif">${rows.join('\n')}</g>
</svg>`;
await writeFile(new URL('media/file-icons.svg', base), legend);
await render(legend, 'media/file-icons.png');
process.stdout.write('Rendered August mark, banner, and light/dark file icons.\n');
