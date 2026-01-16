// Session Memory Hook
// Provides persistent session state management across page reloads
// Remembers user preferences, last visited module, and UI state

import { useState, useEffect, useCallback } from 'react';

const SESSION_MEMORY_KEY = 'recipe-labs-session-memory';

export interface SessionMemory {
  lastActiveModule: string;
  sidebarCollapsed: boolean;
  lastVisitedModules: string[];
  recentSearches: string[];
  pinnedItems: string[];
  uiPreferences: {
    compactMode: boolean;
    animationsEnabled: boolean;
    notificationsEnabled: boolean;
  };
  moduleStates: Record<string, any>;
  lastActivity: string;
}

const DEFAULT_SESSION: SessionMemory = {
  lastActiveModule: 'dashboard',
  sidebarCollapsed: false,
  lastVisitedModules: [],
  recentSearches: [],
  pinnedItems: [],
  uiPreferences: {
    compactMode: false,
    animationsEnabled: true,
    notificationsEnabled: true,
  },
  moduleStates: {},
  lastActivity: new Date().toISOString(),
};

const getStoredSession = (): SessionMemory => {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  
  try {
    const stored = localStorage.getItem(SESSION_MEMORY_KEY);
    if (stored) {
      return { ...DEFAULT_SESSION, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to parse session memory:', e);
  }
  return DEFAULT_SESSION;
};

export const useSessionMemory = () => {
  const [session, setSession] = useState<SessionMemory>(getStoredSession);

  // Persist to localStorage on changes
  useEffect(() => {
    localStorage.setItem(SESSION_MEMORY_KEY, JSON.stringify(session));
  }, [session]);

  // Update last activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSession(prev => ({
        ...prev,
        lastActivity: new Date().toISOString()
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Track module navigation
  const trackModuleVisit = useCallback((moduleId: string) => {
    setSession(prev => {
      const visited = [moduleId, ...prev.lastVisitedModules.filter(m => m !== moduleId)].slice(0, 10);
      return {
        ...prev,
        lastActiveModule: moduleId,
        lastVisitedModules: visited,
        lastActivity: new Date().toISOString(),
      };
    });
  }, []);

  // Track search queries
  const trackSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSession(prev => {
      const searches = [query, ...prev.recentSearches.filter(s => s !== query)].slice(0, 10);
      return { ...prev, recentSearches: searches };
    });
  }, []);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSession(prev => ({ ...prev, recentSearches: [] }));
  }, []);

  // Toggle sidebar
  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSession(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  // Pin/unpin items
  const togglePinned = useCallback((itemId: string) => {
    setSession(prev => {
      const isPinned = prev.pinnedItems.includes(itemId);
      const pinnedItems = isPinned
        ? prev.pinnedItems.filter(id => id !== itemId)
        : [...prev.pinnedItems, itemId];
      return { ...prev, pinnedItems };
    });
  }, []);

  // Update UI preferences
  const updateUIPreferences = useCallback((prefs: Partial<SessionMemory['uiPreferences']>) => {
    setSession(prev => ({
      ...prev,
      uiPreferences: { ...prev.uiPreferences, ...prefs }
    }));
  }, []);

  // Save module-specific state (e.g., scroll position, filters, etc.)
  const saveModuleState = useCallback((moduleId: string, state: any) => {
    setSession(prev => ({
      ...prev,
      moduleStates: { ...prev.moduleStates, [moduleId]: state }
    }));
  }, []);

  // Get module-specific state
  const getModuleState = useCallback((moduleId: string) => {
    return session.moduleStates[moduleId] || null;
  }, [session.moduleStates]);

  // Reset session to defaults
  const resetSession = useCallback(() => {
    setSession(DEFAULT_SESSION);
    localStorage.removeItem(SESSION_MEMORY_KEY);
  }, []);

  // Check if session is stale (no activity for 24 hours)
  const isSessionStale = useCallback(() => {
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 24;
  }, [session.lastActivity]);

  return {
    // State
    session,
    lastActiveModule: session.lastActiveModule,
    sidebarCollapsed: session.sidebarCollapsed,
    recentSearches: session.recentSearches,
    pinnedItems: session.pinnedItems,
    uiPreferences: session.uiPreferences,

    // Actions
    trackModuleVisit,
    trackSearch,
    clearSearchHistory,
    setSidebarCollapsed,
    togglePinned,
    updateUIPreferences,
    saveModuleState,
    getModuleState,
    resetSession,
    isSessionStale,
  };
};

export default useSessionMemory;
