import { Cast, object } from '@remirror/core-helpers';
import { CommandFunction } from '@remirror/core-types';
import { nonChainable } from '@remirror/core-utils';

import { ChainedFromExtensions, PlainExtension } from '..';
import { CommandsFromExtensions } from '../extension-types';

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

type Chainable = ChainedFromExtensions<FirstExtension | SecondExtension | ThirdExtension>;
type Commands = CommandsFromExtensions<FirstExtension | SecondExtension | ThirdExtension>;

const command: Commands['free'] = Cast(() => {});
const isEnabled: boolean = command.isEnabled();
command('');
// @ts-expect-error
command(0);
const commandOutput: void = command();

const love: Chainable['love'] = (value: number) => ({} as Chainable);
// @ts-expect-error
const loveFail: Chainable['love'] = (value: string) => ({} as Chainable);

const chain: Chainable = object();

// @ts-expect-error
chain.free().love().run();
chain.free().love(100).run();
// @ts-expect-error
chain.free('asdf').love(20).notChainable().run();
