import { useState } from 'react'; // <-- Se precisar de useState
import { useKanban } from '../hooks/useKanban';
import { TaskStatus } from '../services/task.service'; // <-- Importar tipo
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { board, loading, moveTask } = useKanban(projectId);

  if (loading || !board) return <div>Carregando...</div>;

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    await moveTask(
      draggableId, 
      destination.droppableId as TaskStatus, 
      destination.index
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status: string) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="kanban-column"
              >
                <h3>{status}</h3>
                {board.grouped[status as keyof typeof board.grouped]?.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="task-card"
                      >
                        <h4>{task.title}</h4>
                        <span className={`priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}