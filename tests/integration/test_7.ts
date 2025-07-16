// src/tests/auth.controller.test.ts
import request from 'supertest';
import { app } from '../app';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { createJwtToken } from '../utils/jwt.utils';
import { hashPassword } from '../utils/password.utils';
import { connectDB, closeDB } from '../config/database';

// Mock the database models
jest.mock('../models/user.model');
jest.mock('../models/refreshToken.model');
jest.mock('../utils/jwt.utils');
jest.mock('../utils/password.utils');

describe('Auth Controller', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock hashPassword
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      
      // Mock User.create
      (User.create as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'user',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
      expect(User.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if email already exists', async () => {
      // Mock User.findOne to return a user (email exists)
      (User.findOne as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'existing@example.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email already in use');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too short
          firstName: '',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: 'user',
        validatePassword: jest.fn().mockResolvedValue(true)
      };

      // Mock User.findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock token creation
      (createJwtToken as jest.Mock).mockReturnValue('mock-access-token');
      
      // Mock RefreshToken.create
      (RefreshToken.create as jest.Mock).mockResolvedValue({
        id: 'refresh-123',
        token: 'mock-refresh-token',
        userId: '123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(mockUser.validatePassword).toHaveBeenCalledTimes(1);
    });

    it('should return 401 with invalid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: 'hashedPassword123',
        validatePassword: jest.fn().mockResolvedValue(false)
      };

      // Mock User.findOne to return a user
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
      expect(mockUser.validatePassword).toHaveBeenCalledTimes(1);
    });

    it('should return 401 if user not found', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should issue new tokens with valid refresh token', async () => {
      // Mock RefreshToken.findOne to return a valid token
      (RefreshToken.findOne as jest.Mock).mockResolvedValue({
        id: 'refresh-123',
        token: 'valid-refresh-token',
        userId: '123',
        expiresAt: new Date(Date.now() + 1000000),
        destroy: jest.fn()
      });

      // Mock User.findByPk to return a user
      (User.findByPk as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        role: 'user'
      });
      
      // Mock token creation
      (createJwtToken as jest.Mock).mockReturnValue('new-access-token');
      
      // Mock RefreshToken.create
      (RefreshToken.create as jest.Mock).mockResolvedValue({
        id: 'refresh-456',
        token: 'new-refresh-token',
        userId: '123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken', 'new-access-token');
      expect(response.body).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('should return 401 with invalid refresh token', async () => {
      // Mock RefreshToken.findOne to return null (token doesn't exist)
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalid-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token');
    });

    it('should return 401 with expired refresh token', async () => {
      // Mock RefreshToken.findOne to return an expired token
      (RefreshToken.findOne as jest.Mock).mockResolvedValue({
        id: 'refresh-123',
        token: 'expired-refresh-token',
        userId: '123',
        expiresAt: new Date(Date.now() - 1000), // Expired
        destroy: jest.fn()
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'expired-refresh-token'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Refresh token expired');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout user', async () => {
      // Mock RefreshToken.findOne to return a token
      const mockDestroy = jest.fn().mockResolvedValue(true);
      (RefreshToken.findOne as jest.Mock).mockResolvedValue({
        id: 'refresh-123',
        token: 'valid-refresh-token',
        destroy: mockDestroy
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'valid-refresh-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it('should return 200 even if token not found', async () => {
      // Mock RefreshToken.findOne to return null
      (RefreshToken.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: 'non-existent-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
});