// tests/auth.spec.js
jest.setTimeout(30000); // Set timeout to 30 seconds

import request from 'supertest';
import { app } from '../index.js';
import { User, Organisation, UserOrganisation, sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';

describe('Authentication and Organisation Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      userId: 'John_1720546838335',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      phone: '1234567890',
    });
  });

  it('should register a user successfully', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '0987654321',
      });

    expect(res.status).toBe(201);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).toHaveProperty('userId');
  });

  it('should login a user successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should get a user by ID', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/users/John_1720546838335')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('userId');
  });

  it('should get all organizations the user belongs to', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data.organisations).toBeInstanceOf(Array);
  });

  it('should get a single organization by ID', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/organisations/jamieraOrganisation_org_1720549897596')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty('orgId');
  });

  it('should add a user to an organization', async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .post('/api/organisations/jamieraOrganisation_org_1720549897596/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'John_1720546838335' });

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('message', 'User added to organisation successfully');
  });

  it('should fail to register a user with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      });

    expect(res.status).toBe(422);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body).toHaveProperty('status', 'Bad request');
    expect(res.body).toHaveProperty('message', 'Registration unsuccessful');
  });

  it('should fail to register a user with missing fields', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jack',
        email: 'jack.doe@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(422);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.errors).toBeInstanceOf(Array);
  });
});
