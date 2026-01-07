import { useEffect } from 'react';

/**
 * ACCESSIBILITY ENHANCER
 * שיפורי נגישות אוטומטיים
 */

export default function AccessibilityEnhancer() {
  useEffect(() => {
    // 1. Add skip to main content link
    if (!document.querySelector('[href="#main-content"]')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'דלג לתוכן הראשי';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-50 focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // 2. Ensure all images have alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      console.warn('⚠️ Image missing alt text:', img.src);
      img.alt = 'תמונה ללא תיאור';
    });

    // 3. Add aria-labels to buttons without text
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      if (!button.textContent.trim() && button.querySelector('svg')) {
        const iconName = button.querySelector('svg')?.getAttribute('class') || 'כפתור';
        button.setAttribute('aria-label', iconName);
      }
    });

    // 4. Keyboard navigation enhancement
    const handleKeyDown = (e) => {
      // ESC to close modals
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
          const closeButton = modal.querySelector('button[aria-label*="סגור"], button[aria-label*="close"]');
          closeButton?.click();
        });
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="חפש"]');
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // 5. Focus management for modals
    const focusTrap = (modalElement) => {
      const focusableElements = modalElement.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      modalElement.addEventListener('keydown', handleTabKey);
      firstElement.focus();

      return () => {
        modalElement.removeEventListener('keydown', handleTabKey);
      };
    };

    // Observe for new modals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.getAttribute('role') === 'dialog') {
            focusTrap(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 6. Announce dynamic content changes to screen readers
    const createLiveRegion = () => {
      if (document.getElementById('live-region')) return;
      
      const liveRegion = document.createElement('div');
      liveRegion.id = 'live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    };

    createLiveRegion();

    // 7. Ensure proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (index > 0 && level > lastLevel + 1) {
        console.warn('⚠️ Heading hierarchy skip:', lastLevel, '→', level);
      }
      lastLevel = level;
    });

    // 8. Color contrast checker (basic)
    const checkContrast = () => {
      const elements = document.querySelectorAll('[class*="text-"]');
      let lowContrastCount = 0;
      
      elements.forEach(el => {
        const color = window.getComputedStyle(el).color;
        const bgColor = window.getComputedStyle(el).backgroundColor;
        
        // Simple check - in production would use WCAG algorithm
        if (color === bgColor) {
          lowContrastCount++;
        }
      });

      if (lowContrastCount > 0) {
        console.warn('⚠️ Potential low contrast elements:', lowContrastCount);
      }
    };

    setTimeout(checkContrast, 2000);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, []);

  return null;
}

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const liveRegion = document.getElementById('live-region');
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}