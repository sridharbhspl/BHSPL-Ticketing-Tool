import { Router } from 'express';
import { getProjects, createProject, getProjectStats } from '../controllers/projectController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router.get('/:id/stats', getProjectStats);

export default router;
