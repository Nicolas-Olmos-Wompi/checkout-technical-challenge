import { MockProxy, mock } from "jest-mock-extended";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { PaymentMethodTokenizationError } from "domain/src/model/payment.errors";
import { WompiCardPaymentMethodAdapter } from "./wompi-card-payment-method.adapter";

describe("WompiCardPaymentMethodAdapter", () => {
  let adapter: WompiCardPaymentMethodAdapter;
  let httpService: MockProxy<HttpService>;
  let configService: MockProxy<ConfigService>;

  const buildTokenResponse = (
    overrides: Record<string, unknown> = {},
  ): AxiosResponse => ({
    data: {
      status: "CREATED",
      data: {
        id: "tok_test_15_44c5638281if67l04eA63f705bfA5bde",
        brand: "VISA",
        last_four: "4242",
        ...overrides,
      },
    },
    status: 201,
    statusText: "Created",
    headers: {},
    config: {} as AxiosResponse["config"],
  });

  const cardCommand = {
    cardNumber: "4242424242424242",
    expMonth: "06",
    expYear: "29",
    cvc: "123",
    cardHolder: "John Doe",
  };

  beforeEach(() => {
    httpService = mock<HttpService>();
    configService = mock<ConfigService>();
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_stagtest_dummy",
      };
      return values[key];
    });
    adapter = new WompiCardPaymentMethodAdapter(httpService, configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should expose type CARD", () => {
    expect(adapter.type).toBe("CARD");
  });

  describe("tokenize", () => {
    it("should call the tokens/cards endpoint with the public key as bearer", async () => {
      httpService.post.mockReturnValue(of(buildTokenResponse()));

      await adapter.tokenize(cardCommand);

      expect(httpService.post).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards",
        {
          number: "4242424242424242",
          exp_month: "06",
          exp_year: "29",
          cvc: "123",
          card_holder: "John Doe",
        },
        {
          headers: { Authorization: "Bearer pub_stagtest_dummy" },
        },
      );
    });

    it("should return the token and masked display info on CREATED status", async () => {
      httpService.post.mockReturnValue(of(buildTokenResponse()));

      const result = await adapter.tokenize(cardCommand);

      expect(result).toEqual({
        token: "tok_test_15_44c5638281if67l04eA63f705bfA5bde",
        displayInfo: { brand: "VISA", lastFour: "4242" },
      });
    });

    it("should throw PaymentMethodTokenizationError when status is not CREATED", async () => {
      httpService.post.mockReturnValue(
        of(buildTokenResponse({ id: undefined })),
      );
      const declinedResponse = buildTokenResponse();
      declinedResponse.data = { status: "DECLINED", data: {} };
      httpService.post.mockReturnValue(of(declinedResponse));

      await expect(adapter.tokenize(cardCommand)).rejects.toBeInstanceOf(
        PaymentMethodTokenizationError,
      );
    });

    it("should throw PaymentMethodTokenizationError on HTTP failure without leaking the raw error", async () => {
      httpService.post.mockReturnValue(
        throwError(() => new Error("invalid card number")),
      );

      await expect(adapter.tokenize(cardCommand)).rejects.toBeInstanceOf(
        PaymentMethodTokenizationError,
      );
    });
  });

  describe("buildPaymentMethodPayload", () => {
    it("should return a CARD payment_method payload with installments hardcoded to 1", () => {
      const payload = adapter.buildPaymentMethodPayload("tok_test_123");

      expect(payload).toEqual({
        type: "CARD",
        token: "tok_test_123",
        installments: 1,
      });
    });
  });
});
