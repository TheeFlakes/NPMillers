<script>
  import { page } from '$app/stores';
  $: current = $page.url.pathname;
  function logout() {
    alert('Logged out!');
    // TODO: Implement real logout logic
  }
  const navLinks = [
    {
      href: '/Gatepass/drivers',
      label: 'Drivers',
      icon: `<svg class='w-6 h-6' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z'/></svg>`
    },
    {
      href: '/Gatepass/drivers/new',
      label: 'Add Driver',
      icon: `<svg class='w-6 h-6' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M16 11V7a4 4 0 00-8 0v4M12 17v-6M9 14h6'/></svg>`
    },
    {
      href: '/Gatepass/gatepasses',
      label: 'Gatepasses',
      icon: `<svg class='w-6 h-6' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='9' y='2' width='6' height='4' rx='1' /><path d='M4 7a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z' /></svg>`
    },
    {
      href: '/Gatepass/gatepasses/new',
      label: 'Add Gatepass',
      icon: `<svg class='w-6 h-6' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='9' y='2' width='6' height='4' rx='1' /><path d='M4 7a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z' /><path stroke-linecap='round' stroke-linejoin='round' d='M12 11v6m3-3h-6'/></svg>`
    }
  ];
</script>

<style>
  .nav-active {
    @apply bg-blue-100 text-blue-700;
  }
</style>

<div class="min-h-screen flex flex-col md:flex-row bg-white">
  <!-- Sidebar for desktop -->
  <aside class="hidden md:flex flex-col w-64 h-screen border-r border-gray-200 bg-white">
    <div class="flex items-center gap-2 px-6 py-8 border-b border-gray-100">
      <img src="/NPMlogo.png" alt="Logo" class="w-10 h-10 rounded-full" />
      <span class="text-2xl font-bold text-gray-800">NPMillers</span>
    </div>
    <nav class="flex-1 flex flex-col gap-1 mt-6 px-2">
      {#each navLinks as link}
        <a href={link.href} class="flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 mb-1 {current === link.href ? 'bg-blue-100 text-blue-700' : ''}" use:html={link.icon}>
          {@html link.icon}
          <span>{link.label}</span>
        </a>
      {/each}
    </nav>
    <div class="px-6 py-6 border-t border-gray-100">
      <button class="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition justify-center" on:click={logout}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/></svg>
        <span>Logout</span>
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 p-4 md:p-8">
    <slot />
  </main>

  <!-- Bottom nav for mobile -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around items-center bg-white border-t border-gray-200 shadow p-1">
    {#each navLinks as link}
      <a href={link.href} class="flex flex-col items-center justify-center px-2 py-1 {current === link.href ? 'text-blue-700' : 'text-gray-500'}">
        {@html link.icon}
        <!-- Hide label on mobile -->
      </a>
    {/each}
    <button class="flex flex-col items-center justify-center px-2 py-1 text-red-600" on:click={logout}>
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/></svg>
    </button>
  </nav>
</div>
