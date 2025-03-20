<template>
  <div>
    <UPopover arrow>
      <UChip
        :text="onlineStatusStore.onlineUsersCount"
        color="neutral"
        size="3xl">
        <UIcon
          name="hugeicons:user-circle-02"
          class="size-5 text-neutral-400 dark:text-neutral-500 cursor-pointer" />
      </UChip>
      <template #content>
        <div class="size-56 m-4 inline-flex">
          <div
            class="flex flex-col justify-center items-center space-y-2 text-sm text-neutral-500 w-full">
            <div class="text-lg font-bold">在线用户说明</div>
            <div>1. 系统实时统计并展示已通过身份认证的在线用户数量。</div>
            <div>
              2. 若认证用户在 3 分钟内未产生任何系统交互行为，或离开当前页面，最多超过 30
              秒，系统将自动将其状态更新为离线。
            </div>
            <div>3. 用户重新访问页面时，系统将在 3-8 秒内完成在线状态恢复，确保数据实时性。</div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
const onlineStatusStore = useOnlineStatusStore();
</script>
