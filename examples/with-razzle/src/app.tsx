import { css, Global } from '@emotion/core';
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { TwitterEditor, TwitterEditorWithContent } from './editors/twitter';
import { WysiwygEditor, WysiwygEditorWithContent } from './editors/wysiwyg';
import Home from './home';

const AppWrapper = () => (
  <Global
    styles={css`
      body {
        margin: 0;
        padding: 10px;
        font-family: sans-serif;
      }
    `}
  />
);

const App = () => (
  <>
    <AppWrapper />
    <Switch>
      <Route exact={true} path='/' component={Home} />
      <Route exact={true} path='/editors/wysiwyg' component={WysiwygEditor} />
      <Route exact={true} path='/editors/twitter' component={TwitterEditor} />
      <Route exact={true} path='/editors/wysiwyg/content' component={WysiwygEditorWithContent} />
      <Route exact={true} path='/editors/twitter/content' component={TwitterEditorWithContent} />
    </Switch>
  </>
);

export default App;
