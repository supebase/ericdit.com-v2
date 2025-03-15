<template>
  <div class="flex items-center text-neutral-400 dark:text-neutral-600 text-sm select-none">
    <div v-if="status === 'pending'">
      <UIcon
        name="svg-spinners:3-dots-scale"
        class="size-[15px] text-neutral-400 dark:text-neutral-600"
        v-if="props.isComment" />
    </div>
    <span v-else-if="props.allowComment">
      {{ commentList.length > 0 ? `${commentList.length} 条评论` : "" }}
    </span>
    <span v-else>评论功能已关闭</span>
  </div>
</template>

<script setup lang="ts">
const { fetchComments, subscribeToComments } = useComments();

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
  allowComment: {
    type: Boolean,
    default: true,
  },
  isComment: {
    type: Boolean,
    default: false,
  },
});

const {
  data: comments,
  status,
  refresh,
} = await useLazyAsyncData(`comments-${props.postId}`, async () => {
  return await fetchComments({
    fields: ["post_id"],
    filter: { post_id: { _eq: props.postId } },
  });
});

onMounted(async () => {
  subscribeToComments({ fields: ["post_id"] }, async (item) => {
    if (item.event === "create") {
      await refresh();
    }
  });
});

const commentList = computed(() => comments.value ?? []);
</script>
