import {ENTITY_DONT_HAVE_RECORDS} from '../common/domain-general.vars';
import {IBackOfficeNotification} from '../interface/backoffice-notification.repository';
import {IDomainDataBaseRepository} from '../interface/domain-database.repository';
import {DomainEntity} from '../model/domain.entity';
import {UserEmail} from '../model/domain.type';
import {GetFeatureUseCase} from './get-feature.usecase';

describe('GetFeatureUseCase', () => {
  let getFeatureUseCase: GetFeatureUseCase;
  let mockRepository: IDomainDataBaseRepository;
  let mockBackOfficeNotification: IBackOfficeNotification;

  beforeEach(() => {
    mockRepository = {
      getFeatureBy: jest.fn(),
    };
    mockBackOfficeNotification = {
      sendCustomNotification: jest.fn(),
    };
    getFeatureUseCase = new GetFeatureUseCase(
      mockRepository,
      mockBackOfficeNotification
    );
  });

  it('should return sorted users by creation date', async () => {
    const mockUsers: DomainEntity[] = [
      {
        createdAt: '2',
        email: 'test2@test.com',
        name: 'test2',
        PK: '1',
        SK: '1',
        updatedAt: '1',
      },
      {
        createdAt: '1',
        email: 'test1@test.com',
        name: 'test2',
        PK: '2',
        SK: '1',
        updatedAt: '1',
      },
    ];
    const sortedMockUsers: DomainEntity[] = [
      {
        createdAt: '1',
        email: 'test1@test.com',
        name: 'test2',
        PK: '2',
        SK: '1',
        updatedAt: '1',
      },
      {
        createdAt: '2',
        email: 'test2@test.com',
        name: 'test2',
        PK: '1',
        SK: '1',
        updatedAt: '1',
      },
    ];
    const userEmail: UserEmail = {email: 'test@test.com'};

    jest.spyOn(mockRepository, 'getFeatureBy').mockResolvedValue(mockUsers);

    const result = await getFeatureUseCase.apply(userEmail);

    expect(result).toEqual(sortedMockUsers);
    expect(mockRepository.getFeatureBy).toHaveBeenCalledWith(userEmail.email);
    expect(
      mockBackOfficeNotification.sendCustomNotification
    ).toHaveBeenCalledWith('Get Feature');
  });

  it('should throw an error when no users are found', async () => {
    const userEmail: UserEmail = {email: 'test@test.com'};

    jest.spyOn(mockRepository, 'getFeatureBy').mockResolvedValue([]);

    await expect(getFeatureUseCase.apply(userEmail)).rejects.toThrow(
      ENTITY_DONT_HAVE_RECORDS
    );
    expect(mockRepository.getFeatureBy).toHaveBeenCalledWith(userEmail.email);
  });
});
