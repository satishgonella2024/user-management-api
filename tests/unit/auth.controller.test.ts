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

  // Test cases for each endpoint
});