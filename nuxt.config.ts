import buildTime from "./build-time.json";
import { VersionManager } from "./scripts/versionManager";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,

  modules: ["@nuxt/ui", "@nuxtjs/mdc", "@vueuse/nuxt", "@pinia/nuxt", "nuxt-emoji-picker"],

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    payloadExtraction: true,
  },

  app: {
    keepalive: true,
    buildAssetsDir: "static",
    head: {
      htmlAttrs: {
        lang: "zh-CN",
      },
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      link: [{ rel: "dns-prefetch", href: process.env.DIRECTUS_API_URL }],
      meta: [{ name: "format-detection", content: "telephone=no" }],
    },
  },

  vue: {
    propsDestructure: true,
  },

  vite: {
    build: {
      minify: "terser",
      target: "esnext",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core"],
    },
  },

  nitro: {
    compressPublicAssets: true,
    sourceMap: false,
    timing: false,
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    prerender: {
      crawlLinks: true,
    },
  },

  build: {
    transpile: ["vue-router"],
    analyze: false,
  },

  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },

  runtimeConfig: {
    public: {
      directusApiUrl: process.env.DIRECTUS_API_URL,
      buildTime: buildTime.buildTime,
    },
  },

  hooks: {
    "build:before": () => {
      const isProduction = process.env.NODE_ENV === "production";
      const vm = new VersionManager(isProduction);

      if (isProduction) {
        const bumpType = process.env.VERSION_BUMP_TYPE as "major" | "minor" | "patch" | undefined;

        vm.bumpVersion(bumpType || "patch");
      }

      vm.generateVersionFile();
    },
  },

  mdc: {
    rehypePlugins: {
      "rehype-slug": {},
      "rehype-toc": {},
    },
    headings: {
      anchorLinks: true,
    },
    highlight: {
      theme: {
        default: "github-light",
        dark: "github-dark",
      },
    },
    components: {
      prose: true,
    },
  },

  components: [
    {
      global: true,
      path: "./components",
    },
  ],

  icon: {
    serverBundle: {
      collections: ["hugeicons", "svg-spinners"],
      externalizeIconsJson: true,
    },
    clientBundle: {
      scan: true,
    },
  },

  colorMode: {
    preference: "dark",
  },

  css: ["~/assets/app.css"],
});
