import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    sessionStorage.clear();
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#14161a] text-white flex flex-col items-center justify-center p-4 text-center select-none">
          <div className="mc-panel-dark max-w-md p-6 border-2 border-[#ff5555] shadow-2xl">
            <div className="text-3xl mb-2">💥</div>
            <h2 className="text-lg font-bold text-[#ff5555] mc-font mb-2">
              VOXEL RENDER EXCEPTION
            </h2>
            <p className="text-xs text-[#ccc] mb-4 font-sans leading-relaxed">
              A graphics or state sync error occurred during rendering.
            </p>
            <div className="bg-[#111] p-2 text-[10px] text-[#ffaaaa] font-mono text-left mb-4 overflow-x-auto max-h-24">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReload}
                className="mc-btn mc-btn-green px-4 py-2 text-[10px] mc-font text-white cursor-pointer"
              >
                Reload Scene
              </button>
              <button
                onClick={this.handleReset}
                className="mc-btn px-4 py-2 text-[10px] mc-font text-[#aaa] cursor-pointer"
              >
                Return to Lobby
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
