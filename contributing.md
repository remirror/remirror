# Contributing

<br />

## Getting Started

Fork [this respository](https://github.com/ifiokjr/remirror), clone your fork and add this repository as the upstream remote.

```bash
git clone <<FORKED_REPO_URL>>
git remote add upstream https://github.com/ifiokjr/remirror

yarn ## Install all dependencies

git checkout -b BRANCH_NAME # Checkout a branch and start working on it
```

To work on examples or the documentation website run:

```bash
yarn dev:docs
```

Once the build completes (can take a minute the first time) navigate to http://localhost:3000 (or another port if that one is already being used).

The documentation is written using [docz](https://docz.site) and all files and dependencies are available in the `/docs/` subdirectory. To add a new dependency, you will need to add it to `/docs/package.json` and not the top level package.json file.

<br />

## Testing

Unit tests can be run with the following commands.

```bash
yarn test # Unit Test
yarn test:e2e # Unit + Integration Tests on chrome
```

Create tests inside of a `__tests__/` subfolder.

**For naming conventions, use the following.**

- Unit tests: `*.spec.ts(x)`
- Integration tests: `*.puppeteer.ts` within the e2e folder

Integration testing uses puppeteer to run browser tests in chrome. See an example in `/docs/editors/__tests__/editor-twitter.test.ts`

Currently the testing strategy for remirror is being worked out. The test coverage is a measly 30% and a lot of work needs to be done to bring this to an acceptable level.

Despite this, I do recommend that you add integration testing using puppeteer to ensure that changes you made don't break the build.

<br />

## Gitflow

I recommend that while working on your code you commit early and often. You won't be judged. All worked submitted in a pull request (see following section) will be squashed into one commit before merging.

Remirror by default using [husky](https://github.com/typicode/husky) for git hooks which run

- Before each commit (lint and test changed files)
- Before each push (lint, typecheck and test)
- After a merge (install)

This can be annoying when attempting proof of concept work. If you'd like to turn it off run the following command.

```bash
yarn stop:hooks
```

This copies the `support/.config.sample.json` to `.config.json`. After this change your git commits and git pushes won't be checked for errors.

If you would like to resume per-commit and per-push checking simply run

```bash
yarn start:hooks
```

<br />

## Pull Request (PR) Process

Once your work is complete you'll want to create a Pull Request to share all that goodness with the rest of us.

1. Create a [pull request](https://help.github.com/en/articles/creating-a-pull-request) using the github interface. The template will automatically populate for you.
2. Add a description and reference the issue this pull request addresses where applicable. The description will be used as the body of the git commit message since all pull request are squashed down into one commit before merging.
3. Tick off all relevant check boxes by placing an x between the square brackets i.e. `[ ]` to `[x]`.
4. Please add a screenshot where the change is related to the user interface or design. It makes it so much easier to grasp the intentions of your work. You can use your favourite GIF screenshare tool for creating animated screenshots.
5. Once submitted the PR will be addressed at our earliest convenience.

<br />

## Project Management

When contributing to this repository, please first discuss the change you wish to make by opening a GitHub issue after checking whether a similar one already exists.

Remirror is managed using [GitHub issues](https://github.com/ifiokjr/remirror/issues) and [zenhub](https://www.zenhub.com) which provides a layer of tooling built on GitHub issues. If you'd like an enhanced experience while working on this project you can install the [extension](https://www.zenhub.com/extension) and after that navigate to the [board](https://github.com/ifiokjr/remirror/issues#workspaces/remirror-5c7c72fbbb593f1d1bd53c39/boards?repos=166780923).

A sample task board looks something like this.
![Task Board](https://dxssrr2j0sq4w.cloudfront.net/3.2.0/img/slider/zenhub-task-board.jpg).

You can follow what tasks are currently being worked on, who's picked up what, and the difficulty I feel is involved in any issue (story points).

<br />

## Code of Conduct

<br />

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at help@kickjump.co. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
