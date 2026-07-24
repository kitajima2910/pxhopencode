/**
 * Transport Abstraction — mirrors Pixel Agents' MessageTransport interface.
 *
 * Provides transport-agnostic message layer between renderer and server.
 *
 * Implementations:
 *   - SSETransport:    browser SPA (real-time SSE from server)
 *   - PostMessageTransport: VS Code webview (postMessage bridge)
 *   - DirectTransport:  standalone demo (no server)
 *
 * The renderer (office.html) only knows this interface.
 * It never knows about SSE, postMessage, or WebSocket specifics.
 */

// ─── Transport State ────────────────────────────────────────────

export const TransportState = Object.freeze({
  CONNECTING:    'connecting',
  CONNECTED:     'connected',
  RECONNECTING:  'reconnecting',
  DISCONNECTED:  'disconnected',
})

// ─── SSETransport: Browser (SSE from server) ────────────────────

export function createSSETransport(url = '/events') {
  let _state = TransportState.CONNECTING
  let _handler = null
  let _stateHandler = null
  let _es = null
  let _readyResolve = null
  let _readyPromise = new Promise(resolve => {
    _readyResolve = resolve
  })

  return {
    get state() { return _state },
    get ready() { return _readyPromise },

    send(message) {
      // SSE is unidirectional; optional POST fallback
      try {
        fetch('/emit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        }).catch(() => {})
      } catch {}
    },

    onMessage(handler) {
      _handler = handler
      return () => { _handler = null }
    },

    onStateChange(handler) {
      _stateHandler = handler
      return () => { _stateHandler = null }
    },

    connect() {
      if (_es) _es.close()

      _setState(TransportState.CONNECTING)
      _es = new EventSource(url)

      _es.onopen = () => {
        _setState(TransportState.CONNECTED)
        if (_readyResolve) {
          _readyResolve()
          _readyResolve = null
        }
      }

      _es.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data)
          if (_handler) _handler(message)
        } catch {}
      }

      _es.onerror = () => {
        _setState(TransportState.RECONNECTING)
        setTimeout(() => this.connect(), 3000)
      }
    },

    dispose() {
      if (_es) {
        _es.close()
        _es = null
      }
      _setState(TransportState.DISCONNECTED)
    },
  }

  function _setState(newState) {
    if (_state !== newState) {
      _state = newState
      if (_stateHandler) _stateHandler(_state)
    }
  }
}

// ─── PostMessageTransport: VS Code webview ──────────────────────

export function createPostMessageTransport() {
  let _handler = null
  let _stateHandler = null
  let _readyResolve = null
  let _readyPromise = new Promise(resolve => {
    _readyResolve = resolve
  })

  // PostMessage is permanently "connected" in VS Code
  const _state = TransportState.CONNECTED

  const _listener = (e) => {
    try {
      const message = e.data
      if (message && typeof message === 'object' && _handler) {
        _handler(message)
      }
    } catch {}
  }

  window.addEventListener('message', _listener)

  // Ready immediately
  setTimeout(() => {
    if (_readyResolve) {
      _readyResolve()
      _readyResolve = null
    }
  }, 0)

  return {
    get state() { return _state },
    get ready() { return _readyPromise },

    send(message) {
      // In VS Code, postMessage back (if acquireVsCodeApi available)
      try {
        const vscode = window.acquireVsCodeApi?.()
        if (vscode) vscode.postMessage(message)
      } catch {}
    },

    onMessage(handler) {
      _handler = handler
      return () => { _handler = null }
    },

    onStateChange(handler) {
      _stateHandler = handler
      return () => { _stateHandler = null }
    },

    connect() {
      // PostMessage is always connected
      if (_stateHandler) _stateHandler(_state)
    },

    dispose() {
      window.removeEventListener('message', _listener)
      _handler = null
    },
  }
}

// ─── DirectTransport: Demo mode (no server) ─────────────────────

export function createDirectTransport() {
  let _handler = null
  let _readyResolve = null
  const _readyPromise = new Promise(resolve => {
    _readyResolve = resolve
  })

  setTimeout(() => {
    if (_readyResolve) {
      _readyResolve()
      _readyResolve = null
    }
  }, 0)

  return {
    get state() { return TransportState.CONNECTED },
    get ready() { return _readyPromise },

    send(message) {
      // Demo mode: echo back
      if (_handler) _handler(message)
    },

    onMessage(handler) {
      _handler = handler
      return () => { _handler = null }
    },

    onStateChange() {
      return () => {}
    },

    connect() {},

    dispose() {
      _handler = null
    },
  }
}
