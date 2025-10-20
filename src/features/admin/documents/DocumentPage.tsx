import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Document } from './types';
import { File, UploadCloud, CheckCircle, XCircle, Eye, Send, Search, Filter, ArrowDownCircle } from 'lucide-react';

interface DocumentPageProps {
  documents: Document[];
}

const getStatusInfo = (status: Document['status']) => {
  switch (status) {
    case 'Enviado': return { icon: Send, color: 'text-blue-500' };
    case 'Visualizado': return { icon: Eye, color: 'text-purple-500' };
    case 'Aprovado': return { icon: CheckCircle, color: 'text-green-500' };
    case 'Rejeitado': return { icon: XCircle, color: 'text-red-500' };
    case 'Recebido': return { icon: ArrowDownCircle, color: 'text-gray-600' };
    default: return { icon: File, color: 'text-gray-500' };
  }
};

const DocumentCard = ({ doc }: { doc: Document }) => {
  const StatusIcon = getStatusInfo(doc.status).icon;
  const statusColor = getStatusInfo(doc.status).color;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg hover:ring-2 hover:ring-indigo-300 transition-all duration-200 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-800 line-clamp-2">{doc.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {doc.direction === 'sent' ? `Para: ${doc.recipient.name}` : `De: ${doc.sender.name}`}
            </p>
          </div>
          <File className="h-8 w-8 text-gray-300 flex-shrink-0" />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-xs text-gray-400 truncate pr-2">{doc.fileName}</p>
        <div className="flex items-center text-sm flex-shrink-0">
          <StatusIcon className={`h-4 w-4 mr-1 ${statusColor}`} />
          <span className={`font-semibold ${statusColor}`}>{doc.status}</span>
        </div>
      </div>
    </div>
  );
};


const DocumentPage: React.FC<DocumentPageProps> = ({ documents }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        if (activeTab === 'all') return true;
        return doc.direction === activeTab;
      })
      .filter(doc => {
        if (filterStatus === 'Todos') return true;
        return doc.status === filterStatus;
      })
      .filter(doc => {
        const term = searchTerm.toLowerCase();
        return doc.title.toLowerCase().includes(term) || 
               doc.fileName.toLowerCase().includes(term) ||
               doc.recipient.name.toLowerCase().includes(term) ||
               doc.sender.name.toLowerCase().includes(term);
      });
  }, [documents, activeTab, searchTerm, filterStatus]);


  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    alert(`Arquivo "${e.dataTransfer.files[0].name}" solto! (Funcionalidade a ser implementada)`);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Documentos</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
           <button onClick={() => setIsUploading(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold flex items-center gap-2">
            <UploadCloud size={18} />
            Enviar
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
         <div className="flex border-b">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Todos</button>
            <button onClick={() => setActiveTab('sent')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'sent' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Enviados</button>
            <button onClick={() => setActiveTab('received')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'received' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Recebidos</button>
        </div>
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option>Todos</option>
              <option>Enviado</option>
              <option>Recebido</option>
              <option>Visualizado</option>
              <option>Aprovado</option>
              <option>Rejeitado</option>
            </select>
        </div>
      </div>

      {isUploading && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsUploading(false)}
        >
          <div 
            className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enviar Novo Documento</h3>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-indigo-500"
            >
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">Arraste e solte o arquivo aqui</p>
              <p className="text-xs text-gray-500">ou clique para selecionar</p>
            </div>
             <p className="text-center text-gray-500 my-4">OU</p>
             <button className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
              Selecionar Arquivo do Computador
            </button>
          </div>
        </div>
      )}

      {/* Grelha de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredDocuments.map((doc) => (
          <Link to={`/documents/${doc.id}`} key={doc.id} className="block">
            <DocumentCard doc={doc} />
          </Link>
        ))}
      </div>
       {filteredDocuments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum documento encontrado.</p>
            <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}
    </div>
  );
};

export default DocumentPage;