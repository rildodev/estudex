import React from 'react';
import { useData } from '../context/DataContext';
import { Simulado } from '../types';
import { Plus, Edit3, Trash2, ExternalLink, Award } from 'lucide-react';

interface SimuladosViewProps {
  isDarkMode: boolean;
  onOpenSimuladoModal: (sim?: Simulado | null) => void;
  onConfirmDelete: (type: 'simulado', id: string) => void;
}

export const SimuladosView: React.FC<SimuladosViewProps> = ({
  isDarkMode,
  onOpenSimuladoModal,
  onConfirmDelete
}) => {
  const { simulados } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Histórico de Simulados
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Registre e edite suas provas para analisar seu rendimento com sincronização na nuvem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://www.pciconcursos.com.br/simulados/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-emerald-600/20"
          >
            <ExternalLink className="w-3.5 h-3.5" /> PCI Concursos
          </a>
          <a
            href="https://wqd.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-indigo-600/20"
          >
            <ExternalLink className="w-3.5 h-3.5" /> WQD Concursos
          </a>
          <button
            onClick={() => onOpenSimuladoModal(null)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition border ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Novo Simulado
          </button>
        </div>
      </div>

      {/* External Practice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-emerald-50/60 border-emerald-200/80'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl shrink-0 mt-0.5">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                PCI Concursos
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Simulados gratuitos organizados por banca, disciplina e cargo público.
              </p>
            </div>
          </div>
          <a
            href="https://www.pciconcursos.com.br/simulados/"
            target="_blank"
            rel="noopener noreferrer"
            className="self-end px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            Acessar PCI Concursos <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-teal-50/60 border-teal-200/80'
        }`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl shrink-0 mt-0.5">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                WQD Concursos
              </h3>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Plataforma com banco de questões e simulados práticos para provas.
              </p>
            </div>
          </div>
          <a
            href="https://wqd.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="self-end px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            Acessar WQD Concursos <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Simulados Table */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase font-semibold ${
              isDarkMode ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              <tr>
                <th className="p-4">Simulado</th>
                <th className="p-4">Banca</th>
                <th className="p-4">Data</th>
                <th className="p-4">Questões</th>
                <th className="p-4">Acertos</th>
                <th className="p-4">Aproveitamento</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode ? 'divide-slate-800 text-slate-300' : 'divide-slate-200 text-slate-700'
            }`}>
              {simulados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Award className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    Nenhum simulado cadastrado ainda.
                  </td>
                </tr>
              ) : (
                simulados.map(sim => {
                  const pct = sim.totalQuestions > 0 ? Math.round((sim.correctAnswers / sim.totalQuestions) * 100) : 0;
                  return (
                    <tr key={sim.id} className={`transition ${
                      isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                    }`}>
                      <td className={`p-4 font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {sim.name}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-300' 
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}>
                          {sim.banca}
                        </span>
                      </td>
                      <td className="p-4 opacity-80">{sim.date}</td>
                      <td className="p-4 font-medium">{sim.totalQuestions}</td>
                      <td className="p-4 text-emerald-500 font-bold">{sim.correctAnswers}</td>
                      <td className="p-4">
                        <span className={`font-extrabold ${pct >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenSimuladoModal(sim)}
                            title="Editar Simulado"
                            className={`p-1.5 rounded transition ${
                              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onConfirmDelete('simulado', sim.id)}
                            title="Excluir Simulado"
                            className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
