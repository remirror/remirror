import {
  ApplySchemaAttributes,
  Cast,
  CreatePluginReturn,
  EditorState,
  EditorStateParameter,
  EditorView,
  extensionDecorator,
  ExtensionPriority,
  findMatches,
  FromToParameter,
  getMatchString,
  Handler,
  LEAF_NODE_REPLACING_CHARACTER,
  Mark,
  markEqualsType,
  MarkExtension,
  MarkExtensionSpec,
  markPasteRule,
  MarkType,
  MarkTypeParameter,
  Static,
  TransactionParameter,
} from '@remirror/core';
import { TextSelection } from '@remirror/pm/state';
import { ReplaceStep } from '@remirror/pm/transform';

/**
 * An auto complete auto decorated linker. This is more aggressive than the
 * `@remirror/extension-link` in that it wraps any url like string as a mark.
 *
 * It's inspired by the behavior of social sites like `twitter`.
 */
@extensionDecorator<AutoLinkOptions>({
  defaultOptions: {
    urlRegex: /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[\da-z]+([.-][\da-z]+)*\.[a-z]{2,5}(:\d{1,5})?(\/.*)?)/gi,
    defaultProtocol: '',
  },
  defaultPriority: ExtensionPriority.Low,
  handlerKeys: ['onUrlUpdate'],
  staticKeys: ['urlRegex'],
})
export class AutoLinkExtension extends MarkExtension<AutoLinkOptions> {
  get name() {
    return 'autoLink' as const;
  }

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: {
        ...extra.defaults(),
        href: {
          default: null,
        },
      },
      inclusive: false,
      spanning: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (node) => ({
            ...extra.parse(node),
            href: Cast<Element>(node).getAttribute('href'),
          }),
        },
      ],
      toDOM: (node) => {
        return [
          'a',
          {
            ...extra.dom(node),
            ...node.attrs,
            role: 'presentation',
          },
          0,
        ];
      },
    };
  }

  createPasteRules() {
    return [
      markPasteRule({
        regexp: this.options.urlRegex,
        type: this.type,
        getAttributes: (url) => {
          return {
            href: extractHref(getMatchString(url), this.options.defaultProtocol),
          };
        },
      }),
    ];
  }

  createPlugin(): CreatePluginReturn {
    return {
      state: {
        init: () => {
          return null;
        },
        apply: (tr, previous) => {
          const stored = tr.getMeta(this.pluginKey);
          return stored ? stored : tr.selectionSet || tr.docChanged ? null : previous;
        },
      },

      // Runs through the current line (and previous line if it exists) to reapply
      // social link marks to the relevant parts of text.
      // TODO extract this as a standalone prosemirror plugin
      appendTransaction: (transactions, _oldState, state: EditorState) => {
        // Used to represent leaf nodes as text otherwise they just get replaced
        const leafChar = ' ';
        const { selection, doc } = state;
        const { $from, $to, from, to } = selection;
        const hasReplaceTransactions = transactions.some(({ steps }) =>
          steps.some((step) => step instanceof ReplaceStep),
        );

        if (!hasReplaceTransactions) {
          return;
        }

        // Check that the mark should still be active
        const searchText =
          doc.textBetween($from.start(), from, LEAF_NODE_REPLACING_CHARACTER, leafChar) +
          doc.textBetween(to, $to.end(), LEAF_NODE_REPLACING_CHARACTER, leafChar);
        const tr = state.tr;
        const collectedParameters: AutoLinkHandlerProps[] = [];

        // If at the start of a new line (i.e. new block added and not at the start of the document)
        if (from === $from.start() && from >= 2) {
          const $pos = doc.resolve(from - 2);
          const previousSearchText = doc.textBetween(
            $pos.start(),
            $pos.end(),
            LEAF_NODE_REPLACING_CHARACTER,
            leafChar,
          );
          findMatches(previousSearchText, this.options.urlRegex).forEach((match) => {
            const startIndex = match.index;
            const url = match[1];
            const start = $pos.start() + startIndex;
            const end = $pos.start() + startIndex + match[0].length;

            collectedParameters.push({
              state,
              url,
              from: start,
              to: end,
              type: this.type,
              defaultProtocol: this.options.defaultProtocol,
            });
          });

          tr.removeMark($pos.start(), $pos.end(), this.type);
        }

        // Finds matches within the current node when in the middle of a node
        findMatches(searchText, this.options.urlRegex).forEach((match) => {
          const startIndex = match.index;
          const url = match[1];
          const start = $from.start() + startIndex;
          const end = $from.start() + startIndex + match[0].length;
          // The text directly before the match
          const textBefore = doc.textBetween(
            start - 1,
            start,
            LEAF_NODE_REPLACING_CHARACTER,
            leafChar,
          );

          if (!/\w/.test(textBefore)) {
            collectedParameters.push({
              state,
              url,
              from: start,
              to: end,
              type: this.type,
              defaultProtocol: this.options.defaultProtocol,
            });
          }
        });

        // Remove all marks within the current block
        tr.removeMark($from.start(), $from.end(), this.type);

        // Add all marks again for the nodes
        for (const collected of collectedParameters) {
          autoLinkHandler({ ...collected, tr });
        }

        return tr;
      },
      view: () => ({
        update: (view: EditorView, previousState: EditorState) => {
          const next = getUrlsFromState(view.state, this.type);
          const previous = getUrlsFromState(previousState, this.type);

          if (!areSetsEqual(next.set, previous.set)) {
            this.options.onUrlUpdate(next);
          }
        },
      }),
    };
  }
}

export interface UrlUpdateHandlerParameter {
  set: Set<string>;
  urls: string[];
}

/**
 * Can be an empty string which sets url's to '//google.com'.
 */
export type DefaultProtocol = 'http:' | 'https:' | '';

export interface AutoLinkOptions {
  /**
   * The regex matcher for matching against the RegExp. The matcher must capture
   * the URL part of the string as it's first match. Take a look at the default
   * value.
   *
   * @default
   * /((http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[\da-z]+([.-][\da-z]+)*\.[a-z]{2,5}(:\d{1,5})?(\/.*)?)/gi
   */
  urlRegex?: Static<RegExp>;

  /**
   * This handler is called every time the matched urls are updated.
   *
   * @default ''
   */
  onUrlUpdate?: Handler<(parameter: UrlUpdateHandlerParameter) => void>;

  /**
   * The default protocol to use when it can't be inferred
   */
  defaultProtocol?: DefaultProtocol;
}

function extractHref(url: string, defaultProtocol: DefaultProtocol) {
  return url.startsWith('http') || url.startsWith('//') ? url : `${defaultProtocol}//${url}`;
}

interface AutoLinkHandlerProps
  extends EditorStateParameter,
    FromToParameter,
    Partial<TransactionParameter>,
    MarkTypeParameter {
  /**
   * The url to add as a mark to the range provided.
   */
  url: string;

  defaultProtocol: DefaultProtocol;
}

/**
 * Add the provided URL as a mark to the text range provided
 */
function autoLinkHandler(parameter: AutoLinkHandlerProps) {
  const { state, url, from, to, type, defaultProtocol } = parameter;
  const endPosition = state.selection.to;
  const autoLink = type.create({ href: extractHref(url, defaultProtocol) });
  const tr = (parameter.tr ?? state.tr).replaceWith(from, to, state.schema.text(url, [autoLink]));

  // Ensure that the selection doesn't jump when the the current selection is within the range
  if (endPosition < to) {
    return tr.setSelection(TextSelection.create(tr.doc, endPosition));
  }

  return tr;
}

/**
 * Retrieves all the automatically applied URLs from the state.
 */
function getUrlsFromState(state: EditorState, type: MarkType) {
  const $pos = state.doc.resolve(0);
  const marks: Mark[] = [];

  state.doc.nodesBetween($pos.start(), $pos.end(), (node) => {
    marks.push(...node.marks);
  });

  const urls: string[] = [];

  for (const mark of marks) {
    if (markEqualsType({ mark, types: type })) {
      urls.push(mark.attrs.href);
    }
  }

  return { set: new Set(urls), urls };
}

/**
 * Checks whether two sets are equal.
 */
function areSetsEqual<Type>(setOne: Set<Type>, setTwo: Set<Type>) {
  if (setOne.size !== setTwo.size) {
    return false;
  }

  for (const value of setOne) {
    if (!setTwo.has(value)) {
      return false;
    }
  }

  return true;
}
