// Simple event emitter implementation

export default class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(...args))
    }
  }

  // This method is not used anywhere - should be detected as unused
  off(event, listenerToRemove) {
    if (!this.events[event]) return

    this.events[event] = this.events[event].filter((listener) => listener !== listenerToRemove)
  }

  // This method is not used anywhere - should be detected as unused
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args)
      this.off(event, onceWrapper)
    }
    this.on(event, onceWrapper)
  }
}

// This named export is not used anywhere - should be detected as unused
export function createEventEmitter() {
  return new EventEmitter()
}

// This constant is not used anywhere - should be detected as unused
export const EVENT_TYPES = {
  DATA_LOADED: 'data:loaded',
  DATA_ERROR: 'data:error',
  USER_ACTION: 'user:action',
}
