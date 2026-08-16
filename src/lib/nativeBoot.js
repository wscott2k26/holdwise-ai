function nativeBridge() {
  if (typeof window === 'undefined') return null;
  return window.webkit?.messageHandlers?.holdwiseBoot ?? null;
}

function post(message) {
  try {
    nativeBridge()?.postMessage(message);
  } catch {
    // Native diagnostics must never block the web app from booting.
  }
}

function safeString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeLocationNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function normalizeBootError(value, fallbackMessage = 'Unknown startup error', location = {}) {
  const name = typeof value?.name === 'string' && value.name ? value.name : 'Error';
  const message = typeof value?.message === 'string' && value.message
    ? value.message
    : typeof fallbackMessage === 'string' && fallbackMessage
      ? fallbackMessage
      : 'Unknown startup error';
  return {
    name,
    message,
    source: safeString(location?.source),
    line: safeLocationNumber(location?.line),
    column: safeLocationNumber(location?.column),
    stack: safeString(value?.stack),
  };
}

export function reportNativeBootReady() {
  post({ type: 'ready' });
}

export function installNativeBootErrorForwarding() {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
  if (window.__holdwiseBootErrorsInstalled) return;
  window.__holdwiseBootErrorsInstalled = true;

  window.addEventListener('error', (event) => {
    const details = normalizeBootError(event?.error, event?.message, {
      source: event?.filename,
      line: event?.lineno,
      column: event?.colno,
    });
    post({ type: 'error', ...details });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const details = normalizeBootError(
      event?.reason,
      String(event?.reason ?? 'Unhandled promise rejection'),
    );
    post({ type: 'error', ...details });
  });
}
