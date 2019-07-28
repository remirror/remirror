import looksSame from 'looks-same';

/**
 * Checks that two images are matching
 */
export const imagesMatch = (image1: string | Buffer, image2: string | Buffer) => {
  return new Promise((resolve, reject) => {
    looksSame(image1, image2, { ignoreCaret: true }, (error, { equal }) => {
      if (equal) {
        resolve(equal);
        return;
      }

      reject(error);
    });
  });
};
