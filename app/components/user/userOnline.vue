<template>
  <div>
    <UChip
      :text="onlineStatusStore.onlineUsersCount"
      color="neutral"
      size="3xl">
      <UIcon
        name="hugeicons:user-circle-02"
        class="size-5 text-neutral-400 dark:text-neutral-500 cursor-pointer" />
    </UChip>
  </div>
</template>

<script setup lang="ts">
const onlineStatusStore = useOnlineStatusStore();

// 组件挂载时初始化在线状态监听
onMounted(async () => {
  await onlineStatusStore.initializeOnlineStatuses();
});

// 组件卸载时清理
onBeforeUnmount(() => {
  onlineStatusStore.stopMonitoring();
});
</script>
