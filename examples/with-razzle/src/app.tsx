import React from 'react';
import { Route, Switch } from 'react-router-dom';
import TwitterEditor from './editors/twitter';
import WysiwygEditor from './editors/wysiwyg';
import Home from './home';

import './app.css';

const App = () => (
  <Switch>
    <Route exact={true} path='/' component={Home} />
    <Route exact={true} path='/editors/wysiwyg' component={WysiwygEditor} />
    <Route exact={true} path='/editors/twitter' component={TwitterEditor} />
  </Switch>
);

export default App;
