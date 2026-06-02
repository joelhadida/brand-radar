import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function openAIErrorMessage(step, err) {
  const status = err?.status;
  const detail = err?.error?.message || err?.message || String(err);
  if (status === 401) return `${step}: API key inválida`;
  if (status === 429) return `${step}: cuota de OpenAI agotada — añade créditos en platform.openai.com/billing`;
  return `${step} falló: ${detail}`;
}

// Group fine-grained Whisper segments into larger contextual chunks so GPT-4o
// has enough text per unit to reason about TOPICS and THEMES, not just words.
function buildChunks(segments, targetSeconds = 30) {
  const chunks = [];
  let current = null;

  for (const seg of segments) {
    if (!current) {
      current = { start: seg.start, end: seg.end, text: seg.text.trim() };
    } else {
      current.end = seg.end;
      current.text += ' ' + seg.text.trim();
      if (current.end - current.start >= targetSeconds) {
        chunks.push(current);
        current = null;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function findScene(transcript, query) {
  // 30-second chunks give GPT-4o enough context to identify topics, emotions, and themes
  const chunks = buildChunks(transcript.segments, 30);

  const formattedChunks = chunks
    .map((c, i) =>
      `[${i + 1}] ${c.start.toFixed(1)}s – ${c.end.toFixed(1)}s\n${c.text}`
    )
    .join('\n\n');

  const openai = getClient();

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Eres un experto en análisis semántico de contenido de video en español.
Tu tarea es encontrar momentos en transcripciones usando COMPRENSIÓN DE SIGNIFICADO, no palabras exactas.
Responde ÚNICAMENTE en formato JSON válido con la estructura indicada en el mensaje del usuario.

Reglas clave:
- La descripción del usuario usa SUS PROPIAS PALABRAS para describir un momento que vio/oyó
- Debes buscar el CONCEPTO, EMOCIÓN o SITUACIÓN que describe, no las palabras literales
- "se ríen todos" → busca segmentos con humor, exclamaciones, carcajadas, ambiente distendido
- "hablan de redes sociales" → busca segmentos donde el TEMA sea redes, aunque no digan "redes sociales"
- "momento tenso" → busca desacuerdos, interrupciones, silencio incómodo
- "anécdota de infancia" → busca estructura narrativa sobre el pasado
- Prioriza la COMPLETITUD: el clip debe tener inicio, desarrollo y cierre del momento`,
        },
        {
          role: 'user',
          content: `Busca el momento que mejor coincida SEMÁNTICAMENTE con esta descripción:

"${query}"

La transcripción está dividida en bloques de ~30 segundos (número, timestamps, texto):

${formattedChunks}

Instrucciones:
1. Lee TODOS los bloques buscando el tema o situación descrita
2. Elige el bloque (o combinación de bloques contiguos) que mejor capture el SIGNIFICADO de la descripción
3. Ajusta los timestamps para incluir el momento completo (puede abarcar varios bloques)
4. El clip resultante debe durar entre 20 y 120 segundos
5. No cortes frases a mitad

Responde con un objeto JSON con esta estructura exacta.
Si encuentras el momento:
{ "found": true, "start_time": 45.2, "end_time": 89.7, "title": "Título en español (máx 8 palabras)", "reason": "Por qué coincide semánticamente (1-2 frases)" }

Si no hay coincidencia razonable:
{ "found": false, "reason": "Motivo por el que no se encontró" }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
  } catch (err) {
    throw new Error(openAIErrorMessage('GPT-4o búsqueda', err));
  }

  const parsed = JSON.parse(response.choices[0].message.content);

  if (parsed.found === false) {
    throw new Error(`No se encontró ninguna escena que coincida: ${parsed.reason}`);
  }

  const startTime = parseFloat(parsed.start_time) || 0;
  const endTime = parseFloat(parsed.end_time) || 0;

  if (endTime <= startTime) {
    throw new Error('GPT-4o devolvió timestamps inválidos para la escena');
  }

  return {
    start_time: startTime,
    end_time: endTime,
    title: String(parsed.title || 'Escena encontrada'),
    reason: String(parsed.reason || ''),
  };
}
