<script>
  import { resetPasswordRequest } from "$lib/api/auth.js";
  import { goto } from "$app/navigation";

  let email = "";
  let newPassword = "";
  let message = "";
  let error = "";
  let isLoading = false;

  async function handleReset(event) {
    event.preventDefault();
    isLoading = true;
    error = "";
    message = "";

    try {
      await resetPasswordRequest(email, newPassword);
      message = "Password has been reset successfully! Redirecting to login...";
      setTimeout(() => goto("/login"), 3000);
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="max-w-lg mx-auto py-12 px-6">
  <h1 class="text-3xl font-bold mb-8 text-center text-[var(--color-text-primary)]">Reset Password</h1>

  <div class="bg-white p-8 rounded-lg shadow-xl border border-[var(--color-border-light)]">
    {#if message}
      <div class="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
    {/if}
    {#if error}
      <div class="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
    {/if}

    <form on:submit={handleReset}>
      <div class="mb-4">
        <label class="block text-sm mb-2" for="email">Email of your account</label>
        <input type="email" bind:value={email} required class="w-full border p-2 rounded" />
      </div>
      <div class="mb-6">
        <label class="block text-sm mb-2" for="newPassword">New Password</label>
        <input type="password" bind:value={newPassword} required class="w-full border p-2 rounded" />
      </div>

      <button 
        type="submit" 
        class="w-full py-3 rounded bg-[var(--color-primary)] text-white font-bold disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Update Password"}
      </button>
    </form>
  </div>
</section>