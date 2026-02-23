import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateTaskInput, UpdateTaskInput } from '../../utils/validators';

export class TaskService {
  static async create(userId: string, data: CreateTaskInput) {
    // Check if user has access to project
    const hasAccess = await this.checkProjectAccess(data.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado ao projeto', 403);
    }

    // Get max order for the status column
    const maxOrderTask = await prisma.task.findFirst({
      where: { projectId: data.projectId, status: data.status || 'TODO' },
      orderBy: { order: 'desc' },
    });

    const newOrder = (maxOrderTask?.order || 0) + 1;
// No método create, substitua a criação da task:
const task = await prisma.task.create({
  data: {
    title: data.title,
    description: data.description,
    status: data.status || 'TODO',
    priority: data.priority || 'MEDIUM',
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    projectId: data.projectId,
    assigneeId: data.assigneeId,
    creatorId: userId,
    order: newOrder,
  },
  include: {
    assignee: {
      select: { id: true, name: true, avatar: true },
    },
    creator: {
      select: { id: true, name: true, avatar: true },
    },
    taskTags: {
      include: {
        tag: true,
      },
    },
    project: {
      select: { id: true, name: true, color: true },
    },
  },
});

// Se houver tags, criar as relações
if (data.tagIds && data.tagIds.length > 0) {
  await prisma.taskTag.createMany({
    data: data.tagIds.map(tagId => ({
      taskId: task.id,
      tagId,
    })),
  });
}

    // Create activity log
    await prisma.activity.create({
      data: {
        type: 'TASK_CREATED',
        description: `Tarefa "${task.title}" criada`,
        userId,
        projectId: data.projectId,
        taskId: task.id,
      },
    });

    return task;
  }

  static async findByProject(projectId: string, userId: string) {
    const hasAccess = await this.checkProjectAccess(projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado', 403);
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
      ],
    });

    // Group by status for Kanban board
    // No método findByProject, substitua:
const grouped = {
  TODO: tasks.filter((t: typeof tasks[0]) => t.status === 'TODO'),
  IN_PROGRESS: tasks.filter((t: typeof tasks[0]) => t.status === 'IN_PROGRESS'),
  REVIEW: tasks.filter((t: typeof tasks[0]) => t.status === 'REVIEW'),
  DONE: tasks.filter((t: typeof tasks[0]) => t.status === 'DONE'),
  CANCELLED: tasks.filter((t: typeof tasks[0]) => t.status === 'CANCELLED'),
};

    return { tasks, grouped };
  }

  static async findById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: true,
        tags: true,
      },
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const hasAccess = await this.checkProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado', 403);
    }

    return task;
  }

  static async update(taskId: string, userId: string, data: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const hasAccess = await this.checkProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado', 403);
    }

    // If status changed, update order
    let newOrder = data.order;
    if (data.status && data.status !== task.status) {
      const maxOrder = await prisma.task.findFirst({
        where: { 
          projectId: task.projectId, 
          status: data.status,
          id: { not: taskId },
        },
        orderBy: { order: 'desc' },
      });
      newOrder = (maxOrder?.order || 0) + 1;

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'TASK_MOVED',
          description: `Tarefa movida para ${data.status}`,
          userId,
          projectId: task.projectId,
          taskId,
        },
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeId: data.assigneeId === null ? null : data.assigneeId,
        order: newOrder,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    return updated;
  }

  static async reorder(taskId: string, userId: string, newStatus: string, newOrder: number) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const hasAccess = await this.checkProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado', 403);
    }

    // Reorder other tasks in the column
    if (task.status === newStatus) {
      // Moving within same column
      if (newOrder > task.order) {
        await prisma.task.updateMany({
          where: {
            projectId: task.projectId,
            status: newStatus,
            order: { gt: task.order, lte: newOrder },
            id: { not: taskId },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        await prisma.task.updateMany({
          where: {
            projectId: task.projectId,
            status: newStatus,
            order: { gte: newOrder, lt: task.order },
            id: { not: taskId },
          },
          data: { order: { increment: 1 } },
        });
      }
    } else {
      // Moving to different column
      // Decrement orders in old column
      await prisma.task.updateMany({
        where: {
          projectId: task.projectId,
          status: task.status,
          order: { gt: task.order },
        },
        data: { order: { decrement: 1 } },
      });

      // Increment orders in new column
      await prisma.task.updateMany({
        where: {
          projectId: task.projectId,
          status: newStatus,
          order: { gte: newOrder },
        },
        data: { order: { increment: 1 } },
      });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus as any,
        order: newOrder,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        tags: true,
      },
    });

    return updated;
  }

  static async delete(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const hasAccess = await this.checkProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new AppError('Acesso negado', 403);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Tarefa excluída com sucesso' };
  }

  private static async checkProjectAccess(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });

    return !!project;
  }
}