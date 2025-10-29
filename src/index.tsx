import React from 'react';
import ReactDOM from 'react-dom/client';
import { client } from '@/client/client.gen';
import App from './App';

if (import.meta.env.DEV) {
  client.setConfig({
    baseUrl: 'http://localhost:3000/api',
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
