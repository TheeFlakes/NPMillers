<script lang="ts">
import { onMount } from 'svelte';
import { pb } from '$lib/stores/session.js';
import { getDriverById, getVehicleById } from '../pocketbase.js';

let gatepasses: any[] = [];
let error = '';
let enrichedGatepasses: any[] = [];
let search = '';
let page = 1;
let perPage = 2; // Changed from 6 to 2
let totalPages = 1;
let totalItems = 0;
let loading = false;

async function enrichGatepasses(gatepasses: any[]) {
    return await Promise.all(gatepasses.map(async (g: any) => {
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
    } catch (e: any) {
        if (e && e.message && e.message.includes('autocancelled')) {
            // Ignore auto-cancelled requests
            return;
        }
        error = 'Failed to fetch gatepasses: ' + (e && e.message ? e.message : e);
    }
    loading = false;
}

function handleSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    search = target.value;
    page = 1;
    fetchGatepasses();
}

function gotoPage(p: number) {
    if (p >= 1 && p <= totalPages) {
        page = p;
        fetchGatepasses();
    }
}

onMount(fetchGatepasses);

async function setTimeIn(gatepass: any) {
    const now = new Date().toISOString();
    try {
        await pb.collection('gatepasses').update(gatepass.id, { Time_in: now });
        await fetchGatepasses();
    } catch (e: any) {
        error = 'Failed to update Time_in: ' + (e && e.message ? e.message : e);
    }
}

function printGatepass(gatepass: any) {
    const printContent = document.getElementById(`print-gatepass-${gatepass.id}`)?.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=1000');
    if (!printWindow || !printContent) return;
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Gatepass - ${gatepass.id}</title>
            <style>
                @media print {
                    body { margin: 0; padding: 8px; }
                    .no-print { display: none; }
                    .gatepass-container { padding: 16px !important; }
                    .header { padding-bottom: 10px !important; margin-bottom: 15px !important; }
                    .footer { margin-top: 20px !important; padding-top: 10px !important; }
                    .signature-section { margin-top: 20px !important; padding-top: 10px !important; }
                    .company-name { font-size: 20px !important; }
                    .document-title { font-size: 16px !important; }
                    .logo { width: 50px !important; height: 50px !important; }
                    .content-grid { gap: 10px !important; }
                    .field-label, .field-value { font-size: 12px !important; }
                    .status-badge { font-size: 12px !important; padding: 6px 12px !important; }
                    .signature-line { font-size: 12px !important; margin-top: 20px !important; }
                }
                body {
                    font-family: 'Arial', sans-serif;
                    background: #fff;
                    color: #333;
                    margin: 0;
                    padding: 8px;
                    line-height: 1.3;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .logo {
                    width: 50px;
                    height: 50px;
                    margin: 0 auto 10px;
                    display: block;
                }
                .company-name {
                    font-size: 20px;
                    font-weight: bold;
                    color: #2563eb;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .document-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    margin: 6px 0 0 0;
                    text-transform: uppercase;
                }
                .gatepass-container {
                    max-width: 700px;
                    margin: 0 auto;
                    border: 2px solid #2563eb;
                    border-radius: 10px;
                    padding: 16px;
                    background: #f8fafc;
                }
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .field-group {
                    margin-bottom: 8px;
                }
                .field-label {
                    font-weight: bold;
                    color: #2563eb;
                    font-size: 12px;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                    letter-spacing: 1px;
                }
                .field-value {
                    font-size: 12px;
                    color: #333;
                    padding: 4px 8px;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 5px;
                    min-height: 16px;
                }
                .status-section {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px solid #e2e8f0;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .status-in {
                    background: #dcfce7;
                    color: #166534;
                    border: 2px solid #16a34a;
                }
                .status-out {
                    background: #fef3c7;
                    color: #92400e;
                    border: 2px solid #eab308;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #e2e8f0;
                    font-size: 10px;
                    color: #666;
                }
                .signature-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 2px solid #e2e8f0;
                }
                .signature-box {
                    text-align: center;
                }
                .signature-line {
                    border-top: 2px solid #333;
                    margin-top: 20px;
                    padding-top: 6px;
                    font-size: 12px;
                    font-weight: bold;
                }
                @media (max-width: 600px) {
                    .content-grid { grid-template-columns: 1fr; }
                    .signature-section { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="/NPMlogo.png" alt="New Paleah Millers Logo" class="logo">
                <h1 class="company-name">New Paleah Millers</h1>
                <h2 class="document-title">Gatepass</h2>
            </div>
            <div class="gatepass-container">
                <div class="content-grid">
                    <div class="field-group">
                        <div class="field-label">Driver Name</div>
                        <div class="field-value">${gatepass.driverName}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Vehicle Number Plate</div>
                        <div class="field-value">${gatepass.numberPlate}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Destination</div>
                        <div class="field-value">${gatepass.destination}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Purpose</div>
                        <div class="field-value">${gatepass.purpose}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Customer</div>
                        <div class="field-value">${gatepass.customer || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Product</div>
                        <div class="field-value">${gatepass.product || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Quantity</div>
                        <div class="field-value">${gatepass.quantity || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Price</div>
                        <div class="field-value">${gatepass.price ? '₦' + gatepass.price : 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Invoice</div>
                        <div class="field-value">${gatepass.invoice || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">GP Number</div>
                        <div class="field-value">${gatepass.GP_no || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">First Weight</div>
                        <div class="field-value">${gatepass.first_weight || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Second Weight</div>
                        <div class="field-value">${gatepass.Second_weight || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Time Out</div>
                        <div class="field-value">${gatepass.Time_out || 'N/A'}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Time In</div>
                        <div class="field-value">${gatepass.Time_in || 'Pending'}</div>
                    </div>
                </div>
                <div class="status-section">
                    <div class="status-badge ${gatepass.Time_in ? 'status-in' : 'status-out'}">
                        ${gatepass.Time_in ? 'Vehicle Returned' : 'Vehicle Out'}
                    </div>
                </div>
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-line">Security Officer Signature</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">Driver Signature</div>
                    </div>
                </div>
            </div>
            <div class="footer">
                <p>This document is computer generated and valid without signature</p>
                <p>New Paleah Millers - Gatepass Management System</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
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
                        <div class="line field"><span class="label">Invoice:</span> <span class="value">{gatepass.invoice}</span></div>
                        <div class="line field"><span class="label">Product:</span> <span class="value">{gatepass.product}</span></div>
                        <div class="line field"><span class="label">Quantity:</span> <span class="value">{gatepass.quantity}</span></div>
                        <div class="line field"><span class="label">Price:</span> <span class="value">{gatepass.price}</span></div>
                        <div class="line field"><span class="label">Customer:</span> <span class="value">{gatepass.customer}</span></div>
                        <div class="line field"><span class="label">GP No:</span> <span class="value">{gatepass.GP_no}</span></div>
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
    padding: 0.4em 0.8em;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1em;
    background: #f9fafb;
    color: #232733;
    outline: none;
    margin-bottom: 0.5em;
    box-shadow: 0 1px 4px #0001;
}
.gatepass-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
    justify-content: flex-start;
    align-items: stretch;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}
.gatepass-card {
    background: #f3f4f6;
    border-radius: 12px;
    box-shadow: 0 2px 12px #0001;
    border: 1px solid #e5e7eb;
    width: 100%;
    max-width: 520px;
    padding: 0.8rem 0.8rem 0.7rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    position: relative;
    color: #232733;
    transition: box-shadow 0.2s;
    align-items: stretch;
    height: 100%;
    min-height: 300px;
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
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 0.5rem;
    }
    .gatepass-card {
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
