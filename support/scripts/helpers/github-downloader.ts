import { OctokitOptions } from '@octokit/core/dist-types/types';
import { Octokit } from '@octokit/rest';
import { mkdir, writeFile } from 'fs/promises';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';
import os from 'os';
import path, { dirname } from 'path';

const ONE_HOUR_IN_MS = 1000 * 3600;
const DEFAULT_TARGET = path.join(os.tmpdir(), '__remirror__', 'gh');

const defaultCacheOpts = {
  ttl: ONE_HOUR_IN_MS,
  namespace: 'github-download-directory',
};

async function createDirectories(filepath: string) {
  const dir = dirname(filepath);
  return mkdir(dir, { recursive: true });
}

interface FileData {
  path: string;
  contents: Buffer;
}

function createOutput(tmpFolder: string) {
  return async (fileData: FileData) => {
    const filepath = path.join(tmpFolder, fileData.path);

    await createDirectories(filepath);
    await writeFile(filepath, fileData.contents);

    return filepath;
  };
}

interface Tree {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
}

export class Downloader {
  private cache: Keyv<Tree[]>;
  private store: KeyvFile<Tree[]>;
  private octokit: Octokit;

  constructor(options: { cache?: Keyv.Options<Tree[]>; github?: OctokitOptions } = {}) {
    const { cache, github } = options;
    const store = new KeyvFile();
    const cacheOpts: Keyv.Options<Tree[]> = { ...defaultCacheOpts, ...cache, store };

    this.store = store;
    this.cache = new Keyv(cacheOpts);
    this.octokit = new Octokit({ ...github, auth: process.env.GITHUB_TOKEN });
  }

  async getTree(options: GitHubRepo) {
    const { sha = 'HEAD', owner, repo } = options;
    const cacheKey = `${owner}/${repo}#${sha}`;

    const cachedTree = await this.cache.get(cacheKey);

    if (cachedTree) {
      return cachedTree;
    }

    const {
      data: { tree },
    } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: sha,
      recursive: 'true',
    });

    await this.cache.set(cacheKey, tree);
    await this.store.save();

    return tree;
  }

  async fetchFiles(options: DownloadOptions): Promise<FileData[]> {
    const { owner, repo, directory } = options;
    const tree = await this.getTree(options);

    const files = tree
      .filter(
        (node): node is Tree & { path: string } =>
          !!(node.path?.startsWith(directory) && node.type === 'blob'),
      )
      .map(async (node) => {
        const { data } = await this.octokit.git.getBlob({
          owner,
          repo,
          file_sha: node.sha ?? 'HEAD',
        });

        return {
          path: node.path.replace(directory, ''),
          contents: Buffer.from(data.content, data.encoding as 'utf-8'),
        };
      });

    return Promise.all(files);
  }

  /**
   * Return the generated file path.
   */
  async download(options: DownloadOptions): Promise<string> {
    const { owner, repo, sha = 'HEAD' } = options;
    const tmpFolder = path.join(DEFAULT_TARGET, `${owner}-${repo}-${sha}`);
    const files = await this.fetchFiles(options);

    await Promise.all(files.map(createOutput(tmpFolder)));
    return tmpFolder;
  }
}

const downloader = new Downloader();

export interface GitHubRepo {
  owner: string;
  repo: string;

  /**
   * @default master
   */
  sha?: string;
}

export interface DownloadOptions extends GitHubRepo {
  directory: string;
}

export interface DownloadGithubFolder extends DownloadOptions {
  /**
   * The name of the folder being downloaded.
   */
  name: string;
}

/**
 * Download a GitHub folder.
 */
export async function downloadGithubFolder(options: DownloadOptions): Promise<string> {
  return downloader.download(options);
}
