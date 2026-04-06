import React, { Suspense, lazy } from "react";
import { SkeletonCard } from "./SkeletonLoader";

export function createLazyComponent(importFunc, fallback = <SkeletonCard />) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export default createLazyComponent;