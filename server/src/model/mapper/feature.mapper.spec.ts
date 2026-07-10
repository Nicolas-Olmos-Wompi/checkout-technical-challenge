import {GetFeatureMapper} from './feature.mapper';
import {GetFeatureRequest} from '../dto/feature.type';

describe('GetFeatureMapper', () => {
  describe('toModel', () => {
    it('should return the user email from the request', () => {
      // Arrange
      const request: GetFeatureRequest = {
        email: 'test@example.com',
      };

      // Act
      const result = GetFeatureMapper.toModel(request);

      // Assert
      expect(result.email).toBe(`DOMAIN#${request.email}`);
    });
  });
});
