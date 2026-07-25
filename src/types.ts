export type TopicStatus = 
  | 'Não iniciado' 
  | 'Em andamento' 
  | 'Teoria Concluída' 
  | 'Revisão pendente' 
  | 'Concluído';

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  questionsTotal: number;
  questionsCorrect: number;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Module {
  id: string;
  title: string;
  subjects: Subject[];
}

export interface Simulado {
  id: string;
  name: string;
  banca: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
}

export interface Flashcard {
  id: string;
  subjectId?: string;
  subjectName: string;
  topicId?: string;
  topicTitle?: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  masteryLevel?: number; // 0 to 5
  createdAt: string;
}

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAnonymous?: boolean;
}

export interface DeleteTarget {
  type: 'module' | 'subject' | 'topic' | 'simulado' | 'flashcard';
  id: string;
  parentId?: string;
}
