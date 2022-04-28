import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
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
  within,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { undoDepth } from '@remirror/pm/history';
import { MarkPasteRule } from '@remirror/pm/paste-rules';
import { TextSelection } from '@remirror/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@remirror/pm/transform';

const UPDATE_LINK = 'updateLink';

// Based on https://gist.github.com/dperini/729294
const DEFAULT_AUTO_LINK_REGEX =
  /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?]\S*)?/gi;

/**
 * Can be an empty string which sets url's to '//google.com'.
 */
export type DefaultProtocol = 'http:' | 'https:' | '' | string;

interface FoundAutoLink {
  href: string;
  text: string;
  start: number;
  end: number;
}

interface EventMeta {
  selection: TextSelection;
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
            const auto = node.hasAttribute(AUTO_ATTRIBUTE);
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
          href: getMatchString(url),
          auto: !isReplacement,
        }),
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
            const transaction = tr.setSelection(new TextSelection($start, $end));

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
        const composedTransaction = prevState.tr;
        transactions.forEach((transaction) => {
          transaction.steps.forEach((step) => {
            composedTransaction.step(step);
          });
        });

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
              const wasLink = this._autoLinkRegexNonGlobal?.test(prevMark.text);
              const isLink = this._autoLinkRegexNonGlobal?.test(newMark.text);

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
            this.findAutoLinks(nodeText)
              // calculate link position
              .map((link) => ({
                ...link,
                from: pos + link.start + 1,
                to: pos + link.end + 1,
              }))
              .filter((link) => {
                // Determine if found link is within the changed range
                return (
                  within(link.from, from, to) ||
                  within(link.to, from, to) ||
                  within(from, link.from, link.to) ||
                  within(to, link.from, link.to)
                );
              })
              .filter((link) => {
                // Avoid overwriting manually created links
                const marks = this.getLinkMarksInRange(tr.doc, link.from, link.to, false);
                return marks.length === 0;
              })
              .forEach(({ from, to, href, text }) => {
                const attrs = { href, auto: true };
                const range = { from, to };
                updateLink(attrs, range).tr();
                onUpdateCallbacks.push({ attrs, range, text });
              });
          });

          onUpdateCallbacks.forEach(({ range, attrs, text }) => {
            const { doc, selection } = tr;
            this.options.onUpdateLink(text, { doc, selection, range, attrs });
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

  private findAutoLinks(str: string): FoundAutoLink[] {
    const toAutoLink: FoundAutoLink[] = [];

    for (const match of findMatches(str, this.options.autoLinkRegex)) {
      const text = match[0];

      if (!text) {
        continue;
      }

      toAutoLink.push({
        text,
        href: this.buildHref(text),
        start: match.index,
        end: match.index + text.length,
      });
    }

    return toAutoLink;
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
