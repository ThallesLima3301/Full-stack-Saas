import { Router } from 'express';
import { TaskController } from './task.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', TaskController.create);
router.get('/project/:projectId', TaskController.findByProject);
router.get('/:id', TaskController.findById);
router.patch('/:id', TaskController.update);
router.patch('/:id/reorder', TaskController.reorder); // Para drag-and-drop
router.delete('/:id', TaskController.delete);

export default router;