import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { enableMockServiceWorker } from './mocks/browser.ts';
import { Providers } from './common/Providers.tsx';
import App from './App.tsx';
import { Providers } from './common/Providers.tsx';

enableMockServiceWorker().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  );
});
