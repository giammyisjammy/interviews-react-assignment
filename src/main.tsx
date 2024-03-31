import './index.css';
import './mocks/browser.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { enableMockServiceWorker } from './mocks/browser.ts';

import App from './App.tsx';

enableMockServiceWorker().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
