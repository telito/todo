import { Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware';
import { assertUserId } from '../middleware/errorHandler';
import { getTaskInsights, improveTaskDescription } from '../services/aiService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authMiddleware);

router.post(
  '/improve-description',
  asyncHandler(async (req, res) => {
    assertUserId((req as AuthenticatedRequest).userId);
    const { title, roughDescription } = req.body as {
      title?: string;
      roughDescription?: string;
    };
    const result = await improveTaskDescription(title ?? '', roughDescription);
    res.json(result);
  })
);

router.post(
  '/insights',
  asyncHandler(async (req, res) => {
    assertUserId((req as AuthenticatedRequest).userId);
    const { description, finishDate } = req.body as {
      description?: string;
      finishDate?: string | null;
    };
    const result = await getTaskInsights(description ?? '', finishDate);
    res.json(result);
  })
);

export default router;
