import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { installNativeBootErrorForwarding, reportNativeBootReady } from '@/lib/nativeBoot'
import '@/index.css'

installNativeBootErrorForwarding()

function BootReadyReporter() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      const frame = window.requestAnimationFrame(() => reportNativeBootReady())
      return () => window.cancelAnimationFrame?.(frame)
    }
    reportNativeBootReady()
    return undefined
  }, [])
  return null
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <App />
    <BootReadyReporter />
  </>
)
