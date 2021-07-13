/**
 * A module that should become a separate library which captures video and con convert it to
 *
 * - gif
 * - webm
 * - other video formats
 */

import { readFile, writeFile } from 'fs/promises';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import type { Browser, Page } from 'playwright';

export interface SaveVideoProps {
  /**
   * The name of the video (without a file extension).
   */
  name: string;

  /**
   * The directory to store the saved assets. Relative paths will be resolved
   * relative to the `process.cwd()`.
   */
  directory: string;

  /**
   * The browser to use.
   */
  browser: Browser;

  /**
   * The supported format to use.
   */
  outputs?: OutputFormatOptions[];
}

interface GifFormatOptions {
  type: 'gif';

  /**
   * Frames per second.
   *
   * @default 10`
   */
  fps?: number;

  /**
   * Number of colors, up to 255.
   *
   * @default 80
   */
  colors?: number;

  /**
   * Compression (quality) level, from 0 (no compression) to 100.
   *
   * @default 40
   */
  compress?: number;

  /**
   * Time of starting position as `hh:mm:ss` or `seconds`,
   *
   * @default 0
   */
  from?: string | number;

  /**
   * End position, hh:mm:ss or seconds
   *
   * @default undefined
   */
  to?: string | number;

  /**
   * Resize output, specifying -1 as width or height will maintain the aspect ratio.
   */
  resize?: { width: number; height: number };

  /**
   *  Reverses movie
   */
  reverse?: boolean;
  /**
   * Movie speed
   *
   * @default 1
   */
  speed?: number;

  /**
   * Subtitle filepath to burn to the GIF
   */
  subtitles?: string;

  /**
   * Add some text at the bottom of the generated GIF
   */
  text?: string;

  /**
   * Will show every frame once without looping
   */
  noLoop?: boolean;
}

interface WebpFormatOptions {
  type: 'webp';
}

interface Mp4FormatOptions {
  type: 'mp4';
}

type OutputFormatOptions = GifFormatOptions | WebpFormatOptions | Mp4FormatOptions;

const TMP_DIRECTORY = path.join(os.tmpdir(), '__playwright-capture__');

/**
 * Wrap a test and save the video.
 */
export function saveVideo(
  props: SaveVideoProps,
  runner: (page: Page) => Promise<void>,
): () => Promise<void> {
  const { name, directory, browser, outputs = [{ type: 'mp4' }] } = props;
  const destination = path.resolve(directory, name);

  return async () => {
    const page = await browser.newPage({ recordVideo: { dir: TMP_DIRECTORY } });
    const tmpFile = await page.video()?.path();

    if (!tmpFile) {
      throw new Error('No file could be created for the page.');
    }

    // Run the page interactions.
    await runner(page);
    // Saves the videos saved.
    await page.close();

    const originalFile = await readFile(tmpFile);
    const limit = pLimit(os.cpus().length);
    const promises: Array<Promise<void>> = [];

    for (const output of outputs) {
      if (output.type === 'mp4') {
        const promiseFn = async () => {
          await writeFile(`${destination}.${output.type}`, originalFile);
        };

        promises.push(limit(promiseFn));
      }
    }

    await Promise.all(promises);
  };
}
