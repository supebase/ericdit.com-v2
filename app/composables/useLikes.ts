import type { Like, LikeOptions } from "~/types";

export const useLikes = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const fetchLikes = async (options: LikeOptions) => {
    try {
      return await $directus.request<Like[]>($content.readItems("likes", options));
    } catch (err: any) {
      console.error("Failed to fetch likes:", err);
      showError({
        statusCode: err.statusCode || 500,
        message: "点赞数据获取失败可能是由前端、后端或网络问题引起的。",
      });
      return null;
    }
  };

  const subscribeToLikes = async (query: LikeOptions, callback: (item: any) => void) => {
    try {
      const { subscription } = await $realtimeClient.subscribe("likes", { query });

      for await (const item of subscription) {
        callback(item);
      }

      onUnmounted(() => $realtimeClient.disconnect());
    } catch (error) {
      console.error("Failed to subscribe to likes:", error);
    }
  };

  return { fetchLikes, subscribeToLikes };
};
