import OpenAI from 'openai';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function openAIErrorMessage(step, err) {
  const status = err?.status;
  const detail = err?.error?.message || err?.message || String(err);
  if (status === 401) return `${step}: API key inválida`;
  if (status === 429) return `${step}: cuota de OpenAI agotada — añade créditos en platform.openai.com/billing`;
  return `${step} falló: ${detail}`;
}

export async function generateHooks(segmentText) {
  const openai = getClient();

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en hooks para Reels y TikTok. Respondes solo con JSON válido.',
        },
        {
          role: 'user',
          content: `Genera 3 hooks para este clip de video. Un hook es el texto de 1-2 líneas que aparece al inicio del reel para que el espectador no haga scroll.

TRANSCRIPCIÓN DEL SEGMENTO:
${segmentText}

Reglas estrictas:
- Mismo idioma que el segmento (español si el segmento está en español)
- Máximo 15 palabras por hook, 1-2 líneas
- Generan curiosidad o tensión — el espectador NECESITA saber el final
- NO hacen spoiler del remate ni del punch final
- Estilo directo, conversacional — como algo que diría una persona real
- Sin "En este video", sin hashtags, sin emojis forzados
- Que inviten a seguir viendo, no a saltarse el clip

Devuelve exactamente:
{
  "hooks": [
    "Primer hook",
    "Segundo hook",
    "Tercer hook"
  ]
}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });
  } catch (err) {
    throw new Error(openAIErrorMessage('Generación de hooks', err));
  }

  const parsed = JSON.parse(response.choices[0].message.content);
  const hooks = parsed.hooks || [];

  if (!Array.isArray(hooks) || hooks.length === 0) {
    throw new Error('No se pudieron generar hooks para este clip');
  }

  return hooks.slice(0, 3).map(String).filter(Boolean);
}
