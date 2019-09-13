import { useEffectOnce, useSetState } from '@remirror/react-hooks';
import { useRemirrorTheme } from '@remirror/ui';
import React, { forwardRef } from 'react';

export type ContextMenuProps = JSX.IntrinsicElements['nav'];

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

export const ContextMenu = forwardRef<HTMLElement, ContextMenuProps>(({ children, ...props }, ref) => {
  const [state, setState, resetState] = useSetState<ContextMenuState>({ visible: false, x: 0, y: 0 });
  const { sx } = useRemirrorTheme();

  useEffectOnce(() => {
    const contextMenuListener = (event: MouseEvent) => {
      event.preventDefault();
      const { clientX, clientY } = event;
      setState({ visible: true, x: clientX, y: clientY });
    };

    const clickListener = (event: MouseEvent) => {
      event.preventDefault();
      resetState();
    };

    document.addEventListener('contextmenu', contextMenuListener);
    document.addEventListener('click', clickListener);

    return () => {
      document.removeEventListener('contextmenu', contextMenuListener);
      document.removeEventListener('click', clickListener);
    };
  });

  return (
    <nav
      role='menu'
      tabIndex={-1}
      ref={ref}
      {...props}
      css={sx({
        position: 'fixed',
        top: `${state.y}px`,
        left: `${state.x}px`,
      })}
    >
      {children}
    </nav>
  );
});

class CustomContext extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      x: 0,
      y: 0,
    };
  }

  public componentDidMount() {
    const self = this;
  }

  public returnMenu(items) {
    const myStyle = {
      position: 'absolute',
      top: `${this.state.y}px`,
      left: `${this.state.x + 5}px`,
    };

    return (
      <div className='custom-context' id='text' style={myStyle}>
        {items.map((item, index, arr) => {
          if (arr.length - 1 == index) {
            return (
              <div key={index} className='custom-context-item-last'>
                {item.label}
              </div>
            );
          } else {
            return (
              <div key={index} className='custom-context-item'>
                {item.label}
              </div>
            );
          }
        })}
      </div>
    );
  }
}
