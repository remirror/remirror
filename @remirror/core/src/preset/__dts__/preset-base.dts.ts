import { ExtensionFactory } from '../../extension';
import { AnyPreset } from '../preset-base';
import { PresetFactory } from '../preset-factory';
import { RemirrorIdentifier } from '@remirror/core-constants';

// @ts-expect-error
const PresetNoName = PresetFactory.typed().preset({});

// @ts-expect-error
const PresetNoExtensions = PresetFactory.typed().preset({
  name: 'noExtensions',
});

// @ts-expect-error
const PresetMissingSettings = PresetFactory.typed<{ oops?: boolean }>().preset({
  name: 'missingSettings',
  createExtensions: () => [],
});

const ExtensionWithSettings = ExtensionFactory.typed<{ oops: boolean }>().plain({
  name: 'withSettings',
  defaultSettings: {},
});

const PresetExtensionWithSettings = PresetFactory.typed<{ me: 'friend' }>().preset({
  name: 'extensionWithSettings',
  defaultSettings: {
    me: 'friend',
  },
  createExtensions() {
    return [ExtensionWithSettings.of({ oops: true })];
  },
});

const anyPresetWithSettings: AnyPreset = PresetExtensionWithSettings.of({ me: 'friend' });
const temp1: RemirrorIdentifier.Preset = anyPresetWithSettings['~~remirror~~'];
// @ts-expect-error
const temp2: RemirrorIdentifier.Extension = anyPresetWithSettings['~~remirror~~'];
