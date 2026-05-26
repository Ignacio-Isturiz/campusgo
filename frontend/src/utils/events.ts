type Listener = (...args: any[]) => void;
const listeners: Record<string, Listener[]> = {};

export function emit(event: string, ...args: any[]) {
  (listeners[event] || []).forEach(fn => fn(...args));
}

export function on(event: string, fn: Listener) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
  return () => {
    listeners[event] = listeners[event].filter(f => f !== fn);
  };
}
