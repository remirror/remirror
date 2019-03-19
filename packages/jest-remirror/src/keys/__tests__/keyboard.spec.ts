import { Keyboard } from '../keyboard';
import { KeyboardEventName } from '../types';
import { SupportCharacters } from '../us-keyboard-layout';

let target: HTMLDivElement;
let keyboard: Keyboard;

beforeEach(() => {
  target = document.createElement('div');
  document.body.appendChild(target);
  keyboard = Keyboard.create({ target });
});

afterEach(() => {
  document.body.removeChild(target);
});

describe('char', () => {
  it('should fire all events for simple characters', () => {
    expect.assertions(4);
    const events: KeyboardEventName[] = [];
    const text = 'a';

    const listener = (event: KeyboardEvent) => {
      expect(event.key).toBe(text);
      events.push(event.type as KeyboardEventName);
    };

    target.addEventListener('keydown', listener);
    target.addEventListener('keyup', listener);
    target.addEventListener('keypress', listener);

    keyboard.char({ text });
    expect(events).toEqual(['keydown', 'keypress', 'keyup']);
  });

  it('it should not fire keypress for meta characters', () => {
    expect.assertions(3);
    const events: KeyboardEventName[] = [];
    const text = 'Control';

    const listener = (event: KeyboardEvent) => {
      expect(event.key).toBe(text);
      events.push(event.type as KeyboardEventName);
    };

    target.addEventListener('keydown', listener);
    target.addEventListener('keyup', listener);
    target.addEventListener('keypress', listener);

    keyboard.char({ text });
    expect(events).toEqual(['keydown', 'keyup']);
  });

  it('it should only fire keydown for Lock keys', () => {
    const events: KeyboardEventName[] = [];
    const text: SupportCharacters = 'CapsLock';

    const listener = (event: KeyboardEvent) => {
      expect(event.key).toBe(text);
      events.push(event.type as KeyboardEventName);
    };

    target.addEventListener('keydown', listener);
    target.addEventListener('keyup', listener);
    target.addEventListener('keypress', listener);

    keyboard.char({ text });
    expect(events).toEqual(['keydown']);
  });
});

describe('type', () => {
  it('should fire a keydown and keyup event for each key pressed', () => {
    const keys: Record<KeyboardEventName, string[]> = {
      keydown: ['t', 'e', 's', 't', 'i', 'n', 'g', 'Enter'],
      keypress: ['t', 'e', 's', 't', 'i', 'n', 'g', 'Enter'],
      keyup: ['t', 'e', 's', 't', 'i', 'n', 'g', 'Enter'],
    };

    const listener = (event: KeyboardEvent) => {
      expect(event.key).toBe(keys[event.type as KeyboardEventName].shift());
    };
    target.addEventListener('keydown', listener);
    target.addEventListener('keypress', listener);
    target.addEventListener('keyup', listener);

    keyboard.type({ text: 'testing\n' });
    expect(keys.keydown).toEqual([]);
    expect(keys.keypress).toEqual([]);
    expect(keys.keyup).toEqual([]);
  });
});

describe('batching', () => {
  beforeEach(() => {
    keyboard = new Keyboard({ target, batch: true });
  });

  it('will not run until end is called', () => {
    const text: SupportCharacters = 'R';
    let hasRun = false;

    const listener = (event: KeyboardEvent) => {
      expect(event.key).toBe(text);
      hasRun = true;
    };

    target.addEventListener('keydown', listener);

    keyboard.usChar({ text });
    expect(hasRun).toBeFalse();

    keyboard.end();
    expect(hasRun).toBeTrue();
  });
});

describe('mod', () => {
  it('can run modifiers', () => {
    const char = `R`;
    const text = `Shift-Meta-${char}`;
    let event: KeyboardEvent | undefined;

    const listener = (ev: KeyboardEvent) => {
      if (ev.key === char) {
        event = ev;
      }
    };

    target.addEventListener('keydown', listener);

    keyboard.mod({ text, options: {} });

    expect(event!.shiftKey).toBeTrue();
    expect(event!.metaKey).toBeTrue();
  });
});

test('start', () => {
  expect(keyboard.status).toBe('idle');
  keyboard.start();
  expect(keyboard.status).toBe('started');
});

test('end', () => {
  keyboard.end();
  expect(keyboard.status).toBe('idle');

  keyboard.start().end();
  expect(keyboard.status).toBe('ended');
});
