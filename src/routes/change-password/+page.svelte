<script>
  import { changePassword } from "$lib/api/auth.js";
  import { goto } from "$app/navigation";

  let oldPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  let error = "";
  let message = "";
  let isLoading = false;

  async function handleUpdate(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      error = "New passwords do not match";
      return;
    }

    isLoading = true;
    error = "";

    try {
      await changePassword(oldPassword, newPassword);
      message = "Password updated successfully! Returning to profile...";
      setTimeout(() => goto("/profile"), 2000);
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="max-w-lg mx-auto py-12 px-6">
  <h1 class="text-2xl font-bold mb-6 text-center">Update Password</h1>

  <div class="bg-white p-8 rounded-lg shadow-md border border-gray-100">
    {#if message}
      <div class="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
    {/if}
    {#if error}
      <div class="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
    {/if}

    <form on:submit={handleUpdate} class="flex flex-col gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1" for="old">Current Password</label>
        <input type="password" bind:value={oldPassword} required class="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
      </div>

      <hr class="my-2 border-gray-100" />

      <div>
        <label class="block text-sm text-gray-600 mb-1" for="new">New Password</label>
        <input type="password" bind:value={newPassword} required class="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
      </div>

      <div>
        <label class="block text-sm text-gray-600 mb-1" for="confirm">Confirm New Password</label>
        <input type="password" bind:value={confirmPassword} required class="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
      </div>

      <div class="flex gap-4 mt-4">
        <button type="button" on:click={() => goto("/profile")} class="flex-1 py-2 border rounded hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isLoading} class="flex-1 py-2 rounded bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-dark)]">
          {isLoading ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  </div>
</section>