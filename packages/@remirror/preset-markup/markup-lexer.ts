/**
 * @packageDocumentation
 * This whole file has been adapted from [rino](https://github.com/ocavue/rino).
 * It's a great showcase for what can be accomplished with `remirror`. Please
 * star the repository to show your support.
 */

// export interface BaseToken {
//   attrs: {}
// }

export type Token = InlineToken

export interface InlineToken {
  type: 'inline';
  /** The `markType` of this inline token */
  marks: string[];
  /** The text that will be encompassed by the mark */
  text: string;
  attrs: {
    depth: number;
    class?: string;
    href?: string;
    start?: boolean; // Is the first token of a serial of tokens
    end?: boolean; // Is the last token of a serial of tokens
  } & Record<string, any>;
}

type Render = (match: string[], depth: number) => InlineToken[];
type Rule = [RegExp, Render];

function fixMarkNames(marks: string[]): string[] {
  if (marks.length <= 1) {
    return marks;
  }

  if (marks.includes('mdMark')) {
    return ['mdMark'];
  }

  if (marks.includes('mdCodeText')) {
    return ['mdCodeText'];
  }

  if (marks.includes('mdText')) {
    return marks.filter((x) => x !== 'mdText');
  }

  return marks;
}

function pushMark(token: InlineToken, markName: string): InlineToken {
  if (!token.marks.includes(markName)) {
    token.marks = fixMarkNames([...token.marks, markName]);
  }

  return token;
}

export class Lexer {
  #rules: Record<string, Rule>;

  public constructor(rules: Record<string, Rule>) {
    this.#rules = rules;
    this.#rules = {
      doubleEmphases: [
        /\*{2}(.+?)\*{2}(?!\*)/y,
        (match, depth) => [
          { text: '**', marks: ['mdMark'], attrs: { depth, start: true } },
          ...this.scan(match[1], depth + 1).map((token) => pushMark(token, 'mdStrong')),
          { text: '**', marks: ['mdMark'], attrs: { depth, end: true } },
        ],
      ],
      singleEmphasis: [
        /\*((?:\*\*|[^*])+?)\*(?!\*)/y,
        (match, depth) => [
          { attrs: { depth, start: true }, text: '*', marks: ['mdMark'] },
          ...this.scan(match[1], depth + 1).map((token) => pushMark(token, 'mdEm')),
          { attrs: { depth, end: true }, text: '*', marks: ['mdMark'] },
        ],
      ],
      delete: [
        /~~(.+?)~~/y, // ~~Delete~~
        (match, depth) => [
          { attrs: { depth, start: true }, text: '~~', marks: ['mdMark'] },
          ...this.scan(match[1], depth + 1).map((token) => pushMark(token, 'mdDel')),
          { attrs: { depth, end: true }, text: '~~', marks: ['mdMark'] },
        ],
      ],
      code: [
        /(`+)(\s*)(.*?[^`])(\s*)\1(?!`)/y, // `Code`
        (match, depth) => [
          { attrs: { depth, start: true }, text: match[1], marks: ['mdMark'] },
          { attrs: { depth }, text: match[2], marks: ['mdCodeSpace'] },
          { attrs: { depth }, text: match[3], marks: ['mdCodeText'] },
          { attrs: { depth }, text: match[4], marks: ['mdCodeSpace'] },
          { attrs: { depth, end: true }, text: match[1], marks: ['mdMark'] },
        ],
      ],
      image: [
        /!\[([^[\]]+)]\((.+?)\)/y,
        (match, depth) => [
          { attrs: { depth, start: true }, text: '![', marks: ['mdMark'] },
          { attrs: { depth }, text: match[1], marks: ['mdImgText'] },
          { attrs: { depth }, text: '](', marks: ['mdMark'] },
          { attrs: { depth, href: match[2] }, text: match[2], marks: ['mdImgUri'] },
          { attrs: { depth, end: true }, text: ')', marks: ['mdMark'] },
        ],
      ],
      link: [
        /\[([^[\]]+)]\((.+?)\)/y, // [link](https://url)
        (match, depth) => [
          { attrs: { depth, start: true }, text: '[', marks: ['mdMark'] },
          { attrs: { depth }, text: match[1], marks: ['mdLinkText'] },
          { attrs: { depth }, text: '](', marks: ['mdMark'] },
          {
            text: match[2],
            marks: ['mdLinkUri'],
            attrs: { depth: depth, href: match[2] },
          },
          { attrs: { depth, end: true }, text: ')', marks: ['mdMark'] },
        ],
      ],
      autolink: [
        /<([^ >]+(@|:)[^ >]+)>/y, // <https://url>
        (match, depth) => [
          { attrs: { depth, start: true }, text: '<', marks: ['mdMark'] },
          {
            text: match[1],
            marks: ['mdLinkText'],
            attrs: { depth: depth, href: match[1] },
          },
          { attrs: { depth, end: true }, text: '>', marks: ['mdMark'] },
        ],
      ],
      text: [
        /[\S\s]+?(?=[!*<[\\_`~]|https?:\/\/| {2,}\n|$)/y,
        (match, depth) => [
          { attrs: { depth, start: true, end: true }, text: match[0], marks: ['mdText'] },
        ],
      ],
    };
  }

  private manipulate(text: string, startIndex: number, depth: number): [InlineToken[], number] {
    for (const [name, [regex, render]] of Object.entries(this.#rules)) {
      regex.lastIndex = startIndex;
      const match = regex.exec(text);

      if (!match) {
        // If the match fails, regex.exec() returns null, and sets `regex.lastIndex` to 0.
        continue;
      } else {
        // Otherwise we set `regex.lastIndex` to 0 manually to avoid some unexpected behavior.
        regex.lastIndex = 0;
      }

      const tokens: InlineToken[] = render(match, depth).filter((token) => token.text.length); // Rmove all empty tokens
      const length = tokens.map((token) => token.text.length).reduce((a, b) => a + b, 0);

      if (length !== match[0].length) {
        console.error(tokens);
        throw new Error(
          `Tokenization get wrong length when using inline render '${name}'. Before rendering: ${match[0].length}; After rendering: ${length}.`,
        );
      }

      return [tokens, length];
    }

    throw new Error(`Infinite loop at: ${text}`);
  }

  public scan(text: string, depth = 1): InlineToken[] {
    const output: InlineToken[] = [];
    let start = 0;

    while (start < text.length) {
      const [tokens, length] = this.manipulate(text, start, depth);
      start += length;
      output.push(...tokens);
    }

    return output;
  }
}
