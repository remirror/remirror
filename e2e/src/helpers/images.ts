import looksSame, { createDiff } from 'looks-same';
import { kebabCase } from '@remirror/core';
import { promisify } from 'util';
import { resolve, dirname } from 'path';
import { writeFile } from 'fs';
import md from 'mkdirp-promise';

const write = promisify(writeFile);

const tempDir = (...paths: string[]) => resolve(__dirname, '../..', '__failed-diffs__', ...paths);

const toPng = (name: string) => (!name.endsWith('.png') ? `${name}.png` : name);

const getDiffPaths = () => {
  const testName = kebabCase(jasmine.currentTest.fullName.toLowerCase());

  return {
    diff: tempDir(toPng(testName)),
    one: tempDir(toPng(`${testName}_1`)),
    two: tempDir(toPng(`${testName}_2`)),
  };
};

/**
 * Checks that two images are matching
 */
export const imagesMatch = (image1: string | Buffer, image2: string | Buffer) => {
  return new Promise((resolve, reject) => {
    looksSame(image1, image2, { ignoreCaret: true }, (error, { equal }) => {
      if (equal) {
        resolve(equal);
        return;
      }
      const { diff, one, two } = getDiffPaths();

      md(dirname(diff))
        .then(() => {
          return Promise.all([write(one, image1), write(two, image2)]);
        })
        .then(() => {
          createDiff(
            {
              reference: image1,
              current: image2,
              diff: diff,
              highlightColor: '#ff00ff',
            },
            diffError => {
              if (diffError) {
                console.error('Could not create diff after failing test', diffError.message);
                reject(new Error('Could not create diff after failing test'));
                return;
              }
              reject(error || new Error(`Images do not match. Diff created at path ${diff}`));
            },
          );
        });
    });
  });
};
