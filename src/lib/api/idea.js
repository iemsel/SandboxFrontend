/* eslint-disable prettier/prettier */

import { apiFetch } from './client.js';

// GET /ideas?difficulty=...&season=...&favorites_only=true
export function listIdeas(filters = {}, token) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/ideas${query}`, { token });
}

// POST /ideas  (protected)
export function createIdea(
  {
    title,
    description,
    time_minutes,
    time_label,
    difficulty,
    materials,
    subject,
    season,
    yard_context,
    instructions,
    weather,
    min_age,
    max_age,
    image_url,
  },
  token,
) {
  return apiFetch('/ideas', {
    method: 'POST',
    token,
    body: {
      title,
      description,
      time_minutes,
      time_label,
      difficulty,
      materials,
      subject,
      season,
      yard_context,
      instructions,
      weather,
      min_age,
      max_age,
      image_url,
    },
  });
}

// POST /ideas/favorites/:id
export function addFavorite(ideaId, token) {
  return apiFetch(`/ideas/favorites/${ideaId}`, {
    method: 'POST',
    token,
  });
}

// DELETE /ideas/favorites/:id
export function removeFavorite(ideaId, token) {
  return apiFetch(`/ideas/favorites/${ideaId}`, {
    method: 'DELETE',
    token,
  });
}

// GET /ideas/:id - get idea by id (includes comments)
// token is optional - if provided, will include user reactions
export async function getIdeaById(id, token) {
  return apiFetch(`/ideas/${id}`, { token });
}

// POST /ideas/:id/comments - add a comment (protected)
export function addComment(ideaId, { text, rating }, token) {
  return apiFetch(`/ideas/${ideaId}/comments`, {
    method: 'POST',
    token,
    body: { text, rating },
  });
}

// POST /ideas/comments/:commentId/like - toggle like on a comment (protected)
export function toggleCommentLike(commentId, token) {
  return apiFetch(`/ideas/comments/${commentId}/like`, {
    method: 'POST',
    token,
  });
}

// POST /ideas/comments/:commentId/dislike - toggle dislike on a comment (protected)
export function toggleCommentDislike(commentId, token) {
  return apiFetch(`/ideas/comments/${commentId}/dislike`, {
    method: 'POST',
    token,
  });
}
