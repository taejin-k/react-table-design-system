import '@testing-library/jest-dom/vitest';

if (!HTMLElement.prototype.scrollTo) HTMLElement.prototype.scrollTo = () => undefined;
if (!HTMLElement.prototype.scrollBy) HTMLElement.prototype.scrollBy = () => undefined;
if (!HTMLElement.prototype.scrollIntoView) HTMLElement.prototype.scrollIntoView = () => undefined;

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;
