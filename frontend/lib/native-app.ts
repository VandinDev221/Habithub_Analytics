/** Detecta app Capacitor ou WebView Android (APK). */
export function detectNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  // WebView Android costuma incluir "; wv)" no user agent
  return /;\s*wv\)/i.test(navigator.userAgent);
}
