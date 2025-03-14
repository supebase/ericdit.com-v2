<template>
  <div
    class="flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transform duration-500"
    :class="type === 'post' ? 'flex flex-col' : ''">
    <UIcon
      v-if="loading"
      name="svg-spinners:ring-resize"
      class="text-neutral-500"
      :class="type === 'post' ? 'order-1 size-9 mx-auto' : 'order-0 size-[46px]'" />
    <UIcon
      v-else
      :name="iconName"
      :size="iconSize"
      @click="handleLike"
      class="cursor-pointer"
      :class="[
        type === 'post' ? 'order-1 mx-auto' : 'order-0',
        hasLiked || canlike ? 'text-neutral-700' : '',
      ]" />
    <CommonAnimateNumber
      ref="animateNumberRef"
      v-model:count="count"
      :type="type" />
  </div>
</template>

<script setup lang="ts">
const { fetchLikes, subscribeToLikes } = useLikes();
const { $directus, $content } = useNuxtApp();
const authStore = useAuthStore();
const toast = useToast();

const props = defineProps<{
  id: string | number;
  type: "post" | "comment";
  icon: string;
  size?: string;
}>();

const { data: likes } = await useLazyAsyncData(`likes-${props.type}-${props.id}`, async () => {
  return await fetchLikes({
    fields: ["user_created"],
    filter: { target_id: { _eq: props.id }, target_type: { _eq: props.type } },
  });
});

const hasLiked = ref(false);
const likesCount = computed(() => likes.value?.length || 0);
const count = ref(likesCount.value);
const animateNumberRef = ref();
const iconName = computed(() => props.icon);
const iconSize = computed(() => props.size || "32");

hasLiked.value = !!authStore.user?.id
  ? !!likes.value?.some((like: any) => like.user_created === authStore.user?.id)
  : false;

const canlike = computed(() => {
  return authStore.user?.id
    ? likes.value?.some((like: any) => like.user_created === authStore.user?.id)
    : false;
});

let lastClickTime = 0;
const loading = ref(false);

const handleLike = async () => {
  if (Date.now() - lastClickTime < 5000) return;
  lastClickTime = Date.now();

  if (!authStore.user) {
    return toast.add({
      title: "登录提示",
      description: "请您先登录，再进行点赞操作。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
  }

  if (hasLiked.value || canlike.value) {
    return toast.add({
      title: "点赞提示",
      description: `您已对该${props.type === "post" ? "内容" : "评论"}点赞，不能重复点赞。`,
      icon: "hugeicons:alert-02",
      color: "info",
    });
  }

  try {
    loading.value = true;
    await $directus.request(
      $content.createItem("likes", {
        user_created: authStore.user.id,
        target_id: props.id,
        target_type: props.type,
      })
    );
    hasLiked.value = true;

    toast.add({
      title: "点赞成功",
      description: "您的点赞操作已提交，感谢参与。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } finally {
    loading.value = false;
  }
};

const increment = () => {
  animateNumberRef.value.increment();
};

onMounted(() => {
  subscribeToLikes(
    {
      fields: ["user_created"],
      filter: { target_id: { _eq: props.id }, target_type: { _eq: props.type } },
    },
    (item) => {
      if (item.event === "create") {
        increment();
      }
    }
  );
});

watch(likesCount, (newValue) => {
  count.value = newValue;
});
</script>
