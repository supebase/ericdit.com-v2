<template>
  <div
    v-if="authors?.length"
    class="flex items-center space-x-10 py-2">
    <div class="group flex items-center">
      <UAvatarGroup>
        <UAvatar
          v-for="author in authors"
          :key="author.authors_id.id"
          size="xl"
          :src="authorAvatars[author.authors_id.id]"
          :alt="author.authors_id.name"
          class="relative">
          <template #default>
            <div
              v-if="!avatarLoaded[author.authors_id.id]"
              class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <UIcon
                name="svg-spinners:90-ring-with-bg"
                class="size-6 text-neutral-500" />
            </div>
          </template>
        </UAvatar>
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
          <div class="text-neutral-300 dark:text-neutral-700">&bull;</div>
          <div class="text-sm">阅读约需 {{ read }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Author } from "~/types";

const props = defineProps<{
  authors?: Author[];
  date: string;
  read: string;
  updated: string | null;
}>();

const authorAvatars = ref<Record<string, string>>({});
const avatarLoaded = ref<Record<string, boolean>>({});

watchEffect(() => {
  if (props.authors?.length) {
    props.authors.forEach((author) => {
      avatarLoaded.value[author.authors_id.id] = false;
      const img = new Image();
      img.src = useAssets(author.authors_id.avatar) || "";
      img.onload = () => {
        authorAvatars.value[author.authors_id.id] = img.src;
        avatarLoaded.value[author.authors_id.id] = true;
      };
    });
  }
});
</script>
