import type { CustomHandler, Dynamic, Handler, Static } from '@remirror/core-types';

import { extensionDecorator } from '..';
import { presetDecorator } from '../decorators';
import { PlainExtension } from '../extension';
import { Preset } from '../preset';
import type { OnSetOptionsParameter } from '../types';

interface GeneralOptions {
  type: Static<'awesome' | 'not-awesome'>;
  color?: string;
  backgroundColor?: Dynamic<string>;
  onChange?: Handler<() => void>;
  keyBindings: CustomHandler<Record<string, () => boolean>>;
}

describe('@extensionDecorator', () => {
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
    expect(() => testExtension.setOptions({ type: 'not-awesome' })).toThrowError();
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
    expect(() => testExtension.setOptions({ type: 'not-awesome' })).toThrowError();
  });
});

describe('@presetDecorator', () => {
  it('can decorate a preset', () => {
    @presetDecorator<GeneralOptions>({
      defaultOptions: { backgroundColor: 'red', color: 'pink' },
      staticKeys: ['type'],
      handlerKeys: ['onChange'],
      customHandlerKeys: ['keyBindings'],
    })
    class TestPreset extends Preset<GeneralOptions> {
      get name() {
        return 'test' as const;
      }

      createExtensions() {
        return [];
      }

      protected onSetOptions(_: OnSetOptionsParameter<GeneralOptions>): void {
        return;
      }
    }

    expect(TestPreset.staticKeys).toEqual(['type']);
    expect(TestPreset.handlerKeys).toEqual(['onChange']);
    expect(TestPreset.customHandlerKeys).toEqual(['keyBindings']);
    expect(TestPreset.defaultOptions).toEqual({ backgroundColor: 'red', color: 'pink' });

    const testPreset = new TestPreset({ type: 'awesome' });

    // @ts-expect-error
    expect(() => testPreset.setOptions({ type: 'not-awesome' })).toThrowError();
  });

  it('can decorate a preset as a function call', () => {
    const TestPreset = presetDecorator<GeneralOptions>({
      defaultOptions: { backgroundColor: 'red', color: 'pink' },
      staticKeys: ['type'],
      handlerKeys: ['onChange'],
      customHandlerKeys: ['keyBindings'],
    })(
      class TestPreset extends Preset<GeneralOptions> {
        get name() {
          return 'test' as const;
        }

        createExtensions() {
          return [];
        }

        protected onSetOptions(_: OnSetOptionsParameter<GeneralOptions>): void {
          return;
        }
      },
    );

    expect(TestPreset.staticKeys).toEqual(['type']);
    expect(TestPreset.handlerKeys).toEqual(['onChange']);
    expect(TestPreset.customHandlerKeys).toEqual(['keyBindings']);
    expect(TestPreset.defaultOptions).toEqual({ backgroundColor: 'red', color: 'pink' });

    const testPreset = new TestPreset({ type: 'awesome' });

    // @ts-expect-error
    expect(() => testPreset.setOptions({ type: 'not-awesome' })).toThrowError();
  });
});
