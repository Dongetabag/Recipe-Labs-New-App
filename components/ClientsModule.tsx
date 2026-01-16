import React, { useState } from 'react';
import { Plus, MoreVertical, Shield, ExternalLink, Activity, X, Trash2, Search } from 'lucide-react';
import { Client } from '../types.ts';
import { DataStore } from '../hooks/useDataStore';
import EmptyState from './EmptyState';

interface ClientsModuleProps {
  clients: Client[];
  addClient: DataStore['addClient'];
  updateClient: DataStore['updateClient'];
  deleteClient: DataStore['deleteClient'];
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ clients, addClient, updateClient, deleteClient }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    industry: '',
    healthScore: 'green' as 'green' | 'yellow' | 'red',
    activeProjects: 0,
    totalValue: 0,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '', contactName: '', email: '', phone: '', industry: '',
      healthScore: 'green', activeProjects: 0, totalValue: 0, notes: ''
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      contactName: client.contactName || '',
      email: client.email || '',
      phone: client.phone || '',
      industry: client.industry,
      healthScore: client.healthScore,
      activeProjects: client.activeProjects,
      totalValue: client.totalValue,
      notes: client.notes || ''
    });
    setEditingClient(client);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contactName && client.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function renderModal() {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div className="glass w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-lg z-10">
            <h3 className="text-lg font-bold text-white font-orbitron">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h3>
            <button 
              onClick={() => { setShowAddModal(false); resetForm(); }} 
              className="p-2 text-gray-500 hover:text-white active:text-brand-gold touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                placeholder="Acme Corporation"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Industry *</label>
                <input
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                  placeholder="Technology, Finance..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                  placeholder="contact@acme.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Health</label>
                <select
                  value={formData.healthScore}
                  onChange={(e) => setFormData({ ...formData, healthScore: e.target.value as 'green' | 'yellow' | 'red' })}
                  className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                >
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Projects</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.activeProjects}
                  onChange={(e) => setFormData({ ...formData, activeProjects: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Value ($)</label>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4 pb-4 sm:pb-0">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 active:bg-white/15 transition-all touch-manipulation text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-brand-gold text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation text-base"
              >
                {editingClient ? 'Update' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (clients.length === 0 && !showAddModal) {
    return (
      <div className="p-4 md:p-8 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron">Client Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 active:scale-95 transition-all touch-manipulation"
          >
            <Plus className="w-4 h-4" /> New Client
          </button>
        </div>
        <EmptyState type="clients" onAction={() => setShowAddModal(true)} />
        {showAddModal && renderModal()}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron">Client Management</h2>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-brand-gold focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-gold/20 touch-manipulation"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Client</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredClients.map((client) => (
          <div 
            key={client.id} 
            className="glass p-5 md:p-6 rounded-2xl border-white/5 hover:border-brand-gold/20 active:border-brand-gold/30 transition-all touch-manipulation group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-all"></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold font-bold text-lg">
                  {client.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-white truncate">{client.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest truncate">{client.industry}</p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button 
                  onClick={() => handleEdit(client)} 
                  className="p-2 text-gray-600 hover:text-brand-gold active:text-brand-gold touch-manipulation"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(client.id)} 
                  className="p-2 text-gray-600 hover:text-red-500 active:text-red-500 touch-manipulation"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {client.contactName && (
              <p className="text-xs text-gray-400 mt-2 relative z-10 truncate">Contact: {client.contactName}</p>
            )}

            <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4 relative z-10">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Health Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${
                    client.healthScore === 'green' ? 'bg-green-500' :
                    client.healthScore === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-bold text-white uppercase">{client.healthScore}</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Total Value</p>
                <p className="text-sm font-bold text-brand-gold mt-1">${client.totalValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Activity className="w-4 h-4 text-brand-gold" />
                <span>{client.activeProjects} Active Projects</span>
              </div>
              <button className="text-xs font-bold text-gray-500 hover:text-white active:text-brand-gold flex items-center gap-1 transition-colors touch-manipulation p-2 -mr-2">
                Portal <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && renderModal()}
    </div>
  );
};

export default ClientsModule;
