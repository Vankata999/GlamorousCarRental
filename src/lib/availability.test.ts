import { describe, it, expect } from "vitest";
import { rangesOverlap, overlapWhere } from "./availability";

const d = (s: string) => new Date(s + "T00:00:00Z");

describe("rangesOverlap (inclusive day ranges)", () => {
  it("detects an inner overlap", () => {
    expect(
      rangesOverlap(d("2026-07-10"), d("2026-07-12"), d("2026-07-11"), d("2026-07-13")),
    ).toBe(true);
  });

  it("counts a touching endpoint as overlap (a car returned and re-rented the same day)", () => {
    expect(
      rangesOverlap(d("2026-07-10"), d("2026-07-12"), d("2026-07-12"), d("2026-07-14")),
    ).toBe(true);
  });

  it("detects identical ranges", () => {
    expect(
      rangesOverlap(d("2026-07-10"), d("2026-07-12"), d("2026-07-10"), d("2026-07-12")),
    ).toBe(true);
  });

  it("treats the day after as free", () => {
    expect(
      rangesOverlap(d("2026-07-10"), d("2026-07-12"), d("2026-07-13"), d("2026-07-15")),
    ).toBe(false);
  });

  it("treats the day before as free", () => {
    expect(
      rangesOverlap(d("2026-07-10"), d("2026-07-12"), d("2026-07-07"), d("2026-07-09")),
    ).toBe(false);
  });
});

describe("overlapWhere (the Prisma filter the booking action uses)", () => {
  it("builds an inclusive-overlap where fragment", () => {
    const start = d("2026-07-10");
    const end = d("2026-07-12");
    expect(overlapWhere(start, end)).toEqual({
      startDate: { lte: end },
      endDate: { gte: start },
    });
  });
});
