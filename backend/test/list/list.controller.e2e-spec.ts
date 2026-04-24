import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp, request } from '../test-setup';

describe('List Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();

    const signup = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'listuser@example.com',
        password: 'password123',
        username: 'listuser',
      });

    userId = signup.body.userId;

    const signin = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'listuser@example.com',
        password: 'password123',
      });

    authToken = signin.body.token;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /api/lists', () => {
    it('should create a list successfully', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Collection',
          isPublic: true,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('createdAt');
        });
    });

    it('should reject duplicate list name with 409', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Collection',
          isPublic: false,
        })
        .expect(409);
    });

    it('should reject missing auth header with 401', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .send({
          name: 'No Auth List',
          isPublic: true,
        })
        .expect(401);
    });

    it('should reject invalid auth token with 401', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: 'Bad Token List',
          isPublic: true,
        })
        .expect(401);
    });

    it('should reject missing name with 400', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isPublic: true,
        })
        .expect(400);
    });

    it('should reject unknown fields with 400', () => {
      return request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Valid Name',
          isPublic: true,
          unknownField: 'value',
        })
        .expect(400);
    });
  });

  describe('GET /api/lists', () => {
    it('should return user lists', () => {
      return request(app.getHttpServer())
        .get('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
        });
    });
  });

  describe('GET /api/lists/:id', () => {
    it('should return a list by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Public Test', isPublic: true });

      const listId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/lists/${listId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(listId);
          expect(response.body.name).toBe('Public Test');
        });
    });

    it('should return 404 for non-existent list', () => {
      return request(app.getHttpServer())
        .get('/api/lists/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /api/lists/:id', () => {
    it('should update a list', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'To Update', isPublic: false });

      const listId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name', isPublic: true })
        .expect(200)
        .then((response) => {
          expect(response.body.name).toBe('Updated Name');
          expect(response.body.isPublic).toBe(true);
        });
    });
  });

  describe('DELETE /api/lists/:id', () => {
    it('should delete a list', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'To Delete', isPublic: false });

      const listId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
