import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Consultant } from './types';

interface AddConsultantPageProps {
  onAddConsultant: (consultant: Omit<Consultant, 'id'>) => void;
}

const AddConsultantPage: React.FC<AddConsultantPageProps> = ({ onAddConsultant }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Consultant, 'id'>>({
    fullName: '',
    cpf: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    education: '',
    specialty: '',
    contact: { email: '', whatsapp: '' },
    bankDetails: { bank: '', agency: '', account: '', pix: '' },
    employmentType: 'Fixo',
    paymentDetails: { monthlySalary: 0 },
    contractType: 'Contrato',
  });
  const [createLogin, setCreateLogin] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: 'address' | 'contact' | 'bankDetails' | 'paymentDetails', e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: name === 'monthlySalary' || name === 'hourlyRate' ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddConsultant(formData);
    // Lógica futura: se createLogin for true, disparar email, etc.
    console.log(`Criar login para ${formData.contact.email}: ${createLogin}`);
    navigate('/consultants');
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/consultants" className="text-indigo-600 hover:underline">
          &larr; Voltar para a lista de consultores
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Cadastrar Novo Consultor</h2>

        {/* Informações Pessoais */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Informações Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label><input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
            <div><label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label><input type="text" name="cpf" id="cpf" value={formData.cpf} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label><input type="email" name="email" id="email" value={formData.contact.email} onChange={(e) => handleNestedChange('contact', e)} className="mt-1 block w-full input-style" required /></div>
            <div><label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label><input type="tel" name="whatsapp" id="whatsapp" value={formData.contact.whatsapp} onChange={(e) => handleNestedChange('contact', e)} className="mt-1 block w-full input-style" required /></div>
            <div className="md:col-span-2"><label htmlFor="street" className="block text-sm font-medium text-gray-700">Endereço</label><input type="text" name="street" id="street" value={formData.address.street} onChange={(e) => handleNestedChange('address', e)} className="mt-1 block w-full input-style" required /></div>
          </div>
        </section>
        
        {/* Formação e Especialidade */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Formação e Especialidade</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label htmlFor="education" className="block text-sm font-medium text-gray-700">Formação</label><input type="text" name="education" id="education" value={formData.education} onChange={handleChange} className="mt-1 block w-full input-style" required /></div>
               <div className="md:col-span-2"><label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Especialidade</label><textarea name="specialty" id="specialty" value={formData.specialty} onChange={handleChange} rows={3} className="mt-1 block w-full input-style" required /></div>
          </div>
        </section>

        {/* Vínculo e Pagamento */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Vínculo e Pagamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">Tipo de Vínculo</label><select name="employmentType" id="employmentType" value={formData.employmentType} onChange={handleChange} className="mt-1 block w-full input-style"><option value="Fixo">Fixo</option><option value="Sob Demanda">Sob Demanda</option></select></div>
            <div><label htmlFor="contractType" className="block text-sm font-medium text-gray-700">Tipo de Contrato</label><select name="contractType" id="contractType" value={formData.contractType} onChange={handleChange} className="mt-1 block w-full input-style"><option>Contrato</option><option>Outro</option></select></div>
            {formData.employmentType === 'Fixo' ? (
              <div><label htmlFor="monthlySalary" className="block text-sm font-medium text-gray-700">Salário Mensal (R$)</label><input type="number" name="monthlySalary" id="monthlySalary" value={formData.paymentDetails.monthlySalary || ''} onChange={(e) => handleNestedChange('paymentDetails', e)} className="mt-1 block w-full input-style" /></div>
            ) : (
              <div><label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Valor por Hora (R$)</label><input type="number" name="hourlyRate" id="hourlyRate" value={formData.paymentDetails.hourlyRate || ''} onChange={(e) => handleNestedChange('paymentDetails', e)} className="mt-1 block w-full input-style" /></div>
            )}
          </div>
        </section>

        {/* Dados Bancários */}
        <section>
           <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Dados Bancários</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label htmlFor="bank" className="block text-sm font-medium text-gray-700">Banco</label><input type="text" name="bank" id="bank" value={formData.bankDetails.bank} onChange={(e) => handleNestedChange('bankDetails', e)} className="mt-1 block w-full input-style" required /></div>
              <div><label htmlFor="agency" className="block text-sm font-medium text-gray-700">Agência</label><input type="text" name="agency" id="agency" value={formData.bankDetails.agency} onChange={(e) => handleNestedChange('bankDetails', e)} className="mt-1 block w-full input-style" required /></div>
              <div><label htmlFor="account" className="block text-sm font-medium text-gray-700">Conta Corrente</label><input type="text" name="account" id="account" value={formData.bankDetails.account} onChange={(e) => handleNestedChange('bankDetails', e)} className="mt-1 block w-full input-style" required /></div>
              <div><label htmlFor="pix" className="block text-sm font-medium text-gray-700">Chave PIX</label><input type="text" name="pix" id="pix" value={formData.bankDetails.pix} onChange={(e) => handleNestedChange('bankDetails', e)} className="mt-1 block w-full input-style" required /></div>
           </div>
        </section>
        
         {/* Acesso ao Portal */}
        <section className="pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Acesso ao Portal</h3>
             <div className="mt-4">
                <label className="flex items-center">
                    <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <span className="ml-2 text-sm text-gray-600">Criar acesso ao portal para este consultor (enviar convite por e-mail)</span>
                </label>
            </div>
        </section>

        <div className="mt-8 flex justify-end gap-4">
          <Link to="/consultants" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</Link>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-semibold">Salvar Consultor</button>
        </div>
      </form>
    </div>
  );
};

export default AddConsultantPage;