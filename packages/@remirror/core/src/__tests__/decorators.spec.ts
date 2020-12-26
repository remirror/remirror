import type { CustomHandler, Dynamic, Handler, Static } from '@remirror/core-types';
import { hideConsoleError } from '@remirror/testing';

import { extensionDecorator, PlainExtension } from '../..';

interface GeneralOptions {
  type: Static<'awesome' | 'not-awesome'>;
  color?: string;
  backgroundColor?: Dynamic<string>;
  onChange?: Handler<() => void>;
  keyBindings: CustomHandler<Record<string, () => boolean>>;
}

describe('@extensionDecorator', () => {
  // Hides console messages
  hideConsoleError(true);

  it('can decorate an extension', () => {
    @extensionDecorator<GeneralOptions>({
      defaultOptions: { backgroundColor: 'red', color: 'pink' },
      staticKeys: ['type'],
      handlerKeys: ['onChange'],
      customHandlerKeys: ['keyBindings'],
    })
    class TestExtension extends PlainExtension<GeneralOptions> {
      get name() {
        return 'test' as const;
      }
    }

    expect(TestExtension.staticKeys).toEqual(['type']);
    expect(TestExtension.handlerKeys).toEqual(['onChange']);
    expect(TestExtension.customHandlerKeys).toEqual(['keyBindings']);
    expect(TestExtension.defaultOptions).toEqual({ backgroundColor: 'red', color: 'pink' });

    const testExtension = new TestExtension({ type: 'awesome' });

    // @ts-expect-error
    expect(() => testExtension.setOptions({ type: 'not-awesome' })).toThrow();
  });

  it('can decorate an extension as a function call', () => {
    const TestExtension = extensionDecorator<GeneralOptions>({
      defaultOptions: { backgroundColor: 'red', color: 'pink' },
      staticKeys: ['type'],
      handlerKeys: ['onChange'],
      customHandlerKeys: ['keyBindings'],
    })(
      class TestExtension extends PlainExtension<GeneralOptions> {
        get name() {
          return 'test' as const;
        }
      },
    );

    expect(TestExtension.staticKeys).toEqual(['type']);
    expect(TestExtension.handlerKeys).toEqual(['onChange']);
    expect(TestExtension.customHandlerKeys).toEqual(['keyBindings']);
    expect(TestExtension.defaultOptions).toEqual({ backgroundColor: 'red', color: 'pink' });

    const testExtension = new TestExtension({ type: 'awesome' });

    // @ts-expect-error
    expect(() => testExtension.setOptions({ type: 'not-awesome' })).toThrow();
  });
});
