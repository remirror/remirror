import EMOJI_REGEX from 'emojibase-regex/emoji';
import EMOTICON_REGEX from 'emojibase-regex/emoticon';
import SHORTCODE_REGEX from 'emojibase-regex/shortcode';
import escapeStringRegex from 'escape-string-regexp';
import { Moji, SpriteCollection } from 'svgmoji';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  extension,
  ExtensionTag,
  GetAttributes,
  getTextSelection,
  InputRule,
  isElementDomNode,
  isString,
  NodeExtension,
  NodeExtensionSpec,
  nodeInputRule,
  NodeSpecOverride,
  omitExtraAttributes,
  plainInputRule,
  PrimitiveSelection,
  ShouldSkipFunction,
} from '@remirror/core';
import type { Suggester } from '@remirror/pm/suggest';
import { ExtensionEmojiTheme } from '@remirror/theme';

import {
  AddEmojiCommandOptions,
  DefaultMoji,
  EMOJI_DATA_ATTRIBUTE,
  EmojiAttributes,
  EmojiOptions,
} from './emoji-utils';

@extension<EmojiOptions>({
  defaultOptions: {
    plainText: false,
    data: [],
    identifier: 'emoji',
    fallback: ':red_question_mark:',
    moji: 'noto',
    suggestionCharacter: ':',
  },
  staticKeys: ['plainText'],
  handlerKeys: ['suggestEmoji'],
})
export class EmojiExtension extends NodeExtension<EmojiOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  private _moji?: Moji;

  get moji(): Moji {
    return (this._moji ??= isString(this.options.moji)
      ? new DefaultMoji[this.options.moji]({
          data: this.options.data,
          type: SpriteCollection.All,
          fallback: this.options.fallback,
        })
      : this.options.moji);
  }

  createTags() {
    return [ExtensionTag.InlineNode];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      selectable: true,
      draggable: false,
      ...override,
      inline: true,

      atom: true,
      attrs: { ...extra.defaults(), code: {} },
      parseDOM: [
        {
          tag: `span[${EMOJI_DATA_ATTRIBUTE}`,
          getAttrs: (node) => {
            if (!isElementDomNode(node)) {
              return;
            }

            const code = node.getAttribute(EMOJI_DATA_ATTRIBUTE);
            return { ...extra.parse(node), code };
          },
        },
        ...(override.parseDOM ?? []),
      ],

      toDOM: (node) => {
        const { code } = omitExtraAttributes(node.attrs, extra) as EmojiAttributes;
        const emoji = this.moji.find(code) ?? this.moji.fallback;

        return [
          'span',
          {
            class: ExtensionEmojiTheme.EMOJI_WRAPPER,
            [EMOJI_DATA_ATTRIBUTE]: emoji[this.options.identifier],
          },
          [
            'img',
            {
              role: 'presentation',
              class: ExtensionEmojiTheme.EMOJI_IMAGE,
              'aria-label': emoji.annotation,
              alt: emoji.annotation,
              // TODO use the emoji rather than the code once `svgmoji` supports it.
              src: this.moji.url(code),
            },
          ],
          // ['span', { style: 'display: inline-block; text-indent: -99999px' }, emoji.emoji],
        ];
      },
    };
  }

  /**
   * Manage input rules for emoticons.
   */
  createInputRules(): InputRule[] {
    // Use plain text when this option is set.
    if (this.options.plainText) {
      return [
        // Replace emoticons
        plainInputRule({
          regexp: new RegExp(`(${EMOTICON_REGEX.source})[\\s]$`),
          transformMatch: ([full, partial]) => {
            if (!full || !partial) {
              return null;
            }

            const emoji = this.moji.find(partial);
            return emoji ? full.replace(partial, emoji.emoji) : null;
          },
        }),

        // Replace matching shortcodes
        plainInputRule({
          regexp: new RegExp(`(${SHORTCODE_REGEX.source})$`),
          transformMatch: ([, match]) => {
            if (!match) {
              return null;
            }

            const emoji = this.moji.find(match);
            return emoji ? emoji.emoji : null;
          },
        }),
      ];
    }

    // Return true when the input rule should be skipped.
    const shouldSkip: ShouldSkipFunction = ({ captureGroup }) => {
      // eslint-disable-next-line unicorn/prefer-array-some
      return !captureGroup || !this.moji.find(captureGroup);
    };

    // Capture the attributes for the emoji
    const getAttributes: GetAttributes = ([, match]) => {
      if (!match) {
        return;
      }

      const emoji = this.moji.find(match);

      return emoji ? { code: emoji[this.options.identifier] } : undefined;
    };

    // The current emoji node type.
    const type = this.type;

    return [
      // Replace emoticons
      nodeInputRule({
        type,
        shouldSkip,
        getAttributes,
        regexp: new RegExp(`(${EMOTICON_REGEX.source})[\\s]$`),
        beforeDispatch: ({ tr }) => {
          tr.insertText(' ');
        },
      }),

      // Replace matching shortcodes
      nodeInputRule({
        type,
        shouldSkip,
        getAttributes,
        regexp: new RegExp(`(${SHORTCODE_REGEX.source})$`),
      }),

      // Replace matching shortcodes
      nodeInputRule({
        type,
        shouldSkip,
        getAttributes,
        regexp: new RegExp(`(${EMOJI_REGEX.source})`),
      }),
    ];
  }

  /**
   * Insert an emoji into the document at the requested location by name
   *
   * The range is optional and if not specified the emoji will be inserted
   * at the current selection.
   *
   * @param identifier - the hexcode | unicode | shortcode | emoticon of the emoji to insert.
   * @param [options] - the options when inserting the emoji.
   */
  @command()
  addEmoji(identifier: string, options: AddEmojiCommandOptions = {}): CommandFunction {
    return (props) => {
      const { dispatch, tr } = props;
      const emoji = this.moji.find(identifier);

      if (!emoji) {
        // Nothing to do here since no emoji found.
        return false;
      }

      if (!this.options.plainText) {
        return this.store.commands.replaceText.original({
          type: this.type,
          attrs: { code: emoji[this.options.identifier] },
          selection: options.selection,
        })(props);
      }

      const { from, to } = getTextSelection(options.selection ?? tr.selection, tr.doc);

      dispatch?.(tr.insertText(emoji.emoji, from, to));

      return true;
    };
  }

  /**
   * Inserts the suggestion character into the current position in the
   * editor in order to activate the suggestion popup.
   */
  @command()
  suggestEmoji(selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const text = this.store.helpers.getTextBetween(from - 1, to, tr.doc);

      if (text.includes(this.options.suggestionCharacter)) {
        return false;
      }

      dispatch?.(tr.insertText(this.options.suggestionCharacter, from, to));

      return true;
    };
  }

  /**
   * Emojis can be selected via `:` the colon key (by default). This sets the
   * configuration using `prosemirror-suggest`
   */
  createSuggesters(): Suggester {
    return {
      disableDecorations: true,
      invalidPrefixCharacters: `${escapeStringRegex(this.options.suggestionCharacter)}|\\w`,
      char: this.options.suggestionCharacter,
      name: this.name,
      suggestTag: 'span',
      onChange: (props) => {
        // When the change handler is called call the extension handler
        // `suggestEmoji` with props that can be used to trigger the emoji.
        this.options.suggestEmoji({
          moji: this.moji,
          query: props.query.full,
          text: props.text.full,
          range: props.range,
          exit: !!props.exitReason,
          change: !!props.changeReason,
          apply: (code: string) => {
            this.store.commands.addEmoji(code, { selection: props.range });
          },
        });
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      emoji: EmojiExtension;
    }
  }
}
