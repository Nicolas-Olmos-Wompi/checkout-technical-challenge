import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  MinLength,
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
  totalInCents: number;
  delivery: DeliveryResponse;
  presignedAcceptance: {
    endUserPolicy: AcceptanceTokenResponse;
    personalDataAuth: AcceptanceTokenResponse;
  };
};

export class CardPaymentRequest {
  @IsString()
  cardNumber!: string;

  @IsString()
  @Length(2, 2)
  expMonth!: string;

  @IsString()
  @Length(2, 2)
  expYear!: string;

  @IsString()
  @Length(3, 4)
  cvc!: string;

  @IsString()
  @MinLength(5)
  cardHolder!: string;
}

export class PayOrderRequest {
  @IsIn(["CARD"])
  paymentMethodType!: "CARD";

  @ValidateNested()
  @Type(() => CardPaymentRequest)
  card!: CardPaymentRequest;
}

export type PayOrderResponse = {
  orderId: string;
  status: string;
  paymentGatewayTransactionId: string | null;
  timedOut: boolean;
  paymentMethod: {
    type: string;
    displayInfo: Record<string, string>;
  };
};

export type OrderResponse = {
  orderId: string;
  productId: string;
  quantity: number;
  totalInCents: number;
  status: string;
  paymentGatewayTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
