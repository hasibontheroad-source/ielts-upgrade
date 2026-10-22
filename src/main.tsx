import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update for offline capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: New content available, updating cache.');
  },
  onOfflineReady() {
    console.log('PWA: IELTS Ready is fully cached and operational offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

