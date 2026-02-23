import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema, refreshTokenSchema } from '../../utils/validators';
import { AppError } from '../../middleware/errorHandler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data);
    
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data);
    
    res.json({
      success: true,
      data: result,
    });
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const tokens = await AuthService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: tokens,
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError('Não autenticado', 401);
    }

    await AuthService.logout(userId, refreshToken);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError('Não autenticado', 401);
    }

    const user = await AuthService.getProfile(userId);
    
    res.json({
      success: true,
      data: user,
    });
  });
}