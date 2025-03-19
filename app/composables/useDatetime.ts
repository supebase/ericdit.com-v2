import type { UseTimeAgoMessages } from "@vueuse/core";

const messages: UseTimeAgoMessages = {
  justNow: "刚刚",
  past: (n) => {
    const timeMap: Record<string, string> = {
      "1 天": "昨天",
      "2 天": "前天",
      "1 周": "上周",
      "1 个月": "上个月",
      "1 年": "去年",
    };
    return timeMap[n] || `${n}前`;
  },
  future: (n) => `${n} 后`,
  second: (n) => `${n} 秒`,
  minute: (n) => `${n} 分钟`,
  hour: (n) => `${n} 小时`,
  day: (n) => `${n} 天`,
  week: (n) => `${n} 周`,
  month: (n) => `${n} 个月`,
  year: (n) => `${n} 年`,
  invalid: "无效的日期",
};

export function useDatetime(date: string | Date | number | null): ComputedRef<string> {
  return computed(() => {
    if (!date) return messages.invalid;

    try {
      return useTimeAgo(date, {
        messages,
        max: "year" as const,
        fullDateFormatter: (date) => {
          return new Date(date).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },
      }).value;
    } catch (error) {
      console.error("Date formatting error:", error);
      return messages.invalid;
    }
  });
}
