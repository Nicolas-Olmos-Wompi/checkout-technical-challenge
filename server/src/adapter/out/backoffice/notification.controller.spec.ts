import { Test, TestingModule } from "@nestjs/testing";
import { BackOfficeNotification } from "../backoffice/notification.controller";
import { CustomException } from "../../../model/exceptions/custom.model";
import { ConfigModule } from "@nestjs/config";

describe("BackOfficeNotification", () => {
  let repository: BackOfficeNotification;

  const slackNotificationMock = {
    sendNotification: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(() => ({
          SLACK_WEBHOOK: "Any_Value",
        })),
      ],
      controllers: [BackOfficeNotification],
      providers: [
        {
          provide: "SlackNotification",
          useValue: slackNotificationMock,
        },
      ],
    }).compile();

    repository = module.get<BackOfficeNotification>(BackOfficeNotification);
  });

  it("should return a Custom Exception", async () => {
    slackNotificationMock.sendNotification.mockImplementation(() => {
      throw new Error("Error in Slack Notification");
    });

    await expect(repository.sendCustomNotification("")).rejects.toBeInstanceOf(
      CustomException,
    );
  });
});
