---
hide_title: true
title: Priority
---

# Priority

The order of extensions matters. By default, extensions are ordered by their placement when creating a new extension. The extensions that appear earlier in the array are given a higher priority. In other words the lower the array index the higher the priority. Extensions operate on a first come, first served basis.

Sometimes you need fine grained control over the running order of certain extension. For example, you might define a keybinding in a custom extension which intercepts the `Enter` key. However, perhaps another extension you're using also provides a keybinding for the `Enter` key. If that other extension appears earlier in the list of provided extensions then it will be preferred.

To ensure your extension is given a higher priority you can use the `ExtensionPriority` enum.

The higher the priority, the earlier the extension will be run. An extension with a priority of `10` will be run before an extension with a priority of `5`.

```ts
import { ExtensionPriority } from 'remirror';

import { CustomExtension } from './my/custom/extension';

const customExtension = new CustomExtension({ priority: ExtensionPriority.High });
```

Now your customExtension will have a priority level that's higher than other extensions and will be run prior to other extensions.

If you have full control of the extension you can also set the `defaultPriority` as a static property with the `extension.

```ts
import { Extension, extensionDecorator, ExtensionPriority } from 'remirror';

@extensionDecorator({
  // Now every custom extension created will have a `High` priority than default.
  defaultPriority: ExtensionPriority.High,
})
class CustomExtension extends Extension {
  get name() {
    return 'custom' as const;
  }

  createKeymap() {
    return {
      Enter: () => {
        // Made up method
        return changeTheWorld();
      },
    };
  }
}
```

### Order of marks

Most of the time the order of marks is unimportant. Whether a `<strong />` tag wraps an `<em />` tag or visa versa has little impact on the user experience. However in some cases, as with links (anchor tags, `<a />`) it can lead to odd behaviour.

The following is one statement where the user has created a link and afterward gone and made some of the text bold. Unfortunately the bold is given priority and wraps the anchor tag causing the link to be broken around the `<strong />` tag in the html. The behaviour is consistent but it does look wrong.

```html
<p class="">
  <a href="https://google.com" rel="noopener noreferrer nofollow">This </a>
  <strong><a href="https://google.com" rel="noopener noreferrer nofollow">IS</a></strong>
  <a href="https://google.com" rel="noopener noreferrer nofollow"> a link</a>
</p>
```

To solve this we just need to ensure that the anchor tag appears in the the schema first and hence receives priority over all other marks. There are a few ways of ensuring this is the case depending on your scenario.

#### Full control of extensions

If you have full control of the extensions within your editor then you can place the link extension before the bold extension when creating the manager.

```ts
import { RemirrorManager } from 'remirror';
import { BoldExtension, LinkExtension } from 'remirror/extensions';

const manager = RemirrorManager.create(() => [new LinkExtension(), new BoldExtension()]);
```

The link extension appears before the bold extension and hence is given priority.

#### Partial control of extensions

Maybe you're using a preset which already has the bold extension and you still want control of the priority. You can accomplish this by setting the priority when creating the extension.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { LinkExtension } from 'remirror/extensions';

// Set the priority for the extension.
RemirrorManager.create([new LinkExtension({ priority: ExtensionPriority.High })]);
```

You can also set the priority of an extension to `ExtensionPriority.Low`, if you want it to appear afterwards.

#### Set priority via the manager

It is also possible to set the extension priority via the manager settings by specifying the name.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { WysiwygPreset } from 'remirror/extensions';

const manager = RemirrorManager.create([new WysiwygPreset()], {
  priority: { link: ExtensionPriority.High, bold: ExtensionPriority.Low },
});
```

The priority is passed into the extension when being run by the manager and the `link` is given a higher priority than the `bold` extension.

#### Set priority via the preset

The preset has a similar API as the manager for setting the extension priority.

```ts
import { ExtensionPriority, RemirrorManager } from 'remirror';
import { WysiwygPreset } from 'remirror/editor/wysiwyg';

const wysiwygPreset = new WysiwygPreset({
  priority: { link: ExtensionPriority.High, bold: ExtensionPriority.Low },
});
```

When the preset is used it will have the same effect on the priority as the other solutions.

#### Result

Now the wrapping makes a lot more sense because the editor prioritises the `link` extension which appears earlier in the schema.

```html
<p class="">
  <a href="https://google.com" rel="noopener noreferrer nofollow">This<strong>IS</strong> a link</a>
</p>
```

## API

### ExtensionPriority

The priority of extension which determines what order it is loaded into the editor.

Import from `remirror/core`.

```ts
import { ExtensionPriority } from 'remirror';
```

Higher priority extension (higher numberic value) will ensure the extension has a higher preference in your editor. In the case where you load two identical extensions into your editor (same name, or same constructor), the extension with the higher priority is the one that will be loaded.

The higher the numeric value the higher the priority. The priority can also be passed a number but naming things in this `enum` should help provide some context to the numbers.

By default all extensions are created with `ExtensionPriority.Default`.

#### Properties

| **Property** | **Value** | **Description** |
| --- | --- | --- |
| `Lowest` | `0` | This is useful for extensions that exist to be overridden. In theory you could go lower, but why? |
| `Low` | `10` | This is the priority used for extensions that want to be run last. |
| `Default` | `100` | This is the **default** priority for all extensions, unless otherwise specified. |
| `Medium` | `1_000` | A medium priority extension. This is typically all you need to give your extension a higher priority. |
| `High` | `10_000` | The highest priority level that should be used in a publicly shared extension (to allow some wiggle room for downstream users overriding priorities) |
| `Highest` | `100_000` | A, like super duper, high priority. This is used by some of the builtin extensions like the `SchemaExtension` and `TagExtension` |
| `Critical` | `1_000_000` | This is not used by any of the internal code and should only be used with great care. Basically, use this **never** 😉 |
