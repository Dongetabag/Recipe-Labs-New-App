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
import { authService, supabase } from './services/supabase.ts';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Data store for all app data
  const dataStore = useDataStore();

  useEffect(() => {
    // Check for existing Supabase session
    const checkSession = async () => {
      const { session } = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        const userData: UserProfile = {
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Team Member',
          agencyCoreCompetency: session.user.user_metadata?.agency_core_competency || '',
          primaryClientIndustry: session.user.user_metadata?.primary_client_industry || '',
          agencyBrandVoice: profile.data?.agency_brand_voice || '',
          targetLocation: profile.data?.target_location || '',
          idealClientProfile: profile.data?.ideal_client_profile || '',
          clientWorkExamples: profile.data?.client_work_examples || '',
          primaryGoals: profile.data?.primary_goals || [],
          successMetric: profile.data?.success_metric || '',
          platformTheme: profile.data?.platform_theme || 'violet',
          toolLayout: profile.data?.tool_layout || 'grid',
          isPremium: profile.data?.is_premium ?? true,
          credits: profile.data?.credits ?? 1000,
          totalToolsUsed: profile.data?.total_tools_used ?? 0,
          hasCompletedOnboarding: profile.data?.has_completed_onboarding ?? false,
          themeMode: profile.data?.theme_mode || 'dark',
        };
        setUserProfile(userData);
        // Also save to localStorage for quick access
        localStorage.setItem('agency_user_profile', JSON.stringify(userData));
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        localStorage.removeItem('agency_user_profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleShowLogin = () => setShowLogin(true);
  const handleShowRegister = () => setShowIntake(true);

  const handleLoginSuccess = (user: any) => {
    console.log('Login successful:', user);

    const userProfile: UserProfile = {
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

    localStorage.setItem('agency_user_profile', JSON.stringify(userProfile));
    setUserProfile(userProfile);
    setShowLogin(false);
    setActiveModule('dashboard');
  };

  const handleIntakeSubmit = async (data: IntakeData) => {
    console.log('Processing Intake Submission in App:', data);

    try {
      // Register user with Supabase
      const result = await authService.signUp(data.email, data.password, {
        name: data.name,
        role: data.role || 'Team Member',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=d4a500&textColor=000000`,
        agency_core_competency: data.agencyCoreCompetency,
        primary_client_industry: data.primaryClientIndustry,
      });

      if (!result.success) {
        console.error('Registration failed:', result.error);
        alert(result.error);
        return;
      }

      // Update profile with additional data
      if (result.user) {
        await authService.updateProfile(result.user.id, {
          agency_brand_voice: data.agencyBrandVoice,
          target_location: data.targetLocation,
          ideal_client_profile: data.idealClientProfile,
          client_work_examples: data.clientWorkExamples,
          primary_goals: data.primaryGoals,
          success_metric: data.successMetric,
          platform_theme: data.platformTheme,
          tool_layout: data.toolLayout,
        });
      }

      const newUser: UserProfile = {
        ...data,
        isPremium: true,
        credits: 1000,
        totalToolsUsed: 0,
        hasCompletedOnboarding: false,
        themeMode: 'dark',
      };

      // Force immediate transition
      localStorage.setItem('agency_user_profile', JSON.stringify(newUser));
      setUserProfile(newUser);
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
        setActiveModule={setActiveModule} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        onLogout={async () => {
          await authService.signOut();
          localStorage.removeItem('agency_user_profile');
          setUserProfile(null);
          setActiveModule('dashboard');
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={userProfile} />
        <main className="flex-1 overflow-y-auto bg-brand-dark scrollbar-hide">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default App;