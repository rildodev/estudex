import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Module, Subject, Topic, TopicStatus } from '../types';
import { Plus, Edit3, Trash2, BookOpen, CheckCircle2, Sparkles, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface EditalViewProps {
  isDarkMode: boolean;
  onOpenModuleModal: (mod?: Module | null) => void;
  onOpenSubjectModal: (modId: string, sub?: Subject | null) => void;
  onOpenTopicModal: (subId: string, top?: Topic | null) => void;
  onConfirmDelete: (type: 'module' | 'subject' | 'topic', id: string, parentId?: string) => void;
}

interface ToastState {
  show: boolean;
  title: string;
  message: string;
  type: 'completed' | 'theory';
}

export const EditalView: React.FC<EditalViewProps> = ({
  isDarkMode,
  onOpenModuleModal,
  onOpenSubjectModal,
  onOpenTopicModal,
  onConfirmDelete
}) => {
  const { modules, updateTopicStatus, updateTopicQuestions } = useData();

  const [toast, setToast] = useState<ToastState>({
    show: false,
    title: '',
    message: '',
    type: 'completed'
  });

  // Auto hide toast after 4.5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const triggerCelebration = (topicTitle: string) => {
    // Fire festive confetti animation
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#34d399']
    });

    // Secondary burst delay for richer reward feeling
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#f59e0b', '#34d399']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899']
      });
    }, 250);

    const messages = [
      '🎉 Excelente trabalho! Tópico totalmente concluído com sucesso!',
      '🏆 Mais uma etapa superada no edital! Rumo à vaga e à nomeação!',
      '✨ Foco e constância! Cada tópico concluído é um passo rumo à posse!',
      '🔥 Mandou muito bem! O esforço de hoje constrói a sua aprovação!'
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    setToast({
      show: true,
      title: topicTitle,
      message: randomMsg,
      type: 'completed'
    });
  };

  const handleStatusChange = (subId: string, topId: string, topicTitle: string, currentStatus: TopicStatus, newStatus: TopicStatus) => {
    updateTopicStatus(subId, topId, newStatus);

    if (newStatus === 'Concluído' && currentStatus !== 'Concluído') {
      triggerCelebration(topicTitle);
    } else if (newStatus === 'Teoria Concluída' && currentStatus !== 'Teoria Concluída') {
      setToast({
        show: true,
        title: topicTitle,
        message: '📖 Teoria finalizada com sucesso! Agora é praticar com questões.',
        type: 'theory'
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Edital Verticalizado
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Organize seu plano de estudos por módulos, disciplinas e tópicos com salvamento em tempo real.
          </p>
        </div>
        <button
          onClick={() => onOpenModuleModal(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-emerald-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" /> Novo Módulo
        </button>
      </div>

      {modules.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <h3 className="font-semibold text-base mb-1">Seu edital está vazio</h3>
          <p className="text-xs max-w-sm mx-auto mb-4">Adicione o primeiro módulo para estruturar as disciplinas do seu concurso público.</p>
          <button
            onClick={() => onOpenModuleModal(null)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition"
          >
            Criar Primeiro Módulo
          </button>
        </div>
      ) : (
        modules.map(mod => (
          <div key={mod.id} className={`p-6 rounded-2xl border space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Module Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-emerald-400">{mod.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSubjectModal(mod.id, null)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Disciplina
                </button>
                <button
                  onClick={() => onOpenModuleModal(mod)}
                  title="Editar Módulo"
                  className={`p-1.5 rounded-lg border transition ${
                    isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onConfirmDelete('module', mod.id)}
                  title="Excluir Módulo"
                  className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subjects List */}
            {mod.subjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhuma disciplina cadastrada neste módulo.</p>
            ) : (
              mod.subjects.map(sub => (
                <div key={sub.id} className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {sub.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenTopicModal(sub.id, null)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-semibold transition"
                      >
                        <Plus className="w-3 h-3" /> Tópico
                      </button>
                      <button
                        onClick={() => onOpenSubjectModal(mod.id, sub)}
                        title="Editar Disciplina"
                        className={`p-1 rounded border transition ${
                          isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete('subject', sub.id)}
                        title="Excluir Disciplina"
                        className="p-1 rounded border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Topics List */}
                  <div className={`border rounded-xl divide-y overflow-hidden ${
                    isDarkMode ? 'border-slate-800 divide-slate-800/80 bg-slate-950/40' : 'border-slate-200 divide-slate-200 bg-slate-50'
                  }`}>
                    {sub.topics.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Nenhum tópico cadastrado nesta disciplina.</div>
                    ) : (
                      sub.topics.map(top => (
                        <div key={top.id} className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition ${
                          top.status === 'Concluído'
                            ? (isDarkMode ? 'bg-emerald-950/15 hover:bg-emerald-950/25' : 'bg-emerald-50/60 hover:bg-emerald-50')
                            : (isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100/60')
                        }`}>
                          <div className="flex-1 min-w-0 flex items-start gap-2.5">
                            {top.status === 'Concluído' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-xs font-medium ${
                                top.status === 'Concluído'
                                  ? 'line-through text-emerald-400/90'
                                  : (isDarkMode ? 'text-slate-200' : 'text-slate-800')
                              }`}>
                                {top.title}
                              </p>
                              {top.notes && (
                                <p className={`text-[11px] mt-0.5 italic truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Obs: {top.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {/* Status Dropdown */}
                            <select
                              value={top.status}
                              onChange={e => handleStatusChange(sub.id, top.id, top.title, top.status, e.target.value as TopicStatus)}
                              className={`text-xs rounded-lg px-2.5 py-1.5 border font-medium focus:outline-none focus:border-emerald-500 transition ${
                                top.status === 'Concluído'
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-semibold'
                                  : top.status === 'Teoria Concluída'
                                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                  : top.status === 'Em andamento'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                  : (isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800')
                              }`}
                            >
                              <option value="Não iniciado">Não iniciado</option>
                              <option value="Em andamento">Em andamento</option>
                              <option value="Teoria Concluída">Teoria Concluída</option>
                              <option value="Revisão pendente">Revisão pendente</option>
                              <option value="Concluído">Concluído</option>
                            </select>

                            {/* Questions Counter */}
                            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                              isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-white border-slate-300 text-slate-600'
                            }`}>
                              <span>Acertos:</span>
                              <input
                                type="number"
                                min="0"
                                value={top.questionsCorrect || 0}
                                onChange={e => updateTopicQuestions(sub.id, top.id, top.questionsTotal, parseInt(e.target.value) || 0)}
                                className={`w-10 text-center font-bold rounded focus:outline-none ${
                                  isDarkMode ? 'bg-slate-900 text-emerald-400' : 'bg-slate-100 text-emerald-600'
                                }`}
                              />
                              <span>/</span>
                              <input
                                type="number"
                                min="0"
                                value={top.questionsTotal || 0}
                                onChange={e => updateTopicQuestions(sub.id, top.id, parseInt(e.target.value) || 0, top.questionsCorrect)}
                                className={`w-10 text-center font-bold rounded focus:outline-none ${
                                  isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                                }`}
                              />
                            </div>

                            <button
                              onClick={() => onOpenTopicModal(sub.id, top)}
                              title="Editar Tópico"
                              className={`p-1.5 rounded transition ${
                                isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onConfirmDelete('topic', top.id, sub.id)}
                              title="Excluir Tópico"
                              className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ))
      )}

      {/* Floating Animated Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 backdrop-blur-md ${
              toast.type === 'completed'
                ? 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/50'
                : 'bg-slate-900/95 border-blue-500/50 text-white shadow-blue-950/50'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${
              toast.type === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {toast.type === 'completed' ? (
                <Trophy className="w-6 h-6 animate-pulse" />
              ) : (
                <Sparkles className="w-6 h-6 animate-pulse" />
              )}
            </div>

            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  toast.type === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {toast.type === 'completed' ? 'Tópico Concluído' : 'Teoria Concluída'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 truncate mt-1">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

