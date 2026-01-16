import React, { useState } from 'react';
import { Mail, Plus, TrendingUp, BarChart2, Pause, Play, Trash2, X, Search } from 'lucide-react';
import { Campaign } from '../types.ts';
import { DataStore } from '../hooks/useDataStore';
import EmptyState from './EmptyState';

interface CampaignsModuleProps {
  campaigns: Campaign[];
  addCampaign: DataStore['addCampaign'];
  updateCampaign: DataStore['updateCampaign'];
  deleteCampaign: DataStore['deleteCampaign'];
}

const CampaignsModule: React.FC<CampaignsModuleProps> = ({ campaigns, addCampaign, updateCampaign, deleteCampaign }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as 'active' | 'paused' | 'draft' | 'completed',
    type: 'email' as 'email' | 'social' | 'ads' | 'content',
    openRate: 0,
    clickRate: 0,
    sent: 0,
    replies: 0
  });

  const resetForm = () => {
    setFormData({
      name: '', description: '', status: 'draft', type: 'email',
      openRate: 0, clickRate: 0, sent: 0, replies: 0
    });
    setEditingCampaign(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCampaign) {
      updateCampaign(editingCampaign.id, formData);
    } else {
      addCampaign(formData);
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleEdit = (campaign: Campaign) => {
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      status: campaign.status,
      type: campaign.type || 'email',
      openRate: campaign.openRate,
      clickRate: campaign.clickRate,
      sent: campaign.sent,
      replies: campaign.replies || 0
    });
    setEditingCampaign(campaign);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
    }
  };

  const toggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateCampaign(campaign.id, { status: newStatus });
  };

  // Filter campaigns based on search
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (campaign.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats from real data
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + (c.replies || 0), 0);
  const avgOpenRate = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length
    : 0;

  function renderModal() {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); resetForm(); } }}
      >
        <div className="glass w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-white/10 max-h-[90vh] overflow-y-auto overscroll-contain">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm z-10">
            <h3 className="text-lg font-bold text-white font-orbitron">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h3>
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="p-2 -mr-2 text-gray-500 hover:text-white active:scale-95 touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Campaign Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                placeholder="Q1 Outreach"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none resize-none touch-manipulation"
                placeholder="Campaign description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                >
                  <option value="email">Email</option>
                  <option value="social">Social</option>
                  <option value="ads">Ads</option>
                  <option value="content">Content</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Open Rate (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.openRate}
                  onChange={(e) => setFormData({ ...formData, openRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Click Rate (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.clickRate}
                  onChange={(e) => setFormData({ ...formData, clickRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Sent</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={formData.sent}
                  onChange={(e) => setFormData({ ...formData, sent: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Replies</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={formData.replies}
                  onChange={(e) => setFormData({ ...formData, replies: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-lg text-white text-base focus:border-brand-gold focus:outline-none touch-manipulation"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 pb-4 sm:pb-0">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-3 min-h-[48px] bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 min-h-[48px] bg-brand-gold text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation"
              >
                {editingCampaign ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0 && !showAddModal) {
    return (
      <div className="p-4 sm:p-8 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron">Campaign Sequences</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 active:scale-[0.98] transition-all touch-manipulation"
          >
            <Plus className="w-5 h-5" /> Create Campaign
          </button>
        </div>
        <EmptyState type="campaigns" onAction={() => setShowAddModal(true)} />
        {showAddModal && renderModal()}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron">Campaign Sequences</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-brand-gold text-black font-bold text-sm rounded-lg hover:scale-105 active:scale-[0.98] transition-all touch-manipulation"
        >
          <Plus className="w-5 h-5" /> Create Campaign
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder-gray-500 focus:border-brand-gold/50 focus:outline-none touch-manipulation"
        />
      </div>

      {/* Campaign List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="glass p-4 sm:p-5 rounded-2xl border-white/5 hover:border-brand-gold/30 transition-all"
          >
            {/* Mobile Layout */}
            <div className="flex flex-col sm:hidden gap-4">
              {/* Top row: Icon, Name, Status */}
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${campaign.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-500'}`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      campaign.status === 'active' ? 'border-green-500/50 text-green-500 bg-green-500/5' :
                      campaign.status === 'paused' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' :
                      'border-gray-500/50 text-gray-500'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {campaign.sent} Sent
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex justify-around py-3 border-y border-white/5">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Open Rate</p>
                  <p className="text-lg font-bold text-white">{campaign.openRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Click Rate</p>
                  <p className="text-lg font-bold text-brand-gold">{campaign.clickRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Replies</p>
                  <p className="text-lg font-bold text-white">{campaign.replies || 0}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="p-3 min-w-[48px] min-h-[48px] text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-95 touch-manipulation"
                  title="Edit"
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
                {campaign.status === 'active' ? (
                  <button
                    onClick={() => toggleStatus(campaign)}
                    className="p-3 min-w-[48px] min-h-[48px] text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all active:scale-95 touch-manipulation"
                    title="Pause"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => toggleStatus(campaign)}
                    className="p-3 min-w-[48px] min-h-[48px] text-brand-gold hover:bg-brand-gold/10 rounded-xl transition-all active:scale-95 touch-manipulation"
                    title="Play"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="p-3 min-w-[48px] min-h-[48px] text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95 touch-manipulation"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${campaign.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-500'}`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{campaign.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      campaign.status === 'active' ? 'border-green-500/50 text-green-500 bg-green-500/5' :
                      campaign.status === 'paused' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' :
                      'border-gray-500/50 text-gray-500'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {campaign.sent} Sent
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 px-12">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Open Rate</p>
                  <p className="text-xl font-bold text-white">{campaign.openRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Click Rate</p>
                  <p className="text-xl font-bold text-brand-gold">{campaign.clickRate}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="p-3 min-w-[44px] min-h-[44px] text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-95 touch-manipulation"
                  title="Edit"
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
                {campaign.status === 'active' ? (
                  <button
                    onClick={() => toggleStatus(campaign)}
                    className="p-3 min-w-[44px] min-h-[44px] text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/5 rounded-lg transition-all active:scale-95 touch-manipulation"
                    title="Pause"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => toggleStatus(campaign)}
                    className="p-3 min-w-[44px] min-h-[44px] text-brand-gold hover:bg-brand-gold/5 rounded-lg transition-all active:scale-95 touch-manipulation"
                    title="Play"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className="p-3 min-w-[44px] min-h-[44px] text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all active:scale-95 touch-manipulation"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Panel - calculated from real data */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="glass p-4 sm:p-6 rounded-2xl">
          <p className="text-xs sm:text-sm font-bold text-gray-500 mb-2 sm:mb-4 uppercase tracking-widest">Avg Open Rate</p>
          <div className="flex items-end gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl font-bold text-white font-orbitron">{avgOpenRate.toFixed(1)}%</span>
          </div>
        </div>
        <div className="glass p-4 sm:p-6 rounded-2xl">
          <p className="text-xs sm:text-sm font-bold text-gray-500 mb-2 sm:mb-4 uppercase tracking-widest">Total Replies</p>
          <div className="flex items-end gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl font-bold text-white font-orbitron">{totalReplies}</span>
            <span className="text-xs text-brand-gold font-bold mb-1">{totalSent} sent</span>
          </div>
        </div>
        <div className="glass p-4 sm:p-6 rounded-2xl">
          <p className="text-xs sm:text-sm font-bold text-gray-500 mb-2 sm:mb-4 uppercase tracking-widest">Active Campaigns</p>
          <div className="flex items-end gap-2 sm:gap-4">
            <span className="text-3xl sm:text-4xl font-bold text-white font-orbitron">{activeCampaigns}</span>
            <span className="text-xs text-gray-500 font-bold mb-1">of {campaigns.length} total</span>
          </div>
        </div>
      </div>

      {showAddModal && renderModal()}
    </div>
  );
};

export default CampaignsModule;
