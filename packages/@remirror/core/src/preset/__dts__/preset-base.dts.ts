import { __INTERNAL_REMIRROR_IDENTIFIER_KEY__, RemirrorIdentifier } from '@remirror/core-constants';
import { Dynamic, Static } from '@remirror/core-types';
import { ignoreUnused } from '@remirror/testing';

import { RemirrorManager } from '../..';
import { PlainExtension } from '../../extension';
import { OnSetOptionsParameter } from '../../types';
import { AnyPreset, DefaultPresetOptions, Preset } from '../preset-base';

// @ts-expect-error
class PresetNoName extends Preset {}

// @ts-expect-error
class NoExtensionPreset extends Preset {
  get name() {
    return 'noExtensions' as const;
  }

  protected onSetOptions(): void {
    return;
  }
}

class MissingStaticOptionsPreset extends Preset<{ oops?: boolean }> {
  get name() {
    return 'missingStaticOptions' as const;
  }

  protected onSetOptions(): void {
    return;
  }

  createExtensions() {
    return [];
  }
}

const manager = RemirrorManager.fromObject({
  extensions: [],
  presets: [new MissingStaticOptionsPreset()],
});
const a = manager.getPreset(MissingStaticOptionsPreset);

class ExtensionWithStaticOptions extends PlainExtension<{ oops: Static<boolean> }> {
  get name() {
    return 'withStaticOptions' as const;
  }
}

interface WithStaticOptions {
  me: Static<'friend' | 'enemy'>;
}

class WithStaticOptionsPreset extends Preset<WithStaticOptions> {
  static readonly defaultOptions: DefaultPresetOptions<WithStaticOptions> = { me: 'friend' };

  get name() {
    return 'withStaticOptions' as const;
  }

  createExtensions() {
    return [new ExtensionWithStaticOptions({ oops: false })];
  }

  protected onSetOptions() {
    throw new Error('Method not implemented.');
  }
}

// @ts-expect-error
new WithStaticOptionsPreset();
// @ts-expect-error
new WithStaticOptionsPreset({});

const extensionArray: Array<WithStaticOptionsPreset['~E']> = [
  new ExtensionWithStaticOptions({ oops: false }),
];

const anyPresetWithStaticOptions: AnyPreset = new WithStaticOptionsPreset({ me: 'friend' });
const temp1: RemirrorIdentifier.Preset =
  anyPresetWithStaticOptions[__INTERNAL_REMIRROR_IDENTIFIER_KEY__];
// @ts-expect-error
const temp2: RemirrorIdentifier.PlainExtension =
  anyPresetWithStaticOptions[__INTERNAL_REMIRROR_IDENTIFIER_KEY__];

interface WithDynamicOptions {
  me?: Static<string>;
  required: boolean;
  custom: Dynamic<string>;
}

class WithDynamicOptionsPreset extends Preset<WithDynamicOptions> {
  static readonly defaultOptions: DefaultPresetOptions<WithDynamicOptions> = {
    required: true,
    custom: '',
    me: '',
  };

  get name() {
    return 'withStaticOptions' as const;
  }

  protected onSetOptions(parameter: OnSetOptionsParameter<WithDynamicOptions>): void {
    const { changes } = parameter;
    const keys: Array<keyof typeof changes> = ['custom', 'required'];

    // @ts-expect-error
    ignoreUnused(changes.required.value);

    if (changes.required.changed) {
      const extension = this.getExtension(ExtensionWithStaticOptions);
      ignoreUnused(changes.required.value);
      ignoreUnused(changes.required.previousValue);
    }
  }

  createExtensions() {
    return [new ExtensionWithStaticOptions({ oops: false })];
  }
}

new WithDynamicOptionsPreset();
new WithDynamicOptionsPreset({ required: false, custom: '' });
