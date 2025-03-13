<template>
  <USkeleton
    class="h-9 w-9 rounded-full"
    v-if="authStore.isLoading" />

  <ULink
    to="/account"
    v-else-if="authStore.isLoggedIn">
    <UAvatar
      :src="`${useAssets(
        authStore.user?.avatar || ''
      )}?fit=outside&quality=40&withoutEnlargement&width=64&height=64`"
      :alt="authStore.user?.first_name"
      class="ring-2 ring-neutral-800"
      size="lg" />
  </ULink>

  <ULink
    to="/auth"
    v-else>
    <UAvatar
      icon="hugeicons:lock-key"
      size="lg" />
  </ULink>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
</script>
