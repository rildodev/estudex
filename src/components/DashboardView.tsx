import React from 'react';
import { useData } from '../context/DataContext';
import { Subject } from '../types';
import { BarChart3, Award, Clock, FileText, ChevronRight } from 'lucide-react';

interface DashboardViewProps {
  isDarkMode: boolean;
  onSelectSubject: (subject: Subject) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ isDarkMode, onSelectSubject }) => {
  const { modules, simulados, stats, timerSeconds } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Visão Geral do Edital
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Acompanhe suas métricas de progresso e resolução de questões em tempo real com sincronização na Nuvem.
        </p>
      </div>

      {/* Progress Bar: Cobertura do Edital */}
      <div className={`p-5 rounded-2xl border transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-2.5">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Cobertura do Edital
          </span>
          <span className="text-sm font-extrabold text-emerald-500">
            {stats.progressPct}% Concluído
          </span>
        </div>
        <div className={`w-full h-3.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${stats.progressPct}%` }}
          />
        </div>
        <p className={`text-xs mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {stats.completedTopics} de {stats.totalTopics} tópicos estudados até o momento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Progresso Geral</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {stats.progressPct}%
          </div>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {stats.completedTopics} de {stats.totalTopics} tópicos concluídos
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Precisão em Questões</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {stats.accuracyPct}%
          </div>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {stats.correctQuestions} acertos em {stats.totalQuestions} questões
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Horas de Estudo</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {(timerSeconds / 3600).toFixed(1)}h
          </div>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Tempo acumulado no cronômetro
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Simulados Registrados</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {simulados.length}
          </div>
          <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Provas e testes adicionados
          </p>
        </div>
      </div>

      {/* Modules and Subjects */}
      <div className="space-y-4">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Disciplinas e Conteúdos
        </h2>
        {modules.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border text-sm ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            Nenhum módulo cadastrado. Clique na aba Edital Verticalizado para começar.
          </div>
        ) : (
          modules.map(mod => (
            <div key={mod.id} className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className="font-bold text-emerald-400 mb-4 text-base">
                {mod.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mod.subjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhuma disciplina neste módulo.</p>
                ) : (
                  mod.subjects.map(sub => {
                    const subTotal = sub.topics.length;
                    const subDone = sub.topics.filter(t => t.status === 'Concluído').length;
                    const subPct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

                    return (
                      <div
                        key={sub.id}
                        onClick={() => onSelectSubject(sub)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          isDarkMode 
                            ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/50' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {sub.name}
                            </span>
                            <span className="text-xs font-extrabold text-emerald-500">
                              {subPct}%
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${
                            isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                          }`}>
                            <div 
                              className="bg-emerald-500 h-full transition-all duration-300 rounded-full" 
                              style={{ width: `${subPct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/20">
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {subDone} de {subTotal} tópicos concluídos
                          </span>
                          <ChevronRight className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
