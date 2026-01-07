import React from "react";

/**
 * HOC for safe component rendering with error boundary
 */
export const withErrorBoundary = (Component, FallbackComponent = null) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Component error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        if (FallbackComponent) {
          return <FallbackComponent error={this.state.error} />;
        }
        return (
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-300">Something went wrong in this component.</p>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
};

/**
 * Safe component wrapper that catches render errors
 */
export const SafeComponent = ({ children, fallback = null }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Render error:', error);
    return fallback || (
      <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
        <p className="text-red-300">Failed to render component.</p>
      </div>
    );
  }
};

export default SafeComponent;