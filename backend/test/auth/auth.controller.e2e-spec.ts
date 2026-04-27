import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp, request } from '../test-setup';

describe('Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /api/auth/signup', () => {
    it('should create a user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('userId');
          expect(response.body).toHaveProperty('username', 'testuser');
        });
    });

    it('should reject duplicate email with 409', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'another',
        })
        .expect(409)
        .then((response) => {
          expect(response.body.statusCode).toBe(409);
          expect(response.body.message).toBe('Ya existe un usuario con este email');
        });
    });

    it('should reject invalid email format with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'password123',
          username: 'baduser',
        })
        .expect(400);
    });

    it('should reject password too short with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'short@example.com',
          password: '123',
          username: 'shortpass',
        })
        .expect(400);
    });

    it('should reject username too short with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'short@example.com',
          password: 'password123',
          username: 'ab',
        })
        .expect(400);
    });

    it('should reject missing required fields with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'test@test.com' })
        .expect(400);
    });

    it('should reject unknown fields with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'password123',
          username: 'testuser2',
          unknownField: 'value',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'login@example.com',
          password: 'password123',
          username: 'loginuser',
        });
    });

    it('should sign in and return a token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('userId');
          expect(response.body).toHaveProperty('username', 'loginuser');
        });
    });

    it('should reject wrong password with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe('Email o contraseña incorrectos');
        });
    });

    it('should reject unknown email with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toBe('Email o contraseña incorrectos');
        });
    });

    it('should reject invalid email format with 400', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });
  });
});
