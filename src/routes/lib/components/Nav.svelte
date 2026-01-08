<script>
    import { authStore } from "$lib/api/authStore";
    import { logout } from "$lib/api/auth.js";
    import { goto } from "$app/navigation";
    import { ChevronDown, LogOut, User, LayoutDashboard } from "@lucide/svelte";

    let showDropdown = false;

    function handleLogout() {
        logout();
        showDropdown = false;
        goto("/");
    }

    function toggleDropdown() {
        showDropdown = !showDropdown;
    }
</script>

<nav
    class="w-full text-white px-6 py-4 flex items-center justify-between
      bg-[linear-gradient(to_right,var(--color-primary),var(--color-primary-light))]"
>
    <div class="flex items-center gap-2 text-xl font-semibold">
        <span>🌿</span>
        <span>Green Clues</span>
    </div>

    <ul class="flex items-center gap-6">
        <li><a href="/" class="hover:underline">Home</a></li>
        <li><a href="/about" class="hover:underline">About</a></li>

        {#if $authStore.isLoggedIn}
            <li><a href="/dashboard" class="hover:underline">Dashboard</a></li>

            <li class="relative">
                <button
                    on:click={toggleDropdown}
                    class="flex items-center gap-2 bg-white/20 hover:bg-white/30 p-1 pr-3 rounded-full transition-colors"
                >
                    <div
                        class="bg-white text-[var(--color-primary-dark)] font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                    >
                        {$authStore.initial}
                    </div>
                    <ChevronDown
                        class="w-4 h-4 {showDropdown
                            ? 'rotate-180'
                            : ''} transition-transform"
                    />
                </button>

                {#if showDropdown}
                    <div
                        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-[var(--color-border-light)] py-2 text-gray-800 z-[100]"
                    >
                        <div class="px-4 py-2 border-b border-gray-100 mb-1">
                            <p class="text-xs text-gray-500">Signed in as</p>
                            <p class="text-sm font-semibold truncate">
                                {$authStore.user?.name}
                            </p>
                        </div>

                        <a
                            href="/dashboard"
                            on:click={() => (showDropdown = false)}
                            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                            <LayoutDashboard class="w-4 h-4" /> Dashboard
                        </a>

                        <a
                            href="/profile"
                            on:click={() => (showDropdown = false)}
                            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"
                        >
                            <User class="w-4 h-4" /> Profile
                        </a>

                        <button
                            on:click={handleLogout}
                            class="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600 border-t mt-1"
                        >
                            <LogOut class="w-4 h-4" /> Log Out
                        </button>
                    </div>
                {/if}
            </li>
        {:else}
            <li><a href="/login" class="hover:underline">Log In</a></li>
            <li>
                <a
                    href="/register"
                    class="bg-white text-[var(--color-primary-dark)] px-4 py-2 rounded-md font-bold hover:bg-[var(--color-secondary-light)] transition-colors"
                >
                    Sign Up
                </a>
            </li>
        {/if}
    </ul>
</nav>

{#if showDropdown}
    <div
        class="fixed inset-0 z-[50]"
        on:click={() => (showDropdown = false)}
    ></div>
{/if}

<style>
    nav {
        font-family: system-ui;
    }
</style>
