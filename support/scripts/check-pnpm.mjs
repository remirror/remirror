/**
 * @script
 *
 * This is left as a JavaScript file since it is called in the `preinstall` hook
 * before any packages have been installed.
 */
import process from 'process';

if (!/pnpm(\.[cm]?js|)$/.test(process.env.npm_execpath || '')) {
  console.warn(
    "\u001B[33mYou don't seem to be using pnpm. This could produce unexpected results.\n\nInstall with:\u001B[36m\n\nnpm i -g pnpm\n\n",
  );

  process.exit(1);
}
