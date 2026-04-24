import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import request from 'supertest';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { DomainExceptionFilter } from 'src/infrastructure/exceptions/domain-exception.filter';
import { UserAlreadyExistsFilter } from 'src/infrastructure/exceptions/user-already-exists.filter';
import { ListAlreadyExistsFilter } from 'src/infrastructure/exceptions/list-already-exists.filter';
import { ListNotFoundFilter } from 'src/infrastructure/exceptions/list-not-found.filter';
import { ListAccessDeniedFilter } from 'src/infrastructure/exceptions/list-access-denied.filter';

jest.setTimeout(30000);

export async function setupTestApp(): Promise<INestApplication> {
  const tmpDb = path.join(os.tmpdir(), `sagas-test-${(Math.random() * 1e18).toString(36)}.sqlite`);
  process.env.DB_NAME = tmpDb;

  // bust require cache so AppModule is re-evaluated with the new DB_NAME
  const appModulePath = require.resolve('../src/app.module');
  delete require.cache[appModulePath];
  const { AppModule } = require('../src/app.module');

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const orm = moduleFixture.get(MikroORM);
  await orm.schema.createSchema();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new UserAlreadyExistsFilter(),
    new ListAlreadyExistsFilter(),
    new ListNotFoundFilter(),
    new ListAccessDeniedFilter(),
  );

  await app.init();
  return app;
}

export async function teardownTestApp(app: INestApplication): Promise<void> {
  if (app) {
    const orm = app.get(MikroORM);
    await orm.close(true);
    await app.close();
    try {
      fs.unlinkSync(process.env.DB_NAME as string);
    } catch {
      // ignore
    }
  }
}

export { request };
