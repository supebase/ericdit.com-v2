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

onMounted(async () => {
  try {
    // 初始化所有用户的在线状态
    await onlineStatusStore.initializeOnlineStatuses();
  } catch (error) {
    console.error("Failed to initialize online statuses:", error);
  }

  document.addEventListener("gesturestart", preventGesture);
});

onBeforeUnmount(() => {
  document.removeEventListener("gesturestart", preventGesture);

  // 确保在组件卸载前清理
  if (authStore.user?.id) {
    onlineStatusStore.handleLogout(authStore.user.id);
  }
});

useHead({
  titleTemplate: "%s - Eric",
});
</script>
