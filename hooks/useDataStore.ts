import { useState, useEffect, useCallback } from 'react';
import {
  Lead, Client, Campaign, TeamMember, Activity, Asset, Integration, AppData, DashboardStats
} from '../types';
import { leadsApiService, LeadFromAPI, PipelineStats } from '../services/leadsApiService';

const STORAGE_KEY = 'recipe-labs-data';

// Map API lead to app Lead type
const mapApiLead = (apiLead: LeadFromAPI): Lead => ({
  id: String(apiLead.id),
  name: apiLead.name || '',
  company: apiLead.company || apiLead.name || '',
  email: apiLead.email || '',
  phone: apiLead.phone || undefined,
  website: apiLead.website || '',
  status: apiLead.status || 'new',
  score: apiLead.ai_lead_score || 0,
  source: apiLead.category || undefined,
  notes: apiLead.ai_insights || undefined,
  lastContactedAt: undefined,
  value: 0,
  createdAt: apiLead.created_at || new Date().toISOString(),
  updatedAt: apiLead.created_at || new Date().toISOString(),
});

const getInitialData = (): AppData => {
  if (typeof window === 'undefined') {
    return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Don't load leads from localStorage - we'll fetch from API
      return { ...parsed, leads: [] };
    } catch {
      return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
    }
  }
  return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
};

export const useDataStore = () => {
  const [data, setData] = useState<AppData>(getInitialData);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leads from Agent API on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Get pipeline stats which includes lead data
        const stats = await leadsApiService.getPipelineStats();

        if (stats) {
          setPipelineStats(stats);

          // Combine top and recent leads, remove duplicates
          const allApiLeads = [...(stats.topLeads || []), ...(stats.recentLeads || [])];
          const uniqueLeads = allApiLeads.filter((lead, index, self) =>
            index === self.findIndex(l => l.id === lead.id)
          );

          const leads = uniqueLeads.map(mapApiLead);
          setData(prev => ({ ...prev, leads }));
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Load other data from localStorage
    const storedData = getInitialData();
    setData(storedData);

    // Fetch leads from API
    fetchLeads();
  }, []);

  // Save non-lead data to localStorage
  useEffect(() => {
    if (!isLoading) {
      const { leads, ...otherData } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...otherData, leads: [] }));
    }
  }, [data, isLoading]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = () => new Date().toISOString();

  // Leads CRUD - local only for now (read from API, write locally)
  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const localLead: Lead = { ...lead, id: generateId(), createdAt: now(), updatedAt: now() };
    setData(prev => ({ ...prev, leads: [...prev.leads, localLead] }));

    // Add activity
    const activity: Activity = {
      id: generateId(),
      user: 'You',
      action: 'added a new lead',
      target: lead.company,
      targetType: 'lead',
      time: 'Just now',
      createdAt: now()
    };
    setData(prev => ({
      ...prev,
      activities: [activity, ...prev.activities].slice(0, 50)
    }));

    return localLead;
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    setData(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: now() } : l)
    }));
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    setData(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));
  }, []);

  // Refresh leads from API
  const refreshLeads = useCallback(async () => {
    try {
      const stats = await leadsApiService.getPipelineStats();

      if (stats) {
        setPipelineStats(stats);

        const allApiLeads = [...(stats.topLeads || []), ...(stats.recentLeads || [])];
        const uniqueLeads = allApiLeads.filter((lead, index, self) =>
          index === self.findIndex(l => l.id === lead.id)
        );

        const leads = uniqueLeads.map(mapApiLead);
        setData(prev => ({ ...prev, leads }));
      }
    } catch (err) {
      console.error('Failed to refresh leads:', err);
    }
  }, []);

  // Search leads
  const searchLeads = useCallback(async (query: string): Promise<Lead[]> => {
    try {
      const results = await leadsApiService.searchLeads(query);
      return results.map(mapApiLead);
    } catch (err) {
      console.error('Failed to search leads:', err);
      return [];
    }
  }, []);

  // Clients CRUD
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = { ...client, id: generateId(), createdAt: now(), updatedAt: now() };
    setData(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
    const activity: Activity = {
      id: generateId(),
      user: 'You',
      action: 'added a new client',
      target: client.name,
      targetType: 'client',
      time: 'Just now',
      createdAt: now()
    };
    setData(prev => ({
      ...prev,
      activities: [activity, ...prev.activities].slice(0, 50)
    }));
    return newClient;
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updates, updatedAt: now() } : c)
    }));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setData(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }));
  }, []);

  // Campaigns CRUD
  const addCampaign = useCallback((campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCampaign: Campaign = { ...campaign, id: generateId(), createdAt: now(), updatedAt: now() };
    setData(prev => ({ ...prev, campaigns: [...prev.campaigns, newCampaign] }));
    const activity: Activity = {
      id: generateId(),
      user: 'You',
      action: 'created a new campaign',
      target: campaign.name,
      targetType: 'campaign',
      time: 'Just now',
      createdAt: now()
    };
    setData(prev => ({
      ...prev,
      activities: [activity, ...prev.activities].slice(0, 50)
    }));
    return newCampaign;
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setData(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, ...updates, updatedAt: now() } : c)
    }));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setData(prev => ({ ...prev, campaigns: prev.campaigns.filter(c => c.id !== id) }));
  }, []);

  // Team CRUD
  const addTeamMember = useCallback((member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const newMember: TeamMember = { ...member, id: generateId(), createdAt: now() };
    setData(prev => ({ ...prev, team: [...prev.team, newMember] }));
    return newMember;
  }, []);

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setData(prev => ({
      ...prev,
      team: prev.team.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const deleteTeamMember = useCallback((id: string) => {
    setData(prev => ({ ...prev, team: prev.team.filter(t => t.id !== id) }));
  }, []);

  // Activity
  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'time' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      time: 'Just now',
      createdAt: now()
    };
    setData(prev => ({
      ...prev,
      activities: [newActivity, ...prev.activities].slice(0, 50)
    }));
    return newActivity;
  }, []);

  // Assets CRUD
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = { ...asset, id: generateId(), createdAt: now(), updatedAt: now() };
    setData(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
    const activity: Activity = {
      id: generateId(),
      user: 'You',
      action: 'uploaded an asset',
      target: asset.name,
      targetType: 'asset',
      time: 'Just now',
      createdAt: now()
    };
    setData(prev => ({
      ...prev,
      activities: [activity, ...prev.activities].slice(0, 50)
    }));
    return newAsset;
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setData(prev => ({ ...prev, assets: prev.assets.filter(a => a.id !== id) }));
  }, []);

  // Dashboard Stats - use pipeline stats from API
  const getStats = useCallback((): DashboardStats => {
    // Use API stats if available
    if (pipelineStats) {
      const totalLeads = pipelineStats.totalLeads || 0;
      const qualifiedLeads = pipelineStats.byStatus?.qualified || 0;
      const activeCampaigns = data.campaigns.filter(c => c.status === 'active').length;
      const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

      return {
        totalLeads,
        leadsChange: 12, // Placeholder
        pipelineValue: totalLeads * 500, // Estimate $500 per lead
        pipelineChange: 8,
        activeCampaigns,
        campaignsChange: 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionChange: 5
      };
    }

    // Fallback to local data
    const leads = data.leads;
    const wonLeads = leads.filter(l => l.status === 'won' || l.status === 'qualified');
    const totalLeads = leads.length;
    const pipelineValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const activeCampaigns = data.campaigns.filter(c => c.status === 'active').length;
    const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;

    return {
      totalLeads,
      leadsChange: 0,
      pipelineValue,
      pipelineChange: 0,
      activeCampaigns,
      campaignsChange: 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      conversionChange: 0
    };
  }, [data, pipelineStats]);

  // Convert lead to client
  const convertLeadToClient = useCallback((leadId: string) => {
    const lead = data.leads.find(l => l.id === leadId);
    if (!lead) return null;

    const newClient = addClient({
      name: lead.company,
      contactName: lead.name,
      email: lead.email,
      industry: 'General',
      healthScore: 'green',
      activeProjects: 0,
      totalValue: lead.value || 0
    });

    updateLead(leadId, { status: 'won' });

    return newClient;
  }, [data.leads, addClient, updateLead]);

  return {
    // Data
    leads: data.leads,
    clients: data.clients,
    campaigns: data.campaigns,
    team: data.team,
    activities: data.activities,
    assets: data.assets,
    integrations: data.integrations,
    pipelineStats,
    isLoading,

    // Leads
    addLead,
    updateLead,
    deleteLead,
    refreshLeads,
    searchLeads,

    // Clients
    addClient,
    updateClient,
    deleteClient,

    // Campaigns
    addCampaign,
    updateCampaign,
    deleteCampaign,

    // Team
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,

    // Activity
    addActivity,

    // Assets
    addAsset,
    deleteAsset,

    // Stats
    getStats,

    // Conversions
    convertLeadToClient
  };
};

export type DataStore = ReturnType<typeof useDataStore>;
