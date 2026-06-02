import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES = ['HACK', 'PREGUNTA', 'DEMO', 'HERRAMIENTA_NUEVA', 'HISTORIA', 'CONCEPTO', 'ADVERTENCIA', 'PRODUCTIVIDAD', 'CARRUSEL'];

function openAIErrorMessage(step, err) {
  const status = err?.status;
  const detail = err?.error?.message || err?.message || String(err);
  if (status === 401) return `${step}: invalid or expired API key — check OPENAI_API_KEY`;
  if (status === 429) return `${step}: OpenAI quota exceeded — add credits at platform.openai.com/billing`;
  if (status === 400) return `${step}: bad request — ${detail}`;
  if (status === 503 || status === 529) return `${step}: OpenAI service temporarily unavailable — retry later`;
  return `${step} failed: ${detail}`;
}

export async function analyzeTranscriptCenteia(transcript, videoTitle) {
  const timestampedText = transcript.segments
    .map((s) => `[${s.start}s-${s.end}s] ${s.text}`)
    .join('\n');

  const openai = getClient();

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en viralidad de contenido IA. Respondes SOLO con JSON válido, sin bloques markdown.',
        },
        {
          role: 'user',
          content: `Analiza la transcripción de este video educativo sobre IA (estilo Fireship, NetworkChuck, OpenAI, Anthropic, EDteam) y extrae hasta 20 momentos con alto potencial viral para YouTube Shorts, TikTok e Instagram Reels.

VIDEO: "${videoTitle}"

TRANSCRIPCIÓN (marcas de tiempo en segundos):
${timestampedText}

━━━ PATRONES DE ALTO IMPACTO para contenido IA (priorizar estos) ━━━

1. HACK_O_TRUCO: Algo que el usuario no sabía que podía hacer ("You can make INVISIBLE folders", "Gmail hack", "get past paywalls"). Revelación de capacidad oculta o poco conocida. MUY VIRAL en shorts.

2. PREGUNTA_QUE_DESAFÍA: Pregunta que hace pensar ("Why do computers suck at math?", "Why do computers use RGB?"). El título mismo genera curiosidad imposible de ignorar.

3. DEMO_PRACTICA_RAPIDA: Demostración en menos de 60 segundos de algo que el espectador puede replicar ahora mismo ("3 ChatGPT tricks", "Claude Code turns ideas into prototypes").

4. HERRAMIENTA_NUEVA_REVELADA: Primera aparición o explicación de una herramienta/modelo recién lanzado ("NEW Raspberry Pi AI Hat", "Uh oh… AI-search engine has emerged", "What's new in Gemini 3?").

5. HISTORIA_REAL_IMPACTANTE: Anécdota o caso real que mezcla humor y sorpresa ("¿Bill Gates estafó al creador de DOS?", "¿Elon Musk fue despedido por preferir Windows?").

6. CONCEPTO_EXPLICADO_SIMPLE: Concepto técnico complejo explicado de forma que cualquiera entiende ("Big O explained with a deck of cards", "Why do computers use RGB").

7. ADVERTENCIA_O_RIESGO: Algo que puede salir mal o poner en riesgo al espectador ("How Safe are Short Links?", "Kids vs. MALWARE", "real eyes realize AI lies").

8. PRODUCTIVIDAD_PRACTICA: Cómo hacer algo más rápido con IA, con resultado concreto ("How to 10x your Claude with 4 .md files", "Claude Code + Obsidian in under 1 minute").

━━━ CATEGORÍAS A ETIQUETAR (una por clip) ━━━

• HACK — trucos, hacks, capacidades ocultas, workarounds
• PREGUNTA — pregunta que genera curiosidad, desafía el pensamiento
• DEMO — demostración práctica, paso a paso, replicable
• HERRAMIENTA_NUEVA — herramienta/modelo recién lanzado, feature nueva
• HISTORIA — anécdota real, caso de éxito, humor + sorpresa
• CONCEPTO — explicación de concepto complejo de forma simple
• ADVERTENCIA — riesgo, peligro, advertencia, "lo que puede salir mal"
• PRODUCTIVIDAD — eficiencia, ahorro de tiempo, "X veces más rápido"
• CARRUSEL — fragmento con 3-5 puntos listables, guía, ranking

━━━ SCORING para Centeia Education (0-100) ━━━

1. Gancho en título/primeros 3 segundos (0-25 pts): ¿Para el scroll? ¿Es irresistible?
2. Patrón de alto impacto presente (0-30 pts): ¿Coincide con alguno de los 8 patrones?
3. Aplicabilidad inmediata (0-25 pts): ¿Puede el espectador usarlo hoy? ¿Es accionable?
4. Claridad del remate (0-20 pts): ¿Termina con algo concreto y memorable?

DURACIÓN ÓPTIMA:
- Shorts virales: 30-90 segundos (bonificar +5 pts)
- Tutoriales completos: 3-8 minutos (válido también)
- Penalizar: < 20 seg (-10 pts) o > 10 min (-10 pts)

━━━ REGLAS ━━━
- Los clips NO deben solaparse entre sí
- Respeta explicaciones completas — sin cortes a mitad de palabra
- Cada clip debe tener valor viral y/o educativo claro
- Para CARRUSEL: extrae los pasos o puntos literales (máx 5)
- Títulos máx 8 palabras, en inglés o español, estilo YouTube Shorts (ganchos irresistibles)
- Incluye el patrón detectado en cada clip

Devuelve exactamente este JSON:
{
  "clips": [
    {
      "title": "Título gancho imposible de ignorar (máx 8 palabras)",
      "start_time": 12.5,
      "end_time": 67.2,
      "category": "HACK",
      "pattern": "HACK_O_TRUCO",
      "reason": "Por qué es viral (1-2 frases, español o inglés)",
      "score": 87,
      "duration": 54.7,
      "carousel_points": null
    }
  ]
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
  } catch (err) {
    throw new Error(openAIErrorMessage('GPT-4o', err));
  }

  let parsed;
  try {
    parsed = JSON.parse(response.choices[0].message.content);
  } catch {
    throw new Error('GPT-4o devolvió JSON inválido');
  }

  const raw = parsed.clips || parsed.moments || parsed.segments || [];

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('GPT-4o no encontró momentos virales en este contenido');
  }

  return raw
    .map((c) => ({
      title: String(c.title || 'Sin título'),
      start_time: parseFloat(c.start_time) || 0,
      end_time: parseFloat(c.end_time) || 0,
      duration: parseFloat(c.duration) || (parseFloat(c.end_time) || 0) - (parseFloat(c.start_time) || 0),
      category: CATEGORIES.includes(c.category) ? c.category : 'DEMO',
      pattern: String(c.pattern || 'OTRO'),
      reason: String(c.reason || ''),
      score: Math.min(100, Math.max(0, parseInt(c.score) || 50)),
      carousel_points:
        c.category === 'CARRUSEL' && Array.isArray(c.carousel_points)
          ? c.carousel_points.slice(0, 5).map(String)
          : null,
    }))
    .filter((c) => c.end_time > c.start_time && c.duration >= 20)
    .slice(0, 20);
}
