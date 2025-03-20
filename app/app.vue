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
    // 初始化所有用户的在线状态
    await onlineStatusStore.initializeOnlineStatuses();

    // 如果用户已登录，开始监控在线状态
    if (authStore.user?.id) {
      onlineStatusStore.startMonitoring(authStore.user.id);
    }
  } catch (error) {
    console.error("Failed to initialize online statuses:", error);
  }

  const preventGesture = (event: Event) => event.preventDefault();
  document.addEventListener("gesturestart", preventGesture);
});

// 监听用户状态变化
watch(
  () => authStore.user?.id,
  (newUserId, oldUserId) => {
    if (oldUserId) {
      onlineStatusStore.handleLogout(oldUserId);
    }
    if (newUserId) {
      onlineStatusStore.startMonitoring(newUserId);
    }
  }
);

onBeforeUnmount(() => {
  // 确保在组件卸载前清理
  if (authStore.user?.id) {
    onlineStatusStore.handleLogout(authStore.user.id);
  }
});

useHead({
  titleTemplate: "%s - Eric",
});
</script>
