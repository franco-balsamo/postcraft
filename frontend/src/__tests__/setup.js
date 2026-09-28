import '@testing-library/jest-dom'

// jsdom's own localStorage getter is unreliable across Node versions (e.g. it
// silently returns undefined on newer Node runtimes without the
// --localstorage-file flag). Use a simple in-memory polyfill instead so
// tests behave the same regardless of the Node version running them.
function createMemoryStorage() {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createMemoryStorage(),
  configurable: true,
})
