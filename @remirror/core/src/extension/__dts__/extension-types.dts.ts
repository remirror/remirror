import { Cast, object } from '@remirror/core-helpers';
import { CommandFunction } from '@remirror/core-types';
import { nonChainable } from '@remirror/core-utils';

import { ChainedFromExtensions, PlainExtension } from '..';
import { CommandsFromExtensions } from '../extension-types';

class FirstExtension extends PlainExtension {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'first' as const;

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

class SecondExtension extends PlainExtension<{ option: boolean }> {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'second' as const;

  public createCommands = () => {
    return {
      fun: (value: { key?: boolean }) => {
        return () => false;
      },
    };
  };
}

class ThirdExtension extends PlainExtension {
  public static readonly defaultSettings = {};
  public static readonly defaultProperties = {};

  public readonly name = 'third' as const;

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

const commands: Commands = object();
const isEnabled: boolean = commands.free.isEnabled();
commands.free('');
// @ts-expect-error
commands.free(0);
const commandOutput: void = commands.free();
commands.notChainable('works');

const love: Chainable['love'] = (value: number) => ({} as Chainable);
// @ts-expect-error
const loveFail: Chainable['love'] = (value: string) => ({} as Chainable);

const chain: Chainable = object();

// @ts-expect-error
chain.free().love().run();
chain.free().love(100).fun({ key: false }).run();
// @ts-expect-error
chain.free('asdf').love(20).notChainable().run();
