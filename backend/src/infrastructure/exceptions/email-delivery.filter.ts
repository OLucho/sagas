import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EmailDeliveryException } from '../../domain/exceptions/email-delivery.exception';

@Catch(EmailDeliveryException)
export class EmailDeliveryFilter implements ExceptionFilter {
  catch(exception: EmailDeliveryException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'No se pudo enviar el email. Intenta de nuevo mas tarde.',
    });
  }
}