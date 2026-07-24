/**
 * Renderer State Client — lightweight state store for the Virtual Office webview.
 *
 * THIS IS THE ONLY FILE the renderer uses to consume state.
 * It NEVER parses raw OpenCode SSE events — only receives state diffs.
 *
 * Pixel Agents mirror: webview-ui/src/hooks/useExtensionMessages.ts
 *   - Imperative state store (outside React/any framework)
 *   - Transport-agnostic message handling
 *   - Typed ServerMessage processing
 *
 * Usage in office.html:
 *   <script src="renderer-state.js"></script>
 *   <script>
 *     StateStore.connect('/events')
 *     StateStore.onChange(function(diff) { applyStateDiff(diff) })
 *   </script>
 */

const StateStore = (function() {
  const MODULE = {};

  // ─── Internal state ──────────────────────────────────────────
  const agents = {};
  const subagents = {};
  let session = { active: false, phase: 'idle', workflow: '—', startTime: null, sessionId: null };
  let connected = false;
  let eventSource = null;
  let listeners = [];
  let signalListeners = [];
  let subagentListeners = [];

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Connect to SSE endpoint for state diffs.
   * @param {string} url - SSE endpoint (e.g., '/events')
   */
  MODULE.connect = function(url) {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(url);

    eventSource.onopen = function() {
      connected = true;
      MODULE._notify({ type: 'connected' });
    };

    eventSource.onmessage = function(e) {
      try {
        const message = JSON.parse(e.data);

        if (message.type === 'connected') return;

        if (message.type === 'state.snapshot') {
          MODULE._applySnapshot(message);
        } else if (message.type === 'state.diff') {
          MODULE._applyDiff(message);
        }
      } catch (ex) {
        // Silently ignore malformed messages
      }
    };

    eventSource.onerror = function() {
      connected = false;
      setTimeout(function() {
        MODULE.connect(url);
      }, 3000);
    };
  };

  /**
   * Subscribe to state changes.
   * @param {function} fn - Called with (diff) on every state change
   */
  MODULE.onChange = function(fn) {
    listeners.push(fn);
  };

  /**
   * Subscribe to signal events (contract lines between agents).
   * @param {function} fn - Called with ({ from, to }) on every signal
   */
  MODULE.onSignal = function(fn) {
    signalListeners.push(fn);
  };

  /**
   * Subscribe to sub-agent events.
   * @param {function} fn - Called with ({ action, parentAgentId, parentToolId, label })
   */
  MODULE.onSubagent = function(fn) {
    subagentListeners.push(fn);
  };

  /**
   * Get current state for a specific agent.
   * @param {string} agentId
   * @returns {object|null}
   */
  MODULE.getAgent = function(agentId) {
    return agents[agentId] || null;
  };

  /**
   * Get all agent states.
   * @returns {object}
   */
  MODULE.getAllAgents = function() {
    return agents;
  };

  /**
   * Get all sub-agents.
   * @returns {object}
   */
  MODULE.getSubagents = function() {
    return subagents;
  };

  /**
   * Get current session state.
   * @returns {object}
   */
  MODULE.getSession = function() {
    return Object.assign({}, session);
  };

  /**
   * Check if connected to SSE.
   * @returns {boolean}
   */
  MODULE.isConnected = function() {
    return connected;
  };

  /**
   * Disconnect from SSE.
   */
  MODULE.disconnect = function() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    connected = false;
  };

  // ─── Internal methods ────────────────────────────────────────

  MODULE._applySnapshot = function(snapshot) {
    // Full state replacement (replay)
    if (snapshot.agents) {
      for (const id in snapshot.agents) {
        agents[id] = Object.assign({}, snapshot.agents[id]);
      }
    }
    if (snapshot.subagents) {
      for (const key in snapshot.subagents) {
        subagents[key] = Object.assign({}, snapshot.subagents[key]);
      }
    }
    if (snapshot.session) {
      session = Object.assign({}, snapshot.session);
    }
    MODULE._notify({
      type: 'snapshot',
      session: session,
      agents: agents,
      subagents: subagents,
    });
  };

  MODULE._applyDiff = function(diff) {
    let changed = false;
    let changedAgents = [];
    let changedSubagents = [];

    // Merge session changes
    if (diff.session) {
      const oldActive = session.active;
      const oldPhase = session.phase;
      Object.assign(session, diff.session);
      if (oldActive !== session.active || oldPhase !== session.phase) {
        changed = true;
      }
    }

    // Merge agent changes
    if (diff.agents) {
      for (const id in diff.agents) {
        const incoming = diff.agents[id];
        if (!agents[id]) {
          agents[id] = {};
        }

        const current = agents[id];
        const wasActive = current.active;
        const wasState = current.currentState;
        const wasTool = current.activeTool;
        const wasAwaiting = current.awaitingInput;

        Object.assign(current, incoming);

        if (wasActive !== current.active ||
            wasState !== current.currentState ||
            current.badge !== (incoming.badge || '') ||
            wasTool !== current.activeTool ||
            wasAwaiting !== current.awaitingInput) {
          changedAgents.push(id);
          changed = true;
        }
      }
    }

    // Merge sub-agent changes
    if (diff.subagents) {
      for (const key in diff.subagents) {
        const incoming = diff.subagents[key];
        const current = subagents[key];
        if (!current || current.status !== incoming.status) {
          changedSubagents.push({ key, subagent: incoming });
          changed = true;
        }
        subagents[key] = Object.assign({}, incoming);
      }
    }

    // Check for signals in the diff (contract lines)
    if (diff.signals && diff.signals.length) {
      for (const sig of diff.signals) {
        MODULE._notifySignals(sig);
      }
    }

    if (changed || changedAgents.length > 0) {
      MODULE._notify({
        type: 'diff',
        session: session,
        agents: agents,
        subagents: subagents,
        changedAgents: changedAgents,
        changedSubagents: changedSubagents,
      });
    }
  };

  MODULE._notify = function(data) {
    for (let i = 0; i < listeners.length; i++) {
      try {
        listeners[i](data);
      } catch (ex) {}
    }
  };

  MODULE._notifySignals = function(signal) {
    for (let i = 0; i < signalListeners.length; i++) {
      try {
        signalListeners[i](signal);
      } catch (ex) {}
    }
  };

  return MODULE;
})();

// Export for module systems, also available as global StateStore
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateStore;
}
