import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ProjectService } from './project.service';
import { createProjectSchema } from '../../utils/validators';
import { AppError } from '../../middleware/errorHandler';

export class ProjectController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const data = createProjectSchema.parse(req.body);
    const project = await ProjectService.create(userId, data);

    res.status(201).json({
      success: true,
      data: project,
    });
  });

  static findAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { status, search } = req.query;
    const projects = await ProjectService.findAll(userId, {
      status: status as string,
      search: search as string,
    });

    res.json({
      success: true,
      data: projects,
    });
  });

  static findById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const project = await ProjectService.findById(id, userId);

    res.json({
      success: true,
      data: project,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const data = createProjectSchema.partial().parse(req.body);
    const project = await ProjectService.update(id, userId, data);

    res.json({
      success: true,
      data: project,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const result = await ProjectService.delete(id, userId);

    res.json({
      success: true,
      data: result,
    });
  });

  static addMember = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Não autenticado', 401);

    const { id } = req.params;
    const { email, role } = req.body;
    
    const member = await ProjectService.addMember(id, userId, email, role);

    res.status(201).json({
      success: true,
      data: member,
    });
  });
}