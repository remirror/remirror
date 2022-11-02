/**
 * @script
 *
 * Generate files under `website/extension-examples`
 */

import fs from 'fs/promises';
import globby from 'globby';
import path from 'path';

import { baseDir, rm } from './helpers';

const examplesDirPath = path.join(baseDir(), 'website', 'extension-examples');
const storiesDirPath = path.join(baseDir(), 'packages', 'storybook-react', 'stories');

function generateExampleContent(relativePath: string): string {
  const relativePathWithoutSuffix = relativePath.replace(/\.tsx$/i, '');

  return `/**
 * THIS FILE IS AUTO GENERATED!
 *
 * Run \`pnpm -w generate:website-examples\` to regenerate this file.
 */

// @ts-nocheck

import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ComponentSource from '!!raw-loader!../../../packages/storybook-react/stories/${relativePath}';

import { StoryExample } from '../../src/components/story-example-component';

const ExampleComponent = (): JSX.Element => {
  const story = (
    <BrowserOnly>
      {() => {
        const ComponentStory = require('../../../packages/storybook-react/stories/${relativePathWithoutSuffix}').default
        return <ComponentStory/>
      }}
    </BrowserOnly>
  );
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <StoryExample story={story} source={source} />;
};

export default ExampleComponent;
`;
}

async function generateExampleFile(conponentPath: string) {
  const relativePath = path.relative(storiesDirPath, conponentPath);
  const examplePath = path.join(examplesDirPath, relativePath);
  await fs.mkdir(path.dirname(examplePath), { recursive: true });
  await fs.writeFile(examplePath, generateExampleContent(relativePath), { encoding: 'utf-8' });
}

async function run() {
  await rm(examplesDirPath);
  const filePaths = await globby(path.join(storiesDirPath, '*', '*.tsx'));
  await Promise.all(
    filePaths.filter((filePath) => !filePath.endsWith('stories.tsx')).map(generateExampleFile),
  );
}

run();
