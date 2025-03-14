<template>
  <div>
    <div v-if="status === 'pending' && !comments">
      <div class="py-5">
        <CommentsLoading />
      </div>
    </div>

    <div
      v-else
      class="space-y-6 pt-2">
      <div class="flex justify-between items-center">
        <CommentsCount
          :postId="props.postId"
          :isComment="true" />
        <div
          v-if="comments?.length"
          class="text-sm text-neutral-600 underline underline-offset-4 decoration-dashed select-none">
          超过半年或字数太少的评论会隐藏
        </div>
      </div>

      <div
        v-if="visibleComments.length || hiddenComments.length"
        class="divide-dashed divide-y divide-neutral-700/80">
        <!-- 显示符合条件的评论 -->
        <div
          v-for="comment in visibleComments"
          :key="comment.id.toString()"
          class="py-5 first:pt-0 last:pb-0">
          <CommentsUser
            :user="comment.user_created"
            :date="comment.date_created"
            :commentId="Number(comment.id)" />
          <div class="ml-13">{{ comment.comment }}</div>
        </div>

        <!-- 可隐藏的评论（旧评论 & 短评论） -->
        <div v-if="hiddenComments.length">
          <div class="flex justify-center py-4">
            <button
              type="button"
              @click="showHiddenComments = !showHiddenComments"
              class="my-4 text-sm text-neutral-600 cursor-pointer select-none">
              {{ showHiddenComments ? "已显示全部评论" : "显示部分隐藏评论" }}
            </button>
          </div>

          <div
            v-if="showHiddenComments"
            class="divide-dashed divide-y divide-neutral-700/80">
            <div
              v-for="comment in hiddenComments"
              :key="comment.id.toString()"
              class="py-5 first:pt-0 last:pb-0">
              <CommentsUser
                :user="comment.user_created"
                :date="comment.date_created"
                :commentId="Number(comment.id)" />
              <div class="ml-13">{{ comment.comment }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div
          class="flex flex-col justify-center items-center my-6 space-y-4 select-none"
          v-if="user">
          <UIcon
            name="hugeicons:comment-02"
            class="w-10 h-10 text-neutral-800" />
          <div class="text-sm text-neutral-600">评论区空空如也</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchComments, subscribeToComments, subscribeToUsers } = useComments();
const props = defineProps<{ postId: string; user: boolean }>();

const showHiddenComments = ref(false);

const {
  data: comments,
  status,
  refresh,
} = await useLazyAsyncData(`comments-list-${props.postId}`, async () => {
  return await fetchComments({
    fields: ["id", "comment", "date_created", "user_created.*"],
    sort: ["-date_created"],
    filter: { post_id: { _eq: props.postId } },
  });
});

// 计算可见评论（大于等于6字 & 6个月内）
const visibleComments = computed(() => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return (
    comments.value?.filter(
      (comment) => comment.comment.length >= 6 && new Date(comment.date_created) >= sixMonthsAgo
    ) || []
  );
});

// 计算隐藏评论（少于6字 或 6个月前）
const hiddenComments = computed(() => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return (
    comments.value?.filter(
      (comment) => comment.comment.length < 6 || new Date(comment.date_created) < sixMonthsAgo
    ) || []
  );
});

onMounted(async () => {
  subscribeToComments(
    { fields: ["id", "comment", "date_created", "user_created.*"] },
    async (item) => {
      if (item.event === "create") {
        await refresh();
      }
    }
  );

  subscribeToUsers({ fields: ["avatar", "location"] }, async (item) => {
    if (item.event === "update") {
      await refresh();
    }
  });
});
</script>
