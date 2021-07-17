import { css } from '@linaria/core';

/**
 * Sets the code block to wrap the text.
 */
export const WRAP = css`
  white-space: pre-wrap !important;
`;

/**
 * a11y-dark theme for JavaScript, CSS, and HTML Based on the okaidia theme:
 * https://github.com/PrismJS/prism/blob/gh-pages/themes/prism-okaidia.css
 * @author ericwbailey
 */
export const A11Y_DARK = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #f8f8f2;
    background: none;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }
  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    border-radius: 0.3em;
  }
  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: #2b2b2b;
  }
  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
    white-space: normal;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #d4d0ab;
  }
  .token.punctuation,
  .token.punctuation.important {
    color: #fefefe;
  }
  .token.property,
  .token.tag,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #ffa07a;
  }
  .token.boolean,
  .token.number {
    color: #00e0e0;
  }
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #abe338;
  }
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable {
    color: #00e0e0;
  }
  .token.atrule,
  .token.attr-value,
  .token.function {
    color: #ffd700;
  }
  .token.keyword {
    color: #00e0e0;
  }
  .token.regex,
  .token.important {
    color: #ffd700;
  }
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
  .token.entity {
    cursor: help;
  }
  @media screen and (-ms-high-contrast: active) {
    code[class*='language-'],
    pre[class*='language-'] {
      color: windowText;
      background: window;
    }
    :not(pre) > code[class*='language-'],
    pre[class*='language-'] {
      background: window;
    }
    .token.important {
      background: highlight;
      color: window;
      font-weight: normal;
    }
    .token.atrule,
    .token.attr-value,
    .token.function,
    .token.keyword,
    .token.operator,
    .token.selector {
      font-weight: bold;
    }
    .token.attr-value,
    .token.comment,
    .token.doctype,
    .token.function,
    .token.keyword,
    .token.operator,
    .token.property,
    .token.string {
      color: highlight;
    }
    .token.attr-value,
    .token.url {
      font-weight: normal;
    }
  }
` as 'remirror-a11y-dark';

/**
 * atom-dark theme for `prism.js` Based on Atom's `atom-dark` theme:
 * https://github.com/atom/atom-dark-syntax
 * @author Joe Gibson (@gibsjose)
 */
export const ATOM_DARK = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #c5c8c6;
    text-shadow: 0 1px rgba(0, 0, 0, 0.3);
    font-family: Inconsolata, Monaco, Consolas, 'Courier New', Courier, monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }
  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    border-radius: 0.3em;
  }
  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: #1d1f21;
  }
  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #7c7c7c;
  }
  .token.punctuation,
  .token.punctuation.important {
    color: #c5c8c6;
  }
  .namespace {
    opacity: 0.7;
  }
  .token.property,
  .token.keyword,
  .token.tag {
    color: #96cbfe;
  }
  .token.class-name {
    color: #ffffb6;
    text-decoration: underline;
  }
  .token.boolean,
  .token.constant {
    color: #99cc99;
  }
  .token.symbol,
  .token.deleted {
    color: #f92672;
  }
  .token.number {
    color: #ff73fd;
  }
  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #a8ff60;
  }
  .token.variable {
    color: #c6c5fe;
  }
  .token.operator {
    color: #ededed;
  }
  .token.entity {
    color: #ffffb6;
    /* text-decoration: underline; */
  }
  .token.url {
    color: #96cbfe;
  }
  .language-css .token.string,
  .style .token.string {
    color: #87c38a;
  }
  .token.atrule,
  .token.attr-value {
    color: #f9ee98;
  }
  .token.function {
    color: #dad085;
  }
  .token.regex {
    color: #e9c062;
  }
  .token.important {
    color: #fd971f;
  }
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
  .token.entity {
    cursor: help;
  }
` as 'remirror-atom-dark';

/*
Name:       Base16 Atelier Sulphurpool Light Author:     Bram de Haan
(http://atelierbram.github.io/syntax-highlighting/atelier-schemes/sulphurpool)
Prism template by Bram de Haan
(http://atelierbram.github.io/syntax-highlighting/prism/) Original Base16 color
scheme by Chris Kempson (https://github.com/chriskempson/base16)
*/
export const BASE16_ATELIERSULPHURPOOL_LIGHT = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #f5f7ff;
    color: #5e6687;
  }
  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #dfe2f1;
  }
  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #dfe2f1;
  }
  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }
  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #898ea4;
  }
  .token.punctuation,
  .token.punctuation.important {
    color: #5e6687;
  }
  .token.namespace {
    opacity: 0.7;
  }
  .token.operator,
  .token.boolean,
  .token.number {
    color: #c76b29;
  }
  .token.property {
    color: #c08b30;
  }
  .token.tag {
    color: #3d8fd1;
  }
  .token.string {
    color: #22a2c9;
  }
  .token.selector {
    color: #6679cc;
  }
  .token.attr-name {
    color: #c76b29;
  }
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #22a2c9;
  }
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit {
    color: #ac9739;
  }
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #22a2c9;
  }
  .token.placeholder,
  .token.variable {
    color: #3d8fd1;
  }
  .token.deleted {
    text-decoration: line-through;
  }
  .token.inserted {
    border-bottom: 1px dotted #202746;
    text-decoration: none;
  }
  .token.italic {
    font-style: italic;
  }
  .token.important,
  .token.bold {
    font-weight: bold;
  }
  .token.important {
    color: #c94922;
  }
  .token.entity {
    cursor: help;
  }
  pre > code.highlight {
    outline: 0.4em solid #c94922;
    outline-offset: 0.4em;
  }
  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #dfe2f1;
  }
  .line-numbers-rows > span:before {
    color: #979db4;
  }
  /* overrides color-values for the Line Highlight plugin
 * http://prismjs.com/plugins/line-highlight/
 */
  .line-highlight {
    background: rgba(107, 115, 148, 0.2);
    background: -webkit-linear-gradient(left, rgba(107, 115, 148, 0.2) 70%, rgba(107, 115, 148, 0));
    background: linear-gradient(to right, rgba(107, 115, 148, 0.2) 70%, rgba(107, 115, 148, 0));
  }
` as 'remirror-base16-ateliersulphurpool-light';

/**
 * Based on Plugin: Syntax Highlighter CB Plugin URI:
 * http://wp.tutsplus.com/tutorials/plugins/adding-a-syntax-highlighter-shortcode-using-prism-js
 * Description: Highlight your code snippets with an easy to use shortcode based
 * on Lea Verou's Prism.js. Version: 1.0.0 Author: c.bavota Author URI:
 * http://bavotasan.comhttp://wp.tutsplus.com/tutorials/plugins/adding-a-syntax-highlighter-shortcode-using-prism-js/
 * http://cbavota.bitbucket.org/syntax-highlighter/
 */
export const CB = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #fff;
    text-shadow: 0 1px 1px #000;
    font-family: Menlo, Monaco, 'Courier New', monospace;
    direction: ltr;
    text-align: left;
    word-spacing: normal;
    white-space: pre;
    word-wrap: normal;
    line-height: 1.4;
    background: none;
    border: 0;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-'] code {
    float: left;
    padding: 0 15px 0 0;
  }

  pre[class*='language-'],
  :not(pre) > code[class*='language-'] {
    background: #222;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 15px;
    margin: 1em 0;
    overflow: auto;
    -moz-border-radius: 8px;
    -webkit-border-radius: 8px;
    border-radius: 8px;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 5px 10px;
    line-height: 1;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    border-radius: 3px;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #797979;
  }

  .token.selector,
  .token.operator,
  .token.punctuation,
  .token.punctuation.important {
    color: #fff;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.boolean {
    color: #ffd893;
  }

  .token.atrule,
  .token.attr-value,
  .token.hex,
  .token.string {
    color: #b0c975;
  }

  .token.property,
  .token.entity,
  .token.url,
  .token.attr-name,
  .token.keyword {
    color: #c27628;
  }

  .token.regex {
    color: #9b71c6;
  }

  .token.entity {
    cursor: help;
  }

  .token.function,
  .token.constant {
    color: #e5a638;
  }

  .token.variable {
    color: #fdfba8;
  }

  .token.number {
    color: #8799b0;
  }

  .token.important,
  .token.deliminator {
    color: #e45734;
  }

  /* Line highlight plugin */
  pre[data-line] {
    position: relative;
    padding: 1em 0 1em 3em;
  }

  .line-highlight {
    position: absolute;
    left: 0;
    right: 0;
    margin-top: 1em; /* Same as .prism's padding-top */
    background: rgba(255, 255, 255, 0.2);
    pointer-events: none;
    line-height: inherit;
    white-space: pre;
  }

  .line-highlight:before,
  .line-highlight[data-end]:after {
    content: attr(data-start);
    position: absolute;
    top: 0.3em;
    left: 0.6em;
    min-width: 1em;
    padding: 0 0.5em;
    background-color: rgba(255, 255, 255, 0.3);
    color: #fff;
    font: bold 65%/1.5 sans-serif;
    text-align: center;
    -moz-border-radius: 8px;
    -webkit-border-radius: 8px;
    border-radius: 8px;
    text-shadow: none;
  }

  .line-highlight[data-end]:after {
    content: attr(data-end);
    top: auto;
    bottom: 0.4em;
  }

  /* for line numbers */
  .line-numbers-rows {
    margin: 0;
  }

  .line-numbers-rows span {
    padding-right: 10px;
    border-right: 3px #d9d336 solid;
  }
` as 'remirror-cb';

/**
 * Darcula theme
 *
 * Adapted from a theme based on: IntelliJ Darcula Theme
 * (https://github.com/bulenkov/Darcula)
 *
 * @author Alexandre Paradis <service.paradis@gmail.com>
 * @version 1.0
 */
export const DARCULA = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #a9b7c6;
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    color: inherit;
    background: rgba(33, 66, 131, 0.85);
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    color: inherit;
    background: rgba(33, 66, 131, 0.85);
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: #2b2b2b;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.cdata {
    color: #808080;
  }

  .token.delimiter,
  .token.boolean,
  .token.keyword,
  .token.selector,
  .token.important,
  .token.atrule {
    color: #cc7832;
  }

  .token.operator,
  .token.punctuation,
  .token.attr-name {
    color: #a9b7c6;
  }

  .token.tag,
  .token.tag .punctuation,
  .token.doctype,
  .token.builtin {
    color: #e8bf6a;
  }

  .token.entity,
  .token.number,
  .token.symbol {
    color: #6897bb;
  }

  .token.property,
  .token.constant,
  .token.variable {
    color: #9876aa;
  }

  .token.string,
  .token.char {
    color: #6a8759;
  }

  .token.attr-value,
  .token.attr-value .punctuation {
    color: #a5c261;
  }
  .token.attr-value .punctuation:first-of-type {
    color: #a9b7c6;
  }

  .token.url {
    color: #287bde;
    text-decoration: underline;
  }

  .token.function {
    color: #ffc66d;
  }

  .token.regex {
    background: #364135;
  }

  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.inserted {
    background: #294436;
  }

  .token.deleted {
    background: #484a4a;
  }

  /*code.language-css .token.punctuation, .token.punctuation.important {color:
  #cc7832;
}*/

  code.language-css .token.property,
  code.language-css .token.property + .token.punctuation,
  .token.punctuation.important {
    color: #a9b7c6;
  }

  code.language-css .token.id {
    color: #ffc66d;
  }

  code.language-css .token.selector > .token.class,
  code.language-css .token.selector > .token.attribute,
  code.language-css .token.selector > .token.pseudo-class,
  code.language-css .token.selector > .token.pseudo-element {
    color: #ffc66d;
  }
` as 'remirror-darcula';

/**
 * Dracula Theme originally by Zeno Rocha [@zenorocha] https://draculatheme.com/
 *
 * Ported for PrismJS by Albert Vallverdu [@byverdu]
 */
export const DRACULA = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #f8f8f2;
    background: none;
    text-shadow: 0 1px rgba(0, 0, 0, 0.3);
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    border-radius: 0.3em;
  }

  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
    background: #282a36;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
    white-space: normal;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6272a4;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #f8f8f2;
  }

  .namespace {
    opacity: 0.7;
  }

  .token.property,
  .token.tag,
  .token.constant,
  .token.symbol,
  .token.deleted {
    color: #ff79c6;
  }

  .token.boolean,
  .token.number {
    color: #bd93f9;
  }

  .token.selector,
  .token.attr-name,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #50fa7b;
  }

  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string,
  .token.variable {
    color: #f8f8f2;
  }

  .token.atrule,
  .token.attr-value,
  .token.function,
  .token.class-name {
    color: #f1fa8c;
  }

  .token.keyword {
    color: #8be9fd;
  }

  .token.regex,
  .token.important {
    color: #ffb86c;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.entity {
    cursor: help;
  }
` as 'remirror-dracula';

/*
Name: Duotone Dark Author: Simurai, adapted from DuoTone themes for Atom
(http://simurai.com/projects/2016/01/01/duotone-themes)

Conversion: Bram de Haan
(http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-evening-dark.css)
Generated with Base16 Builder (https://github.com/base16-builder/base16-builder)
*/

export const DUOTONE_DARK = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #2a2734;
    color: #9a86fd;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #6a51e6;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #6a51e6;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6c6783;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #6c6783;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #e09142;
  }

  .token.property,
  .token.function {
    color: #9a86fd;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #eeebff;
  }

  code.language-javascript,
  .token.attr-name {
    color: #c4b9fe;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #ffcc99;
  }

  .token.placeholder,
  .token.variable {
    color: #ffcc99;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #eeebff;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #c4b9fe;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #8a75f5;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #2c2937;
  }

  .line-numbers-rows > span:before {
    color: #3c3949;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(224, 145, 66, 0.2);
    background: -webkit-linear-gradient(left, rgba(224, 145, 66, 0.2) 70%, rgba(224, 145, 66, 0));
    background: linear-gradient(to right, rgba(224, 145, 66, 0.2) 70%, rgba(224, 145, 66, 0));
  }
` as 'remirror-duotone-dark';

/**
 * Name:   Duotone Earth Author: Simurai, adapted from DuoTone themes for Atom
 * (http://simurai.com/projects/2016/01/01/duotone-themes)
 *
 * Conversion: Bram de Haan
 * (http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-earth-dark.css)
 * Generated with Base16 Builder
 * (https://github.com/base16-builder/base16-builder)
 */
export const DUOTONE_EARTH = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #322d29;
    color: #88786d;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #6f5849;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #6f5849;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6a5f58;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #6a5f58;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #bfa05a;
  }

  .token.property,
  .token.function {
    color: #88786d;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #fff3eb;
  }

  code.language-javascript,
  .token.attr-name {
    color: #a48774;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #fcc440;
  }

  .token.placeholder,
  .token.variable {
    color: #fcc440;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #fff3eb;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #a48774;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #816d5f;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #35302b;
  }

  .line-numbers-rows > span:before {
    color: #46403d;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(191, 160, 90, 0.2);
    background: -webkit-linear-gradient(left, rgba(191, 160, 90, 0.2) 70%, rgba(191, 160, 90, 0));
    background: linear-gradient(to right, rgba(191, 160, 90, 0.2) 70%, rgba(191, 160, 90, 0));
  }
` as 'remirror-duotone-earth';

/**
 * Name:   Duotone Forest Author: by Simurai, adapted from DuoTone themes for
 * Atom (http://simurai.com/projects/2016/01/01/duotone-themes)
 *
 * Conversion: Bram de Haan
 * (http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-forest-dark.css)
 * Generated with Base16 Builder
 * (https://github.com/base16-builder/base16-builder)
 */
export const DUOTONE_FOREST = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #2a2d2a;
    color: #687d68;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #435643;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #435643;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #535f53;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #535f53;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #a2b34d;
  }

  .token.property,
  .token.function {
    color: #687d68;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #f0fff0;
  }

  code.language-javascript,
  .token.attr-name {
    color: #b3d6b3;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #e5fb79;
  }

  .token.placeholder,
  .token.variable {
    color: #e5fb79;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #f0fff0;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #b3d6b3;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #5c705c;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #2c302c;
  }

  .line-numbers-rows > span:before {
    color: #3b423b;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(162, 179, 77, 0.2);
    background: -webkit-linear-gradient(left, rgba(162, 179, 77, 0.2) 70%, rgba(162, 179, 77, 0));
    background: linear-gradient(to right, rgba(162, 179, 77, 0.2) 70%, rgba(162, 179, 77, 0));
  }
` as 'remirror-duotone-forest';

/**
 * Name:   Duotone Light Author: Simurai, adapted from DuoTone themes for Atom
 * (http://simurai.com/projects/2016/01/01/duotone-themes)
 *
 * Conversion: Bram de Haan
 * (http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-morning-light.css)
 * Generated with Base16 Builder
 * (https://github.com/base16-builder/base16-builder)
 */
export const DUOTONE_LIGHT = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #faf8f5;
    color: #728fcb;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #faf8f5;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #faf8f5;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #b6ad9a;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #b6ad9a;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #063289;
  }

  .token.property,
  .token.function {
    color: #b29762;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #2d2006;
  }

  code.language-javascript,
  .token.attr-name {
    color: #896724;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #728fcb;
  }

  .token.placeholder,
  .token.variable {
    color: #93abdc;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #2d2006;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #896724;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #896724;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #ece8de;
  }

  .line-numbers-rows > span:before {
    color: #cdc4b1;
  }

  /* overrides color-values for the Line Highlight plugin
 * http://prismjs.com/plugins/line-highlight/
 */
  .line-highlight {
    background: rgba(45, 32, 6, 0.2);
    background: -webkit-linear-gradient(left, rgba(45, 32, 6, 0.2) 70%, rgba(45, 32, 6, 0));
    background: linear-gradient(to right, rgba(45, 32, 6, 0.2) 70%, rgba(45, 32, 6, 0));
  }
` as 'remirror-duotone-light';

/**
 * Name: Duotone Sea Author: by Simurai, adapted from DuoTone themes by Simurai
 * for Atom (http://simurai.com/projects/2016/01/01/duotone-themes)
 *
 * Conversion: Bram de Haan
 * (http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-sea-dark.css)
 * Generated with Base16 Builder
 * (https://github.com/base16-builder/base16-builder)
 */
export const DUOTONE_SEA = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #1d262f;
    color: #57718e;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #004a9e;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #004a9e;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #4a5f78;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #4a5f78;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #0aa370;
  }

  .token.property,
  .token.function {
    color: #57718e;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #ebf4ff;
  }

  code.language-javascript,
  .token.attr-name {
    color: #7eb6f6;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #47ebb4;
  }

  .token.placeholder,
  .token.variable {
    color: #47ebb4;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #ebf4ff;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #7eb6f6;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #34659d;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #1f2932;
  }

  .line-numbers-rows > span:before {
    color: #2c3847;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(10, 163, 112, 0.2);
    background: -webkit-linear-gradient(left, rgba(10, 163, 112, 0.2) 70%, rgba(10, 163, 112, 0));
    background: linear-gradient(to right, rgba(10, 163, 112, 0.2) 70%, rgba(10, 163, 112, 0));
  }
` as 'remirror-duotone-sea';

/**
 * Name: Duotone Space Author: Simurai, adapted from DuoTone themes for Atom
 * (http://simurai.com/projects/2016/01/01/duotone-themes)
 *
 * Conversion: Bram de Haan
 * (http://atelierbram.github.io/Base2Tone-prism/output/prism/prism-base2tone-space-dark.css)
 * Generated with Base16 Builder
 * (https://github.com/base16-builder/base16-builder)
 */
export const DUOTONE_SPACE = css`
  code[class*='language-'],
  pre[class*='language-'] {
    font-family: Consolas, Menlo, Monaco, 'Andale Mono WT', 'Andale Mono', 'Lucida Console',
      'Lucida Sans Typewriter', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Liberation Mono',
      'Nimbus Mono L', 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    background: #24242e;
    color: #767693;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    text-shadow: none;
    background: #5151e6;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    text-shadow: none;
    background: #5151e6;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #5b5b76;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #5b5b76;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.tag,
  .token.operator,
  .token.number {
    color: #dd672c;
  }

  .token.property,
  .token.function {
    color: #767693;
  }

  .token.tag-id,
  .token.selector,
  .token.atrule-id {
    color: #ebebff;
  }

  code.language-javascript,
  .token.attr-name {
    color: #aaaaca;
  }

  code.language-css,
  code.language-scss,
  .token.boolean,
  .token.string,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .language-scss .token.string,
  .style .token.string,
  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit,
  .token.statement,
  .token.regex,
  .token.atrule {
    color: #fe8c52;
  }

  .token.placeholder,
  .token.variable {
    color: #fe8c52;
  }

  .token.deleted {
    text-decoration: line-through;
  }

  .token.inserted {
    border-bottom: 1px dotted #ebebff;
    text-decoration: none;
  }

  .token.italic {
    font-style: italic;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.important {
    color: #aaaaca;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid #7676f4;
    outline-offset: 0.4em;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #262631;
  }

  .line-numbers-rows > span:before {
    color: #393949;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(221, 103, 44, 0.2);
    background: -webkit-linear-gradient(left, rgba(221, 103, 44, 0.2) 70%, rgba(221, 103, 44, 0));
    background: linear-gradient(to right, rgba(221, 103, 44, 0.2) 70%, rgba(221, 103, 44, 0));
  }
` as 'remirror-duotone-space';

/**
 * GHColors theme by Avi Aryan (http://aviaryan.in) Inspired by Github syntax
 * coloring
 */
export const GH_COLORS = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #393a34;
    font-family: 'Consolas', 'Bitstream Vera Sans Mono', 'Courier New', Courier, monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    font-size: 0.95em;
    line-height: 1.2em;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    background: #b3d4fc;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    background: #b3d4fc;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    border: 1px solid #dddddd;
    background-color: white;
  }

  :not(pre) > code[class*='language-'],
  pre[class*='language-'] {
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.2em;
    padding-top: 1px;
    padding-bottom: 1px;
    background: #f8f8f8;
    border: 1px solid #dddddd;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #999988;
    font-style: italic;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.string,
  .token.attr-value {
    color: #e3116c;
  }
  .token.punctuation,
  .token.operator {
    color: #393a34; /* no highlight */
  }

  .token.entity,
  .token.url,
  .token.symbol,
  .token.number,
  .token.boolean,
  .token.variable,
  .token.constant,
  .token.property,
  .token.regex,
  .token.inserted {
    color: #36acaa;
  }

  .token.atrule,
  .token.keyword,
  .token.attr-name,
  .language-autohotkey .token.selector {
    color: #00a4db;
  }

  .token.function,
  .token.deleted,
  .language-autohotkey .token.tag {
    color: #9a050f;
  }

  .token.tag,
  .token.selector,
  .language-autohotkey .token.keyword {
    color: #00009f;
  }

  .token.important,
  .token.function,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }
` as 'remirror-ghcolors';

/**
 * Hopscotch by Jan T. Sott https://github.com/idleberg/Hopscotch
 *
 * This work is licensed under the Creative Commons CC0 1.0 Universal License
 */
export const HOPSCOTCH = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #ffffff;
    font-family: 'Fira Mono', Menlo, Monaco, 'Lucida Console', 'Courier New', Courier, monospace;
    font-size: 16px;
    line-height: 1.375;
    direction: ltr;
    text-align: left;
    word-spacing: normal;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    white-space: pre;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
    background: #322931;
    color: #b9b5b8;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.1em;
    border-radius: 0.3em;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #797379;
  }

  .token.punctuation,
  .token.punctuation.important {
    color: #b9b5b8;
  }

  .namespace {
    opacity: 0.7;
  }

  .token.null,
  .token.operator,
  .token.boolean,
  .token.number {
    color: #fd8b19;
  }
  .token.property {
    color: #fdcc59;
  }
  .token.tag {
    color: #1290bf;
  }
  .token.string {
    color: #149b93;
  }
  .token.selector {
    color: #c85e7c;
  }
  .token.attr-name {
    color: #fd8b19;
  }
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #149b93;
  }

  .token.attr-value,
  .token.keyword,
  .token.control,
  .token.directive,
  .token.unit {
    color: #8fc13e;
  }

  .token.statement,
  .token.regex,
  .token.atrule {
    color: #149b93;
  }

  .token.placeholder,
  .token.variable {
    color: #1290bf;
  }

  .token.important {
    color: #dd464c;
    font-weight: bold;
  }

  .token.entity {
    cursor: help;
  }

  pre > code.highlight {
    outline: 0.4em solid red;
    outline-offset: 0.4em;
  }
` as 'remirror-hopscotch';

/**
 * Pojoaque Style by Jason Tate
 * http://web-cms-designs.com/ftopict-10-pojoaque-style-for-highlight-js-code-highlighter.html
 * Based on Solarized Style from http://ethanschoonover.com/solarized
 * http://softwaremaniacs.org/media/soft/highlight/test.html
 */
export const POJOAQUE = css`
  code[class*='language-'],
  pre[class*='language-'] {
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    white-space: pre;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
    font-family: Menlo, Monaco, 'Courier New', monospace;
    font-size: 15px;
    line-height: 1.5;
    color: #dccf8f;
    text-shadow: 0;
  }

  pre[class*='language-'],
  :not(pre) > code[class*='language-'] {
    border-radius: 5px;
    border: 1px solid #000;
    color: #dccf8f;
    background: #181914
      url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAMAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQACQYGBgcGCQcHCQ0IBwgNDwsJCQsPEQ4ODw4OERENDg4ODg0RERQUFhQUERoaHBwaGiYmJiYmKysrKysrKysrKwEJCAgJCgkMCgoMDwwODA8TDg4ODhMVDg4PDg4VGhMRERERExoXGhYWFhoXHR0aGh0dJCQjJCQrKysrKysrKysr/8AAEQgAjACMAwEiAAIRAQMRAf/EAF4AAQEBAAAAAAAAAAAAAAAAAAABBwEBAQAAAAAAAAAAAAAAAAAAAAIQAAEDAwIHAQEAAAAAAAAAAADwAREhYaExkUFRcYGxwdHh8REBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AyGFEjHaBS2fDDs2zkhKmBKktb7km+ZwwCnXPkLVmCTMItj6AXFxRS465/BTnkAJvkLkJe+7AKKoi2AtRS2zuAWsCb5GOlBN8gKfmuGHZ8MFqIth3ALmFoFwbwKWyAlTAp17uKqBvgBD8sM4fTjhvAhkzhaRkBMKBrfs7jGPIpzy7gFrAqnC0C0gB0EWwBDW2cBVQwm+QtPpa3wBO3sVvszCnLAhkzgL5/RLf13cLQd8/AGlu0Cb5HTx9KuAEieGJEdcehS3eRTp2ATdt3CpIm+QtZwAhROXFeb7swp/ahaM3kBE/jSIUBc/AWrgBN8uNFAl+b7sAXFxFn2YLUU5Ns7gFX8C4ib+hN8gFWXwK3bZglxEJm+gKdciLPsFV/TClsgJUwKJ5FVA7tvIFrfZhVfGJDcsCKaYgAqv6YRbE+RWOWBtu7+AL3yRalXLyKqAIIfk+zARbDgFyEsncYwJvlgFRW+GEWntIi2P0BooyFxcNr8Ep3+ANLbMO+QyhvbiqdgC0kVvgUUiLYgBS2QtPbiVI1/sgOmG9uO+Y8DW+7jS2zAOnj6O2BndwuIAUtkdRN8gFoK3wwXMQyZwHVbClsuNLd4E3yAUR6FVDBR+BafQGt93LVMxJTv8ABts4CVLhcfYWsCb5kC9/BHdU8CLYFY5bMAd+eX9MGthhpbA1vu4B7+RKkaW2Yq4AQtVBBFsAJU/AuIXBhN8gGWnstefhiZyWvLAEnbYS1uzSFP6Jvn4Baxx70JKkQojLib5AVTey1jjgkKJGO0AKWyOm7N7cSpgSpAdPH0Tfd/gp1z5C1ZgKqN9J2wFxcUUuAFLZAm+QC0Fb4YUVRFsAOvj4KW2dwtYE3yAWk/wS/PLMKfmuGHZ8MAXF/Ja32Yi5haAKWz4Ydm2cSpgU693Atb7km+Zwwh+WGcPpxw3gAkzCLY+iYUDW/Z3Adc/gpzyFrAqnALkJe+7DoItgAtRS2zuKqGE3yAx0oJvkdvYrfZmALURbDuL5/RLf13cAuDeBS2RpbtAm+QFVA3wR+3fUtFHoBDJnC0jIXH0HWsgMY8inPLuOkd9chp4z20ALQLSA8cI9jYAIa2zjzjBd8gRafS1vgiUho/kAKcsCGTOGWvoOpkAtB3z8Hm8x2Ff5ADp4+lXAlIvcmwH/2Q==')
      repeat left top;
  }

  pre[class*='language-'] {
    padding: 12px;
    overflow: auto;
  }

  :not(pre) > code[class*='language-'] {
    padding: 2px 6px;
  }

  .token.namespace {
    opacity: 0.7;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #586e75;
    font-style: italic;
  }
  .token.number,
  .token.string,
  .token.char,
  .token.builtin,
  .token.inserted {
    color: #468966;
  }

  .token.attr-name {
    color: #b89859;
  }
  .token.operator,
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #dccf8f;
  }
  .token.selector,
  .token.regex {
    color: #859900;
  }
  .token.atrule,
  .token.keyword {
    color: #cb4b16;
  }

  .token.attr-value {
    color: #468966;
  }
  .token.function,
  .token.variable,
  .token.placeholder {
    color: #b58900;
  }
  .token.property,
  .token.tag,
  .token.boolean,
  .token.number,
  .token.constant,
  .token.symbol {
    color: #b89859;
  }
  .token.tag {
    color: #ffb03b;
  }
  .token.important,
  .token.statement,
  .token.deleted {
    color: #dc322f;
  }
  .token.punctuation,
  .token.punctuation.important {
    color: #dccf8f;
  }
  .token.entity {
    cursor: help;
  }
  .token.bold {
    font-weight: bold;
  }
  .token.italic {
    font-style: italic;
  }
` as 'remirror-pojoaque';

/**
 * VS theme by Andrew Lock (https://andrewlock.net) Inspired by Visual Studio
 * syntax coloring
 */

export const VS = css`
  code[class*='language-'],
  pre[class*='language-'] {
    color: #393a34;
    font-family: 'Consolas', 'Bitstream Vera Sans Mono', 'Courier New', Courier, monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    font-size: 0.95em;
    line-height: 1.2em;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
  }

  pre[class*='language-']::-moz-selection,
  pre[class*='language-'] ::-moz-selection,
  code[class*='language-']::-moz-selection,
  code[class*='language-'] ::-moz-selection {
    background: #c1def1;
  }

  pre[class*='language-']::selection,
  pre[class*='language-'] ::selection,
  code[class*='language-']::selection,
  code[class*='language-'] ::selection {
    background: #c1def1;
  }

  /* Code blocks */
  pre[class*='language-'] {
    padding: 1em;
    margin: 0.5em 0;
    overflow: auto;
    border: 1px solid #dddddd;
    background-color: white;
  }

  /* Inline code */
  :not(pre) > code[class*='language-'] {
    padding: 0.2em;
    padding-top: 1px;
    padding-bottom: 1px;
    background: #f8f8f8;
    border: 1px solid #dddddd;
  }

  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #008000;
    font-style: italic;
  }

  .token.namespace {
    opacity: 0.7;
  }

  .token.string {
    color: #a31515;
  }

  .token.punctuation,
  .token.operator {
    color: #393a34; /* no highlight */
  }

  .token.url,
  .token.symbol,
  .token.number,
  .token.boolean,
  .token.variable,
  .token.constant,
  .token.inserted {
    color: #36acaa;
  }

  .token.atrule,
  .token.keyword,
  .token.attr-value,
  .language-autohotkey .token.selector,
  .language-json .token.boolean,
  .language-json .token.number,
  code[class*='language-css'] {
    color: #0000ff;
  }

  .token.function {
    color: #393a34;
  }
  .token.deleted,
  .language-autohotkey .token.tag {
    color: #9a050f;
  }

  .token.selector,
  .language-autohotkey .token.keyword {
    color: #00009f;
  }

  .token.important,
  .token.bold {
    font-weight: bold;
  }

  .token.italic {
    font-style: italic;
  }

  .token.class-name,
  .language-json .token.property {
    color: #2b91af;
  }

  .token.tag,
  .token.selector {
    color: #800000;
  }

  .token.attr-name,
  .token.property,
  .token.regex,
  .token.entity {
    color: #ff0000;
  }

  .token.directive.tag .tag {
    background: #ffff00;
    color: #393a34;
  }

  /* overrides color-values for the Line Numbers plugin
 * http://prismjs.com/plugins/line-numbers/
 */
  .line-numbers .line-numbers-rows {
    border-right-color: #a5a5a5;
  }

  .line-numbers-rows > span:before {
    color: #2b91af;
  }

  /* overrides color-values for the Line Highlight plugin
* http://prismjs.com/plugins/line-highlight/
*/
  .line-highlight {
    background: rgba(193, 222, 241, 0.2);
    background: -webkit-linear-gradient(left, rgba(193, 222, 241, 0.2) 70%, rgba(221, 222, 241, 0));
    background: linear-gradient(to right, rgba(193, 222, 241, 0.2) 70%, rgba(221, 222, 241, 0));
  }
` as 'remirror-vs';

/**
 * xonokai theme for JavaScript, CSS and HTML based on:
 * https://github.com/MoOx/sass-prism-theme-base by Maxime Thirouin ~ MoOx -->
 * http://moox.fr/ , which is Loosely based on Monokai textmate theme by
 * http://www.monokai.nl/ license: MIT; http://moox.mit-license.org/
 */
export const XONOKAI = css`
  code[class*='language-'],
  pre[class*='language-'] {
    -moz-tab-size: 2;
    -o-tab-size: 2;
    tab-size: 2;
    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    white-space: pre;
    white-space: pre-wrap;
    word-wrap: normal;
    font-family: Menlo, Monaco, 'Courier New', monospace;
    font-size: 14px;
    color: #76d9e6;
    text-shadow: none;
  }
  pre[class*='language-'],
  :not(pre) > code[class*='language-'] {
    background: #2a2a2a;
  }
  pre[class*='language-'] {
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #e1e1e8;
    overflow: auto;
  }

  pre[class*='language-'] {
    position: relative;
  }
  pre[class*='language-'] code {
    white-space: pre;
    display: block;
  }

  :not(pre) > code[class*='language-'] {
    padding: 0.15em 0.2em 0.05em;
    border-radius: 0.3em;
    border: 0.13em solid #7a6652;
    box-shadow: 1px 1px 0.3em -0.1em #000 inset;
  }
  .token.namespace {
    opacity: 0.7;
  }
  .token.comment,
  .token.prolog,
  .token.doctype,
  .token.cdata {
    color: #6f705e;
  }
  .token.operator,
  .token.boolean,
  .token.number {
    color: #a77afe;
  }
  .token.attr-name,
  .token.string {
    color: #e6d06c;
  }
  .token.entity,
  .token.url,
  .language-css .token.string,
  .style .token.string {
    color: #e6d06c;
  }
  .token.selector,
  .token.inserted {
    color: #a6e22d;
  }
  .token.atrule,
  .token.attr-value,
  .token.keyword,
  .token.important,
  .token.deleted {
    color: #ef3b7d;
  }
  .token.regex,
  .token.statement {
    color: #76d9e6;
  }
  .token.placeholder,
  .token.variable {
    color: #fff;
  }
  .token.important,
  .token.statement,
  .token.bold {
    font-weight: bold;
  }
  .token.punctuation,
  .token.punctuation.important {
    color: #bebec5;
  }
  .token.entity {
    cursor: help;
  }
  .token.italic {
    font-style: italic;
  }

  code.language-markup {
    color: #f9f9f9;
  }
  code.language-markup .token.tag {
    color: #ef3b7d;
  }
  code.language-markup .token.attr-name {
    color: #a6e22d;
  }
  code.language-markup .token.attr-value {
    color: #e6d06c;
  }
  code.language-markup .token.style,
  code.language-markup .token.script {
    color: #76d9e6;
  }
  code.language-markup .token.script .token.keyword {
    color: #76d9e6;
  }

  /* Line highlight plugin */
  pre[class*='language-'][data-line] {
    position: relative;
    padding: 1em 0 1em 3em;
  }
  pre[data-line] .line-highlight {
    position: absolute;
    left: 0;
    right: 0;
    padding: 0;
    margin-top: 1em;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;
    line-height: inherit;
    white-space: pre;
  }
  pre[data-line] .line-highlight:before,
  pre[data-line] .line-highlight[data-end]:after {
    content: attr(data-start);
    position: absolute;
    top: 0.4em;
    left: 0.6em;
    min-width: 1em;
    padding: 0.2em 0.5em;
    background-color: rgba(255, 255, 255, 0.4);
    color: black;
    font: bold 65%/1 sans-serif;
    height: 1em;
    line-height: 1em;
    text-align: center;
    border-radius: 999px;
    text-shadow: none;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
  }
  pre[data-line] .line-highlight[data-end]:after {
    content: attr(data-end);
    top: auto;
    bottom: 0.4em;
  }
` as 'remirror-xonokai';
