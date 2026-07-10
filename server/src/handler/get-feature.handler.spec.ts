import { Test, TestingModule } from "@nestjs/testing";
import { HandlerGetFeature } from "./get-feature.handler";
import { GetFeatureUseCase } from "../../domain/src/usecase/get-feature.usecase";
import { GetFeatureMapper } from "../model/mapper/feature.mapper";
import { HTTPResponse } from "../model/dto/http-response.model";
import { SUCCESS_STATES_MESSAGES } from "../common/response-states/success-states.messages";
import { HttpStatus } from "@nestjs/common";
import {
  GetFeatureRequest,
  GetFeatureResponse,
} from "../model/dto/feature.type";
import { UserEmail } from "../../domain/src/model/domain.type";
import { entitiesMock } from "__mocks__/dynamodb/data/data.mock";

describe("HandlerGetFeature", () => {
  let handler: HandlerGetFeature;
  let getFeatureUseCase: GetFeatureUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlerGetFeature,
        {
          provide: "GetFeatureUseCase",
          useValue: {
            apply: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<HandlerGetFeature>(HandlerGetFeature);
    getFeatureUseCase = module.get<GetFeatureUseCase>("GetFeatureUseCase");
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should return a successful HTTP response", async () => {
    const request: GetFeatureRequest = { email: "test@example.com" };
    const response: GetFeatureResponse[] = [
      {
        email: "test@example.com",
        id: "1",
        name: "name1",
      },
    ];

    jest.spyOn(GetFeatureMapper, "toModel").mockReturnValue(request);
    jest.spyOn(getFeatureUseCase, "apply").mockResolvedValue(entitiesMock);
    jest.spyOn(GetFeatureMapper, "toDTO").mockReturnValue(response);

    const result = await handler.execute(request);

    expect(result).toEqual(
      new HTTPResponse(
        HttpStatus.OK,
        SUCCESS_STATES_MESSAGES.Success.code,
        SUCCESS_STATES_MESSAGES.Success.message,
        response,
      ),
    );
  });

  it("should call GetFeatureMapper.toModel with the correct request", async () => {
    const request: GetFeatureRequest = { email: "test@example.com" };
    const toModelSpy = jest.spyOn(GetFeatureMapper, "toModel");

    await handler.execute(request);

    expect(toModelSpy).toHaveBeenCalledWith(request);
  });

  it("should call GetFeatureUseCase.apply with the correct command", async () => {
    const request: GetFeatureRequest = { email: "test@example.com" };
    const command: UserEmail = request;

    jest.spyOn(GetFeatureMapper, "toModel").mockReturnValue(command);

    await handler.execute(request);

    expect(getFeatureUseCase.apply).toHaveBeenCalledWith(command);
  });

  it("should call GetFeatureMapper.toDTO with the correct user", async () => {
    const request: GetFeatureRequest = { email: "test@example.com" };

    jest.spyOn(GetFeatureMapper, "toModel").mockReturnValue(request);
    jest.spyOn(getFeatureUseCase, "apply").mockResolvedValue(entitiesMock);
    const toDTOSpy = jest.spyOn(GetFeatureMapper, "toDTO");

    await handler.execute(request);

    expect(toDTOSpy).toHaveBeenCalledWith(entitiesMock);
  });
});
