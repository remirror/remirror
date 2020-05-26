import { Static, StaticKeyList } from '@remirror/core-types';

import { OnSetOptionsParameter } from '../..';
import { PlainExtension } from '../../extension';
import { DefaultPresetOptions, Preset } from '../preset-base';

interface FirstOptions {
  a?: Static<number>;
  y?: number | undefined;
}

interface SecondOptions {
  b: Static<string>;
  z?: string;
}

interface Options extends FirstOptions, SecondOptions {}

class FirstExtension extends PlainExtension<FirstOptions> {
  public onSetCus: DefaultPresetOptions<FirstOptions> = { a: 0, y: 10 };
  public static staticKeys: StaticKeyList<FirstOptions> = ['a'];

  get name() {
    return 'first' as const;
  }
}

class SecondExtension extends PlainExtension<SecondOptions> {
  public onSetCus: DefaultPresetOptions<SecondOptions> = {
    b: 'setting b',
    z: 'z is awesome',
  };
  public static staticKeys = ['b'];

  get name() {
    return 'second' as const;
  }
}

describe('simplest preset', () => {
  class TestPreset extends Preset<Partial<Options>> {
    public onSetCus: DefaultPresetOptions<Options> = {
      a: FirstExtension.defaultOptions.a ?? '',
      y: FirstExtension.defaultOptions.y,
      b: SecondExtension.defaultOptions.b ?? 'none specified',
      z: SecondExtension.defaultOptions.z,
    };

    get name() {
      return 'test' as const;
    }

    public createExtensions() {
      return [new FirstExtension({ y: 10 }), new SecondExtension({ b: this.options.b })];
    }

    protected onSetOptions(parameter: OnSetOptionsParameter<Partial<Options>>) {
      const { changes } = parameter;

      if (changes.y.changed) {
        const firstExtension = this.getExtension(FirstExtension);
        firstExtension.setOptions({ y: changes.y.value });
      }

      if (changes.z.changed) {
        const secondExtension = this.getExtension(SecondExtension);
        secondExtension.setOptions({ z: changes.z.value });
      }
    }
  }

  const testPreset = new TestPreset();
  const extensionNames = testPreset.extensions.map((extension) => extension.name);
  const firstExtension = testPreset.getExtension(FirstExtension);
  const secondExtension = testPreset.getExtension(SecondExtension);

  it('creates a preset with no settings', () => {
    expect(extensionNames).toEqual(['first', 'second']);
    expect(firstExtension?.options.a).toBe(0);
    expect(secondExtension?.options.b).toBe(SecondExtension.defaultOptions.b);
    expect(firstExtension.options.y).toBe(FirstExtension.defaultOptions.y);
    expect(secondExtension.options.z).toBe(SecondExtension.defaultOptions.z);
  });

  it('responds to property updates when properly wired', () => {
    testPreset.setOptions({ y: 1234, z: 'a whole new world' });

    expect(firstExtension.options.y).toBe(1234);
    expect(secondExtension.options.z).toBe('a whole new world');
  });

  it('can reset properties to initial values', () => {
    testPreset.resetOptions();

    expect(firstExtension.options).toMatchObject(FirstExtension.defaultOptions);
    expect(secondExtension.options).toMatchObject({ z: SecondExtension.defaultOptions.z });
  });
});
