const observers = new Map<HTMLElement, true>();

export const fakeResizeObserverPolyfill = Object.freeze({
  observe: jest.fn((el: HTMLElement) => observers.set(el, true)),
  unobserve: jest.fn((el: HTMLElement) => observers.delete(el)),
  disconnect: jest.fn(() => observers.clear()),
});

let callback: any;
const defaultBounds = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };

export const triggerChange = (
  bounds: Partial<typeof defaultBounds> = Object.create(null),
  el: HTMLElement,
) => {
  const target = observers.get(el);

  if (callback && target) {
    callback([Object.freeze({ target, contentRect: { defaultBounds, ...bounds } })]);
  }
};

export default jest.fn(cb => {
  callback = cb;
  return fakeResizeObserverPolyfill;
});
