import {
  ApplySchemaAttributes,
  CommandFunction,
  ErrorConstant,
  extensionDecorator,
  ExtensionTag,
  Handler,
  invariant,
  isElementDomNode,
  isString,
  kebabCase,
  NodeAttributes,
  NodeExtension,
  NodeExtensionSpec,
  omitExtraAttributes,
  pick,
  replaceText,
  Static,
} from '@remirror/core';
import {
  DEFAULT_SUGGESTER,
  MatchValue,
  RangeWithCursor,
  SuggestChangeHandlerParameter,
  Suggester,
} from '@remirror/pm/suggest';

/**
 * Options available to the [[`MentionAtomExtension`]].
 */
export interface MentionAtomOptions
  extends Pick<
    Suggester,
    'invalidNodes' | 'validNodes' | 'invalidMarks' | 'validMarks' | 'isValidPosition'
  > {
  /**
   * When `true` the atom node which wraps the mention will be selectable.
   *
   * @default true
   */
  selectable?: Static<boolean>;

  /**
   * Whether mentions should be draggable.
   *
   * @default false
   */
  draggable?: Static<boolean>;

  /**
   * Provide a custom tag for the mention
   */
  mentionTag?: Static<string>;

  /**
   * Provide the custom matchers that will be used to match mention text in the
   * editor.
   */
  matchers: Static<MentionAtomExtensionMatcher[]>;

  /**
   * Text to append after the mention has been added.
   *
   * **NOTE**: If it seems that your editor is swallowing  up empty whitespace,
   * make sure you've imported the core css from the `@remirror/styles` library.
   *
   * @default ' '
   */
  appendText?: string;

  /**
   * Tag for the prosemirror decoration which wraps an active match.
   *
   * @default 'span'
   */
  suggestTag?: string;

  /**
   * When true, decorations are not created when this mention is being edited.
   */
  disableDecorations?: boolean;

  /**
   * Called whenever a suggestion becomes active or changes in any way.
   *
   * @remarks
   *
   * It receives a parameters object with the `reason` for the change for more
   * granular control.
   */
  onChange?: Handler<MentionAtomChangeHandler>;
}

/**
 * This is the node version of the already popular
 * `@remirror/extension-mention`. It provides mentions as atom nodes with many
 */
@extensionDecorator<MentionAtomOptions>({
  defaultOptions: {
    selectable: true,
    draggable: false,
    mentionTag: 'span' as const,
    matchers: [],
    appendText: ' ',
    suggestTag: 'span' as const,
    disableDecorations: false,
    invalidMarks: [],
    invalidNodes: [],
    isValidPosition: () => true,
    validMarks: null,
    validNodes: null,
  },
  handlerKeys: ['onChange'],
  staticKeys: ['matchers', 'mentionTag', 'selectable'],
})
export class MentionAtomExtension extends NodeExtension<MentionAtomOptions> {
  get name() {
    return 'mentionAtom' as const;
  }

  readonly tags = [ExtensionTag.InlineNode, ExtensionTag.Behavior];

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    const dataAttributeId = 'data-mention-atom-id';
    const dataAttributeName = 'data-mention-atom-name';

    return {
      attrs: {
        ...extra.defaults(),
        id: {},
        label: {},
        name: {},
      },
      inline: true,
      selectable: this.options.selectable,
      draggable: this.options.draggable,
      atom: true,

      parseDOM: [
        {
          tag: `${this.options.mentionTag}[${dataAttributeId}]`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const name = node.getAttribute(dataAttributeName);
            const label = node.textContent;
            return { ...extra.parse(node), id, label, name };
          },
        },
      ],
      toDOM: (node) => {
        const {
          appendText: _,
          replacementType: __,
          label,
          id,
          name,
          range,
          ...rest
        } = omitExtraAttributes(node.attrs, extra) as NamedMentionAtomNodeAttributes;
        const matcher = this.options.matchers.find((matcher) => matcher.name === name);

        const mentionClassName = matcher
          ? matcher.mentionClassName ?? DEFAULT_MATCHER.mentionClassName
          : DEFAULT_MATCHER.mentionClassName;

        const attrs = {
          ...extra.dom(node),
          ...rest,
          class: name
            ? `${mentionClassName} ${mentionClassName}-${kebabCase(name)}`
            : mentionClassName,
          [dataAttributeId]: id,
          [dataAttributeName]: name,
        };

        return [this.options.mentionTag, attrs, label];
      },
    };
  }

  createCommands() {
    return {
      /**
       * Creates a mention atom at the  the provided range.
       *
       * A variant of this method is provided to the `onChange` handler for this
       * extension.
       *
       * @param details - the range and name of the mention to be created.
       * @param attrs - the attributes that should be passed through. Required
       * values are `id` and `label`.
       */
      createMentionAtom: (
        details: CreateMentionAtom,
        attrs: MentionAtomNodeAttributes,
      ): CommandFunction => {
        const { name, range } = details;
        const validNameExists = this.options.matchers.some((matcher) => name === matcher.name);

        // Check that the name is valid.
        invariant(validNameExists, {
          code: ErrorConstant.EXTENSION,
          message: `Invalid name '${name}' provided when creating a mention. Please ensure you only use names that were configured on the matchers when creating the \`MentionAtomExtension\`.`,
        });

        const { appendText, ...rest } = attrs;

        return replaceText({
          type: this.type,
          appendText: getAppendText(appendText, this.options.appendText),
          attrs: { name, ...rest },
          range,
        });
      },
    };
  }

  createSuggesters(): Suggester[] {
    const options = pick(this.options, [
      'invalidMarks',
      'invalidNodes',
      'isValidPosition',
      'validMarks',
      'validNodes',
      'suggestTag',
      'disableDecorations',
      'appendText',
    ]);

    return this.options.matchers.map<Suggester>((matcher) => {
      return {
        ...DEFAULT_MATCHER,
        ...options,
        ...matcher,
        onChange: (parameter) => {
          const { name, range } = parameter;
          const { createMentionAtom } = this.store.commands;

          function command(attrs: Omit<MentionAtomNodeAttributes, 'name'>) {
            createMentionAtom({ name, range }, attrs);
          }

          this.options.onChange(parameter, command);
        },
      };
    });
  }
}

/**
 * The default matcher to use when none is provided in options
 */
const DEFAULT_MATCHER = {
  ...pick(DEFAULT_SUGGESTER, [
    'startOfLine',
    'supportedCharacters',
    'validPrefixCharacters',
    'invalidPrefixCharacters',
  ]),
  appendText: '',
  matchOffset: 1,
  suggestClassName: 'suggest-atom',
  mentionClassName: 'mention-atom',
};

export interface OptionalMentionAtomExtensionParameter {
  /**
   * The text to append to the replacement.
   *
   * @default ''
   */
  appendText?: string;

  /**
   * The type of replacement to use. By default the command will only replace text up the the cursor position.
   *
   * To force replacement of the whole match regardless of where in the match the cursor is placed set this to
   * `full`.
   *
   * @default 'full'
   */
  replacementType?: keyof MatchValue;
}

export interface CreateMentionAtom {
  /**
   * The name of the matcher used to create this mention.
   */
  name: string;

  /**
   * The range of the current selection
   */
  range: RangeWithCursor;
}

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export type MentionAtomNodeAttributes = NodeAttributes<
  OptionalMentionAtomExtensionParameter & {
    /**
     * A unique identifier for the suggesters node
     */
    id: string;

    /**
     * The text to be placed within the suggesters node
     */
    label: string;
  }
>;

export type NamedMentionAtomNodeAttributes = MentionAtomNodeAttributes & {
  /**
   * The name of the matcher used to create this mention.
   */
  name: string;
};

/**
 * This change handler is called whenever there is an update in the matching
 * suggester. The second parameter `command` is available to automatically
 * create the mention with the required attributes.
 */
export type MentionAtomChangeHandler = (
  handlerState: SuggestChangeHandlerParameter,
  command: (attrs: MentionAtomNodeAttributes) => void,
) => void;

/**
 * The options for the matchers which can be created by this extension.
 */
export interface MentionAtomExtensionMatcher
  extends Pick<
    Suggester,
    | 'char'
    | 'name'
    | 'startOfLine'
    | 'supportedCharacters'
    | 'validPrefixCharacters'
    | 'invalidPrefixCharacters'
    | 'suggestClassName'
  > {
  /**
   * See [[``Suggester.matchOffset`]] for more details.
   *
   * @default 1
   */
  matchOffset?: number;

  /**
   * Provide customs class names for the completed mention.
   */
  mentionClassName?: string;
}

/**
 * Get the append text value which needs to be handled carefully since it can
 * also be an empty string.
 */
function getAppendText(preferred: string | undefined, fallback: string | undefined) {
  if (isString(preferred)) {
    return preferred;
  }

  if (isString(fallback)) {
    return fallback;
  }

  return DEFAULT_MATCHER.appendText;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      mentionAtom: MentionAtomExtension;
    }
  }
}
