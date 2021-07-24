import { setStyle } from '@remirror/core-utils';

export enum ResizableHandleType {
  Right,
  Left,
  Bottom,
  BottomRight,
  BottomLeft,
}
export class ResizableHandle {
  dom: HTMLDivElement;
  #handle: HTMLDivElement;
  type: ResizableHandleType;

  constructor(type: ResizableHandleType) {
    const wrapper = document.createElement('div');
    const handle = document.createElement('div');
    this.dom = wrapper;
    this.#handle = handle;
    this.type = type;
    this.createHandle(type);
  }

  createHandle(type: ResizableHandleType): void {
    setStyle(this.dom, {
      position: 'absolute',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '100',
    });

    setStyle(this.#handle, {
      opacity: '0',
      transition: 'opacity 300ms ease-in 0s',
    });

    this.#handle.dataset.dragging = '';

    switch (type) {
      case ResizableHandleType.Right:
        setStyle(this.dom, {
          right: '0px',
          top: '0px',
          height: '100%',
          width: '15px',
          cursor: 'col-resize',
        });

        setStyle(this.#handle, {
          width: ' 4px',
          height: '36px',
          maxHeight: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.Left:
        setStyle(this.dom, {
          left: '0px',
          top: '0px',
          height: '100%',
          width: '15px',
          cursor: 'col-resize',
        });

        setStyle(this.#handle, {
          width: ' 4px',
          height: '36px',
          maxHeight: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.Bottom:
        setStyle(this.dom, {
          bottom: '0px',
          width: '100%',
          height: '14px',
          cursor: 'row-resize',
        });

        setStyle(this.#handle, {
          width: ' 36px',
          height: '4px',
          maxWidth: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.BottomRight:
        setStyle(this.dom, {
          right: '0px',
          bottom: '0px',
          width: '30px',
          height: '30px',
          cursor: 'nwse-resize',
          zIndex: '101',
        });

        setStyle(this.#handle, {
          width: '18px',
          height: '18px',
          borderBottom: '4px solid rgba(15, 15, 15, 0.5)',
          borderRight: '4px solid rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.BottomLeft:
        setStyle(this.dom, {
          left: '0px',
          bottom: '0px',
          width: '30px',
          height: '30px',
          cursor: 'nesw-resize',
          zIndex: '101',
        });

        setStyle(this.#handle, {
          width: '18px',
          height: '18px',
          borderBottom: '4px solid rgba(15, 15, 15, 0.5)',
          borderLeft: '4px solid rgba(15, 15, 15, 0.5)',
        });

        break;
    }

    this.dom.append(this.#handle);
  }

  setHandleVisibility(visible: boolean): void {
    const isVisible = visible || !!this.#handle.dataset.dragging;
    this.#handle.style.opacity = isVisible ? '1' : '0';
  }

  dataSetDragging(isDraging: boolean): void {
    this.#handle.dataset.dragging = isDraging ? 'true' : '';
  }
}
