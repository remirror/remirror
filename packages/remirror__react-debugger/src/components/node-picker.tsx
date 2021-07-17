import styled from '@emotion/styled';
import { useEffect } from 'react';
import { isNumber } from '@remirror/core';

import { mainTheme } from '../debugger-constants';

const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' viewBox='0 0 1024 1024'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Crect width='1024' height='1024' fill='%237963D2' fill-rule='nonzero' rx='90'/%3E%3Cg transform='translate(17 90)'%3E%3Crect width='488' height='843' fill='%23FFF' fill-rule='nonzero' opacity='.15'/%3E%3Crect width='488' height='843' x='502' opacity='.5'/%3E%3Crect width='13' height='843' x='489' fill='%23FFF' fill-rule='nonzero'/%3E%3Cpath fill='%23FFF' fill-rule='nonzero' d='M636.45502 228.414115C676.811779 227.882026 716.492841 238.328573 750.855822 258.531588 760.907187 240.044158 780.906097 228.433201 802.730668 228.414115L855 228.414115 855 635C819.785592 635 792.526642 625.789073 773.223151 607.367219 754.451622 590.149574 743.972535 566.29284 744.267913 541.4476L744.267913 433.928221C744.604461 406.388055 733.215967 379.896443 712.709071 360.516881 692.968937 340.453858 665.290313 329.248546 636.45502 329.646471 611.572191 329.950275 587.667577 320.410859 570.418143 303.293682 552.008818 285.725156 542.869904 260.627262 543 228L636.45502 228.414115zM353.497692 228.414115C313.120511 227.882026 273.41937 238.328573 239.039002 258.531588 228.982551 240.044158 208.973521 228.433201 187.137907 228.414115L135 228.414115 135 635C170.232227 635 197.504969 625.789073 216.818229 607.367219 235.599256 590.149574 246.083645 566.29284 245.788118 541.4476L245.788118 433.928221C245.4514 406.388055 256.845657 379.896443 277.362929 360.516881 297.075807 340.492839 324.702489 329.291031 353.497692 329.646471 378.393111 329.950275 402.309821 320.410859 419.567983 303.293682 437.986623 285.725156 447.130162 260.627262 447 228L353.497692 228.414115z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

export interface NodePicker {
  active: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface NodePickerStyledProps {
  nodePicker: NodePicker;
}

interface NodePickerProps extends NodePickerStyledProps {
  onSelect: (target: Node) => void;
  onMouseMove: (target: Node) => void;
  onClose: () => void;
}

export const NodePicker = (props: NodePickerProps): JSX.Element => {
  const { onSelect, onClose, nodePicker, onMouseMove } = props;

  useEffect(() => {
    if (!nodePicker.active) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!nodePicker.active || !event.target) {
        return;
      }

      onMouseMove(event.target as Node);
    };

    const handleNodeClick = (event: MouseEvent) => {
      if (!nodePicker.active || !event.target) {
        return;
      }

      event.preventDefault();
      onSelect(event.target as Node);
    };

    const closePicker = () => {
      if (!nodePicker.active) {
        return;
      }

      onClose();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleNodeClick);
    document.addEventListener('keydown', closePicker);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleNodeClick);
      document.removeEventListener('keydown', closePicker);
    };
  }, [nodePicker.active, onClose, onMouseMove, onSelect]);

  return <NodePickerStyled nodePicker={nodePicker} />;
};

const NodePickerStyled = styled.div<NodePickerStyledProps>`
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  background: rgba(0, 0, 255, 0.3);
  z-index: 99999;
  cursor: pointer;

  transform: translateX(${(p) => p.nodePicker.left}px) translateY(${(p) => p.nodePicker.top}px);
  display: ${(p) => (isNumber(p.nodePicker.top) && isNumber(p.nodePicker.left) ? 'block' : 'none')};
  width: ${(p) => p.nodePicker.width}px;
  height: ${(p) => p.nodePicker.height}px;
`;

export const NodePickerTrigger = styled.div<{ isActive: boolean }>`
  position: absolute;
  right: 4px;
  top: -28px;
  width: 24px;
  height: 24px;
  border-radius: 3px;

  background-size: 20px 20px;
  background-repeat: none;
  background-position: 50% 50%;

  background: ${(p) => (p.isActive ? mainTheme.main : mainTheme.main60)} url('${icon}');

  &:hover {
    background-color: ${mainTheme.main80};
    cursor: pointer;
  }
`;
