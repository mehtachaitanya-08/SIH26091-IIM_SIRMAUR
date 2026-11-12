import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[UdyamSetuAI] Render Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    try {
      if (typeof window !== 'undefined' && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => {
          try { t.revert(); t.kill(true); } catch (e) {}
        });
      }
    } catch (e) {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReturnHome = () => {
    try {
      if (typeof window !== 'undefined' && window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach(t => {
          try { t.revert(); t.kill(true); } catch (e) {}
        });
      }
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-6 text-[#111311] font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                !
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111311]">Workspace Render Error</h2>
                <p className="text-xs text-[#686D65]">An error occurred while loading the dashboard components.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 text-red-800 text-xs font-mono overflow-auto max-h-48 border border-red-100">
              {this.state.error?.toString()}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 py-2.5 rounded-xl bg-[#0E7A53] hover:bg-[#0c6846] text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                ↻ Retry Workspace
              </button>
              <button
                type="button"
                onClick={this.handleReturnHome}
                className="flex-1 py-2.5 rounded-xl bg-[#111311] text-white text-xs font-bold font-mono uppercase tracking-wider hover:bg-black transition-all cursor-pointer"
              >
                ← Return to Landing Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

