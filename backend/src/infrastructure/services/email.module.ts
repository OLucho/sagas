import { Module } from '@nestjs/common';
import { NodemailerEmailService } from './nodemailer-email.service';

@Module({
  providers: [
    {
      provide: 'IEmailService',
      useClass: NodemailerEmailService,
    },
  ],
  exports: ['IEmailService'],
})
export class EmailModule {}
