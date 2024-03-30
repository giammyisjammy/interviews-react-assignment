import './index.css';
import './mocks/browser.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';

import { enableMockServiceWorker } from './mocks/browser.ts';
import fetcher from './helpers/fetcher.ts';

import App from './App.tsx';

enableMockServiceWorker().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SWRConfig value={{ fetcher }}>
        <App />
      </SWRConfig>
    </React.StrictMode>
  );
});
