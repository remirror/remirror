import type { Handler } from '@remirror/core-types';
import { BoldExtension } from '@remirror/testing';

import { extensionDecorator } from '../../decorators';
import { PlainExtension } from '../extension-base';

interface TestOptions {
  onChange: Handler<() => void>;
  custom: Handler<() => boolean>;
}

@extensionDecorator<TestOptions>({
  handlerKeys: ['custom', 'onChange'],
  handlerKeyOptions: { custom: { earlyReturnValue: true } },
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
});
