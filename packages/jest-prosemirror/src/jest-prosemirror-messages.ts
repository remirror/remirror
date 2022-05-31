import chalk from 'chalk';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { ProsemirrorNode } from '@remirror/core-types';

import { selectionFor } from './jest-prosemirror-nodes';

export const transformsNodePassMessage =
  (actual: ProsemirrorNode, expected: ProsemirrorNode, shouldChange: boolean) => (): string =>
    `${matcherHint('.not.toTransformNode')}\n\n${shouldChange}`
      ? `${chalk`Expected the node {bold not} to be:\n`}${printExpected(expected.toString())}\n` +
        `Position: { from: ${selectionFor(expected).from}, to: ${selectionFor(expected).to} }\n\n` +
        `Received:\n` +
        `${printReceived(actual.toString())}\n` +
        `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`
      : 'Expected the node to be different from:\n' +
        `${printExpected(expected.toString())}\n\n` +
        `Position: { from: ${selectionFor(expected).from} to: ${selectionFor(expected).to} }\n\n` +
        'Received:\n' +
        `${printReceived(actual.toString())}\n` +
        `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`;

export const transformsNodeFailMessage =
  (actual: ProsemirrorNode, expected: ProsemirrorNode, shouldChange: boolean) => (): string =>
    `${matcherHint('.toTransformNode')}\n\n${shouldChange}`
      ? 'Expected the node to be transformed to:\n' +
        `${printExpected(expected.toString())}\n` +
        `Position: { from: ${selectionFor(expected).from}, to: ${selectionFor(expected).to} }\n\n` +
        'Received:\n' +
        `${printReceived(actual.toString())}\n` +
        `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`
      : 'Expected the node not to be changed from:\n' +
        `${printExpected(expected.toString())}\n` +
        `Position: { from: ${selectionFor(expected).from} to: ${selectionFor(expected).to} }\n\n` +
        'Received:\n' +
        `${printReceived(actual.toString())}\n` +
        `Position: { from: ${selectionFor(actual).from}, to: ${selectionFor(actual).to} }\n\n`;
