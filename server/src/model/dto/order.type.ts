import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateDeliveryRequest {
  @IsString()
  personName!: string;

  @IsString()
  address!: string;

  @IsString()
  country!: string;

  @IsString()
  city!: string;

  @IsString()
  region!: string;

  @IsString()
  postalCode!: string;

  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fee?: number;
}

export class CreateOrderRequest {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @ValidateNested()
  @Type(() => CreateDeliveryRequest)
  delivery!: CreateDeliveryRequest;
}

export type DeliveryResponse = {
  id: string;
  personName: string;
  address: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  phoneNumber: string;
  fee: number | null;
};

export type AcceptanceTokenResponse = {
  acceptanceToken: string;
  permalink: string;
};

export type PendingOrderResponse = {
  orderId: string;
  reference: string;
  status: string;
  productId: string;
  quantity: number;
  total: number;
  delivery: DeliveryResponse;
  presignedAcceptance: {
    endUserPolicy: AcceptanceTokenResponse;
    personalDataAuth: AcceptanceTokenResponse;
  };
};
