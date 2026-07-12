import { formatPrice } from "../formatPrice";

describe("formatPrice", () => {
  it("formats an integer amount (cents) dividing by 100 with dot thousands separators and a $ prefix", () => {
    expect(formatPrice(15000000)).toBe("$150.000");
  });

  it("formats small amounts without separators", () => {
    expect(formatPrice(50000)).toBe("$500");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("truncates fractional result (no decimals for COP)", () => {
    expect(formatPrice(150)).toBe("$2");
  });
});
