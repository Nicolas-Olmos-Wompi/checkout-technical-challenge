import { ClsServiceManager } from "nestjs-cls";
import { getTraceId } from "./general.util";

jest.mock("nestjs-cls", () => ({
  ClsServiceManager: {
    getClsService: jest.fn(),
  },
}));

describe("GeneralUtils", () => {
  describe("getTraceId", () => {
    it("should return the trace id from ClsService", () => {
      const mockId = "trace-id-123";
      (ClsServiceManager.getClsService as jest.Mock).mockReturnValue({
        getId: jest.fn().mockReturnValue(mockId),
      });

      const traceId = getTraceId();

      expect(ClsServiceManager.getClsService).toHaveBeenCalled();
      expect(traceId).toBe(mockId);
    });
  });
});
