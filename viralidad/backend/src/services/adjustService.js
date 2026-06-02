import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function computeAdjustedTimestamps(meta, segmentText, extendedContext, instruction) {
  const openai = getClient();

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un editor de video experto en contenido de entretenimiento en español. Respondes solo con JSON válido.',
        },
        {
          role: 'user',
          content: `Tienes un clip de un programa de streaming en español que necesita ajuste.

CLIP ACTUAL: "${meta.title}"
Timestamps: ${meta.startTime}s → ${meta.endTime}s (${(meta.endTime - meta.startTime).toFixed(1)}s de duración)

TRANSCRIPCIÓN DEL CLIP:
${segmentText}

CONTEXTO ADICIONAL (hasta ±60 segundos alrededor del clip):
${extendedContext || '(no disponible)'}

INSTRUCCIÓN DEL USUARIO: "${instruction}"

Genera nuevos timestamps que cumplan con la instrucción.
Reglas:
- El clip resultante debe durar entre 10 y 120 segundos
- No cortes a mitad de frase
- Usa timestamps exactos que aparezcan en la transcripción

Devuelve exactamente este JSON:
{
  "start_time": 45.2,
  "end_time": 89.7,
  "reason": "Qué se ajustó y por qué (1-2 frases)"
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
  } catch (err) {
    const status = err?.status;
    const detail = err?.error?.message || err?.message || String(err);
    if (status === 429) throw new Error('Cuota de OpenAI agotada — añade créditos en platform.openai.com/billing');
    if (status === 401) throw new Error('API key de OpenAI inválida');
    throw new Error(`GPT-4o ajuste falló: ${detail}`);
  }

  const parsed = JSON.parse(response.choices[0].message.content);
  const startTime = parseFloat(parsed.start_time);
  const endTime = parseFloat(parsed.end_time);

  if (isNaN(startTime) || isNaN(endTime) || endTime <= startTime) {
    throw new Error('GPT-4o devolvió timestamps inválidos para el ajuste');
  }

  return {
    start_time: startTime,
    end_time: endTime,
    reason: String(parsed.reason || ''),
  };
}
