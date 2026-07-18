import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Lazy load Dashboard to optimize performance and prevent boot issues for regular visitors
const Dashboard = lazy(() => import('./dashboard.tsx'));

// Check if current route is the secret admin login path (robust substring match)
const isCmsRoute = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.includes('adminloginweb11') || 
    hash.includes('adminloginweb11') || 
    search.includes('adminloginweb11')
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCmsRoute() ? (
      <Suspense fallback={
        <div className="min-h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center font-mono p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-cyan-500 animate-ping"></div>
            <p className="text-sm tracking-wider uppercase">Loading CMS Portal...</p>
          </div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
