import {metrics} from '@opentelemetry/api';
import {ClsServiceManager} from 'nestjs-cls';
import {buildMeterName, getMeter, getTraceId} from './general.util';

jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn(),
  },
  metrics: {
    getMeter: jest.fn(),
  },
}));

jest.mock('nestjs-cls', () => ({
  ClsServiceManager: {
    getClsService: jest.fn(),
  },
}));

describe('GeneralUtils', () => {
  describe('getTraceId', () => {
    it('should return the trace id from ClsService', () => {
      const mockId = 'trace-id-123';
      (ClsServiceManager.getClsService as jest.Mock).mockReturnValue({
        getId: jest.fn().mockReturnValue(mockId),
      });

      const traceId = getTraceId();

      expect(ClsServiceManager.getClsService).toHaveBeenCalled();
      expect(traceId).toBe(mockId);
    });
  });

  describe('getMeter', () => {
    it('should return a meter', () => {
      const mockMeter = {};
      (metrics.getMeter as jest.Mock).mockReturnValue(mockMeter);

      const meter = getMeter();

      expect(metrics.getMeter).toHaveBeenCalledWith('default-meter');
      expect(meter).toBe(mockMeter);
    });
  });

  describe('buildMeterName', () => {
    it('should build a meter name with the service name', () => {
      process.env.SERVICE_NAME = 'test-service';
      const name = 'test-meter';

      const meterName = buildMeterName(name);

      expect(meterName).toBe('test-service_test-meter');
    });
  });
});
