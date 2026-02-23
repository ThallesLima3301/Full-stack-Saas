import { useState, useEffect, useCallback } from 'react';
import { projectService, Project } from '../services/project.service'; // <-- Caminho correto

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (name: string, description?: string) => {
    const newProject = await projectService.create({ name, description });
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
  };
}