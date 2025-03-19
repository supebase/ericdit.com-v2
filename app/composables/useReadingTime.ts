export const useReadingTime = (content: string, images?: Array<{ directus_files_id: string }>) => {
  // 英文阅读速度：每分钟200个单词
  const WORDS_PER_MINUTE = 200;
  // 中文阅读速度：每分钟300个汉字
  const CHINESE_CHARS_PER_MINUTE = 300;
  // 每张图片预计阅读时间：0.25分钟
  const IMAGE_TIME = 0.25;
  // 轮播图组件基础时间：0.25分钟
  const CAROUSEL_BASE_TIME = 0.25;
  // 代码块基础阅读时间：0.3分钟
  const CODE_BLOCK_BASE_TIME = 0.3;
  // 每行代码额外阅读时间：0.07分钟
  const CODE_LINE_TIME = 0.07;

  const calculateReadingTime = (content: string, imagesCount: number = 0) => {
    if (!content) return 0;

    // 计算代码块时间
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    const codeTime = codeBlocks.reduce((total, block) => {
      const lines = block.split("\n").length - 2; // 减去开始和结束的 ``` 行
      return total + CODE_BLOCK_BASE_TIME + lines * CODE_LINE_TIME;
    }, 0);

    // 分别计算中英文
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    const chineseChars = contentWithoutCode.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = contentWithoutCode
      .replace(/[\u4e00-\u9fa5]/g, "")
      .trim()
      .split(/\s+/).length;

    const chineseTime = chineseChars / CHINESE_CHARS_PER_MINUTE;
    const englishTime = englishWords / WORDS_PER_MINUTE;

    // 计算图片时间：轮播组件基础时间 + 每张图片时间
    const imageTime = imagesCount > 0 ? CAROUSEL_BASE_TIME + imagesCount * IMAGE_TIME : 0;

    return Math.ceil(chineseTime + englishTime + imageTime + codeTime);
  };

  // 获取图片总数（包括轮播图和内容中的图片）
  const totalImages = (images?.length || 0) + (content.match(/!\[.*?\]\(.*?\)/g) || []).length;

  return `${calculateReadingTime(content, totalImages)} 分钟`;
};
