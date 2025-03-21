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
const onlineStatusStore = useOnlineStatusStore();
const { subscribeToUserStatus, setupVisibilityListener } = useOnlineStatus();

useLazyAsyncData(
  "user-data",
  async () => {
    await authStore.fetchUserData();

    // 如果用户已登录，设置为在线状态
    if (authStore.isLoggedIn && authStore.user?.id) {
      await onlineStatusStore.handleLogin(authStore.user.id);
    }
  },
  { server: true, watch: [] }
);

const preventGesture = (event: Event) => event.preventDefault();

// 初始化在线状态系统
onMounted(async () => {
  document.addEventListener("gesturestart", preventGesture);

  // 初始化在线状态
  await onlineStatusStore.initializeOnlineStatus();

  // 订阅用户状态变化
  await subscribeToUserStatus();

  // 设置页面可见性监听和心跳检测
  if (import.meta.client) {
    setupVisibilityListener();
  }
});

// 确保在组件卸载时清理
onBeforeUnmount(() => {
  document.removeEventListener("gesturestart", preventGesture);
});

useHead({
  titleTemplate: "%s - Eric",
});
</script>
