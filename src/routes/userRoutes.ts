// src/routes/userRoutes.ts
import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUserProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRegistration, validateLogin, validateProfileUpdate } from '../middleware/validationMiddleware';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, validateProfileUpdate, updateUserProfile);
router.delete('/profile', authenticate, deleteUserProfile);

export default router;