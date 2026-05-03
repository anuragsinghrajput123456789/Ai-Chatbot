import React from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle size={40} />
          </div>
          
          <h1 className="mb-2 text-3xl font-black tracking-tight">Something went wrong</h1>
          <p className="mb-8 max-w-md text-slate-400">
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCcw size={18} />
              Try Again
            </button>
            
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white border border-slate-800 transition-all hover:bg-slate-800"
            >
              <Home size={18} />
              Go Home
            </button>
          </div>

          {process.env.NODE_ENV !== "production" && this.state.error && (
            <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Error Details (Dev Only)</p>
              <pre className="overflow-x-auto text-xs text-red-400 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
