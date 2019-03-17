// import { EditorView } from '@remirror/core';

// export class Keyboard {
//   private modifiers = 0;
//   private pressedKeys = new Set();

//   constructor(private view: EditorView) {
//     this.view = view;
//   }

//   public down(key, options = { text: undefined }) {
//     const description = this._keyDescriptionForString(key);

//     const autoRepeat = this.pressedKeys.has(description.code);
//     this.pressedKeys.add(description.code);
//     this.modifiers |= this._modifierBit(description.key);

//     const text = options.text === undefined ? description.text : options.text;
//     this._client.send('Input.dispatchKeyEvent', {
//       type: text ? 'keyDown' : 'rawKeyDown',
//       modifiers: this.modifiers,
//       windowsVirtualKeyCode: description.keyCode,
//       code: description.code,
//       key: description.key,
//       text,
//       unmodifiedText: text,
//       autoRepeat,
//       location: description.location,
//       isKeypad: description.location === 3,
//     });
//   }

//   public _modifierBit(key: string) {
//     if (key === 'Alt') {
//       return 1;
//     }
//     if (key === 'Control') {
//       return 2;
//     }
//     if (key === 'Meta') {
//       return 4;
//     }
//     if (key === 'Shift') {
//       return 8;
//     }
//     return 0;
//   }

//   public _keyDescriptionForString(keyString: string) {
//     const shift = this.modifiers & 8;
//     const description = {
//       key: '',
//       keyCode: 0,
//       code: '',
//       text: '',
//       location: 0,
//     };

//     const definition = keyDefinitions[keyString];
//     assert(definition, `Unknown key: "${keyString}"`);

//     if (definition.key) {
//       description.key = definition.key;
//     }
//     if (shift && definition.shiftKey) {
//       description.key = definition.shiftKey;
//     }

//     if (definition.keyCode) {
//       description.keyCode = definition.keyCode;
//     }
//     if (shift && definition.shiftKeyCode) {
//       description.keyCode = definition.shiftKeyCode;
//     }

//     if (definition.code) {
//       description.code = definition.code;
//     }

//     if (definition.location) {
//       description.location = definition.location;
//     }

//     if (description.key.length === 1) {
//       description.text = description.key;
//     }

//     if (definition.text) {
//       description.text = definition.text;
//     }
//     if (shift && definition.shiftText) {
//       description.text = definition.shiftText;
//     }

//     // if any modifiers besides shift are pressed, no text should be sent
//     if (this.modifiers & ~8) {
//       description.text = '';
//     }

//     return description;
//   }

//   public up(key) {
//     const description = this._keyDescriptionForString(key);

//     this.modifiers &= ~this._modifierBit(description.key);
//     this.pressedKeys.delete(description.code);
//     this._client.send('Input.dispatchKeyEvent', {
//       type: 'keyUp',
//       modifiers: this.modifiers,
//       key: description.key,
//       windowsVirtualKeyCode: description.keyCode,
//       code: description.code,
//       location: description.location,
//     });
//   }

//   public sendCharacter(char) {
//     this._client.send('Input.insertText', { text: char });
//   }

//   public type(text, options) {
//     let delay = 0;
//     if (options && options.delay) {
//       delay = options.delay;
//     }
//     for (const char of text) {
//       if (keyDefinitions[char]) {
//         this.press(char, { delay });
//       } else {
//         this.sendCharacter(char);
//       }
//       if (delay) {
//         new Promise(f => setTimeout(f, delay));
//       }
//     }
//   }

//   public press(key: string, options = {}) {
//     this.down(key, options);
//     this.up(key);
//   }
// }
