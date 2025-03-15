<template>
  <div
    v-if="authors?.length"
    class="flex items-center space-x-10 py-2">
    <div class="group flex items-center">
      <UAvatarGroup>
        <UAvatar
          size="xl"
          :src="`${useAssets(author.authors_id.avatar)}`"
          :alt="author.authors_id.name"
          v-for="author in authors"
          :key="author.authors_id.id" />
      </UAvatarGroup>
      <div class="ml-4">
        <p class="font-medium text-neutral-800 dark:text-neutral-200 select-none">
          {{ authors.map((author) => author.authors_id.name).join(" & ") }}
        </p>
        <div class="flex items-center space-x-3 text-neutral-500 select-none">
          <UPopover
            arrow
            :portal="!!updated">
            <div
              class="text-sm"
              :class="updated ? 'cursor-help underline underline-offset-4 decoration-dashed' : ''">
              {{ useDatetime(date) }}发布
            </div>
            <template #content>
              <div class="px-3 py-1 text-sm">
                {{ updated ? useDatetime(updated || "") : "无" }}更新
              </div>
            </template>
          </UPopover>
          <div>&bull;</div>
          <div class="text-sm">阅读约需 {{ read }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Author } from "~/types";

defineProps<{
  authors?: Author[];
  date: string;
  read: string;
  updated: string | null;
}>();
</script>
