import { Test, TestingModule } from "@nestjs/testing";
import { ApiDomainController } from "./api-domain.controller";
import { HandlerGetFeature } from "src/handler/get-feature.handler";
import { CognitoAuthGuard } from "src/common/guards/cognito-auth.guard";
import { HTTPResponse } from "src/model/dto/http-response.model";
import { GetFeatureRequest } from "src/model/dto/feature.type";

describe("ApiDomainController", () => {
  let controller: ApiDomainController;
  let handlerGetFeature: HandlerGetFeature;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiDomainController],
      providers: [
        {
          provide: HandlerGetFeature,
          useValue: {
            execute: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    })
      .overrideGuard(CognitoAuthGuard)
      .useValue({
        canActivate: () => {
          return true;
        },
      })
      .compile();

    controller = module.get<ApiDomainController>(ApiDomainController);
    handlerGetFeature = module.get<HandlerGetFeature>(HandlerGetFeature);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call handlerGetFeature.execute with correct parameters", async () => {
    const email: GetFeatureRequest = { email: "test@example.com" };
    const result = {} as HTTPResponse;

    jest.spyOn(handlerGetFeature, "execute").mockResolvedValue(result);

    const response = await controller.getFeature(email);

    expect(handlerGetFeature.execute).toHaveBeenCalledWith(email);
    expect(response).toBe(result);
  });
});
