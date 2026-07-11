import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import * as express from "express";
import { AuthenticatedUser } from "domain/src/model/auth.type";
import { HTTPResponse } from "../../../model/dto/http-response.model";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { HandlerCreateOrder } from "../../../handler/create-order.handler";
import { CreateOrderRequest } from "../../../model/dto/order.type";

@ApiTags("Orders")
@Controller("orders")
export class OrderController {
  constructor(private readonly handlerCreateOrder: HandlerCreateOrder) {}

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
}
