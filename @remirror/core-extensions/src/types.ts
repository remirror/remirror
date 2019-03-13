/**
 * FIXME: TS doesn't have a type for InputEvent yet since its not widely supported.
 * @see https://www.w3.org/TR/input-events-2/
 */
export interface InputEvent extends UIEvent {
  isComposing: boolean;
  inputType: 'deleteContentBackward' | 'insertText' | 'insertCompositionText';
  data: string | null;
}
