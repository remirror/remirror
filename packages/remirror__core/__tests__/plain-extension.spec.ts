import { BoldExtension } from 'remirror/extensions';
import { ExtensionPriority } from '@remirror/core-constants';
import type { Handler } from '@remirror/core-types';

import { extension, PlainExtension } from '../';

interface TestOptions {
  onChange: Handler<() => void>;
  custom: Handler<() => boolean>;
  onEscape: Handler<() => boolean>;
  onTextInput: Handler<() => string>;
  incrementer: Handler<(stringNumber: string) => number>;
}

@extension<TestOptions>({
  handlerKeys: ['custom', 'onChange', 'onEscape', 'onTextInput', 'incrementer'],
  handlerKeyOptions: {
    custom: { earlyReturnValue: true },
    onEscape: { earlyReturnValue: (value) => value === true },
    __ALL__: { earlyReturnValue: (value) => value === '123' },
    onChange: { earlyReturnValue: '__IGNORE__' },
    incrementer: {
      reducer: {
        accumulator: (accumulated, latestValue, stringNumber) => {
          expect(stringNumber).toBeString();
          return accumulated + latestValue;
        },
        getDefault: (stringNumber) => {
          expect(stringNumber).toBeString();
          return 0;
        },
      },
    },
  },
})
class TestExtension extends PlainExtension<TestOptions> {
  get name() {
    return 'test' as const;
  }
}

test('isOfType', () => {
  const extension = new TestExtension();

  expect(extension.isOfType(TestExtension)).toBeTrue();
  expect(extension.isOfType(BoldExtension)).toBeFalse();
});

describe('Handlers', () => {
  it('supports simple handlers', () => {
    const testExtension = new TestExtension();
    const changeHandler = jest.fn(() => {});

    const dispose = testExtension.addHandler('onChange', changeHandler);
    testExtension.options.onChange();

    expect(changeHandler).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    dispose();

    expect(changeHandler).not.toHaveBeenCalled();
  });

  it('supports early return values', () => {
    const testExtension = new TestExtension();
    const firstHandler = jest.fn(() => false);
    const secondHandler = jest.fn(() => true);
    const thirdHandler = jest.fn(() => false);

    testExtension.addHandler('custom', firstHandler);
    const dispose = testExtension.addHandler('custom', secondHandler);
    testExtension.addHandler('custom', thirdHandler);

    let returnValue = testExtension.options.custom();
    expect(returnValue).toBe(true);

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(thirdHandler).not.toHaveBeenCalled();

    jest.clearAllMocks();
    dispose();

    returnValue = testExtension.options.custom();
    expect(returnValue).toBe(false);

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).not.toHaveBeenCalled();
    expect(thirdHandler).toHaveBeenCalledTimes(1);
  });

  it('supports early return function values', () => {
    const testExtension = new TestExtension();
    const firstHandler = jest.fn(() => false);
    const secondHandler = jest.fn(() => true);
    const thirdHandler = jest.fn(() => false);

    testExtension.addHandler('onEscape', firstHandler);
    const dispose = testExtension.addHandler('onEscape', secondHandler);
    testExtension.addHandler('onEscape', thirdHandler);

    let returnValue = testExtension.options.onEscape();
    expect(returnValue).toBe(true);

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(thirdHandler).not.toHaveBeenCalled();

    jest.clearAllMocks();
    dispose();

    returnValue = testExtension.options.onEscape();
    expect(returnValue).toBe(false);

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).not.toHaveBeenCalled();
    expect(thirdHandler).toHaveBeenCalledTimes(1);
  });

  it('supports the `__ALL__` default return value', () => {
    const testExtension = new TestExtension();
    const firstHandler = jest.fn(() => 'asdf');
    const secondHandler = jest.fn(() => '123');
    const thirdHandler = jest.fn(() => 'asf');

    testExtension.addHandler('onTextInput', firstHandler);
    const dispose = testExtension.addHandler('onTextInput', secondHandler);
    testExtension.addHandler('onTextInput', thirdHandler);

    let returnValue = testExtension.options.onTextInput();
    expect(returnValue).toBe('123');

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
    expect(thirdHandler).not.toHaveBeenCalled();

    jest.clearAllMocks();
    dispose();

    returnValue = testExtension.options.onTextInput();
    expect(returnValue).toBe('asf');

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).not.toHaveBeenCalled();
    expect(thirdHandler).toHaveBeenCalledTimes(1);
  });

  it('supports prioritization', () => {
    const values: number[] = [];
    const testExtension = new TestExtension();
    const one = jest.fn(() => values.push(1));
    const two = jest.fn(() => values.push(2));
    const three = jest.fn(() => values.push(3));

    testExtension.addHandler('onChange', one, ExtensionPriority.Lowest);
    testExtension.addHandler('onChange', two);
    testExtension.addHandler('onChange', three, ExtensionPriority.Medium);

    // Run the handlers.
    testExtension.options.onChange();

    expect(values).toEqual([3, 2, 1]);
  });

  it('supports reducer functions', () => {
    const testExtension = new TestExtension();
    const firstHandler = jest.fn(() => 10);
    const secondHandler = jest.fn(() => 100);
    const thirdHandler = jest.fn(() => 1);

    testExtension.addHandler('incrementer', firstHandler);
    const dispose = testExtension.addHandler('incrementer', secondHandler);
    testExtension.addHandler('incrementer', thirdHandler);

    expect(testExtension.options.incrementer('20')).toBe(111);

    dispose();
    expect(testExtension.options.incrementer('20')).toBe(11);
  });
});
