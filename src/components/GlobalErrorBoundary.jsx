import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * GLOBAL ERROR BOUNDARY WRAPPER
 * עוטף את כל האפליקציה ומספק recovery מתקדם
 */

export default function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}