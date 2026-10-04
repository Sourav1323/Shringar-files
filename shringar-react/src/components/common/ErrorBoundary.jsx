import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-brand-maroon/20 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-brand-maroon/10 text-brand-maroon rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-maroon">
              Something went wrong
            </h2>
            <p className="text-stone-600 text-xs leading-relaxed">
              {this.state.error?.message || 'A temporary display issue occurred while rendering the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif text-xs font-bold shadow hover:bg-brand-maroon-dark transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Experience
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
