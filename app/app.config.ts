export default defineAppConfig({
  ui: {
    colors: {
      primary: "violet",
      neutral: "zinc",
    },
    icons: {
      loading: "svg-spinners:90-ring-with-bg",
    },
    button: {
      compoundVariants: [
        {
          class: {
            leadingIcon: "animate-none",
          },
        },
      ],
    },
  },
  toaster: {
    expand: false,
    duration: 4000,
  },
  tooltip: {
    delayDuration: 0,
  },
});
