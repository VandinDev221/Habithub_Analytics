'use client';

import { useEffect, useState } from 'react';
import { detectNativeApp } from '@/lib/native-app';

export function useNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(detectNativeApp());
      }
    }
    void check();
  }, []);

  return isNative;
}
