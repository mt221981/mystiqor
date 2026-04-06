import React, { Component } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { trackError } from "@/components/Analytics";

const IS_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

class AdvancedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastError: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const now = Date.now();
    const { lastError, errorCount } = this.state;

    const isRepeated = lastError && (now - lastError) < 5000;
    const newCount = isRepeated ? errorCount + 1 : 1;

    this.setState({
      error,
      errorInfo,
      errorCount: newCount,
      lastError: now
    });

    trackError(error.message, {
      componentStack: errorInfo.componentStack,
      errorCount: newCount,
      repeated: isRepeated
    });

    if (IS_DEVELOPMENT) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (newCount >= 3) {
      this.handleAutoRecover();
    }
  }

  handleAutoRecover = () => {
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorCount: 0,
        lastError: null
      });
    }, 1000);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastError: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorToClipboard = () => {
    const errorText = `
Error: ${this.state.error?.message || 'Unknown error'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      alert('פרטי השגיאה הועתקו ללוח');
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const { fallback, showDetails = false } = this.props;

      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(error, this.handleReset)
          : fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-black p-6 md:p-12 flex items-center justify-center">
          <Card className="max-w-2xl w-full bg-gray-900/90 backdrop-blur-xl border-red-800/50">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white">
                    אופס! משהו השתבש
                  </CardTitle>
                  {errorCount > 1 && (
                    <p className="text-red-400 text-sm mt-1">
                      שגיאה חוזרת ({errorCount} פעמים)
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <p className="text-red-200 text-lg font-semibold mb-2">
                  {error?.message || 'שגיאה לא ידועה'}
                </p>
                <p className="text-red-300/70 text-sm">
                  אנחנו עובדים על לתקן את הבעיה. אפשר לנסות לרענן את הדף.
                </p>
              </div>

              {showDetails && IS_DEVELOPMENT && (
                <details className="bg-gray-800/50 rounded-lg p-4">
                  <summary className="text-white font-semibold cursor-pointer mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    פרטי שגיאה מפורטים
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Stack Trace:</p>
                      <pre className="bg-black/50 p-3 rounded text-xs text-red-300 overflow-auto max-h-40">
                        {error?.stack}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Component Stack:</p>
                        <pre className="bg-black/50 p-3 rounded text-xs text-orange-300 overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  נסה שוב
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  רענן דף
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Home className="w-4 h-4 ml-2" />
                  חזרה לבית
                </Button>
              </div>

              {IS_DEVELOPMENT && (
                <Button
                  onClick={this.copyErrorToClipboard}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  size="sm"
                >
                  העתק פרטי שגיאה
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return (props) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  );
};

export default AdvancedErrorBoundary;