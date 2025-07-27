<script lang="ts">
  import { pb } from '$lib/stores/session';
  let form = { full_name: '', id_number: '', phone_number: '' };
  let loading = false;
  let error = '';
  let success = false;

  async function submit() {
    loading = true;
    error = '';
    success = false;
    try {
      const data = {
        name: form.full_name,
        id_no: form.id_number,
        phone_no: form.phone_number
      };
      await pb.collection('driver_profile').create(data);
      success = true;
      form = { full_name: '', id_number: '', phone_number: '' };
    } catch (e: any) {
      error = e?.message || 'Failed to create driver.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-white">
  <div class="bg-gray-100 rounded-xl shadow-md p-8 w-full max-w-lg border border-gray-200">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold tracking-tight text-gray-800">Create Driver Profile</h2>
      <button class="text-gray-400 hover:text-gray-600 text-xl" title="Close" disabled>&times;</button>
    </div>
    <form class="space-y-5" on:submit|preventDefault={submit}>
      <div>
        <label class="block text-gray-700 font-medium mb-1">Full Name</label>
        <input class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="Driver's full name" bind:value={form.full_name} required />
      </div>
      <div>
        <label class="block text-gray-700 font-medium mb-1">National ID Number</label>
        <input class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" type="number" placeholder="e.g. 12345678" bind:value={form.id_number} required />
      </div>
      <div>
        <label class="block text-gray-700 font-medium mb-1">Phone Number</label>
        <input class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" placeholder="e.g. 0712345678" bind:value={form.phone_number} required />
      </div>
      {#if error}
        <div class="text-red-600 text-sm">{error}</div>
      {/if}
      {#if success}
        <div class="text-green-600 text-sm">Driver created successfully!</div>
      {/if}
      <div class="flex justify-end gap-3 mt-6">
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition disabled:opacity-60" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button class="border border-red-400 text-red-500 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition" type="button" disabled>Cancel</button>
      </div>
    </form>
  </div>
</div> 