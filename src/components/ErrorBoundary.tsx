"use client"

import { Component, ReactNode } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo)
    }

    // In production, you would send this to an error logging service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    this.handleReset()
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-white/60 mb-6">
              We encountered an unexpected error. This has been logged and our team will look into it.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <p className="text-xs text-rose-400 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="text-xs text-white/40 font-mono">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="glass"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
              >
                Go Home
              </Button>
            </div>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}
