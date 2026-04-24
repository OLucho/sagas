import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ListNotFoundException } from '../../domain/exceptions/list-not-found.exception';

@Catch(ListNotFoundException)
export class ListNotFoundFilter implements ExceptionFilter {
  catch(exception: ListNotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
    });
  }
}
