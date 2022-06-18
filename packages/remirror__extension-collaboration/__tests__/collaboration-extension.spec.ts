import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { CollaborationExtension, CollaborationOptions } from '../src';

extensionValidityTest(CollaborationExtension, { clientID: 'abc' });

function create(options: Partial<CollaborationOptions> = {}) {
  const collabExtension = new CollaborationExtension({
    clientID: 1,
    ...options,
  });

  if (options.onSendableReceived) {
    collabExtension.addHandler('onSendableReceived', options.onSendableReceived);
  }

  return renderEditor([collabExtension]);
}

describe('getSendableSteps', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const expectedSteps = [
    {
      from: 0,
      slice: {
        content: [
          {
            content: [
              {
                text: 'Initial state',
                type: 'text',
              },
            ],
            type: 'paragraph',
          },
        ],
      },
      stepType: 'replace',
      to: 2,
    },
    {
      from: 14,
      slice: {
        content: [
          {
            text: ' update 1',
            type: 'text',
          },
        ],
      },
      stepType: 'replace',
      to: 14,
    },
    {
      from: 23,
      slice: {
        content: [
          {
            text: ' update 2',
            type: 'text',
          },
        ],
      },
      stepType: 'replace',
      to: 23,
    },
  ];

  it('should debounce calls to the onSendableReceived handler', () => {
    const handleSendableReceived = jest.fn();

    const {
      nodes: { doc, p },
      add,
      commands,
    } = create({ onSendableReceived: handleSendableReceived });

    add(doc(p('Initial state<cursor>')));

    jest.advanceTimersByTime(100);
    commands.insertText(' update 1');

    jest.advanceTimersByTime(100);
    commands.insertText(' update 2');

    jest.advanceTimersByTime(1000);

    expect(handleSendableReceived).toHaveBeenCalledOnce();
    expect(handleSendableReceived).toHaveBeenCalledWith({
      sendable: expect.any(Object),
      jsonSendable: {
        clientID: 1,
        version: 0,
        steps: expectedSteps,
      },
    });
  });

  it('should allow me to flush the steps on demand', () => {
    const handleSendableReceived = jest.fn();

    const {
      nodes: { doc, p },
      add,
      commands,
    } = create({ onSendableReceived: handleSendableReceived });

    add(doc(p('Initial state<cursor>')));

    jest.advanceTimersByTime(100);
    commands.insertText(' update 1');

    jest.advanceTimersByTime(100);
    commands.insertText(' update 2');

    expect(handleSendableReceived).not.toHaveBeenCalled();

    commands.flushSendableSteps();
    expect(handleSendableReceived).toHaveBeenCalledOnce();
    expect(handleSendableReceived).toHaveBeenCalledWith({
      sendable: expect.any(Object),
      jsonSendable: {
        clientID: 1,
        version: 0,
        steps: expectedSteps,
      },
    });
  });
});
