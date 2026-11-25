import { createServerFn } from "@tanstack/react-start";

export type UrlCheck = {
  reachable: boolean;
  status: number | null;
  embeddable: boolean;
  reason: string | null;
  finalUrl: string | null;
  contentType: string | null;
  sizeBytes: number | null;
};

const PRIVATE_HOST =
  /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd])/i;

/**
 * Checks a website the admin added (or a visitor opens in the web viewer):
 * is it reachable, and does it allow being shown inside another page?
 * X-Frame-Options / CSP frame-ancestors decide embedding; the Android app is not affected.
 */
export const checkUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    const u = new URL(String(input.url));
    if (u.protocol !== "https:") throw new Error("Only https links are supported.");
    if (PRIVATE_HOST.test(u.hostname)) throw new Error("This address cannot be checked.");
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<UrlCheck> => {
    try {
      // Follow redirects by hand so a blocking header on any hop (e.g. a login/cookie check) is caught.
      let current = data.url;
      let res: Response | null = null;
      let embeddable = true;
      let reason: string | null = null;
      for (let hop = 0; hop < 6; hop++) {
        res = await fetch(current, {
          method: "GET",
          redirect: "manual",
          headers: { "user-agent": "Mozilla/5.0 (Linux; Android 14) RaavanKingX-LinkCheck/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
        const csp = (res.headers.get("content-security-policy") ?? "").toLowerCase();
        const fa = csp
          .split(";")
          .map((d) => d.trim())
          .find((d) => d.startsWith("frame-ancestors"));
        if (embeddable && (xfo.includes("deny") || xfo.includes("sameorigin"))) {
          embeddable = false;
          reason = "The website blocks being shown inside other pages (X-Frame-Options).";
        } else if (embeddable && fa && !/\s\*(\s|$)/.test(` ${fa.replace("frame-ancestors", "")} `)) {
          embeddable = false;
          reason = "The website only allows itself to be framed by approved sites (CSP frame-ancestors).";
        }
        const loc = res.headers.get("location");
        if (res.status >= 300 && res.status < 400 && loc) {
          await res.body?.cancel();
          current = new URL(loc, current).toString();
          continue;
        }
        break;
      }
      if (!res) throw new Error("no response");
      if (/^ais-(dev|pre)-.*\.run\.app$/i.test(new URL(data.url).hostname)) {
        embeddable = false;
        reason =
          "This is a private Google AI Studio preview link. It only opens for the AI Studio owner inside Google. Deploy the app from AI Studio and use the public link instead.";
      }
      const len = res.headers.get("content-length");
      await res.body?.cancel();
      return {
        reachable: res.ok,
        status: res.status,
        embeddable,
        reason: res.ok ? reason : `The website answered with status ${res.status}.`,
        finalUrl: current,
        contentType: res.headers.get("content-type"),
        sizeBytes: len ? Number(len) : null,
      };
    } catch (error) {
      console.error("checkUrl failed", data.url, error);
      return {
        reachable: false,
        status: null,
        embeddable: false,
        reason: "The website could not be reached.",
        finalUrl: null,
        contentType: null,
        sizeBytes: null,
      };
    }
  });
