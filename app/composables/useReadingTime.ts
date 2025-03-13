export function useReadingTime(content: string) {
  const calculateReadingTime = (text: string): number => {
    if (!text) return 0;

    // 统计英文单词（word），匹配英文单词、数字等
    const words = text.match(/\b[a-zA-Z0-9']+\b/g) || [];

    // 统计中文字符（character），匹配中文字符
    const characters = text.match(/[\p{Script=Han}]/gu) || [];

    // 计算英文和中文部分的阅读时间
    const englishReadingTime = words.length / 200; // 200 WPM
    const chineseReadingTime = characters.length / 400; // 400 CPM

    // 总阅读时间，向上取整，单位为分钟
    return Math.ceil(englishReadingTime + chineseReadingTime);
  };

  return `${calculateReadingTime(content)} 分钟`;
}
