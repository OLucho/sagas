import { INestApplication } from '@nestjs/common';
import { setupTestApp, teardownTestApp, request } from '../test-setup';

describe('Collection Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await setupTestApp();

    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'collectionuser@example.com',
        password: 'password123',
        username: 'collectionuser',
      });

    const signin = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'collectionuser@example.com',
        password: 'password123',
      });

    authToken = signin.body.token;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('GET /api/collections', () => {
    it('should return an empty array initially', () => {
      return request(app.getHttpServer())
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(0);
        });
    });
  });

  describe('POST /api/collections/:setId/cards/:cardId', () => {
    it('should add a card to the collection with variants', () => {
      return request(app.getHttpServer())
        .post('/api/collections/base1/cards/pikachu-001')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ variants: { normal: 1 } })
        .expect(201)
        .then((response) => {
          expect(response.body.updated).toBe(true);
        });
    });
  });

  describe('PATCH /api/collections/:setId/cards/:cardId', () => {
    it('should update the card variants', () => {
      return request(app.getHttpServer())
        .patch('/api/collections/base1/cards/pikachu-001')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ variants: { normal: 2, holo: 1 } })
        .expect(200)
        .then((response) => {
          expect(response.body.updated).toBe(true);
        });
    });
  });

  describe('GET /api/collections (after adding)', () => {
    it('should return the collection entry with the card', () => {
      return request(app.getHttpServer())
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(1);

          const entry = response.body[0];
          expect(entry).toHaveProperty('id');
          expect(entry.cardId).toBe('pikachu-001');
          expect(entry.setId).toBe('base1');
          expect(entry.variants).toEqual({ normal: 2, holo: 1 });
          expect(entry.needed).toBe(false);
        });
    });
  });

  describe('POST /api/collections/:setId/cards/:cardId/need', () => {
    it('should mark the card as needed', () => {
      return request(app.getHttpServer())
        .post('/api/collections/base1/cards/pikachu-001/need')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .then((response) => {
          expect(response.body.updated).toBe(true);
        });
    });

    it('should reflect needed=true in the collection list', () => {
      return request(app.getHttpServer())
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body.length).toBe(1);
          expect(response.body[0].needed).toBe(true);
        });
    });
  });

  describe('Authentication', () => {
    it('should reject requests without a token with 401', () => {
      return request(app.getHttpServer())
        .get('/api/collections')
        .expect(401);
    });

    it('should reject requests with an invalid token with 401', () => {
      return request(app.getHttpServer())
        .get('/api/collections')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
