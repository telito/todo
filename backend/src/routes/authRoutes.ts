import { Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware';
import { assertUserId } from '../middleware/errorHandler';
import {
  clearAuthCookie,
  getUserById,
  loginUser,
  registerUser,
  setAuthCookie,
  signToken,
} from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const user = await registerUser(email ?? '', password ?? '');
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({ user });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const user = await loginUser(email ?? '', password ?? '');
    const token = signToken(user.id);
    setAuthCookie(res, token);
    res.json({ user });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    clearAuthCookie(res);
    res.json({ message: 'Logged out' });
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const user = await getUserById(userId);
    res.json({ user });
  })
);

export default router;
