import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ListAccessDeniedException } from '../../domain/exceptions/list-access-denied.exception';

@Catch(ListAccessDeniedException)
export class ListAccessDeniedFilter implements ExceptionFilter {
  catch(exception: ListAccessDeniedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      message: exception.message,
    });
  }
}
