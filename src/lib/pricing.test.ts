import { describe, it, expect } from "vitest";
import {
  priceFor,
  nightsBilled,
  daysInclusive,
  dayKey,
  toUTCDay,
} from "./pricing";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("date helpers", () => {
  it("toUTCDay strips time to UTC midnight", () => {
    expect(toUTCDay(new Date("2026-07-10T23:30:00Z")).toISOString()).toBe(
      "2026-07-10T00:00:00.000Z",
    );
  });

  it("dayKey is the UTC calendar day", () => {
    expect(dayKey(new Date("2026-07-10T23:30:00Z"))).toBe("2026-07-10");
  });

  it("daysInclusive counts both endpoints", () => {
    expect(daysInclusive(d("2026-07-10"), d("2026-07-12"))).toBe(3);
    expect(daysInclusive(d("2026-07-10"), d("2026-07-10"))).toBe(1);
  });

  it("nightsBilled is inclusive days minus one, floored at 1", () => {
    expect(nightsBilled(d("2026-07-10"), d("2026-07-10"))).toBe(1); // single day
    expect(nightsBilled(d("2026-07-10"), d("2026-07-12"))).toBe(2); // 10th -> 12th
  });
});

describe("priceFor", () => {
  it("is deterministic for the same car and dates", () => {
    expect(priceFor("corolla", d("2026-07-10"), d("2026-07-12"))).toBe(
      priceFor("corolla", d("2026-07-10"), d("2026-07-12")),
    );
  });

  it("is timezone-stable (same UTC day regardless of time of day)", () => {
    expect(
      priceFor("corolla", new Date("2026-07-10T23:30:00Z"), d("2026-07-12")),
    ).toBe(priceFor("corolla", d("2026-07-10"), d("2026-07-12")));
  });

  it("scales linearly with the number of nights", () => {
    const oneNight = priceFor("golf", d("2026-07-10"), d("2026-07-11"));
    const twoNights = priceFor("golf", d("2026-07-10"), d("2026-07-12"));
    expect(twoNights).toBe(oneNight * 2);
  });

  it("varies by car and by date", () => {
    expect(priceFor("golf", d("2026-07-10"), d("2026-07-12"))).not.toBe(
      priceFor("civic", d("2026-07-10"), d("2026-07-12")),
    );
    expect(priceFor("golf", d("2026-07-10"), d("2026-07-12"))).not.toBe(
      priceFor("golf", d("2026-08-10"), d("2026-08-12")),
    );
  });

  it("returns a positive integer", () => {
    const p = priceFor("clio", d("2026-07-10"), d("2026-07-12"));
    expect(Number.isInteger(p)).toBe(true);
    expect(p).toBeGreaterThan(0);
  });
});
