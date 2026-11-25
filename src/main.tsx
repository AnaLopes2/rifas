import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { App } from './App';
import { AppProvider } from './store/AppContext';
import './index.css';

// A versão de demonstração (npm run build:demo) usa rotas com "#" para abrir sem servidor.
const Router = import.meta.env.VITE_DEMO_BUILD === 'true' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <MotionConfig reducedMotion="user">
        <AppProvider>
          <App />
        </AppProvider>
      </MotionConfig>
    </Router>
  </StrictMode>,
);
