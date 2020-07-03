# Scripts

This folder includes the custom node scripts. Used in the project.

## Files

- `helpers/` - Some helper functions.
- `check-pnpm.js` - Run on `preinstall` to check that `pnpm` is being used. This command will error
  with instructions if using a different package manager.
- `check-styles.js` - Check that the css styles are up to date in the project.
- `generate-configs.js` - Generate configuration files. At the moment this only creates the
  `.size-limit.json` files. `.size-limit.json` file for checking the file sizes.
- `linaria.js` - Generate the `css` files for the project.
- `run-if-clean.js` - Runs a command if the git repo is clean.
- `run-if-config.js` - Check the private project configuration to see if the command is supported.
  This is how precommit hooks can tell if they should run.
- `run-if-mac.js` - Run the provided command on mac only.
- `run-if-not-ci.js` - Run the command on CI only.
- `symlink-root.js` - Symlink the config files to the root directory.
