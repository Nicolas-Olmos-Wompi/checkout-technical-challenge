import { MockProxy, mock } from "jest-mock-extended";
import { ConfigService } from "@nestjs/config";
import { createHash } from "node:crypto";
import { Sha256IntegritySignatureAdapter } from "./sha256-integrity-signature.adapter";

describe("Sha256IntegritySignatureAdapter", () => {
  let adapter: Sha256IntegritySignatureAdapter;
  let configService: MockProxy<ConfigService>;

  beforeEach(() => {
    configService = mock<ConfigService>();
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        WOMPI_INTEGRITY_SECRET:
          "prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6",
      };
      return values[key];
    });
    adapter = new Sha256IntegritySignatureAdapter(configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should generate the SHA-256 hex digest of reference+amount+currency+secret", () => {
    const reference = "sk8-438k4-xmxm392-sn2m";
    const amountInCents = 2490000;
    const currency = "COP";
    const expected = createHash("sha256")
      .update(
        `${reference}${amountInCents}${currency}prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6`,
      )
      .digest("hex");

    const result = adapter.generate(reference, amountInCents, currency);

    expect(result).toBe(expected);
  });

  it("should produce different signatures for different references", () => {
    const first = adapter.generate("ref-1", 1000, "COP");
    const second = adapter.generate("ref-2", 1000, "COP");

    expect(first).not.toBe(second);
  });
});
