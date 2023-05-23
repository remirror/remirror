import extractDomain from 'extract-domain';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  composeTransactionSteps,
  CreateExtensionPlugin,
  EditorState,
  extension,
  ExtensionPriority,
  ExtensionTag,
  findMatches,
  FromToProps,
  getChangedRanges,
  GetMarkRange,
  getMarkRange,
  getMatchString,
  getSelectedWord,
  Handler,
  includes,
  isAllSelection,
  isElementDomNode,
  isMarkActive,
  isSelectionEmpty,
  isTextSelection,
  keyBinding,
  KeyBindingProps,
  last,
  LiteralUnion,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  NamedShortcut,
  NodeWithPosition,
  omitExtraAttributes,
  ProsemirrorAttributes,
  ProsemirrorNode,
  removeMark,
  Static,
  updateMark,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { undoDepth } from '@remirror/pm/history';
import { MarkPasteRule } from '@remirror/pm/paste-rules';
import { Selection } from '@remirror/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@remirror/pm/transform';

import { TOP_50_TLDS } from './link-extension-utils';

const UPDATE_LINK = 'updateLink';

// Based on https://gist.github.com/dperini/729294
const DEFAULT_AUTO_LINK_REGEX =
  /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?]\S*)?/gi;

/**
 * Can be an empty string which sets url's to '//google.com'.
 */
export type DefaultProtocol = 'http:' | 'https:' | '' | string;

export interface FoundAutoLink {
  /** link href */
  href: string;
  /** link text */
  text: string;
  /** offset of matched text */
  start: number;
  /** index of next char after match end */
  end: number;
}

interface LinkWithProperties extends Omit<FoundAutoLink, 'href'> {
  range: FromToProps;
  attrs: LinkAttributes;
}

interface EventMeta {
  selection: Selection;
  range: FromToProps | undefined;
  doc: ProsemirrorNode;
  attrs: LinkAttributes;
}

interface ShortcutHandlerActiveLink extends FromToProps {
  attrs: LinkAttributes;
}

export interface ShortcutHandlerProps extends FromToProps {
  selectedText: string;
  activeLink: ShortcutHandlerActiveLink | undefined;
}

type LinkTarget = LiteralUnion<'_blank' | '_self' | '_parent' | '_top', string> | null;

export interface LinkOptions {
  /**
   * @deprecated use `onShortcut` instead
   */
  onActivateLink?: Handler<(selectedText: string) => void>;

  /**
   * Called when the user activates the keyboard shortcut.
   *
   * It is called with the active link in the selected range, if it exists.
   *
   * If multiple links exist within the range, only the first is returned. I'm
   * open to PR's if you feel it's important to capture all contained links.
   *
   * @defaultValue undefined
   */
  onShortcut?: Handler<(props: ShortcutHandlerProps) => void>;

  /**
   * Called after the `commands.updateLink` has been called.
   *
   * @defaultValue undefined
   */
  onUpdateLink?: Handler<(selectedText: string, meta: EventMeta) => void>;

  /**
   * Whether to select the text of the full active link when clicked.
   *
   * @defaultValue false
   */
  selectTextOnClick?: boolean;

  /**
   * Listen to click events for links.
   */
  onClick?: Handler<(event: MouseEvent, data: LinkClickData) => boolean>;

  /**
   * Extract the `href` attribute from the provided `url` text.
   *
   * @remarks
   *
   * By default this will return the `url` text with a `${defaultProtocol}//` or
   * `mailto:` prefix if needed.
   */
  extractHref?: Static<(props: { url: string; defaultProtocol: DefaultProtocol }) => string>;

  /**
   * Whether the link is opened when being clicked.
   *
   * @deprecated use `onClick` handler instead.
   */
  openLinkOnClick?: boolean;

  /**
   * Whether automatic links should be created.
   *
   * @defaultValue false
   */
  autoLink?: boolean;

  /**
   * The regex matcher for matching against the RegExp. The matcher must capture
   * the URL part of the string as it's first match. Take a look at the default
   * value.
   *
   * @default
   * /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?]\S*)?/gi
   */
  autoLinkRegex?: Static<RegExp>;

  /**
   * An array of valid Top Level Domains (TLDs) to limit the scope of auto linking.
   *
   * @remarks
   *
   * The default autoLinkRegex does not limit the TLD of a URL for performance and maintenance reasons.
   * This can lead to the auto link behaviour being overly aggressive.
   *
   * Defaults to the top 50 TLDs (as of May 2022).
   *
   * If you find this too permissive, you can override this with an array of your own TLDs.  i.e. you could use the top 10 TLDs.
   *
   * ['com', 'de', 'net', 'org', 'uk', 'cn', 'ga', 'nl', 'cf', 'ml']
   *
   * However, this would prevent auto linking to domains like remirror.io!
   *
   * For a complete list of TLDs, you could use an external package like "tlds" or "global-tld-list"
   *
   * Or to extend the default list you could
   *
   * ```ts
   * import { LinkExtension, TOP_50_TLDS } from 'remirror/extensions';
   * const extensions = () => [
   *   new LinkExtension({ autoLinkAllowedTLDs: [...TOP_50_TLDS, 'london', 'tech'] })
   * ];
   * ```
   *
   * @defaultValue the top 50 TLDs by usage (May 2022)
   */
  autoLinkAllowedTLDs?: Static<string[]>;

  /**
   * Returns a list of links found in string where each element is a hash
   * with properties { href: string; text: string; start: number; end: number; }
   *
   * @remarks
   *
   * This function is used instead of matching links with the autoLinkRegex option.
   *
   * @default null
   *
   * @param {string} input
   * @param {string} defaultProtocol
   * @returns {array} FoundAutoLink[]
   */
  findAutoLinks?: Static<(input: string, defaultProtocol: string) => FoundAutoLink[]>;

  /**
   * Check if the given string is a link
   *
   * @remarks
   *
   * Used instead of validating a link with the autoLinkRegex and autoLinkAllowedTLDs option.
   *
   * @default null
   *
   * @param {string} input
   * @param {string} defaultProtocol
   * @returns {boolean}
   */
  isValidUrl?: Static<(input: string, defaultProtocol: string) => boolean>;

  /**
   * The default protocol to use when it can't be inferred.
   *
   * @defaultValue ''
   */
  defaultProtocol?: DefaultProtocol;

  /**
   * The default target to use for links.
   *
   * @defaultValue null
   */
  defaultTarget?: LinkTarget;

  /**
   * The supported targets which can be parsed from the DOM or added with
   * `insertLink`.
   *
   * @defaultValue []
   */
  supportedTargets?: LinkTarget[];
}

export interface LinkClickData extends GetMarkRange, LinkAttributes {}

export type LinkAttributes = ProsemirrorAttributes<{
  /**
   * The link which is a required property for the link mark.
   */
  href: string;

  /**
   * True when this was an automatically generated link. False when the link was
   * added specifically by the user.
   *
   * @defaultValue false
   */
  auto?: boolean;

  /**
   * The target for the link..
   */
  target?: LinkTarget;
}>;

@extension<LinkOptions>({
  defaultOptions: {
    autoLink: false,
    defaultProtocol: '',
    selectTextOnClick: false,
    openLinkOnClick: false,
    autoLinkRegex: DEFAULT_AUTO_LINK_REGEX,
    autoLinkAllowedTLDs: TOP_50_TLDS,
    findAutoLinks: undefined,
    isValidUrl: undefined,
    defaultTarget: null,
    supportedTargets: [],
    extractHref,
  },
  staticKeys: ['autoLinkRegex'],
  handlerKeyOptions: { onClick: { earlyReturnValue: true } },
  handlerKeys: ['onActivateLink', 'onShortcut', 'onUpdateLink', 'onClick'],
  defaultPriority: ExtensionPriority.Medium,
})
export class LinkExtension extends MarkExtension<LinkOptions> {
  get name() {
    return 'link' as const;
  }

  /**
   * The autoLinkRegex option with the global flag removed, ensure no "lastIndex" state is maintained over multiple matches
   * @private
   */
  private _autoLinkRegexNonGlobal: RegExp | undefined = undefined;

  createTags() {
    return [ExtensionTag.Link, ExtensionTag.ExcludeInputRules];
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    const AUTO_ATTRIBUTE = 'data-link-auto';

    const getTargetObject = (target: string | null | undefined): { target: string } | undefined => {
      const { defaultTarget, supportedTargets } = this.options;
      const targets = defaultTarget ? [...supportedTargets, defaultTarget] : supportedTargets;
      return target && includes(targets, target) ? { target } : undefined;
    };

    return {
      inclusive: false,
      excludes: '_',
      ...override,
      attrs: {
        ...extra.defaults(),
        href: {},
        target: { default: this.options.defaultTarget },
        auto: { default: false },
      },
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const href = node.getAttribute('href');
            const text = node.textContent;

            // If link text content equals href value we "auto link"
            // e.g [test](//test.com) - not "auto link"
            // e.g [test.com](//test.com) - "auto link"
            const auto =
              this.options.autoLink &&
              (node.hasAttribute(AUTO_ATTRIBUTE) ||
                href === text ||
                href?.replace(`${this.options.defaultProtocol}//`, '') === text);

            return {
              ...extra.parse(node),
              href,
              auto,
              ...getTargetObject(node.getAttribute('target')),
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { auto: _, target: __, ...rest } = omitExtraAttributes(node.attrs, extra);
        const auto = node.attrs.auto ? { [AUTO_ATTRIBUTE]: '' } : {};
        const rel = 'noopener noreferrer nofollow';
        const attrs = {
          ...extra.dom(node),
          ...rest,
          rel,
          ...auto,
          ...getTargetObject(node.attrs.target),
        };

        return ['a', attrs, 0];
      },
    };
  }

  onCreate(): void {
    const { autoLinkRegex } = this.options;
    // Remove the global flag from autoLinkRegex, and wrap in start (^) and end ($) terminator to test for exact match
    this._autoLinkRegexNonGlobal = new RegExp(
      `^${autoLinkRegex.source}$`,
      autoLinkRegex.flags.replace('g', ''),
    );
  }

  /**
   * Add a handler to the `onActivateLink` to capture when .
   */
  @keyBinding({ shortcut: NamedShortcut.InsertLink })
  shortcut({ tr }: KeyBindingProps): boolean {
    let selectedText = '';
    let { from, to, empty, $from } = tr.selection;
    let expandedSelection = false;
    const mark = getMarkRange($from, this.type);

    // When the selection is empty, expand it to the active mark
    if (empty) {
      const selectedWord = mark ?? getSelectedWord(tr);

      if (!selectedWord) {
        return false;
      }

      ({ text: selectedText, from, to } = selectedWord);
      expandedSelection = true;
    }

    if (from === to) {
      return false;
    }

    if (!expandedSelection) {
      selectedText = tr.doc.textBetween(from, to);
    }

    this.options.onActivateLink(selectedText);
    this.options.onShortcut({
      activeLink: mark
        ? { attrs: mark.mark.attrs as LinkAttributes, from: mark.from, to: mark.to }
        : undefined,
      selectedText,
      from,
      to,
    });

    return true;
  }

  /**
   * Create or update the link if it doesn't currently exist at the current
   * selection or provided range.
   */
  @command()
  updateLink(attrs: LinkAttributes, range?: FromToProps): CommandFunction {
    return (props) => {
      const { tr } = props;
      const selectionIsValid =
        (isTextSelection(tr.selection) && !isSelectionEmpty(tr.selection)) ||
        isAllSelection(tr.selection) ||
        isMarkActive({ trState: tr, type: this.type });

      if (!selectionIsValid && !range) {
        return false;
      }

      tr.setMeta(this.name, { command: UPDATE_LINK, attrs, range });

      return updateMark({ type: this.type, attrs, range })(props);
    };
  }

  /**
   * Select the link at the current location.
   */
  @command()
  selectLink(): CommandFunction {
    return this.store.commands.selectMark.original(this.type);
  }

  /**
   * Remove the link at the current selection
   */
  @command()
  removeLink(range?: FromToProps): CommandFunction {
    return (props) => {
      const { tr } = props;

      if (!isMarkActive({ trState: tr, type: this.type, ...range })) {
        return false;
      }

      return removeMark({ type: this.type, expand: true, range })(props);
    };
  }

  /**
   * Create the paste rules that can transform a pasted link in the document.
   */
  createPasteRules(): MarkPasteRule[] {
    return [
      {
        type: 'mark',
        regexp: this.options.autoLinkRegex,
        markType: this.type,
        getAttributes: (url, isReplacement) => ({
          href: this.buildHref(getMatchString(url)),
          auto: !isReplacement,
        }),
        transformMatch: (match) => {
          const url = getMatchString(match);

          if (!url) {
            return false;
          }

          if (!this.isValidUrl(url)) {
            return false;
          }

          return url;
        },
      },
    ];
  }

  /**
   * Track click events passed through to the editor.
   */
  createEventHandlers(): CreateEventHandlers {
    return {
      clickMark: (event, clickState) => {
        const markRange = clickState.getMark(this.type);

        if (!markRange) {
          return;
        }

        const attrs = markRange.mark.attrs as LinkAttributes;
        const data: LinkClickData = { ...attrs, ...markRange };

        // If one of the handlers returns `true` then return early.
        if (this.options.onClick(event, data)) {
          return true;
        }

        // If editable is false, the openLinkOnClick handler or the selectTextOnClick handler should
        // not be triggered or it will conflict with the default browser event
        if (!this.store.view.editable) {
          return;
        }

        let handled = false;

        if (this.options.openLinkOnClick) {
          handled = true;
          const href = attrs.href;
          window.open(href, '_blank');
        }

        if (this.options.selectTextOnClick) {
          handled = true;
          this.store.commands.selectText(markRange);
        }

        return handled;
      },
    };
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      appendTransaction: (transactions, prevState, state: EditorState) => {
        const transactionsWithLinkMeta = transactions.filter((tr) => !!tr.getMeta(this.name));

        transactionsWithLinkMeta.forEach((tr) => {
          const trMeta = tr.getMeta(this.name);

          if (trMeta.command === UPDATE_LINK) {
            const { range, attrs } = trMeta;
            const { selection, doc } = state;
            const meta = { range, selection, doc, attrs };

            const { from, to } = range ?? selection;
            this.options.onUpdateLink(doc.textBetween(from, to), meta);
          }
        });

        if (!this.options.autoLink) {
          return;
        }

        const isUndo = undoDepth(prevState) - undoDepth(state) === 1;

        if (isUndo) {
          return; // Don't execute auto link logic if an undo was performed.
        }

        const docChanged = transactions.some((tr) => tr.docChanged);

        if (!docChanged) {
          return; // Don't execute auto link logic if nothing has changed.
        }

        // Create a single transaction, by combining all transactions
        const composedTransaction = composeTransactionSteps(transactions, prevState);

        const changes = getChangedRanges(composedTransaction, [ReplaceAroundStep, ReplaceStep]);
        const { mapping } = composedTransaction;
        const { tr, doc } = state;

        const { updateLink, removeLink } = this.store.chain(tr);

        changes.forEach(({ prevFrom, prevTo, from, to }) => {
          // Store all the callbacks we need to make
          const onUpdateCallbacks: Array<Pick<EventMeta, 'range' | 'attrs'> & { text: string }> =
            [];

          // Check if node was split into two by `Enter` key press
          const isNodeSeparated = to - from === 2;

          // Get previous links
          const prevMarks = this.getLinkMarksInRange(prevState.doc, prevFrom, prevTo, true)
            .filter((item) => item.mark.type === this.type)
            .map(({ from, to, text }) => ({
              mappedFrom: mapping.map(from),
              mappedTo: mapping.map(to),
              text,
              from,
              to,
            }));

          // Check if links need to be removed or updated.
          prevMarks.forEach(
            ({ mappedFrom: newFrom, mappedTo: newTo, from: prevMarkFrom, to: prevMarkTo }, i) =>
              this.getLinkMarksInRange(doc, newFrom, newTo, true)
                .filter((item) => item.mark.type === this.type)
                .forEach((newMark) => {
                  const prevLinkText = prevState.doc.textBetween(
                    prevMarkFrom,
                    prevMarkTo,
                    undefined,
                    ' ',
                  );

                  const newLinkText = doc
                    .textBetween(newMark.from, newMark.to + 1, undefined, ' ')
                    .trim();

                  const wasLink = this.isValidUrl(prevLinkText);
                  const isLink = this.isValidUrl(newLinkText);

                  if (isLink) {
                    return;
                  }

                  if (wasLink) {
                    removeLink({ from: newMark.from, to: newMark.to }).tr();

                    prevMarks.splice(i, 1);
                  }

                  if (isNodeSeparated) {
                    return;
                  }

                  // If link characters have been deleted
                  from === to &&
                    // Check newLinkText for a remaining valid link
                    this.findAutoLinks(newLinkText)
                      .map((link) =>
                        this.addLinkProperties({
                          ...link,
                          from: newFrom + link.start,
                          to: newFrom + link.end,
                        }),
                      )
                      .forEach(({ attrs, range, text }) => {
                        updateLink(attrs, range).tr();

                        onUpdateCallbacks.push({ attrs, range, text });
                      });
                }),
          );

          // Find text that can be auto linked
          this.findTextBlocksInRange(doc, { from, to }).forEach(({ text, positionStart }) => {
            // Match links in text node
            this.findAutoLinks(text)
              .map((link) =>
                this.addLinkProperties({
                  ...link,
                  // Calculate link position.
                  from: positionStart + link.start + 1,
                  to: positionStart + link.end + 1,
                }),
              )
              // Check if link is within the changed range.
              .filter(({ range }) => {
                const fromIsInRange = from >= range.from && from <= range.to;
                const toIsInRange = to >= range.from && to <= range.to;

                return fromIsInRange || toIsInRange || isNodeSeparated;
              })
              // Avoid overwriting manually created links.
              .filter(
                ({ range }) =>
                  this.getLinkMarksInRange(tr.doc, range.from, range.to, false).length === 0,
              )
              // Prevent updating existing auto links
              .filter(
                ({ range: { from }, text }) =>
                  !prevMarks.some(
                    ({ text: prevMarkText, mappedFrom }) =>
                      mappedFrom === from && prevMarkText === text,
                  ),
              )
              .forEach(({ attrs, text, range }) => {
                updateLink(attrs, range).tr();

                onUpdateCallbacks.push({ attrs, range, text });
              });
          });

          window.requestAnimationFrame(() => {
            onUpdateCallbacks.forEach(({ attrs, range, text }) => {
              const { doc, selection } = tr;
              this.options.onUpdateLink(text, { attrs, doc, range, selection });
            });
          });
        });

        if (tr.steps.length === 0) {
          return;
        }

        return tr;
      },
    };
  }

  private buildHref(url: string): string {
    return this.options.extractHref({
      url,
      defaultProtocol: this.options.defaultProtocol,
    });
  }

  private getLinkMarksInRange(
    doc: ProsemirrorNode,
    from: number,
    to: number,
    isAutoLink: boolean,
  ): GetMarkRange[] {
    const linkMarks: GetMarkRange[] = [];

    if (from === to) {
      const resolveFrom = Math.max(from - 1, 0);

      const $pos = doc.resolve(resolveFrom);
      const range = getMarkRange($pos, this.type);

      if (range?.mark.attrs.auto === isAutoLink) {
        linkMarks.push(range);
      }
    } else {
      doc.nodesBetween(from, to, (node, pos) => {
        const marks = node.marks ?? [];
        const linkMark = marks.find(
          ({ type, attrs }) => type === this.type && attrs.auto === isAutoLink,
        );

        if (linkMark) {
          linkMarks.push({
            from: pos,
            to: pos + node.nodeSize,
            mark: linkMark,
            text: node.textContent,
          });
        }
      });
    }

    return linkMarks;
  }

  private findTextBlocksInRange(
    node: ProsemirrorNode,
    range: FromToProps,
  ): Array<{ text: string; positionStart: number }> {
    const nodesWithPos: NodeWithPosition[] = [];

    // define a placeholder for leaf nodes to calculate link position
    node.nodesBetween(range.from, range.to, (node, pos) => {
      if (!node.isTextblock || !node.type.allowsMarkType(this.type)) {
        return;
      }

      nodesWithPos.push({
        node,
        pos,
      });
    });

    return nodesWithPos.map((textBlock) => ({
      text: node.textBetween(
        textBlock.pos,
        textBlock.pos + textBlock.node.nodeSize,
        undefined,
        ' ',
      ),
      positionStart: textBlock.pos,
    }));
  }

  private addLinkProperties({
    from,
    to,
    href,
    ...link
  }: FoundAutoLink & FromToProps): LinkWithProperties {
    return {
      ...link,
      range: { from, to },
      attrs: { href, auto: true },
    };
  }

  private findAutoLinks(str: string): FoundAutoLink[] {
    if (this.options.findAutoLinks) {
      return this.options.findAutoLinks(str, this.options.defaultProtocol);
    }

    const toAutoLink: FoundAutoLink[] = [];

    for (const match of findMatches(str, this.options.autoLinkRegex)) {
      const text = getMatchString(match);

      if (!text) {
        continue;
      }

      const href = this.buildHref(text);

      if (!this.isValidTLD(href) && !href.startsWith('tel:')) {
        continue;
      }

      toAutoLink.push({
        text,
        href,
        start: match.index,
        end: match.index + text.length,
      });
    }

    return toAutoLink;
  }

  private isValidUrl(text: string): boolean {
    if (this.options.isValidUrl) {
      return this.options.isValidUrl(text, this.options.defaultProtocol);
    }

    return this.isValidTLD(this.buildHref(text)) && !!this._autoLinkRegexNonGlobal?.test(text);
  }

  private isValidTLD(str: string): boolean {
    const { autoLinkAllowedTLDs } = this.options;

    if (autoLinkAllowedTLDs.length === 0) {
      return true;
    }

    const domain = extractDomain(str);

    if (domain === '') {
      // Not a domain
      return true;
    }

    const tld = last<string>(domain.split('.'));

    return autoLinkAllowedTLDs.includes(tld);
  }
}

/**
 * Extract the `href` from the provided text.
 *
 * @remarks
 *
 * This will return the `url` text with a `${defaultProtocol}//` or `mailto:` prefix if needed.
 */
export function extractHref({
  url,
  defaultProtocol,
}: {
  url: string;
  defaultProtocol: DefaultProtocol;
}): string {
  const startsWithProtocol = /^((?:https?|ftp)?:)\/\//.test(url);

  // This isn't 100% precise because we allowed URLs without protocol
  // For example, userid@example.com could be email address or link http://userid@example.com
  const isEmail = !startsWithProtocol && url.includes('@');

  if (isEmail) {
    return `mailto:${url}`;
  }

  return startsWithProtocol ? url : `${defaultProtocol}//${url}`;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      link: LinkExtension;
    }
  }
}
