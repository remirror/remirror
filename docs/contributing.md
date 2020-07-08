---
title: Contributing
---

Fork [this repository][repo], clone your fork and add this repository as the upstream remote.

You will need to have `pnpm` installed so make sure you follow the installation
[instructions](https://pnpm.js.org/en/installation).

```bash
git clone <<FORKED_REPO_URL>>
cd remirror
git remote add upstream https://github.com/remirror/remirror
pnpm install

# Checkout a branch and start working on it
git checkout -b BRANCH_NAME
```

If you already have a previous version of the repository checked out then you will also need to make
sure to clean your `node_modules` and run the following command before installation.

```bash
pnpm clean:all
pnpm install
```

From the root directory use the following command to work on examples or the documentation website.

```bash
pnpm docs
```

Once the build completes (can take a minute the first time) navigate to http://localhost:3000 (or
another port if that one is already being used).

The documentation is written using [docusaurus] and all files and dependencies are available in the
`/docs/` subdirectory. To add a new dependency, you will need to add it to `/docs/package.json` and
not the top level package.json file. You can either do this by manually editing the
`/docs/package.json` file or you use the following command.

```bash
cd docs
pnpm add <package>
```

<br />

## Testing

Unit tests can be run with the following commands.

```bash
pnpm test # Unit Test
pnpm test:e2e # Unit + Integration Tests on chrome
pnpm test:watch # Test changed files since the last commit
```

Always create your tests inside of a `__tests__/` sub-folder.

**For naming conventions, use the following.**

- Unit tests: `*.spec.ts(x)`
- Integration tests: `*.e2e.test.ts` within the `/e2e` folder

<br />

## Gitflow

I recommend that while working on your code you commit early and often. You won't be judged. All
worked submitted in a pull request (see following section) will be squashed into one commit before
merging (unless it makes sense to keep the commits as separate items).

`remirror` has built in [husky] support for git hooks

- Before each commit (lint and test changed files)
- Before each push (lint, typecheck and test)

By default these checks are **not** run automatically. To enable automatic pre-commit and pre-push
hooks use the following command:

```bash
pnpm start:checks
```

To stop per-commit / per-push checks run:

```bash
pnpm stop:checks
```

<br />

## Development

First, run `pnpm build` so the initial version of everything is built.

After your first build, you can run `pnpm dev` to watch for changes and recompile as necessary.

If you're modifying a package and import helpers from another packages in the monorepo, ensure that
the other package is referenced in the referring package's `package.json` file.

This project is using composite types and adding a new dependency to the project throws the build
process since it's location has to explicitly be updated. Running `pnpm generate:json` will
automatically update all your project references so that the build still works. (It basically
creates all the project `tsconfig.prod.json` files for you as can be seen
[here](https://github.com/remirror/remirror/blob/b096ed1dd3/support/scripts/generate-configs.js#L186-L228).)

<br />

## Pull Request (PR) Process

Once your work is complete you'll want to create a Pull Request to share all that goodness with the
rest of us.

1. Create a [pull request](https://help.github.com/en/articles/creating-a-pull-request) using the
   github interface. The template will automatically populate for you.
2. Add a description and reference the issue this pull request addresses where applicable. The
   description will be used as the body of the git commit message since all pull request are
   squashed down into one commit before merging.
3. Tick off all relevant check boxes by placing an x between the square brackets i.e. `[ ]` to
   `[x]`.
4. Please add a screenshot where the change is related to the user interface or design. It makes it
   so much easier to grasp the intentions of your work. You can use your favourite GIF screenshare
   tool for creating animated screenshots.
5. Once submitted the PR will be addressed at our earliest convenience.

<br />

## Code style

Over time this project has accumulated quite an active set of lint rules.

The following are some points to keep in mind while developing for this codebase.

- Functions with more than two arguments should condense these arguments into a parameter object.
- TypeScript as a first class solution. Make the process as seamless as possible for the user. The
  types should guide them as they develop providing inline documentation and auto suggestions for
  using the API.
- Choose simplicity over performance. Performance is abstract and it's often better to start with a
  simple implementation that can be made more performant, than something that's complex from day
  one.
- Use `const` **Arrow Functions** when declaring components.

```tsx
const MyComponent = () => {
  return <div />;
};
```

- Use **Function Declarations** when creating top level functions.

```ts
// ✅ - GOOD
function doSomething(something: string) {
  return `Cannot do ${something}`;
}

// ❌ - BAD
const doSomething = (something: string) => {
  return `Cannot do ${something}`;
};
```

<br />

## Creating packages

When creating your own extension or preset you can follow these steps.

1. Copy `support/templates/extension-template` to `package/@remirror/extension-<name>`.
2. Rename `template`, `Template` and `TEMPLATE` in the new package to `<name>`, `<Name>` and
   `<NAME>`.
3. Replace `TEMPLATE_DESCRIPTION` with a suitable description.
4. Rename the files from `template-` to `<name>-`.
5. (OPTIONAL) -Add your name and email as a contributor to the `package.json`.
6. Add `packages/remirror/extension/<name>/package.json`.
7. Add `packages/remirror/src/extension/<name>.ts`.
8. Edit `packages/remirror/package.json` to add dependency and entrypoint.
9. (OPTIONAL) - Edit `/.changeset/config.json` and add the package name to the linked array.
10. Run `pnpm i` in root.

<br />

## Code of Conduct

<br />

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers
pledge to making participation in our project and our community a harassment-free experience for
everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level
of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic address, without explicit
  permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are
expected to take appropriate and fair corrective action in response to any instances of unacceptable
behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits,
code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or
to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is
representing the project or its community. Examples of representing a project or community include
using an official project e-mail address, posting via an official social media account, or acting as
an appointed representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting
the project team at help@kickjump.co. All complaints will be reviewed and investigated and will
result in a response that is deemed necessary and appropriate to the circumstances. The project team
is obligated to maintain confidentiality with regard to the reporter of an incident. Further details
of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good faith may face
temporary or permanent repercussions as determined by other members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant], version 1.4, available at
[http://contributor-covenant.org/version/1/4][version]

[contributor covenant]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
[docusaurus]: https://v2.docusaurus.io/
[repo]: https://github.com/remirror/remirror
[husky]: https://github.com/typicode/husky
