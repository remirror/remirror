---
hide_title: true
title: Contributing
---

# Contributing

Fork [this repository][repo], clone your fork and add this repository as the upstream remote.

You will need to have [`pnpm`](https://pnpm.js.org) installed so make sure you follow the installation [instructions](https://pnpm.js.org/en/installation). At the time of writing the advised way to install is via `npm i -g pnpm`.

You will also need to install [`git-lfs`](https://git-lfs.github.com/) which is used for managing large file storage. The installation is platform dependent so please follow the instructions outlined [here](https://git-lfs.github.com/).

```bash
git clone <<FORKED_REPO_URL>>
cd remirror
git remote add upstream https://github.com/remirror/remirror
pnpm install

# Checkout a branch and start working on it
git checkout -b BRANCH_NAME
```

If you already have a previous version of the repository checked out then make sure to clean your `node_modules` by running the following command before installation.

```bash
pnpm clean:all
pnpm install

# An alternative which combines these to commands
pnpm refresh
```

## Project Structure

The number of files in the root directory is deliberately as minimal as possible. This is achieved by moving all configuration files to the `support/root` folder. Whenever you run `pnpm install` these files are symlinked to the root directory.

- `.github` - The `GitHub` specific configuration for workflows, issue templates and pull request templates.
- `docs` - The documentation for this project. This is also used by the docusaurus website.
- `packages` - The packages provided by remirror. Within this folder there are top level packages like `remirror` and `jest-remirror` and also scope packages within the `@remirror/*` folder like `@remirror/core`.
- `support` - This is the package that provides the configuration files, the website, and many other folders. Each directory includes a readme file that explains it's functionality. Take a [look](https://github.com/remirror/remirror/tree/HEAD/support).

## Documentation

From the root directory use the following command to launch the documentation site.

```bash
pnpm docs:dev
```

Once the build completes (can take a minute the first time) navigate to <http://localhost:3000> (or another port if that one is already being used).

The documentation is written using [docusaurus] and all files and dependencies are available in the `/website` subdirectory. To add a new dependency, you will need to add it to `/website/package.json` and not the top level package.json file. You can either do this by manually editing the `/website/package.json` file or you use the following command.

```bash
cd website
pnpm add <package>
```

<br />

## Testing

Unit tests can be run with the following commands.

```bash
# Unit
pnpm test
pnpm test:watch

# E2E
pnpm e2e
pnpm e2e:watch
```

Always create all your tests inside of the `__tests__/` sub-folder within the package that is being tested. So for `@remirror/react-core` all tests would be placed inside `packages/remirror__react-core/__tests__/`.

Always create your e2e tests inside of a `__e2e__/` subfolder within the package or example that is being tested. So for testing stories you would add the new tests to `examples/react-storybook/__e2e__`.

Sometimes you will want to narrow down tests to run only a specific file or folder.

```bash
pnpm test dom.spec.ts # Runs the test file matching dom.spec.ts once.
pnpm test:watch @remirror/react # Runs every test in the `@remirror/react` package under watch mode.
```

Once in watch mode you can also press `p` and type out the file you want to focus on. Press enter to select the file.

**For naming conventions, use the following.**

- Unit tests: `*.spec.ts(x)`
- Integration tests: `*.e2e.test.ts` within the `__e2e__/` folder

Unit tests can be run limited to a specific package or test file name, e.g. for `extension-bold`:

```bash
pnpm test extension-bold
```

This also supports watching the tests for the specific file.

```bash
pnpm test:watch extension-bold
```

<br />

## Stories

Stories are an integral part of this repository. They serve as the package level documentation and are used as the building blocks for the **e2e** tests. Stories are primarily user experience focused.

For example the **bold extension** will have a story which shows how the commands can be used to toggle bold text within the editor.

Each story should be placed within the `__stories__` folder and the file should end with the pattern `*.stories.ts(x)`.

Following the 1.0.0 release of `remirror` there will be a big push to add more stories documenting the usage of all the extensions, commands and hooks available.

<br />

## Using Git

I recommend that while working on your code you commit early and often. You won't be judged. All worked submitted in a pull request (see following section) will be squashed into one commit before merging (unless it makes sense to keep the commits as separate items).

`remirror` has built in [husky] support for git hooks

- Before each commit (lint and test changed files)
- Before each push (lint, typecheck and test)

By default these checks are **not** run automatically. To enable automatic pre-commit and pre-push hooks use the following command:

```bash
pnpm checks:enable
```

To stop per-commit / per-push checks run:

```bash
pnpm checks:disable
```

<br />

## Development

If you're modifying a package and import helpers from another packages in the monorepo, ensure that the other package is referenced in the referring package's `package.json` file.

### General

This project uses [`preconstruct`](https://github.com/preconstruct/preconstruct) to manage builds. Each time the project is installed `preconstruct dev` is run which automatically sets the dist folder with entry points mapping to the source files of the package. This is really useful for development and except for one exception when working on the playground is all you need.

### Playground

Working on the playground requires the docs to be started.

```bash
pnpm run docs
```

When run this builds all packages and then watch for changes to rebuild as necessary.

<br />

## Pull Request (PR) Process

Once your work is complete you'll want to create a Pull Request to share all that goodness with the rest of us.

1. Create a [pull request](https://help.github.com/en/articles/creating-a-pull-request) using the github interface. The template will automatically populate for you.
2. Add a description and reference the issue this pull request addresses where applicable. The description will be used as the body of the git commit message since all pull request are squashed down into one commit before merging.
3. Tick off all relevant check boxes by placing an x between the square brackets i.e. `[ ]` to `[x]`.
4. Please add a screenshot where the change is related to the user interface or design. It makes it so much easier to grasp the intentions of your work. You can use your favourite GIF screenshare tool for creating animated screenshots.
5. Once submitted the PR will be addressed at our earliest convenience.

<br />

## Code style

Over time this project has accumulated quite an active set of lint rules.

The following are some personal preferences for coding style.

- Functions with more than two arguments should condense these arguments into a parameter object.
- Comment everything. Even if the comment is just to say, `I have no idea what I'm doing`, there is a lot of information in that comment.
- Choose simplicity over performance. Performance is abstract and it's often better to start with a simple implementation that can be made more performant, than something that's complex from day one.
- Use `const` **Arrow Functions** when declaring components.

```tsx
import React from 'react';

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

### Automated

The easiest way to create a new scoped package in this repo is to run `pnpm create:package NAME -- --description "DESCRIPTION"`. For example the following command would create a package called `@remirror/extension-chill`.

```bash
pnpm create:package @remirror/extension-chill -- --description "The time to be chill."
```

### Manually

If you prefer not to use the automated method for creating extension the following also works.

1. Copy `support/templates/extension-template` to `packages/remirror__extension-<name>`.
2. Rename `template`, `Template` and `TEMPLATE` in the new package to `<name>`, `<Name>` and `<NAME>`.
3. Replace `TEMPLATE_DESCRIPTION` with a suitable description.
4. Rename the files from `template-` to `<name>-`.

### Final steps

1. (OPTIONAL) -Add your name and email as a contributor to the `package.json`.
2. Add `packages/remirror/extension/<name>/package.json`.
3. Add `packages/remirror/src/extension/<name>.ts`.
4. Edit `packages/remirror/package.json` to add dependency and entrypoint.
5. (OPTIONAL) - Edit `/.changeset/config.json` and add the package name to the linked array.
6. Run `pnpm i` in root.

<br />

## Code of Conduct

<br />

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

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
- Publishing others' private information, such as a physical or electronic address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community. Examples of representing a project or community include using an official project e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event. Representation of a project may be further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at help@kickjump.co. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident. Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good faith may face temporary or permanent repercussions as determined by other members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant], version 1.4, available at [http://contributor-covenant.org/version/1/4][version]

[contributor covenant]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
[docusaurus]: https://v2.docusaurus.io/
[repo]: https://github.com/remirror/remirror
[husky]: https://github.com/typicode/husky
