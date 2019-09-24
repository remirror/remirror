/**
 * ## The problem
 *
 * You want to write tests for some of your prosemirror editor but you don't
 * know where to start. You know you should avoid testing implementation details
 * and just want to be sure that your commands and plugins produce the correct
 * underlying prosemirror state.
 *
 * ## This solution
 *
 * `jest-prosemirror` takes inspiration from the
 * [`testing-library`](https://github.com/testing-library/react-testing-library)
 * mantra and enables you to write more intuitive tests for your prosemirror
 * editor.
 *
 * ## Installation
 *
 * ```bash
 * yarn add jest-prosemirror
 * ```
 *
 * ## Getting started
 *
 * ### Quick setup
 *
 * For a quick setup add the following to your jest.config.js file.
 *
 * ```js
 * module.exports = {
 * setupFilesAfterEnv: ['jest-prosemirror/environment'],
 * testEnvironment: 'jsdom', // Required for dom manipulation
 * };
 * ```
 *
 * This will automatically:
 *
 * - Add the jest assertions `toTransformNode` and `toEqualProsemirrorNode`.
 *
 * If you are using typescript then add this to your `tsconfig.json` file for
 * global type support.
 *
 * ```json
 * {
 * "compilerOptions": {
 *  "types": ["jest-prosemirror"]
 * }
 * }
 * ```
 *
 * ### Manual setup
 *
 * Create a `jest.framework.dom.ts` file and add the following
 *
 * ```ts
 * import { prosemirrorMatchers } from 'jest-prosemirror';
 *
 * // Add jest-prosemirror assertions
 * expect.extend(prosemirrorMatchers);
 * ```
 *
 * In your `jest.config.js` add the created file to your configuration.
 *
 * ```js
 * module.exports = {
 * setupFilesAfterEnv: ['<rootDir>/jest.framework.dom.ts'],
 * testEnvironment: 'jsdom', // Required for dom manipulation
 * };
 * ```
 *
 * ## Snapshot serializer
 *
 * This package exports a serializer for better snapshot testing of prosemirror
 * primitives. To set this up add the following to your `jest.config.js` file.
 *
 * ```js
 * module.exports = {
 * snapshotSerializers: ['jest-prosemirror/serializer'],
 * };
 * ```
 *
 * Alternatively, you can add the following to your `jest.framework.dom.ts`
 * file.
 *
 * ```ts
 * import { prosemirrorSerializer } from 'jest-prosemirror';
 *
 * // Add the serializer for use throughout all the configured test files.
 * expect.addSnapshotSerializer(prosemirrorSerializer);
 * ```
 *
 * @packageDocumentation
 */

export * from './jest-prosemirror-matchers';
export * from './jest-prosemirror-environment';
export * from './jest-prosemirror-nodes';
export * from './jest-prosemirror-schema';
export * from './jest-prosemirror-types';
export * from './jest-prosemirror-editor';
export * from './jest-prosemirror-events';
export * from './jest-prosemirror-serializer';
