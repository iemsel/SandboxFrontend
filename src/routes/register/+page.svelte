<script>
  import { register } from "$lib/api/auth.js"; 
  import { goto } from "$app/navigation";
  
  let email = "";
  let name = "";
  let password = "";
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