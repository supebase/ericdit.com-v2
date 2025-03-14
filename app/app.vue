<template>
  <UApp
    :toaster="appConfig.toaster"
    :tooltip="appConfig.tooltip">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const authStore = useAuthStore();

useLazyAsyncData(
  "user-data",
  async () => {
    await authStore.fetchUserData();
  },
  { server: true }
);

useHead({
  titleTemplate: "%s - Eric",
});
</script>
