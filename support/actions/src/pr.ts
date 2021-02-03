/**
 * @action
 *
 * A github action which is responsible for releasing the current PR.
 */

import { getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { stat, writeFile } from 'fs-extra';
import giphyApi, { Giphy } from 'giphy-api';
import { mutatePackageVersions } from 'scripts';

async function run() {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    setFailed('Please add the GITHUB_TOKEN to the pr release action');
    process.exit(1);
  }

  const octokit = getOctokit(githubToken);
  const giphyKey = getInput('giphyKey');
  const prNumber = context.payload.issue?.number as number;
  const owner = context.payload.repository?.full_name?.split('/')[0] as string;
  const repo = context.payload.repository?.name as string;

  console.log({ owner, repo, prNumber, payload: JSON.stringify(context.payload) });

  const sha = context.sha.slice(0, 9);
  const tag = `pr${prNumber}`;
  const prerelease = `${tag}.${sha}`;

  process.env.CI_PRERELEASE = prerelease;
  const giphy = giphyApi(giphyKey);

  if (!context.payload.comment?.html_url.includes('pull')) {
    setFailed(`this is not a pr comment: ${JSON.stringify(context.payload)}`);
  }

  await createGitHubLogin(githubToken);

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
    await createNpmrc();

    setOutput('tag', tag);

    const gif = await getMarkdownGif(giphy, 'whoop whoop');
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: gifComment(
        `:package: successfully released!!! :rocket:`,
        gif,
        `To install use the following versions \n\n- \`remirror@${tag}\`\n\n- \`@remirror/react@${tag}\``,
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
  return `![${phrase}](${gif.data.images.fixed_height_small.url})`;
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

async function createNpmrc() {
  const npmrcPath = `${process.env.HOME}/.npmrc`;
  const npmrcStat = await stat(npmrcPath);

  if (npmrcStat.isFile()) {
    console.log('Found existing .npmrc file');
  } else {
    console.log('No .npmrc file found, creating one');
    await writeFile(npmrcPath, `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`);
  }
}

async function createGitHubLogin(githubToken: string) {
  // Create the github login credentials.
  await writeFile(
    `${process.env.HOME}/.netrc`,
    `machine github.com\nlogin github-actions[bot]\npassword ${githubToken}`,
  );
}
