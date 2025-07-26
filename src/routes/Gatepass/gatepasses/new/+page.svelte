<script lang="ts">
  import { onMount } from 'svelte';
  import { getDrivers, getVehicles, createGatepass } from '../../pocketbase.js';

  type Driver = { id: string; name: string; id_no: string | number; phone_no: string | number };
  type Vehicle = { id: string; vehicle_number?: string; model?: string; number_plate?: string };

  let drivers: Driver[] = [];
  let vehicles: Vehicle[] = [];
  let form = {
    driver_id: '',
    vehicle_id: '',
    destination: '',
    purpose: '',
    first_weight: '',
    Second_weight: '',
    Time_out: '',
    Time_in: '',
    invoice: '',
    product: '',
    quantity: '',
    price: '',
    customer: '',
    GP_no: ''
  };
  let loading = false;
  let error = '';
  let success = false;

  onMount(async () => {
    drivers = await getDrivers();
    vehicles = await getVehicles();
  });

  async function submit() {
    loading = true;
    error = '';
    success = false;
    // Validate required fields
    if (!form.driver_id || !form.destination || !form.Time_out || !form.purpose || !form.invoice || !form.customer) {
      error = 'Please fill all required fields: Driver, Destination, Time Out, Purpose, Invoice, and Customer.';
      loading = false;
      return;
    }
    try {
      const data = {
        driver_id: form.driver_id,
        vehicle_id: form.vehicle_id,
        destination: form.destination,
        purpose: form.purpose,
        first_weight: form.first_weight ? Number(form.first_weight) : undefined,
        Second_weight: form.Second_weight ? Number(form.Second_weight) : undefined,
        Time_out: form.Time_out ? new Date(form.Time_out).toISOString() : undefined,
        invoice: form.invoice,
        product: form.product,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        price: form.price ? Number(form.price) : undefined,
        customer: form.customer,
        GP_no: form.GP_no ? Number(form.GP_no) : undefined
      };
      console.log('Submitting gatepass data:', data);
      await createGatepass(data);
      success = true;
      form = {
        driver_id: '',
        vehicle_id: '',
        destination: '',
        purpose: '',
        first_weight: '',
        Second_weight: '',
        Time_out: '',
        Time_in: '',
        invoice: '',
        product: '',
        quantity: '',
        price: '',
        customer: '',
        GP_no: ''
      };
    } catch (e: any) {
      error = e?.message || 'Failed to create gatepass.';
    } finally {
      loading = false;
    }
  }

  function cancelForm() {
    form = {
      driver_id: '',
      vehicle_id: '',
      destination: '',
      purpose: '',
      first_weight: '',
      Second_weight: '',
      Time_out: '',
      Time_in: '',
      invoice: '',
      product: '',
      quantity: '',
      price: '',
      customer: '',
      GP_no: ''
    };
    error = '';
    success = false;
  }

  function maskIdNo(idNo: string | number): string {
    const str = String(idNo);
    if (str.length <= 3) return str;
    return str[0] + '***' + str.slice(-2);
  }

  function setCurrentTimeOut() {
    const now = new Date();
    // Format as yyyy-MM-ddTHH:mm (for datetime-local input)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    form.Time_out = formatted;
  }
  function getCurrentTimeString() {
    const now = new Date();
    return now.toLocaleString();
  }
</script>

<style>
  .form-card {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.03);
    padding: 1.2rem 1rem;
    width: 100%;
    max-width: 800px;
    margin: 1.2rem auto;
    transition: box-shadow 0.2s;
  }
  .form-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
    color: #1a202c;
  }
  .form-landscape {
    display: flex;
    gap: 1.2rem;
    flex-wrap: wrap;
  }
  .form-col {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .form-label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #374151;
  }
  .form-input, .form-select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 0.7rem;
    background: #f9fafb;
    transition: border 0.2s;
  }
  .form-input:focus, .form-select:focus {
    border-color: #2563eb;
    outline: none;
    background: #fff;
  }
  .form-btn {
    width: 100%;
    padding: 0.7rem 0;
    background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
    color: #fff;
    font-weight: 600;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 0.3rem;
  }
  .form-btn:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
  .form-error {
    color: #dc2626;
    margin-bottom: 0.7rem;
    text-align: center;
    font-size: 1rem;
  }
  .form-success {
    color: #16a34a;
    margin-bottom: 0.7rem;
    text-align: center;
    font-size: 1rem;
  }
  .form-btn-row {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 0.2rem;
  }
  .form-btn, .form-btn-cancel {
    flex: 1 1 0;
    min-width: 90px;
    padding: 0.45rem 0;
    font-size: 0.98rem;
    font-weight: 600;
    border: none;
    border-radius: 0.4rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .form-btn {
    background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
    color: #fff;
  }
  .form-btn:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
  .form-btn-cancel {
    background: #e5e7eb;
    color: #374151;
  }
  .form-btn-cancel:hover {
    background: #d1d5db;
  }
  .form-textarea {
    width: 100%;
    min-height: 3.2em;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 0.7rem;
    background: #f9fafb;
    resize: vertical;
    transition: border 0.2s;
  }
  .form-textarea:focus {
    border-color: #2563eb;
    outline: none;
    background: #fff;
  }
  @media (max-width: 900px) {
    .form-card {
      max-width: 98vw;
      padding: 0.7rem 0.3rem;
      margin: 0.7rem 1vw;
    }
    .form-landscape {
      flex-direction: column;
      gap: 0;
    }
    .form-col {
      width: 100%;
      gap: 0.2rem;
    }
    .form-title {
      font-size: 1.15rem;
    }
    .form-btn {
      font-size: 1rem;
      padding: 0.6rem 0;
    }
    .form-btn-row {
      flex-direction: column;
      gap: 0.4rem;
      align-items: stretch;
    }
    .form-btn, .form-btn-cancel {
      width: 100%;
      min-width: 0;
      font-size: 0.97rem;
    }
  }
</style>

<div class="form-card">
  <div class="form-title">New Gatepass Entry</div>
  <form on:submit|preventDefault={submit}>
    <div class="form-landscape">
      <div class="form-col">
        <label class="form-label">
          Driver
          <select class="form-select" bind:value={form.driver_id} required>
            <option value="" disabled>Select driver</option>
            {#each drivers as d}
              <option value={d.id}>{d.name} ({maskIdNo(d.id_no)})</option>
            {/each}
          </select>
        </label>
        <label class="form-label">
          Vehicle
          <select class="form-select" bind:value={form.vehicle_id}>
            <option value="" disabled>Select vehicle</option>
            {#each vehicles as v}
              <option value={v.id}>{v.number_plate}</option>
            {/each}
          </select>
        </label>
        <label class="form-label">
          Destination
          <input class="form-input" type="text" bind:value={form.destination} required />
        </label>
        <label class="form-label">
          Purpose
          <textarea class="form-textarea" bind:value={form.purpose} required rows="3" placeholder="Enter purpose..."></textarea>
        </label>
        <label class="form-label">
          CUSTOMER
          <input class="form-input" type="text" bind:value={form.customer} required />
        </label>
        <label class="form-label">
          Price
          <input class="form-input" type="number" bind:value={form.price} min="0" step="0.01" />
        </label>
      </div>
      <div class="form-col">
        <label class="form-label">
          INVOICE
          <input class="form-input" type="text" bind:value={form.invoice} required />
        </label>
        <label class="form-label">
          Product
          <input class="form-input" type="text" bind:value={form.product} />
        </label>
        <label class="form-label">
          Quantity
          <input class="form-input" type="number" bind:value={form.quantity} min="0" />
        </label>
        <label class="form-label">
          First Weight
          <input class="form-input" type="number" bind:value={form.first_weight} />
        </label>
        <label class="form-label">
          Second Weight
          <input class="form-input" type="number" bind:value={form.Second_weight} />
        </label>
        <label class="form-label">
          GP No
          <input class="form-input" type="number" bind:value={form.GP_no} min="1" />
        </label>
        <label class="form-label">
          Time Out
          <div style="font-size:0.98em; color:#374151; margin-bottom:0.2em;">
            Current: {getCurrentTimeString()}
          </div>
          <input class="form-input" type="datetime-local" bind:value={form.Time_out} required />
          <div style="font-size:0.85em; color:#2563eb; cursor:pointer; margin-top:-0.5em; margin-bottom:0.7em;" on:click={setCurrentTimeOut}>
            Set to current time
          </div>
        </label>
      </div>
    </div>
    {#if error}
      <div class="form-error">{error}</div>
    {/if}
    {#if success}
      <div class="form-success">Gatepass created successfully!</div>
    {/if}
    <div class="form-btn-row">
      <button type="submit" class="form-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
      <button type="button" class="form-btn-cancel" on:click={cancelForm} disabled={loading}>Cancel</button>
    </div>
  </form>
</div>
