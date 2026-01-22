import request from 'supertest';
import app from '../src/index.js';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

describe('User Management System', () => {
  let adminToken, customerToken, testUser, adminUser;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'Test123!',
      phone: '+1234567890',
      role: 'customer'
    });

    adminUser = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      password: 'Admin123!',
      phone: '+1234567891',
      role: 'admin'
    });

    // Generate tokens
    customerToken = generateToken({ userId: testUser.id, role: testUser.role });
    adminToken = generateToken({ userId: adminUser.id, role: adminUser.role });
  });

  afterAll(async () => {
    // Clean up test users
    await User.destroy({
      where: {
        email: ['test@example.com', 'admin@example.com']
      }
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
          phone: '+1234567892',
          role: 'customer'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john.doe@example.com');
    });

    it('should login a user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+1987654321'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.first_name).toBe('Updated');
    });

    it('should add a new address', async () => {
      const response = await request(app)
        .post('/api/users/addresses')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          label: 'Home',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: {
            lat: 40.7128,
            lng: -74.0060
          },
          isDefault: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.addresses).toHaveLength(1);
    });

    it('should update user preferences', async () => {
      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dietary: ['vegetarian'],
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.dietary).toContain('vegetarian');
    });
  });

  describe('Admin Functions', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
    });

    it('should get user statistics (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toBeDefined();
    });

    it('should not allow non-admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Features', () => {
    it('should change password', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          currentPassword: 'Test123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});