<script>
  import Nav from "../../lib/components/Nav.svelte";
  import IdeaCard from "../../lib/components/IdeaCard.svelte";
  import { authStore } from "$lib/api/authStore.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { addComment, toggleCommentLike, toggleCommentDislike, getIdeaById, addFavorite, removeFavorite, createIdea } from "$lib/api/idea.js";
  import { Heart } from "@lucide/svelte";
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';
  import { callGemini } from "$lib/api/gemini.js";

  let showAI = false;

  // AI Assistant state
  let aiMessages = [];
  let aiInput = "";
  let isAiLoading = false;
  let aiError = "";
  
  // Draft state for personalized content
  let draftChanges = null; // { tools, instructions, description, title }
  let hasDraftChanges = false;
  
  // Track if we're in questioning phase (need more info before personalizing)
  let isQuestioningPhase = false;
  let conversationHistory = []; // Track full conversation for context
  let questionCount = 0; // Track number of AI follow-up questions asked
  
  // Success message state
  let showSuccessMessage = false;

  // Data from server
  export let data;
  const { idea } = data;
  
  // Favorite state
  let isFavorited = data.idea?.isFavorited || false;
  let isTogglingFavorite = false;
  
  // Helper function to map comment with user info
  // Comments now come with userName from the backend, so we just use that
  function mapCommentWithUser(comment) {
    // Use userName from backend if available, otherwise use 'User'
    const name = comment.userName || comment.name || 'User';
    const avatar = name !== 'User' ? name.charAt(0).toUpperCase() : 'U';
    
    return {
      ...comment,
      name,
      avatar,
      userReaction: comment.userReaction || null // Track user's reaction
    };
  }

  // Comments from server, will be updated after new submissions
  let comments = (data.comments || []).map(mapCommentWithUser);

  // Comment form state
  let newCommentText = "";
  let newCommentRating = null;
  let isSubmitting = false;
  let submitError = "";

  // Get auth token from localStorage
  function getToken() {
    if (!browser) return null;
    return localStorage.getItem('token');
  }

  // Submit comment
  async function submitComment() {
    // Reset error
    submitError = "";

    // Frontend validation
    if (!newCommentText.trim()) {
      submitError = "Please enter a comment";
      return;
    }

    if (!newCommentRating || newCommentRating < 1 || newCommentRating > 5) {
      submitError = "Please select a rating (1-5 stars)";
      return;
    }

    if (!$authStore.isLoggedIn) {
      submitError = "Please log in to comment";
      return;
    }

    isSubmitting = true;

    try {
      const token = getToken();
      
      if (!token) {
        submitError = "Authentication token not found. Please log in again.";
        isSubmitting = false;
        return;
      }

      // Rating is required, always include it
      const body = { 
        text: newCommentText.trim(),
        rating: newCommentRating
      };
      
      const newComment = await addComment(idea.id, body, token);

      // Add the new comment to the list with user info
      // Backend now includes userName, so we can use it directly
      comments = [...comments, mapCommentWithUser({
        ...newComment,
        user_id: $authStore.user?.id,
        userName: $authStore.user?.name || null, // Backend should provide this, but include as fallback
        title: '',
        likes: 0,
        dislikes: 0,
        userReaction: null
      })];

      // Reset form
      newCommentText = "";
      newCommentRating = null;
    } catch (err) {
      console.error("Error submitting comment:", err);
      if (err.message.includes('fetch')) {
        submitError = "Network error. Please check if the backend server is running.";
      } else {
        submitError = err.message || "Failed to submit comment. Please try again.";
      }
    } finally {
      isSubmitting = false;
    }
  }

  // Handle like/dislike toggle
  async function handleReaction(commentId, reactionType) {
    if (!$authStore.isLoggedIn) {
      submitError = "Please log in to like or dislike comments";
      return;
    }

    const token = getToken();
    if (!token) {
      submitError = "Authentication token not found. Please log in again.";
      return;
    }

    try {
      const result = reactionType === 'like' 
        ? await toggleCommentLike(commentId, token)
        : await toggleCommentDislike(commentId, token);

      // Update the comment in the list, preserving all other properties
      comments = comments.map(c => 
        c.id === commentId 
          ? { 
              ...c, 
              likes: result.likes, 
              dislikes: result.dislikes, 
              userReaction: result.userReaction // This will be 'like', 'dislike', or null
            }
          : c
      );
    } catch (err) {
      console.error(`Error toggling ${reactionType}:`, err);
      submitError = err.message || `Failed to ${reactionType} comment. Please try again.`;
    }
  }

  // Toggle favorite
  async function toggleFavorite() {
    if (!$authStore.isLoggedIn) {
      // Redirect to login with return URL
      goto(`/login?returnUrl=${encodeURIComponent($page.url.pathname)}`);
      return;
    }

    const token = getToken();
    if (!token) {
      submitError = "Authentication token not found. Please log in again.";
      return;
    }

    isTogglingFavorite = true;

    try {
      if (isFavorited) {
        await removeFavorite(idea.id, token);
        isFavorited = false;
      } else {
        await addFavorite(idea.id, token);
        isFavorited = true;
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      submitError = err.message || "Failed to update favorite. Please try again.";
    } finally {
      isTogglingFavorite = false;
    }
  }

  // Fetch user reactions when page loads (if logged in)
  async function fetchUserReactions() {
    if (!$authStore.isLoggedIn || !browser) return;
    
    const token = getToken();
    if (!token) return;

    try {
      // Re-fetch the idea with token to get user reactions
      const raw = await getIdeaById(idea.id, token);
      
      if (raw) {
        // Update favorite status
        if (raw.isFavorited !== undefined) {
          isFavorited = raw.isFavorited;
        }
        
        // Update comments with user reactions and user names from backend
        if (raw.comments) {
          comments = raw.comments.map(comment => {
            return mapCommentWithUser({
              ...comment,
              user_id: comment.user_id,
              userName: comment.userName || null, // Backend provides userName
              userReaction: comment.userReaction || null
            });
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user reactions:", err);
      // Don't show error to user, just silently fail
    }
  }

  onMount(() => {
    if (!browser) return;

    document.body.classList.add('idea-page');

    const main = document.querySelector('main');
    if (main) {
      main.dataset.originalClasses = main.className;
      main.classList.remove('max-w-6xl', 'mx-auto');
      main.classList.add('w-full', 'max-w-none');
    }

    // Fetch user reactions after page loads
    fetchUserReactions();
  });

  onDestroy(() => {
    if (!browser) return;

    document.body.classList.remove('idea-page');

    const main = document.querySelector('main');
    if (main?.dataset?.originalClasses) {
      main.className = main.dataset.originalClasses;
      delete main.dataset.originalClasses;
    }
  });

  // AI Assistant functions
  async function sendAIMessage(prompt, isPresetButton = false) {
    if (!prompt.trim()) return;

    // Add user message
    aiMessages = [...aiMessages, { role: 'user', content: prompt }];
    conversationHistory.push({ role: 'user', content: prompt });
    isAiLoading = true;
    aiError = "";

    try {
      // Count AI questions in conversation history
      const aiQuestionCount = conversationHistory.filter(msg => msg.role === 'assistant').length;
      
      const context = {
        title: idea.title,
        description: idea.description,
        ageRange: idea.ageRange,
        weather: idea.weather,
        duration: idea.duration,
        tools: idea.tools || [],
        instructions: idea.instructions || [],
        currentDraft: draftChanges, // Pass current draft for incremental updates
        conversationHistory: conversationHistory.slice(-6), // Last 6 messages for context
        isQuestioningPhase: isQuestioningPhase,
        isPresetButton: isPresetButton,
        questionCount: aiQuestionCount // Pass count of questions asked
      };

      const response = await callGemini(prompt, context);
      
      // Check if response is a question (text) or personalization (JSON)
      try {
        // Try to extract JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Check if it's actually a personalization JSON or just text that looks like JSON
          if (parsed.tools || parsed.instructions || parsed.description || parsed.title) {
            // It's a personalization - apply/update draft changes
            draftChanges = {
              tools: parsed.tools !== undefined ? parsed.tools : (draftChanges?.tools || idea.tools),
              instructions: parsed.instructions !== undefined ? parsed.instructions : (draftChanges?.instructions || idea.instructions),
              description: parsed.description !== undefined ? parsed.description : (draftChanges?.description || idea.description),
              title: parsed.title !== undefined ? parsed.title : (draftChanges?.title || idea.title)
            };
            hasDraftChanges = true;
            isQuestioningPhase = false; // We have enough info now
            
            // Add confirmation message
            aiMessages = [...aiMessages, { 
              role: 'assistant', 
              content: 'I\'ve updated the personalization! Review the changes below. You can continue editing or click "Apply Changes" to save.' 
            }];
            conversationHistory.push({ role: 'assistant', content: 'Personalization updated' });
          } else {
            // Not a valid personalization JSON, treat as text
            aiMessages = [...aiMessages, { role: 'assistant', content: response }];
            conversationHistory.push({ role: 'assistant', content: response });
            
            // Count questions and force personalization after 2 questions
            questionCount = conversationHistory.filter(msg => msg.role === 'assistant').length;
            if (questionCount >= 2) {
              // Force personalization after 2 questions - make another API call immediately
              isQuestioningPhase = false;
              // Add a system message to force personalization
              const personalizationPrompt = "Based on our conversation, please personalize this activity now.";
              conversationHistory.push({ role: 'user', content: personalizationPrompt });
              
              // Make the personalization call
              const personalizationContext = {
                title: idea.title,
                description: idea.description,
                ageRange: idea.ageRange,
                weather: idea.weather,
                duration: idea.duration,
                tools: idea.tools || [],
                instructions: idea.instructions || [],
                currentDraft: draftChanges,
                conversationHistory: conversationHistory.slice(-8),
                isQuestioningPhase: false,
                isPresetButton: false,
                questionCount: questionCount
              };
              
              try {
                const personalizationResponse = await callGemini(personalizationPrompt, personalizationContext);
                const jsonMatch = personalizationResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  if (parsed.tools || parsed.instructions || parsed.description || parsed.title) {
                    draftChanges = {
                      tools: parsed.tools !== undefined ? parsed.tools : (draftChanges?.tools || idea.tools),
                      instructions: parsed.instructions !== undefined ? parsed.instructions : (draftChanges?.instructions || idea.instructions),
                      description: parsed.description !== undefined ? parsed.description : (draftChanges?.description || idea.description),
                      title: parsed.title !== undefined ? parsed.title : (draftChanges?.title || idea.title)
                    };
                    hasDraftChanges = true;
                    aiMessages = [...aiMessages, { 
                      role: 'assistant', 
                      content: 'I\'ve personalized the activity based on our conversation! Review the changes below. You can continue editing or click "Apply Changes" to save.' 
                    }];
                    conversationHistory.push({ role: 'assistant', content: 'Personalization completed' });
                  }
                }
              } catch (err) {
                console.error("Error in forced personalization:", err);
              }
            } else {
              isQuestioningPhase = true; // Still need more info
            }
          }
        } else {
          // No JSON found - it's a question or text response
          aiMessages = [...aiMessages, { role: 'assistant', content: response }];
          conversationHistory.push({ role: 'assistant', content: response });
          
          // Count questions and force personalization after 2 questions
          questionCount = conversationHistory.filter(msg => msg.role === 'assistant').length;
          if (questionCount >= 2) {
            // Force personalization after 2 questions - make another API call immediately
            isQuestioningPhase = false;
            // Add a system message to force personalization
            const personalizationPrompt = "Based on our conversation, please personalize this activity now.";
            conversationHistory.push({ role: 'user', content: personalizationPrompt });
            
            // Make the personalization call
            const personalizationContext = {
              title: idea.title,
              description: idea.description,
              ageRange: idea.ageRange,
              weather: idea.weather,
              duration: idea.duration,
              tools: idea.tools || [],
              instructions: idea.instructions || [],
              currentDraft: draftChanges,
              conversationHistory: conversationHistory.slice(-8),
              isQuestioningPhase: false,
              isPresetButton: false,
              questionCount: questionCount
            };
            
            try {
              const personalizationResponse = await callGemini(personalizationPrompt, personalizationContext);
              const jsonMatch = personalizationResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.tools || parsed.instructions || parsed.description || parsed.title) {
                  draftChanges = {
                    tools: parsed.tools !== undefined ? parsed.tools : (draftChanges?.tools || idea.tools),
                    instructions: parsed.instructions !== undefined ? parsed.instructions : (draftChanges?.instructions || idea.instructions),
                    description: parsed.description !== undefined ? parsed.description : (draftChanges?.description || idea.description),
                    title: parsed.title !== undefined ? parsed.title : (draftChanges?.title || idea.title)
                  };
                  hasDraftChanges = true;
                  aiMessages = [...aiMessages, { 
                    role: 'assistant', 
                    content: 'I\'ve personalized the activity based on our conversation! Review the changes below. You can continue editing or click "Apply Changes" to save.' 
                  }];
                  conversationHistory.push({ role: 'assistant', content: 'Personalization completed' });
                }
              }
            } catch (err) {
              console.error("Error in forced personalization:", err);
            }
          } else {
            isQuestioningPhase = true; // Still in questioning phase
          }
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        // If parsing fails, show the response as a message (likely a question)
        aiMessages = [...aiMessages, { role: 'assistant', content: response }];
        conversationHistory.push({ role: 'assistant', content: response });
        
        // Count questions and force personalization after 2 questions
        questionCount = conversationHistory.filter(msg => msg.role === 'assistant').length;
        if (questionCount >= 2) {
          // Force personalization after 2 questions - make another API call immediately
          isQuestioningPhase = false;
          // Add a system message to force personalization
          const personalizationPrompt = "Based on our conversation, please personalize this activity now.";
          conversationHistory.push({ role: 'user', content: personalizationPrompt });
          
          // Make the personalization call
          const personalizationContext = {
            title: idea.title,
            description: idea.description,
            ageRange: idea.ageRange,
            weather: idea.weather,
            duration: idea.duration,
            tools: idea.tools || [],
            instructions: idea.instructions || [],
            currentDraft: draftChanges,
            conversationHistory: conversationHistory.slice(-8),
            isQuestioningPhase: false,
            isPresetButton: false,
            questionCount: questionCount
          };
          
          try {
            const personalizationResponse = await callGemini(personalizationPrompt, personalizationContext);
            const jsonMatch = personalizationResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.tools || parsed.instructions || parsed.description || parsed.title) {
                draftChanges = {
                  tools: parsed.tools !== undefined ? parsed.tools : (draftChanges?.tools || idea.tools),
                  instructions: parsed.instructions !== undefined ? parsed.instructions : (draftChanges?.instructions || idea.instructions),
                  description: parsed.description !== undefined ? parsed.description : (draftChanges?.description || idea.description),
                  title: parsed.title !== undefined ? parsed.title : (draftChanges?.title || idea.title)
                };
                hasDraftChanges = true;
                aiMessages = [...aiMessages, { 
                  role: 'assistant', 
                  content: 'I\'ve personalized the activity based on our conversation! Review the changes below. You can continue editing or click "Apply Changes" to save.' 
                }];
                conversationHistory.push({ role: 'assistant', content: 'Personalization completed' });
              }
            }
          } catch (err) {
            console.error("Error in forced personalization:", err);
          }
        } else {
          isQuestioningPhase = true;
        }
      }
    } catch (err) {
      console.error("Error calling Gemini:", err);
      aiError = err.message || "Failed to get AI response. Please try again.";
      // Remove the user message if there was an error
      aiMessages = aiMessages.slice(0, -1);
      conversationHistory.pop();
    } finally {
      isAiLoading = false;
    }
  }
  
  // Parse ageRange string to get min_age and max_age
  function parseAgeRange(ageRange) {
    if (!ageRange) return { min_age: null, max_age: null };
    
    // ageRange format is typically "5–10" or "5-10"
    const match = ageRange.match(/(\d+)[–-](\d+)/);
    if (match) {
      return {
        min_age: parseInt(match[1], 10),
        max_age: parseInt(match[2], 10)
      };
    }
    
    return { min_age: null, max_age: null };
  }
  
  // Apply draft changes - save as new idea
  async function applyDraftChanges() {
    if (!hasDraftChanges || !draftChanges) return;
    if (!$authStore.isLoggedIn) {
      aiError = "Please log in to save personalized ideas";
      return;
    }
    
    const token = getToken();
    if (!token) {
      aiError = "Authentication token not found. Please log in again.";
      return;
    }
    
    isAiLoading = true;
    aiError = "";
    
    try {
      // Calculate time_minutes from duration if needed
      const timeMinutes = idea.time_minutes || null;
      const timeLabel = idea.time_label || idea.duration || null;
      
      // Get min_age and max_age (prefer direct values, fallback to parsing ageRange)
      const min_age = idea.min_age !== undefined && idea.min_age !== null ? idea.min_age : parseAgeRange(idea.ageRange).min_age;
      const max_age = idea.max_age !== undefined && idea.max_age !== null ? idea.max_age : parseAgeRange(idea.ageRange).max_age;
      
      // Prepare materials (tools) as comma-separated string
      const materials = Array.isArray(draftChanges.tools) 
        ? draftChanges.tools.join(', ') 
        : (typeof draftChanges.tools === 'string' ? draftChanges.tools : (idea.tools || []).join(', '));
      
      // Ensure instructions is an array
      const instructions = Array.isArray(draftChanges.instructions) 
        ? draftChanges.instructions 
        : (idea.instructions || []);
      
      // Make title and description distinguishable from original
      const personalizedTitle = draftChanges.title 
        ? `${draftChanges.title} (Personalized)`
        : `${idea.title} (Personalized)`;
      
      const personalizedDescription = draftChanges.description 
        ? `${draftChanges.description} This is a personalized version adapted to your specific needs.`
        : `${idea.description} This is a personalized version adapted to your specific needs.`;
      
      // Create new idea with personalized content
      const newIdea = await createIdea({
        title: personalizedTitle,
        description: personalizedDescription,
        time_minutes: timeMinutes,
        time_label: timeLabel,
        difficulty: idea.difficulty || 'easy',
        materials: materials,
        subject: idea.subject || null,
        season: idea.season || 'any',
        yard_context: idea.yard_context || 'no_green',
        instructions: instructions,
        weather: idea.weather || 'any',
        min_age: min_age,
        max_age: max_age,
        image_url: idea.imageUrl || idea.image_url || null
      }, token);
      
      // Show success message and clear draft changes
      if (newIdea && newIdea.id) {
        hasDraftChanges = false;
        draftChanges = null;
        showSuccessMessage = true;
        
        // Redirect after 2 seconds
        setTimeout(() => {
          goto(`/idea/${newIdea.id}`);
        }, 2000);
      } else {
        aiError = "Failed to create personalized idea. Please try again.";
      }
    } catch (err) {
      console.error("Error applying changes:", err);
      aiError = err.message || "Failed to save personalized idea. Please try again.";
    } finally {
      isAiLoading = false;
    }
  }
  
  // Discard draft changes
  function discardDraftChanges() {
    draftChanges = null;
    hasDraftChanges = false;
    aiMessages = [];
    conversationHistory = [];
    isQuestioningPhase = false;
    questionCount = 0;
  }

  function handleButtonClick(buttonText) {
    // Reset conversation when starting with preset button
    if (aiMessages.length === 0) {
      conversationHistory = [];
      draftChanges = null;
      hasDraftChanges = false;
      questionCount = 0;
    }
    // Always start in questioning phase for preset buttons
    isQuestioningPhase = true;
    sendAIMessage(buttonText, true);
  }

  async function handleCustomMessage() {
    if (!aiInput.trim() || isAiLoading) return;
    
    const message = aiInput.trim();
    aiInput = "";
    await sendAIMessage(message, false);
  }

  function handleInputKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleCustomMessage();
    }
  }

  // Convert basic markdown to HTML for better formatting
  function formatMessage(text) {
    if (!text) return '';
    
    // Split into paragraphs first
    const paragraphs = text.split(/\n\n+/);
    
    let html = paragraphs.map(para => {
      // Check if paragraph is a list
      const lines = para.split('\n');
      const isList = lines.some(line => /^\s*[\*\-\+]\s+/.test(line));
      
      if (isList) {
        // Process as list
        const listItems = lines
          .filter(line => /^\s*[\*\-\+]\s+/.test(line))
          .map(line => {
            let item = line.replace(/^\s*[\*\-\+]\s+/, '');
            // Handle bold text in list items
            item = item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            return `<li class="mb-1">${item}</li>`;
          });
        return `<ul class="list-disc list-inside space-y-1 my-2 ml-2">${listItems.join('')}</ul>`;
      } else {
        // Process as regular paragraph
        let formatted = para.trim();
        // Handle bold text
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Handle single line breaks within paragraph
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted ? `<p class="mb-2">${formatted}</p>` : '';
      }
    }).join('');
    
    return html;
  }

</script>

<!-- MAIN CONTENT WRAPPER THAT SLIDES LEFT -->
<div class="flex min-h-screen">
  <!-- Main Content Area - adds right margin when AI panel opens -->
  <div class="flex-1 transition-all duration-300 {showAI ? 'mr-[480px]' : 'mr-0'}">
    <div class="w-full px-4 py-8 max-w-7xl mx-auto">

      <!-- Back Button -->
      <a href="/" class="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <span class="h-4 w-4">←</span>
        Back to Ideas
      </a>

      <div class="grid gap-8 lg:grid-cols-[1fr_400px] w-full">

        <!-- LEFT COLUMN -->
        <div class="space-y-8">

          <!-- Title & Meta -->
          <div>
            <h1 class="mb-2 text-4xl font-bold text-[var(--color-text-primary)] {hasDraftChanges && draftChanges?.title ? 'text-[var(--color-primary)]' : ''}">
              {hasDraftChanges && draftChanges?.title ? draftChanges.title : idea.title}
            </h1>
            <p class="mb-4 text-lg text-gray-600 {hasDraftChanges && draftChanges?.description ? 'text-[var(--color-primary)]' : ''}">
              {hasDraftChanges && draftChanges?.description ? draftChanges.description : idea.description}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>Age {idea.ageRange}</span>
              <span>•</span>
              <span>☀️ {idea.weather}</span>
              <span>•</span>
              <span class="flex items-center gap-1">
                ⏱ {idea.duration}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            {#if $authStore.isLoggedIn}
            <a href={`/planner/${idea.id}`}
              class="px-4 py-2 rounded bg-[var(--color-primary)] cursor-pointer text-white font-medium hover:bg-[var(--color-primary)] transition-colors"
            >
              Plan
            </a>
            {/if}
            <button class="px-4 py-2 rounded border border-[var(--color-border)] cursor-pointer font-medium hover:bg-[var(--color-border-light)] transition-colors">
              Find similar
            </button>
            <button
              class="px-4 py-2 rounded bg-[var(--color-primary)] text-white cursor-pointer font-medium hover:bg-[var(--color-primary)] transition-colors"
              on:click={() => showAI = true}
            >
              Personalize
            </button>
            <button on:click={() => window.print()} class="px-4 py-2 rounded border border-[var(--color-border)] cursor-pointer font-medium hover:bg-[var(--color-border-light)] transition-colors">
              Print
            </button>
          </div>

          <!-- Tools -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Tools & Materials</h2>
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white {hasDraftChanges && draftChanges?.tools ? 'border-[var(--color-primary)] border-2 bg-blue-50' : ''}">
              <ul class="space-y-3">
                {#each (hasDraftChanges && draftChanges?.tools ? draftChanges.tools : idea.tools) as tool}
                  <li class="flex items-start gap-3">
                    <span class="mt-1 h-5 w-5 rounded-full border-2 border-[var(--color-primary)] bg-white"></span>
                    <span class="text-gray-700 {hasDraftChanges && draftChanges?.tools ? 'font-medium' : ''}">{tool}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Instructions -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Instructions</h2>
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white {hasDraftChanges && draftChanges?.instructions ? 'border-[var(--color-primary)] border-2 bg-blue-50' : ''}">
              <ol class="space-y-6">
                {#each (hasDraftChanges && draftChanges?.instructions ? draftChanges.instructions : idea.instructions) as step, i}
                  <li class="flex gap-4">
                    <span class="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span class="pt-1 text-gray-700 {hasDraftChanges && draftChanges?.instructions ? 'font-medium' : ''}">{step}</span>
                  </li>
                {/each}
              </ol>
            </div>
          </div>

          <!-- Comments -->
          <div class="space-y-4 comments-section">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Comments</h2>

            <!-- Add Review -->
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white space-y-4">
              <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">Add Your Review</h3>
              {#if $authStore.isLoggedIn}
                <div class="space-y-4">
                  {#if submitError}
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                      {submitError}
                    </div>
                  {/if}
                  
                  <!-- Rating (required) -->
                  <div class="space-y-2">
                    <div class="text-sm font-medium text-gray-700">
                      Rating <span class="text-red-500">*</span>
                    </div>
                    <div class="flex gap-1" role="group" aria-label="Rating">
                      {#each [1, 2, 3, 4, 5] as rating}
                        <button
                          type="button"
                          class="transition-transform hover:scale-110"
                          on:click={() => newCommentRating = rating}
                        >
                          <span class="text-2xl {rating <= (newCommentRating || 0) ? 'text-yellow-400' : 'text-gray-300'}">
                            ★
                          </span>
                        </button>
                      {/each}
                    </div>
                    {#if submitError && submitError.includes('rating')}
                      <p class="text-sm text-red-600">{submitError}</p>
                    {/if}
                  </div>

                  <!-- Comment Text -->
                  <textarea 
                    bind:value={newCommentText}
                    class="w-full border border-[var(--color-border)] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
                    placeholder="Write your review..." 
                    rows="4"
                    disabled={isSubmitting}
                  ></textarea>
                  
                  <button 
                    class="w-full px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    on:click={submitComment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              {:else}
                <div class="py-8 text-center">
                  <p class="mb-4 text-gray-600">Please login to add a comment and rating</p>
                  <button 
                    class="px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg cursor-pointer font-medium hover:bg-[var(--color-primary)] transition-colors"
                    on:click={() => goto(`/login?returnUrl=${encodeURIComponent($page.url.pathname)}`)}
                  >
                    Login to Comment
                  </button>
                </div>
              {/if}
            </div>

            <!-- Existing Comments -->
            {#each comments as c}
              <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
                <div class="flex gap-4">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center font-bold text-white">
                    {c.avatar}
                  </div>
                  <div class="flex-1">
                    <div class="mb-1 flex items-center gap-2">
                      <span class="font-semibold text-gray-900">{c.name}</span>
                      <div class="flex gap-0.5">
                        {#each Array(c.rating) as _, i}
                          <span class="text-yellow-400">★</span>
                        {/each}
                        {#each Array(5 - c.rating) as _, i}
                          <span class="text-gray-300">★</span>
                        {/each}
                      </div>
                    </div>

                    <p class="mb-3 text-sm text-gray-600">{c.text}</p>

                    <div class="flex items-center gap-4 text-sm">
                      <button
                        class="flex items-center gap-1 px-2 py-1 rounded transition-colors font-medium {c.userReaction === 'like' ? 'bg-green-100 text-green-700 border border-green-300' : 'text-gray-500 hover:bg-gray-100 border border-transparent'}"
                        on:click={() => handleReaction(c.id, 'like')}
                        disabled={!$authStore.isLoggedIn}
                        title={$authStore.isLoggedIn ? (c.userReaction === 'like' ? 'Remove like' : 'Like this comment') : 'Please log in to like comments'}
                      >
                        <span class="text-base">👍</span>
                        <span class="font-semibold">{c.likes}</span>
                      </button>
                      <button
                        class="flex items-center gap-1 px-2 py-1 rounded transition-colors font-medium {c.userReaction === 'dislike' ? 'bg-red-100 text-red-700 border border-red-300' : 'text-gray-500 hover:bg-gray-100 border border-transparent'}"
                        on:click={() => handleReaction(c.id, 'dislike')}
                        disabled={!$authStore.isLoggedIn}
                        title={$authStore.isLoggedIn ? (c.userReaction === 'dislike' ? 'Remove dislike' : 'Dislike this comment') : 'Please log in to dislike comments'}
                      >
                        <span class="text-base">👎</span>
                        <span class="font-semibold">{c.dislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="space-y-6">
          <div class="border border-[var(--color-border)] rounded-lg overflow-hidden bg-white relative">
            <img src={idea.imageUrl} alt={idea.title} class="w-full h-96 object-cover" />
            <div class="absolute right-3 top-3 print:hidden">
              <button
                class="rounded-full bg-white/80 backdrop-blur-sm p-2 transition-colors hover:bg-white shadow-md hover:shadow-lg {isFavorited ? 'text-red-500' : 'text-gray-600'}"
                on:click={toggleFavorite}
                disabled={isTogglingFavorite}
                title={$authStore.isLoggedIn ? (isFavorited ? 'Remove from favorites' : 'Save to favorites') : 'Please log in to save ideas'}
              >
                <Heart class="h-5 w-5 {isFavorited ? 'fill-red-500' : ''}" />
              </button>
            </div>
          </div>

          <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white space-y-6 ratings-panel">
            <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">Rating</h3>
            {#if idea.avgRating !== null && idea.avgRating > 0}
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="flex gap-1">
                    {#each Array(Math.round(idea.avgRating)) as _}
                      <span class="text-3xl text-yellow-400">★</span>
                    {/each}
                    {#each Array(5 - Math.round(idea.avgRating)) as _}
                      <span class="text-3xl text-gray-300">★</span>
                    {/each}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-2xl font-bold text-[var(--color-text-primary)]">
                      {idea.avgRating.toFixed(1)}
                    </span>
                    <span class="text-sm text-gray-600">
                      {idea.ratingCount} {idea.ratingCount === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                </div>
              </div>
            {:else}
              <div class="py-4 text-center">
                <p class="text-gray-400 italic">No ratings yet</p>
                <p class="text-sm text-gray-500 mt-2">Be the first to rate this idea!</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI DRAWER -->
  {#if showAI}
    <div
      class="
        fixed right-0 top-0 h-full bg-white shadow-2xl border-l border-[var(--color-border)] z-50
        w-[480px] transition-all duration-300 ease-out
        flex flex-col
      "
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span class="text-xl text-white">✨</span>
          </div>
          <h2 class="text-xl font-semibold text-white">Personalize Activity</h2>
        </div>
        <button 
          class="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          on:click={() => {
            showAI = false;
            // Don't reset conversation - allow user to continue when reopening
          }}
        >
          <span class="text-white text-lg">×</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
        <!-- Quick Action Buttons -->
        <div class="space-y-3">
          <button 
            class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => handleButtonClick("I don't have the right tool")}
            disabled={isAiLoading}
          >
            <span class="font-medium">I don't have the right tool</span>
          </button>

          <button 
            class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => handleButtonClick("The weather is different")}
            disabled={isAiLoading}
          >
            <span class="font-medium">The weather is different</span>
          </button>

          <button 
            class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => handleButtonClick("It's too time consuming")}
            disabled={isAiLoading}
          >
            <span class="font-medium">It's too time consuming</span>
          </button>

          <button 
            class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => handleButtonClick("I'm working with a different age group")}
            disabled={isAiLoading}
          >
            <span class="font-medium">I'm working with a different age group</span>
          </button>
        </div>

        <!-- Messages Display -->
        {#if aiMessages.length > 0}
          <div class="pt-6 border-t border-[var(--color-border)] space-y-4">
            {#each aiMessages as message}
              <div class="space-y-2">
                {#if message.role === 'user'}
                  <div class="flex justify-end">
                    <div class="max-w-[80%] bg-[var(--color-primary)] text-white rounded-lg p-3">
                      <p class="text-sm">{message.content}</p>
                    </div>
                  </div>
                {:else}
                  <div class="flex justify-start">
                    <div class="max-w-[80%] bg-gray-100 rounded-lg p-3">
                      <div class="text-sm text-gray-800 prose prose-sm max-w-none">
                        {@html formatMessage(message.content)}
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
            
            {#if isAiLoading}
              <div class="flex justify-start">
                <div class="max-w-[80%] bg-gray-100 rounded-lg p-3">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        {#if aiError}
          <div class="pt-6 border-t border-[var(--color-border)]">
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {aiError}
            </div>
          </div>
        {/if}

        <!-- Success Message -->
        {#if showSuccessMessage}
          <div class="pt-6 border-t border-[var(--color-border)]">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">✅</span>
                <div class="flex-1">
                  <p class="text-sm text-green-800 font-medium">Personalized idea saved successfully!</p>
                  <p class="text-xs text-green-600 mt-1">Redirecting to your personalized idea...</p>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Apply Changes Button -->
        {#if hasDraftChanges && !showSuccessMessage}
          <div class="pt-6 border-t border-[var(--color-border)]">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p class="text-sm text-blue-800 font-medium">Personalized changes are ready!</p>
              <div class="flex gap-2">
                <button
                  class="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  on:click={applyDraftChanges}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? "Saving..." : "Apply Changes"}
                </button>
                <button
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  on:click={discardDraftChanges}
                  disabled={isAiLoading}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        {/if}

        <!-- Input Area - Sticky at bottom -->
        <div class="pt-6 border-t border-[var(--color-border)] mt-auto">
          <div class="relative">
            <input 
              bind:value={aiInput}
              on:keydown={handleInputKeydown}
              placeholder="Ask anything..." 
              class="w-full border border-[var(--color-border)] rounded-xl p-4 pl-12 pr-14 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-50"
              disabled={isAiLoading}
            />
            <span class="absolute left-4 top-4 text-gray-400">💬</span>
            <button 
              class="absolute right-4 top-4 h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              on:click={handleCustomMessage}
              disabled={isAiLoading || !aiInput.trim()}
            >
              <span class="text-white text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>


<style>
  :global(body) {
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #f1f8f4;
    margin: 0;
    overflow-x: hidden;
  }
  
  /* Smooth transitions */
  * {
    transition-property: color, background-color, border-color, transform, margin;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }
  
  /* Ensure proper stacking */
  .z-50 {
    z-index: 50;
  }
  
</style>