import {formatFile, type SourceStyle} from './formatter.ts';
import {parse} from './parser.ts';

/** Resolve and validate source preferences before creating any project files. */
export function sourceStyle(preferences: Partial<SourceStyle> = {}): SourceStyle {
  const style: SourceStyle = {block_style:'indent', indentation:'spaces', assignment:'equals', ...preferences};
  const choices = {block_style:['braces','indent'], indentation:['spaces','tabs'], assignment:['equals','to']};
  for (const key of Object.keys(choices) as (keyof SourceStyle)[])
    if (!choices[key].includes(style[key])) throw new Error(`Invalid ${key}: ${style[key]}. Choose ${choices[key].join(' or ')}.`);
  return style;
}

export function styleConfiguration(style: SourceStyle): string {
  return `block_style: ${style.block_style}\nindentation: ${style.indentation}\nassignment: ${style.assignment}\n`;
}

/** Generate source through the same parser and semantic-preserving formatter used by aug format. */
export function formatSource(path: string, source: string, style: SourceStyle): string {
  return formatFile({config:style}, parse(path, source).file);
}
