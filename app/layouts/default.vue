<template>
  <div class="max-w-xl mx-auto">
    <div
      class="bg-white dark:bg-neutral-900 p-8 w-full fixed top-0 z-50 sm:z-0 sm:p-0 sm:bg-transparent">
      <CommonHeader />
    </div>

    <div class="px-5 sm:px-0">
      <slot />
    </div>

    <CommonFooter />
  </div>
</template>
