import { RefCallback, useCallback, useMemo, useState } from 'react';
import useLayoutEffect from 'use-isomorphic-layout-effect';

import {
  ElementsAddedParameter,
  emptyVirtualPosition,
  getPositioner,
  Positioner,
  PositionerExtension,
  StringPositioner,
  VirtualNode,
  VirtualPosition,
} from '@remirror/extension-positioner';
import { useExtension } from '@remirror/react';

export interface UseMultiPositionerReturn extends VirtualPosition {
  /**
   * This ref must be applied to the component that is being positioned in order
   * to correctly obtain the position data.
   */
  ref: RefCallback<HTMLElement>;

  /**
   * The element that that the ref has found.
   */
  element?: HTMLElement;

  /**
   * A key to uniquely identify this positioner. This can be applied to the
   * react element.
   */
  key: string;

  /**
   * A virtual node which can be used to represent the `virtualElement` in
   * libraries like `react-popper`.
   * @see https://popper.js.org/react-popper/v2/virtual-elements/
   *
   * It returns a `VirtualNode` which is a pseudo-element with a
   * `getBoundingClientRect()`  method for getting the fake position of the
   * element.
   *
   * ```tsx
   * import { usePositioner } from 'remirror/react/hooks';
   * import { usePopper } from 'react-popper';
   *
   * const PositionedComponent = () => {
   *   const { ref, element, virtualNode } = usePositioner('popup');
   *   const { styles, attributes } = usePopper(virtualNode, element);
   *
   *   return (
   *     <div ref={ref} style={styles.popper} {...attributes.popper}>
   *       Positioned With Popper ☺️
   *     </div>
   *   )
   * };
   * ```
   */
  virtualNode: VirtualNode;
}

export interface UsePositionerReturn extends Partial<UseMultiPositionerReturn> {
  /**
   * When `true`, the position is active and the pop should be displayed.
   */
  active: boolean;
}

/**
 * A positioner for your editor. This returns an array of active positions and
 * is useful for tracking the positions of multiple items in the editor.
 *
 * ```ts
 * import { Positioner } from 'remirror/extension/positioner
 * import { useMultiPositioner } from 'remirror/react';
 *
 * const positioner = Positioner.create({
 *   ...config, // custom config
 * })
 *
 * const MenuComponent: FC = () => {
 *   const positions = usePositioner(positioner);
 *
 *   return (
 *     <>
 *       {
 *         positions.map(({ ref, bottom, left, key }) => (
 *           <div style={{ bottom, left }} ref={ref} key={key}>
 *             <MenuIcon {...options} />
 *           </div>
 *         )
 *       }
 *     </>
 *   )
 * }
 * ```
 */
export function useMultiPositioner(
  positioner: Positioner | StringPositioner,
): UseMultiPositionerReturn[] {
  interface CollectElementRef {
    ref: RefCallback<HTMLElement>;
    id: string;
  }

  const [state, setState] = useState<ElementsAddedParameter[]>([]);
  const memoizedPositioner = useMemo(() => getPositioner(positioner), [positioner]);
  const [collectRefs, setCollectRefs] = useState<CollectElementRef[]>([]);

  useExtension(
    PositionerExtension,
    useCallback(
      (parameter) => {
        const { addCustomHandler } = parameter;
        return addCustomHandler('positioner', memoizedPositioner);
      },
      [memoizedPositioner],
    ),
    [],
  );

  // Add the positioner update handlers.
  useLayoutEffect(() => {
    const disposeUpdate = memoizedPositioner.addListener('update', (parameter) => {
      const items: CollectElementRef[] = [];

      for (const { id, setElement } of parameter) {
        const ref: RefCallback<HTMLElement> = (element) => {
          if (!element) {
            return;
          }

          setElement(element);
        };

        items.push({ id, ref });
      }

      setCollectRefs(items);
    });

    const disposeDone = memoizedPositioner.addListener('done', (parameter) => {
      setState(parameter);
    });

    return () => {
      disposeUpdate();
      disposeDone();
    };
  }, [memoizedPositioner]);

  return collectRefs.map(({ ref, id: key }, index) => {
    const { element, position } = state[index] ?? {};
    const virtualPosition = { ...emptyVirtualPosition, ...position };
    const virtualNode = memoizedPositioner.getVirtualNode(virtualPosition);

    return { ref, element, key, virtualNode, ...position };
  });
}
