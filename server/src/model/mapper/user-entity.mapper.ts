import { User } from "../../../domain/src/model/user.entity";
import { UserEntity } from "../../adapter/out/postgres/user.entity";

export class UserEntityMapper {
  public static toModel(userEntity: UserEntity): User {
    return userEntity;
  }
}
