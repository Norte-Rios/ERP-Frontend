import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Document } from '@/features/admin/documents/types';
import { FileText, Send, User, Clock, ArrowRight } from 'lucide-react';

interface ConsultantDocumentDetailPageProps {
  documents: Document[];
  onAddComment: (documentId: string, commentText: string) => void;
  consultantName: string;
}

const getStatusInfo = (status: Document['status'] | string) => {
  switch (status) {
    case 'Enviado': return { text: 'Enviado', color: 'text-blue-500 bg-blue-100' };
    case 'Visualizado': return { text: 'Visualizado', color: 'text-purple-500 bg-purple-100' };
    case 'Aprovado': return { text: 'Aprovado', color: 'text-green-500 bg-green-100' };
    case 'Rejeitado': return { text: 'Rejeitado', color: 'text-red-500 bg-red-100' };
    case 'Recebido': return { text: 'Recebido', color: 'text-gray-600 bg-gray-200' };
    default: return { text: status, color: 'text-gray-500 bg-gray-100' };
  }
};

const ConsultantDocumentDetailPage: React.FC<ConsultantDocumentDetailPageProps> = ({ documents, onAddComment }) => {
  const { documentId } = useParams<{ documentId: string }>();
  const document = documents.find(d => d.id === documentId);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document && newComment.trim()) {
      onAddComment(document.id, newComment.trim());
      setNewComment('');
    }
  };

  if (!document) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold text-red-600">Documento não encontrado!</h2>
        <Link to="/consultant/documents" className="text-indigo-600 hover:underline mt-4 inline-block">
          Voltar para a lista de documentos
        </Link>
      </div>
    );
  }

  const { color: statusColor, text: statusText } = getStatusInfo(document.status);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/consultant/documents" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de documentos
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{document.title}</h2>
            <div className="flex items-center text-gray-500 text-sm mt-2">
              <span>{document.sender.name}</span>
              <ArrowRight className="h-4 w-4 mx-2" />
              <span>{document.recipient.name} ({document.recipient.type})</span>
            </div>
          </div>
          <div className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
            {statusText}
          </div>
        </div>

        <section className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Documento</h3>
          <div className="bg-gray-50 p-6 rounded-lg flex items-center gap-4 border border-gray-200">
            <FileText className="h-10 w-10 text-indigo-500" />
            <div>
              <p className="font-semibold text-gray-800">{document.fileName}</p>
              <p className="text-sm text-gray-500">
                Enviado em: {new Date(document.sentAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <a href="#" className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold">
              Baixar
            </a>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Histórico</h3>
            <ul className="space-y-4">
              {document.history.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-800">{item.status}</p>
                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleString('pt-BR')}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Comentários</h3>
            <div className="space-y-6">
              {document.comments.map((comment, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">{comment.author.charAt(0)}</div>
                    </div>
                    <div className="ml-4 bg-gray-100 p-3 rounded-lg flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-900">{comment.author}</p>
                        <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleString('pt-BR')}</p>
                      </div>
                      <p className="mt-1 text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-6 pt-6 border-t">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Adicionar um comentário..."
                className="w-full input-style"
              ></textarea>
              <div className="flex justify-end mt-3">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold flex items-center gap-2">
                  <Send size={16} /> Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDocumentDetailPage;