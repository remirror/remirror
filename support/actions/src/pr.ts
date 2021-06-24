/**
 * @action
 *
 * A github action which is responsible for releasing the current PR.
 */

import { getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import giphyApi, { Giphy } from 'giphy-api';
import { mutatePackageVersions } from 'scripts';

import { createSandboxUrl, getBuildNumber } from './pr-utils';

async function run() {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    setFailed('Please add the GITHUB_TOKEN to the pr release action');
    process.exit(1);
  }

  const octokit = getOctokit(githubToken).rest;
  const giphyKey = getInput('giphyKey');
  const prNumber = context.payload.issue?.number as number;
  const owner = context.payload.repository?.full_name?.split('/')[0] as string;
  const repo = context.payload.repository?.name as string;

  console.log({ owner, repo, prNumber, payload: JSON.stringify(context.payload) });

  const tag = `pr${prNumber}`;
  const buildNumber = await getBuildNumber(tag);
  const prerelease = `${tag}.${buildNumber}`;

  process.env.CI_PRERELEASE = prerelease;
  const giphy = giphyApi(giphyKey);

  if (!context.payload.comment?.html_url.includes('pull')) {
    setFailed(`this is not a pr comment: ${JSON.stringify(context.payload)}`);
  }

  const pr = await octokit.pulls.get({ owner, pull_number: prNumber, repo });

  // Don't support releases for already merged pr's.
  if (pr.data.merged) {
    const gif = await getMarkdownGif(giphy, 'what?');
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: gifComment(
        `:man_shrugging: github says this pr is already merged...`,
        gif,
        JSON.stringify(pr.data, null, 2),
      ),
    });

    setFailed('already merged');
    process.exit(1);
  }

  try {
    await mutatePackageVersions(prerelease);

    setOutput('tag', tag);
    const version = `0.0.0-${prerelease}`;
    const gif = await getMarkdownGif(giphy, 'whoop whoop');

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: gifComment(
        `:rocket: successfully released packages :package: with tag \`${tag}\`\n\n[**Open in CodeSandbox** - _JavaScript_](${createSandboxUrl(
          version,
          'js',
        )})\n[**Open in CodeSandbox** - _TypeScript_](${createSandboxUrl(version, 'tsx')})`,
        gif,
        `To install use the following versions \n\n- \`remirror@${version}\`\n\n- \`@remirror/react@${version}\``,
      ),
    });
  } catch (error) {
    const gif = await getMarkdownGif(giphy, 'epic fail');
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: gifComment(
        `:exclamation: publish failed...`,
        gif,
        `${error}:\n${'Error while mutating package versions.'}`,
      ),
    });

    setFailed('Error while mutating package versions.');
  }
}

run();

/**
 * Get the markdown gif
 */
async function getMarkdownGif(giphy: Giphy, phrase: string) {
  const gif = await giphy.random(phrase);
  return `![${phrase}](${gif.data.images.fixed_height.url})`;
}

/**
 * Create a GIF comment.
 */
function gifComment(comment: string, gif: string, details: string) {
  return (
    `${comment}\n\n${gif}` +
    `\n<details><summary>Details</summary>\n` +
    `\n<p>\n\n` +
    `\`\`\`bash\n` +
    `${details}` +
    `\n\`\`\`\n` +
    `</p>\n` +
    `</details>`
  );
}
