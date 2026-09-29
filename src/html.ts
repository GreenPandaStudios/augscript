/** Server HTML accepts standard, inert elements; executable content uses endpoint actions. */
export const htmlTags = new Set('html head title meta link body main header footer nav section article aside div span p h1 h2 h3 h4 h5 h6 a ul ol li dl dt dd table caption thead tbody tfoot tr th td form label input button select option optgroup textarea fieldset legend output progress meter img picture source video audio track figure figcaption details summary dialog pre code blockquote strong em b i u s small mark time br hr wbr area col embed param'.split(' '));
export const htmlVoidTags = new Set('area br col embed hr img input link meta param source track wbr'.split(' '));
export const htmlBooleanAttributes = new Set('disabled checked selected multiple required readonly autofocus hidden open controls loop muted autoplay novalidate formnovalidate reversed'.split(' '));
export const htmlUrlAttributes = new Set(['href', 'src', 'action', 'formaction', 'poster']);
const globals = new Set('id class className title lang dir role tabindex tabIndex style slot translate accesskey contenteditable draggable spellcheck'.split(' '));
const attributes: Record<string, string> = {
  html:'xmlns', meta:'name content charset http-equiv', link:'rel href type media sizes crossorigin integrity',
  a:'href target rel download hreflang type', form:'action method enctype autocomplete target name novalidate',
  input:'name type value placeholder required disabled checked readonly min max step minlength maxlength pattern autocomplete autofocus multiple accept form',
  button:'name type value disabled form formaction formmethod formnovalidate', label:'for htmlFor form',
  textarea:'name placeholder rows cols required disabled readonly minlength maxlength autocomplete',
  select:'name required disabled multiple size form', option:'value selected disabled label', optgroup:'label disabled', fieldset:'name disabled form',
  img:'src alt width height loading decoding crossorigin srcset sizes', source:'src type srcset sizes media',
  audio:'src controls autoplay loop muted preload', video:'src controls autoplay loop muted preload poster width height', track:'src kind label srclang default',
  th:'colspan rowspan scope headers', td:'colspan rowspan headers', ol:'start reversed type', li:'value',
  progress:'value max', meter:'value min max low high optimum', details:'open name', dialog:'open', time:'datetime', output:'for name form',
};
export function htmlAttribute(tag: string, name: string): 'bool' | 'string' | 'HttpAction' | undefined {
  if (tag === 'form' && name === 'onSubmit' || tag === 'button' && name === 'onClick') return 'HttpAction';
  if (name.startsWith('data-') || name.startsWith('aria-')) return 'string';
  if (globals.has(name) || attributes[tag]?.split(' ').includes(name)) return htmlBooleanAttributes.has(name) ? 'bool' : 'string';
  return undefined;
}
