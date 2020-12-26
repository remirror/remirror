import React from 'react';
import ReactDOM from 'react-dom';

import { DevTools } from './dev-tools';
import EditorStateContainer from './state/editor';

const DEVTOOLS_CLASS_NAME = '__prosemirror-dev-tools__';

function createPlace() {
  let place = document.querySelector(`.${DEVTOOLS_CLASS_NAME}`);

  if (!place) {
    place = document.createElement('div');
    place.className = DEVTOOLS_CLASS_NAME;
    document.body.append(place);
  } else {
    ReactDOM.unmountComponentAtNode(place);
    place.innerHTML = '';
  }

  return place;
}

function applyDevTools(editorView, props) {
  const place = createPlace();
  const editorState = new EditorStateContainer(editorView, props);

  ReactDOM.render(
    <Provider inject={[editorState]}>
      <DevTools />
    </Provider>,
    place,
  );
}

export default applyDevTools;
export { applyDevTools };
