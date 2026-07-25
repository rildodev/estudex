import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  BookOpen, 
  BarChart3, 
  Clock, 
  Award, 
  ExternalLink, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Edit3,
  CloudCheck,
  CloudUpload,
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenProfileModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onOpenProfileModal
}) => {
  const { currentUser, logout } = useAuth();
  const { syncStatus } = useData();

  return (
    <aside className={`w-full md:w-64 border-r p-5 flex flex-col justify-between shrink-0 transition-colors ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-[22px] h-[22px]" />
            </div>
            <div>
              <h2 className={`font-bold leading-none tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Estude<span className="text-emerald-500 font-extrabold">X</span>
              </h2>
              <span className={`text-[11px] mt-1 block font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Estude melhor. Evolua todos os dias.
              </span>
            </div>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Alternar Tema Claro/Escuro"
            className={`p-2 rounded-xl border transition ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab('visao_geral')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'visao_geral'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('edital')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'edital'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Edital Verticalizado
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'flashcards'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" /> Flashcards
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
              <Sparkles className="w-2.5 h-2.5" /> IA
            </span>
          </button>

          <a
            href="https://www.pciconcursos.com.br/aulas/"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
              isDarkMode 
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4" /> Aulas
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
              PCI
            </span>
          </a>

          <button
            onClick={() => setActiveTab('simulados')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'simulados'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4" /> Simulados
            </div>
            <div className="flex items-center gap-1">
              <a
                href="https://www.pciconcursos.com.br/simulados/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Simulados PCI Concursos"
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition"
              >
                PCI
              </a>
              <a
                href="https://wqd.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Questões e Simulados WQD"
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 hover:bg-teal-500/40 transition"
              >
                WQD
              </a>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'timer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> Cronômetro
          </button>
        </nav>
      </div>

      {/* User Profile & Footer */}
      <div className={`pt-4 border-t mt-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-200 border-slate-700' 
                : 'bg-slate-200 text-slate-800 border-slate-300'
            }`}>
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden min-w-0 flex-1 flex flex-col justify-center">
              <p className={`text-xs font-semibold truncate leading-snug ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {currentUser?.displayName || 'Estudante'}
              </p>
              <p className={`text-[10px] truncate leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentUser?.email}
              </p>
              <div className="text-[9px] font-medium leading-snug mt-0.5">
                {syncStatus === 'synced' ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1 whitespace-nowrap">
                    <CloudCheck className="w-3 h-3 shrink-0" />
                    <span>Sincronizado na Nuvem</span>
                  </span>
                ) : syncStatus === 'saving' ? (
                  <span className="text-amber-400 inline-flex items-center gap-1 whitespace-nowrap animate-pulse">
                    <CloudUpload className="w-3 h-3 shrink-0" />
                    <span>Salvando na nuvem...</span>
                  </span>
                ) : (
                  <span className="text-rose-400 inline-flex items-center gap-1 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Erro de sincronização</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenProfileModal}
            title="Editar Perfil"
            className={`p-1.5 rounded-lg border transition shrink-0 ml-1.5 ${
              isDarkMode 
                ? 'hover:bg-slate-800 border-slate-700 text-slate-400' 
                : 'hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition border ${
            isDarkMode 
              ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
          }`}
        >
          <LogOut className="w-3.5 h-3.5" /> Sair do Sistema
        </button>

        {/* Developer Attribution */}
        <div className="mt-3 text-center">
          <a
            href="https://www.instagram.com/ril.dox/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] font-medium transition hover:underline inline-flex items-center gap-1 ${
              isDarkMode ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'
            }`}
          >
            Desenvolvido por Rildo Maciel
          </a>
        </div>
      </div>
    </aside>
  );
};
