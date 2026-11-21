import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { useConfig } from "@/services/content";
import { isHttpsUrl, normalizeUrl } from "@/services/url";
import { hasNativeWebView, RaavanWebView } from "./native";

export type OpenTarget = {
  url: string;
  title: string;
  /** "restricted" shows an explanation first instead of loading straight away. */
  mode?: string | null;
};

/**
 * Opens a website inside RaavanKingX — never in Chrome by default.
 * Android app: native full-screen WebView. Web / PWA: the in-app viewer at /browse.
 */
export function useOpenApp() {
  const navigate = useNavigate();
  const { data: config } = useConfig();

  return useCallback(
    async (target: OpenTarget) => {
      const url = normalizeUrl(target.url);
      if (!isHttpsUrl(url)) {
        toast.error("This link isn't a secure https address, so it can't be opened.");
        return;
      }
      if (hasNativeWebView() && target.mode !== "restricted") {
        try {
          await RaavanWebView.open({
            url,
            title: target.title,
            allowedDomains: config?.allowed_domains ?? [],
          });
          return;
        } catch (e) {
          console.error(e);
        }
      }
      navigate({
        to: "/browse",
        search: { url, title: target.title, mode: target.mode === "restricted" ? "restricted" : undefined },
      });
    },
    [navigate, config?.allowed_domains],
  );
}
