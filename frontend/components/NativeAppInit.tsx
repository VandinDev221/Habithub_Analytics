'use client';

import { useEffect } from 'react';
import { detectNativeApp } from '@/lib/native-app';

export function NativeAppInit() {
  useEffect(() => {
    async function init() {
      let isNative = detectNativeApp();

      try {
        const { Capacitor } = await import('@capacitor/core');
        isNative = Capacitor.isNativePlatform();
      } catch {
        // @capacitor/core opcional no bundle web
      }

      if (!isNative) return;

      document.documentElement.classList.add('native-app');

      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#2563eb' });
      } catch {
        // plugin só no APK
      }

      try {
        const { App } = await import('@capacitor/app');
        void App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else void App.exitApp();
        });
      } catch {
        // plugin só no APK
      }
    }

    void init();
  }, []);

  return null;
}
