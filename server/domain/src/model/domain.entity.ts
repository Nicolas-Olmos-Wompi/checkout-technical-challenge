import {DatabaseGenericFields} from './database-generic-fields.type';

class DomainEntity {
  public createdAt: string;
  public email: string;
  public name: string;
  public PK: string;
  public SK: string;
  public updatedAt: string;

  constructor(email: string, name: string, fields: DatabaseGenericFields) {
    this.email = email;
    this.name = name;
    this.updatedAt = fields.updatedAt;
    this.createdAt = fields.createdAt;
    this.SK = fields.SK;
    this.PK = fields.PK;
  }
}

export {DomainEntity};
