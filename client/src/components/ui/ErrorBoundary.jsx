import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0B] text-[#F5F3EF] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#111113] border border-white/10 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#FF4D4D]/15 text-[#FF4D4D] mx-auto flex items-center justify-center border border-[#FF4D4D]/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Something went wrong</h2>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                An unexpected UI rendering issue occurred.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-black/50 rounded-xl border border-white/10 text-left overflow-auto max-h-36">
                  <p className="font-mono text-[11px] text-[#FF4D4D] break-words">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4D4D] text-[#0A0A0B] font-bold text-xs hover:bg-[#FF6B6B] transition-all shadow-lg shadow-[#FF4D4D]/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Platform</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
