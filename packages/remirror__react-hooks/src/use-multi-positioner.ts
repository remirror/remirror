import { RefCallback, useMemo, useRef, useState } from 'react';
import useLayoutEffect from 'use-isomorphic-layout-effect';
import usePrevious from 'use-previous';
import { omitUndefined } from '@remirror/core';
import {
  defaultAbsolutePosition,
  ElementsAddedProps,
  getPositioner,
  PositionerExtension,
  PositionerParam,
  PositionerPosition,
} from '@remirror/extension-positioner';
import { useExtension } from '@remirror/react-core';

export interface UseMultiPositionerReturn extends PositionerPosition {
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
}

/**
 * A positioner for your editor. This returns an array of active positions and
 * is useful for tracking the positions of multiple items in the editor.
 *
 * ```ts
 * import { Positioner } from 'remirror/extensions
 * import { useMultiPositioner } from '@remirror/react';
 *
 * const positioner = Positioner.create({
 *   ...config, // custom config
 * })
 *
 * const MenuComponent: FC = () => {
 *   const positions = usePositioner(positioner, []);
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
 * };
 * ```
 *
 * @param positioner - the positioner which will be used
 * @param deps - an array of dependencies which will cause the hook to rerender
 * with an updated positioner. This is the only way to update the positioner.
 */
export function useMultiPositioner(
  positioner: PositionerParam,
  deps: unknown[],
): UseMultiPositionerReturn[] {
  interface CollectElementRef {
    ref: RefCallback<HTMLElement>;
    id: string;
  }

  const [state, setState] = useState<ElementsAddedProps[]>([]);
  const [memoizedPositioner, setMemoizedPositioner] = useState(() => getPositioner(positioner));
  const [collectRefs, setCollectRefs] = useState<CollectElementRef[]>([]);
  const positionerRef = useRef(positioner);
  const previousPositioner = usePrevious(memoizedPositioner);

  positionerRef.current = positioner;

  useExtension(
    PositionerExtension,
    ({ addCustomHandler }) => {
      const positioner = getPositioner(positionerRef.current);
      const dispose = addCustomHandler('positioner', positioner);

      setMemoizedPositioner(positioner);

      return dispose;
    },
    deps,
  );

  // Add the positioner update handlers.
  useLayoutEffect(() => {
    const disposeUpdate = memoizedPositioner.addListener('update', (options) => {
      const items: CollectElementRef[] = [];

      for (const { id, setElement } of options) {
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

    const disposeDone = memoizedPositioner.addListener('done', (options) => {
      setState(options);
    });

    if (previousPositioner?.recentUpdate) {
      memoizedPositioner.onActiveChanged(previousPositioner?.recentUpdate);
    }

    return () => {
      disposeUpdate();
      disposeDone();
    };
  }, [memoizedPositioner, previousPositioner]);

  return useMemo(() => {
    const positions: UseMultiPositionerReturn[] = [];

    for (const [index, { ref, id: key }] of collectRefs.entries()) {
      const stateValue = state[index];
      const { element, position = {} } = stateValue ?? {};
      const absolutePosition = { ...defaultAbsolutePosition, ...omitUndefined(position) };

      positions.push({ ref, element, key, ...absolutePosition });
    }

    return positions;
  }, [collectRefs, state]);
}
