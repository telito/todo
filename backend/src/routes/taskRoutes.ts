import { Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware';
import { assertUserId } from '../middleware/errorHandler';
import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasksByUser,
  getTasksByProject,
  uncompleteTask,
  updateTask,
} from '../services/projectService';
import { asyncHandler } from '../utils/asyncHandler';
import { getParam } from '../utils/params';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const tasks = await getAllTasksByUser(userId);
    res.json({ tasks });
  })
);

router.get(
  '/project/:projectId',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const tasks = await getTasksByProject(getParam(req.params.projectId), userId);
    res.json({ tasks });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const { projectId, description, finishDate } = req.body as {
      projectId?: string;
      description?: string;
      finishDate?: string | null;
    };

    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    const task = await createTask(userId, projectId, description ?? '', finishDate);
    res.status(201).json({ task });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const { description, finishDate } = req.body as {
      description?: string;
      finishDate?: string | null;
    };
    const task = await updateTask(getParam(req.params.id), userId, { description, finishDate });
    res.json({ task });
  })
);

router.patch(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const task = await completeTask(getParam(req.params.id), userId);
    res.json({ task });
  })
);

router.patch(
  '/:id/uncomplete',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const task = await uncompleteTask(getParam(req.params.id), userId);
    res.json({ task });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    await deleteTask(getParam(req.params.id), userId);
    res.status(204).send();
  })
);

export default router;
