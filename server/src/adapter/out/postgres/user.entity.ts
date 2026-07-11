import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../../domain/src/model/user.entity";

@Entity("users")
export class UserEntity extends User {
  @PrimaryGeneratedColumn("uuid")
  declare id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  declare username: string;

  @Column({ type: "varchar", length: 255, unique: true })
  declare email: string;

  @Column({ name: "password_hash", type: "text" })
  declare passwordHash: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  declare createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  declare updatedAt: Date;
}
