<script>
  import { login } from "$lib/api/auth.js";
  import { authStore } from '$lib/api/authStore.js';
  import { goto } from "$app/navigation"; 
  
  let email = "";
  let password = "";
  let error = "";
  let isLoading = false;

  async function handleSubmit(event) {
    event.preventDefault();
    error = "";
    
    if (!email || !password) {
      error = "Please enter both email and password.";
      return;
    }

    isLoading = true;

try {
  
    const response = await login({ email, password });
    
    if (response.token) {
      // Store user info in localStorage and update authStore
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      authStore.login(response.user);
      
      await goto("/dashboard");
    } else {
      error = "Login failed. Please check your credentials.";
    }
  } catch (err) {
    console.error("Login error:", err);
    error = err.message || "An unexpected error occurred during login.";
  } finally {
    isLoading = false;
  }
  }

</script>

<section class="max-w-lg mx-auto py-12 px-6">
  <h1 class="text-4xl font-extrabold mb-8 text-center text-[var(--color-text-primary)]">
    Log In
  </h1>

  <div class="bg-[var(--color-white)] p-8 rounded-lg shadow-xl border border-[var(--color-border-light)]">
    
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {error}</span>
      </div>
    {/if}

    <form on:submit={handleSubmit}>
      
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          bind:value={email}
          required
          class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          bind:value={password}
          required
          class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        class="w-full py-3 px-4 rounded-md text-white font-semibold transition duration-150 ease-in-out"
        class:bg-[var(--color-primary)]={!isLoading}
        class:hover:bg-[var(--color-primary-dark)]={!isLoading}
        class:bg-gray-400={isLoading}
        disabled={isLoading}
      >
        {#if isLoading}
          Logging in...
        {:else}
          Log In
        {/if}
      </button>

    </form>
    
    <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Don't have an account? 
        <a href="/register" class="text-[var(--color-text-accent)] hover:text-[var(--color-primary-dark)] font-medium">Sign Up</a>
    </p>
  </div>
</section>

<style>
  section { font-family: system-ui; }
</style>