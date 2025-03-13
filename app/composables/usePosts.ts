import type { Post, PostOptions } from "~/types";

export const usePosts = () => {
  const { $directus, $content, $realtimeClient } = useNuxtApp();

  const fetchPosts = async (options: PostOptions) => {
    try {
      return await $directus.request<Post[]>($content.readItems("posts", options));
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
      showError({ statusCode: err.statusCode || 500, message: "内容列表获取失败可能是由前端、后端或网络问题引起的。" });
      return null;
    }
  };

  const fetchPost = async (id: string, options: PostOptions) => {
    try {
      return await $directus.request<Post>($content.readItem("posts", id, options));
    } catch (err: any) {
      console.error(`Failed to fetch post with id ${id}:`, err);
      showError({ statusCode: err.statusCode || 404, message: "您要访问的页面暂时无法访问，可能是链接错误或页面已被删除。" });
      return null;
    }
  };

  const subscribeToPosts = async (query: PostOptions, callback: (item: any) => void) => {
    try {
      const { subscription } = await $realtimeClient.subscribe("posts", { query });

      for await (const item of subscription) {
        callback(item);
      }

      onUnmounted(() => $realtimeClient.disconnect());
    } catch (error) {
      console.error("Failed to subscribe to posts:", error);
    }
  };

  return { fetchPosts, fetchPost, subscribeToPosts };
};
