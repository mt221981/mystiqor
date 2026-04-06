import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center p-6">
          <Card className="max-w-md bg-gray-900/80 border-red-700/50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">משהו השתבש</h2>
              <p className="text-gray-300 mb-6">
                {this.state.error?.message || 'אירעה שגיאה בלתי צפויה'}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                טען מחדש
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;