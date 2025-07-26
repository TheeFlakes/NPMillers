<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    subscribeToDrivers,
    unsubscribeDrivers,
    searchDrivers
  } from '../pocketbase.js';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  /** @type {Array<{id: string, name: string, id_no: number, phone_no: number}>} */
  let drivers = [];
  let loading = true;
  let error = '';
  let showModal = false;
  let modalMode = 'edit'; // 'edit' or 'create'
  /** @type {{id: string, name: string, id_no: number, phone_no: number} | null} */
  let selectedDriver = null;
  let form = { name: '', id_no: '', phone_no: '' };
  let saving = false;
  let saveError = '';
  let search = '';
  /** @type {ReturnType<typeof setTimeout> | null} */
  let searchTimeout = null;
  let isMobile = false;

  function checkMobile() {
    if (browser) {
      isMobile = window.innerWidth <= 640;
    }
  }

  async function fetchDrivers() {
    loading = true;
    error = '';
    try {
      drivers = await getDrivers();
    } catch (/** @type {any} */ e) {
      error = e && e.message ? e.message : 'Failed to fetch drivers.';
      console.error('Error fetching drivers:', e);
    } finally {
      loading = false;
    }
  }

  /**
   * @param {{id: string, name: string, id_no: number, phone_no: number}} driver
   */
  function openEdit(driver) {
    modalMode = 'edit';
    selectedDriver = driver;
    form = { name: driver.name, id_no: String(driver.id_no), phone_no: String(driver.phone_no) };
    showModal = true;
    saveError = '';
  }

  function openCreate() {
    goto('/Gatepass/drivers/new');
  }

  function closeModal() {
    showModal = false;
    selectedDriver = null;
    form = { name: '', id_no: '', phone_no: '' };
    saveError = '';
  }

  async function saveDriver() {
    saving = true;
    saveError = '';
    try {
      // Convert id_no and phone_no to numbers before saving
      const payload = { ...form, id_no: Number(form.id_no), phone_no: Number(form.phone_no) };
      if (modalMode === 'edit' && selectedDriver) {
        await updateDriver(selectedDriver.id, payload);
      } else if (modalMode === 'create') {
        await createDriver(payload);
      }
      closeModal();
    } catch (/** @type {any} */ e) {
      saveError = e && e.message ? e.message : 'Failed to save driver.';
      console.error('Error saving driver:', e);
    } finally {
      saving = false;
    }
  }

  async function removeDriver() {
    if (!selectedDriver) return;
    saving = true;
    saveError = '';
    try {
      await deleteDriver(selectedDriver.id);
      closeModal();
    } catch (/** @type {any} */ e) {
      saveError = e && e.message ? e.message : 'Failed to delete driver.';
      console.error('Error deleting driver:', e);
    } finally {
      saving = false;
    }
  }

  async function handleSearch() {
    if (!search) {
      fetchDrivers();
      return;
    }
    loading = true;
    error = '';
    try {
      drivers = await searchDrivers(search);
    } catch (/** @type {any} */ e) {
      error = e && e.message ? e.message : 'Failed to search drivers.';
      console.error('Error searching drivers:', e);
    } finally {
      loading = false;
    }
  }

  /**
   * @param {Event} e
   */
  function onSearchInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    search = target.value;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 400);
  }

  onMount(() => {
    fetchDrivers();
    subscribeToDrivers(() => {
      if (!search) fetchDrivers();
      else handleSearch();
    });
    checkMobile();
    if (browser) {
      window.addEventListener('resize', checkMobile);
    }
  });
  onDestroy(() => {
    unsubscribeDrivers();
    if (searchTimeout) clearTimeout(searchTimeout);
    if (browser) {
      window.removeEventListener('resize', checkMobile);
    }
  });
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
  <header class="w-full bg-white py-8 px-4 shadow-sm mb-8 border-b border-gray-200">
    <div class="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Driver Management</h1>
      <button class="bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-gray-700 hover:scale-105 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400" on:click={openCreate}>
        + New Driver
      </button>
    </div>
  </header>

  <main class="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4">
    <div class="mb-6">
      <input
        class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition shadow-sm bg-white placeholder-gray-400"
        placeholder="Search by name, ID number, or phone number..."
        value={search}
        on:input={onSearchInput}
      />
    </div>

    {#if loading}
      <div class="text-gray-500 py-16 text-center text-lg animate-pulse">Loading drivers...</div>
    {:else if error}
      <div class="text-red-600 py-16 text-center text-lg">{error}
        {#if error && error !== ''}
          <pre class="mt-2 text-xs text-red-400">{error}</pre>
        {/if}
      </div>
    {:else if drivers.length === 0}
      <div class="text-gray-400 py-16 text-center text-lg">No drivers found.</div>
    {:else}
      <!-- Desktop Table -->
      <div class="hidden sm:block overflow-x-auto w-full">
        <table class="min-w-full bg-white shadow-lg rounded-xl text-sm sm:text-base border border-gray-200">
          <thead>
            <tr class="bg-gray-100 text-gray-800">
              <th class="p-3 text-left font-semibold">Name</th>
              <th class="p-3 text-left font-semibold">ID Number</th>
              <th class="p-3 text-left font-semibold">Phone Number</th>
              <th class="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each drivers as d}
              <tr class="border-t border-gray-100 hover:bg-gray-50 transition">
                <td class="p-3 font-medium">{d.name}</td>
                <td class="p-3">{d.id_no}</td>
                <td class="p-3">{d.phone_no}</td>
                <td class="p-3">
                  <button class="text-gray-800 font-semibold hover:underline hover:text-black transition" on:click={() => openEdit(d)}>
                    Edit
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <!-- Mobile Cards -->
      <div class="flex flex-col gap-4 sm:hidden">
        {#each drivers as d}
          <div class="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <div class="font-semibold text-lg text-gray-800">{d.name}</div>
              <button class="text-gray-800 font-semibold hover:underline hover:text-black transition text-base" on:click={() => openEdit(d)}>
                Edit
              </button>
            </div>
            <div class="text-gray-600 text-sm"><span class="font-medium">ID Number:</span> {d.id_no}</div>
            <div class="text-gray-600 text-sm"><span class="font-medium">Phone:</span> {d.phone_no}</div>
          </div>
        {/each}
      </div>
    {/if}

    {#if showModal}
      <div class="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm mx-2 relative animate-fade-in border border-gray-100">
          <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" on:click={closeModal}>&times;</button>
          <h3 class="text-xl font-bold mb-4 text-gray-800">{modalMode === 'edit' ? 'Edit Driver' : 'Create Driver'}</h3>
          <form class="space-y-4" on:submit|preventDefault={saveDriver}>
            <div>
              <label class="block text-gray-700 font-medium mb-1">Name</label>
              <input class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400" bind:value={form.name} required />
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-1">ID Number</label>
              <input class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" bind:value={form.id_no} required />
            </div>
            <div>
              <label class="block text-gray-700 font-medium mb-1">Phone Number</label>
              <input class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400" type="number" bind:value={form.phone_no} required />
            </div>
            {#if saveError}
              <div class="text-red-600 text-sm">{saveError}</div>
            {/if}
            <div class="flex gap-2 mt-4">
              <button class="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700" type="submit" disabled={saving}>
                {saving ? 'Saving...' : (modalMode === 'edit' ? 'Save Changes' : 'Create')}
              </button>
              {#if modalMode === 'edit'}
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" type="button" on:click={removeDriver} disabled={saving}>
                  Delete
                </button>
              {/if}
              <button class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400" type="button" on:click={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  @media (max-width: 640px) {
    table, thead, tbody, th, td, tr {
      display: none;
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
</style> 