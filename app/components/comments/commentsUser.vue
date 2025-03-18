<template>
  <div class="flex items-center">
    <UChip
      inset
      position="bottom-right"
      :show="authStore.getUserOnlineStatus(user.id)">
      <UAvatar
        size="lg"
        :src="avatarLoaded ? userAvatar : undefined"
        :alt="user.first_name"
        class="relative ring-2 text-neutral-200 dark:ring-neutral-800">
        <template #default>
          <div
            v-if="!avatarLoaded"
            class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
            <UIcon
              name="svg-spinners:90-ring-with-bg"
              class="size-6 text-neutral-500" />
          </div>
        </template>
      </UAvatar>
    </UChip>
    <div class="ml-4 w-full">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 select-none">
          <div class="text-base font-medium text-neutral-800 dark:text-neutral-200">
            {{ user.first_name }}
          </div>
          <div class="text-sm text-neutral-500">{{ useDatetime(date) }}</div>
          <div class="text-sm text-neutral-300 dark:text-neutral-700">&bull;</div>
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
const props = defineProps<{ user: User; date: string; commentId: number }>();

const { loaded: avatarLoaded, imageSrc: userAvatar } = useImageLoader(useAssets(props.user.avatar));
</script>
