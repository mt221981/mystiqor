import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const CURRENT_CACHE_VERSION = '25.0.0';
const VERSION_KEY = 'app_cache_version';

export default function CacheBuster() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    if (storedVersion !== CURRENT_CACHE_VERSION) {
      console.log('[CacheBuster] 💣 v25.0.0 - REMOVED CLEANUP COMPONENT');
      
      try {
        queryClient.clear();
        queryClient.removeQueries();
        queryClient.invalidateQueries();
        
        try {
          localStorage.clear();
        } catch (e) {}
        
        try {
          sessionStorage.clear();
        } catch (e) {}
        
        if (window.indexedDB) {
          try {
            if (indexedDB.databases) {
              indexedDB.databases().then(dbs => {
                dbs.forEach(db => {
                  if (db.name) indexedDB.deleteDatabase(db.name);
                });
              });
            }
          } catch (e) {}
        }
        
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        
        localStorage.setItem(VERSION_KEY, CURRENT_CACHE_VERSION);
        
        const message = document.createElement('div');
        message.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          z-index: 999999;
          text-align: center;
        `;
        message.innerHTML = `
          <div style="font-size: 100px; margin-bottom: 30px;">✨</div>
          <div style="font-size: 40px;">מרענן...</div>
          <div style="font-size: 18px; margin-top: 15px; opacity: 0.9;">v25.0 - Cleanup Fix</div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
          window.location.reload(true);
        }, 2000);
        
      } catch (error) {
        localStorage.setItem(VERSION_KEY, CURRENT_CACHE_VERSION);
        setTimeout(() => window.location.reload(true), 1000);
      }
    }
  }, [queryClient]);

  return null;
}