import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Module, Simulado, Flashcard, TopicStatus, DeleteTarget } from '../types';
import { INITIAL_MODULES, INITIAL_SIMULADOS, INITIAL_FLASHCARDS, getFreshModules } from '../data/initialData';

interface DataContextType {
  modules: Module[];
  simulados: Simulado[];
  flashcards: Flashcard[];
  dataLoaded: boolean;
  syncStatus: 'synced' | 'saving' | 'error';
  // Timer State
  timerSeconds: number;
  timerRunning: boolean;
  timerSubject: string;
  setTimerRunning: (running: boolean) => void;
  setTimerSeconds: (seconds: number) => void;
  setTimerSubject: (subject: string) => void;
  resetTimer: () => void;
  // Module Actions
  addModule: (title: string) => Promise<void>;
  updateModule: (id: string, title: string) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  // Subject Actions
  addSubject: (moduleId: string, name: string) => Promise<void>;
  updateSubject: (moduleId: string, subjectId: string, name: string) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  // Topic Actions
  addTopic: (subjectId: string, title: string, notes?: string) => Promise<void>;
  updateTopic: (subjectId: string, topicId: string, title: string, notes?: string) => Promise<void>;
  updateTopicStatus: (subjectId: string, topicId: string, status: TopicStatus) => Promise<void>;
  updateTopicQuestions: (subjectId: string, topicId: string, total: number, correct: number) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string) => Promise<void>;
  // Simulado Actions
  addSimulado: (sim: Omit<Simulado, 'id'>) => Promise<void>;
  updateSimulado: (id: string, sim: Omit<Simulado, 'id'>) => Promise<void>;
  deleteSimulado: (id: string) => Promise<void>;
  // Flashcard Actions
  addFlashcard: (fc: Omit<Flashcard, 'id' | 'createdAt'>) => Promise<void>;
  addBulkFlashcards: (fcs: Array<Omit<Flashcard, 'id' | 'createdAt'>>) => Promise<void>;
  updateFlashcard: (id: string, fc: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  // Backup & Reset
  importBackupData: (newModules: Module[], newSimulados: Simulado[], newFlashcards?: Flashcard[]) => Promise<void>;
  resetDataToDefault: () => Promise<void>;
  // Stats
  stats: {
    totalTopics: number;
    completedTopics: number;
    progressPct: number;
    totalQuestions: number;
    correctQuestions: number;
    accuracyPct: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [simulados, setSimulados] = useState<Simulado[]>(INITIAL_SIMULADOS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(() => {
    const saved = localStorage.getItem('timer_seconds');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [timerRunning, setTimerRunning] = useState<boolean>(() => {
    return localStorage.getItem('timer_running') === 'true';
  });
  const [timerSubject, setTimerSubject] = useState<string>(() => {
    return localStorage.getItem('timer_subject') || 'Língua Portuguesa';
  });

  const isRemoteUpdateRef = useRef(false);

  // Firestore Realtime Listener & Local Storage fallback for guest mode
  useEffect(() => {
    if (!currentUser) {
      setModules(INITIAL_MODULES);
      setSimulados(INITIAL_SIMULADOS);
      setFlashcards(INITIAL_FLASHCARDS);
      setDataLoaded(false);
      return;
    }

    // Local guest user handling
    if (currentUser.uid.startsWith('guest_')) {
      const storageKey = `estudex_local_data_${currentUser.uid}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.modules) setModules(parsed.modules);
          if (parsed.simulados) setSimulados(parsed.simulados);
          if (parsed.flashcards) setFlashcards(parsed.flashcards);
          if (parsed.timerSeconds !== undefined) setTimerSeconds(parsed.timerSeconds);
          if (parsed.timerSubject) setTimerSubject(parsed.timerSubject);
        } catch (e) {
          setModules(INITIAL_MODULES);
          setSimulados(INITIAL_SIMULADOS);
          setFlashcards(INITIAL_FLASHCARDS);
        }
      } else {
        setModules(INITIAL_MODULES);
        setSimulados(INITIAL_SIMULADOS);
        setFlashcards(INITIAL_FLASHCARDS);
      }
      setDataLoaded(true);
      setSyncStatus('synced');
      return;
    }

    const docPath = `users/${currentUser.uid}/estudexData/user_data`;
    const dataDocRef = doc(db, 'users', currentUser.uid, 'estudexData', 'user_data');

    const unsubscribe = onSnapshot(
      dataDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          isRemoteUpdateRef.current = true;
          if (data.modules) setModules(data.modules);
          if (data.simulados) setSimulados(data.simulados);
          if (data.flashcards) setFlashcards(data.flashcards);
          if (data.timerSeconds !== undefined && !timerRunning) {
            setTimerSeconds(data.timerSeconds);
          }
          if (data.timerSubject) setTimerSubject(data.timerSubject);
          setDataLoaded(true);
          setSyncStatus('synced');
        } else {
          // Initialize first-time user data in Firestore
          const initialMods = currentUser.isAnonymous ? INITIAL_MODULES : getFreshModules();
          const initialSims = INITIAL_SIMULADOS;
          const initialCards = INITIAL_FLASHCARDS;

          setModules(initialMods);
          setSimulados(initialSims);
          setFlashcards(initialCards);
          setDataLoaded(true);

          try {
            setSyncStatus('saving');
            await setDoc(dataDocRef, {
              modules: initialMods,
              simulados: initialSims,
              flashcards: initialCards,
              timerSeconds: 0,
              timerSubject: 'Língua Portuguesa',
              updatedAt: new Date().toISOString()
            });
            setSyncStatus('synced');
          } catch (err) {
            setSyncStatus('error');
            console.error("Firestore write error during init:", err);
          }
        }
      },
      (error) => {
        console.warn("Firestore snapshot fallback active:", error?.message || error);
        setDataLoaded(true);
        const storageKey = `estudex_local_data_${currentUser.uid}`;
        const localData = localStorage.getItem(storageKey);
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            if (parsed.modules) setModules(parsed.modules);
            if (parsed.simulados) setSimulados(parsed.simulados);
            if (parsed.flashcards) setFlashcards(parsed.flashcards);
            if (parsed.timerSeconds !== undefined) setTimerSeconds(parsed.timerSeconds);
            if (parsed.timerSubject) setTimerSubject(parsed.timerSubject);
          } catch (e) {
            // fallback loaded
          }
        }
        setSyncStatus('synced');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sync helper (saves to LocalStorage for all users as backup, and Firestore for cloud sync)
  const syncToFirestore = async (
    newModules: Module[], 
    newSimulados: Simulado[], 
    newFlashcards: Flashcard[] = flashcards,
    tSecs = timerSeconds
  ) => {
    if (!currentUser) return;

    // Always backup locally to prevent any data loss
    const storageKey = `estudex_local_data_${currentUser.uid}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        modules: newModules,
        simulados: newSimulados,
        flashcards: newFlashcards,
        timerSeconds: tSecs,
        timerSubject,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("Local storage backup notice:", e);
    }

    if (currentUser.uid.startsWith('guest_')) {
      setSyncStatus('synced');
      return;
    }

    const dataDocRef = doc(db, 'users', currentUser.uid, 'estudexData', 'user_data');

    try {
      setSyncStatus('saving');
      await setDoc(dataDocRef, {
        modules: newModules,
        simulados: newSimulados,
        flashcards: newFlashcards,
        timerSeconds: tSecs,
        timerSubject,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.warn("Firestore sync fallback to local storage:", err);
      setSyncStatus('synced');
    }
  };

  // Timer loop with precision timestamping
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      let startTime = localStorage.getItem('timer_start_time');
      if (!startTime) {
        startTime = Date.now().toString();
        localStorage.setItem('timer_start_time', startTime);
        localStorage.setItem('timer_base_seconds', timerSeconds.toString());
      }

      interval = setInterval(() => {
        const now = Date.now();
        const start = parseInt(localStorage.getItem('timer_start_time') || now.toString(), 10);
        const base = parseInt(localStorage.getItem('timer_base_seconds') || '0', 10);
        const elapsed = Math.floor((now - start) / 1000);
        const total = base + elapsed;
        setTimerSeconds(total);
        localStorage.setItem('timer_seconds', total.toString());
      }, 1000);
    } else {
      clearInterval(interval);
      localStorage.removeItem('timer_start_time');
      localStorage.removeItem('timer_base_seconds');
    }

    localStorage.setItem('timer_running', timerRunning.toString());
    localStorage.setItem('timer_subject', timerSubject);

    return () => clearInterval(interval);
  }, [timerRunning, timerSubject]);

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
    localStorage.removeItem('timer_seconds');
    localStorage.removeItem('timer_start_time');
    localStorage.removeItem('timer_base_seconds');
    syncToFirestore(modules, simulados, flashcards, 0);
  };

  // Module actions
  const addModule = async (title: string) => {
    const newMod: Module = {
      id: 'mod_' + Date.now(),
      title: title.trim(),
      subjects: []
    };
    const updated = [...modules, newMod];
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const updateModule = async (id: string, title: string) => {
    const updated = modules.map(m => m.id === id ? { ...m, title: title.trim() } : m);
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const deleteModule = async (id: string) => {
    const updated = modules.filter(m => m.id !== id);
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  // Subject actions
  const addSubject = async (moduleId: string, name: string) => {
    const newSub = {
      id: 'sub_' + Date.now(),
      name: name.trim(),
      topics: []
    };
    const updated = modules.map(m => m.id === moduleId ? { ...m, subjects: [...m.subjects, newSub] } : m);
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const updateSubject = async (moduleId: string, subjectId: string, name: string) => {
    const updated = modules.map(m => m.id === moduleId ? {
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? { ...s, name: name.trim() } : s)
    } : m);
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const deleteSubject = async (subjectId: string) => {
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.filter(s => s.id !== subjectId)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  // Topic actions
  const addTopic = async (subjectId: string, title: string, notes?: string) => {
    const newTopic = {
      id: 'top_' + Date.now(),
      title: title.trim(),
      status: 'Não iniciado' as TopicStatus,
      questionsTotal: 0,
      questionsCorrect: 0,
      notes: notes?.trim() || ''
    };
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const updateTopic = async (subjectId: string, topicId: string, title: string, notes?: string) => {
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? {
        ...s,
        topics: s.topics.map(t => t.id === topicId ? { ...t, title: title.trim(), notes: notes?.trim() || '' } : t)
      } : s)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const updateTopicStatus = async (subjectId: string, topicId: string, status: TopicStatus) => {
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? {
        ...s,
        topics: s.topics.map(t => t.id === topicId ? { ...t, status } : t)
      } : s)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const updateTopicQuestions = async (subjectId: string, topicId: string, total: number, correct: number) => {
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? {
        ...s,
        topics: s.topics.map(t => t.id === topicId ? { 
          ...t, 
          questionsTotal: Math.max(0, total), 
          questionsCorrect: Math.max(0, correct) 
        } : t)
      } : s)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  const deleteTopic = async (subjectId: string, topicId: string) => {
    const updated = modules.map(m => ({
      ...m,
      subjects: m.subjects.map(s => s.id === subjectId ? {
        ...s,
        topics: s.topics.filter(t => t.id !== topicId)
      } : s)
    }));
    setModules(updated);
    await syncToFirestore(updated, simulados);
  };

  // Simulado actions
  const addSimulado = async (sim: Omit<Simulado, 'id'>) => {
    const newSim: Simulado = {
      ...sim,
      id: 'sim_' + Date.now()
    };
    const updated = [newSim, ...simulados];
    setSimulados(updated);
    await syncToFirestore(modules, updated);
  };

  const updateSimulado = async (id: string, sim: Omit<Simulado, 'id'>) => {
    const updated = simulados.map(s => s.id === id ? { ...sim, id } : s);
    setSimulados(updated);
    await syncToFirestore(modules, updated);
  };

  const deleteSimulado = async (id: string) => {
    const updated = simulados.filter(s => s.id !== id);
    setSimulados(updated);
    await syncToFirestore(modules, updated);
  };

  // Flashcard Actions
  const addFlashcard = async (fc: Omit<Flashcard, 'id' | 'createdAt'>) => {
    const newFc: Flashcard = {
      ...fc,
      id: 'fc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    };
    const updated = [newFc, ...flashcards];
    setFlashcards(updated);
    await syncToFirestore(modules, simulados, updated);
  };

  const addBulkFlashcards = async (fcs: Array<Omit<Flashcard, 'id' | 'createdAt'>>) => {
    const newItems: Flashcard[] = fcs.map((fc, index) => ({
      ...fc,
      id: 'fc_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString()
    }));
    const updated = [...newItems, ...flashcards];
    setFlashcards(updated);
    await syncToFirestore(modules, simulados, updated);
  };

  const updateFlashcard = async (id: string, fc: Partial<Flashcard>) => {
    const updated = flashcards.map(card => card.id === id ? { ...card, ...fc } : card);
    setFlashcards(updated);
    await syncToFirestore(modules, simulados, updated);
  };

  const deleteFlashcard = async (id: string) => {
    const updated = flashcards.filter(card => card.id !== id);
    setFlashcards(updated);
    await syncToFirestore(modules, simulados, updated);
  };

  // Backup & Reset
  const importBackupData = async (newModules: Module[], newSimulados: Simulado[], newFlashcards?: Flashcard[]) => {
    const cardsToUse = newFlashcards || flashcards;
    setModules(newModules);
    setSimulados(newSimulados);
    setFlashcards(cardsToUse);
    await syncToFirestore(newModules, newSimulados, cardsToUse);
  };

  const resetDataToDefault = async () => {
    const fresh = getFreshModules();
    setModules(fresh);
    setSimulados(INITIAL_SIMULADOS);
    setFlashcards(INITIAL_FLASHCARDS);
    await syncToFirestore(fresh, INITIAL_SIMULADOS, INITIAL_FLASHCARDS);
  };

  // Dynamic stats calculation
  const stats = React.useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalQuestions = 0;
    let correctQuestions = 0;

    modules.forEach(mod => {
      mod.subjects.forEach(sub => {
        sub.topics.forEach(top => {
          totalTopics++;
          if (top.status === 'Concluído') completedTopics++;
          totalQuestions += top.questionsTotal || 0;
          correctQuestions += top.questionsCorrect || 0;
        });
      });
    });

    const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const accuracyPct = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

    return { totalTopics, completedTopics, progressPct, totalQuestions, correctQuestions, accuracyPct };
  }, [modules]);

  return (
    <DataContext.Provider value={{
      modules,
      simulados,
      flashcards,
      dataLoaded,
      syncStatus,
      timerSeconds,
      timerRunning,
      timerSubject,
      setTimerRunning,
      setTimerSeconds,
      setTimerSubject,
      resetTimer,
      addModule,
      updateModule,
      deleteModule,
      addSubject,
      updateSubject,
      deleteSubject,
      addTopic,
      updateTopic,
      updateTopicStatus,
      updateTopicQuestions,
      deleteTopic,
      addSimulado,
      updateSimulado,
      deleteSimulado,
      addFlashcard,
      addBulkFlashcards,
      updateFlashcard,
      deleteFlashcard,
      importBackupData,
      resetDataToDefault,
      stats
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
