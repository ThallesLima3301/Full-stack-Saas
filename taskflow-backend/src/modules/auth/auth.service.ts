import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  TokenPayload 
} from '../../utils/jwt';
import { hashPassword, comparePassword, hashToken } from '../../utils/hash';
import { LoginInput, RegisterInput } from '../../utils/validators';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return { user, ...tokens };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  static async refreshToken(token: string) {
    const hashedToken = hashToken(token);

    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.revoked) {
      throw new AppError('Token inválido', 401);
    }

    if (new Date() > refreshTokenRecord.expiresAt) {
      throw new AppError('Token expirado', 401);
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(
      refreshTokenRecord.user.id,
      refreshTokenRecord.user.email,
      refreshTokenRecord.user.role
    );

    return tokens;
  }

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { hashedToken, userId },
        data: { revoked: true },
      });
    } else {
      // Logout from all devices
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            ownedProjects: true,
            assignedTasks: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  private static async generateTokens(userId: string, email: string, role: string) {
    const payload: TokenPayload = { userId, email, role };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(refreshToken);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        hashedToken: hashedRefreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}