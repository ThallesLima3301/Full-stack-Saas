import { api } from './api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  color: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: ProjectMember[];
  _count: {
    tasks: number;
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  joinedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

class ProjectService {
  async getAll(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  }

  async getById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  }

  async create(data: CreateProjectData): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateProjectData>): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }

  async addMember(projectId: string, email: string, role?: string): Promise<ProjectMember> {
    const response = await api.post<ProjectMember>(`/projects/${projectId}/members`, {
      email,
      role,
    });
    return response.data;
  }
}

export const projectService = new ProjectService();