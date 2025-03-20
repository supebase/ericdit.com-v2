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
const preventGesture = (event: Event) => event.preventDefault();

// 初始化在线状态系统
onMounted(async () => {
  await onlineStatusStore.initializeOnlineStatuses();
  document.addEventListener("gesturestart", preventGesture);
});

// 确保在组件卸载时清理
onBeforeUnmount(() => {
  onlineStatusStore.stopMonitoring();

  const authStore = useAuthStore();
  if (authStore.user?.id) {
    onlineStatusStore.handleLogout(authStore.user.id);
  }
  document.removeEventListener("gesturestart", preventGesture);
});

useHead({
  titleTemplate: "%s - Eric",
});
</script>
