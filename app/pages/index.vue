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
          <div class="relative select-none h-16 -z-10">
            <span
              class="absolute top-7 -left-4 sm:-left-8 text-8xl text-transparent opacity-5 font-bold year"
              >{{ year }}</span
            >
          </div>
          <article
            v-for="post in groupedPosts[year]"
            :key="post.id"
            class="relative flex justify-between py-3">
            <UBadge
              v-if="post.tag"
              :label="post.tag.name"
              color="neutral"
              variant="soft"
              class="absolute top-3.5 -left-14 opacity-65 select-none hidden sm:block" />
            <div class="flex space-x-4">
              <div>
                <ULink
                  :to="`/posts/${post.id}`"
                  class="text-lg font-semibold select-none">
                  <div
                    class="sm:duration-500 sm:ease-in-out hover:scale-100 sm:hover:scale-103 glow-link">
                    <span class="line-clamp-1">{{ post.title }}</span>
                  </div>
                </ULink>
                <div
                  class="flex items-center space-x-3 mt-1 sm:mt-0 text-sm text-neutral-400 dark:text-neutral-600">
                  <div class="sm:hidden">{{ useDatetime(post.date_created) }}</div>
                  <div class="sm:hidden text-neutral-300 dark:text-neutral-700">&bull;</div>
                  <div class="sm:hidden">{{ useReadingTime(post.content) }}</div>
                  <UBadge
                    v-if="post.tag"
                    :label="post.tag.name"
                    color="neutral"
                    variant="soft"
                    class="opacity-65 select-none block sm:hidden" />
                </div>
              </div>
              <div class="text-neutral-400 dark:text-neutral-600 text-sm select-none mt-0.5">
                <CommentsCount
                  :postId="post.id"
                  :allowComment="post.allowComment"
                  class="text-sm" />
              </div>
            </div>
            <div
              class="text-neutral-400 dark:text-neutral-600 text-sm select-none mt-1 hidden sm:block">
              {{ useDatetime(post.date_created) }}
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
    fields: ["id", "title", "content", "tag.*", "allowComment", "date_created", "date_updated"],
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
    { fields: ["id", "title", "content", "tag.*", "allowComment", "date_created", "date_updated"] },
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
