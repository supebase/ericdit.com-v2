const assetCache = new Map<string, string>();

export const useAssets = (image: string) => {
  const { directusApiUrl } = useRuntimeConfig().public;
  const baseUrl = new URL(directusApiUrl);
  baseUrl.pathname = "assets/";
  if (!baseUrl.pathname.endsWith("/")) {
    baseUrl.pathname += "/";
  }

  if (assetCache.has(image)) {
    return assetCache.get(image);
  }

  const url = new URL(image, baseUrl).toString();
  assetCache.set(image, url);

  return url;
};
