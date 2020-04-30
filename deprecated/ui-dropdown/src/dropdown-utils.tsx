import { DropdownPosition } from './dropdown-types';

const transformer = {
  right: 'left',
  left: 'right',
  above: 'below',
  below: 'above',
} as const;

type Transformation = keyof typeof transformer;

export const transformDropdownPosition = (
  dropdownPosition: DropdownPosition,
  to: Transformation,
): DropdownPosition => dropdownPosition.replace(transformer[to], to) as DropdownPosition;
