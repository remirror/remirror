import React from 'react';
import { hydrate } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './app';

hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept();
}
