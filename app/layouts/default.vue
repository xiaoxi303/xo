<template>
  <div>
    <!-- Premium Warm Atmosphere Background -->
    <div class="bg-orbs">
      <div class="bg-orb bg-orb-1" />
      <div class="bg-orb bg-orb-2" />
      <div class="bg-orb bg-orb-3" />
      <div class="bg-orb bg-orb-4" />
    </div>

    <!-- Navbar -->
    <AppNavbar />

    <!-- Page content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>
