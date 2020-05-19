import { CommandFunction } from '@remirror/core-types';
import { nonChainable } from '@remirror/core-utils';

import { ChainedFromExtensions, ChainedIntersection, PlainExtension } from '..';
import { CommandsExtension } from '../../builtins';

class FirstExtension extends PlainExtension {
  public name = 'first' as const;

  protected createDefaultSettings(): import('..').DefaultSettingsType<{}> {
    throw new Error('Method not implemented.');
  }

  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }

  public createCommands = () => {
    return {
      free(title?: string) {
        return () => false;
      },

      love(value: number): CommandFunction {
        return () => true;
      },
    };
  };
}

class SecondExtension extends PlainExtension {
  public name = 'second' as const;

  protected createDefaultSettings(): import('..').DefaultSettingsType<{}> {
    throw new Error('Method not implemented.');
  }
  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
}

class ThirdExtension extends PlainExtension {
  public name = 'third' as const;

  protected createDefaultSettings(): import('..').DefaultSettingsType<{}> {
    throw new Error('Method not implemented.');
  }
  protected createDefaultProperties(): Required<{}> {
    throw new Error('Method not implemented.');
  }
  public createCommands = () => {
    return {
      notChainable: (value: string) => {
        return nonChainable(() => false);
      },
    };
  };
}

type Commands = ChainedFromExtensions<FirstExtension | SecondExtension | ThirdExtension>;

const love: Commands['love'] = (value: number) => ({} as Commands);
// @ts-expect-error
const loveFail: Commands['love'] = (value: string) => ({} as Commands);

const chain: Commands = {} as any;

// @ts-expect-error
chain.free().love().run();
chain.free().love(100).run();
// @ts-expect-error
chain.free('asdf').love(20).notChainable().run();
