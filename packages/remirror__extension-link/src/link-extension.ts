import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  EditorState,
  extension,
  ExtensionPriority,
  ExtensionTag,
  FromToProps,
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
  OnSetOptionsProps,
  preserveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
  range as numberRange,
  removeMark,
  Static,
  updateMark,
} from '@remirror/core';
import type { CreateEventHandlers } from '@remirror/extension-events';
import { MarkPasteRule } from '@remirror/pm/paste-rules';
import { TextSelection } from '@remirror/pm/state';
import { isInvalidSplitReason, isRemovedReason, Suggester } from '@remirror/pm/suggest';

const UPDATE_LINK = 'updateLink';

/**
 * Can be an empty string which sets url's to '//google.com'.
 */
export type DefaultProtocol = 'http:' | 'https:' | '';

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
   */
  onShortcut?: Handler<(props: ShortcutHandlerProps) => void>;

  /**
   * Called after the `commands.updateLink` has been called.
   */
  onUpdateLink?: Handler<(selectedText: string, meta: EventMeta) => void>;

  /**
   * Whether whether to select the text of the full active link when clicked.
   */
  selectTextOnClick?: boolean;

  /**
   * Listen to click events for links.
   */
  onClick?: Handler<(event: MouseEvent, data: LinkClickData) => boolean>;

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
   * /(?:https?:\/\/)?[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,8}(?::\d{1,5})?(?:\/\S*)?/gi
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
    autoLinkRegex: /(?:https?:\/\/)?[\da-z]+(?:[.-][\da-z]+)*\.[a-z]{2,8}(?::\d{1,5})?(?:\/\S*)?/gi,
    defaultTarget: null,
    supportedTargets: [],
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
            const auto =
              node.hasAttribute(AUTO_ATTRIBUTE) ||
              this.options.autoLinkRegex.test(node.textContent ?? '');
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

  onSetOptions(options: OnSetOptionsProps<LinkOptions>): void {
    if (options.changes.autoLink.changed) {
      const [newSuggester] = this.createSuggesters();

      if (options.changes.autoLink.value === true && newSuggester) {
        this.store.addSuggester(newSuggester);
      }

      if (options.changes.autoLink.value === false) {
        this.store.removeSuggester(this.name);
      }
    }
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
        // Only replace the selection for non whitespace selections
        replaceSelection: (replacedText) => !!replacedText.trim(),
      },
    ];
  }

  createSuggesters(): [Suggester] | [] {
    if (!this.options.autoLink) {
      return [];
    }

    // Keep track of this to prevent multiple updates which prevent history from
    // working
    let cachedRange: FromToProps | undefined;

    const suggester: Suggester = {
      name: this.name,
      matchOffset: 0,
      supportedCharacters: /$/,
      char: this.options.autoLinkRegex,
      priority: ExtensionPriority.Lowest,
      caseInsensitive: true,
      disableDecorations: true,
      appendTransaction: true,

      checkNextValidSelection: ($pos, tr) => {
        const range = getMarkRange($pos, this.type);

        if (!range || (cachedRange?.from === $pos.pos && cachedRange.to === range.to)) {
          return;
        }

        if (!range.mark.attrs.auto) {
          return;
        }

        const { mark, to, text } = range;
        const href = extractHref(text, this.options.defaultProtocol);

        if (mark.attrs.href === href) {
          return;
        }

        // The helpers to use here.
        const { getSuggestMethods } = this.store.helpers;

        // Using the chainable commands so that the selection can be preserved
        // for the update.
        const { updateLink, removeLink } = this.store.chain(tr);
        const { findMatchAtPosition } = getSuggestMethods();
        const selection = tr.selection;

        // Keep track of the last removal.
        cachedRange = { from: $pos.pos, to };

        // Remove the link
        removeLink(cachedRange).tr();

        // Make sure the selection gets preserved otherwise the cursor jumps
        // around.
        preserveSelection(selection, tr);

        // Check for active matches from the provided $pos
        const match = findMatchAtPosition($pos, this.name);

        if (match) {
          const { range, text } = match;
          updateLink(
            { href: extractHref(text.full, this.options.defaultProtocol), auto: true },
            range,
          ).tr();
        }
      },

      onChange: (details, tr) => {
        const selection = tr.selection;
        const { text, range, exitReason, setMarkRemoved } = details;
        const href = extractHref(text.full, this.options.defaultProtocol);

        // Using the chainable commands so that the selection can be preserved
        // for the update.

        const chain = this.store.chain(tr);
        const { getSuggestMethods } = this.store.helpers;
        const { findMatchAtPosition } = getSuggestMethods();

        /** Remove the link at the provided range. */
        const remove = () => {
          // Call the command to use a custom transaction rather than the current.

          let markRange: ReturnType<typeof getMarkRange> | undefined;

          for (const pos of numberRange(range.from, range.to)) {
            markRange = getMarkRange(tr.doc.resolve(pos), this.type);

            if (markRange) {
              break;
            }
          }

          chain.removeLink(markRange ?? range).tr();

          // The mark range for the position after the matched text. If this
          // exists it should be removed to handle cleanup properly.
          let afterMarkRange: ReturnType<typeof getMarkRange> | undefined;

          for (const pos of numberRange(
            tr.selection.to,
            Math.min(tr.selection.$to.end(), tr.doc.nodeSize - 2),
          )) {
            afterMarkRange = getMarkRange(tr.doc.resolve(pos), this.type);

            if (afterMarkRange) {
              break;
            }
          }

          if (afterMarkRange) {
            chain.removeLink(afterMarkRange).tr();
          }

          preserveSelection(selection, tr);
          const match = findMatchAtPosition(
            tr.doc.resolve(Math.min(range.from + 1, tr.doc.nodeSize - 2)),
            this.name,
          );

          if (match) {
            chain
              .updateLink(
                { href: extractHref(match.text.full, this.options.defaultProtocol), auto: true },
                match.range,
              )
              .tr();
          } else {
            setMarkRemoved();
          }
        };

        // Respond when there is an exit.
        if (exitReason) {
          const isInvalid = isInvalidSplitReason(exitReason);
          const isRemoved = isRemovedReason(exitReason);

          if (isInvalid || isRemoved) {
            try {
              remove();
            } catch {
              // Errors here can be ignored since they can be caused by deleting
              // the whole document.
              return;
            }
          }

          return;
        }

        let value: ReturnType<typeof getMarkRange> | undefined;

        for (const pos of numberRange(range.from, range.to)) {
          value = getMarkRange(tr.doc.resolve(pos), this.type);

          if (value?.mark.attrs.auto === false) {
            return;
          }

          if (value) {
            break;
          }
        }

        /** Update the current range with the new link */
        const update = () => {
          chain.updateLink({ href, auto: true }, range).tr();
          preserveSelection(selection, tr);
        };

        // Update when there is a value
        if (!value) {
          update();

          return;
        }

        // Do nothing when the current mark is identical to the mark that would be created.
        if (
          value.from === range.from &&
          value.to === range.to &&
          value.mark.attrs.auto &&
          value.mark.attrs.href === href
        ) {
          return;
        }

        update();
      },
    };

    return [suggester];
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
      appendTransaction: (transactions, _oldState, state: EditorState) => {
        const transactionsWithLinkMeta = transactions.filter((tr) => !!tr.getMeta(this.name));

        if (transactionsWithLinkMeta.length === 0) {
          return;
        }

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
      },
    };
  }
}

/**
 * Extract the `href` from the provided text.
 */
function extractHref(url: string, defaultProtocol: DefaultProtocol) {
  return url.startsWith('http') || url.startsWith('//') ? url : `${defaultProtocol}//${url}`;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      link: LinkExtension;
    }
  }
}
