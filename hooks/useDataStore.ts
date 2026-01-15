import { useState, useEffect, useCallback } from 'react';
import {
  Lead, Client, Campaign, TeamMember, Activity, Asset, Integration, AppData, DashboardStats
} from '../types';
import { supabase } from '../services/supabase';

const STORAGE_KEY = 'recipe-labs-data';

// Map Supabase lead to app Lead type
const mapSupabaseLead = (dbLead: any): Lead => ({
  id: dbLead.id,
  name: dbLead.name || '',
  company: dbLead.company || '',
  email: dbLead.email || '',
  phone: dbLead.phone || undefined,
  website: dbLead.company_domain || dbLead.linkedin || '',
  status: dbLead.status || 'new',
  score: dbLead.score || 0,
  source: dbLead.source || undefined,
  notes: dbLead.raw_data?.notes || undefined,
  lastContactedAt: undefined,
  value: dbLead.raw_data?.value || 0,
  createdAt: dbLead.created_at,
  updatedAt: dbLead.updated_at,
});

// Map app Lead to Supabase format
const mapLeadToSupabase = (lead: Partial<Lead>) => ({
  name: lead.name,
  company: lead.company,
  email: lead.email,
  phone: lead.phone || null,
  company_domain: lead.website || null,
  status: lead.status || 'new',
  score: lead.score || 0,
  source: lead.source || 'manual',
  raw_data: {
    notes: lead.notes,
    value: lead.value,
  },
});

const getInitialData = (): AppData => {
  if (typeof window === 'undefined') {
    return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Don't load leads from localStorage - we'll fetch from Supabase
      return { ...parsed, leads: [] };
    } catch {
      return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
    }
  }
  return { leads: [], clients: [], campaigns: [], team: [], activities: [], assets: [], integrations: [] };
};

export const useDataStore = () => {
  const [data, setData] = useState<AppData>(getInitialData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leads from Supabase on mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data: dbLeads, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leads:', error);
        } else if (dbLeads) {
          const leads = dbLeads.map(mapSupabaseLead);
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

    // Fetch leads from Supabase
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

  // Leads CRUD - synced with Supabase
  const addLead = useCallback(async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data: newDbLead, error } = await supabase
        .from('leads')
        .insert(mapLeadToSupabase(lead))
        .select()
        .single();

      if (error) {
        console.error('Error creating lead:', error);
        // Fallback to local
        const localLead: Lead = { ...lead, id: generateId(), createdAt: now(), updatedAt: now() };
        setData(prev => ({ ...prev, leads: [...prev.leads, localLead] }));
        return localLead;
      }

      const newLead = mapSupabaseLead(newDbLead);
      setData(prev => ({ ...prev, leads: [...prev.leads, newLead] }));

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

      return newLead;
    } catch (err) {
      console.error('Failed to create lead:', err);
      const localLead: Lead = { ...lead, id: generateId(), createdAt: now(), updatedAt: now() };
      setData(prev => ({ ...prev, leads: [...prev.leads, localLead] }));
      return localLead;
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      leads: prev.leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: now() } : l)
    }));

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...mapLeadToSupabase(updates),
          updated_at: now()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating lead:', error);
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    // Optimistic delete
    setData(prev => ({ ...prev, leads: prev.leads.filter(l => l.id !== id) }));

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lead:', error);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  }, []);

  // Refresh leads from Supabase
  const refreshLeads = useCallback(async () => {
    try {
      const { data: dbLeads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error refreshing leads:', error);
      } else if (dbLeads) {
        const leads = dbLeads.map(mapSupabaseLead);
        setData(prev => ({ ...prev, leads }));
      }
    } catch (err) {
      console.error('Failed to refresh leads:', err);
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

  // Dashboard Stats
  const getStats = useCallback((): DashboardStats => {
    const leads = data.leads;
    const wonLeads = leads.filter(l => l.status === 'won');
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
  }, [data]);

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
    isLoading,

    // Leads
    addLead,
    updateLead,
    deleteLead,
    refreshLeads,

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
