import {INestApplication, ValidationPipe} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {AppModule} from '../src/app.module';

describe('GET /products (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: true,
        skipNullProperties: true,
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return a paginated list of products with default pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body.code).toBe('OK');
    expect(response.body.data.page).toBe(1);
    expect(response.body.data.pageSize).toBe(10);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('should respect page and pageSize query params', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?page=1&pageSize=3')
      .expect(200);

    expect(response.body.data.pageSize).toBe(3);
    expect(response.body.data.items.length).toBeLessThanOrEqual(3);
  });

  it('should filter products by name', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?name=headphones')
      .expect(200);

    for (const item of response.body.data.items) {
      expect(item.name.toLowerCase()).toContain('headphones');
    }
  });

  it('should return prices as integers in cents with no conversion', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?page=1&pageSize=1')
      .expect(200);

    const [firstItem] = response.body.data.items;
    if (firstItem) {
      expect(Number.isInteger(firstItem.price)).toBe(true);
    }
  });
});
