<template>
  <main class="mb-14 mt-12 sm:mt-0">
    <div v-if="status === 'pending' && !post">
      <PostsLoading />
    </div>
    <template v-else-if="post">
      <div class="h-11"></div>
      <div class="flex flex-col space-y-4">
        <div class="text-xl sm:text-2xl font-bold">{{ post.title }}</div>

        <div class="flex justify-between items-center">
          <PostsAuthor
            :authors="post.authors"
            :date="post.date_created"
            :read="useReadingTime(post.content)"
            :updated="post.date_updated" />

          <div class="space-x-5 text-neutral-500 transform duration-500 mt-1.5">
            <UTooltip
              arrow
              text="分享互联网">
              <UIcon
                name="hugeicons:share-05"
                class="size-5 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
                @click="shareButton(post.title, post.summary)" />
            </UTooltip>
          </div>
        </div>
      </div>

      <div
        class="py-8"
        v-if="post.images?.length">
        <div
          v-if="isLoading"
          class="flex justify-center items-center h-[274px]">
          <UIcon
            name="svg-spinners:90-ring-with-bg"
            class="size-8 text-primary-500" />
        </div>

        <UCarousel
          v-else
          v-slot="{ item }: { item: { directus_files_id: string } }"
          autoplay
          class-names
          wheel-gestures
          dots
          :items="post.images"
          :ui="{
            item: 'basis-[85%] transition-opacity [&:not(.is-snapped)]:opacity-40 duration-500',
            dot: 'w-6 h-1',
          }"
          class="mx-auto">
          <img
            :src="useAssets(item.directus_files_id) || undefined"
            class="rounded-lg"
            @load="onImageLoad" />
        </UCarousel>
      </div>

      <div class="pb-5">
        <Suspense>
          <template #default>
            <MDC
              :value="post.content"
              class="prose dark:prose-invert mdc-prose" />
          </template>
          <template #fallback>
            <div
              class="flex flex-col justify-center items-center my-12 space-y-3 text-primary-600/80">
              <UIcon
                name="svg-spinners:blocks-wave"
                class="size-8" />
            </div>
          </template>
        </Suspense>
      </div>

      <div class="m-5">
        <CommonLike
          :id="post.id"
          type="post"
          icon="hugeicons:clapping-02"
          size="32" />
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
  </main>
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
      "content",
      "authors.*.*",
      "images.*",
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
        "content",
        "authors.*.*",
        "images.*",
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

const isLoading = ref(true);
const imagesLoaded = ref(0);

watchEffect(() => {
  if (post.value?.images?.length) {
    imagesLoaded.value = 0;
    isLoading.value = true;

    Promise.all(
      post.value.images.map(({ directus_files_id }) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = useAssets(directus_files_id) || "";
          img.onload = () => resolve(true);
        });
      })
    ).then(() => {
      isLoading.value = false;
    });
  }
});

const onImageLoad = () => {
  imagesLoaded.value += 1;
  if (imagesLoaded.value === post.value?.images?.length) {
    isLoading.value = false;
  }
};

useSeoMeta({
  title: computed(() => post.value?.title || "首页"),
});
</script>
