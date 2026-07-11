import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { catchError, firstValueFrom } from "rxjs";
import { IPaymentMethodStrategy } from "domain/src/interface/payment-method-strategy";
import {
  CardPaymentCommand,
  PaymentMethodType,
  TokenizedPaymentMethod,
} from "domain/src/model/payment.type";
import { PaymentMethodTokenizationError } from "domain/src/model/payment.errors";
import { WompiCardTokenResponse } from "./wompi-card-token-response.type";

@Injectable()
export class WompiCardPaymentMethodAdapter implements IPaymentMethodStrategy<CardPaymentCommand> {
  public readonly type: PaymentMethodType = "CARD";

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
            catchError(() => {
              throw new PaymentMethodTokenizationError(
                "the card could not be tokenized",
              );
            }),
          ),
      );

      if (response.data.status !== "CREATED") {
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
