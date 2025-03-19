<template>
  <div class="flex items-center text-neutral-400 dark:text-neutral-600 text-sm select-none">
    <div v-if="status === 'pending'">
      <UIcon
        name="svg-spinners:3-dots-scale"
        class="size-[15px] text-neutral-400 dark:text-neutral-600"
        v-if="isComment" />
    </div>
    <span v-else-if="allowComment">
      <UTooltip
        arrow
        :text="`${commentCount} 条评论`"
        v-if="hasComments && !isComment">
        <UKbd
          size="sm"
          class="mt-1.5"
          >{{ commentCount }}</UKbd
        >
      </UTooltip>
      <span v-else>{{ hasComments ? `${commentCount} 条评论` : "" }}</span>
    </span>
    <span v-else>
      <UTooltip
        arrow
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
const commentCount = computed(() => commentList.value.length);
const hasComments = computed(() => commentCount.value > 0);

// 使用解构简化 props 的使用
const { isComment, allowComment } = toRefs(props);
</script>
