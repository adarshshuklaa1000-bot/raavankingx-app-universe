/** URL helpers shared by the web viewer, the admin forms and the native WebView bridge. */

/** True for absolute https:// URLs with a real hostname. */
export function isHttpsUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Images may be absolute https URLs or same-site paths such as /icons/icon-192.png. */
export function isSafeImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return true;
  return isHttpsUrl(v);
}

/** Adds https:// when the admin typed a bare domain; upgrades http:// to https://. */
export function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return v;
  if (/^http:\/\//i.test(v)) return v.replace(/^http:\/\//i, "https://");
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v) && !v.startsWith("/")) return `https://${v}`;
  return v;
}

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Removes a leading "www." so example.com and www.example.com count as the same site. */
function bare(host: string) {
  return host.replace(/^www\./, "");
}

/**
 * Domain allowlist matching. Patterns: "example.com" (also matches subdomains),
 * "*.example.com" (subdomains only) or "*" (everything).
 */
export function hostMatches(host: string, pattern: string): boolean {
  const h = bare(host.toLowerCase());
  const p = pattern.trim().toLowerCase();
  if (!p) return false;
  if (p === "*") return true;
  if (p.startsWith("*.")) {
    const base = bare(p.slice(2));
    return h.endsWith(`.${base}`);
  }
  const base = bare(p);
  return h === base || h.endsWith(`.${base}`);
}

/**
 * Navigation policy: stay inside the in-app browser when the link is on the same site
 * as the app that was opened, or on a domain in the admin allowlist.
 */
export function isAllowedNavigation(target: string, startUrl: string, allowList: string[]): boolean {
  const t = hostOf(target);
  const s = hostOf(startUrl);
  if (!t || !isHttpsUrl(target)) return false;
  if (s && hostMatches(t, s)) return true;
  return allowList.some((p) => hostMatches(t, p));
}

/** Escapes nothing — React escapes text. Strips control characters and trims long admin text. */
export function cleanText(value: string, max = 2000): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max);
}
