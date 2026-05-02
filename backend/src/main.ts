import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './infrastructure/exceptions/domain-exception.filter';
import { UserAlreadyExistsFilter } from './infrastructure/exceptions/user-already-exists.filter';
import { ListAlreadyExistsFilter } from './infrastructure/exceptions/list-already-exists.filter';
import { ListNotFoundFilter } from './infrastructure/exceptions/list-not-found.filter';
import { ListAccessDeniedFilter } from './infrastructure/exceptions/list-access-denied.filter';
import { UserNotFoundFilter } from './infrastructure/exceptions/user-not-found.filter';
import { CollectionCardNotFoundFilter } from './infrastructure/exceptions/collection-card-not-found.filter';
import { EmailDeliveryFilter } from './infrastructure/exceptions/email-delivery.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    const orm = app.get(MikroORM);
    await orm.getSchemaGenerator().ensureDatabase();
    await orm.getSchemaGenerator().updateSchema();
  }

  if (process.env.NODE_ENV === 'production') {
    const orm = app.get(MikroORM);
    const migrator = orm.getMigrator();
    await migrator.up();
  }

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new UserAlreadyExistsFilter(),
    new ListAlreadyExistsFilter(),
    new ListNotFoundFilter(),
    new ListAccessDeniedFilter(),
    new UserNotFoundFilter(),
    new CollectionCardNotFoundFilter(),
    new EmailDeliveryFilter(),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
