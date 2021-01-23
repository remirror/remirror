import { setFfmpegPath } from 'fluent-ffmpeg';

export const getFfmpegFromModule = (): string | null => {
  try {
    const ffmpeg = require('@ffmpeg-installer/ffmpeg'); // eslint-disable-line @typescript-eslint/no-var-requires

    if (ffmpeg.path) {
      return ffmpeg.path;
    }
  } catch {
    // Do nothing
  }

  return null;
};

export const getFfmpegPath = (): string | null => {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH;
  }

  return getFfmpegFromModule();
};

export const ensureFfmpegPath = (): void => {
  const ffmpegPath = getFfmpegPath();

  if (!ffmpegPath) {
    throw new Error(
      'pw-video: FFmpeg path not set. Set the FFMPEG_PATH env variable or install @ffmpeg-installer/ffmpeg as a dependency.',
    );
  }

  setFfmpegPath(ffmpegPath);
};
