import { Meter, Tracer, trace, metrics } from "@opentelemetry/api";
import { ClsServiceManager } from "nestjs-cls";

export const getTraceId = (): string =>
  ClsServiceManager.getClsService().getId();

export const getTracer = (): Tracer => trace.getTracer("default-tracer");

export const getMeter = (): Meter => metrics.getMeter("default-meter");

export const buildMeterName = (name: string): string =>
  `${process.env.SERVICE_NAME}_${name}`;
