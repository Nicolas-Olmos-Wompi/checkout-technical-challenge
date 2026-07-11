import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IUserRepository } from "domain/src/interface/user.repository";
import { User } from "domain/src/model/user.entity";
import { UserEntityMapper } from "../../../model/mapper/user-entity.mapper";
import { UserEntity } from "./user.entity";

export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });

    return entity ? UserEntityMapper.toModel(entity) : null;
  }

  async create(params: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const entity = this.repository.create(params);
    const savedEntity = await this.repository.save(entity);

    return UserEntityMapper.toModel(savedEntity);
  }
}
