import React from 'react';

export class AddonErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SIGNIFY ADDONS UI ERROR] Non-fatal addon error swallowed silently:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fail silently, render null or fallback UI so core captions continue uninterrupted
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
