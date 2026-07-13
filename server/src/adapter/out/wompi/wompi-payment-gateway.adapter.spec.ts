import { MockProxy, mock } from "jest-mock-extended";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { CustomException } from "../../../model/exceptions/custom.model";
import { WompiPaymentGatewayAdapter } from "./wompi-payment-gateway.adapter";

describe("WompiPaymentGatewayAdapter", () => {
  let gateway: WompiPaymentGatewayAdapter;
  let httpService: MockProxy<HttpService>;
  let configService: MockProxy<ConfigService>;

  const buildMerchantResponse = (): AxiosResponse => ({
    data: {
      data: {
        presigned_acceptance: {
          acceptance_token: "end-user-policy-token",
          permalink: "https://wompi.com/end-user-policy.pdf",
          type: "END_USER_POLICY",
        },
        presigned_personal_data_auth: {
          acceptance_token: "personal-data-auth-token",
          permalink: "https://wompi.com/personal-data-auth.pdf",
          type: "PERSONAL_DATA_AUTH",
        },
      },
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as AxiosResponse["config"],
  });

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
    gateway = new WompiPaymentGatewayAdapter(httpService, configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getAcceptanceTokens", () => {
    it("should call the merchant endpoint built from the configured base URL and public key", async () => {
      httpService.get.mockReturnValue(of(buildMerchantResponse()));

      await gateway.getAcceptanceTokens();

      expect(httpService.get).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_stagtest_dummy",
      );
    });

    it("should map both presigned tokens into a MerchantAcceptance", async () => {
      httpService.get.mockReturnValue(of(buildMerchantResponse()));

      const result = await gateway.getAcceptanceTokens();

      expect(result).toEqual({
        endUserPolicy: {
          acceptanceToken: "end-user-policy-token",
          permalink: "https://wompi.com/end-user-policy.pdf",
        },
        personalDataAuth: {
          acceptanceToken: "personal-data-auth-token",
          permalink: "https://wompi.com/personal-data-auth.pdf",
        },
      });
    });

    it("should wrap request failures in a CustomException", async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error("network error")),
      );

      await expect(gateway.getAcceptanceTokens()).rejects.toBeInstanceOf(
        CustomException,
      );
    });

    it("should wrap unexpected non-typed errors thrown synchronously", async () => {
      httpService.get.mockImplementation(() => {
        throw new Error("sync boom");
      });

      await expect(gateway.getAcceptanceTokens()).rejects.toBeInstanceOf(
        CustomException,
      );
    });
  });
});
