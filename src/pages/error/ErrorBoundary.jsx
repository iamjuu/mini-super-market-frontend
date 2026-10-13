import React, { Component } from 'react';
import { ServerErrorPage } from './ServerErrorPage';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ [App Error Boundary caught exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          onNavigate={(route) => {
            this.setState({ hasError: false, error: null });
            if (typeof window !== 'undefined') {
              window.location.href = route === 'home' ? '/' : `/${route}`;
            }
          }}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
