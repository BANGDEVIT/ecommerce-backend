import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import {
  buildApiErrorPayload,
  extractFromHttpExceptionBody,
  payloadFromUnknowException,
} from 'src/shared/helpers/api-error-response';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name); // khi log nào được log ra từ filter này thì có tên là AllExceptionsFilter
  }
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') return;
    const httpCtx = host.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();
    const ctx = {
      requestId: (req.headers['x-request-id'] as string) ?? '',
      path: req.url,
    };

    // http exceptions (NotFoundException, BadRequestException ...)
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const rawErrorResponse = exception.getResponse();

      // resBody is a string
      if (typeof rawErrorResponse === 'string') {
        res
          .status(statusCode)
          .json(
            buildApiErrorPayload(statusCode, rawErrorResponse, undefined, ctx),
          );
        return;
      }

      // resBody is an object
      const { message, error } = extractFromHttpExceptionBody(
        rawErrorResponse as Record<string, unknown>,
        exception.message,
      );

      res
        .status(statusCode)
        .json(buildApiErrorPayload(statusCode, message, error, ctx));
      return;
    }

    // unknow exceptions (database errors, 500 sever errors ...)
    this.logger.error({
      msg: 'unhandled.exception', // là 1 trường trong pino đặt nhãn cho log
      requestId: ctx.requestId,
      path: ctx.path,
      error:
        exception instanceof Error ? exception.message : 'Unknow exception',
      stack: exception instanceof Error ? exception.stack : undefined, // thông tin lỗi từ dòng nào hay hàm nào
    });

    const payload = payloadFromUnknowException(exception, ctx);
    res.status(payload.statusCode).json(payload);
    return;
  }
}
