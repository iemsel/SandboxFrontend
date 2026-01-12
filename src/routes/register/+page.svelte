<script>
  import { register } from "$lib/api/auth.js"; 
  import { goto } from "$app/navigation";
  
  let email = "";
  let name = "";
  let password = "";
  let showPassword = false;
  let error = "";
  let isLoading = false;
  let successMessage = "";

  async function handleSubmit(event) {
    event.preventDefault();
    error = "";
    successMessage = "";
    
    if (!email || !name || !password) {
      error = "Name, email and password are required.";
      return;
    }

    isLoading = true;

    try {
      await register({ email, name, password });
      
      email = "";
      name = "";
      password = "";
      successMessage = "Registration successful! You can now log in.";
      
      setTimeout(() => {
        goto("/login");
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      // Display the specific error from the API (e.g., "Email is already registered")
      error = err.message || "An unexpected error occurred during registration.";
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="max-w-lg mx-auto py-12 px-6">
  <h1 class="text-4xl font-extrabold mb-8 text-center text-[var(--color-text-primary)]">
    Sign Up
  </h1>

  <div class="bg-[var(--color-white)] p-8 rounded-lg shadow-xl border border-[var(--color-border-light)]">
    
    {#if successMessage}
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Success!</strong>
        <span class="block sm:inline"> {successMessage}</span>
      </div>
    {/if}

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {error}</span>
      </div>
    {/if}

    <form on:submit={handleSubmit}>

      <div class="mb-4">
        <label for="name" class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Your Name</label>
        <input
          type="text"
          id="name"
          name="name"
          bind:value={name}
          required
          class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
      </div>
      
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          autocomplete="email"
          bind:value={email}
          required
          class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium mb-2 text-[var(--color-text-secondary)]">Password</label>
        <div class="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          name="password"
          bind:value={password}
          required
          class="w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
<button
      type="button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition-colors"
      on:click={() => (showPassword = !showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
          <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      {/if}
    </button>
        </div>
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
          Registering...
        {:else}
          Sign Up
        {/if}
      </button>

    </form>
    
    <p class="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account? 
        <a href="/login" class="text-[var(--color-text-accent)] hover:text-[var(--color-primary-dark)] font-medium">Log In</a>
    </p>
  </div>
</section>

<style>
  section { font-family: system-ui; }
</style>