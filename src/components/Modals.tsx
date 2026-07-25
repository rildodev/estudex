import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Module, Subject, Topic, Simulado, DeleteTarget } from '../types';
import { X, Trash2, Download, Upload, RotateCcw } from 'lucide-react';

interface ModalsProps {
  isDarkMode: boolean;
  // Profile
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  // Module
  moduleModalOpen: boolean;
  setModuleModalOpen: (open: boolean) => void;
  editingModule: Module | null;
  // Subject
  subjectModalOpen: boolean;
  setSubjectModalOpen: (open: boolean) => void;
  targetModuleIdForSubject: string | null;
  editingSubject: Subject | null;
  // Topic
  topicModalOpen: boolean;
  setTopicModalOpen: (open: boolean) => void;
  targetSubjectIdForTopic: string | null;
  editingTopic: Topic | null;
  // Simulado
  simuladoModalOpen: boolean;
  setSimuladoModalOpen: (open: boolean) => void;
  editingSimulado: Simulado | null;
  // Delete
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  deleteTarget: DeleteTarget | null;
}

export const Modals: React.FC<ModalsProps> = ({
  isDarkMode,
  profileModalOpen,
  setProfileModalOpen,
  moduleModalOpen,
  setModuleModalOpen,
  editingModule,
  subjectModalOpen,
  setSubjectModalOpen,
  targetModuleIdForSubject,
  editingSubject,
  topicModalOpen,
  setTopicModalOpen,
  targetSubjectIdForTopic,
  editingTopic,
  simuladoModalOpen,
  setSimuladoModalOpen,
  editingSimulado,
  deleteModalOpen,
  setDeleteModalOpen,
  deleteTarget
}) => {
  const { currentUser, updateUserProfile } = useAuth();
  const { 
    modules, 
    simulados, 
    addModule, 
    updateModule, 
    deleteModule,
    addSubject, 
    updateSubject, 
    deleteSubject,
    addTopic, 
    updateTopic, 
    deleteTopic,
    addSimulado, 
    updateSimulado, 
    deleteSimulado,
    importBackupData,
    resetDataToDefault
  } = useData();

  // Profile Form States
  const [profName, setProfName] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profPass, setProfPass] = useState('');
  const [profMsg, setProfMsg] = useState<string | null>(null);
  const [profLoading, setProfLoading] = useState(false);

  // Module Form
  const [moduleTitle, setModuleTitle] = useState('');

  // Subject Form
  const [subjectName, setSubjectName] = useState('');

  // Topic Form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicNotes, setTopicNotes] = useState('');

  // Simulado Form
  const [simName, setSimName] = useState('');
  const [simBanca, setSimBanca] = useState('');
  const [simDate, setSimDate] = useState('');
  const [simTotalQ, setSimTotalQ] = useState('');
  const [simCorrectQ, setSimCorrectQ] = useState('');

  // Sync Profile initial values
  useEffect(() => {
    if (currentUser) {
      setProfName(currentUser.displayName || '');
      setProfEmail(currentUser.email || '');
      setProfPass('');
    }
  }, [currentUser, profileModalOpen]);

  // Sync Module initial values
  useEffect(() => {
    setModuleTitle(editingModule ? editingModule.title : '');
  }, [editingModule, moduleModalOpen]);

  // Sync Subject initial values
  useEffect(() => {
    setSubjectName(editingSubject ? editingSubject.name : '');
  }, [editingSubject, subjectModalOpen]);

  // Sync Topic initial values
  useEffect(() => {
    setTopicTitle(editingTopic ? editingTopic.title : '');
    setTopicNotes(editingTopic ? editingTopic.notes || '' : '');
  }, [editingTopic, topicModalOpen]);

  // Sync Simulado initial values
  useEffect(() => {
    setSimName(editingSimulado ? editingSimulado.name : '');
    setSimBanca(editingSimulado ? editingSimulado.banca : '');
    setSimDate(editingSimulado ? editingSimulado.date : new Date().toISOString().split('T')[0]);
    setSimTotalQ(editingSimulado ? editingSimulado.totalQuestions.toString() : '');
    setSimCorrectQ(editingSimulado ? editingSimulado.correctAnswers.toString() : '');
  }, [editingSimulado, simuladoModalOpen]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfMsg(null);
    setProfLoading(true);

    try {
      await updateUserProfile(profName, profEmail, profPass || undefined);
      setProfMsg('Perfil atualizado com sucesso!');
      setTimeout(() => setProfileModalOpen(false), 1000);
    } catch (err: any) {
      setProfMsg(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfLoading(false);
    }
  };

  const handleSaveModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    if (editingModule) {
      await updateModule(editingModule.id, moduleTitle);
    } else {
      await addModule(moduleTitle);
    }
    setModuleModalOpen(false);
  };

  const handleSaveSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !targetModuleIdForSubject) return;

    if (editingSubject) {
      await updateSubject(targetModuleIdForSubject, editingSubject.id, subjectName);
    } else {
      await addSubject(targetModuleIdForSubject, subjectName);
    }
    setSubjectModalOpen(false);
  };

  const handleSaveTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetSubjectIdForTopic) return;

    if (editingTopic) {
      await updateTopic(targetSubjectIdForTopic, editingTopic.id, topicTitle, topicNotes);
    } else {
      await addTopic(targetSubjectIdForTopic, topicTitle, topicNotes);
    }
    setTopicModalOpen(false);
  };

  const handleSaveSimuladoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;

    const simData = {
      name: simName.trim(),
      banca: simBanca.trim() || 'Desconhecida',
      date: simDate || new Date().toISOString().split('T')[0],
      totalQuestions: parseInt(simTotalQ) || 0,
      correctAnswers: parseInt(simCorrectQ) || 0
    };

    if (editingSimulado) {
      await updateSimulado(editingSimulado.id, simData);
    } else {
      await addSimulado(simData);
    }
    setSimuladoModalOpen(false);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    const { type, id, parentId } = deleteTarget;

    if (type === 'module') {
      await deleteModule(id);
    } else if (type === 'subject') {
      await deleteSubject(id);
    } else if (type === 'topic' && parentId) {
      await deleteTopic(parentId, id);
    } else if (type === 'simulado') {
      await deleteSimulado(id);
    }

    setDeleteModalOpen(false);
  };

  // Export & Import
  const handleExportBackup = () => {
    const data = JSON.stringify({ modules, simulados }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudex_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.modules) && Array.isArray(parsed.simulados)) {
          await importBackupData(parsed.modules, parsed.simulados);
          setProfMsg('Backup importado com sucesso!');
        } else {
          setProfMsg('Formato de arquivo de backup inválido.');
        }
      } catch (err) {
        setProfMsg('Erro ao ler o arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Perfil & Backup de Dados</h3>
              <button 
                onClick={() => setProfileModalOpen(false)} 
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profMsg && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                profMsg.includes('sucesso') 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                {profMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={profName}
                  onChange={e => setProfName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  disabled={currentUser?.isAnonymous}
                  value={profEmail}
                  onChange={e => setProfEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {!currentUser?.isAnonymous && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Nova Senha (Opcional)
                  </label>
                  <input
                    type="password"
                    value={profPass}
                    onChange={e => setProfPass(e.target.value)}
                    placeholder="Deixe em branco para manter a atual"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}

              {/* Backup Controls */}
              <div className="pt-4 border-t border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Backup de Dados
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Exportar
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Importar
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja restaurar os dados padrão?')) {
                        await resetDataToDefault();
                        setProfMsg('Dados restaurados para o padrão.');
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Resetar
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  {profLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {moduleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-bold mb-4">
              {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
            <form onSubmit={handleSaveModuleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Título do Módulo
                </label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  placeholder="Ex: Módulo III: Legislação Específica"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {subjectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-bold mb-4">
              {editingSubject ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h3>
            <form onSubmit={handleSaveSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="Ex: Direito Penal"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {topicModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-bold mb-4">
              {editingTopic ? 'Editar Tópico' : 'Novo Tópico'}
            </h3>
            <form onSubmit={handleSaveTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Título do Tópico
                </label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  placeholder="Ex: Crimes contra a Administração Pública"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  value={topicNotes}
                  onChange={e => setTopicNotes(e.target.value)}
                  placeholder="Ex: Dar atenção especial aos artigos 312 a 327"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Salvar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulado Modal */}
      {simuladoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-bold mb-4">
              {editingSimulado ? 'Editar Simulado' : 'Novo Simulado'}
            </h3>
            <form onSubmit={handleSaveSimuladoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                  Nome do Simulado
                </label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={e => setSimName(e.target.value)}
                  placeholder="Ex: Simulado MPU Rodada 01"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Banca</label>
                  <input
                    type="text"
                    value={simBanca}
                    onChange={e => setSimBanca(e.target.value)}
                    placeholder="Ex: CEBRASPE"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Data</label>
                  <input
                    type="date"
                    value={simDate}
                    onChange={e => setSimDate(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Total de Questões</label>
                  <input
                    type="number"
                    min="1"
                    value={simTotalQ}
                    onChange={e => setSimTotalQ(e.target.value)}
                    placeholder="120"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Questões Corretas</label>
                  <input
                    type="number"
                    min="0"
                    value={simCorrectQ}
                    onChange={e => setSimCorrectQ(e.target.value)}
                    placeholder="95"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSimuladoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
                >
                  Salvar Simulado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-sm w-full p-6 rounded-2xl border shadow-2xl text-center space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="inline-flex p-3 bg-rose-500/20 text-rose-400 rounded-full">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Confirmar Exclusão</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tem certeza que deseja apagar este item? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
