import { PlainExtension } from '../../extension';
import { Preset, SetPresetPropertiesParameter } from '../preset-base';

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

class FirstExtension extends PlainExtension<FirstSettings, FirstProperties> {
  public static defaultSettings = { a: 0 };
  public static defaultProperties = { y: 100 };

  public readonly name = 'first' as const;

  protected createDefaultSettings() {
    return FirstExtension.defaultSettings;
  }

  protected createDefaultProperties() {
    return FirstExtension.defaultProperties;
  }
}

class SecondExtension extends PlainExtension<SecondSettings, SecondProperties> {
  public static defaultSettings = { b: 'setting b' };
  public static defaultProperties = { z: 'property z' };

  public readonly name = 'second' as const;

  protected createDefaultSettings() {
    return SecondExtension.defaultSettings;
  }

  protected createDefaultProperties() {
    return SecondExtension.defaultProperties;
  }
}

describe('simplest preset', () => {
  class TestPreset extends Preset<Partial<Settings>, Properties> {
    public readonly name = 'test';

    protected createDefaultSettings() {
      return {
        a: FirstExtension.defaultSettings.a,
        b: SecondExtension.defaultSettings.b ?? 'none specified',
      };
    }
    protected createDefaultProperties() {
      return { y: FirstExtension.defaultProperties.y, z: 'override property z' };
    }
    public createExtensions() {
      return [new FirstExtension({}), new SecondExtension({ b: this.settings.b })];
    }

    protected onSetProperties(parameter: SetPresetPropertiesParameter<Properties>) {
      const { changes } = parameter;

      if (changes.y.changed) {
        const firstExtension = this.getExtension(FirstExtension);
        firstExtension.setProperties({ y: changes.y.value });
      }

      if (changes.z.changed) {
        const secondExtension = this.getExtension(SecondExtension);
        secondExtension.setProperties({ z: changes.z.value });
      }
    }
  }

  const testPreset = new TestPreset({});
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
