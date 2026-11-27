import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOpenApp } from "./use-open-app";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(), open: vi.fn(), native: false, plugin: false,
}));

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@/services/content", () => ({ useConfig: () => ({ data: { allowed_domains: [] } }) }));
vi.mock("./native", () => ({
  isNativeApp: () => mocks.native,
  hasNativeWebView: () => mocks.plugin,
  RaavanWebView: { open: mocks.open },
}));

describe("open app interaction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.navigate.mockReset();
    mocks.open.mockReset().mockResolvedValue(undefined);
    mocks.native = false;
    mocks.plugin = false;
  });

  it("opens the Telegram social link directly on web without the iframe viewer", async () => {
    const popup = vi.spyOn(window, "open").mockReturnValue(null);
    const { result } = renderHook(() => useOpenApp());
    await act(() => result.current({ url: "https://t.me/Raavan_kingX", title: "Telegram" }));
    expect(popup).toHaveBeenCalledWith("https://t.me/Raavan_kingX", "_blank", "noopener,noreferrer");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("opens Instagram inside Android without going through the iframe check", async () => {
    mocks.native = true;
    mocks.plugin = true;
    const popup = vi.spyOn(window, "open").mockReturnValue(null);
    const { result } = renderHook(() => useOpenApp());
    await act(() => result.current({ url: "https://instagram.com/raavankingx", title: "Instagram" }));
    expect(mocks.open).toHaveBeenCalledWith({ url: "https://instagram.com/raavankingx", title: "Instagram", allowedDomains: [] });
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(popup).not.toHaveBeenCalled();
  });

  it("retains explicit confirmation for apps marked restricted", async () => {
    mocks.native = true;
    mocks.plugin = true;
    const { result } = renderHook(() => useOpenApp());
    await act(() => result.current({ url: "https://pw.live", title: "PW", mode: "restricted" }));
    expect(mocks.open).not.toHaveBeenCalled();
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/browse", search: { url: "https://pw.live", title: "PW", mode: "restricted" } });
  });
});