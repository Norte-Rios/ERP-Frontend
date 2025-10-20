import React, { useState, useEffect } from 'react';
import { TaskBoard, Task, Comment, Tag } from '@/features/admin/tasks/types';
import { PlusCircle, User, Calendar, X, Edit, Trash2, MessageSquare, Settings } from 'lucide-react';
import { Consultant } from '@/features/admin/consultants/types';


// Componente para exibir as etiquetas coloridas
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


// Cartão de Tarefa clicável
const TaskCard = ({ task, onDragStart, onClick, tags }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onClick(task)}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-400 cursor-pointer transition-all"
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

// Modal para ver, editar e apagar tarefa
const TaskDetailModal = ({ isOpen, onClose, task, onSave, onDelete, onAddComment, members, allTags, currentConsultant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editData, setEditData] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (task) {
      setEditData(task);
      setIsEditing(false);
      setIsConfirmingDelete(false);
    }
  }, [task]);

  if (!isOpen || !task || !editData) return null;

  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  }

  const handleAddComment = () => {
      if(newComment.trim()) {
          onAddComment(task.id, newComment.trim(), currentConsultant.fullName);
          setNewComment('');
      }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(name === 'assigneeId') {
        const selectedAssignee = members.find(m => m.id === value);
        setEditData({
            ...editData,
            assignee: selectedAssignee ? { id: selectedAssignee.id, name: selectedAssignee.fullName } : undefined
        });
    } else {
        setEditData({ ...editData, [name]: value });
    }
  }

  const handleTagToggle = (tagId: string) => {
    const newTagIds = editData.tagIds?.includes(tagId) 
        ? editData.tagIds.filter(id => id !== tagId) 
        : [...(editData.tagIds || []), tagId];
    setEditData({ ...editData, tagIds: newTagIds });
  }

  const handleClose = () => {
    setIsEditing(false);
    setIsConfirmingDelete(false);
    onClose();
  }
  
  const renderContent = () => {
    if (isConfirmingDelete) {
        return (
            <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h3>
                <p>Tem a certeza de que deseja apagar a tarefa "{task.title}"? Esta ação não pode ser desfeita.</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Apagar Tarefa</button>
                </div>
            </>
        )
    }
    if (isEditing) {
        return (
          <>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Tarefa</h3>
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
              <input type="text" name="title" value={editData.title} onChange={handleChange} className="w-full input-style" />
              <textarea name="description" value={editData.description || ''} onChange={handleChange} className="w-full input-style" rows={3}></textarea>
              <select name="assigneeId" value={editData.assignee?.id || ''} onChange={handleChange} className="w-full input-style">
                <option value="">Ninguém atribuído</option>
                {/* O consultor só pode atribuir a ele mesmo ou a ninguém */}
                <option value={currentConsultant.id}>{currentConsultant.fullName}</option>
              </select>
              <input type="date" name="dueDate" value={editData.dueDate || ''} onChange={handleChange} className="w-full input-style" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(allTags || {}).map((tag: Tag) => (
                        <button key={tag.id} onClick={() => handleTagToggle(tag.id)} className={`px-3 py-1 text-sm rounded-full transition-transform transform hover:scale-105 ${editData.tagIds?.includes(tag.id) ? tag.color + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-gray-200 text-gray-700'}`}>
                            {tag.name}
                        </button>
                    ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar Alterações</button>
            </div>
          </>
        )
    }
    return (
        <>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            <div className="mb-4">
                <TaskTags tagIds={task.tagIds} tags={allTags} />
            </div>
            {task.description && <p className="text-gray-600 mb-4 whitespace-pre-wrap">{task.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                <div><strong className="block text-gray-500">Responsável:</strong> {task.assignee?.name || 'Ninguém'}</div>
                <div><strong className="block text-gray-500">Data de Entrega:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definida'}</div>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Atividade</h4>
                <div className="space-y-4 mb-4 max-h-40 overflow-y-auto">
                    {(task.comments || []).map((comment, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">{comment.author.charAt(0)}</div>
                            <div>
                                <p className="font-semibold text-sm">{comment.author} <span className="text-xs text-gray-400 font-normal">{new Date(comment.date).toLocaleString('pt-BR')}</span></p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Adicionar um comentário..." 
                        className="w-full input-style" 
                    />
                    <button onClick={handleAddComment} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Comentar</button>
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <button onClick={() => setIsConfirmingDelete(true)} className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-semibold flex items-center gap-2"><Trash2 size={16}/> Apagar</button>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold flex items-center gap-2"><Edit size={16}/> Editar</button>
        </div>
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};


interface ConsultantTasksPageProps {
  consultantTaskBoard: TaskBoard;
  currentConsultant: Consultant;
  onUpdateTaskBoard: (newBoard: TaskBoard) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskComment: (taskId: string, commentText: string, author: string) => void;
}

const ConsultantTasksPage = ({ 
    consultantTaskBoard, 
    currentConsultant, 
    onUpdateTaskBoard,
    onUpdateTask,
    onDeleteTask,
    onAddTaskComment
}: ConsultantTasksPageProps) => {
  const [board, setBoard] = useState<TaskBoard>(consultantTaskBoard);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setBoard(consultantTaskBoard);
  }, [consultantTaskBoard]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = Object.keys(board.columns).find(id => board.columns[id].taskIds.includes(taskId));
    if (!sourceColumnId || sourceColumnId === targetColumnId) return;

    const newBoard = { ...board };
    
    const sourceColumn = newBoard.columns[sourceColumnId];
    sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);

    const targetColumn = newBoard.columns[targetColumnId];
    targetColumn.taskIds.unshift(taskId);
    
    // Aqui precisamos de uma função que atualize o quadro inteiro
    onUpdateTaskBoard(newBoard);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  
  const handleOpenDetailModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }
  
  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  }
  
  if (!board || !board.columnOrder) return <div>A carregar quadro...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
       <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        task={selectedTask}
        onSave={onUpdateTask}
        onDelete={onDeleteTask}
        onAddComment={onAddTaskComment}
        members={[currentConsultant]} // Passa apenas o consultor atual
        allTags={board.tags}
        currentConsultant={currentConsultant}
       />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Minhas Tarefas</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {board.columnOrder.map(columnId => {
          const column = board.columns[columnId];
          const tasks = column.taskIds.map(taskId => board.tasks[taskId]).filter(Boolean);

          return (
            <div
              key={column.id}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragOver={handleDragOver}
              className="bg-gray-100 rounded-lg p-3 min-h-[300px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-gray-700">{column.title} <span className="text-sm text-gray-400 font-normal">{tasks.length}</span></h3>
              </div>
              <div className="space-y-3 flex-grow">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} onDragStart={handleDragStart} onClick={handleOpenDetailModal} tags={board.tags} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConsultantTasksPage;