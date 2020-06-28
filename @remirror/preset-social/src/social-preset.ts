import { Except } from 'type-fest';

import {
  AddCustomHandler,
  CustomHandlerKeyList,
  DefaultPresetOptions,
  HandlerKeyList,
  OnSetOptionsParameter,
  Preset,
  StaticKeyList,
} from '@remirror/core';
import { AutoLinkExtension, AutoLinkOptions } from '@remirror/extension-auto-link';
import { EmojiExtension, EmojiOptions } from '@remirror/extension-emoji';
import { MentionExtension, MentionOptions } from '@remirror/extension-mention';

export interface SocialOptions
  extends AutoLinkOptions,
    Except<EmojiOptions, 'onChange' | 'onExit' | 'keyBindings'>,
    MentionOptions {
  onChangeEmoji?: EmojiOptions['onChange'];
  onExitEmoji?: EmojiOptions['onExit'];
  keyBindingsEmoji?: EmojiOptions['keyBindings'];
}

export class SocialPreset extends Preset<SocialOptions> {
  static readonly staticKeys: StaticKeyList<SocialOptions> = ['matchers', 'mentionTag', 'urlRegex'];
  static readonly handlerKeys: HandlerKeyList<SocialOptions> = [
    'onChange',
    'onChangeEmoji',
    'onExit',
    'onExitEmoji',
    'onUrlUpdate',
  ];
  static readonly customHandlerKeys: CustomHandlerKeyList<SocialOptions> = [
    'keyBindings',
    'keyBindingsEmoji',
    'onCharacterEntry',
  ];

  static readonly defaultOptions: DefaultPresetOptions<SocialOptions> = {
    ...AutoLinkExtension.defaultOptions,
    ...MentionExtension.defaultOptions,
    ...EmojiExtension.defaultOptions,
  };

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
    const autoLinkExtension = new AutoLinkExtension({ defaultProtocol, urlRegex });
    autoLinkExtension.addHandler('onUrlUpdate', this.options.onUrlUpdate);

    const { defaultEmoji, maxResults, suggestionCharacter } = this.options;
    const emojiExtension = new EmojiExtension({ defaultEmoji, maxResults, suggestionCharacter });
    emojiExtension.addHandler('onChange', this.options.onChangeEmoji);
    emojiExtension.addHandler('onExit', this.options.onExitEmoji);

    const { matchers, appendText, mentionTag, noDecorations, suggestTag } = this.options;
    const mentionExtension = new MentionExtension({
      matchers,
      appendText,
      mentionTag,
      noDecorations,
      suggestTag,
    });
    mentionExtension.addHandler('onChange', this.options.onChange);
    mentionExtension.addHandler('onExit', this.options.onExit);

    return [autoLinkExtension, emojiExtension, mentionExtension];
  }
}
