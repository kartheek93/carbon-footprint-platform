/**
 * AI Assistant service using the Mistral AI API
 * Provides personalized carbon footprint insights and recommendations
 */

const SYSTEM_PROMPT = `You are EcoTrace AI, a friendly and knowledgeable carbon footprint advisor embedded in the EcoTrace app. Your role is to help users understand, track, and reduce their personal carbon emissions.

PERSONALITY:
- Encouraging and non-judgmental — celebrate small wins
- Data-driven but human — explain facts in plain English
- Practical — suggest realistic, actionable steps
- Concise — responses under 200 words unless asked for more detail

CAPABILITIES:
- Explain carbon emissions and climate impact in simple terms
- Analyze the user's footprint data and identify the biggest opportunities
- Suggest personalized reduction actions based on their lifestyle
- Answer questions about sustainability, climate, and lifestyle choices
- Help users set and track emissions-reduction goals

RULES:
- Never shame or guilt-trip users for their emissions
- Always cite approximate savings when suggesting actions (e.g., "saves ~300 kg CO2e/year")
- If unsure of exact figures, give a reasonable range with appropriate caveats
- Stay on-topic — focus on carbon footprint, sustainability, and climate
- Do not make up specific statistics — use well-known estimates or say "approximately"`;

/**
 * Send a message to the Mistral AI assistant
 * @param {string} userMessage - User's text input
 * @param {Array} conversationHistory - Prior messages [{role, content}]
 * @param {Object} userContext - User's footprint data for personalisation
 * @param {string} apiKey - Mistral API key
 * @returns {Promise<string>} assistant reply text
 */
export async function sendMessageToAssistant(
  userMessage,
  conversationHistory = [],
  userContext = {},
  apiKey = ''
) {
  const resolvedKey = apiKey || import.meta.env.VITE_MISTRAL_API_KEY || '';
  if (!resolvedKey) throw new Error('Mistral API key is not set. Please enter your API key.');

  const contextBlock = Object.keys(userContext).length
    ? `\n\n[User Context: ${JSON.stringify(userContext, null, 0)}]`
    : '';

  // Build messages in OpenAI-compatible format (Mistral uses same format)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: userMessage + contextBlock },
  ];

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resolvedKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest', // Free tier model
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.message || data?.error?.message || `API error ${response.status}`;
    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response received from Mistral.');

  return text;
}

/**
 * Generate a personalised summary insight for the dashboard
 * @param {Object} userContext - Footprint data
 * @param {string} apiKey - Mistral API key
 * @returns {Promise<string>} short insight text
 */
export async function generateInsight(userContext, apiKey) {
  const prompt = `Based on this user's carbon footprint data, write one encouraging sentence (max 30 words) highlighting either a strength or the single most impactful action they could take.`;
  return sendMessageToAssistant(prompt, [], userContext, apiKey);
}

/**
 * Generate a personalised action plan
 * @param {Object} userContext - Footprint data
 * @param {string} apiKey - Mistral API key
 * @returns {Promise<string>} formatted action plan
 */
export async function generateActionPlan(userContext, apiKey) {
  const prompt = `Create a 3-step personalised action plan to reduce this user's carbon footprint. For each step: give a title, estimated annual saving in kg CO2e, and one practical tip. Format as a numbered list.`;
  return sendMessageToAssistant(prompt, [], userContext, apiKey);
}
