import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
import {BatchSpanProcessor} from '@opentelemetry/sdk-trace-base';
import {NodeSDK} from '@opentelemetry/sdk-node';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-grpc';
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-grpc';
import {resourceFromAttributes} from '@opentelemetry/resources';
import {ATTR_SERVICE_NAME} from '@opentelemetry/semantic-conventions';
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics';
import {isProduction} from './common/utils/environment.util';

const ONE_MINUTE_IN_MS = 60 * 1000;
const TEN_SECONDS_IN_MS = 10 * 1000;

const traceExporter = new OTLPTraceExporter({
  url: process.env.GRAFANA_AGENT_URL,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: process.env.GRAFANA_AGENT_URL,
  }),
  exportIntervalMillis: isProduction() ? ONE_MINUTE_IN_MS : TEN_SECONDS_IN_MS,
});

const sdk = new NodeSDK({
  traceExporter,
  metricReader,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME,
  }),
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {enabled: false},
      '@opentelemetry/instrumentation-grpc': {enabled: false},
      '@opentelemetry/instrumentation-aws-lambda': {enabled: false},
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (req): boolean => {
          return req.url === '/health';
        },
      },
      '@opentelemetry/instrumentation-aws-sdk': {
        enabled: true,
        suppressInternalInstrumentation: true,
      },
    }),
  ],
});

export default sdk;
