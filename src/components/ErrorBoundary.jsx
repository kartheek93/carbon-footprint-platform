/**
 * ErrorBoundary — catches unexpected runtime errors and shows a friendly fallback UI
 * Improves robustness and prevents the whole app from crashing on component errors
 */

import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error info for debugging without exposing to users
    console.warn('[EcoTrace] Component error caught by boundary:', error.message, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary-icon" aria-hidden="true">⚠️</div>
          <h2 className="error-boundary-title">Something went wrong</h2>
          <p className="error-boundary-msg">
            An unexpected error occurred in this section. Your data is safe.
          </p>
          <button
            className="btn-primary"
            onClick={() => this.handleReset()}
            style={{ width: 'auto', marginTop: '12px' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
