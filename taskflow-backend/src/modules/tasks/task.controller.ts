import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TaskService } from './task.service';
import { createTaskSchema, updateTaskSchema } from '../../utils/validators';
import { AppError } from '../../middleware/errorHandler';

export class TaskController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const data = createTaskSchema.parse(req.body);
    const task = await TaskService.create(userId, data);

    res.status(201).json({
      success: true,
      data: task,
    });
  });

  static findByProject = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { projectId } = req.params;
    const result = await TaskService.findByProject(projectId, userId);

    res.json({
      success: true,
      data: result,
    });
  });

  static findById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const task = await TaskService.findById(id, userId);

    res.json({
      success: true,
      data: task,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const data = updateTaskSchema.parse(req.body);
    const task = await TaskService.update(id, userId, data);

    res.json({
      success: true,
      data: task,
    });
  });

  static reorder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const { status, order } = req.body;
    
    if (!status || typeof order !== 'number') {
      throw new AppError('Status e ordem são obrigatórios', 400);
    }

    const task = await TaskService.reorder(id, userId, status, order);

    res.json({
      success: true,
      data: task,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const result = await TaskService.delete(id, userId);

    res.json({
      success: true,
      data: result,
    });
  });
}