import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { installNativeBootErrorForwarding, reportNativeBootReady } from '@/lib/nativeBoot'
import '@/index.css'
import '@/styles/casinoPremiumV7.css'

installNativeBootErrorForwarding()

function BootReadyReporter() {
  useEffect(() => {
    // React has committed successfully if this effect runs. Report readiness
    // immediately instead of waiting on requestAnimationFrame: fresh iOS
    // Simulator GPU processes can stall the first frame even when JS/React is
    // healthy, which previously produced a false native boot timeout.
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
