import { createTypedExtension, createTypedPreset } from '../..';

interface FirstSettings {
  a?: number;
}

interface SecondSettings {
  b: string;
}

interface Settings extends FirstSettings, SecondSettings {}

interface FirstProperties {
  y: number;
}

interface SecondProperties {
  z: string;
}

interface Properties extends FirstProperties, SecondProperties {}

const FirstExtension = createTypedExtension<FirstSettings, FirstProperties>().plain({
  name: 'first',
  defaultSettings: { a: 0 },
  defaultProperties: { y: 100 },
});

const SecondExtension = createTypedExtension<SecondSettings, SecondProperties>().plain({
  name: 'second',
  defaultSettings: { b: 'setting b' },
  defaultProperties: { z: 'property z' },
});

describe('simplest preset', () => {
  const TestPreset = createTypedPreset<Partial<Settings>, Properties>().preset({
    defaultSettings: {
      a: FirstExtension.defaultSettings.a,
      b: SecondExtension.defaultSettings.b ?? 'none specified',
    },
    defaultProperties: { y: FirstExtension.defaultProperties.y, z: 'override property z' },
    name: 'test',
    createExtensions(parameter) {
      const { settings } = parameter;

      return [FirstExtension.of(), SecondExtension.of({ b: settings.b })];
    },
    onSetProperties(parameter) {
      const { changes, getExtension } = parameter;

      if (changes.y.changed) {
        const firstExtension = getExtension(FirstExtension);
        firstExtension.setProperties({ y: changes.y.value });
      }

      if (changes.z.changed) {
        const secondExtension = getExtension(SecondExtension);
        secondExtension.setProperties({ z: changes.z.value });
      }
    },
  });

  const testPreset = TestPreset.of();
  const extensionNames = testPreset.extensions.map((extension) => extension.name);
  const firstExtension = testPreset.getExtension(FirstExtension);
  const secondExtension = testPreset.getExtension(SecondExtension);

  it('creates a preset with no settings', () => {
    expect(extensionNames).toEqual(['first', 'second']);
    expect(firstExtension?.settings.a).toBe(0);
    expect(secondExtension?.settings.b).toBe(SecondExtension.defaultSettings.b);
    expect(firstExtension.properties.y).toBe(FirstExtension.defaultProperties.y);
    expect(secondExtension.properties.z).toBe(SecondExtension.defaultProperties.z);
  });

  it('responds to property updates when properly wired', () => {
    testPreset.setProperties({ y: 1234, z: 'a whole new world' });

    expect(firstExtension.properties.y).toBe(1234);
    expect(secondExtension.properties.z).toBe('a whole new world');
  });

  it('can reset properties', () => {
    testPreset.resetProperties();

    expect(firstExtension.properties).toEqual(FirstExtension.defaultProperties);
    expect(secondExtension.properties).toEqual({ z: 'override property z' });
  });
});
