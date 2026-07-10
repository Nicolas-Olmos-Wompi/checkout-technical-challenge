import { Inject } from "@nestjs/common";
import { ERROR_STATES_MESSAGES } from "../../../common/response-states/error-states.messages";
import { CustomException } from "../../../model/exceptions/custom.model";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";

class SlackNotification {
  constructor(
    @Inject("httpService") private readonly httpService: HttpService,
  ) {}

  public async sendNotification(message: string, to: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService
          .post(
            to,
            {
              text: message,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw new CustomException(
                error,
                "Technical",
                ERROR_STATES_MESSAGES.BusinessException,
              );
            }),
          ),
      );
    } catch (error) {
      throw new CustomException(
        error as Error,
        "Technical",
        ERROR_STATES_MESSAGES.BusinessException,
      );
    }
  }
}

export { SlackNotification };
