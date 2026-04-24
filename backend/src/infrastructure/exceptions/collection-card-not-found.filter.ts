import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CollectionCardNotFoundException } from '../../domain/exceptions/collection-card-not-found.exception';

@Catch(CollectionCardNotFoundException)
export class CollectionCardNotFoundFilter implements ExceptionFilter {
  catch(exception: CollectionCardNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
    });
  }
}
