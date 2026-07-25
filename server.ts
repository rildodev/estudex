import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for Gemini AI instance
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não está configurada no ambiente.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Endpoint: Generate Flashcards with AI
  app.post('/api/generate-flashcards', async (req, res) => {
    try {
      const { subjectName, topicTitle, topicNotes, count = 5, style = 'conceitos' } = req.body;

      if (!subjectName && !topicTitle) {
        return res.status(400).json({ error: 'É necessário informar ao menos a disciplina ou o tópico.' });
      }

      const ai = getGeminiClient();

      const numCards = Math.min(Math.max(Number(count) || 5, 1), 15);

      const styleInstruction = 
        style === 'pegadinhas'
          ? 'Foque em pegadinhas clássicas de provas de concursos, detalhes legais e exceções às regras.'
          : style === 'resumo'
          ? 'Foque em definições diretas e resumos ultra-rápidos com palavras-chave marcantes.'
          : 'Foque em conceitos fundamentais, doutrina principal e aplicação prática da matéria.';

      const prompt = `Você é um professor especialista em concursos públicos no Brasil.
Crie exatamente ${numCards} flashcards de estudo de alta qualidade baseando-se no seguinte item do Edital Verticalizado do estudante:

- Disciplina: ${subjectName || 'Geral'}
- Tópico do Edital: ${topicTitle || 'Visão Geral da Matéria'}
${topicNotes ? `- Anotações/Observações do estudante: ${topicNotes}` : ''}

Diretrizes para os Flashcards:
1. ${styleInstruction}
2. A 'front' (frente do card) deve conter uma pergunta objetiva, conceito ou caso prático desafiador.
3. A 'back' (verso do card) deve conter a resposta clara, bem explicada, com destaques ou itens se necessário.
4. Defina a 'difficulty' para cada card como 'easy', 'medium' ou 'hard'.
5. O idioma DEVE ser estritamente Português do Brasil.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'Lista de flashcards gerados para concurso público',
            items: {
              type: Type.OBJECT,
              properties: {
                front: {
                  type: Type.STRING,
                  description: 'Pergunta ou conceito na frente do cartão',
                },
                back: {
                  type: Type.STRING,
                  description: 'Resposta explicativa no verso do cartão',
                },
                difficulty: {
                  type: Type.STRING,
                  description: 'Nível de dificuldade: easy, medium, ou hard',
                },
              },
              required: ['front', 'back', 'difficulty'],
            },
          },
        },
      });

      const responseText = response.text || '[]';
      const flashcards = JSON.parse(responseText);

      return res.json({ flashcards });
    } catch (error: any) {
      console.error('Erro ao gerar flashcards via Gemini:', error);
      return res.status(500).json({
        error: error?.message || 'Falha ao processar solicitação de IA. Tente novamente.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
