if (!/pnpm\.js$/.test(process.env.npm_execpath || '')) {
  console.warn(
    "\u001B[33mYou don't seem to be using pnpm. This could produce unexpected results.\n\nInstall with:\u001B[39m\n\ncurl -L https://unpkg.com/@pnpm/self-installer | node\n\n",
  );

  process.exit(1);
}
