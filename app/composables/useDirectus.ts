export const useDirectus = () => {
  const {
    public: { directusApiUrl },
  } = useRuntimeConfig();

  if (!directusApiUrl || !/^https?:\/\//.test(directusApiUrl)) {
    throw new Error("Directus API URL 没有配置正确");
  }

  const { baseClient, authClient, realtimeClient } = createDirectusClient(directusApiUrl);

  return {
    directus: baseClient, // 基础客户端
    authClient, // 带认证的客户端
    realtimeClient, // 带 WebSocket 的客户端
  };
};
