// import { EditorView } from 'prosemirror-view';
// import React, { MouseEventHandler, SFC } from 'react';
// import { styled } from '../styled';

// const BarWrapper = styled.div`
//   margin-bottom: 5px;
//   display: flex;
//   align-items: baseline;

//   .button:hover {
//     color: #000;
//     background: #f6f6f6;
//   }

//   .button.active {
//     color: #000;
//   }

//   .button:disabled {
//     color: #ccc;
//   }
// `;

// const GroupSpan = styled.span`
//   margin-right: 5px;
// `;

// const Button = styled.button<{
//   active?: boolean;
//   onMouseDown: MouseEventHandler<HTMLButtonElement>;
// }>`
//   background: white;
//   border: none;
//   font-size: inherit;
//   cursor: pointer;
//   color: ${props => (props.active ? props.theme.colors.dark : props.theme.colors['grey-font'])};
//   border-radius: 0;
//   padding: 5px 10px;
//   &:hover {
//     color: black;
//     background: #f6f6f6;
//   }
//   &:disabled {
//     color: #ccc;
//   }
// `;

// interface IProps {
//   menu: EditorMenu;
//   // state: EditorState<EditorSchema>;
//   view: EditorView<EditorSchema>;
//   // dispatch(tr: Transaction): void;
// }

// export const MenuBar: SFC<IProps> = ({ menu, children, view }) => {
//   const { dispatch, state } = view;
//   const onMenuMouseDown = (item: MenuItemSpecJSX): MouseEventHandler<HTMLButtonElement> => e => {
//     e.preventDefault();
//     if (item.run) {
//       item.run(state, dispatch, view, e.nativeEvent);
//     }
//   };
//   return (
//     <BarWrapper>
//       {children && <GroupSpan>{children}</GroupSpan>}
//       {map(menu, (group, groupKey) => (
//         <GroupSpan key={groupKey}>
//           {map(group, (item, itemKey) => (
//             <Button
//               key={itemKey}
//               type='button'
//               active={item.active ? item.active(state) : false}
//               disabled={item.enable ? !item.enable(state) : false}
//               title={typeof item.title === 'string' ? item.title : ''}
//               aria-label={typeof item.title === 'string' ? item.title : ''}
//               onMouseDown={onMenuMouseDown(item)}
//             >
//               {item.content}
//             </Button>
//           ))}
//         </GroupSpan>
//       ))}
//     </BarWrapper>
//   );
// };

// export default MenuBar;
