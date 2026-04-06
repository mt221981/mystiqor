import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback = ({ message = 'טוען...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  </div>
);

export const lazyLoadComponent = (importFunc, fallbackMessage) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default LoadingFallback;