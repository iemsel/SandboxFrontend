/**
 * Gemini API utility
 * Uses the free Gemini API to generate responses
 */

const GEMINI_API_KEY = 'AIzaSyC1Qip5y52JvHB7byH44MDKrmrdGioTtWE';
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
      
      // Build conversation context
      let conversationContext = '';
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n';
        context.conversationHistory.forEach(msg => {
          conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
        });
      }
      
      // Build current draft context
      let draftContext = '';
      if (context.currentDraft) {
        draftContext = '\n\nCurrent personalized version (user can edit this):\n';
        if (context.currentDraft.tools) {
          draftContext += `Tools: ${Array.isArray(context.currentDraft.tools) ? context.currentDraft.tools.join(', ') : context.currentDraft.tools}\n`;
        }
        if (context.currentDraft.instructions) {
          draftContext += `Instructions: ${Array.isArray(context.currentDraft.instructions) ? context.currentDraft.instructions.join(' | ') : context.currentDraft.instructions}\n`;
        }
      }
      
      // Determine mode based on context
      const isFirstMessage = !context.conversationHistory || context.conversationHistory.length <= 1;
      const questionCount = context.questionCount || 0;
      
      // Force personalization after 2 questions, even if AI thinks it needs more info
      const shouldForcePersonalization = questionCount >= 2;
      
      // For preset buttons on first message, ALWAYS ask questions first
      // Also stay in questioning phase if we're already there, BUT force personalization after 2 questions
      const needsMoreInfo = !shouldForcePersonalization && (
        context.isQuestioningPhase || 
        (context.isPresetButton && isFirstMessage) || 
        (context.isPresetButton && !context.currentDraft)
      );
      
      if (needsMoreInfo) {
        // Question mode - ask for more information
        const presetButtonContext = context.isPresetButton ? `
CRITICAL: The user clicked a preset button. These buttons indicate a PROBLEM but don't provide specific details. You MUST ask a follow-up question to get the specific information needed.

Common preset buttons and what to ask:
- "I don't have the right tool" → Ask: "What tools do you have available?" or "What tools are you missing?"
- "The weather is different" → Ask: "What's the weather like where you are?" or "What weather conditions do you have?"
- "It's too time consuming" → Ask: "How much time do you have available?" or "What's your time constraint?"
- "I'm working with a different age group" → Ask: "What age group are you working with?" or "What are the ages of the children?"

ALWAYS ask a follow-up question for preset buttons. DO NOT try to personalize yet.` : '';
        
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
${conversationContext}

User's message: ${prompt}
${presetButtonContext}

Your task: You need MORE information before you can personalize this activity. The user's message indicates a problem or concern, but you don't have the specific details needed.

You MUST ask ONE clear, specific follow-up question to get the information you need. DO NOT try to personalize yet - you don't have enough information.

Examples of good follow-up questions:
- "What tools do you have available?"
- "What's the weather like where you are?"
- "How much time do you have available?"
- "What age group are you working with?"

Respond with ONLY a friendly, helpful question (no JSON, just plain text). Do not include any JSON or try to personalize yet.`;
      } else {
        // Personalization mode - return JSON or update existing
        const forcePersonalizationNote = shouldForcePersonalization ? `
IMPORTANT: You have already asked ${questionCount} follow-up questions. You MUST now personalize the activity based on the information you have gathered. Do not ask any more questions - use the conversation history to make reasonable assumptions and create a personalized version.` : '';
        
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
${conversationContext}
${draftContext}

User's message: ${prompt}
${forcePersonalizationNote}

Based on the user's message and the conversation history, ${context.currentDraft ? 'update the existing personalization' : 'create a personalized version'} of this activity. Use the information from the conversation to make appropriate adaptations. The user can continue editing, so make incremental improvements based on their latest message.

Return your response as a JSON object with the following structure:
{
  "tools": ["tool1", "tool2", ...],  // Modified list of tools/materials (array of strings)
  "instructions": ["step1", "step2", ...],  // Modified instructions (array of strings)
  "description": "optional updated description if needed",  // Optional: only include if description should change
  "title": "optional updated title if needed"  // Optional: only include if title should change
}

Only include fields that need to be modified or updated. If a field doesn't need changes, omit it from the JSON. Return ONLY the JSON object, no additional text before or after.`;
      }
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
