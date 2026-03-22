import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ServerWaking from './components/server_waking/ServerWaking.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ServerWaking>
        <App />
      </ServerWaking>
    </ThemeProvider>
  </StrictMode>
);