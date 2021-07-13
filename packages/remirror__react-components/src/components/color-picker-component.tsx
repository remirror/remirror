/**
 * @module
 *
 * A color picker component which is used for menus.
 */

import type { FC } from 'react';
import { useCallback } from 'react';
import {
  Composite,
  CompositeGroup,
  CompositeItem,
  CompositeStateReturn,
  useCompositeState,
} from 'reakit/Composite';
import { Tooltip, TooltipReference, useTooltipState } from 'reakit/Tooltip';
import { cx } from '@remirror/core';
import { HuePalette, Palette, palette as defaultPalette } from '@remirror/extension-text-color';
import { useI18n } from '@remirror/react-core';
import { ComponentsTheme } from '@remirror/theme';

export interface ColorPickerProps {
  /**
   * The currently selected color if active.
   */
  selectedColor?: string;

  /**
   * Called when a color is selected.
   */
  onSelect: (color: string) => void;

  /**
   * The color palette to use.
   */
  palette?: Palette;
}

export const ColorPickerComponent = (props: ColorPickerProps): JSX.Element => {
  const { palette = defaultPalette, onSelect, selectedColor } = props;
  const { t } = useI18n();
  const compositeState = useCompositeState({ loop: true });
  const { black, transparent, white, hues } = palette(t);

  return (
    <Grid compositeState={compositeState}>
      <GridRow compositeState={compositeState}>
        <GridCell
          {...black}
          compositeState={compositeState}
          selected={black.color === selectedColor}
          onSelect={onSelect}
        />
        <GridCell
          {...white}
          compositeState={compositeState}
          selected={white.color === selectedColor}
          onSelect={onSelect}
        />
        <GridCell
          {...transparent}
          compositeState={compositeState}
          selected={transparent.color === selectedColor}
          onSelect={onSelect}
        />
      </GridRow>
      {Object.values(hues).map((hueMap, index) => (
        <ColorPickerHue
          {...hueMap}
          compositeState={compositeState}
          selectedColor={selectedColor}
          onSelect={onSelect}
          key={index}
        />
      ))}
    </Grid>
  );
};

interface ColorPickerHue extends HuePalette, CompositeStateProps {
  selectedColor?: string;
  /**
   * Called when a color is selected.
   */
  onSelect: (color: string) => void;
}

const ColorPickerHue = (props: ColorPickerHue) => {
  const { label, hues, compositeState, selectedColor, onSelect } = props;

  return (
    <>
      {label}
      <GridRow compositeState={compositeState}>
        {hues.map((hue, index) => (
          <GridCell
            {...hue}
            compositeState={compositeState}
            selected={hue.color === selectedColor}
            onSelect={onSelect}
            key={index}
          />
        ))}
      </GridRow>
    </>
  );
};

const Grid: FC<CompositeStateProps> = (props) => {
  return <Composite role='grid' {...props.compositeState} />;
};

interface CompositeStateProps {
  compositeState: CompositeStateReturn;
}

const GridRow: FC<CompositeStateProps> = (props) => {
  return <CompositeGroup role='row' {...props.compositeState} />;
};

interface GridCellProps extends CompositeStateProps {
  /**
   * Called when a color is selected.
   */
  onSelect: (color: string) => void;
  className?: string;
  color: string;
  label: string;
  selected: boolean;
}

const GridCell = (props: GridCellProps) => {
  const { color, label, selected, compositeState, onSelect, className } = props;
  const tooltipState = useTooltipState({ gutter: 5 });
  const onClick = useCallback(() => onSelect(color), [color, onSelect]);

  return (
    <>
      <TooltipReference {...tooltipState}>
        <CompositeItem
          as='div'
          role='gridcell'
          {...compositeState}
          style={{ backgroundColor: color }}
          className={cx(
            ComponentsTheme.COLOR_PICKER_CELL,
            className,
            selected && ComponentsTheme.COLOR_PICKER_CELL_SELECTED,
          )}
          onClick={onClick}
        />
      </TooltipReference>
      <Tooltip {...tooltipState}>{label}</Tooltip>
    </>
  );
};
