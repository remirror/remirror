import {
  AnyExtension,
  ChainedFromExtensions,
  CommandsFromExtensions,
  GetExtensions,
  PlainExtension,
  RemoveAny,
} from 'remirror';
import {
  DocExtension,
  EventsExtension,
  HistoryExtension,
  ParagraphExtension,
} from 'remirror/extensions';
import { object } from '@remirror/core-helpers';
import type { CommandFunction } from '@remirror/core-types';
import { nonChainable } from '@remirror/core-utils';

class FirstExtension extends PlainExtension {
  get name() {
    return 'first' as const;
  }

  createCommands() {
    return {
      free(title?: string) {
        return () => false;
      },

      love(value: number): CommandFunction {
        return () => true;
      },
    };
  }
}

class SecondExtension extends PlainExtension<{ option: boolean }> {
  get name() {
    return 'second' as const;
  }

  createCommands() {
    return {
      fun: (value: { key?: boolean }) => {
        return () => false;
      },
    };
  }
}

class ThirdExtension extends PlainExtension {
  get name() {
    return 'third' as const;
  }

  createCommands() {
    return {
      notChainable: (value: string) => {
        return nonChainable(() => false);
      },
    };
  }
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

// Any extension should be loose.
const anyCommands: CommandsFromExtensions<AnyExtension> = object();
const doSomethingReturn: void = anyCommands.doSomething?.();
const doSomethingIsEnabled: boolean | undefined = anyCommands.doSomething?.isEnabled();

class SubbedExtension extends PlainExtension {
  get name() {
    return 'subbed' as const;
  }

  createExtensions() {
    return [new EventsExtension(), new DocExtension(), new ParagraphExtension()];
  }
}

const extensionArray: Array<GetExtensions<SubbedExtension>> = [
  new EventsExtension(),
  new DocExtension(),
  new ParagraphExtension(),
  new HistoryExtension(),
];

declare function onlySubbed(extension: RemoveAny<GetExtensions<SubbedExtension>>): void;
onlySubbed(new EventsExtension());
onlySubbed(new DocExtension());
onlySubbed(new SubbedExtension());
onlySubbed(new ParagraphExtension());
// @ts-expect-error - only subbed extensions should be valid
onlySubbed(new HistoryExtension());
