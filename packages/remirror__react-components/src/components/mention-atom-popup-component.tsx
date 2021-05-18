import { ComponentType, FC, useEffect } from 'react';
import { cx, isEmptyArray } from '@remirror/core';
import { ReactComponentMessages as Messages } from '@remirror/messages';
import { useCommands, useI18n } from '@remirror/react-core';
import {
  MentionAtomNodeAttributes,
  MentionAtomState,
  useMentionAtom,
  UseMentionAtomProps,
  UseMentionAtomReturn,
} from '@remirror/react-hooks';
import { ExtensionMentionAtomTheme as Theme } from '@remirror/theme';

import { FloatingWrapper } from '../floating-menu';

interface MentionAtomPopupComponentProps<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> extends UseMentionAtomProps<Data> {
  /**
   * Called whenever the query state changes.
   */
  onChange: (mentionAtomState: MentionAtomState<Data> | null) => void;

  /**
   * The component to be used for rendering each item.
   */
  ItemComponent?: ComponentType<MentionAtomPopupItemComponentProps<Data>>;

  /**
   * The message that is displayed when there are no items to display.
   */
  ZeroItemsComponent?: ComponentType<object>;
}

interface UseMentionAtomChangeHandlerProps<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> {
  state: UseMentionAtomReturn<Data>['state'];
  onChange: MentionAtomPopupComponentProps<Data>['onChange'];
}

function useMentionAtomChangeHandler<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
>(props: UseMentionAtomChangeHandlerProps<Data>) {
  const { onChange, state } = props;

  useEffect(() => {
    onChange(state);
  }, [state, onChange]);
}

/**
 * This component renders the emoji suggestion dropdown for the user.
 */
export function MentionAtomPopupComponent<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
>(props: MentionAtomPopupComponentProps<Data>): JSX.Element {
  const { focus } = useCommands();
  const {
    onChange,
    ItemComponent = DefaultItemComponent,
    ZeroItemsComponent = DefaultZeroItemsComponent,
    ...hookProps
  } = props;
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } =
    useMentionAtom(hookProps);
  useMentionAtomChangeHandler({ state, onChange });

  return (
    <FloatingWrapper positioner='cursor' enabled={!!state} placement='auto-end' renderOutsideEditor>
      <div {...getMenuProps()} className={cx(Theme.MENTION_ATOM_POPUP_WRAPPER)}>
        {!!state && isEmptyArray(hookProps.items) ? (
          <ZeroItemsComponent />
        ) : (
          hookProps.items.map((item, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={item.id}
                className={cx(
                  Theme.MENTION_ATOM_POPUP_ITEM,
                  isHighlighted && Theme.MENTION_ATOM_POPUP_HIGHLIGHT,
                  isHovered && Theme.MENTION_ATOM_POPUP_HOVERED,
                )}
                {...getItemProps({
                  onClick: () => {
                    state?.command(item);
                    focus();
                  },
                  item,
                  index,
                })}
              >
                <ItemComponent item={item} state={state} />
              </div>
            );
          })
        )}
      </div>
    </FloatingWrapper>
  );
}

interface MentionAtomPopupItemComponentProps<
  Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes,
> {
  item: Data;
  state: UseMentionAtomReturn<Data>['state'];
}

function DefaultItemComponent<Data extends MentionAtomNodeAttributes = MentionAtomNodeAttributes>(
  props: MentionAtomPopupItemComponentProps<Data>,
) {
  return <span className={Theme.MENTION_ATOM_POPUP_NAME}>{props.item.label}</span>;
}

const DefaultZeroItemsComponent: FC = () => {
  const { t } = useI18n();
  return <span className={Theme.MENTION_ATOM_ZERO_ITEMS}>{t(Messages.NO_ITEMS_AVAILABLE)}</span>;
};
