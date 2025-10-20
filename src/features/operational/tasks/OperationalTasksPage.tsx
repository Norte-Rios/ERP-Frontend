import React, { useState, useEffect } from 'react';
import { TaskBoard, Task } from '../../admin/tasks/types';
import { User, Calendar, MessageSquare } from 'lucide-react';

// Componente para exibir as etiquetas coloridas (reutilizado)
const TaskTags = ({ tagIds, tags }) => {
  if (!tagIds || tagIds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tagIds.map(tagId => {
        const tag = tags[tagId];
        if (!tag) return null;
        return (
          <span key={tag.id} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tag.color}`}>
            {tag.name}
          </span>
        );
      })}
    </div>
  );
};

// Cartão de Tarefa (sem a funcionalidade de arrastar e soltar por enquanto)
const TaskCard = ({ task, tags }) => {
  return (
    <div
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-pointer transition-all"
    >
      <h4 className="font-semibold text-sm text-gray-800 mb-2">{task.title}</h4>
      <TaskTags tagIds={task.tagIds} tags={tags} />
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
           {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
                <MessageSquare size={12}/>
                <span>{task.comments.length}</span>
            </div>
           )}
        </div>
        {task.assignee && (
           <div className="flex items-center gap-1" title={task.assignee.name}>
             <User size={14} />
             <span className="font-medium">{task.assignee.name.split(' ')[0]}</span>
           </div>
        )}
      </div>
    </div>
  );
};

interface OperationalTasksPageProps {
  taskBoard: TaskBoard;
  currentUser: { id: string; fullName: string }; // ID e nome do usuário operacional logado
}

const OperationalTasksPage: React.FC<OperationalTasksPageProps> = ({ taskBoard, currentUser }) => {
  const [userBoard, setUserBoard] = useState<TaskBoard | null>(null);

  useEffect(() => {
    if (taskBoard && currentUser) {
      // Filtra o quadro para mostrar apenas as tarefas do usuário atual
      const userTaskIds = Object.keys(taskBoard.tasks).filter(
        taskId => taskBoard.tasks[taskId].assignee?.id === currentUser.id
      );

      const filteredBoard: TaskBoard = {
        ...taskBoard,
        tasks: userTaskIds.reduce((acc, taskId) => {
          acc[taskId] = taskBoard.tasks[taskId];
          return acc;
        }, {}),
        columns: Object.fromEntries(
          Object.entries(taskBoard.columns).map(([columnId, column]) => [
            columnId,
            {
              ...column,
              taskIds: column.taskIds.filter(taskId => userTaskIds.includes(taskId)),
            },
          ])
        ),
      };
      setUserBoard(filteredBoard);
    }
  }, [taskBoard, currentUser]);

  if (!userBoard) {
    return <div>A carregar o quadro de tarefas...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minhas Tarefas</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {userBoard.columnOrder.map(columnId => {
          const column = userBoard.columns[columnId];
          const tasks = column.taskIds.map(taskId => userBoard.tasks[taskId]).filter(Boolean);

          return (
            <div
              key={column.id}
              className="bg-gray-100 rounded-lg p-3 min-h-[300px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-gray-700">{column.title} <span className="text-sm text-gray-400 font-normal">{tasks.length}</span></h3>
              </div>
              <div className="space-y-3 flex-grow">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} tags={userBoard.tags} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperationalTasksPage;