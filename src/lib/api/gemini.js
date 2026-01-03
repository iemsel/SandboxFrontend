/**
 * Gemini API utility
 * Uses the free Gemini API to generate responses
 */

const GEMINI_API_KEY = 'AIzaSyBnuA-yq66shameEc266R5asNGMTntXJcY';
// Use gemini-2.5-flash-lite (cost-efficient model for free tier)
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Call Gemini API with a prompt
 * @param {string} prompt - The user's prompt
 * @param {Object} context - Context about the idea (title, description, etc.)
 * @returns {Promise<string>} - The AI's response
 */
export async function callGemini(prompt, context = {}) {
  try {
    // Build a context-aware prompt
    let fullPrompt = prompt;
    
    if (context.title || context.description) {
      // Format tools as a list
      let toolsText = 'N/A';
      if (context.tools && Array.isArray(context.tools) && context.tools.length > 0) {
        toolsText = context.tools.map((tool, i) => `${i + 1}. ${tool}`).join('\n');
      }
      
      // Format instructions as a numbered list
      let instructionsText = 'N/A';
      if (context.instructions && Array.isArray(context.instructions) && context.instructions.length > 0) {
        instructionsText = context.instructions.map((instruction, i) => `${i + 1}. ${instruction}`).join('\n');
      }
      
      fullPrompt = `You are helping personalize an activity idea. Here's the activity:
Title: ${context.title || 'N/A'}
Description: ${context.description || 'N/A'}
Age Range: ${context.ageRange || 'N/A'}
Weather: ${context.weather || 'N/A'}
Duration: ${context.duration || 'N/A'}

Tools & Materials:
${toolsText}

Instructions:
${instructionsText}

User's concern: ${prompt}

Please provide a helpful, friendly response with suggestions on how to adapt or personalize this activity. You can suggest alternative tools, modified instructions, or adaptations based on the user's concern. Keep it concise and practical.

Format your response as plain text with clear paragraphs. Use line breaks between paragraphs. For lists, use simple line breaks instead of markdown formatting.`;
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
        console.error('Gemini API error details:', errorJson);
      } catch {
        console.error('Gemini API error (raw):', response.status, errorText);
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    // Extract the generated text from Gemini's response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    // Check if there's a blocking reason
    if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
      const finishReason = data.candidates[0].finishReason;
      if (finishReason !== 'STOP') {
        throw new Error(`Response blocked: ${finishReason}`);
      }
    }
    
    throw new Error('Unexpected response format from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throw with more context if it's not already our custom error
    if (error.message && !error.message.includes('API request failed') && !error.message.includes('Unexpected')) {
      throw error;
    }
    throw new Error(error.message || 'Failed to get AI response. Please try again.');
  }
}
