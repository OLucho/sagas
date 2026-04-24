import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ListAlreadyExistsException } from '../../domain/exceptions/list-exists.exception';

@Catch(ListAlreadyExistsException)
export class ListAlreadyExistsFilter implements ExceptionFilter {
  catch(exception: ListAlreadyExistsException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.CONFLICT).json({
      statusCode: HttpStatus.CONFLICT,
      message: exception.message,
    });
  }
}
