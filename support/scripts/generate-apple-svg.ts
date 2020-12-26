import fontkit, { Glyph } from 'fontkit';
import { mkdir, writeFile } from 'fs/promises';
import os from 'os';
import { log, baseDir } from './helpers';
import { bitmap2vector } from 'bitmap2vector';
import path from 'path';

const SVG_OUTPUT_FOLDER = baseDir('packages/@remirror/extension-emoji/apple/svg');
const PNG_OUTPUT_FOLDER = baseDir('packages/@remirror/extension-emoji/apple/png');

async function writeToOutput(glyph: Glyph) {
  const image = glyph.getImageForSize(256);

  if (!image) {
    // const svgPath = glyph.path.toSVG();

    // if (svgPath) {
    //   log.info('generate svg from path:', glyph.name);
    //   const svg: string = `<svg width="160" height="160" version="1.1" viewBox="0 0 160 160"><path d="${glyph.path.toSVG()}" /></svg>`;
    //   await writeFile(path.join(SVG_OUTPUT_FOLDER, `${glyph.name}.svg`), svg, {
    //     encoding: 'utf-8',
    //   });
    // }

    return;
  }

  // log.info('generating svg from image:', glyph.name, );

  const output = await bitmap2vector({
    input: image.data,
    viewbox: true,
    pathomit: 2,
    colorsampling: 0,
  });

  await Promise.all([
    writeFile(path.join(SVG_OUTPUT_FOLDER, `${glyph.name}.svg`), output.content),
    // writeFile(path.join(PNG_OUTPUT_FOLDER, `${glyph.name}.png`), image.data),
  ]);
}

/**
 * Should be run on a mac.
 */
async function run() {
  if (os.platform() !== 'darwin') {
    log.warn('Apple fonts can only be generated on a MAC.');
    return;
  }

  await mkdir(SVG_OUTPUT_FOLDER, { recursive: true });
  await mkdir(PNG_OUTPUT_FOLDER, { recursive: true });

  const font = fontkit.openSync('/System/Library/Fonts/Apple Color Emoji.ttc', 'AppleColorEmoji');
  const promises: Array<Promise<void>> = [];

  for (let codePoint = 0; codePoint < font.numGlyphs; codePoint++) {
    const glyph = font.getGlyph(codePoint);

    if (glyph.name.startsWith('u')) {
      log.debug();
      promises.push(writeToOutput(glyph));
    }
  }

  await Promise.all(promises);
}

declare module 'fontkit' {
  interface GlyphImage {
    data: Buffer;
    originX: number;
    originY: number;
    type: 'png' | 'jpg';
  }

  interface Glyph {
    name: string;
    getImageForSize(size: number): GlyphImage | null;
  }

  interface Font {
    getGlyph(id: number, codePoints?: number[]): Glyph;
  }
}

run();
