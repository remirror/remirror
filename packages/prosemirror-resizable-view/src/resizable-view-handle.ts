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
    this.dom.style.position = 'absolute';
    this.dom.style.pointerEvents = 'auto';
    this.dom.style.display = 'flex';
    this.dom.style.alignItems = 'center';
    this.dom.style.justifyContent = 'center';
    this.dom.style.zIndex = '100';

    this.#handle.style.opacity = '0';
    this.#handle.style.transition = 'opacity 300ms ease-in 0s';
    this.#handle.dataset.dragging = '';

    switch (type) {
      case ResizableHandleType.Right:
        {
          this.dom.style.right = '0px';
          this.dom.style.top = '0px';
          this.dom.style.height = '100%';
          this.dom.style.width = '15px';
          this.dom.style.cursor = 'col-resize';

          this.#handle.style.width = ' 4px';
          this.#handle.style.height = '36px';
          this.#handle.style.maxHeight = '50%';
          this.#handle.style.background = 'rgba(15, 15, 15, 0.5)';
        }
        break;
      case ResizableHandleType.Left:
        {
          this.dom.style.left = '0px';
          this.dom.style.top = '0px';
          this.dom.style.height = '100%';
          this.dom.style.width = '15px';
          this.dom.style.cursor = 'col-resize';

          this.#handle.style.width = ' 4px';
          this.#handle.style.height = '36px';
          this.#handle.style.maxHeight = '50%';
          this.#handle.style.background = 'rgba(15, 15, 15, 0.5)';
        }
        break;
      case ResizableHandleType.Bottom:
        {
          this.dom.style.bottom = '0px';
          this.dom.style.width = '100%';
          this.dom.style.height = '14px';
          this.dom.style.cursor = 'row-resize';

          this.#handle.style.width = ' 36px';
          this.#handle.style.height = '4px';
          this.#handle.style.maxWidth = '50%';
          this.#handle.style.background = 'rgba(15, 15, 15, 0.5)';
        }
        break;
      case ResizableHandleType.BottomRight:
        {
          this.dom.style.right = '0px';
          this.dom.style.bottom = '0px';
          this.dom.style.width = '30px';
          this.dom.style.height = '30px';
          this.dom.style.cursor = 'nwse-resize';
          this.dom.style.zIndex = '101';

          this.#handle.style.width = '18px';
          this.#handle.style.height = '18px';
          this.#handle.style.borderBottom = this.#handle.style.borderRight =
            '4px solid rgba(15, 15, 15, 0.5)';
        }
        break;
      case ResizableHandleType.BottomLeft:
        {
          this.dom.style.left = '0px';
          this.dom.style.bottom = '0px';
          this.dom.style.width = '30px';
          this.dom.style.height = '30px';
          this.dom.style.cursor = 'nesw-resize';
          this.dom.style.zIndex = '101';

          this.#handle.style.width = '18px';
          this.#handle.style.height = '18px';
          this.#handle.style.borderBottom = this.#handle.style.borderLeft =
            '4px solid rgba(15, 15, 15, 0.5)';
        }
        break;
    }

    this.dom.append(this.#handle);
  }

  setHandleDisplay(visible?: true | string): void {
    visible = visible || this.#handle.dataset.dragging;
    this.#handle.style.opacity = visible ? '1' : '0';
  }

  dataSetDragging(data?: string): void {
    this.#handle.dataset.dragging = data ?? '';
  }
}
