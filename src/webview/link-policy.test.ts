import { describe, expect, it } from "vitest";
import { linkDestination } from "./link-policy";

describe("website opening policy", () => {
  it("keeps social links inside the Android browser", () => {
    expect(linkDestination("https://t.me/Raavan_kingX", true)).toBe("native");
    expect(linkDestination("https://instagram.com/raavankingx", true)).toBe("native");
  });
  it("opens social services without an iframe on web", () => {
    expect(linkDestination("https://t.me/Raavan_kingX", false)).toBe("social");
    expect(linkDestination("https://www.instagram.com/raavankingx", false)).toBe("social");
    expect(linkDestination("https://youtu.be/example", false)).toBe("social");
  });
  it("keeps other web apps in the viewer and rejects lookalike social domains", () => {
    expect(linkDestination("https://pw.live", false)).toBe("viewer");
    expect(linkDestination("https://instagram.com.evil.example", false)).toBe("viewer");
  });
});