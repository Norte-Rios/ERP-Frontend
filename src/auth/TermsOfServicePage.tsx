import React from 'react';
import { Link } from 'react-router-dom'; // Para lincar para a Política de Privacidade

/**
 * Página pública de Termos de Serviço
 */
const TermsOfServicePage = () => {
  return (
    // Container principal - use o mesmo estilo das suas outras páginas públicas
    <div className="container mx-auto max-w-4xl p-6 md:p-10 bg-white shadow-md rounded-lg my-10">
      
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Termos de Serviço</h1>
      <p className="mb-4 text-gray-600">
        <strong>Última atualização:</strong> 29 de Outubro de 2025
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">1. Aceitação dos Termos</h2>
      <p className="mb-3 text-gray-700">
        Bem-vindo(a) ao <strong>[Nome da Sua Aplicação]</strong> (o "Serviço"). Estes Termos de Serviço ("Termos") regem o seu acesso e uso da nossa plataforma. Ao acessar, se cadastrar ou usar o Serviço, você ("Usuário") concorda em cumprir e se vincular integralmente a estes Termos.
      </p>
      <p className="mb-3 text-gray-700">
        Se você não concorda com qualquer parte destes Termos, você não deve acessar ou usar o Serviço.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">2. Contas de Usuário</h2>
      <p className="mb-3 text-gray-700">
        <strong>a. Responsabilidade:</strong> Para acessar o Serviço, pode ser necessário criar uma conta. Você é o único responsável por manter a confidencialidade de suas credenciais de login (como sua senha) e por todas as atividades que ocorrem em sua conta.
      </p>
      <p className="mb-3 text-gray-700">
        <strong>b. Informações Verídicas:</strong> Você concorda em fornecer informações precisas, atuais e completas durante o processo de registro e em atualizar tais informações para mantê-las precisas.
      </p>
      <p className="mb-3 text-gray-700">
        <strong>c. Segurança:</strong> Você deve nos notificar imediatamente sobre qualquer violação de segurança ou uso não autorizado de sua conta.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">3. Regras de Conduta e Uso Aceitável</h2>
      <p className="mb-3 text-gray-700">
        Você concorda em não usar o Serviço para:
      </p>
      <ul className="list-disc list-inside space-y-2 mb-3 text-gray-700">
        <li>Qualquer propósito ilegal ou que viole leis locais, estaduais, nacionais ou internacionais.</li>
        <li>Transmitir ou armazenar material que seja fraudulento, difamatório ou prejudicial.</li>
        <li>Enviar spam, "correntes" ou qualquer outra forma de solicitação não autorizada.</li>
        <li>Transmitir vírus, worms, cavalos de Tróia ou qualquer outro código de natureza destrutiva.</li>
        <li>Tentar fazer engenharia reversa, descompilar ou desmontar qualquer parte do software do Serviço.</li>
        <li>Interferir ou tentar interferir no funcionamento adequado do Serviço ou obter acesso não autorizado aos nossos sistemas.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">4. Integrações de Terceiros (Google)</h2>
      <p className="mb-3 text-gray-700">
        Nosso Serviço se integra com APIs de terceiros, incluindo, mas não se limitando a, o Google Calendar.
      </p>
      <ul className="list-disc list-inside space-y-2 mb-3 text-gray-700">
        <li>Ao conectar sua Conta Google, você nos autoriza a acessar e processar seus dados conforme descrito em nossa 
          <Link to="/privacy-policy" className="text-indigo-600 hover:underline"> Política de Privacidade</Link>.
        </li>
        <li>Seu uso dos serviços do Google através da nossa plataforma também está sujeito aos 
          <a 
            href="https://policies.google.com/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          > Termos de Serviço do Google</a>.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">5. Propriedade Intelectual</h2>
      <p className="mb-3 text-gray-700">
        <strong>a. Nosso Conteúdo:</strong> Todo o software, texto, imagens, marcas e logotipos usados no Serviço são de propriedade de <strong>[Nome da Sua Aplicação]</strong> ou de seus licenciadores e são protegidos por leis de direitos autorais e marcas registradas.
      </p>
      <p className="mb-3 text-gray-700">
        <strong>b. Seu Conteúdo:</strong> Você retém a propriedade de todos os dados e informações que você envia ao Serviço ("Seu Conteúdo"). Você nos concede uma licença não exclusiva, mundial e isenta de royalties para usar, copiar, modificar e exibir Seu Conteúdo apenas com o propósito de fornecer o Serviço a você.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">6. Limitação de Responsabilidade</h2>
      <p className="mb-3 text-gray-700">
        O SERVIÇO É FORNECIDO "COMO ESTÁ" (AS IS) E "CONFORME DISPONÍVEL" (AS AVAILABLE), SEM GARANTIAS DE QUALQUER TIPO.
      </p>
      <p className="mb-3 text-gray-700">
        EM NENHUMA CIRCUNSTÂNCIA <strong>[Nome da Sua Aplicação]</strong> SERÁ RESPONSÁVEL POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS (INCLUINDO PERDA DE DADOS, RECEITA OU LUCROS) DECORRENTES DO USO OU DA INCAPACIDADE DE USAR O SERVIÇO, MESMO QUE TENHAMOS SIDO AVISADOS DA POSSIBILIDADE DESSES DANOS.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">7. Rescisão</h2>
      <p className="mb-3 text-gray-700">
        Reservamo-nos o direito de suspender ou encerrar seu acesso ao Serviço, a nosso exclusivo critério, sem aviso prévio e por qualquer motivo, incluindo, mas não se limitando a, a violação destes Termos.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">8. Alterações nos Termos</h2>
      <p className="mb-3 text-gray-700">
        Podemos modificar estes Termos a qualquer momento. Se fizermos alterações, publicaremos os Termos revisados nesta página e atualizaremos a data da "Última atualização". O uso contínuo do Serviço após a data de vigência das alterações constitui sua aceitação dos novos Termos.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700 border-b pb-2">9. Contato</h2>
      <p className="text-gray-700">
        Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco: 
        <strong> [Seu E-mail de Contato]</strong>.
      </p>
    </div>
  );
};

export default TermsOfServicePage;