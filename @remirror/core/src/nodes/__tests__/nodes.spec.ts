import { Cast } from '@remirror/core-helpers';
import { DocExtension, TextExtension } from '../..';

// While these tests seem simple there is a reason for them.
//
// While using abstract classes in TypeScript if the code is compiled with TS the compiled properties are not
// added to the class definition. This means I can declare an abstract property on a base class and letter extend that class
// defining the class with a getter for that property without any issue.
// For some reason when using babel and the `@babel/preset-typescript` this was not the case.
// Getters defined in parent classes were being ignored as the value was being set to void.
// The solution has been to remove this preset and replace it with the plugin `@babel/plugin-transform-typescript`
// placed as the first plugin in the list.
//
// If the abstract class code is run through the Babel TS plugin first then it is handled properly..
// These tests are here as a flag, in case someone does changes the babel compile pipeline in a way that breaks things.

describe('nodes', () => {
  test('doc', () => {
    const doc = new DocExtension();
    expect(doc.name).toBe('doc');
    expect(Cast(doc.pluginKey).key).toInclude('doc$');
  });

  test('text', () => {
    const text = new TextExtension();
    expect(text.name).toBe('text');
    expect(Cast(text.pluginKey).key).toInclude('text$');
  });
});
