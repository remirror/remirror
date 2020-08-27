# Templates

This folder contains the templates for new packages. When creating a new package, rather than starting from scratch you can copy the relevant folder that best describes your package use case and paste it into the relevant packages folder.

When creating your own extension or preset you can follow these steps.

1. Copy `support/templates/extension-template` to `packages/@remirror/extension-<name>`.
2. Rename `template`, `Template` and `TEMPLATE` in the new package to `<name>`, `<Name>` and `<NAME>`.
3. Replace `TEMPLATE_DESCRIPTION` with a suitable description.
4. Rename the files from `template-` to `<name>-`.
5. (OPTIONAL) -Add your name and email as a contributor to the `package.json`.
6. Add `packages/remirror/extension/<name>/package.json`.
7. Add `packages/remirror/src/extension/<name>.ts`.
8. Edit `packages/remirror/package.json` to add dependency and entrypoint.
9. (OPTIONAL) - Edit `/.changeset/config.json` and add the package name to the linked array.
10. Run `pnpm i` in root.
