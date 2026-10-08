import { describe, expect, it } from "vitest";
import { formatFixed, formatNumber, parseDecimal, parseInteger } from "./number";

describe("parseDecimal", () => {
  it("accepts dot, comma and whitespace", () => {
    expect(parseDecimal("82.5")).toBe(82.5);
    expect(parseDecimal("82,5")).toBe(82.5);
    expect(parseDecimal("  100 ")).toBe(100);
  });
  it("returns NaN for empty or garbage", () => {
    expect(parseDecimal("")).toBeNaN();
    expect(parseDecimal("abc")).toBeNaN();
    expect(parseDecimal("1.2.3")).toBeNaN();
  });
});

describe("formatNumber / formatFixed", () => {
  it("formats display numbers with separators and at most one decimal", () => {
    expect(formatNumber(1234.56)).toBe("1,234.6");
    expect(formatNumber(100)).toBe("100");
  });
  it("drops a trailing .0 from fixed decimals", () => {
    expect(formatFixed(116.666)).toBe("116.7");
    expect(formatFixed(100)).toBe("100");
  });
});

describe("parseInteger", () => {
  it("parses whole numbers", () => expect(parseInteger(" 12 ")).toBe(12));
  it("rejects fractions, empty and garbage", () => {
    expect(parseInteger("1.5")).toBeNaN();
    expect(parseInteger("")).toBeNaN();
    expect(parseInteger("x")).toBeNaN();
  });
});
