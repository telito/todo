import { Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/authMiddleware';
import { assertUserId } from '../middleware/errorHandler';
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectsByUser,
  updateProject,
} from '../services/projectService';
import { asyncHandler } from '../utils/asyncHandler';
import { getParam } from '../utils/params';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const projects = await getProjectsByUser(userId);
    res.json({ projects });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const project = await getProjectById(getParam(req.params.id), userId);
    res.json({ project });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const { name } = req.body as { name?: string };
    const project = await createProject(userId, name ?? '');
    res.status(201).json({ project });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    const { name } = req.body as { name?: string };
    const project = await updateProject(getParam(req.params.id), userId, name ?? '');
    res.json({ project });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = assertUserId((req as AuthenticatedRequest).userId);
    await deleteProject(getParam(req.params.id), userId);
    res.status(204).send();
  })
);

export default router;
