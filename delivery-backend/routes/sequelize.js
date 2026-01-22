import express from 'express';
import { sequelizeRegister as hybridRegister, getSequelizeUser as getHybridUser } from '../controllers/sequelizeController.js';
import { authenticate as protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', hybridRegister);

// Protected routes
router.get('/user/:userId', protect, getHybridUser);

export default router;