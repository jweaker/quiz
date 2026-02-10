import type { StateCreator, StoreMutatorIdentifier } from 'zustand'

// Message types for cross-window communication
interface StateUpdateMessage {
  type: 'STATE_UPDATE'
  state: Record<string, unknown>
  source: string
}

interface StateRequestMessage {
  type: 'STATE_REQUEST'
  source: string
}

type BroadcastMessage = StateUpdateMessage | StateRequestMessage

// Unique ID for this window instance (prevents echo)
const windowId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// Track whether we're currently applying a remote update
let isApplyingRemote = false

type Broadcast = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  channelName: string,
) => StateCreator<T, Mps, Mcs>

type BroadcastImpl = <T>(
  f: StateCreator<T, [], []>,
  channelName: string,
) => StateCreator<T, [], []>

const broadcastImpl: BroadcastImpl = (f, channelName) => (set, get, api) => {
  // Only create BroadcastChannel if supported (not in SSR/tests)
  if (typeof BroadcastChannel === 'undefined') {
    return f(set, get, api)
  }

  const channel = new BroadcastChannel(channelName)

  // Filter out functions from state for serialization
  const getSerializableState = (state: Record<string, unknown>): Record<string, unknown> => {
    const serializable: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(state)) {
      if (typeof value !== 'function') {
        serializable[key] = value
      }
    }
    return serializable
  }

  // Listen for incoming messages
  channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
    const message = event.data

    if (message.source === windowId) return // Ignore own messages

    if (message.type === 'STATE_UPDATE') {
      // Apply remote state without triggering broadcast
      isApplyingRemote = true
      api.setState(message.state as Partial<ReturnType<typeof get> & object>)
      isApplyingRemote = false
    }

    if (message.type === 'STATE_REQUEST') {
      // Respond with current state for late-joining windows
      const currentState = get() as Record<string, unknown>
      channel.postMessage({
        type: 'STATE_UPDATE',
        state: getSerializableState(currentState),
        source: windowId,
      } satisfies StateUpdateMessage)
    }
  }

  // Request initial state from other windows
  channel.postMessage({
    type: 'STATE_REQUEST',
    source: windowId,
  } satisfies StateRequestMessage)

  // Wrap set to broadcast changes
  const broadcastSet: typeof set = (...args) => {
    set(...(args as Parameters<typeof set>))

    // Don't broadcast if we're applying a remote update
    if (isApplyingRemote) return

    const currentState = get() as Record<string, unknown>
    channel.postMessage({
      type: 'STATE_UPDATE',
      state: getSerializableState(currentState),
      source: windowId,
    } satisfies StateUpdateMessage)
  }

  return f(broadcastSet, get, api)
}

export const broadcast = broadcastImpl as Broadcast
