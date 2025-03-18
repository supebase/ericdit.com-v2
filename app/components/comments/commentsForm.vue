<template>
  <div v-if="userId">
    <form @submit.prevent="postComment">
      <div
        class="ring-2 ring-neutral-200 dark:ring-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 rounded-lg p-1.5">
        <UTextarea
          ref="commentInput"
          color="neutral"
          variant="none"
          :placeholder="userId ? randomPlaceholder : '请先登录后再发表评论'"
          autoresize
          :rows="2"
          :padded="false"
          size="lg"
          v-model="comment"
          class="text-neutral-700 dark:text-neutral-300 w-full"
          :maxlength="COMMENT_MAX_LENGTH"
          :disabled="!userId"
          @input="validateInput" />
        <div class="flex justify-between items-center px-3">
          <div class="flex items-center space-x-4">
            <EmojiPicker
              @emoji="insertEmoji"
              :user="userId" />
            <UBadge
              label="禁止输入特殊字符"
              color="error"
              variant="soft"
              size="lg"
              class="transform duration-500 ease-in-out"
              :class="
                !validation.isValid ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
              " />
          </div>
          <div class="flex items-center space-x-6">
            <span
              class="text-sm select-none"
              :class="
                comment.length >= COMMENT_MAX_LENGTH
                  ? 'text-red-600'
                  : 'text-neutral-400 dark:text-neutral-600'
              ">
              {{ comment.length }} / {{ COMMENT_MAX_LENGTH }}
            </span>
            <UButton
              type="submit"
              :color="canSubmit ? 'primary' : 'neutral'"
              size="lg"
              variant="ghost"
              class="hover:!bg-transparent cursor-pointer px-0"
              :loading="loading"
              :icon="submitIcon"
              :disabled="!canSubmit" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CommentFormProps } from "~/types";

const COMMENT_MAX_LENGTH = 500;
const INVALID_CHARS_REGEX = /[<>\/]/;
const PLACEHOLDERS = [
  "灵感来袭？快写下您的独特见解！",
  "分享您的故事或经验，让大家听听吧！",
  "欢迎加入讨论，畅所欲言~",
] as const;

const { $directus, $content } = useNuxtApp();
const toast = useToast();

const props = defineProps<CommentFormProps>();
const comment = ref("");
const loading = ref(false);
const commentInput = ref<{ $el: HTMLElement } | null>(null);
const randomPlaceholder = ref("");

// 使用 computed 优化验证逻辑
const validation = computed(() => ({
  isEmpty: !comment.value.trim(),
  isExceedLimit: comment.value.length >= COMMENT_MAX_LENGTH,
  isValid: !INVALID_CHARS_REGEX.test(comment.value),
}));

const canSubmit = computed(() => {
  const { isEmpty, isExceedLimit, isValid } = validation.value;
  return !isEmpty && !isExceedLimit && isValid && !loading.value;
});

const submitIcon = computed(() =>
  canSubmit.value ? "hugeicons:comment-add-02" : "hugeicons:comment-block-02"
);

// 优化验证函数
const validateInput = () => validation.value.isValid;

// 优化评论提交逻辑
const postComment = async () => {
  if (!canSubmit.value) return;

  loading.value = true;
  try {
    await $directus.request(
      $content.createItem("comments", {
        comment: comment.value,
        post_id: props.postId,
        user_created: props.userId,
      })
    );

    comment.value = "";
    toast.add({
      title: "评论成功",
      description: "您的评论已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (error: unknown) {
    console.error("评论提交失败:", error);
    toast.add({
      title: "评论失败",
      description: error instanceof Error ? error.message : "发生错误，请稍后再试。",
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

// 优化随机占位符生成
const generateRandomPlaceholder = () => {
  const randomIndex = Math.floor(Math.random() * PLACEHOLDERS.length);
  randomPlaceholder.value = PLACEHOLDERS[randomIndex] ?? "";
};

// 优化 emoji 插入逻辑
const insertEmoji = (emoji: string) => {
  const textarea = commentInput.value?.$el.querySelector("textarea");
  if (!textarea) return;

  const { selectionStart, selectionEnd } = textarea;
  const newPosition = selectionStart + emoji.length;

  comment.value = [
    comment.value.slice(0, selectionStart),
    emoji,
    comment.value.slice(selectionEnd),
  ].join("");

  nextTick(() => {
    textarea.setSelectionRange(newPosition, newPosition);
    textarea.focus();
  });
};

// 生命周期钩子
onMounted(generateRandomPlaceholder);
onActivated(generateRandomPlaceholder);
onDeactivated(() => (comment.value = ""));
</script>
