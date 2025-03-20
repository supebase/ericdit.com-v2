<template>
  <div
    class="flex flex-col justify-center items-center text-neutral-300 dark:text-neutral-700 space-y-1.5 mb-6 text-sm select-none">
    <div class="space-y-2">
      <div class="flex justify-center items-center space-x-5">
        <CommonColorMode />

        <NuxtLink
          :to="link.url"
          target="_blank"
          class="text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transform duration-500"
          tabindex="-1"
          v-for="link in links">
          <UIcon
            :name="link.icon"
            class="size-5" />
        </NuxtLink>

        <UserOnline />
      </div>
      <div class="uppercase space-x-2">
        <span>2001 - Present</span>
        <span>&bull;</span>
        <span>Created by Eric</span>
      </div>
      <div class="space-x-2 text-center">
        <span>项目构建于 {{ useDatetime(buildTime) }}</span>
        <span>&bull;</span>
        <span class="tracking-wide">{{ version }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();
const {
  public: { buildTime },
} = useRuntimeConfig();

const { data: links } = await useLazyAsyncData("links", () => {
  return $directus.request(
    $content.readItems("links", {
      fields: ["*.*"],
      sort: ["sort"],
      filter: { status: "published" },
    })
  );
});

const version = ref("0.0.0");

onMounted(async () => {
  try {
    const { version: v } = await $fetch<{ version: string }>("/version.json", {
      headers: { "Cache-Control": "no-cache" },
    });
    version.value = v;
  } catch (error) {
    console.error("Failed to fetch version:", error);
    version.value = "未知版本";
  }
});
</script>
