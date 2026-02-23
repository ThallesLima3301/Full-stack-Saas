import { useState, useEffect, useCallback } from 'react';
import { taskService, Task, TaskStatus, KanbanBoard } from '../services/task.service';

export function useKanban(projectId: string) {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await taskService.getByProject(projectId);
      setBoard(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const moveTask = async (taskId: string, newStatus: TaskStatus, newOrder: number) => {
    // Optimistic update
    if (!board) return;

    const updatedTask = await taskService.reorder(taskId, newStatus, newOrder);
    
    // Recarrega o board para sincronizar
    await fetchBoard();
    
    return updatedTask;
  };

  const createTask = async (taskData: any) => {
    const newTask = await taskService.create({
      ...taskData,
      projectId,
    });
    await fetchBoard();
    return newTask;
  };

  return {
    board,
    loading,
    moveTask,
    createTask,
    refetch: fetchBoard,
  };
}