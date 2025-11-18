import React from 'react';
import { Link } from 'react-router-dom'; // Opcional, se precisar de links internos

const PrivacyPolicyPage = () => {
  return (
    // Use um container similar ao resto da sua aplicação
    <div className="container mx-auto max-w-4xl p-6 md:p-10 bg-white shadow-md rounded-lg my-10">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Política de Privacidade</h1>
      <p className="mb-4 text-gray-600">
        <strong>Última atualização:</strong> 12 de Novembro de 2025
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">1. Introdução</h2>
      <p className="mb-3 text-gray-700">
        Este documento estabelece a nossa Política de Privacidade. Na <strong>ERP-Norte</strong>, levamos a sua privacidade e a segurança dos seus dados a sério. Acreditamos na transparência total sobre como lidamos com as informações que você nos confia.

Esta Política detalha, de forma clara e simples, quais dados coletamos, como eles são utilizados e quais são os nossos compromissos inegociáveis, especialmente no que tange à integração e uso das suas informações do Google Calendar e à conformidade com as políticas do Google.

Ao utilizar nosso aplicativo, você reconhece ter lido e compreendido esta política.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">2. Coleta de Dados</h2>
      <p className="mb-3 text-gray-700">
        Para fornecer nossos serviços de agenda, solicitamos acesso a dados da sua Conta Google. Coletamos as seguintes informações:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-3 text-gray-700">
        <li><strong>Informações de Autenticação:</strong> Quando você se conecta com o Google, recebemos um identificador único da sua conta (seu <code>googleId</code>). Armazenamos este <code>googleId</code> no armazenamento local (<code>localStorage</code>) do seu navegador para mantê-lo conectado.</li>
        <li><strong>Dados do Google Calendar (Acesso de Leitura):</strong> Solicitamos permissão para ler os eventos do seu Google Calendar. Isso nos permite exibir seus eventos existentes (títulos, datas, horários, etc.) em nossa interface.</li>
        <li><strong>Dados para o Google Calendar (Acesso de Escrita):</strong> Solicitamos permissão para criar e modificar eventos em seu Google Calendar. Quando você cria um novo evento em nossa plataforma (incluindo links de Google Meet e participantes), nós o salvamos na sua agenda.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">3. Uso dos Dados</h2>
      <p className="mb-3 text-gray-700">
        Usamos as informações coletadas exclusivamente para os seguintes propósitos:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-3 text-gray-700">
        <li>Autenticar sua conta.</li>
        <li>Exibir sua Agenda do Google em nossa plataforma.</li>
        <li>Permitir que você crie novos eventos no seu Google Calendar através da nossa interface.</li>
      </ul>
      <p className="text-gray-700">
        <strong>NÃO</strong> usamos seus dados para fins de publicidade, não vendemos seus dados a terceiros, nem os utilizamos para qualquer finalidade que não seja a funcionalidade principal da agenda.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">4. Requisitos Específicos da API do Google</h2>
      <p className="mb-3 text-gray-700">
        O uso e a transferência de informações recebidas das APIs do Google para qualquer outro aplicativo por <strong>ERP-Norte</strong> aderirão à 
        <a 
          href="https://developers.google.com/terms/api-services-user-data-policy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          {' '}Política de Dados do Usuário dos Serviços de API do Google
        </a>, incluindo os requisitos de <strong>Uso Limitado (Limited Use)</strong>.
        {' '}
      </p>
      <p className="mb-3 text-gray-700">
        Os dados obtidos (eventos da sua agenda) são usados unicamente para fornecer e melhorar os recursos de agendamento visíveis ao usuário em nossa interface.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">5. Seus Direitos e Controle</h2>
      <p className="mb-3 text-gray-700">
        Você pode revogar o acesso do <strong>ERP-Norte</strong> à sua Conta Google a qualquer momento, visitando a página de 
        <a 
        
          href="https://myaccount.google.com/permissions" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          {' '}permissões da sua Conta Google
        </a>. Você também pode usar o botão "Desconectar" em nosso aplicativo.{' '}
      </p> 

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">6. Contato</h2>
      <p className="text-gray-700">
        Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco: <strong>suporte@norterios.com.br</strong>.
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;