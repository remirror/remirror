export enum ActionType {
  ADD_PLACEHOLDER,
  REMOVE_PLACEHOLDER,
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

export type PlaceholderPluginAction = AddPlaceholderAction | RemovePlaceholderAction;
