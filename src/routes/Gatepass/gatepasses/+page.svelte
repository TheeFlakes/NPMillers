<script>
import { onMount } from 'svelte';
import { pb } from '$lib/stores/session.js';
import { getDriverById, getVehicleById } from '../pocketbase.js';

let gatepasses = [];
let error = '';
let enrichedGatepasses = [];
let search = '';
let page = 1;
let perPage = 6;
let totalPages = 1;
let totalItems = 0;
let loading = false;

async function enrichGatepasses(gatepasses) {
    return await Promise.all(gatepasses.map(async (g) => {
        let driver = null;
        let vehicle = null;
        try {
            driver = g.driver_id ? await getDriverById(g.driver_id) : null;
        } catch {}
        try {
            vehicle = g.vehicle_id ? await getVehicleById(g.vehicle_id) : null;
        } catch {}
        return {
            ...g,
            driverName: driver?.name || 'Unknown',
            numberPlate: vehicle?.number_plate || 'Unknown',
        };
    }));
}

async function fetchGatepasses() {
    loading = true;
    try {
        let filter = '';
        if (search.trim()) {
            // Adjust filter for your PocketBase schema
            filter = `id ~ "${search}" || driver_id ~ "${search}" || destination ~ "${search}" || purpose ~ "${search}"`;
        }
        const result = await pb.collection('gatepasses').getList(page, perPage, {
            filter,
            sort: '-created',
        });
        gatepasses = result.items;
        totalPages = result.totalPages;
        totalItems = result.totalItems;
        enrichedGatepasses = await enrichGatepasses(result.items);
    } catch (e) {
        error = 'Failed to fetch gatepasses: ' + (e && e.message ? e.message : e);
    }
    loading = false;
}

function handleSearch(e) {
    search = e.target.value;
    page = 1;
    fetchGatepasses();
}

function gotoPage(p) {
    if (p >= 1 && p <= totalPages) {
        page = p;
        fetchGatepasses();
    }
}

onMount(fetchGatepasses);

async function setTimeIn(gatepass) {
    const now = new Date().toISOString();
    try {
        await pb.collection('gatepasses').update(gatepass.id, { Time_in: now });
        await fetchGatepasses();
    } catch (e) {
        error = 'Failed to update Time_in: ' + (e && e.message ? e.message : e);
    }
}

function printGatepass(gatepass) {
    const printContent = document.getElementById(`print-gatepass-${gatepass.id}`)?.innerHTML;
    const printWindow = window.open('', '', 'width=600,height=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Print Gatepass</title>');
    printWindow.document.write('<style>body{background:#fff;color:#232733;font-family:sans-serif;} .print-card{background:#f3f4f6;padding:2em;border-radius:12px;} .print-card h2{margin-top:0;} .print-card .field{margin-bottom:0.7em;} .print-card .label{font-weight:bold;display:inline-block;width:120px;} .print-card .value{display:inline-block;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
</script>

<div class="search-bar-container">
    <input
        class="search-bar"
        type="text"
        placeholder="Search by ID, driver, destination, purpose..."
        bind:value={search}
        on:input={handleSearch}
        autocomplete="off"
    />
</div>

{#if error}
    <p class="error-msg">{error}</p>
{:else}
    <div class="gatepass-list dark-bg">
        {#if loading}
            <div class="loading-msg">Loading...</div>
        {:else if enrichedGatepasses.length === 0}
            <div class="no-results">No gatepasses found.</div>
        {:else}
            {#each enrichedGatepasses as gatepass}
                <div class="gatepass-card {gatepass.Time_in ? 'in' : 'out'}">
                    <div class="img-placeholder">
                        <svg width="100%" height="40" viewBox="0 0 320 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="320" height="40" rx="8" fill="#d1d5db"/>
                            <path d="M40 30L60 10L80 30L120 5L160 30" stroke="#bfc4d1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="60" cy="10" r="5" fill="#bfc4d1"/>
                        </svg>
                    </div>
                    <div id={`print-gatepass-${gatepass.id}`} class="print-card-content">
                        <div class="line field"><span class="label">Gatepass ID:</span> <span class="value">{gatepass.id}</span></div>
                        <div class="line field"><span class="label">Driver:</span> <span class="value">{gatepass.driverName}</span></div>
                        <div class="line field"><span class="label">Number Plate:</span> <span class="value">{gatepass.numberPlate}</span></div>
                        <div class="line field"><span class="label">Created:</span> <span class="value">{gatepass.created}</span></div>
                        <div class="line field"><span class="label">Destination:</span> <span class="value">{gatepass.destination}</span></div>
                        <div class="line field"><span class="label">Purpose:</span> <span class="value">{gatepass.purpose}</span></div>
                        <div class="line field"><span class="label">First Weight:</span> <span class="value">{gatepass.first_weight}</span></div>
                        <div class="line field"><span class="label">Second Weight:</span> <span class="value">{gatepass.Second_weight}</span></div>
                        <div class="line field"><span class="label">Time Out:</span> <span class="value">{gatepass.Time_out}</span></div>
                        <div class="line field"><span class="label">Time In:</span> <span class="value">{gatepass.Time_in ? gatepass.Time_in : '—'}</span></div>
                    </div>
                    <div class="card-actions">
                        {#if !gatepass.Time_in}
                            <button class="set-timein-btn primary-btn" on:click={() => setTimeIn(gatepass)}>Set Time In (Now)</button>
                        {/if}
                        <button class="print-btn secondary-btn" on:click={() => printGatepass(gatepass)} title="Print Gatepass">
                            🖨 Print
                        </button>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    <div class="pagination-container">
        <button class="pagination-btn" on:click={() => gotoPage(page - 1)} disabled={page === 1}>&laquo; Prev</button>
        {#each Array(totalPages) as _, i}
            <button class="pagination-btn {page === i + 1 ? 'active' : ''}" on:click={() => gotoPage(i + 1)}>{i + 1}</button>
        {/each}
        <button class="pagination-btn" on:click={() => gotoPage(page + 1)} disabled={page === totalPages}>Next &raquo;</button>
    </div>
{/if}

<style>
body, .dark-bg {
    background: #fff;
    min-height: 100vh;
}
.search-bar-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 1.2rem 0 0.5rem 0;
}
.search-bar {
    width: 100%;
    max-width: 500px;
    padding: 0.7em 1.2em;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1.1em;
    background: #f9fafb;
    color: #232733;
    outline: none;
    margin-bottom: 0.5em;
    box-shadow: 0 1px 4px #0001;
}
.gatepass-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 1rem;
}
.gatepass-card {
    background: #f3f4f6;
    border-radius: 12px;
    box-shadow: 0 2px 12px #0001;
    border: 1px solid #e5e7eb;
    min-width: 340px;
    max-width: 520px;
    width: 100%;
    padding: 1.2rem 1.2rem 1rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    position: relative;
    color: #232733;
    transition: box-shadow 0.2s;
    align-items: stretch;
}
.gatepass-card.in {
    border-left: 6px solid #16a34a;
}
.gatepass-card.out {
    border-left: 6px solid #eab308;
}
.img-placeholder {
    width: 100%;
    height: 40px;
    background: #d1d5db;
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.7rem;
}
.print-card-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3em 1.2em;
    padding: 0.2rem 0 0.2rem 0;
}
.line.field {
    background: transparent;
    border-radius: 4px;
    margin-bottom: 0;
    padding: 0.1em 0;
    border-bottom: none;
    display: flex;
    align-items: center;
    font-size: 0.97em;
    min-width: 0;
    word-break: break-word;
}
.label {
    min-width: 90px;
    color: #6b7280;
    font-weight: 500;
    margin-right: 0.3em;
}
.value {
    color: #232733;
    font-weight: 600;
    flex: 1;
}
.card-actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5em;
    margin-top: 0.5em;
    padding: 0 0 0 0;
}
.primary-btn {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5em 1em;
    font-size: 0.98em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}
.primary-btn:hover {
    background: #1d4ed8;
}
.secondary-btn {
    background: #d1d5db;
    color: #2563eb;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5em 1em;
    font-size: 0.98em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}
.secondary-btn:hover {
    background: #e5e7eb;
    color: #1d4ed8;
}
.print-btn {
    margin-left: 0;
}
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.3em;
    margin: 1.5em 0 2em 0;
}
.pagination-btn {
    background: #f3f4f6;
    color: #232733;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.4em 1em;
    font-size: 1em;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}
.pagination-btn.active, .pagination-btn:hover {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
}
.pagination-btn:disabled {
    background: #e5e7eb;
    color: #bfc4d1;
    cursor: not-allowed;
}
.loading-msg, .no-results {
    width: 100%;
    text-align: center;
    color: #6b7280;
    font-size: 1.1em;
    margin: 2em 0;
}
.error-msg {
    color: #dc2626;
    background: #fee2e2;
    border: 1px solid #fecaca;
    padding: 0.7em 1em;
    border-radius: 8px;
    margin: 1em auto;
    max-width: 400px;
    text-align: center;
}
@media (max-width: 900px) {
    .gatepass-list {
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem;
    }
    .gatepass-card {
        min-width: unset;
        max-width: 100%;
        padding: 1rem 0.7rem 0.7rem 0.7rem;
    }
    .img-placeholder {
        width: 100%;
        height: 35px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0.5rem;
    }
    .print-card-content {
        grid-template-columns: 1fr;
        gap: 0.2em 0.7em;
        padding: 0.1rem 0 0.1rem 0;
    }
}
@media (max-width: 600px) {
    .search-bar {
        max-width: 100%;
        font-size: 1em;
    }
    .gatepass-list {
        flex-direction: column;
        gap: 0.7rem;
        padding: 0.3rem;
    }
    .gatepass-card {
        min-width: unset;
        max-width: 100%;
        padding: 0.7rem 0.3rem 0.5rem 0.3rem;
    }
    .img-placeholder {
        width: 100%;
        height: 30px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0.3rem;
    }
    .print-card-content {
        grid-template-columns: 1fr;
        gap: 0.1em 0.3em;
        padding: 0.05rem 0 0.05rem 0;
    }
    .pagination-container {
        flex-wrap: wrap;
        gap: 0.2em;
    }
}
</style>
