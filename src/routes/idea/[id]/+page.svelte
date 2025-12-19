<script>
  import Nav from "../../lib/components/Nav.svelte";
  import IdeaCard from "../../lib/components/IdeaCard.svelte";
  import { authStore } from "$lib/api/authStore.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { addComment, toggleCommentLike, toggleCommentDislike, getIdeaById, addFavorite, removeFavorite } from "$lib/api/idea.js";
  import { Heart } from "@lucide/svelte";
  import { browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';

  let showAI = false;

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
            <h1 class="mb-2 text-4xl font-bold text-[var(--color-text-primary)]">{idea.title}</h1>
            <p class="mb-4 text-lg text-gray-600">{idea.description}</p>

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
            <button class="px-4 py-2 rounded bg-[var(--color-primary)] cursor-pointer text-white font-medium hover:bg-[var(--color-primary)] transition-colors">
              Plan
            </button>
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
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
              <ul class="space-y-3">
                {#each idea.tools as tool}
                  <li class="flex items-start gap-3">
                    <span class="mt-1 h-5 w-5 rounded-full border-2 border-[var(--color-primary)] bg-white"></span>
                    <span class="text-gray-700">{tool}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>

          <!-- Instructions -->
          <div class="space-y-4">
            <h2 class="text-2xl font-bold text-[var(--color-text-primary)]">Instructions</h2>
            <div class="border border-[var(--color-border)] rounded-lg p-6 bg-white">
              <ol class="space-y-6">
                {#each idea.instructions as step, i}
                  <li class="flex gap-4">
                    <span class="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span class="pt-1 text-gray-700">{step}</span>
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
            <h3 class="text-lg font-semibold text-[var(--color-text-primary)]">Ratings</h3>
            {#each Object.entries(idea.ratings) as [key, value]}
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="capitalize text-gray-700">{key}</span>

                  {#if typeof value === 'number'}
                    <span class="text-gray-600 font-medium">
                      {value.toFixed(1)}/5
                    </span>
                  {:else}
                    <span class="text-gray-400 italic">Not rated</span>
                  {/if}
                </div>

                {#if typeof value === 'number'}
                  <div class="flex gap-1">
                    {#each Array(Math.round(value)) as _}
                      <span class="text-2xl text-yellow-400">★</span>
                    {/each}
                    {#each Array(5 - Math.round(value)) as _}
                      <span class="text-2xl text-gray-300">★</span>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}

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
          on:click={() => showAI = false}
        >
          <span class="text-white text-lg">×</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div class="space-y-3">
          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">I don't have the right tool</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">The weather is different</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">It's too time consuming</span>
          </button>

          <button class="w-full p-4 rounded-xl text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-left hover:from-[var(--color-text-primary)] hover:to-[var(--color-primary)] transition-all duration-200 shadow-sm hover:shadow-md">
            <span class="font-medium">I'm working with a different age group</span>
          </button>
        </div>

        <div class="pt-6 border-t border-[var(--color-border)] sticky top-[100vh]">
          <div class="relative">
            <input 
              placeholder="Ask anything..." 
              class="w-full border border-[var(--color-border)] rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
            <span class="absolute left-4 top-4 text-gray-400">💬</span>
            <button class="absolute right-4 top-4 h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] transition-colors">
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
  
  .z-40 {
    z-index: 40;
  }
</style>
