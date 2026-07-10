import { ImetaResponse } from "../interfaces/meta-response.interface";
import { getTraceId } from "src/common/utils/general.util";

export class HTTPResponse<T = unknown> {
  public meta?: ImetaResponse;
  public code: string;
  public message: string;
  public data?: T;
  public type?: string;

  constructor(
    public status: number,
    code: string,
    message: string,
    data?: T,
    type?: string,
  ) {
    this.meta = {
      trace_id: getTraceId(),
    };
    this.code = code;
    this.message = message;
    this.data = data;
    this.type = type;
  }
}
