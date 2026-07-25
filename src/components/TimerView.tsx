import React from 'react';
import { useData } from '../context/DataContext';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface TimerViewProps {
  isDarkMode: boolean;
}

export const TimerView: React.FC<TimerViewProps> = ({ isDarkMode }) => {
  const { 
    modules, 
    timerSeconds, 
    timerRunning, 
    timerSubject, 
    setTimerRunning, 
    setTimerSubject, 
    resetTimer 
  } = useData();

  const formatTimeDisplay = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allSubjects = modules.flatMap(m => m.subjects);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="text-center">
        <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Cronômetro de Estudo Líquido
        </h1>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Tempo mantido com precisão matemática mesmo se a página for recarregada ou fechada.
        </p>
      </div>

      <div className={`p-8 rounded-3xl border text-center shadow-xl space-y-6 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
            Matéria de Foco
          </label>
          <select
            value={timerSubject}
            onChange={e => setTimerSubject(e.target.value)}
            className={`w-full max-w-xs px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-emerald-500 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            {allSubjects.length === 0 ? (
              <option value="Estudo Geral">Estudo Geral</option>
            ) : (
              allSubjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))
            )}
          </select>
        </div>

        <div className={`text-6xl md:text-7xl font-mono font-bold tracking-wider py-8 rounded-2xl border shadow-inner transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'
        }`}>
          {formatTimeDisplay(timerSeconds)}
        </div>

        <div className="flex justify-center items-center gap-4 flex-wrap">
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-lg active:scale-95 ${
              timerRunning 
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            }`}
          >
            {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {timerRunning ? 'Pausar Foco' : 'Iniciar Foco'}
          </button>

          <button
            onClick={resetTimer}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition border active:scale-95 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> Zerar
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Foco ativo em: <strong className="text-emerald-400">{timerSubject}</strong></span>
        </div>
      </div>
    </div>
  );
};
