export enum ActionType {
  ADD_PLACEHOLDER,
  REMOVE_PLACEHOLDER,
  UPDATE_PLACEHOLDER,
}

interface AddPlaceholderAction {
  type: ActionType.ADD_PLACEHOLDER;
  id: string;
  payload: any;
  pos: number;
}

interface RemovePlaceholderAction {
  type: ActionType.REMOVE_PLACEHOLDER;
  id: string;
}

interface UpdatPlaceholderAction {
  type: ActionType.UPDATE_PLACEHOLDER;
  id: string;
  payload: any;
}

export type PlaceholderPluginAction =
  | AddPlaceholderAction
  | RemovePlaceholderAction
  | UpdatPlaceholderAction;

export interface PlaceholderPluginMeta {
  added: Array<Omit<AddPlaceholderAction, 'type'>>;
  removed: Array<Omit<RemovePlaceholderAction, 'type'>>;
  updated: Array<Omit<UpdatPlaceholderAction, 'type'>>;
}
