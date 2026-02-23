import { api } from './api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  order: number;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: Tag[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface KanbanBoard {
  tasks: Task[];
  grouped: {
    TODO: Task[];
    IN_PROGRESS: Task[];
    REVIEW: Task[];
    DONE: Task[];
    CANCELLED: Task[];
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
  tagIds?: string[];
}

class TaskService {
  async getByProject(projectId: string): Promise<KanbanBoard> {
    const response = await api.get<KanbanBoard>(`/tasks/project/${projectId}`);
    return response.data;
  }

  async getById(id: string): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async create(data: CreateTaskData): Promise<Task> {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateTaskData>): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  }

  // Para drag-and-drop no Kanban
  async reorder(id: string, status: TaskStatus, order: number): Promise<Task> {
    const response = await api.patch<Task>(`/tasks/${id}/reorder`, {
      status,
      order,
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
}

export const taskService = new TaskService();