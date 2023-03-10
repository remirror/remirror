/**
 * @script
 *
 * Generate files under `website/extension-examples`
 */

import glob from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';
import { rimraf } from 'rimraf';

import { getRoot } from '../utils/get-root';

const examplesDirPath = path.join(getRoot(), 'website', 'extension-examples');
const storiesDirPath = path.join(getRoot(), 'packages', 'storybook-react', 'stories');

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

async function generateExampleFile(componentPath: string) {
  const relativePath = path.relative(storiesDirPath, componentPath);
  const examplePath = path.join(examplesDirPath, relativePath);
  await fs.mkdir(path.dirname(examplePath), { recursive: true });
  await fs.writeFile(examplePath, generateExampleContent(relativePath), { encoding: 'utf-8' });
}

async function run() {
  await rimraf(examplesDirPath);
  const filePaths = await glob(path.join(storiesDirPath, '*', '*.tsx'));
  await Promise.all(
    filePaths.filter((filePath) => !filePath.endsWith('stories.tsx')).map(generateExampleFile),
  );
}

export { run as generateWebsiteExamples };
