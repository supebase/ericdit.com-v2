<template>
  <div
    class="flex items-center space-x-2 text-neutral-500 hover:text-neutral-300 transform duration-500"
    :class="type === 'post' ? 'flex flex-col' : ''">
    <UIcon
      :name="iconName"
      :size="iconSize"
      @click="handleLike"
      class="cursor-pointer"
      :class="type === 'post' ? 'order-1' : 'order-0'" />
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

const handleLike = async () => {
  if (Date.now() - lastClickTime < 5000) return;
  lastClickTime = Date.now();

  if (!authStore.user) {
    return toast.add({
      title: "未登录",
      description: "请您先登录，以便进行点赞操作。",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
  }

  if (hasLiked.value || canlike.value) {
    return toast.add({
      title: "已点赞",
      description: `您已对该${props.type === "post" ? "内容" : "评论"}点赞，不能重复点赞。`,
      icon: "hugeicons:alert-02",
      color: "info",
    });
  }

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
