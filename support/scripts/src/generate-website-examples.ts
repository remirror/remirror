/**
 * @script
 *
 * Generate files under `docs/examples`
 */

import fs from 'fs/promises';
import globby from 'globby';
import path from 'path';

import { baseDir, rm } from './helpers';

const examplesDirPath = path.join(baseDir(), 'docs', 'examples');
const storiesDirPath = path.join(baseDir(), 'packages', 'storybook-react', 'stories');

function generateExampleContent(relativePath: string): string {
  const relativePathWithoutSuffix = relativePath.replace(/\.tsx$/i, '');

  return `/* eslint-disable */
/**
 * THIS FILE IS AUTO GENERATED
 *
 * Run 'pnpm -w generate:website-examples' to regenerate this file.
 */

import CodeBlock from '@theme/CodeBlock';
import ComponentSource from '!!raw-loader!../../packages/storybook-react/stories/${relativePath}';

import ComponentStory from '../../packages/storybook-react/stories/${relativePathWithoutSuffix}';
import { ExampleRoot } from '../components/example-root';

const ExampleComponent = (): JSX.Element => {
  const story = <ComponentStory />;
  const source = <CodeBlock className='language-tsx'>{ComponentSource}</CodeBlock>;

  return <ExampleRoot story={story} source={source} />;
};

export default ExampleComponent;
  `;
}

async function run() {
  await rm(examplesDirPath);

  const filePaths = await globby(path.join(storiesDirPath, '**', '*.tsx'));

  for (const filePath of filePaths) {
    if (!filePath.endsWith('stories.tsx')) {
      console.log(filePath);
      const relativePath = path.relative(storiesDirPath, filePath);
      console.log(relativePath);
      const examplePath = path.join(examplesDirPath, relativePath);
      console.log(examplePath);
      await fs.mkdir(path.dirname(examplePath), { recursive: true });
      await fs.writeFile(examplePath, generateExampleContent(relativePath), { encoding: 'utf-8' });
    }
  }
}

run();
