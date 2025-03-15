<template>
  <div class="flex items-center">
    <UChip
      inset
      position="bottom-right"
      :show="authStore.getUserOnlineStatus(user.id)">
      <UAvatar
        size="lg"
        :src="`${useAssets(user.avatar)}`"
        :alt="user.first_name"
        class="ring-2 text-neutral-200 dark:ring-neutral-800" />
    </UChip>
    <div class="ml-4 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 select-none">
          <div class="text-base font-medium text-neutral-800 dark:text-neutral-200">{{ user.first_name }}</div>
          <div class="text-sm text-neutral-500">{{ useDatetime(date) }}</div>
          <div class="text-sm text-neutral-500">&bull;</div>
          <div class="text-sm text-neutral-500">{{ user.location }}</div>
        </div>

        <CommonLike
          :id="commentId"
          type="comment"
          icon="hugeicons:favourite"
          size="46" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from "~/types";
const authStore = useAuthStore();

defineProps<{ user: User; date: string; commentId: number }>();
</script>
