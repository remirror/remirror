# Support

This is the support directory. If you're a contributor this is where a lot of the underlying work
happens.

Each folder contains a readme file with the brief explanation of the contents.

## Files

This folder consists of the following.

- `tsconfig.base.json` - The base config file which is used by all other `tsconfig` files to provide
  the typescript support in your editor and for builds.
- `tsconfig.lint.json` - The `tsconfig` file used by eslint to provide linting with type
  information.
- `tsconfig.main.json` - The main `tsconfig` file which provides typecheck for `/packages`, and most
  of the `/support` files.
- `base.babel.js` - The base babel configuration to prevent the need to constantly override it.

Take a peek inside each folder to find out more on what it's there for.
