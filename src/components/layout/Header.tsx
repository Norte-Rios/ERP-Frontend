import { useState, useEffect, useMemo } from 'react';
import { Bell, FileText, Sun, Droplets, Wind } from 'lucide-react';

const Header = ({ documents, services }) => {
  // Estados para controlar a visibilidade dos dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  
  // Estado para simular dados do tempo
  const [weather, setWeather] = useState({ temp: 28, humidity: 45, condition: 'Ensolarado' });

  // Calcula o número de novos documentos e serviços
  const newDocsCount = useMemo(() => {
    return documents.filter(doc => doc.status === 'Recebido' || doc.status === 'Enviado').length;
  }, [documents]);

  const newServicesCount = useMemo(() => {
    return services.filter(service => service.status === 'Pendente').length;
  }, [services]);

  const totalNotifications = newDocsCount + newServicesCount;
  
  // Lógica para o lembrete de beber água
  const showWaterReminder = weather.temp > 25 || weather.humidity < 50;

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Título do Painel */}
      <h1 className="text-xl font-semibold text-gray-700">Painel do Administrador</h1>
      
      <div className="flex items-center gap-6">
        {/* Widget do Tempo */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
            <Sun size={20} className="text-yellow-500" />
            <div>
                <p className="font-semibold">{weather.temp}°C - {weather.condition}</p>
                {showWaterReminder && <p className="text-xs text-blue-500 font-bold animate-pulse">Beba água!</p>}
            </div>
        </div>

        {/* Ícones de Alerta */}
        <div className="flex items-center gap-4">
            {/* Alertas Gerais */}
            <div className="relative">
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                    className="relative text-gray-500 hover:text-gray-800"
                >
                    <Bell size={22} />
                    {totalNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{totalNotifications}</span>
                        </span>
                    )}
                </button>
                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-20">
                        <div className="p-3 font-bold border-b">Notificações</div>
                        <ul className="py-1">
                            {newServicesCount > 0 && (
                                <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <a href="/services">{newServicesCount} novo(s) serviço(s) solicitado(s).</a>
                                </li>
                            )}
                             {newDocsCount > 0 && (
                                <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <a href="/documents">{newDocsCount} novo(s) documento(s) na sua caixa.</a>
                                </li>
                            )}
                             {totalNotifications === 0 && (
                                <li className="px-4 py-2 text-sm text-gray-500">Nenhuma notificação nova.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;