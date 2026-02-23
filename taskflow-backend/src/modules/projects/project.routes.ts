import { Router } from 'express';
import { ProjectController } from './project.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate); // Todas as rotas precisam de autenticação

router.post('/', ProjectController.create);
router.get('/', ProjectController.findAll);
router.get('/:id', ProjectController.findById);
router.patch('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);
router.post('/:id/members', ProjectController.addMember);

export default router;