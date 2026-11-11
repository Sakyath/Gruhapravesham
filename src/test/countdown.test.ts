import { describe, expect, it } from "vitest";
import { getCountdown } from "@/lib/countdown";
import { EVENT } from "@/lib/event";

describe("countdown (IST)", () => {
  it("targets 25 Nov 2026 00:00 IST", () => {
    expect(new Date(EVENT.startUtc).toISOString()).toBe("2026-11-24T18:30:00.000Z");
  });
  it("counts exactly one day before", () => {
    const c = getCountdown(EVENT.startUtc - 86400000, EVENT.startUtc, EVENT.endUtc);
    expect(c).toEqual({ phase: "before", days: 1, hours: 0, minutes: 0, seconds: 0 });
  });
  it("shows today on the event day in IST", () => {
    expect(getCountdown(Date.parse("2026-11-25T10:00:00Z"), EVENT.startUtc, EVENT.endUtc).phase).toBe("today");
  });
  it("shows after once 26 Nov IST begins", () => {
    expect(getCountdown(Date.parse("2026-11-25T18:30:00Z"), EVENT.startUtc, EVENT.endUtc).phase).toBe("after");
  });
});
