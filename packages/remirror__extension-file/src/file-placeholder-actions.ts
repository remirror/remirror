export enum ActionType {
  ADD_PLACEHOLDER,
  REMOVE_PLACEHOLDER,
}

interface AddPlaceholderAction {
  type: ActionType.ADD_PLACEHOLDER;
  id: unknown;
  payload: any;
  pos: number;
}

interface RemovePlaceholderAction {
  type: ActionType.REMOVE_PLACEHOLDER;
  id: unknown;
}

export type PlaceholderPluginAction = AddPlaceholderAction | RemovePlaceholderAction;
