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

function safeErrorParts(value, fallbackMessage = 'Unknown startup error') {
  const name = typeof value?.name === 'string' && value.name ? value.name : 'Error';
  const message = typeof value?.message === 'string' && value.message
    ? value.message
    : typeof fallbackMessage === 'string' && fallbackMessage
      ? fallbackMessage
      : 'Unknown startup error';
  return { name, message };
}

export function reportNativeBootReady() {
  post({ type: 'ready' });
}

export function installNativeBootErrorForwarding() {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
  if (window.__holdwiseBootErrorsInstalled) return;
  window.__holdwiseBootErrorsInstalled = true;

  window.addEventListener('error', (event) => {
    const details = safeErrorParts(event?.error, event?.message);
    post({ type: 'error', ...details });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const details = safeErrorParts(event?.reason, String(event?.reason ?? 'Unhandled promise rejection'));
    post({ type: 'error', ...details });
  });
}
