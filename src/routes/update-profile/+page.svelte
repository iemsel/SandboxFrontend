<script>
  import { changePassword } from "$lib/api/auth.js";
  import { goto } from "$app/navigation";

  let oldPassword = "";
  let newPassword = "";
  let error = "";
  let message = "";
  let isLoading = false;

  async function handleUpdate(event) {
    event.preventDefault();
    isLoading = true;
    error = "";

    try {
      await changePassword(oldPassword, newPassword);
      message = "Password updated successfully!";
      setTimeout(() => goto("/profile"), 2000);
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<section class="max-w-lg mx-auto py-12 px-6">
  <h1 class="text-xl font-semibold mb-6">Change Password</h1>

  <div class="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
    {#if message}
      <div class="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
    {/if}
    {#if error}
      <div class="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
    {/if}

    <form on:submit={handleUpdate} class="flex flex-col gap-4">
      <div>
        <label class="block text-sm text-gray-500 mb-1" for="old">Current Password</label>
        <input type="password" bind:value={oldPassword} required class="w-full border p-2 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
      </div>

      <div>
        <label class="block text-sm text-gray-500 mb-1" for="new">New Password</label>
        <input type="password" bind:value={newPassword} required class="w-full border p-2 rounded focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
      </div>

      <div class="flex gap-3 mt-4">
        <button type="button" on:click={() => goto("/profile")} class="flex-1 py-2 rounded border border-gray-200 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isLoading} class="flex-1 py-2 rounded bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)]">
          {isLoading ? "Updating..." : "Confirm Change"}
        </button>
      </div>
    </form>
  </div>
</section>