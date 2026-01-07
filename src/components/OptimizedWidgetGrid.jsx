import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Optimized widget loading with error boundaries
const WidgetSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-gray-900/50 border border-purple-700/30 rounded-2xl p-6"
  >
    <Skeleton className="h-6 w-32 mb-4 bg-gray-800" />
    <Skeleton className="h-20 w-full mb-3 bg-gray-800" />
    <Skeleton className="h-4 w-full bg-gray-800" />
  </motion.div>
);

// Error fallback component
const WidgetError = ({ error, retry }) => (
  <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-6">
    <p className="text-red-400 text-sm mb-2">שגיאה בטעינת הווידג'ט</p>
    {retry && (
      <button
        onClick={retry}
        className="text-xs text-red-300 hover:text-red-200 underline"
      >
        נסה שוב
      </button>
    )}
  </div>
);

// Widget wrapper with error boundary
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <WidgetError error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Optimized widget container
export default function OptimizedWidgetGrid({ children, columns = "lg:grid-cols-2" }) {
  return (
    <div className={`grid ${columns} gap-6`}>
      {React.Children.map(children, (child) => (
        <WidgetErrorBoundary>
          <Suspense fallback={<WidgetSkeleton />}>
            {child}
          </Suspense>
        </WidgetErrorBoundary>
      ))}
    </div>
  );
}

export { WidgetSkeleton, WidgetError, WidgetErrorBoundary };