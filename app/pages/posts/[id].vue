<template>
  <div class="mb-14 mt-12 sm:mt-0">
    <div v-if="status === 'pending' && !post">
      <PostsLoading />
    </div>
    <template v-else-if="post">
      <div class="h-10"></div>
      <div class="flex flex-col space-y-4">
        <div class="text-xl sm:text-2xl font-bold">{{ post.title }}</div>

        <div class="flex justify-between items-center">
          <PostsAuthor
            :authors="post.authors"
            :date="post.date_created"
            :read="useReadingTime(post.content)"
            :updated="post.date_updated" />

          <UIcon
            name="hugeicons:share-05"
            class="size-[22px] sm:size-5 text-neutral-500 cursor-pointer hover:text-neutral-300 transform duration-500"
            @click="shareButton(post.title, post.summary)" />
        </div>
      </div>

      <div class="pb-5">
        <div class="mt-5">{{ post.summary ?? "" }}</div>

        <Suspense>
          <template #default>
            <MDC
              :value="post.content"
              class="prose prose-img:rounded-lg prose-pre:rounded-lg prose-pre:bg-neutral-100/80 dark:prose-pre:bg-neutral-950/60 prose-code:text-[0.8rem] prose-code:leading-[1.3rem] prose-a:text-primary-500 prose-h3:prose-a:text-neutral-600 dark:prose-h3:prose-a:text-neutral-300 prose-h4:prose-a:text-neutral-600 dark:prose-h4:prose-a:text-neutral-300 dark:prose-invert" />
          </template>
          <template #fallback>
            <div
              class="flex flex-col justify-center items-center mt-12 space-y-3 text-primary-600/80">
              <UIcon
                name="svg-spinners:blocks-shuffle-3"
                class="size-9" />
            </div>
          </template>
        </Suspense>
      </div>

      <div class="flex justify-center m-5">
        <CommonLike
          :id="post.id"
          type="post"
          icon="hugeicons:clapping-02"
          size="36" />
      </div>

      <div v-if="post.allowComment">
        <div class="py-5">
          <CommentsForm
            :postId="post.id"
            :userId="authStore.user?.id || ''" />
        </div>

        <CommentsList
          :postId="post.id"
          :user="authStore.isLoggedIn" />
      </div>
    </template>
    <template v-else>
      <UAlert
        color="error"
        title="哎呀，页面不见了！"
        description="您要访问的页面暂时无法访问，可能是链接错误或页面已被删除。"
        icon="hugeicons:alert-02" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { isClient } from "@vueuse/shared";

const { fetchPost, subscribeToPosts } = usePosts();
const authStore = useAuthStore();
const route = useRoute();
const toast = useToast();

const postId = computed(() => route.params.id as string);

const {
  data: post,
  status,
  refresh,
} = await useLazyAsyncData(postId.value, async () => {
  return await fetchPost(postId.value, {
    fields: [
      "id",
      "title",
      "summary",
      "content",
      "authors.*.*",
      "allowComment",
      "date_created",
      "date_updated",
    ],
  });
});

onMounted(async () => {
  subscribeToPosts(
    {
      fields: [
        "id",
        "title",
        "summary",
        "content",
        "authors.*.*",
        "allowComment",
        "date_created",
        "date_updated",
      ],
      filter: { id: { _eq: postId.value } },
    },
    async (item) => {
      if (item.event === "update") {
        await refresh();

        toast.add({
          id: postId.value,
          title: "内容更新通知",
          description: `我们对 ${item.data[0]?.title} 进行了更新。`,
          icon: "hugeicons:exchange-01",
          color: "info",
        });
      } else if (item.event === "delete") {
        toast.add({
          id: postId.value,
          title: "页面删除通知",
          description: `页面 ${postId.value} 已被删除。`,
          icon: "hugeicons:delete-04",
          color: "warning",
        });

        navigateTo("/");
      }
    }
  );
});

const { share, isSupported } = useShare();

const shareButton = (title: string, text: string) => {
  if (isSupported) {
    return share({
      title: title,
      text: text,
      url: isClient ? location.href : "",
    }).catch((err) => err);
  } else {
    toast.add({
      id: postId.value,
      title: "分享通知",
      description: "当前浏览器不支持分享功能。",
      icon: "hugeicons:delete-04",
      color: "warning",
    });
  }
};

useSeoMeta({
  title: computed(() => post.value?.title || "首页"),
});
</script>
