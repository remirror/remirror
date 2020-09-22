import {
  BlockMarkupExtension,
  InlineMarkupExtension,
  MarkupContainerExtension,
  MarkupExtension,
  WrappingMarkupExtension,
} from './markup-extensions';

/**
 * The markup preset to be used.
 */
export function markupPreset(): MarkupPreset[] {
  return [
    new MarkupExtension(),
    new BlockMarkupExtension(),
    new InlineMarkupExtension(),
    new MarkupContainerExtension(),
    new WrappingMarkupExtension(),
  ];
}

export type MarkupPreset =
  | MarkupExtension
  | BlockMarkupExtension
  | InlineMarkupExtension
  | MarkupContainerExtension
  | WrappingMarkupExtension;
