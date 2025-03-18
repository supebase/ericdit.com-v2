<template>
  <div class="mb-14 mt-12 sm:mt-0">
    <div v-if="status === 'pending' && !posts">
      <PostsLoading />
    </div>
    <div v-else>
      <template v-if="sortedYears.length">
        <section
          v-for="year in sortedYears"
          :key="year">
          <div class="relative select-none h-14 -z-10">
            <span
              orientation="vertical"
              class="absolute top-9 sm:top-29 -left-1 sm:-left-38 sm:-rotate-90 text-7xl sm:text-5xl text-transparent opacity-10 font-bold year"
              >{{ year }}</span
            >
          </div>
          <article
            v-for="(post, index) in groupedPosts[year]"
            :key="post.id"
            class="py-5">
            <hr
              v-if="index > 0"
              class="mb-4 -mt-5" />
            <div class="flex first:pt-0 last:pb-0 relative">
              <div>
                <UBadge
                  v-if="post.tag"
                  :label="post.tag.name"
                  color="neutral"
                  variant="soft"
                  class="absolute top-0.5 -left-13 opacity-65 select-none hidden sm:block" />
                <div class="flex space-x-3">
                  <ULink
                    :to="`/posts/${post.id}`"
                    class="text-lg font-semibold select-none">
                    <div class="glow-link w-fit">
                      <span class="line-clamp-1">{{ post.title }}</span>
                    </div>
                  </ULink>
                  <div
                    class="items-center text-neutral-400 dark:text-neutral-600 text-sm select-none space-x-4 hidden sm:block">
                    <div v-if="post.images?.length">
                      <UTooltip
                        arrow
                        :delay-duration="0"
                        text="多图轮播">
                        <UIcon
                          name="hugeicons:image-01"
                          class="size-[18px] mt-[5px] text-primary-500" />
                      </UTooltip>
                    </div>
                    <CommentsCount
                      :postId="post.id"
                      :allowComment="post.allowComment" />
                  </div>
                </div>
                <div class="mt-1 text-sm text-neutral-300 dark:text-neutral-700 select-none">
                  {{ useDatetime(post.date_created) }}：{{ post.summary }}
                </div>
              </div>
            </div>
          </article>
        </section>
      </template>
      <template v-else>
        <UAlert
          color="error"
          title="网站内容暂未发布，敬请期待！"
          description="当前网站内容尚未发布，我们正在为您的到来做准备。请持续关注，精彩内容即将呈现！"
          icon="hugeicons:alert-02" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchPosts, subscribeToPosts } = usePosts();

const {
  data: posts,
  status,
  refresh,
} = await useLazyAsyncData("posts", async () => {
  return await fetchPosts({
    fields: [
      "id",
      "title",
      "summary",
      "content",
      "tag.*",
      "images",
      "allowComment",
      "date_created",
      "date_updated",
    ],
    sort: ["-date_created"],
    filter: { status: { _eq: "published" } },
  });
});

const groupedPosts = computed(() => {
  if (!posts.value) return {};
  return posts.value.reduce((acc, post) => {
    const year = new Date(post.date_created).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<number, typeof posts.value>);
});

const sortedYears = computed(() => {
  return Object.keys(groupedPosts.value)
    .map((year) => Number(year))
    .sort((a, b) => b - a);
});

onMounted(async () => {
  subscribeToPosts(
    {
      fields: [
        "id",
        "title",
        "summary",
        "content",
        "tag.*",
        "images",
        "allowComment",
        "date_created",
        "date_updated",
      ],
    },
    async (item) => {
      if (item.event === "create" || item.event === "delete") {
        await refresh();
      }
    }
  );
});

onActivated(async () => {
  await refresh();
});

useSeoMeta({
  title: "首页",
});
</script>
