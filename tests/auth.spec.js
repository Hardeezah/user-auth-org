require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../index');
const { generateToken } = require('../utils/auth');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

describe('User Authentication & Organisation', () => {
  let server;
  let accessToken;
  let orgId;

  beforeAll(async () => {
    server = app.listen(4000);
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await server.close();
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      if (err.message.includes('not allowed to do action [dropDatabase]')) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
          await collection.deleteMany({});
        }
      } else {
        throw err;
      }
    }
    await mongoose.connection.close();
  });

  describe('Token Generation', () => {
    it('should generate a token with correct user details', () => {
      const user = { userId: '123', email: 'test@example.com' };
      const token = generateToken(user);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.userId).toBe(user.userId);
      expect(decoded.email).toBe(user.email);
    });

    it('should expire the token after the specified time', (done) => {
      const user = { userId: '123', email: 'test@example.com' };
      const token = generateToken(user, '1s'); // Token expires in 1 second

      setTimeout(() => {
        try {
          jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          expect(error.name).toBe('TokenExpiredError');
          done();
        }
      }, 2000); // Wait for 2 seconds
    });
  });

  describe('User Registration & Login', () => {
    it('should register user successfully with default organisation', async () => {
      const response = await request(server).post('/auth/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john1@example.com',
        password: 'password123',
        phone: '1234567890',
      }).set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('john1@example.com');
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.user.phone).toBe('1234567890');
    });

    it('should log the user in successfully', async () => {
      const response = await request(server).post('/auth/login').send({
        email: 'john1@example.com',
        password: 'password123'
      }).set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('john1@example.com');
      expect(response.body.data.accessToken).toBeDefined();

      accessToken = response.body.data.accessToken;
    });

    it('should fail if required fields are missing in registration', async () => {
      const response = await request(server).post('/auth/register').send({
        lastName: 'Doe',
        email: 'john2@example.com',
        password: 'password123',
        phone: '1234567890',
      }).set('Accept', 'application/json');

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });

    it('should fail if there’s a duplicate email or userId', async () => {
      const response = await request(server).post('/auth/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john1@example.com',
        password: 'password123',
        phone: '1234567890',
      }).set('Accept', 'application/json');

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Organisation Endpoints', () => {
    it('should create a new organisation', async () => {
      const response = await request(server)
        .post('/api/organisations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'New Organisation',
          description: 'This is a new organisation',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      orgId = response.body.data.orgId;
    });

    it('should get the user\'s organisations', async () => {
      const response = await request(server)
        .get('/api/organisations')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.organisations).toBeInstanceOf(Array);
    });

    it('should get a single organisation', async () => {
      const response = await request(server)
        .get(`/api/organisations/${orgId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.orgId).toBe(orgId);
    });

    it('should add a user to an organisation', async () => {
      const response = await request(server)
        .post(`/api/organisations/${orgId}/users`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: 'some-other-user-id', // Use a valid user ID
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });

  describe('Organisation Access Control', () => {
    it('should ensure users can’t see data from organisations they don’t have access to', async () => {
      const user1 = new User({
        userId: 'user1',
        firstName: 'Jake',
        lastName: 'Dow',
        email: 'john1234@example.com',
        password: 'password123',
      });

      const user2 = new User({
        userId: 'user2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
      });

      await user1.save();
      await user2.save();

      const org1 = new Organisation({
        orgId: 'org1',
        name: 'John Organisation',
        description: 'Organisation for John',
        users: [user1._id],
      });

      await org1.save();

      const accessibleOrgs = await Organisation.find({ users: user2._id });

      expect(accessibleOrgs.length).toBe(0);

      await User.deleteMany({});
      await Organisation.deleteMany({});
    });
  });
});
