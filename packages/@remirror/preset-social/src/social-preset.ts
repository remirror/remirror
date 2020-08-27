import type { Except } from 'type-fest';

import {
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
    Except<EmojiOptions, 'onChange'>,
    Partial<MentionOptions> {
  onChangeEmoji?: EmojiOptions['onChange'];

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
  handlerKeys: ['onChange', 'onChangeEmoji', 'onUrlUpdate'],
  staticKeys: ['matchers', 'mentionTag', 'urlRegex', 'atMatcherOptions', 'tagMatcherOptions'],
})
export class SocialPreset extends Preset<SocialOptions> {
  get name() {
    return 'social' as const;
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<SocialOptions>): void {
    const { pickChanged } = parameter;

    this.getExtension(MentionExtension).setOptions(
      pickChanged(['suggestTag', 'appendText', 'disableDecorations']),
    );
    this.getExtension(EmojiExtension).setOptions(pickChanged(['defaultEmoji', 'maxResults']));
    this.getExtension(AutoLinkExtension).setOptions(pickChanged(['defaultProtocol']));
  }

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

    const {
      matchers,
      appendText,
      mentionTag,
      disableDecorations: noDecorations,
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
      disableDecorations: noDecorations,
      suggestTag,
      extraAttributes: {
        href: { default: null },
        role: 'presentation',
      },
    });
    mentionExtension.addHandler('onChange', this.options.onChange);

    return [emojiExtension, mentionExtension, autoLinkExtension];
  }
}
