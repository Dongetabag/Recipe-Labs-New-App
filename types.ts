
import React from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'Designer' | 'Copywriter' | 'Strategist' | 'Account Manager';
  isPremium: boolean;
  credits: number;
  totalToolsUsed: number;
  hasCompletedOnboarding: boolean;
  agencyBrandVoice: string;
  agencyCoreCompetency: string;
  primaryClientIndustry: string;
  idealClientProfile: string;
  targetLocation: string;
  clientWorkExamples: string;
  primaryGoals: string[];
  successMetric: string;
  platformTheme: string;
  toolLayout: 'grid' | 'list';
  themeMode: 'dark' | 'light';
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  website: string;
  status: LeadStatus;
  score: number;
  lastContactedAt?: string;
  value: number;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  healthScore: 'green' | 'yellow' | 'red';
  activeProjects: number;
  totalValue: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  openRate: number;
  clickRate: number;
  sent: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  icon: React.ReactNode;
  color: string;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  agentId: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp?: string;
  satisfaction?: 'satisfied' | 'unsatisfied' | null;
  thought?: string;
}

// Fix: Added Tool interface to resolve Module '"./types.ts"' has no exported member 'Tool'
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'Strategy' | 'Creation' | 'Client' | 'Productivity';
  icon: React.ReactElement;
  gradient: string;
  systemInstruction: string;
  promptExamples?: string[] | ((user: UserProfile) => string[]);
}

// Fix: Added Recipe interface to resolve Module '"./types.ts"' has no exported member 'Recipe'
export interface Recipe {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  gradient: string;
  toolIds: string[];
}
