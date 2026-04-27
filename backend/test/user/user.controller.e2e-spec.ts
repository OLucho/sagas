import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp, request } from '../test-setup';

describe('User Controller (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    const signup = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'usertest@test.com',
        password: 'password123',
        username: 'usertest',
      });

    userId = signup.body.userId;

    const signin = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'usertest@test.com',
        password: 'password123',
      });

    token = signin.body.token;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('GET /api/users/me', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });

    it('should return current user with token', () => {
      return request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(userId);
          expect(response.body.email).toBe('usertest@test.com');
          expect(response.body.username).toBe('usertest');
          expect(response.body).toHaveProperty('createdAt');
        });
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update username and return 200, then verify on GET', async () => {
      const patchResponse = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'updateduser' })
        .expect(200);

      expect(patchResponse.body.username).toBe('updateduser');

      const getResponse = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(getResponse.body.username).toBe('updateduser');
    });

    it('should reject invalid body with 400', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'ab' })
        .expect(400);
    });
  });
});
