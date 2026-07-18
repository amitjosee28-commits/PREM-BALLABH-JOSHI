import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Dashboard from './dashboard.tsx';
import './index.css';

// Check if current route is the secret admin login path
const isCmsRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/adminloginweb11' || 
    path === '/adminloginweb11/' || 
    path.endsWith('/adminloginweb11') || 
    path.endsWith('/adminloginweb11/') ||
    hash === '#/adminloginweb11' || 
    hash === '#adminloginweb11' || 
    search.includes('adminloginweb11')
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCmsRoute() ? <Dashboard /> : <App />}
  </StrictMode>,
);
