import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // In production, you would send this to an error monitoring service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.state.errorId
    };

    // Example: Send to error reporting service
    // errorReportingService.captureException(errorReport);
    console.log('Error report generated:', errorReport);
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ID: ${this.state.errorId}`);
    const body = encodeURIComponent(
      `Error Details:\n` +
      `Error ID: ${this.state.errorId}\n` +
      `Message: ${this.state.error?.message}\n` +
      `URL: ${window.location.href}\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `Steps to reproduce:\n` +
      `1. \n` +
      `2. \n` +
      `3. \n\n` +
      `Additional information:\n`
    );
    
    window.open(`mailto:support@deliverysystem.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                We apologize for the inconvenience. Our team has been notified.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="space-y-4">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Bug
                </button>
              </div>

              {isDevelopment && this.state.error && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Development Error Details:
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <pre className="text-xs text-red-800 whitespace-pre-wrap break-all">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </div>
                  
                  {this.state.errorInfo && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Component Stack:
                      </h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap break-all">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;