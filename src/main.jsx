import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { installNativeBootErrorForwarding, reportNativeBootReady } from '@/lib/nativeBoot'
import '@/index.css'

installNativeBootErrorForwarding()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
  window.requestAnimationFrame(() => reportNativeBootReady())
} else {
  reportNativeBootReady()
}
