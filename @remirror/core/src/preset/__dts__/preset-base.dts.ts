import { RemirrorIdentifier } from '@remirror/core-constants';
import { ignoreUnused } from '@remirror/test-fixtures';

import { PlainExtension } from '../../extension';
import { AnyPreset, Preset, SetPropertiesParameter } from '../preset-base';

// @ts-expect-error
class PresetNoName extends Preset {}

// @ts-expect-error
class NoExtensionPreset extends Preset {
  get name() {
    return 'noExtensions' as const;
  }

  protected onSetProperties(): void {
    return;
  }
}

class MissingSettingsPreset extends Preset<{ oops?: boolean }> {
  get name() {
    return 'missingSettings' as const;
  }

  protected onSetProperties(): void {
    return;
  }

  public createExtensions() {
    return [];
  }
}

class ExtensionWithSettings extends PlainExtension<{ oops: boolean }> {
  get name() {
    return 'withSettings' as const;
  }
}

class WithSettingsPreset extends Preset<{ me: 'friend' | 'enemy' }> {
  public static readonly defaultSettings = { me: 'friend' };

  get name() {
    return 'withSettings' as const;
  }

  public createExtensions() {
    return [new ExtensionWithSettings({ oops: false })];
  }

  protected onSetProperties() {
    throw new Error('Method not implemented.');
  }
}

// @ts-expect-error
new WithSettingsPreset();
// @ts-expect-error
new WithSettingsPreset({});

const extensionArray: Array<WithSettingsPreset['~E']> = [
  new ExtensionWithSettings({ oops: false }),
];

const anyPresetWithSettings: AnyPreset = new WithSettingsPreset({ me: 'friend' });
const temp1: RemirrorIdentifier.Preset = anyPresetWithSettings['~~remirror~~'];
// @ts-expect-error
const temp2: RemirrorIdentifier.Extension = anyPresetWithSettings['~~remirror~~'];

class WithPropertiesPreset extends Preset<{ me?: string }, { required: boolean }> {
  public static readonly defaultSettings = { required: true };
  public static readonly defaultProperties = { me: 'friend' };

  get name() {
    return 'withSettings' as const;
  }

  protected onSetProperties(parameter: SetPropertiesParameter<{ required: boolean }>): void {
    const { changes } = parameter;

    // @ts-expect-error
    ignoreUnused(changes.required.value);

    if (changes.required.changed) {
      const extension = this.getExtension(ExtensionWithSettings);
      ignoreUnused(changes.required.value);
      ignoreUnused(changes.required.previousValue);
    }
  }

  public createExtensions() {
    return [new ExtensionWithSettings({ oops: false })];
  }
}

new WithPropertiesPreset();
new WithPropertiesPreset({ properties: { required: false } });
