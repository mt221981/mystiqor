import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * SECURITY VALIDATOR
 * בדיקות אבטחה אוטומטיות
 */

export default function SecurityValidator() {
  useEffect(() => {
    // 1. Check for XSS vulnerabilities in localStorage
    try {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /onerror=/i,
        /onclick=/i
      ];

      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (suspiciousPatterns.some(pattern => pattern.test(value))) {
          console.warn('⚠️ Suspicious content in localStorage:', key);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('localStorage security check failed:', error);
    }

    // 2. Validate session integrity
    const validateSession = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        const sessionId = sessionStorage.getItem('analytics_session_id');
        
        if (!isAuth && sessionId) {
          // User logged out but session exists - clean up
          sessionStorage.clear();
        }
      } catch (error) {
        console.error('Session validation error:', error);
      }
    };

    validateSession();

    // 3. Content Security Policy validation
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      console.warn('⚠️ CSP header not found - consider adding for security');
    }

    // 4. Check for mixed content
    if (window.location.protocol === 'https:') {
      const images = document.querySelectorAll('img[src^="http:"]');
      if (images.length > 0) {
        console.warn('⚠️ Mixed content detected:', images.length, 'HTTP images');
      }
    }

    // 5. Validate user input sanitization
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          const value = input.value;
          
          // Basic XSS check
          if (/<script|javascript:|onerror=/i.test(value)) {
            e.preventDefault();
            console.error('⚠️ Suspicious input detected');
            alert('קלט לא תקין זוהה. נא להזין טקסט רגיל בלבד.');
          }
        });
      });
    });

  }, []);

  useEffect(() => {
    // 6. Monitor for clickjacking attempts
    if (window.self !== window.top) {
      console.warn('⚠️ Page loaded in iframe - potential clickjacking');
    }

    // 7. Check for unsafe inline scripts
    const scripts = document.querySelectorAll('script:not([src])');
    if (scripts.length > 5) {
      console.warn('⚠️ Many inline scripts detected:', scripts.length);
    }

  }, []);

  return null;
}