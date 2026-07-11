import { ClsServiceManager } from "nestjs-cls";

export const getTraceId = (): string =>
  ClsServiceManager.getClsService().getId();
