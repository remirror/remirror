# Storybook

This is the storybook folder which provides a way for visualising the remirror components based on the code in the `/packages` folder. It was proving problematic to have all the stories located throughout the code base; the build was very very slow, and it crashed a lot.

To prevent this all stories are located within the `stories` folder.

It's slightly less convenient but a lot more practical.

## Usage

Run the following command to run build and run storybooks from either the root directory or this directory.

```bash
pnpm storybook
```
