import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { EditalView } from './components/EditalView';
import { SimuladosView } from './components/SimuladosView';
import { TimerView } from './components/TimerView';
import { FlashcardsView } from './components/FlashcardsView';
import { Modals } from './components/Modals';
import { Module, Subject, Topic, Simulado, DeleteTarget } from './types';
import { MOTIVATIONAL_VERSES } from './data/initialData';
import { testFirestoreConnection } from './lib/firebase';
import { Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('app_theme');
    return saved ? saved === 'dark' : true;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('visao_geral');

  // Verses Index
  const [verseIndex, setVerseIndex] = useState<number>(() => {
    return Math.floor(Math.random() * MOTIVATIONAL_VERSES.length);
  });

  // Modals States
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Module Modal
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Subject Modal
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [targetModuleIdForSubject, setTargetModuleIdForSubject] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Topic Modal
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [targetSubjectIdForTopic, setTargetSubjectIdForTopic] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Simulado Modal
  const [simuladoModalOpen, setSimuladoModalOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | null>(null);

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Test connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem('app_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Modal helper functions
  const handleOpenModuleModal = (mod: Module | null = null) => {
    setEditingModule(mod);
    setModuleModalOpen(true);
  };

  const handleOpenSubjectModal = (modId: string, sub: Subject | null = null) => {
    setTargetModuleIdForSubject(modId);
    setEditingSubject(sub);
    setSubjectModalOpen(true);
  };

  const handleOpenTopicModal = (subId: string, top: Topic | null = null) => {
    setTargetSubjectIdForTopic(subId);
    setEditingTopic(top);
    setTopicModalOpen(true);
  };

  const handleOpenSimuladoModal = (sim: Simulado | null = null) => {
    setEditingSimulado(sim);
    setSimuladoModalOpen(true);
  };

  const handleConfirmDelete = (type: 'module' | 'subject' | 'topic' | 'simulado', id: string, parentId?: string) => {
    setDeleteTarget({ type, id, parentId });
    setDeleteModalOpen(true);
  };

  const handleNextVerse = () => {
    setVerseIndex(prev => (prev + 1) % MOTIVATIONAL_VERSES.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">
            Carregando Estude<span className="text-emerald-500 font-bold">X</span>...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenProfileModal={() => setProfileModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 px-6 pt-6 md:px-8 md:pt-8 overflow-y-auto flex flex-col justify-between min-h-screen">
        <div className="space-y-6">
          {activeTab === 'visao_geral' && (
            <DashboardView
              isDarkMode={isDarkMode}
              onSelectSubject={(_sub) => setActiveTab('edital')}
            />
          )}

          {activeTab === 'edital' && (
            <EditalView
              isDarkMode={isDarkMode}
              onOpenModuleModal={handleOpenModuleModal}
              onOpenSubjectModal={handleOpenSubjectModal}
              onOpenTopicModal={handleOpenTopicModal}
              onConfirmDelete={handleConfirmDelete}
            />
          )}

          {activeTab === 'simulados' && (
            <SimuladosView
              isDarkMode={isDarkMode}
              onOpenSimuladoModal={handleOpenSimuladoModal}
              onConfirmDelete={(type, id) => handleConfirmDelete(type, id)}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'timer' && (
            <TimerView isDarkMode={isDarkMode} />
          )}
        </div>

        {/* Motivational Verse Footer - Edge to Edge Thought Banner */}
        <footer className="mt-12 -mx-6 md:-mx-8">
          <div
            className={`w-full py-3.5 px-6 md:px-8 border-t transition-all duration-300 select-none flex flex-col items-center text-center ${
              isDarkMode
                ? 'bg-slate-900/20 border-slate-800/50 text-slate-400/90 backdrop-blur-sm'
                : 'bg-slate-100/40 border-slate-200/60 text-slate-600/90'
            }`}
          >
            {/* Thought callout header */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-500/80 mb-1.5 pb-1 border-b border-dashed border-slate-700/20 max-w-md w-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
              <span>Pensamento & Inspiração</span>
            </div>

            {/* Verse text centered */}
            <div className="relative max-w-2xl mx-auto px-4">
              <p className={`text-xs italic font-medium leading-relaxed ${
                isDarkMode ? 'text-slate-300/80' : 'text-slate-700/80'
              }`}>
                {MOTIVATIONAL_VERSES[verseIndex]}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Modals Manager */}
      <Modals
        isDarkMode={isDarkMode}
        profileModalOpen={profileModalOpen}
        setProfileModalOpen={setProfileModalOpen}
        moduleModalOpen={moduleModalOpen}
        setModuleModalOpen={setModuleModalOpen}
        editingModule={editingModule}
        subjectModalOpen={subjectModalOpen}
        setSubjectModalOpen={setSubjectModalOpen}
        targetModuleIdForSubject={targetModuleIdForSubject}
        editingSubject={editingSubject}
        topicModalOpen={topicModalOpen}
        setTopicModalOpen={setTopicModalOpen}
        targetSubjectIdForTopic={targetSubjectIdForTopic}
        editingTopic={editingTopic}
        simuladoModalOpen={simuladoModalOpen}
        setSimuladoModalOpen={setSimuladoModalOpen}
        editingSimulado={editingSimulado}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        deleteTarget={deleteTarget}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppContent />
      </DataProvider>
    </AuthProvider>
  );
}
