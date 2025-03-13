import type { Comment, CommentOptions } from "~/types";

export const useComments = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const fetchComments = async (options: CommentOptions) => {
    try {
      return await $directus.request<Comment[]>($content.readItems("comments", options));
    } catch (err: any) {
      console.error("Failed to fetch comments:", err);
      showError({
        statusCode: err.statusCode || 500,
        message: "评论数据获取失败可能是由前端、后端或网络问题引起的。",
      });
      return null;
    }
  };

  const subscribeToComments = async (query: CommentOptions, callback: (item: any) => void) => {
    try {
      const { subscription } = await $realtimeClient.subscribe("comments", { query });

      for await (const item of subscription) {
        callback(item);
      }

      onUnmounted(() => $realtimeClient.disconnect());
    } catch (error) {
      console.error("Failed to subscribe to comments:", error);
    }
  };

  const subscribeToUsers = async (query: CommentOptions, callback: (item: any) => void) => {
    try {
      const { subscription } = await $realtimeClient.subscribe("directus_users", { query });

      for await (const item of subscription) {
        callback(item);
      }

      onUnmounted(() => $realtimeClient.disconnect());
    } catch (error) {
      console.error("Failed to subscribe to users:", error);
    }
  };

  return { fetchComments, subscribeToComments, subscribeToUsers };
};
