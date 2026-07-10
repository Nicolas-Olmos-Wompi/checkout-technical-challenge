import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ERROR_STATES_MESSAGES } from "../../../common/response-states/error-states.messages";
import { CustomException } from "../../../model/exceptions/custom.model";
import { SlackNotification } from "../slack/notification.controller";
import { IBackOfficeNotification } from "domain/src/interface/backoffice-notification.repository";

class BackOfficeNotification implements IBackOfficeNotification {
  constructor(
    @Inject("SlackNotification")
    private readonly slackNotification: SlackNotification,
    @Inject()
    private readonly configService: ConfigService,
  ) {}

  public async sendCustomNotification(message: string): Promise<void> {
    try {
      const to = this.configService.get<string>("SLACK_WEBHOOK")!;
      Logger.log(
        `- Sending notification - ${JSON.stringify({
          message,
          to,
        })}`,
        BackOfficeNotification.name,
      );
      await this.slackNotification.sendNotification(message, to);
    } catch (error) {
      throw new CustomException(
        error as Error,
        "Technical",
        ERROR_STATES_MESSAGES.BusinessException,
      );
    }
  }
}

export { BackOfficeNotification };
