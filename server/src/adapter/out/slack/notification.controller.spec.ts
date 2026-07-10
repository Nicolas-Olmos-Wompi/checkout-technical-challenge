import { Test, TestingModule } from "@nestjs/testing";
import { SlackNotification } from "../slack/notification.controller";
import { CustomException } from "../../../model/exceptions/custom.model";
import { of, throwError } from "rxjs";

describe("SlackNotification", () => {
  let repository: SlackNotification;

  const httpServiceMock = {
    post: () => of({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlackNotification],
      providers: [
        {
          provide: "httpService",
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    repository = module.get<SlackNotification>(SlackNotification);
  });

  it("should return a Custom Exception", async () => {
    jest
      .spyOn(httpServiceMock, "post")
      .mockReturnValueOnce(
        throwError(() => new Error("Error in Axios Response")),
      );

    await expect(repository.sendNotification("", "")).rejects.toBeInstanceOf(
      CustomException,
    );
  });
});
