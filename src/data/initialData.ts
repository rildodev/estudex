import { Module, Simulado } from '../types';

export const MOTIVATIONAL_VERSES = [
  '"Tudo posso naquele que me fortalece." — Filipenses 4:13',
  '"Se Deus é por nós, quem será contra nós?" — Romanos 8:31',
  '"O Senhor é a minha luz e a minha salvação; de quem terei temor?" — Salmos 27:1',
  '"Seja forte e corajoso. Não tenha medo nem fique apavorado, pois o Senhor, o seu Deus, estará com você por onde andar." — Josué 1:9',
  '"O Senhor é a minha rocha, a minha fortaleza e o meu libertador." — Salmos 18:2',
  '"Ele fortalece o cansado e dá grande vigor ao que está sem forças." — Isaías 40:29',
  '"Pois eu sei os planos que tenho para vocês, diz o Senhor." — Jeremias 29:11',
  '"O choro pode durar uma noite, mas a alegria vem pela manhã." — Salmos 30:5',
  '"Não se deixem vencer pelo mal, mas vençam o mal com o bem." — Romanos 12:21',
  '"O Senhor firmará os passos do homem, quando lhe agrada o seu caminho." — Salmos 37:23',
  '"Esforcem-se para viver em paz com todos e para serem santos." — Hebreus 12:14',
  '"Vocês são a luz do mundo." — Mateus 5:14',
  '"Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês." — 1 Pedro 5:7',
  '"Regozijem-se sempre no Senhor. Novamente direi: alegrem-se!" — Filipenses 4:4',
  '"O Senhor é bom para com aqueles cuja esperança está nele." — Lamentações 3:25',
  '"Entrega o teu caminho ao Senhor; confia nele, e o mais ele fará." — Salmos 37:5',
  '"Alegrem-se na esperança, sejam pacientes na tribulação, perseverem na oração." — Romanos 12:12',
  '"Clame a mim e eu responderei." — Jeremias 33:3',
  '"Guardarei no coração a tua palavra para não pecar contra ti." — Salmos 119:11',
  '"Peçam, e será dado; busquem, e encontrarão; batam, e a porta será aberta." — Mateus 7:7',
  '"Não se turbe o coração de vocês; creiam em Deus, creiam também em mim." — João 14:1',
  '"Quem habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso, pode dizer ao Senhor: Tu és o meu refúgio e a minha fortaleza." — Salmos 91:1-2',
  '"Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum." — Salmos 23:4',
  '"Esforcem-se e tenham bom ânimo, todos vocês que esperam no Senhor." — Salmos 31:24',
  '"Ame o Senhor, o seu Deus, de todo o seu coração, de toda a sua alma e de todas as suas forças." — Deuteronômio 6:5',
  '"Sejam fortes e não desanimem, pois o trabalho de vocês será recompensado." — 2 Crônicas 15:7',
  '"O Senhor é justo em todos os seus caminhos e bondoso em tudo o que faz." — Salmos 145:17',
  '"Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça." — Mateus 6:33',
  '"O Senhor te guardará de todo o mal; guardará a tua alma." — Salmos 121:7',
  '"Pois andamos por fé, e não pelo que vemos." — 2 Coríntios 5:7',
  '"Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei." — Mateus 11:28',
  '"O Senhor é refúgio para os oprimidos, uma torre segura na hora da adversidade." — Salmos 9:9',
  '"Ame o seu próximo como a si mesmo." — Marcos 12:31',
  '"O Senhor está perto de todos os que o invocam com sinceridade." — Salmos 145:18',
  '"Não se cansem de fazer o bem, pois no tempo certo colherão, se não desanimarem." — Gálatas 6:9'
];

export const INITIAL_MODULES: Module[] = [
  {
    id: 'mod1',
    title: 'Módulo I: Conhecimentos Gerais',
    subjects: [
      {
        id: 'sub1',
        name: 'Língua Portuguesa',
        topics: [
          { id: 'top1', title: 'Compreensão e interpretação de textos', status: 'Concluído', questionsTotal: 50, questionsCorrect: 45, notes: 'Focar em inferências e coesão textual' },
          { id: 'top2', title: 'Ortografia oficial e Acentuação', status: 'Em andamento', questionsTotal: 30, questionsCorrect: 24, notes: 'Atenção às regras do Novo Acordo' },
          { id: 'top3', title: 'Sintaxe da oração e do período', status: 'Não iniciado', questionsTotal: 0, questionsCorrect: 0, notes: '' }
        ]
      },
      {
        id: 'sub2',
        name: 'Raciocínio Lógico e Matemática',
        topics: [
          { id: 'top4', title: 'Lógica proposicional e Tabelas Verdade', status: 'Teoria Concluída', questionsTotal: 40, questionsCorrect: 32, notes: 'Revisar equivalências da condicional (p -> q)' },
          { id: 'top5', title: 'Análise Combinatória e Probabilidade', status: 'Não iniciado', questionsTotal: 0, questionsCorrect: 0, notes: '' }
        ]
      }
    ]
  },
  {
    id: 'mod2',
    title: 'Módulo II: Direito e Legislação',
    subjects: [
      {
        id: 'sub3',
        name: 'Direito Constitucional',
        topics: [
          { id: 'top6', title: 'Direitos e Garantias Fundamentais (Art. 5º)', status: 'Concluído', questionsTotal: 100, questionsCorrect: 88, notes: 'Atenção aos remédios constitucionais (Habeas Corpus, Mandado de Segurança)' },
          { id: 'top7', title: 'Organização do Estado e Administração', status: 'Revisão pendente', questionsTotal: 25, questionsCorrect: 20, notes: '' }
        ]
      },
      {
        id: 'sub4',
        name: 'Direito Administrativo',
        topics: [
          { id: 'top8', title: 'Atos Administrativos: Conceito e Atributos', status: 'Em andamento', questionsTotal: 20, questionsCorrect: 15, notes: 'Atributos: Presunção de legitimidade, Autoexecutoriedade, Tipicidade, Imperatividade (PATI)' }
        ]
      }
    ]
  }
];

export const INITIAL_SIMULADOS: Simulado[] = [
  { id: 'sim1', name: 'Simulado Geral 01', banca: 'CEBRASPE', date: '2026-06-15', totalQuestions: 120, correctAnswers: 92 },
  { id: 'sim2', name: 'Simulado Geral 02', banca: 'FGV', date: '2026-07-01', totalQuestions: 80, correctAnswers: 61 }
];

export const INITIAL_FLASHCARDS = [
  {
    id: 'fc1',
    subjectId: 'sub3',
    subjectName: 'Direito Constitucional',
    topicId: 'top6',
    topicTitle: 'Direitos e Garantias Fundamentais (Art. 5º)',
    front: 'Quais são os Remédios Constitucionais considerados gratuitos pela CF/88?',
    back: 'Habeas Corpus e Habeas Data são gratuitos para qualquer cidadão, assim como os atos necessários ao exercício da cidadania.',
    difficulty: 'easy' as const,
    masteryLevel: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fc2',
    subjectId: 'sub4',
    subjectName: 'Direito Administrativo',
    topicId: 'top8',
    topicTitle: 'Atos Administrativos: Conceito e Atributos',
    front: 'Quais são os 4 principais Atributos do Ato Administrativo (Mnemônico PATI)?',
    back: '1. Presunção de Legitimidade\n2. Autoexecutoriedade\n3. Tipicidade\n4. Imperatividade',
    difficulty: 'medium' as const,
    masteryLevel: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'fc3',
    subjectId: 'sub2',
    subjectName: 'Raciocínio Lógico e Matemática',
    topicId: 'top4',
    topicTitle: 'Lógica proposicional e Tabelas Verdade',
    front: 'Como se faz a negação de uma proposição condicional (p → q)?',
    back: 'Aplica-se a Regra do MANÉ: Mantém a primeira (p) E Nega a segunda (~q). Exemplo: ~(p → q) ≡ p ∧ ~q.',
    difficulty: 'hard' as const,
    masteryLevel: 1,
    createdAt: new Date().toISOString()
  }
];

export const getFreshModules = (): Module[] => 
  INITIAL_MODULES.map(mod => ({
    ...mod,
    subjects: mod.subjects.map(sub => ({
      ...sub,
      topics: sub.topics.map(top => ({
        ...top,
        status: 'Não iniciado',
        questionsTotal: 0,
        questionsCorrect: 0,
        notes: ''
      }))
    }))
  }));
