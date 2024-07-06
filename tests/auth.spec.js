// tests/auth.spec.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Organisation = require('../models/Organisation');

describe('User Registration & Login', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://mohammedhardeeza:hadiza@cluster0.98vseka.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await User.deleteMany({});
    await Organisation.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('It should register user successfully with default organisation', async () => {
    const response = await request(app).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '123456789'
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.user.firstName).toBe('John');
    expect(response.body.data.user.email).toBe('john@example.com');
    expect(response.body.data.user.phone).toBe('123456789');
  });

  test('It should log the user in successfully', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
      password: 'password123'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.user.email).toBe('john@example.com');
  });

  test('It should fail if required fields are missing', async () => {
    const response = await request(app).post('/auth/register').send({
      firstName: 'Jane'
    });

    expect(response.statusCode).toBe(422);
    expect(response.body.errors[0].field).toBe('lastName');
  });

  test('It should fail if there’s duplicate email or userId', async () => {
    await request(app).post('/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '123456789'
    });

    const response = await request(app).post('/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      phone: '123456789'
    });

    expect(response.statusCode).toBe(422);
    expect(response.body.errors[0].field).toBe('email');
  });
});
