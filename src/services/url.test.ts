import { describe, expect, it } from "vitest";
import { hostMatches, isAllowedNavigation, isHttpsUrl, isSafeImageUrl, normalizeUrl } from "./url";

describe("app links must be https", () => {
  it("accepts https and rejects http / javascript / bare text", () => {
    expect(isHttpsUrl("https://www.pw.live")).toBe(true);
    expect(isHttpsUrl("http://www.pw.live")).toBe(false);
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpsUrl("pw.live")).toBe(false);
  });

  it("upgrades http and bare domains to https", () => {
    expect(normalizeUrl("http://pw.live")).toBe("https://pw.live");
    expect(normalizeUrl("pw.live/batches")).toBe("https://pw.live/batches");
  });

  it("allows same-site image paths but not protocol-relative ones", () => {
    expect(isSafeImageUrl("/icons/icon-192.png")).toBe(true);
    expect(isSafeImageUrl("//evil.com/x.png")).toBe(false);
  });
});

describe("in-app browser keeps same-site and allowlisted links inside the app", () => {
  it("same domain (with or without www, subdomains) stays inside", () => {
    expect(isAllowedNavigation("https://pw.live/study", "https://www.pw.live", [])).toBe(true);
    expect(isAllowedNavigation("https://auth.pw.live/login", "https://www.pw.live", [])).toBe(true);
  });

  it("other domains need the allowlist", () => {
    expect(isAllowedNavigation("https://youtube.com/watch", "https://pw.live", [])).toBe(false);
    expect(isAllowedNavigation("https://m.youtube.com/watch", "https://pw.live", ["youtube.com"])).toBe(true);
    expect(isAllowedNavigation("https://anything.org", "https://pw.live", ["*"])).toBe(true);
  });

  it("wildcard patterns match subdomains only", () => {
    expect(hostMatches("cdn.example.com", "*.example.com")).toBe(true);
    expect(hostMatches("example.com", "*.example.com")).toBe(false);
  });

  it("non-https targets never stay inside", () => {
    expect(isAllowedNavigation("http://pw.live", "https://pw.live", ["*"])).toBe(false);
  });
});
