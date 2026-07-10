import {GetServerHealthStatusMapper} from './get-server-health-status.mapper';

describe('GetServerHealthStatusMapper', () => {
  describe('toDTO', () => {
    it('should return "I\'m alive!" when health status is true', () => {
      const healthStatus = true;
      const result = GetServerHealthStatusMapper.toDTO(healthStatus);
      expect(result).toBe("I'm alive!");
    });

    it('should return "Database issue. Unhealthy" when health status is false', () => {
      const healthStatus = false;
      const result = GetServerHealthStatusMapper.toDTO(healthStatus);
      expect(result).toBe('Database issue. Unhealthy');
    });
  });
});
