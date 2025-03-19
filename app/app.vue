<template>
  <UApp
    :toaster="appConfig.toaster"
    :tooltip="appConfig.tooltip">
    <NuxtLoadingIndicator />
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
  { server: true, watch: [] }
);

const onlineStatusStore = useOnlineStatusStore();

onMounted(async () => {
  try {
    await onlineStatusStore.initializeOnlineStatuses();
    onlineStatusStore.startStatusRefresh();
  } catch (error) {
    console.error("Failed to initialize online statuses:", error);
  }

  const preventGesture = (event: Event) => event.preventDefault();
  document.addEventListener("gesturestart", preventGesture);
});

onUnmounted(() => {
  onlineStatusStore.stopStatusRefresh();
});

useHead({
  titleTemplate: "%s - Eric",
});
</script>
