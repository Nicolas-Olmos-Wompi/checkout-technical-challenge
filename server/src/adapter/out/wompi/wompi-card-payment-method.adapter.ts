import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { IPaymentMethodStrategy } from "domain/src/interface/payment-method-strategy";
import {
  CardPaymentCommand,
  PaymentMethodType,
  TokenizedPaymentMethod,
} from "domain/src/model/payment.type";
import { PaymentMethodTokenizationError } from "domain/src/model/payment.errors";
import { LoggerService } from "../../../common/logger/logger.service";
import { WompiCardTokenResponse } from "./wompi-card-token-response.type";

@Injectable()
export class WompiCardPaymentMethodAdapter implements IPaymentMethodStrategy<CardPaymentCommand> {
  public readonly type: PaymentMethodType = "CARD";
  private readonly logger = new LoggerService("WompiCardPaymentMethod");

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async tokenize(
    command: CardPaymentCommand,
  ): Promise<TokenizedPaymentMethod> {
    const baseUrl = this.configService.get<string>("WOMPI_BASE_URL");
    const publicKey = this.configService.get<string>("WOMPI_PUBLIC_KEY");

    try {
      const response = await firstValueFrom(
        this.httpService
          .post<WompiCardTokenResponse>(
            `${baseUrl}/tokens/cards`,
            {
              number: command.cardNumber,
              exp_month: command.expMonth,
              exp_year: command.expYear,
              cvc: command.cvc,
              card_holder: command.cardHolder,
            },
            { headers: { Authorization: `Bearer ${publicKey}` } },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error("Wompi card tokenization failed", {
                status: error.response?.status,
                wompiError: error.response?.data,
              });
              throw new PaymentMethodTokenizationError(
                "the card could not be tokenized",
              );
            }),
          ),
      );

      if (response.data.status !== "CREATED") {
        this.logger.warn(
          "Wompi card tokenization returned non-CREATED status",
          {
            status: response.data.status,
          },
        );
        throw new PaymentMethodTokenizationError(
          "the card could not be tokenized",
        );
      }

      const { id, brand, last_four } = response.data.data;

      return {
        token: id,
        displayInfo: { brand, lastFour: last_four },
      };
    } catch (error) {
      if (error instanceof PaymentMethodTokenizationError) {
        throw error;
      }
      this.logger.error("Unexpected error in card tokenization", {
        message: error instanceof Error ? error.message : String(error),
      });
      throw new PaymentMethodTokenizationError(
        "the card could not be tokenized",
      );
    }
  }

  public buildPaymentMethodPayload(token: string): Record<string, unknown> {
    return {
      type: "CARD",
      token,
      installments: 1,
    };
  }
}
