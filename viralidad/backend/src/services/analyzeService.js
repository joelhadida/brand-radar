import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CATEGORIES = ['HUMOR', 'CONFESION', 'TENSION', 'DATO_CURIOSO', 'RUPTURA', 'ACCESO_PRIVADO', 'CARRUSEL'];

function openAIErrorMessage(step, err) {
  const status = err?.status;
  const detail = err?.error?.message || err?.message || String(err);
  if (status === 401) return `${step}: invalid or expired API key — check OPENAI_API_KEY`;
  if (status === 429) return `${step}: OpenAI quota exceeded — add credits at platform.openai.com/billing`;
  if (status === 400) return `${step}: bad request — ${detail}`;
  if (status === 503 || status === 529) return `${step}: OpenAI service temporarily unavailable — retry later`;
  return `${step} failed: ${detail}`;
}

export async function analyzeTranscript(transcript, videoTitle) {
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
            'Eres un experto en contenido viral para redes sociales hispanohablantes. Respondes SOLO con JSON válido, sin bloques markdown.',
        },
        {
          role: 'user',
          content: `Analiza la transcripción de este programa de entretenimiento en streaming (estilo Luzu TV, Olga, Gelatina, Blender, Vorterix, La Revuelta, El Hormiguero, La Ruina) y extrae hasta 20 momentos con alto potencial viral para Instagram Reels, TikTok y YouTube Shorts.

VIDEO: "${videoTitle}"

TRANSCRIPCIÓN (marcas de tiempo en segundos):
${timestampedText}

━━━ PATRONES DE ALTO IMPACTO (priorizar estos) ━━━

1. PREGUNTA_DINERO_VIDA: Pregunta directa sobre dinero, patrimonio, vida personal o datos privados ("¿cuánto ganas?", "¿cuántos hijos tienes?", "¿con quién estás saliendo?")

2. RUPTURA_GUION: Algo inesperado rompe el flujo (alguien se va, entra sin avisar, reacción extrema, accidente en directo)

3. CONFESION_INTIMA: Momento personal o íntimo que normalmente no se comparte (vulnerabilidad, secreto, historia personal fuerte)

4. DATO_INCREIBLE: Anécdota o dato que genera incredulidad inmediata ("esto no puede ser real")

5. TENSION_ENTRE_PERSONAS: Fricción, debate, pique o rivalidad visible entre dos personas

6. HUMOR_REACCION: Reacción exagerada, vergüenza ajena o situación absurda que provoca risa inmediata

7. ACCESO_PRIVADO: Momento que muestra algo normalmente privado (detrás de cámaras, reacción sin filtro, llamada en directo)

━━━ CATEGORÍAS A ETIQUETAR (una por clip) ━━━

• HUMOR — reacciones exageradas, frases inesperadas, situaciones absurdas, trolleos, vergüenza ajena
• CONFESION — confesiones, historias íntimas, vulnerabilidad, momentos auténticos no guionizados
• TENSION — opinión polémica, debate, pique, algo que divide, fricción visible
• DATO_CURIOSO — estadísticas sorprendentes, facts poco conocidos, revelaciones inesperadas
• RUPTURA — interrupciones inesperadas, cambios abruptos de escena, caos controlado
• ACCESO_PRIVADO — momentos detrás de cámaras, reacciones sin filtro, llamadas en directo
• CARRUSEL — fragmento con 3-5 puntos listables, consejo práctico, ranking o comparación

━━━ SCORING 0-100 (4 CRITERIOS) ━━━

1. Gancho en primeros 3 segundos (0-25 pts): ¿La primera frase para el scroll? ¿Genera curiosidad inmediata?
2. Patrón de alto impacto (0-35 pts): ¿Coincide con alguno de los 7 patrones listados arriba?
3. Completitud narrativa (0-20 pts): ¿Tiene inicio, tensión y remate claro? ¿No queda cortado?
4. Compartibilidad (0-20 pts): ¿Lo mandarías a un amigo con entusiasmo?

DURACIÓN ÓPTIMA: 30-90 segundos
- Penalizar clips < 20 segundos (restar hasta 15 puntos)
- Penalizar clips > 2 minutos (restar hasta 15 puntos)
- Bonificar clips en rango 30-90s (+5 puntos)

━━━ REGLAS ━━━
- Los clips NO deben solaparse entre sí
- Respeta frases completas — sin cortes a mitad de palabra
- Cada clip debe tener inicio y remate claro
- Para CARRUSEL: extrae los puntos literales de la transcripción como array (máx 5)
- Títulos máx 8 palabras, en español, estilo TikTok (enganchen)
- Incluye el patrón detectado en cada clip (ej: "PREGUNTA_DINERO_VIDA", "RUPTURA_GUION", etc.)

Devuelve exactamente este JSON:
{
  "clips": [
    {
      "title": "Título gancho en español (máx 8 palabras)",
      "start_time": 12.5,
      "end_time": 67.2,
      "category": "HUMOR",
      "pattern": "HUMOR_REACCION",
      "reason": "Por qué este clip es viral (1-2 frases en español)",
      "score": 87,
      "duration": 54.7,
      "carousel_points": null
    }
  ]
}

carousel_points es null en todas las categorías excepto CARRUSEL, donde es un array con los puntos exactos.
pattern es el nombre del patrón detectado (ej: PREGUNTA_DINERO_VIDA, RUPTURA_GUION, etc.)`,
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
      category: CATEGORIES.includes(c.category) ? c.category : 'HUMOR',
      pattern: String(c.pattern || 'OTRO'),
      reason: String(c.reason || ''),
      score: Math.min(100, Math.max(0, parseInt(c.score) || 50)),
      carousel_points:
        c.category === 'CARRUSEL' && Array.isArray(c.carousel_points)
          ? c.carousel_points.slice(0, 5).map(String)
          : null,
    }))
    .filter((c) => c.end_time > c.start_time && c.duration >= 15)
    .slice(0, 20);
}
