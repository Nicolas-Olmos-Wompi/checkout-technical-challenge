import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable, tap } from "rxjs";
import { HTTPResponse } from "../../model/dto/http-response.model";
import { ClsService } from "nestjs-cls";

@Injectable()
export class RestInterceptor implements NestInterceptor<HTTPResponse> {
  constructor(private readonly clsService: ClsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<HTTPResponse> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.url === "/health") return next.handle() as Observable<HTTPResponse>;
    const traceId = this.clsService.getId();

    Logger.log(`Start execution with trace_id ${traceId}`, req.url);

    return next.handle().pipe(
      tap({
        next: () => {
          Logger.log(`Execution finished with trace_id ${traceId}`);
        },
      }),
    );
  }
}
