import '@testing-library/jest-dom/vitest'

// Mock window.matchMedia
window.matchMedia =
  (window.matchMedia as any) ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }))

// Mock ResizeObserver
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 在 setupTests / vitest.setup.ts 中补充
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})
