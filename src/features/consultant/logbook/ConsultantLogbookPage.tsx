import React, { useState } from 'react';
import { LogEntry, Announcement, LogComment } from '../../admin/logbook/types';
import { Megaphone, MessageSquare, Send } from 'lucide-react';
import { Consultant } from '../../admin/consultants/types';

// Props que a página irá receber
interface ConsultantLogbookPageProps {
  announcements: Announcement[];
  logEntries: LogEntry[];
  currentConsultant: Consultant;
  onAddEntry: (text: string, author: { id: string, name: string, avatarUrl: string }) => void;
  onAddComment: (entryId: string, text: string, author: { id: string, name: string, avatarUrl: string }) => void;
}

// Componente para um único anúncio (reutilizado)
const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => (
    <div className="bg-brand-yellow/20 p-4 rounded-lg border-l-4 border-brand-orange">
        <div className="flex items-start gap-3">
            <Megaphone className="h-6 w-6 text-brand-orange flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-gray-800">{announcement.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{announcement.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                    Publicado por {announcement.author} em {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
    </div>
);

// Componente para uma única entrada do diário (reutilizado com pequenas adaptações)
const LogEntryCard = ({ entry, onAddComment, currentConsultant }: { entry: LogEntry, onAddComment: (entryId: string, text: string, author: { id: string, name: string, avatarUrl: string }) => void, currentConsultant: Consultant }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            const author = {
                id: currentConsultant.id,
                name: currentConsultant.fullName,
                avatarUrl: `https://i.pravatar.cc/150?u=${currentConsultant.id}`
            };
            onAddComment(entry.id, commentText, author);
            setCommentText('');
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            {/* Cabeçalho da Entrada */}
            <div className="flex items-start gap-3">
                <img src={entry.author.avatarUrl} alt={entry.author.name} className="h-10 w-10 rounded-full" />
                <div>
                    <p className="font-semibold text-gray-800">{entry.author.name}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString('pt-BR')}</p>
                </div>
            </div>

            {/* Conteúdo da Entrada */}
            <p className="my-4 text-gray-700 whitespace-pre-wrap">{entry.text}</p>
            
            {/* Ações e Comentários */}
            <div className="border-t pt-3">
                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-teal"
                >
                    <MessageSquare size={16} />
                    {entry.comments.length > 0 ? `${entry.comments.length} Comentário(s)` : 'Comentar'}
                </button>
                
                {showComments && (
                    <div className="mt-4 space-y-4">
                        {/* Lista de Comentários */}
                        {entry.comments.map(comment => (
                             <div key={comment.id} className="flex items-start gap-3">
                                <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">{comment.author.name} <span className="text-xs text-gray-400 font-normal">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span></p>
                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                        {/* Input para novo comentário */}
                        <div className="flex items-center gap-2">
                             <input 
                                type="text"
                                placeholder="Escreva um comentário..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                className="w-full input-style text-sm"
                            />
                            <button onClick={handleCommentSubmit} className="p-2 bg-brand-teal text-white rounded-md hover:bg-brand-green-light">
                                <Send size={18}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConsultantLogbookPage: React.FC<ConsultantLogbookPageProps> = ({ announcements, logEntries, onAddEntry, onAddComment, currentConsultant }) => {
    const [newEntryText, setNewEntryText] = useState('');

    const handleAddEntry = () => {
        if(newEntryText.trim()) {
            const author = {
                id: currentConsultant.id,
                name: currentConsultant.fullName,
                avatarUrl: `https://i.pravatar.cc/150?u=${currentConsultant.id}`
            };
            onAddEntry(newEntryText, author);
            setNewEntryText('');
        }
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Diário de Bordo da Equipa</h1>

            {/* Secção de Anúncios */}
            <div className="mb-8">
                <h2 className="font-bold text-lg text-gray-700 mb-3">Mural de Avisos</h2>
                <div className="space-y-4">
                    {announcements.map(ann => <AnnouncementCard key={ann.id} announcement={ann} />)}
                </div>
            </div>

             {/* Caixa para Nova Entrada */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                <textarea
                    placeholder="Partilhe uma atualização, faça uma pergunta ou publique algo novo..."
                    value={newEntryText}
                    onChange={(e) => setNewEntryText(e.target.value)}
                    className="w-full input-style"
                    rows={3}
                ></textarea>
                <div className="flex justify-end mt-3">
                    <button 
                        onClick={handleAddEntry}
                        className="px-6 py-2 bg-brand-teal text-white rounded-md hover:bg-brand-green-light font-semibold"
                    >
                        Publicar
                    </button>
                </div>
            </div>
            
            {/* Linha do Tempo de Entradas */}
            <div className="space-y-6">
                {logEntries.map(entry => (
                    <LogEntryCard key={entry.id} entry={entry} onAddComment={onAddComment} currentConsultant={currentConsultant} />
                ))}
            </div>
        </div>
    );
};

export default ConsultantLogbookPage;