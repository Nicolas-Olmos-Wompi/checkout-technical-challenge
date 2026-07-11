import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "../../../../domain/src/model/order.entity";
import type { OrderStatus } from "../../../../domain/src/model/order-status";

@Entity("orders")
export class OrderEntity extends Order {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ name: "user_id", type: "uuid" })
  declare userId: string;

  @Column({ name: "product_id", type: "uuid" })
  declare productId: string;

  @Column({ type: "int" })
  declare quantity: number;

  @Column({ name: "total_in_cents", type: "int" })
  declare totalInCents: number;

  @Column({
    type: "varchar",
    length: 20,
    default: "PENDING",
  })
  declare status: OrderStatus;

  @Column({
    name: "payment_gateway_transaction_id",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  declare paymentGatewayTransactionId: string | null;

  @Column({ name: "acceptance_token_end_user_policy", type: "text" })
  declare acceptanceTokenEndUserPolicy: string;

  @Column({ name: "acceptance_token_personal_data_auth", type: "text" })
  declare acceptanceTokenPersonalDataAuth: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  declare createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  declare updatedAt: Date;
}
