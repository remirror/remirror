import { RefCallback, useCallback, useEffect, useMemo, useState } from 'react';

import {
  ElementsAddedParameter,
  emptyVirtualPosition,
  getPositioner,
  Positioner,
  PositionerExtension,
  StringPositioner,
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
   * A key to uniquely identify this positioner.
   */
  key: string;
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
  useEffect(() => {
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

    const disposeElementsAdded = memoizedPositioner.addListener('done', (parameter) => {
      setState(parameter);
    });

    return () => {
      disposeUpdate();
      disposeElementsAdded();
    };
  }, [memoizedPositioner]);

  return collectRefs.map(({ ref, id: key }, index) => {
    const { element, position } = state[index] ?? {};
    const virtualPosition = { ...emptyVirtualPosition, ...position };
    const virtualNode = memoizedPositioner.getVirtualNode(virtualPosition);

    return { ref, element, key, virtualNode, ...position };
  });
}
