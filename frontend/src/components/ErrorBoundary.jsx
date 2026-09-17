import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sentronix UI ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0f18] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#111827] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={28} />
              <div>
                <h2 className="text-lg font-bold">Something went wrong</h2>
                <p className="text-xs text-gray-400">An unexpected interface error was intercepted.</p>
              </div>
            </div>

            <div className="bg-[#0b101b] border border-gray-800 rounded-xl p-3 text-xs font-mono text-red-300 overflow-x-auto max-h-40">
              {this.state.error?.toString()}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={14} /> Reload Interface
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
              >
                Dismiss & Continue
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
