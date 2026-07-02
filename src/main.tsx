import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { ChatStoreProvider } from './store/ChatStore';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ChatStoreProvider>
        <App />
      </ChatStoreProvider>
    </SettingsProvider>
  </StrictMode>
);
