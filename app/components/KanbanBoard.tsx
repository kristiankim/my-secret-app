import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { Task, Column } from '../types/kanban';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import React from 'react';

type KanbanBoardProps = {
  columns: Column[];
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick?: (task: Task) => void;
  onDragEnd: (result: DropResult) => void;
  onDeleteTask: (task: Task) => void;
  onAddColumn: () => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onMarkTaskDone: (taskId: string) => void;
  onUndoTaskDone: (taskId: string) => void;
};

export default function KanbanBoard({ columns, tasks, onAddTask, onTaskClick, onDragEnd, onDeleteTask, onAddColumn, onRenameColumn, onDeleteColumn, onMarkTaskDone, onUndoTaskDone }: KanbanBoardProps) {
  const [showAddColumn, setShowAddColumn] = React.useState(false);
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-1 gap-4 overflow-x-auto px-8 py-6">
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex-1 min-w-[280px] max-w-xs bg-gray-50 rounded-lg p-4 mx-2"
              >
                <KanbanColumn
                  title={col.title}
                  onRename={(newTitle) => onRenameColumn(col.id, newTitle)}
                  onDelete={() => onDeleteColumn(col.id)}
                >
                  {col.id === 'todo' && (
                    <button
                      className="mb-4 w-full px-4 py-2 bg-blue-600 text-white rounded shadow"
                      onClick={onAddTask}
                    >
                      + Add task
                    </button>
                  )}
                  {tasks.filter((t) => t.columnId === col.id).map((task, idx) => (
                    <Draggable draggableId={task.id} index={idx} key={task.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <KanbanCard
                            title={task.title}
                            image={task.image}
                            description={task.description}
                            onClick={() => onTaskClick?.(task)}
                            done={task.done}
                            onMarkDone={() => onMarkTaskDone(task.id)}
                            onUndo={() => onUndoTaskDone(task.id)}
                            onDelete={() => onDeleteTask(task)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </KanbanColumn>
              </div>
            )}
          </Droppable>
        ))}
        {/* Add new column button/column, only on hover */}
        <div
          className="flex-1 min-w-[280px] max-w-xs mx-2 flex flex-col items-center justify-center"
          onMouseEnter={() => setShowAddColumn(true)}
          onMouseLeave={() => setShowAddColumn(false)}
        >
          {showAddColumn && (
            <div className="bg-gray-50 rounded-lg p-4 w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 opacity-50 transition-opacity duration-200">
              <button
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded shadow hover:bg-blue-200"
                onClick={onAddColumn}
                type="button"
              >
                + Add new
              </button>
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
} 