import { Except } from 'type-fest';

import {
  AddCustomHandler,
  ExtensionPriority,
  OnSetOptionsParameter,
  Preset,
  presetDecorator,
  Static,
} from '@remirror/core';
import { AutoLinkExtension, AutoLinkOptions } from '@remirror/extension-auto-link';
import { EmojiExtension, EmojiOptions } from '@remirror/extension-emoji';
import {
  MentionExtension,
  MentionExtensionMatcher,
  MentionOptions,
} from '@remirror/extension-mention';

export interface SocialOptions
  extends AutoLinkOptions,
    Except<EmojiOptions, 'onChange' | 'onExit' | 'keyBindings'>,
    Partial<MentionOptions> {
  onChangeEmoji?: EmojiOptions['onChange'];
  onExitEmoji?: EmojiOptions['onExit'];
  keyBindingsEmoji?: EmojiOptions['keyBindings'];

  /**
   * The matcher options for the `@` mention character.
   */
  atMatcherOptions?: Static<Except<MentionExtensionMatcher, 'name' | 'char'>>;

  /**
   * The matcher options for the `#` mention character/
   */
  tagMatcherOptions?: Static<Except<MentionExtensionMatcher, 'name' | 'char'>>;
}

@presetDecorator<SocialOptions>({
  defaultOptions: {
    ...AutoLinkExtension.defaultOptions,
    ...MentionExtension.defaultOptions,
    ...EmojiExtension.defaultOptions,
    matchers: [],
    atMatcherOptions: {},
    tagMatcherOptions: {},
  },
  customHandlerKeys: ['keyBindings', 'keyBindingsEmoji', 'onCharacterEntry'],
  handlerKeys: ['onChange', 'onChangeEmoji', 'onUrlUpdate', 'onExitEmoji', 'onExit'],
  staticKeys: ['matchers', 'mentionTag', 'urlRegex', 'atMatcherOptions', 'tagMatcherOptions'],
})
export class SocialPreset extends Preset<SocialOptions> {
  get name() {
    return 'social' as const;
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<SocialOptions>) {
    const { pickChanged } = parameter;

    this.getExtension(MentionExtension).setOptions(
      pickChanged(['suggestTag', 'appendText', 'noDecorations']),
    );
    this.getExtension(EmojiExtension).setOptions(pickChanged(['defaultEmoji', 'maxResults']));
    this.getExtension(AutoLinkExtension).setOptions(pickChanged(['defaultProtocol']));
  }

  onAddCustomHandler: AddCustomHandler<SocialOptions> = (parameter) => {
    if (parameter.keyBindings) {
      return this.getExtension(MentionExtension).addCustomHandler(
        'keyBindings',
        parameter.keyBindings,
      );
    }

    if (parameter.onCharacterEntry) {
      return this.getExtension(MentionExtension).addCustomHandler(
        'onCharacterEntry',
        parameter.onCharacterEntry,
      );
    }

    if (parameter.keyBindingsEmoji) {
      return this.getExtension(EmojiExtension).addCustomHandler(
        'keyBindings',
        parameter.keyBindingsEmoji,
      );
    }

    return;
  };

  createExtensions() {
    const { defaultProtocol, urlRegex } = this.options;
    const autoLinkExtension = new AutoLinkExtension({
      defaultProtocol,
      urlRegex,
      priority: ExtensionPriority.Lowest,
    });
    autoLinkExtension.addHandler('onUrlUpdate', this.options.onUrlUpdate);

    const { defaultEmoji, maxResults, suggestionCharacter } = this.options;
    const emojiExtension = new EmojiExtension({
      defaultEmoji,
      maxResults,
      suggestionCharacter,
      extraAttributes: { role: { default: 'presentation' } },
    });
    emojiExtension.addHandler('onChange', this.options.onChangeEmoji);
    emojiExtension.addHandler('onExit', this.options.onExitEmoji);

    const {
      matchers,
      appendText,
      mentionTag,
      noDecorations,
      suggestTag,
      atMatcherOptions,
      tagMatcherOptions,
    } = this.options;
    const mentionExtension = new MentionExtension({
      matchers: [
        ...matchers,
        { name: 'at', char: '@', appendText: ' ', ...atMatcherOptions },
        { name: 'tag', char: '#', appendText: ' ', ...tagMatcherOptions },
      ],
      appendText,
      mentionTag,
      noDecorations,
      suggestTag,
      extraAttributes: {
        href: { default: null },
        role: 'presentation',
      },
    });
    mentionExtension.addHandler('onChange', this.options.onChange);
    mentionExtension.addHandler('onExit', this.options.onExit);

    return [emojiExtension, mentionExtension, autoLinkExtension];
  }
}
