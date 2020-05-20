import {
  convertCommand,
  ErrorConstant,
  ExtensionFactory,
  getMarkRange,
  getMatchString,
  invariant,
  isElementDOMNode,
  isMarkActive,
  MarkGroup,
  markPasteRule,
  noop,
  object,
  ProsemirrorAttributes,
  RangeParameter,
  removeMark,
  replaceText,
  TransactionTransformer,
} from '@remirror/core';
import {
  escapeChar,
  getRegexPrefix,
  isInvalidSplitReason,
  isRemovedReason,
  isSplitReason,
  regexToString,
  Suggestion,
} from '@remirror/pm/suggest';

import {
  MentionExtensionAttributes,
  MentionExtensionProperties,
  MentionExtensionSettings,
  MentionExtensionSuggestCommand,
  SuggestionCommandAttributes,
} from './mention-types';
import {
  DEFAULT_MATCHER,
  getAppendText,
  getMatcher,
  isValidMentionAttributes,
} from './mention-utils';

const defaultHandler = () => false;

/**
 * The mention extension manages suggesters through onChange, onKeyDown, onExit and onEnter callbacks.
 * It also allows for configuration options to be passed into transforming suggestion queries into a mention
 * node.
 */
export const MentionExtension = ExtensionFactory.typed<
  MentionExtensionSettings,
  MentionExtensionProperties
>().mark({
  name: 'mention',
  extensionTags: [],
  defaultSettings: {
    mentionTag: 'a' as 'a',
    matchers: [],
  },
  defaultProperties: {
    appendText: ' ',
    suggestTag: 'a' as 'a',
    onChange: defaultHandler,
    onExit: defaultHandler,
    onCharacterEntry: defaultHandler,
    keyBindings: {},
    noDecorations: false,
  },
  createMarkSpec(parameter) {
    const { settings } = parameter;

    const dataAttributeId = 'data-mention-id';
    const dataAttributeName = 'data-mention-name';

    return {
      attrs: {
        id: {},
        label: {},
        name: {},
      },
      group: MarkGroup.Behavior,
      excludes: '_',
      inclusive: false,
      parseDOM: [
        {
          tag: `${settings.mentionTag}[${dataAttributeId}]`,
          getAttrs: (node) => {
            if (!isElementDOMNode(node)) {
              return false;
            }

            const id = node.getAttribute(dataAttributeId);
            const name = node.getAttribute(dataAttributeName);
            const label = node.textContent;
            return { id, label, name };
          },
        },
      ],
      toDOM: (node) => {
        const {
          label: _,
          id,
          name,
          replacementType,
          range,
          ...attributes
        } = node.attrs as Required<MentionExtensionAttributes>;
        const matcher = settings.matchers.find((matcher) => matcher.name === name);

        const mentionClassName = matcher
          ? matcher.mentionClassName ?? DEFAULT_MATCHER.mentionClassName
          : DEFAULT_MATCHER.mentionClassName;

        return [
          settings.mentionTag,
          {
            ...attributes,
            class: name ? `${mentionClassName} ${mentionClassName}-${name}` : mentionClassName,
            [dataAttributeId]: id,
            [dataAttributeName]: name,
          },
          0,
        ];
      },
    };
  },

  createCommands(parameter) {
    const { type, getState, extension } = parameter;

    const createMention = ({ shouldUpdate }: { shouldUpdate: boolean }) => (
      config?: ProsemirrorAttributes,
    ) => {
      invariant(isValidMentionAttributes(config), {
        message: 'Invalid configuration attributes passed to the MentionExtension command.',
      });

      const { range, appendText, replacementType, ...attributes } = config;
      let name = attributes.name;

      if (!name) {
        invariant(extension.settings.matchers.length < 2, {
          code: ErrorConstant.EXTENSION,
          message:
            'The MentionExtension command must specify a name since there are multiple matchers configured',
        });

        name = extension.settings.matchers[0].name;
      }

      const allowedNames = extension.settings.matchers.map(({ name }) => name);

      if (!allowedNames.includes(name)) {
        throw new Error(
          `The name '${name}' specified for this command is invalid. Please choose from: ${JSON.stringify(
            allowedNames,
          )}.`,
        );
      }

      const matcher = getMatcher(name, extension.settings.matchers);

      if (!matcher) {
        throw new Error(`Mentions matcher not found for name ${name}.`);
      }

      const { from, to } = range ?? getState().selection;
      let startTransaction: TransactionTransformer | undefined;

      if (shouldUpdate) {
        // Remove all currently active marks before proceeding.
        startTransaction = (tr, state) => {
          // Remove mark at previous position
          let { oldFrom, oldTo } = { oldFrom: from, oldTo: range ? range.end : to };
          const $oldTo = state.doc.resolve(oldTo);

          ({ from: oldFrom, to: oldTo } = getMarkRange($oldTo, type) || {
            from: oldFrom,
            to: oldTo,
          });

          tr.removeMark(oldFrom, oldTo, type);
          tr.setMeta('addToHistory', false);

          // Remove mark at current position
          const $newTo = tr.selection.$from;
          const { from: newFrom, to: newTo } = getMarkRange($newTo, type) || {
            from: $newTo.pos,
            to: $newTo.pos,
          };

          tr.removeMark(newFrom, newTo, type);

          return tr.setMeta('addToHistory', false);
        };
      }

      return convertCommand(
        replaceText({
          type,
          attrs: { ...attributes, name },
          appendText: getAppendText(appendText, matcher.appendText),
          range: range
            ? { from, to: replacementType === 'full' ? range.end || to : to }
            : undefined,
          content: attributes.label,
          startTransaction,
        }),
      );
    };

    return {
      createMention: createMention({ shouldUpdate: false }),
      updateMention: createMention({ shouldUpdate: true }),
      removeMention: ({ range }: Partial<RangeParameter> = object()) => {
        return convertCommand(removeMark({ type, expand: true, range }));
      },
    };
  },

  createPasteRules(parameter) {
    const { type, extension } = parameter;

    return extension.settings.matchers.map((matcher) => {
      const { startOfLine, char, supportedCharacters, name } = {
        ...DEFAULT_MATCHER,
        ...matcher,
      };
      const regexp = new RegExp(
        `(${getRegexPrefix(startOfLine)}${escapeChar(char)}${regexToString(supportedCharacters)})`,
        'g',
      );

      return markPasteRule({
        regexp,
        type,
        getAttributes: (string) => ({
          id: getMatchString(string.slice(char.length, string.length)),
          label: getMatchString(string),
          name,
        }),
      });
    });
  },

  createSuggestions(parameter) {
    const { getCommands: commands, type, getState, extension } = parameter;

    return extension.settings.matchers.map<Suggestion<MentionExtensionSuggestCommand>>(
      (matcher) => {
        return {
          ...DEFAULT_MATCHER,
          ...matcher,

          // The following properties are wrapped in getters so that they always
          // use the latest version of the suggestion.
          get noDecorations() {
            return extension.properties.noDecorations;
          },

          get suggestTag() {
            return extension.properties.suggestTag;
          },

          get onChange() {
            return extension.properties.onChange;
          },

          get onExit() {
            return extension.properties.onExit;
          },

          get keyBindings() {
            return extension.properties.keyBindings;
          },

          get onCharacterEntry() {
            return extension.properties.onCharacterEntry;
          },

          createCommand: ({ match, reason, setMarkRemoved }) => {
            const { range, suggester } = match;
            const { name } = suggester;
            const create = commands().createMention;
            const update = commands().updateMention;
            const remove = commands().removeMention;
            const isActive = isMarkActive({
              from: range.from,
              to: range.end,
              type: type,

              stateOrTransaction: getState(),
            });

            const fn = isActive ? update : create;
            const isSplit = isSplitReason(reason);
            const isInvalid = isInvalidSplitReason(reason);
            const isRemoved = isRemovedReason(reason);

            const removeCommand = () => {
              setMarkRemoved();
              try {
                // This might fail when a deletion has taken place.
                isInvalid ? remove({ range }) : noop();
              } catch {
                // This sometimes fails and it's best to ignore until more is
                // known about the impact.
              }
            };

            const createCommand = ({
              replacementType = isSplit ? 'partial' : 'full',
              id = match.queryText[replacementType],
              label = match.matchText[replacementType],
              appendText,
              ...attributes
            }: SuggestionCommandAttributes) => {
              fn({ id, label, appendText, replacementType, name, range, ...attributes });
            };

            const command: MentionExtensionSuggestCommand =
              isInvalid || isRemoved ? removeCommand : createCommand;

            return command;
          },
        };
      },
    );
  },
});
