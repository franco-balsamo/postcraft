import { Component } from 'react'
import Button from './UI/Button'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-brand-dark px-6 text-center">
        <h1 className="text-xl font-semibold text-slate-200">Algo salió mal</h1>
        <p className="max-w-sm text-sm text-slate-400">
          Ocurrió un error inesperado. Probá recargar la página; si el problema persiste,
          contactanos.
        </p>
        <Button onClick={() => window.location.reload()}>Recargar</Button>
      </div>
    )
  }
}
