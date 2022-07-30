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
import { Selection, TextSelection } from '@remirror/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@remirror/pm/transform';

import {
  DEFAULT_ADJACENT_PUNCTUATIONS,
  getPathEndIndex,
  getLinkPath,
  getTrailingCharIndex,
  TOP_50_TLDS,
} from './link-extension-utils';

const UPDATE_LINK = 'updateLink';

// Based on https://gist.github.com/dperini/729294
const DEFAULT_AUTO_LINK_REGEX =
  /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?]\S*)?/gi;

const PATH_TEST_REGEX = /(\/|\?)/;

/**
 * Can be an empty string which sets url's to '//google.com'.
 */
export type DefaultProtocol = 'http:' | 'https:' | '' | string;

interface FoundAutoLinks extends Array<{ text: string; href: string; startIndex: number }> {}

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
   * @default undefined
   */
  onShortcut?: Handler<(props: ShortcutHandlerProps) => void>;

  /**
   * Called after the `commands.updateLink` has been called.
   *
   * @default undefined
   */
  onUpdateLink?: Handler<(selectedText: string, meta: EventMeta) => void>;

  /**
   * Whether to select the text of the full active link when clicked.
   *
   * @default false
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
   * @default false
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
   * @default the top 50 TLDs by usage (May 2022)
   */
  autoLinkAllowedTLDs?: Static<string[]>;

  /**
   * Adjacent punctuations that are excluded from a link
   *
   * To extend the default list you could
   *
   * ```ts
   * import { LinkExtension, DEFAULT_ADJACENT_PUNCTUATIONS } from 'remirror/extensions';
   * const extensions = () => [
   *   new LinkExtension({ adjacentPunctuations: [...DEFAULT_ADJACENT_PUNCTUATIONS, ')'] })
   * ];
   * ```
   *
   * @default
   * [ ',', '.', '!', '?', ':', ';', "'", '"', '(', ')', '[', ']' ]
   */
  adjacentPunctuations?: string[];

  /**
   * The default protocol to use when it can't be inferred.
   *
   * @default ''
   */
  defaultProtocol?: DefaultProtocol;

  /**
   * The default target to use for links.
   *
   * @default null
   */
  defaultTarget?: LinkTarget;

  /**
   * The supported targets which can be parsed from the DOM or added with
   * `insertLink`.
   *
   * @default []
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
   * @default false
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
    adjacentPunctuations: DEFAULT_ADJACENT_PUNCTUATIONS,
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

  /**
   * The plugin for handling click events in the editor.
   *
   * TODO extract this into the events extension and move that extension into
   * core.
   */
  createPlugin(): CreateExtensionPlugin {
    return {
      props: {
        handleClick: (view, pos) => {
          if (!this.options.selectTextOnClick && !this.options.openLinkOnClick) {
            return false;
          }

          const { doc, tr } = view.state;
          const range = getMarkRange(doc.resolve(pos), this.type);

          if (!range) {
            return false;
          }

          if (this.options.openLinkOnClick) {
            const href = range.mark.attrs.href;
            window.open(href, '_blank');
          }

          if (this.options.selectTextOnClick) {
            const $start = doc.resolve(range.from);
            const $end = doc.resolve(range.to);
            const transaction = tr.setSelection(TextSelection.between($start, $end));

            view.dispatch(transaction);
          }

          return true;
        },
      },
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

        changes.forEach(({ from, to, prevFrom, prevTo }) => {
          // Remove auto links that are no longer valid
          this.getLinkMarksInRange(prevState.doc, prevFrom, prevTo, true).forEach((prevMark) => {
            const newFrom = mapping.map(prevMark.from);
            const newTo = mapping.map(prevMark.to);
            const newMarks = this.getLinkMarksInRange(doc, newFrom, newTo, true);

            newMarks.forEach((newMark) => {
              const wasLink = this.isValidUrl(prevMark.text);
              const isLink = this.isValidUrl(newMark.text);

              if (wasLink && !isLink) {
                removeLink({ from: newMark.from, to: newMark.to }).tr();
              }
            });
          });

          // Store all the callbacks we need to make
          const onUpdateCallbacks: Array<Pick<EventMeta, 'range' | 'attrs'> & { text: string }> =
            [];

          // Find text that can be auto linked
          tr.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isTextblock || !node.type.allowsMarkType(this.type)) {
              return;
            }

            const nodeText = tr.doc.textBetween(pos, pos + node.nodeSize, undefined, ' ');

            const positionStart = pos;
            const positionEnd = positionStart + node.nodeSize;

            // If a string is separated into two nodes by `Enter` key press,
            // we consider both to be in the changed range.
            const hasNewNode = to - from === 2;

            this.findAutoLinks(nodeText).forEach(({ text, href, startIndex }) => {
              const linkMarkInRange = this.getLinkMarksInRange(
                doc,
                positionStart + startIndex,
                positionEnd,
                true,
              );
              const lastLinkMarkInRange = linkMarkInRange[linkMarkInRange.length - 1];

              const start = positionStart + 1 + startIndex;
              const end = start + text.length;

              const attrs = { auto: true, href };
              const range = { from: start, to: end };

              if (text.length === 0) {
                // If we have an existing link we can assume the link is not valid and remove It,
                lastLinkMarkInRange &&
                  removeLink({
                    from: lastLinkMarkInRange.from,
                    to: lastLinkMarkInRange.to,
                  }).tr();

                return;
              }

              // Avoid overwriting manually created links
              if (this.getLinkMarksInRange(tr.doc, start, end, false).length > 0) {
                return;
              }

              if (
                // Don't update or create a link outside the changed range,
                (end < to || start > from) &&
                // unless link is not in the same node,
                !hasNewNode &&
                // or the existing link is not a valid "auto link".
                !linkMarkInRange.some(({ mark, text: markText, from, to }) => {
                  return (
                    !(
                      // Outside changed range and
                      (
                        end < from &&
                        // found auto link is not an updated existing link.
                        !text.includes(markText)
                      )
                    ) &&
                    // Existing link `href` matches the existing link text or
                    (mark.attrs.href !== this.buildHref(markText) ||
                      // the existing link matches found auto link href.
                      (end === to && start === from && mark.attrs.href !== href))
                  );
                })
              ) {
                return;
              }

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
      const $pos = doc.resolve(from);
      $pos.marks().forEach(() => {
        const range = getMarkRange($pos, this.type);

        if (range?.mark.attrs.auto === isAutoLink) {
          linkMarks.push(range);
        }
      });
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

  private findAutoLinks(input: string): FoundAutoLinks {
    const foundLinks: FoundAutoLinks = [];
    let temp = input;

    // Fuzzy match valid links
    for (const match of findMatches(temp, this.options.autoLinkRegex)) {
      const link = getMatchString(match);
      const startIndex = match.index;

      // Slice adjacent characters and spaces of the link text
      const text = input.slice(startIndex, this.getLinkEndIndex(temp, link)).split(' ')[0];
      const href = this.buildHref(text);

      // Remove previous links from input string
      temp = temp.slice(temp.indexOf(link) + link.length);

      // Test if link is a valid URL
      if (!this.isValidUrl(text, href)) {
        continue;
      }

      foundLinks.push({ text, href, startIndex });
    }

    // If no valid link was found we potentially need to remove an existing auto link.
    if (foundLinks.length === 0) {
      foundLinks.push({ text: '', href: '', startIndex: 0 });
    }

    return foundLinks;
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

  private isValidUrl(text: string, href?: string): boolean {
    return (
      this.isValidTLD(href || this.buildHref(text)) && !!this._autoLinkRegexNonGlobal?.test(text)
    );
  }

  private getLinkEndIndex(input: string, url: string): number | undefined {
    // This test in not very accurate but good enough. For example A URL with a protocol would pass.
    const path = PATH_TEST_REGEX.test(url) ? getLinkPath(url, this.options.defaultProtocol) : '';

    if (path.length === 0) {
      return getTrailingCharIndex({
        adjacentPunctuations: this.options.adjacentPunctuations,
        input,
        url,
      });
    }

    return getPathEndIndex(path);
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
