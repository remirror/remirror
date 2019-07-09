import detox from 'detox';
import adapter from 'detox/runners/jest/adapter';
import specReporter from 'detox/runners/jest/specReporter';

const config = require('../package.json').detox;

// Set the default timeout
jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

// This takes care of generating status logs on a per-spec basis. By default, jest only reports at file-level.
// This is strictly optional.
jasmine.getEnv().addReporter(specReporter);

beforeAll(async () => {
  await detox.init(config);
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Expect the view to be at least 75% visible.
       * @example await expect(element(by.id('UniqueId204'))).toBeVisible();
       */
      toBeVisible(): R;
      /**
       * Expect the view to not be visible.
       * @example await expect(element(by.id('UniqueId205'))).toBeNotVisible();
       */
      toBeNotVisible(): R;
      /**
       * Expect the view to exist in the UI hierarchy.
       * @example await expect(element(by.id('UniqueId205'))).toExist();
       */
      toExist(): R;
      /**
       * Expect the view to not exist in the UI hierarchy.
       * @example await expect(element(by.id('RandomJunk959'))).toNotExist();
       */
      toNotExist(): R;
      /**
       * In React Native apps, expect UI component of type <Text> to have text.
       * In native iOS apps, expect UI elements of type UIButton, UILabel, UITextField or UITextViewIn to have inputText with text.
       * @param text
       * @example await expect(element(by.id('UniqueId204'))).toHaveText('I contain some text');
       */
      toHaveText(text: string): R;
      /**
       * It searches by accessibilityLabel on iOS, or by contentDescription on Android.
       * In React Native it can be set for both platforms by defining an accessibilityLabel on the view.
       * @param label
       * @example await expect(element(by.id('UniqueId204'))).toHaveLabel('Done');
       */
      toHaveLabel(label: string): R;
      /**
       * In React Native apps, expect UI component to have testID with that id.
       * In native iOS apps, expect UI element to have accesibilityIdentifier with that id.
       * @param id
       * @example await expect(element(by.text('I contain some text'))).toHaveId('UniqueId204');
       */
      toHaveId(id: string): R;
      /**
       * Expect components like a Switch to have a value ('0' for off, '1' for on).
       * @param value
       * @example await expect(element(by.id('UniqueId533'))).toHaveValue('0');
       */
      toHaveValue(value: any): R;
    }
  }
}
