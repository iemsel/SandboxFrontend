<script>
    import { authStore } from "../stores/authStore.js";
    import { logoutUser } from "../utils/auth.js";
    import { goto } from "$app/navigation";
    
    // Reactive Svelte store subscription
    const { isLoggedIn, initial } = $authStore;
    
    // Function to handle logout
    function handleLogout() {
        logoutUser(); // Clears local storage and updates the store
        goto("/"); // Redirect to home page
    }
</script>

<nav class="w-full text-white px-6 py-4 flex items-center justify-between
      bg-[linear-gradient(to_right,var(--color-primary),var(--color-primary-light))]">
    <div class="flex items-center gap-2 text-xl font-semibold">
        <span>🌿</span>
        <span>Green Clues</span>
    </div>

    <ul class="flex items-center gap-6">
        <li><a href="/" class="hover:underline">Home</a></li>
        
        {#if $authStore.isLoggedIn}
            <li><a href="/dashboard" class="hover:underline">Dashboard</a></li>
        {/if}
        
        <li><a href="/about" class="hover:underline">About</a></li>
        
        {#if $authStore.isLoggedIn}
            <li class="bg-white text-green-700 font-bold rounded-full w-8 h-8 flex items-center justify-center">
                {$authStore.initial}
            </li>
            <li>
                <button on:click={handleLogout} class="hover:underline cursor-pointer">Logout</button>
            </li>
        {:else}
            <li><a href="/login" class="px-3 py-1 bg-white text-[var(--color-primary-dark)] rounded font-medium hover:bg-gray-100 transition">Log In</a></li>
            <li><a href="/register" class="hover:underline">Sign Up</a></li>
        {/if}
    </ul>
</nav>

<style>
    nav { font-family: system-ui; }
</style>