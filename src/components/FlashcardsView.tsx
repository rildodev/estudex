import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { Flashcard } from '../types';
import { 
  Sparkles, 
  Layers, 
  Plus, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  BrainCircuit, 
  Shuffle, 
  Trash2, 
  Edit3, 
  Filter, 
  BookOpen, 
  Check, 
  X, 
  Loader2,
  HelpCircle,
  Award,
  Zap
} from 'lucide-react';

interface FlashcardsViewProps {
  isDarkMode: boolean;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ isDarkMode }) => {
  const { modules, flashcards, addFlashcard, addBulkFlashcards, updateFlashcard, deleteFlashcard } = useData();

  // Active View Mode inside Flashcards: 'study' (Study deck) | 'manage' (All Cards Table/Grid)
  const [mode, setMode] = useState<'study' | 'manage'>('study');

  // Filter state
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  
  // Study State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [studiedCount, setStudiedCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(5);
  const [cardStyle, setCardStyle] = useState<string>('conceitos');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // AI Preview generated cards before saving
  const [generatedPreview, setGeneratedPreview] = useState<Array<{ front: string; back: string; difficulty?: 'easy' | 'medium' | 'hard'; selected: boolean }>>([]);

  // Manual Add / Edit Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [manualForm, setManualForm] = useState({
    subjectName: '',
    topicTitle: '',
    front: '',
    back: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Extract all subjects from registered Edital Verticalizado
  const allSubjects = useMemo(() => {
    const list: Array<{ id: string; name: string; moduleTitle: string; topics: Array<{ id: string; title: string; notes?: string }> }> = [];
    modules.forEach(m => {
      m.subjects.forEach(s => {
        list.push({
          id: s.id,
          name: s.name,
          moduleTitle: m.title,
          topics: s.topics
        });
      });
    });
    return list;
  }, [modules]);

  // Filtered flashcards list based on selectedSubjectFilter
  const activeDeck = useMemo(() => {
    if (selectedSubjectFilter === 'all') return flashcards;
    return flashcards.filter(c => c.subjectName === selectedSubjectFilter || c.subjectId === selectedSubjectFilter);
  }, [flashcards, selectedSubjectFilter]);

  // Current flashcard being studied
  const currentCard = activeDeck[currentIndex];

  // Selected subject's topics for AI modal
  const currentAiSubject = allSubjects.find(s => s.id === selectedSubjectId);

  // Reset study deck position when filter changes
  const handleFilterChange = (subName: string) => {
    setSelectedSubjectFilter(subName);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setStudiedCount(0);
  };

  // Flip Card Action
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Next / Prev card in Study Mode
  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentIndex < activeDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleShuffleDeck = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.floor(Math.random() * (activeDeck.length || 1)));
  };

  const handleRateMastery = async (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      const currentLevel = card.masteryLevel || 0;
      const newLevel = rating === 'easy' ? Math.min(5, currentLevel + 1) : rating === 'hard' ? Math.max(0, currentLevel - 1) : currentLevel;
      await updateFlashcard(cardId, {
        difficulty: rating,
        masteryLevel: newLevel,
        lastReviewed: new Date().toISOString()
      });
    }
    setStudiedCount(prev => prev + 1);
    handleNextCard();
  };

  // Generate Flashcards via AI
  const handleGenerateAiFlashcards = async () => {
    setAiError(null);
    setIsGenerating(true);
    setGeneratedPreview([]);

    const subjectObj = allSubjects.find(s => s.id === selectedSubjectId);
    const topicObj = subjectObj?.topics.find(t => t.id === selectedTopicId);

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subjectObj ? subjectObj.name : 'Geral',
          topicTitle: topicObj ? topicObj.title : '',
          topicNotes: topicObj ? topicObj.notes : '',
          count: cardCount,
          style: cardStyle
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Falha ao gerar flashcards via IA.');
      }

      if (Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setGeneratedPreview(data.flashcards.map((c: any) => ({
          front: c.front,
          back: c.back,
          difficulty: c.difficulty || 'medium',
          selected: true
        })));
      } else {
        throw new Error('Nenhum flashcard retornado pela IA.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || 'Erro ao comunicar com a Inteligência Artificial.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save AI Generated Cards to state/Firestore
  const handleSaveGeneratedCards = async () => {
    const selectedCards = generatedPreview.filter(c => c.selected);
    if (selectedCards.length === 0) return;

    const subjectObj = allSubjects.find(s => s.id === selectedSubjectId);
    const topicObj = subjectObj?.topics.find(t => t.id === selectedTopicId);

    const formattedList = selectedCards.map(c => ({
      subjectId: subjectObj?.id || '',
      subjectName: subjectObj?.name || 'Geral',
      topicId: topicObj?.id || '',
      topicTitle: topicObj?.title || '',
      front: c.front,
      back: c.back,
      difficulty: c.difficulty || 'medium',
      masteryLevel: 1
    }));

    await addBulkFlashcards(formattedList);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    setIsAiModalOpen(false);
    setGeneratedPreview([]);
    setSelectedSubjectId('');
    setSelectedTopicId('');
  };

  // Manual Card Save
  const handleSaveManualCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.front.trim() || !manualForm.back.trim()) return;

    if (editingCard) {
      await updateFlashcard(editingCard.id, {
        subjectName: manualForm.subjectName || 'Geral',
        topicTitle: manualForm.topicTitle,
        front: manualForm.front,
        back: manualForm.back,
        difficulty: manualForm.difficulty
      });
    } else {
      await addFlashcard({
        subjectName: manualForm.subjectName || 'Geral',
        topicTitle: manualForm.topicTitle,
        front: manualForm.front,
        back: manualForm.back,
        difficulty: manualForm.difficulty,
        masteryLevel: 1
      });
    }

    setIsManualModalOpen(false);
    setEditingCard(null);
    setManualForm({ subjectName: '', topicTitle: '', front: '', back: '', difficulty: 'medium' });
  };

  const handleOpenEditManualModal = (card: Flashcard) => {
    setEditingCard(card);
    setManualForm({
      subjectName: card.subjectName,
      topicTitle: card.topicTitle || '',
      front: card.front,
      back: card.back,
      difficulty: card.difficulty || 'medium'
    });
    setIsManualModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Flashcards & Memorização
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3 h-3" /> IA Integrada
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Gere flashcards via Inteligência Artificial com base no seu Edital Verticalizado ou crie seu próprio baralho.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
            <span>Gerar Flashcards com IA</span>
          </button>

          <button
            onClick={() => {
              setEditingCard(null);
              setManualForm({ subjectName: '', topicTitle: '', front: '', back: '', difficulty: 'medium' });
              setIsManualModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition border ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Card Manual</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className={`p-3 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setMode('study')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'study'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Modo Estudo</span>
          </button>
          <button
            onClick={() => setMode('manage')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'manage'
                ? 'bg-emerald-600 text-white shadow-sm'
                : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gerenciar Baralho ({flashcards.length})</span>
          </button>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <select
            value={selectedSubjectFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className={`text-xs font-medium rounded-xl px-3 py-1.5 border transition outline-none cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-emerald-500' 
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
            }`}
          >
            <option value="all">Todas as Disciplinas ({flashcards.length})</option>
            {allSubjects.map(sub => {
              const count = flashcards.filter(c => c.subjectName === sub.name || c.subjectId === sub.id).length;
              return (
                <option key={sub.id} value={sub.name}>
                  {sub.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* MODE 1: STUDY MODE (FLIP CARDS) */}
      {mode === 'study' && (
        <div className="max-w-2xl mx-auto space-y-6 py-2">
          {activeDeck.length === 0 ? (
            <div className={`p-10 text-center rounded-3xl border ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Nenhum flashcard nesta disciplina
              </h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Gere novos cartões automaticamente usando a IA integrada ao seu Edital Verticalizado ou crie cartões manuais.
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gerar Flashcards com IA
              </button>
            </div>
          ) : isFinished ? (
            <div className={`p-8 text-center rounded-3xl border transition-all ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}>
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Award className="w-7 h-7" />
              </div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Sessão de Estudo Concluída! 🎉
              </h3>
              <p className={`text-xs mt-2 max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Você revisou <strong className="text-emerald-400">{activeDeck.length} flashcards</strong> deste baralho. A repetição espaçada é o segredo para a aprovação!
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsFinished(false);
                    setIsFlipped(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Reiniciar Baralho
                </button>
                <button
                  onClick={handleShuffleDeck}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" /> Embaralhar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header Info & Counter */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                    {currentCard?.subjectName || 'Geral'}
                  </span>
                  {currentCard?.topicTitle && (
                    <span className={`text-[11px] font-medium truncate max-w-[200px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      • {currentCard.topicTitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShuffleDeck}
                    title="Embaralhar cartões"
                    className={`p-1.5 rounded-lg border transition ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    {currentIndex + 1} / {activeDeck.length}
                  </span>
                </div>
              </div>

              {/* FLIP CARD AREA */}
              <div 
                onClick={handleFlip}
                className={`relative min-h-[260px] md:min-h-[300px] p-6 md:p-8 rounded-3xl border cursor-pointer select-none transition-all duration-300 transform active:scale-[0.99] flex flex-col justify-between shadow-xl ${
                  isDarkMode 
                    ? isFlipped 
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700' 
                    : isFlipped 
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-emerald-500/10' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Front / Back Label */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isFlipped 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-700/30 text-slate-400 border-slate-700/50'
                  }`}>
                    {isFlipped ? 'VERSO • RESPOSTA' : 'FRENTE • PERGUNTA'}
                  </span>

                  <span className={`text-[11px] flex items-center gap-1 font-medium ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <RotateCw className="w-3 h-3" /> Clique para virar
                  </span>
                </div>

                {/* Main Card Content */}
                <div className="my-auto py-4">
                  <p className={`text-base md:text-lg font-medium leading-relaxed whitespace-pre-wrap ${
                    isFlipped 
                      ? isDarkMode ? 'text-emerald-200 font-semibold' : 'text-emerald-950 font-semibold' 
                      : isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    {isFlipped ? currentCard?.back : currentCard?.front}
                  </p>
                </div>

                {/* Footer hint inside card */}
                <div className="text-right">
                  <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isFlipped ? 'Avalie sua facilidade abaixo' : 'Pense na resposta e clique para conferir'}
                  </span>
                </div>
              </div>

              {/* CONTROLS BELOW CARD */}
              {isFlipped ? (
                /* Self-Rating difficulty buttons */
                <div className="space-y-2 animate-fadeIn">
                  <p className={`text-center text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Como foi responder este card?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleRateMastery(currentCard.id, 'hard')}
                      className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-0.5"
                    >
                      <span>🔴 Difícil</span>
                      <span className="text-[9px] font-normal opacity-80">Revisar logo</span>
                    </button>
                    <button
                      onClick={() => handleRateMastery(currentCard.id, 'medium')}
                      className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-0.5"
                    >
                      <span>🟡 Médio</span>
                      <span className="text-[9px] font-normal opacity-80">Manter ritmo</span>
                    </button>
                    <button
                      onClick={() => handleRateMastery(currentCard.id, 'easy')}
                      className="py-2.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-0.5"
                    >
                      <span>🟢 Fácil</span>
                      <span className="text-[9px] font-normal opacity-80">Dominado</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Navigation Prev/Next controls */
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevCard}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      currentIndex === 0
                        ? 'opacity-40 cursor-not-allowed border-transparent'
                        : isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>

                  <button
                    onClick={handleFlip}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Virar Cartão
                  </button>

                  <button
                    onClick={handleNextCard}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Próximo <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODE 2: MANAGE ALL CARDS (TABLE / GRID) */}
      {mode === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Total de Flashcards: {activeDeck.length}
            </span>
            <button
              onClick={() => {
                setEditingCard(null);
                setManualForm({ subjectName: '', topicTitle: '', front: '', back: '', difficulty: 'medium' });
                setIsManualModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDeck.map((card) => (
              <div
                key={card.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {card.subjectName}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      card.difficulty === 'easy' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : card.difficulty === 'hard' 
                          ? 'bg-rose-500/20 text-rose-400' 
                          : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {card.difficulty || 'MÉDIO'}
                    </span>
                  </div>

                  <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Q: {card.front}
                  </p>
                  <p className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    R: {card.back}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/40">
                  <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {card.topicTitle || 'Geral'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditManualModal(card)}
                      title="Editar Flashcard"
                      className={`p-1.5 rounded-lg border transition ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteFlashcard(card.id)}
                      title="Excluir Flashcard"
                      className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI GENERATOR MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className={`w-full max-w-xl p-6 rounded-3xl border shadow-2xl transition-all my-8 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Gerar Flashcards com IA</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Inteligência Artificial conectada ao seu Edital Verticalizado
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAiModalOpen(false);
                  setGeneratedPreview([]);
                  setAiError(null);
                }}
                className={`p-2 rounded-xl transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {aiError && (
              <div className="p-3.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Step 1: Form Selections */}
            {generatedPreview.length === 0 ? (
              <div className="space-y-4">
                {/* Select Subject from Registered Edital */}
                <div>
                  <label className="block text-xs font-bold mb-1.5">
                    1. Selecione a Disciplina do seu Edital Verticalizado *
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedTopicId('');
                    }}
                    className={`w-full text-xs font-medium rounded-xl p-3 border outline-none cursor-pointer transition ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
                    }`}
                  >
                    <option value="">-- Escolha uma disciplina cadastrada --</option>
                    {allSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.moduleTitle})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Topic (Optional) */}
                {currentAiSubject && (
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      2. Tópico Específico do Edital (Opcional)
                    </label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      className={`w-full text-xs font-medium rounded-xl p-3 border outline-none cursor-pointer transition ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
                      }`}
                    >
                      <option value="">-- Todos os Tópicos da Disciplina --</option>
                      {currentAiSubject.topics.map(top => (
                        <option key={top.id} value={top.id}>
                          {top.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      3. Quantidade de Cards
                    </label>
                    <select
                      value={cardCount}
                      onChange={(e) => setCardCount(Number(e.target.value))}
                      className={`w-full text-xs font-medium rounded-xl p-3 border outline-none transition ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value={5}>5 Flashcards</option>
                      <option value={10}>10 Flashcards</option>
                      <option value={15}>15 Flashcards</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      4. Foco de Estudo
                    </label>
                    <select
                      value={cardStyle}
                      onChange={(e) => setCardStyle(e.target.value)}
                      className={`w-full text-xs font-medium rounded-xl p-3 border outline-none transition ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="conceitos">Conceitos & Doutrina</option>
                      <option value="pegadinhas">Pegadinhas de Prova</option>
                      <option value="resumo">Resumo & Definições</option>
                    </select>
                  </div>
                </div>

                {/* Notice */}
                <div className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-700/50 text-slate-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <Zap className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    A IA analisará os dados do seu edital e criará perguntas/respostas de nível de concurso com explicações objetivas.
                  </span>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateAiFlashcards}
                    disabled={!selectedSubjectId || isGenerating}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg ${
                      !selectedSubjectId || isGenerating
                        ? 'opacity-50 cursor-not-allowed bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Gerando Flashcards...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Gerar Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: AI Preview & Approval */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    ✨ IA gerou {generatedPreview.length} flashcards!
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Desmarque os cards que não deseja adicionar
                  </span>
                </div>

                <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1">
                  {generatedPreview.map((card, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const copy = [...generatedPreview];
                        copy[idx].selected = !copy[idx].selected;
                        setGeneratedPreview(copy);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        card.selected 
                          ? isDarkMode 
                            ? 'bg-slate-800/80 border-emerald-500/50' 
                            : 'bg-emerald-50/70 border-emerald-300'
                          : isDarkMode 
                            ? 'bg-slate-900/40 border-slate-800 opacity-50' 
                            : 'bg-slate-100 border-slate-200 opacity-50'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        card.selected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-500'
                      }`}>
                        {card.selected && <Check className="w-3 h-3" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                          Frente: {card.front}
                        </p>
                        <p className={`text-xs italic ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Verso: {card.back}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => setGeneratedPreview([])}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl transition ${
                      isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ← Refazer geração
                  </button>

                  <button
                    onClick={handleSaveGeneratedCards}
                    disabled={generatedPreview.filter(c => c.selected).length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar {generatedPreview.filter(c => c.selected).length} Cards no Baralho</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUAL ADD / EDIT MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
              <h3 className="font-bold text-base">
                {editingCard ? 'Editar Flashcard' : 'Novo Flashcard Manual'}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className={`p-1.5 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Disciplina</label>
                <input
                  type="text"
                  placeholder="Ex: Direito Constitucional"
                  value={manualForm.subjectName}
                  onChange={(e) => setManualForm({ ...manualForm, subjectName: e.target.value })}
                  className={`w-full text-xs rounded-xl p-3 border outline-none transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Tópico (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Artigo 5º da CF/88"
                  value={manualForm.topicTitle}
                  onChange={(e) => setManualForm({ ...manualForm, topicTitle: e.target.value })}
                  className={`w-full text-xs rounded-xl p-3 border outline-none transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Frente (Pergunta / Conceito) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Digite a pergunta ou conceito a ser memorizado..."
                  value={manualForm.front}
                  onChange={(e) => setManualForm({ ...manualForm, front: e.target.value })}
                  className={`w-full text-xs rounded-xl p-3 border outline-none transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Verso (Resposta / Explicação) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Digite a resposta correta..."
                  value={manualForm.back}
                  onChange={(e) => setManualForm({ ...manualForm, back: e.target.value })}
                  className={`w-full text-xs rounded-xl p-3 border outline-none transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
                >
                  Salvar Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
