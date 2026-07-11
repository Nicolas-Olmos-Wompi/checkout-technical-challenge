import { OrderStatus } from "./order-status";

export class Order {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public quantity!: number;
  public totalInCents!: number;
  public status!: OrderStatus;
  public paymentGatewayTransactionId!: string | null;
  public acceptanceTokenEndUserPolicy!: string;
  public acceptanceTokenPersonalDataAuth!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}
