import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isNativeIOS = process.env.VITE_NATIVE_IOS === 'true';

export default defineConfig({
  base: isNativeIOS ? './' : '/',
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: !isNativeIOS,
      navigationNotifier: !isNativeIOS,
      analyticsTracker: true,
      visualEditAgent: !isNativeIOS
    }),
    react(),
  ],
  build: {
    sourcemap: true,
    target: 'es2020',
  },
});
