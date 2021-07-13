import { range } from '@remirror/core';
import { I18n, MessageDescriptor } from '@remirror/i18n';
import { ExtensionTextColorMessages as Messages } from '@remirror/messages';
import { getTheme } from '@remirror/theme';

import {
  ColorPalette,
  ColorWithLabel,
  ColorWithLabelTuple,
  HuePalette,
  HuePaletteMap,
} from './text-color-types';

export const setTextColorOptions: Remirror.CommandDecoratorOptions = {
  icon: 'fontColor',
  description: ({ t }) => t(Messages.SET_COLOR_DESCRIPTION),
  label: ({ t }) => t(Messages.SET_COLOR_LABEL),
};

const hueRange = range([10]);

interface CreateHuePaletteProps {
  t: I18n['_'];
  name: keyof Remirror.ThemeHue;
  labelDescriptor: MessageDescriptor;
  hueDescriptor: MessageDescriptor;
}

function createHuePalette(props: CreateHuePaletteProps): HuePalette {
  const { t, name, labelDescriptor, hueDescriptor } = props;
  const label = t(labelDescriptor);
  const hues = hueRange.map((hue) => ({
    label: t(hueDescriptor, { hue }),
    color: getTheme((theme) => theme.hue[name][hue]),
  })) as ColorWithLabelTuple;

  return { label, hues };
}

/**
 * The default color palette which uses css properties to update the colors.
 */
export function palette(t: I18n['_']): ColorPalette {
  const black: ColorWithLabel = { label: t(Messages.BLACK), color: '#000' };
  const white: ColorWithLabel = { label: t(Messages.WHITE), color: '#fff' };
  const transparent: ColorWithLabel = { label: t(Messages.TRANSPARENT), color: 'transparent' };
  const hues: HuePaletteMap = {
    gray: createHuePalette({
      t,
      name: 'gray',
      labelDescriptor: Messages.GRAY,
      hueDescriptor: Messages.GRAY_HUE,
    }),
    blue: createHuePalette({
      t,
      name: 'blue',
      labelDescriptor: Messages.BLUE,
      hueDescriptor: Messages.BLUE_HUE,
    }),
    cyan: createHuePalette({
      t,
      name: 'cyan',
      labelDescriptor: Messages.CYAN,
      hueDescriptor: Messages.CYAN_HUE,
    }),
    grape: createHuePalette({
      t,
      name: 'grape',
      labelDescriptor: Messages.GRAPE,
      hueDescriptor: Messages.GRAPE_HUE,
    }),
    green: createHuePalette({
      t,
      name: 'green',
      labelDescriptor: Messages.GREEN,
      hueDescriptor: Messages.GREEN_HUE,
    }),
    indigo: createHuePalette({
      t,
      name: 'indigo',
      labelDescriptor: Messages.INDIGO,
      hueDescriptor: Messages.INDIGO_HUE,
    }),
    lime: createHuePalette({
      t,
      name: 'lime',
      labelDescriptor: Messages.LIME,
      hueDescriptor: Messages.LIME_HUE,
    }),
    orange: createHuePalette({
      t,
      name: 'orange',
      labelDescriptor: Messages.ORANGE,
      hueDescriptor: Messages.ORANGE_HUE,
    }),
    pink: createHuePalette({
      t,
      name: 'pink',
      labelDescriptor: Messages.PINK,
      hueDescriptor: Messages.PINK_HUE,
    }),
    red: createHuePalette({
      t,
      name: 'red',
      labelDescriptor: Messages.RED,
      hueDescriptor: Messages.RED_HUE,
    }),
    teal: createHuePalette({
      t,
      name: 'teal',
      labelDescriptor: Messages.TEAL,
      hueDescriptor: Messages.TEAL_HUE,
    }),
    violet: createHuePalette({
      t,
      name: 'violet',
      labelDescriptor: Messages.VIOLET,
      hueDescriptor: Messages.VIOLET_HUE,
    }),
    yellow: createHuePalette({
      t,
      name: 'yellow',
      labelDescriptor: Messages.YELLOW,
      hueDescriptor: Messages.YELLOW_HUE,
    }),
  };

  return { black, hues, transparent, white };
}

export const CSS_VAR_REGEX = /^var\((--[A-Za-z-]+)\);?/;
export const TEXT_COLOR_ATTRIBUTE = 'data-text-color-mark';
