import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Bridge to the native Android in-app browser (android/app/src/main/java/.../WebViewActivity.java).
 * It opens a full-screen Android WebView with back/forward/refresh/home/close, progress,
 * downloads, file uploads, fullscreen video and a domain allowlist.
 */
export interface RaavanWebViewPlugin {
  open(options: { url: string; title: string; allowedDomains: string[] }): Promise<void>;
}

export const RaavanWebView = registerPlugin<RaavanWebViewPlugin>("RaavanWebView");

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function hasNativeWebView(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("RaavanWebView");
}
