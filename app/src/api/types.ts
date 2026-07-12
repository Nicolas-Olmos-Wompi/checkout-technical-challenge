/**
 * Mirrors server's HTTPResponse envelope (server/src/model/dto/http-response.model.ts).
 * Every response — success or error — is shaped like this.
 */
export type HttpResponseEnvelope<T = unknown> = {
  status: number;
  code: string;
  message: string;
  data?: T;
  type?: string;
  meta?: {
    trace_id?: string;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
