import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { catchError, firstValueFrom } from "rxjs";
import { ITransactionGateway } from "domain/src/interface/transaction-gateway";
import {
  CreateTransactionCommand,
  TransactionResult,
} from "domain/src/model/payment.type";
import { TransactionCreationError } from "domain/src/model/payment.errors";
import { WompiTransactionResponse } from "./wompi-transaction-response.type";

@Injectable()
export class WompiTransactionGatewayAdapter implements ITransactionGateway {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async createTransaction(
    command: CreateTransactionCommand,
  ): Promise<TransactionResult> {
    const baseUrl = this.configService.get<string>("WOMPI_BASE_URL");
    const privateKey = this.configService.get<string>("WOMPI_PRIVATE_KEY");

    try {
      const response = await firstValueFrom(
        this.httpService
          .post<WompiTransactionResponse>(
            `${baseUrl}/transactions`,
            {
              amount_in_cents: command.amountInCents,
              currency: command.currency,
              customer_email: command.customerEmail,
              payment_method: command.paymentMethodPayload,
              reference: command.reference,
              signature: command.signature,
              acceptance_token: command.acceptanceToken,
            },
            { headers: { Authorization: `Bearer ${privateKey}` } },
          )
          .pipe(
            catchError(() => {
              throw new TransactionCreationError(
                "the transaction could not be created",
              );
            }),
          ),
      );

      return this.toTransactionResult(response.data);
    } catch (error) {
      if (error instanceof TransactionCreationError) {
        throw error;
      }
      throw new TransactionCreationError(
        "the transaction could not be created",
      );
    }
  }

  public async getTransactionStatus(
    transactionId: string,
  ): Promise<TransactionResult> {
    const baseUrl = this.configService.get<string>("WOMPI_BASE_URL");
    const publicKey = this.configService.get<string>("WOMPI_PUBLIC_KEY");

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<WompiTransactionResponse>(
            `${baseUrl}/transactions/${transactionId}`,
            { headers: { Authorization: `Bearer ${publicKey}` } },
          )
          .pipe(
            catchError(() => {
              throw new TransactionCreationError(
                "the transaction status could not be retrieved",
              );
            }),
          ),
      );

      return this.toTransactionResult(response.data);
    } catch (error) {
      if (error instanceof TransactionCreationError) {
        throw error;
      }
      throw new TransactionCreationError(
        "the transaction status could not be retrieved",
      );
    }
  }

  private toTransactionResult(
    body: WompiTransactionResponse,
  ): TransactionResult {
    return {
      id: body.data.id,
      status: body.data.status as TransactionResult["status"],
    };
  }
}
