---
title: Tooling
hide_title: true
---

# Tooling

This document is a brief breakdown of the tools used when contributing to remirror and why these choices where made.

## Pnpm

> Visit [website](https://pnpm.js.org/)

I've recently started moving over several projects so use `pnpm` and I'm very happy with what I've seen so far.

- Great workspace support (modules are scoped to the package where they are installed).
- Fast.
- I like the colors in the CLI.
- Reduce multiple copies of node_modules being downloaded and installed on my machine.

## Preconstruct

> Visit [site](https://preconstruct.tools/)

This tool is amazing. I was looking at building my own custom solution to the woes I was facing manually managing the builds on a TypeScript monorepo project. Luckily I found this before I got too far. It solves all the issues I was having and more.

The build times on the project went from 4-5mins down to 30secs. And that's with an increase in packages from less than 30 to more than 70. So it's quite remarkable.
