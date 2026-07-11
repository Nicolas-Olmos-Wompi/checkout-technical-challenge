import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Delivery } from "../../../../domain/src/model/delivery.entity";

@Entity("deliveries")
export class DeliveryEntity extends Delivery {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ name: "order_id", type: "uuid", unique: true })
  declare orderId: string;

  @Column({ name: "person_name", type: "varchar", length: 255 })
  declare personName: string;

  @Column({ type: "varchar", length: 255 })
  declare address: string;

  @Column({ type: "varchar", length: 255 })
  declare country: string;

  @Column({ type: "varchar", length: 255 })
  declare city: string;

  @Column({ type: "varchar", length: 255 })
  declare region: string;

  @Column({ name: "postal_code", type: "varchar", length: 20 })
  declare postalCode: string;

  @Column({ name: "phone_number", type: "varchar", length: 20 })
  declare phoneNumber: string;

  @Column({ type: "int", nullable: true })
  declare fee: number | null;
}
