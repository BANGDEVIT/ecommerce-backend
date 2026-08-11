import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_ID_HEADER } from 'src/shared/constants/correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existing = req.headers[CORRELATION_ID_HEADER];
    const existingId = Array.isArray(existing) ? existing[0] : existing;

    const isValid = existingId && /^[a-zA-Z0-9-]{1,64}$/.test(existingId);
    const requestId = isValid ? existingId : randomUUID();

    req.headers[CORRELATION_ID_HEADER] = requestId;
    res.setHeader(CORRELATION_ID_HEADER, requestId);
    next();
  }
}
