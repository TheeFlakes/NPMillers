<script>
  // No additional logic needed for this static landing page
</script>

<div class="flex flex-col items-center justify-center min-h-[70vh] py-8 px-4 gap-8 bg-white">
  <img src="/logo-removebg-preview.png" alt="NPMillers Logo" class="w-28 h-28 md:w-36 md:h-36 mx-auto drop-shadow-lg mb-2" />
  <h1 class="text-3xl md:text-5xl font-extrabold text-blue-800 mb-2 tracking-tight">Gatepass Management, Simplified</h1>
  <p class="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
    Effortlessly create, review, and approve gatepasses for your drivers. Our streamlined process ensures security and efficiency at every step.
  </p>

  <!-- Process Flow SVGs -->
  <div class="w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
    <!-- Step 1: Fill Form -->
    <div class="flex flex-col items-center flex-1">
      <div class="bg-blue-100 rounded-full p-4 mb-2">
        <svg width="56" height="56" fill="none" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <rect width="56" height="56" rx="16" fill="#DBEAFE"/>
          <path d="M18 20h20M18 28h20M18 36h12" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="14" y="16" width="28" height="24" rx="4" stroke="#2563EB" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="font-semibold text-blue-700 mt-1">1. Fill Gatepass Form</span>
      <span class="text-xs text-gray-500 text-center mt-1">Enter driver and vehicle details to start the process.</span>
    </div>
    <!-- Arrow -->
    <svg class="hidden md:block" width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12h40m0 0l-6-6m6 6l-6 6" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <!-- Step 2: Review -->
    <div class="flex flex-col items-center flex-1">
      <div class="bg-blue-100 rounded-full p-4 mb-2">
        <svg width="56" height="56" fill="none" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <rect width="56" height="56" rx="16" fill="#DBEAFE"/>
          <path d="M20 28h16M20 28v8m0-8V20m16 8v8m0-8V20" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="28" cy="28" r="8" stroke="#2563EB" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="font-semibold text-blue-700 mt-1">2. Review & Verification</span>
      <span class="text-xs text-gray-500 text-center mt-1">Gatepass details are checked for accuracy and compliance.</span>
    </div>
    <!-- Arrow -->
    <svg class="hidden md:block" width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 12h40m0 0l-6-6m6 6l-6 6" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <!-- Step 3: Approval & Entry -->
    <div class="flex flex-col items-center flex-1">
      <div class="bg-blue-100 rounded-full p-4 mb-2">
        <svg width="56" height="56" fill="none" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
          <rect width="56" height="56" rx="16" fill="#DBEAFE"/>
          <path d="M22 32l6 6 10-14" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="14" y="16" width="28" height="24" rx="4" stroke="#2563EB" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="font-semibold text-blue-700 mt-1">3. Approval & Entry</span>
      <span class="text-xs text-gray-500 text-center mt-1">Once approved, the driver is granted entry with a valid gatepass.</span>
    </div>
  </div>

  <!-- Mobile process arrows -->
  <div class="flex md:hidden flex-col items-center gap-2 mt-4">
    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8h24m0 0l-4-4m4 4l-4 4" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8h24m0 0l-4-4m4 4l-4 4" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  <div class="mt-8 text-xs text-gray-400">&copy; {new Date().getFullYear()} NPMillers. All rights reserved.</div>
</div>
