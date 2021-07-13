# Templates

This folder contains the templates for new packages. When creating a new package, rather than starting from scratch you can copy the relevant folder that best describes your package use case and paste it into the relevant packages folder.

## 1. Automated

The easiest way to create a new scoped package in this repo is to run `pnpm create:package NAME -- --description "DESCRIPTION"`. For example the following command would create a package called `@remirror/extension-chill`.

```bash
pnpm create:package @remirror/extension-chill -- --description "The time to be chill."
```

## 2. Manually

If you prefer not to use the automated method for creating extension the following also works.

1. Copy `support/templates/extension-template` to `packages/remirror__extension-<name>`.
2. Rename `template`, `Template` and `TEMPLATE` in the new package to `<name>`, `<Name>` and `<NAME>`.
3. Replace `TEMPLATE_DESCRIPTION` with a suitable description.
4. Rename the files from `template-` to `<name>-`.

## 3. Complete setup

1. (OPTIONAL) -Add your name and email as a contributor to the `package.json`.
2. Add `packages/remirror/extension/<name>/package.json`.
3. Add `packages/remirror/src/extension/<name>.ts`.
4. Edit `packages/remirror/package.json` to add dependency and entrypoint.
5. (OPTIONAL) - Edit `/.changeset/config.json` and add the package name to the linked array.
6. Run `pnpm i` in root.
