---
hide_title: true
title: Naming Conventions
---

# Naming Conventions

This document is for extension developers who wish to create their own extensions.

## Interfaces

Destructured object parameter is postfixed with `Props`. For interfaces with a single property e.g. `EditorViewProp` the postfix is the singular `Prop` to signify that the interface is designed to be composed with other interfaces.

## Extensions

- Packages must supply the following keywords - `remirror`, `extension`.
- Packages should be named `remirror-extension-[NAME]`.
  - The name should be hyphen deliniated `remirror-extension-new-rules` to separate words.
- Should export a named extension which uses the pascal version of the npm package name.
  - `remirror-extension-custom` should export `CustomExtension`.
  - `remirror-extension-new-rules` should export `NewRulesExtension.`
- Extensions that only support a specific framework should use the pattern `remirror-extension-[FRAMEWORK]-[NAME].
  - `remirror-extension-react-toggle-button` and exports `ReactToggleButtonExtension`.
  - `remirror-extension-angular-split` and exports `AngularSplitExtension`.
- Extensions which take options should export their options interface. The name should replace `Extension` from the exported extension class with `Options`.
  - `remirror-extension-awesome` becomes `AwesomeOptions`.
  - This is not a hard requirement and can be ignored when there are naming conflicts.

## Presets

- Packages must supply the following keywords - `remirror`, `preset`.
- Packages should be named `remirror-preset-[NAME]`.
  - The name should be hyphen deliniated `remirror-preset-new-rules` to separate words.
- Should export a named preset which uses the pascal version of the npm package name.
  - `remirror-preset-custom` should export `CustomPreset`.
  - `remirror-preset-new-rules` should export `NewRulesPreset`.
- Presets that only support a specific framework should use the pattern `remirror-preset-[FRAMEWORK]-[NAME].
  - `remirror-preset-react-toggle-button` and exports `ReactToggleButtonPreset`.
  - `remirror-preset-angular-split` and exports `AngularSplitPreset`.
- Presets which take options should export their options interface. The name should replace `Preset` from the exported preset class with `Options`.
  - `remirror-preset-awesome` becomes `AwesomeOptions`.
- Presets which also export extensions should follow the naming conventions highlighted in the extension section.
