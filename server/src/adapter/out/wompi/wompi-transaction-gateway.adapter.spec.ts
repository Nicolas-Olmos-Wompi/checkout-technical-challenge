import { MockProxy, mock } from "jest-mock-extended";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { of, throwError } from "rxjs";
import { TransactionCreationError } from "domain/src/model/payment.errors";
import { CreateTransactionCommand } from "domain/src/model/payment.type";
import { WompiTransactionGatewayAdapter } from "./wompi-transaction-gateway.adapter";

describe("WompiTransactionGatewayAdapter", () => {
  let adapter: WompiTransactionGatewayAdapter;
  let httpService: MockProxy<HttpService>;
  let configService: MockProxy<ConfigService>;

  const buildTransactionResponse = (status = "PENDING"): AxiosResponse => ({
    data: {
      data: {
        id: "1292-1602113476-10985",
        status,
      },
    },
    status: 201,
    statusText: "Created",
    headers: {},
    config: {} as AxiosResponse["config"],
  });

  const command: CreateTransactionCommand = {
    amountInCents: 50000,
    currency: "COP",
    reference: "ORDER-2024-001",
    signature: "signature-hash",
    acceptanceToken: "end-user-policy-token",
    customerEmail: "juan@example.com",
    paymentMethodPayload: {
      type: "CARD",
      token: "tok_prod_1_BBb749EAB32e97a2D058Dd538a608301",
      installments: 1,
    },
  };

  beforeEach(() => {
    httpService = mock<HttpService>();
    configService = mock<ConfigService>();
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        WOMPI_BASE_URL: "https://api-sandbox.co.uat.wompi.dev/v1",
        WOMPI_PUBLIC_KEY: "pub_stagtest_dummy",
        WOMPI_PRIVATE_KEY: "prv_stagtest_dummy",
      };
      return values[key];
    });
    adapter = new WompiTransactionGatewayAdapter(httpService, configService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("createTransaction", () => {
    it("should POST to /transactions with the private key as bearer", async () => {
      httpService.post.mockReturnValue(of(buildTransactionResponse()));

      await adapter.createTransaction(command);

      expect(httpService.post).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/transactions",
        {
          amount_in_cents: 50000,
          currency: "COP",
          customer_email: "juan@example.com",
          payment_method: command.paymentMethodPayload,
          reference: "ORDER-2024-001",
          signature: "signature-hash",
          acceptance_token: "end-user-policy-token",
        },
        {
          headers: { Authorization: "Bearer prv_stagtest_dummy" },
        },
      );
    });

    it("should return the mapped transaction id and status", async () => {
      httpService.post.mockReturnValue(of(buildTransactionResponse("PENDING")));

      const result = await adapter.createTransaction(command);

      expect(result).toEqual({
        id: "1292-1602113476-10985",
        status: "PENDING",
      });
    });

    it("should throw TransactionCreationError on HTTP failure without leaking the raw error", async () => {
      httpService.post.mockReturnValue(
        throwError(() => new Error("422 duplicate reference")),
      );

      await expect(adapter.createTransaction(command)).rejects.toBeInstanceOf(
        TransactionCreationError,
      );
    });
  });

  describe("getTransactionStatus", () => {
    it("should GET /transactions/:id with the public key as bearer", async () => {
      httpService.get.mockReturnValue(of(buildTransactionResponse("APPROVED")));

      await adapter.getTransactionStatus("1292-1602113476-10985");

      expect(httpService.get).toHaveBeenCalledWith(
        "https://api-sandbox.co.uat.wompi.dev/v1/transactions/1292-1602113476-10985",
        { headers: { Authorization: "Bearer pub_stagtest_dummy" } },
      );
    });

    it("should return the mapped transaction id and status", async () => {
      httpService.get.mockReturnValue(of(buildTransactionResponse("APPROVED")));

      const result = await adapter.getTransactionStatus(
        "1292-1602113476-10985",
      );

      expect(result).toEqual({
        id: "1292-1602113476-10985",
        status: "APPROVED",
      });
    });

    it("should throw TransactionCreationError on HTTP failure without leaking the raw error", async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error("network error")),
      );

      await expect(
        adapter.getTransactionStatus("1292-1602113476-10985"),
      ).rejects.toBeInstanceOf(TransactionCreationError);
    });
  });
});
