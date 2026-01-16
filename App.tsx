import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.tsx';
import Sidebar from './components/Sidebar.tsx';
import TopBar from './components/TopBar.tsx';
import DashboardHome from './components/DashboardHome.tsx';
import LeadsModule from './components/LeadsModule.tsx';
import ClientsModule from './components/ClientsModule.tsx';
import CampaignsModule from './components/CampaignsModule.tsx';
import EmailBuilderModule from './components/EmailBuilderModule.tsx';
import AIToolsModule from './components/AIToolsModule.tsx';
import MediaModule from './components/MediaModule.tsx';
import AssetsModule from './components/AssetsModule.tsx';
import TeamModule from './components/TeamModule.tsx';
import ReportsModule from './components/ReportsModule.tsx';
import IntegrationsModule from './components/IntegrationsModule.tsx';
import SettingsModule from './components/SettingsModule.tsx';
import IntakeModal, { IntakeData } from './components/IntakeModal.tsx';
import LoginModal from './components/LoginModal.tsx';
import { UserProfile } from './types.ts';
import { useDataStore } from './hooks/useDataStore.ts';
import { authService } from './services/authService.ts';
import { appStore } from './services/appStore.ts';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data store for all app data
  const dataStore = useDataStore();

  // Helper to sync user to team (appStore)
  const syncUserToTeam = (profile: UserProfile) => {
    if (profile.name && profile.email) {
      appStore.registerUser({
        name: profile.name,
        email: profile.email,
        role: profile.role || 'Team Member',
        department: profile.role,
        title: profile.role,
        agencyCoreCompetency: profile.agencyCoreCompetency,
        primaryClientIndustry: profile.primaryClientIndustry,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=d4a500&textColor=000000`
      });
    }
  };

  useEffect(() => {
    // Check for existing session (SQLite-based auth)
    const checkSession = async () => {
      // First try to load from localStorage for instant UI
      const storedProfile = localStorage.getItem('agency_user_profile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          setUserProfile(parsed);
          // Sync to team on restore
          syncUserToTeam(parsed);
        } catch (e) {
          console.error('Failed to parse stored profile');
        }
      }

      // Validate session with backend
      if (authService.isAuthenticated()) {
        const result = await authService.validateSession();
        if (result.success && result.user) {
          // Get profile data from backend
          const profiles = result.profiles || {};
          const settings = profiles.settings || {};
          const dashboard = profiles.dashboard || {};

          const userData: UserProfile = {
            name: result.user.name || result.user.email?.split('@')[0] || '',
            email: result.user.email || '',
            role: settings.role || 'Team Member',
            agencyCoreCompetency: settings.agency_core_competency || '',
            primaryClientIndustry: settings.primary_client_industry || '',
            agencyBrandVoice: settings.agency_brand_voice || '',
            targetLocation: settings.target_location || '',
            idealClientProfile: settings.ideal_client_profile || '',
            clientWorkExamples: settings.client_work_examples || '',
            primaryGoals: settings.primary_goals || [],
            successMetric: settings.success_metric || '',
            platformTheme: dashboard.theme || 'violet',
            toolLayout: dashboard.layout || 'grid',
            isPremium: settings.is_premium ?? true,
            credits: settings.credits ?? 1000,
            totalToolsUsed: settings.total_tools_used ?? 0,
            hasCompletedOnboarding: settings.has_completed_onboarding ?? false,
            themeMode: dashboard.themeMode || 'dark',
          };
          setUserProfile(userData);
          localStorage.setItem('agency_user_profile', JSON.stringify(userData));
          // Sync to team on session validate
          syncUserToTeam(userData);
        } else {
          // Session invalid, clear local data
          setUserProfile(null);
          localStorage.removeItem('agency_user_profile');
        }
      }
    };

    checkSession();
  }, []);

  const handleShowLogin = () => setShowLogin(true);
  const handleShowRegister = () => setShowIntake(true);

  const handleLoginSuccess = (user: any) => {
    console.log('Login successful:', user);

    const profile: UserProfile = {
      name: user.name,
      email: user.email,
      role: user.role || 'Strategist',
      agencyCoreCompetency: user.agencyCoreCompetency || '',
      primaryClientIndustry: user.primaryClientIndustry || '',
      agencyBrandVoice: '',
      targetLocation: '',
      idealClientProfile: '',
      clientWorkExamples: '',
      primaryGoals: [],
      successMetric: '',
      platformTheme: 'violet',
      toolLayout: 'grid',
      isPremium: true,
      credits: 1000,
      totalToolsUsed: 0,
      hasCompletedOnboarding: true,
      themeMode: 'dark',
    };

    localStorage.setItem('agency_user_profile', JSON.stringify(profile));
    setUserProfile(profile);
    // Sync to team on login
    syncUserToTeam(profile);
    setShowLogin(false);
    setActiveModule('dashboard');
  };

  const handleIntakeSubmit = async (data: IntakeData) => {
    console.log('Processing Intake Submission in App:', data);

    try {
      // Register user with SQLite backend
      const result = await authService.signup(data.email, data.password, data.name);

      if (!result.success) {
        console.error('Registration failed:', result.error);
        alert(result.error);
        return;
      }

      // Save profile data to backend
      if (result.user) {
        // Save settings module data
        await authService.saveModuleData('settings', {
          role: data.role || 'Team Member',
          agency_core_competency: data.agencyCoreCompetency,
          primary_client_industry: data.primaryClientIndustry,
          agency_brand_voice: data.agencyBrandVoice,
          target_location: data.targetLocation,
          ideal_client_profile: data.idealClientProfile,
          client_work_examples: data.clientWorkExamples,
          primary_goals: data.primaryGoals,
          success_metric: data.successMetric,
          is_premium: true,
          credits: 1000,
          total_tools_used: 0,
          has_completed_onboarding: true,
        });

        // Save dashboard preferences
        await authService.saveModuleData('dashboard', {
          theme: data.platformTheme || 'violet',
          layout: data.toolLayout || 'grid',
          themeMode: 'dark',
          widgets: [],
        });
      }

      const newUser: UserProfile = {
        ...data,
        isPremium: true,
        credits: 1000,
        totalToolsUsed: 0,
        hasCompletedOnboarding: true,
        themeMode: 'dark',
      };

      // Force immediate transition
      localStorage.setItem('agency_user_profile', JSON.stringify(newUser));
      setUserProfile(newUser);
      // Sync to team on signup
      syncUserToTeam(newUser);
      setShowIntake(false);
      setActiveModule('dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.message || 'Registration failed. Please try again.');
    }
  };

  const renderModule = () => {
    if (!userProfile) return null;
    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardHome
            user={userProfile}
            stats={dataStore.getStats()}
            onNavigate={setActiveModule}
          />
        );
      case 'leads':
        return (
          <LeadsModule
            leads={dataStore.leads}
            addLead={dataStore.addLead}
            updateLead={dataStore.updateLead}
            deleteLead={dataStore.deleteLead}
          />
        );
      case 'clients':
        return (
          <ClientsModule
            clients={dataStore.clients}
            addClient={dataStore.addClient}
            updateClient={dataStore.updateClient}
            deleteClient={dataStore.deleteClient}
          />
        );
      case 'campaigns':
        return (
          <CampaignsModule
            campaigns={dataStore.campaigns}
            addCampaign={dataStore.addCampaign}
            updateCampaign={dataStore.updateCampaign}
            deleteCampaign={dataStore.deleteCampaign}
          />
        );
      case 'email-builder': return <EmailBuilderModule user={userProfile} />;
      case 'ai-tools': return <AIToolsModule user={userProfile} />;
      case 'media': return <MediaModule user={userProfile} />;
      case 'assets': return <AssetsModule />;
      case 'team':
        return <TeamModule />;
      case 'reports': return <ReportsModule />;
      case 'integrations': return <IntegrationsModule />;
      case 'settings': return <SettingsModule user={userProfile} onUpdate={setUserProfile} />;
      default:
        return (
          <DashboardHome
            user={userProfile}
            stats={dataStore.getStats()}
            onNavigate={setActiveModule}
          />
        );
    }
  };

  if (!userProfile) {
    return (
      <div className="bg-brand-dark min-h-screen">
        <LandingPage onLogin={handleShowLogin} onRegister={handleShowRegister} />
        {showIntake && (
          <IntakeModal
            show={showIntake}
            onClose={() => setShowIntake(false)}
            onSubmit={handleIntakeSubmit}
          />
        )}
        {showLogin && (
          <LoginModal
            show={showLogin}
            onClose={() => setShowLogin(false)}
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => {
              setShowLogin(false);
              setShowIntake(true);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-dark selection:bg-brand-gold selection:text-black">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={(id) => {
          setActiveModule(id);
          setMobileMenuOpen(false); // Close mobile menu on navigation
        }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onLogout={async () => {
          await authService.logout();
          appStore.logout();
          localStorage.removeItem('agency_user_profile');
          setUserProfile(null);
          setActiveModule('dashboard');
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={userProfile} onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto bg-brand-dark scrollbar-hide">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default App;
