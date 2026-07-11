import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import * as express from "express";
import { AuthenticatedUser } from "domain/src/model/auth.type";
import { HTTPResponse } from "../../../model/dto/http-response.model";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { HandlerCreateOrder } from "../../../handler/create-order.handler";
import { HandlerPayOrder } from "../../../handler/pay-order.handler";
import { HandlerGetOrder } from "../../../handler/get-order.handler";
import {
  CreateOrderRequest,
  PayOrderRequest,
} from "../../../model/dto/order.type";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
  constructor(
    private readonly handlerCreateOrder: HandlerCreateOrder,
    private readonly handlerPayOrder: HandlerPayOrder,
    private readonly handlerGetOrder: HandlerGetOrder,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth("Bearer-Auth")
  @ApiCreatedResponse({ description: "Pending order created" })
  async createOrder(
    @Body() request: CreateOrderRequest,
    @Req() req: express.Request,
  ): Promise<HTTPResponse> {
    const user = req.user as AuthenticatedUser;
    return this.handlerCreateOrder.execute(user.id, request);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/pay")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("Bearer-Auth")
  @ApiOkResponse({ description: "Order payment processed" })
  async payOrder(
    @Param("id") id: string,
    @Body() request: PayOrderRequest,
    @Req() req: express.Request,
  ): Promise<HTTPResponse> {
    const user = req.user as AuthenticatedUser;
    return this.handlerPayOrder.execute(user.id, id, request);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("Bearer-Auth")
  @ApiOkResponse({ description: "Order details" })
  async getOrder(
    @Param("id") id: string,
    @Req() req: express.Request,
  ): Promise<HTTPResponse> {
    const user = req.user as AuthenticatedUser;
    return this.handlerGetOrder.execute(user.id, id);
  }
}
