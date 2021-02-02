/**
 * @action
 *
 * A github action which is responsible for releasing the current PR.
 */

import { getInput, setFailed } from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import { context, getOctokit } from '@actions/github';
import { stat, writeFile } from 'fs/promises';
import giphyApi, { Giphy } from 'giphy-api';

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  setFailed('Please add the GITHUB_TOKEN to the pr release action');
  process.exit(1);
}

const octokit = getOctokit(githubToken);
const versionCommand = getInput('version');
const buildCommand = getInput('build', { required: true });
const giphyKey = getInput('giphyKey');
const prNumber = context.payload.pull_request?.number as number;
const owner = context.payload.repository?.full_name?.split('/')[0] as string;
const repo = context.payload.repository?.name as string;

if (!owner || !repo || !prNumber) {
  setFailed('Missing information from the pull request');
  process.exit(1);
}

const sha = context.sha.slice(0, 9);
const tag = `pr${prNumber}`;
const prerelease = `${tag}.${sha}`;

async function run() {
  process.env.CI_PRERELEASE = prerelease;
  const giphy = giphyApi(giphyKey);

  if (!context.payload.comment?.html_url.includes('pull')) {
    setFailed(`this is not a pr comment: ${JSON.stringify(context.payload)}`);
  }

  await createGitHubLogin();

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
    const [versionCommandName, ...versionCommandArgs] = versionCommand.split(/\s+/);
    const [buildCommandName, ...buildCommandArgs] = buildCommand.split(/\s+/);

    if (versionCommandName) {
      await exec(versionCommandName, versionCommandArgs, execOptions);
    }

    if (buildCommandName) {
      await exec(buildCommandName, buildCommandArgs, execOptions);
    }

    await createNpmrc();
    await exec('pnpm', ['publish', '-r', '--tag', tag], execOptions);

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
        `:exclamation: i tried the rebase and failed...`,
        gif,
        `${error}:\n${execLogs}`,
      ),
    });
    setFailed(execLogs);
  }
}

run();

/**
 * Get the markdown gif
 */
async function getMarkdownGif(giphy: Giphy, phrase: string) {
  const gif = await giphy.random(phrase);
  return `![${phrase}](${gif.data.images.fixed_height_small})`;
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

async function createGitHubLogin() {
  // Create the github login credentials.
  await writeFile(
    `${process.env.HOME}/.netrc`,
    `machine github.com\nlogin github-actions[bot]\npassword ${githubToken}`,
  );
}

let execLogs = '';
const execOptions: ExecOptions = {
  listeners: {
    stdout: (data) => {
      execLogs += data.toString();
    },
    stderr: (data) => {
      execLogs += data.toString();
    },
  },
};
