<template>
  <div class="flex items-center text-neutral-400 dark:text-neutral-600 text-sm select-none">
    <div v-if="status === 'pending'">
      <UIcon
        name="svg-spinners:3-dots-scale"
        class="size-[15px] text-neutral-400 dark:text-neutral-600"
        v-if="props.isComment" />
    </div>
    <span v-else-if="props.allowComment">
      <UTooltip
        arrow
        :delay-duration="0"
        :text="`${commentList.length} 条评论`"
        v-if="commentList.length > 0 && !props.isComment">
        <UKbd
          size="sm"
          class="mt-1.5"
          >{{ commentList.length > 0 ? `${commentList.length}` : "" }}</UKbd
        >
      </UTooltip>
      <span v-else>{{ commentList.length > 0 ? `${commentList.length} 条评论` : "" }}</span>
    </span>
    <span v-else>
      <UTooltip
        arrow
        :delay-duration="0"
        text="评论已关闭">
        <UIcon
          name="hugeicons:comment-block-02"
          class="size-[18px] mt-[5px] text-orange-500" />
      </UTooltip>
    </span>
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
