import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StartupExperience } from "@/components/app/StartupExperience";
import type { AppConfig } from "@/services/types";

const openApp = vi.hoisted(() => vi.fn());
vi.mock("@/webview/use-open-app", () => ({ useOpenApp: () => openApp }));
vi.mock("@/components/app/SmartImage", () => ({ SmartImage: () => null }));
vi.mock("@/services/content", () => ({ DEFAULT_LOGO: "/icons/icon-192.png" }));

// Only the settings consumed by startup are relevant to these behavior tests.
const config = {
  splash_enabled: true, telegram_enabled: true, telegram_label: "Telegram",
  telegram_message: "Join the community", telegram_join_text: "Join now",
  telegram_url: "https://t.me/Raavan_kingX", telegram_icon: null,
  splash_image: null, app_logo: null,
} as AppConfig;

describe("Startup sequencing", () => {
  beforeEach(() => { vi.useFakeTimers(); sessionStorage.clear(); openApp.mockClear(); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("finishes loading before offering Telegram, then opens the configured channel internally", () => {
    render(<StartupExperience config={config} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /join now/i }));
    expect(openApp).toHaveBeenCalledWith({ url: "https://t.me/Raavan_kingX", title: "Telegram" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not repeat the Telegram prompt after dismissal in the same tab session", () => {
    const first = render(<StartupExperience config={config} />);
    act(() => vi.advanceTimersByTime(2200));
    fireEvent.click(screen.getByRole("button", { name: /not now/i }));
    first.unmount();
    render(<StartupExperience config={config} />);
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(openApp).not.toHaveBeenCalled();
  });

  it("respects disabled Telegram settings", () => {
    render(<StartupExperience config={{ ...config, telegram_enabled: false }} />);
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(openApp).not.toHaveBeenCalled();
  });
});