import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateProjectInput } from '../../utils/validators';

export class ProjectService {
  static async create(userId: string, data: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return project;
  }

  static async findAll(userId: string, filters?: { status?: string; search?: string }) {
    const where = {
      AND: [
        {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        filters?.status ? { status: filters.status as any } : {},
        filters?.search ? {
          name: { contains: filters.search, mode: 'insensitive' as any },
        } : {},
      ],
    };

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { 
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return projects;
  }

  static async findById(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            tags: true,
          },
          orderBy: [
            { status: 'asc' },
            { order: 'asc' },
          ],
        },
        tags: true,
      },
    });

    if (!project) {
      throw new AppError('Projeto não encontrado', 404);
    }

    return project;
  }

  static async update(projectId: string, userId: string, data: Partial<CreateProjectInput>) {
    // Check permissions
    const membership = await this.checkPermission(projectId, userId, ['OWNER', 'ADMIN']);
    
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    return project;
  }

  static async delete(projectId: string, userId: string) {
    // Only owner can delete
    await this.checkPermission(projectId, userId, ['OWNER']);

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DELETED' },
    });

    return { message: 'Projeto excluído com sucesso' };
  }

  static async addMember(projectId: string, ownerId: string, memberEmail: string, role: string = 'MEMBER') {
    await this.checkPermission(projectId, ownerId, ['OWNER', 'ADMIN']);

    const user = await prisma.user.findUnique({
      where: { email: memberEmail },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new AppError('Usuário já é membro do projeto', 400);
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: role as any,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    return member;
  }

  private static async checkPermission(projectId: string, userId: string, allowedRoles: string[]) {
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        role: { in: allowedRoles as any },
      },
    });

    if (!member) {
      throw new AppError('Permissão negada', 403);
    }

    return member;
  }
}