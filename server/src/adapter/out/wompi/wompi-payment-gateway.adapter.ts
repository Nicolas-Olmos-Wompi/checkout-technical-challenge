import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { AxiosError, AxiosResponse } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { IPaymentGateway } from "domain/src/interface/payment-gateway";
import { MerchantAcceptance } from "domain/src/model/order.type";
import { CustomException } from "../../../model/exceptions/custom.model";
import { ERROR_STATES_MESSAGES } from "../../../common/response-states/error-states.messages";
import { LoggerService } from "../../../common/logger/logger.service";
import { WompiMerchantResponse } from "./wompi-merchant-response.type";

@Injectable()
export class WompiPaymentGatewayAdapter implements IPaymentGateway {
  private readonly logger = new LoggerService("WompiPaymentGateway");

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async getAcceptanceTokens(): Promise<MerchantAcceptance> {
    const baseUrl = this.configService.get<string>("WOMPI_BASE_URL");
    const publicKey = this.configService.get<string>("WOMPI_PUBLIC_KEY");

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<WompiMerchantResponse>(`${baseUrl}/merchants/${publicKey}`)
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error("Wompi getAcceptanceTokens failed", {
                status: error.response?.status,
                wompiError: error.response?.data,
              });
              throw new CustomException(
                error,
                "Technical",
                ERROR_STATES_MESSAGES.BusinessException,
              );
            }),
          ),
      );

      return this.toMerchantAcceptance(response);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      this.logger.error("Unexpected error in getAcceptanceTokens", {
        message: error instanceof Error ? error.message : String(error),
      });
      throw new CustomException(
        error as Error,
        "Technical",
        ERROR_STATES_MESSAGES.BusinessException,
      );
    }
  }

  private toMerchantAcceptance(
    response: AxiosResponse<WompiMerchantResponse>,
  ): MerchantAcceptance {
    const { presigned_acceptance, presigned_personal_data_auth } =
      response.data.data;

    return {
      endUserPolicy: {
        acceptanceToken: presigned_acceptance.acceptance_token,
        permalink: presigned_acceptance.permalink,
      },
      personalDataAuth: {
        acceptanceToken: presigned_personal_data_auth.acceptance_token,
        permalink: presigned_personal_data_auth.permalink,
      },
    };
  }
}
