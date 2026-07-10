import {DomainEntity} from '../model/domain.entity';
import {IDomainDataBaseRepository} from '../interface/domain-database.repository';
import {UserEmail} from '../model/domain.type';
import {ENTITY_DONT_HAVE_RECORDS} from '../common/domain-general.vars';
import {IBackOfficeNotification} from '../interface/backoffice-notification.repository';

class GetFeatureUseCase {
  constructor(
    private readonly domainDataBaseRepository: IDomainDataBaseRepository,
    private readonly backOfficeNotification: IBackOfficeNotification
  ) {}

  public async apply(command: UserEmail): Promise<DomainEntity[]> {
    const users = await this.domainDataBaseRepository.getFeatureBy(
      command.email
    );

    if (this.usersIsEmpty(users)) throw new Error(ENTITY_DONT_HAVE_RECORDS);

    await this.backOfficeNotification.sendCustomNotification('Get Feature');
    return this.sortByCreateDate(users);
  }

  private usersIsEmpty(users: DomainEntity[]): boolean {
    return users.length === 0;
  }

  private sortByCreateDate(users: DomainEntity[]): DomainEntity[] {
    return users.sort(
      (firstElement: DomainEntity, secondElement: DomainEntity) =>
        Number.parseFloat(firstElement.createdAt) -
        Number.parseFloat(secondElement.createdAt)
    );
  }
}

export {GetFeatureUseCase};
