import React, { useState, useEffect } from 'react';
import { TaskBoard, Task, Comment, Tag } from './types';
import { PlusCircle, MoreHorizontal, User, Tag as TagIcon, Calendar, X, Edit, Trash2, MessageSquare, Settings } from 'lucide-react';
import { Consultant } from '../consultants/types';


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

// Modal para gerir as etiquetas
const ManageTagsModal = ({ isOpen, onClose, tags, onUpdateTags }) => {
  const [tagList, setTagList] = useState(Object.values(tags));
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('bg-blue-200 text-blue-800');

  useEffect(() => {
    setTagList(Object.values(tags));
  }, [tags]);

  const colorOptions = [
    { name: 'Azul', value: 'bg-blue-200 text-blue-800' },
    { name: 'Verde', value: 'bg-green-200 text-green-800' },
    { name: 'Vermelho', value: 'bg-red-200 text-red-800' },
    { name: 'Amarelo', value: 'bg-yellow-200 text-yellow-800' },
    { name: 'Roxo', value: 'bg-purple-200 text-purple-800' },
    { name: 'Rosa', value: 'bg-pink-200 text-pink-800' },
  ];

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag = {
        id: `tag-${Date.now()}`,
        name: newTagName.trim(),
        color: newTagColor,
      };
      const updatedTags = [...tagList, newTag];
      setTagList(updatedTags);
      onUpdateTags(updatedTags);
      setNewTagName('');
    }
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = tagList.filter(t => t.id !== tagId);
    setTagList(updatedTags);
    onUpdateTags(updatedTags);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Gerir Etiquetas</h3>
        <div className="mb-4 max-h-60 overflow-y-auto">
          <h4 className="font-semibold mb-2">Etiquetas existentes</h4>
          <div className="space-y-2">
            {tagList.map(tag => (
              <div key={tag.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className={`px-2 py-0.5 text-sm font-semibold rounded-full ${tag.color}`}>{tag.name}</span>
                <button onClick={() => handleDeleteTag(tag.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Criar nova etiqueta</h4>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Nome da etiqueta"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full input-style"
                />
                <select value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="input-style">
                    {colorOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                </select>
                <button onClick={handleAddTag} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold whitespace-nowrap">Adicionar</button>
            </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Fechar</button>
        </div>
      </div>
    </div>
  )
}

// Modal para criar nova tarefa
const NewTaskModal = ({ isOpen, onClose, onSave, members, columnId, allTags }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setDueDate('');
    setSelectedTagIds([]);
    setError('');
  }

  if (!isOpen) return null;

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
  }

  const handleSave = () => {
    if (!title.trim()) {
        setError("O título é obrigatório.");
        return;
    }
    const selectedAssignee = members.find(m => m.id === assigneeId);
    onSave({
      title,
      description,
      assignee: selectedAssignee ? { id: selectedAssignee.id, name: selectedAssignee.fullName } : undefined,
      dueDate,
      tagIds: selectedTagIds,
    }, columnId);
    resetForm();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Nova Tarefa</h3>
        <div className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Título da tarefa" 
              value={title} 
              onChange={e => { setTitle(e.target.value); setError(''); }} 
              className={`w-full input-style ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full input-style" rows={3}></textarea>
          <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full input-style">
            <option value="">Ninguém atribuído</option>
            {members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full input-style" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
                {Object.values(allTags || {}).map((tag: Tag) => (
                    <button key={tag.id} onClick={() => handleTagToggle(tag.id)} className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTagIds.includes(tag.id) ? tag.color + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-gray-200 text-gray-700'}`}>
                        {tag.name}
                    </button>
                ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Salvar</button>
        </div>
      </div>
    </div>
  );
};


// Modal para ver, editar e apagar tarefa
const TaskDetailModal = ({ isOpen, onClose, task, onSave, onDelete, onAddComment, members, allTags }) => {
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
          onAddComment(task.id, newComment.trim());
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
                {members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}
              </select>
              <input type="date" name="dueDate" value={editData.dueDate || ''} onChange={handleChange} className="w-full input-style" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <div className="p-2 min-h-[60px] border border-gray-200 rounded-md flex flex-wrap gap-2">
                    {Object.values(allTags || {}).map((tag: Tag) => (
                        <button key={tag.id} onClick={() => handleTagToggle(tag.id)} className={`px-3 py-1 text-sm rounded-full transition-colors ${editData.tagIds?.includes(tag.id) ? tag.color + ' ring-2 ring-offset-1 ring-indigo-500' : 'bg-gray-200 text-gray-700'}`}>
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


interface TaskBoardPageProps {
  initialBoard: TaskBoard;
  consultants: Consultant[];
  onUpdateTaskBoard: (newBoard: TaskBoard) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskComment: (taskId: string, commentText: string) => void;
  onUpdateTags: (tags: Tag[]) => void;
}

const TaskBoardPage = ({ initialBoard, consultants, onUpdateTaskBoard, onUpdateTask, onDeleteTask, onAddTaskComment, onUpdateTags }: TaskBoardPageProps) => {
  const [board, setBoard] = useState<TaskBoard>(initialBoard);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

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
    
    onUpdateTaskBoard(newBoard);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  
  const handleOpenNewTaskModal = (columnId: string) => {
    setTargetColumn(columnId);
    setIsNewTaskModalOpen(true);
  };
  
  const handleOpenDetailModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }
  
  const handleCloseModals = () => {
    setIsNewTaskModalOpen(false);
    setIsDetailModalOpen(false);
    setIsManageTagsModalOpen(false);
    setSelectedTask(null);
  }

  const handleAddTask = (taskData: Omit<Task, 'id' | 'comments'>, columnId: string) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = { id: newTaskId, ...taskData, comments: [] };

    const newBoard: TaskBoard = {
      ...board,
      tasks: { ...board.tasks, [newTaskId]: newTask },
      columns: {
        ...board.columns,
        [columnId]: {
          ...board.columns[columnId],
          taskIds: [newTaskId, ...board.columns[columnId].taskIds],
        },
      },
    };
    onUpdateTaskBoard(newBoard);
  };
  
  if (!board || !board.columnOrder) return <div>A carregar quadro...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
       <NewTaskModal 
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseModals}
        onSave={handleAddTask}
        members={consultants}
        columnId={targetColumn}
        allTags={board.tags}
      />
       <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModals}
        task={selectedTask}
        onSave={onUpdateTask}
        onDelete={onDeleteTask}
        onAddComment={onAddTaskComment}
        members={consultants}
        allTags={board.tags}
       />
       <ManageTagsModal
        isOpen={isManageTagsModalOpen}
        onClose={handleCloseModals}
        tags={board.tags}
        onUpdateTags={onUpdateTags}
       />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quadro de Tarefas da Equipa</h1>
        <button onClick={() => setIsManageTagsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <Settings size={16} />
          Gerir Etiquetas
        </button>
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
                <button onClick={() => handleOpenNewTaskModal(column.id)} className="text-gray-400 hover:text-indigo-600">
                  <PlusCircle size={20} />
                </button>
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

export default TaskBoardPage;