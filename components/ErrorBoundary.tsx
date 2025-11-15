'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-red-900/50 backdrop-blur-sm rounded-lg p-6 border border-red-500 max-w-2xl">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h2>
            <p className="text-white mb-4">
              An error occurred while running the application. Please try reloading the page.
            </p>
            <details className="mb-4">
              <summary className="text-red-200 cursor-pointer hover:text-red-100">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-black/30 rounded text-xs text-red-100 overflow-auto">
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
            <div className="flex gap-3">
              <button
                onClick={this.resetError}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
