import type { DirectusUser } from "@directus/sdk";

export interface User extends DirectusUser {
  online?: boolean;
  last_active?: string | null;
}

/** 作者信息接口 */
export interface Author {
  authors_id: {
    id: string;
    name: string;
    title?: string;
    avatar?: any;
  };
}

/** 标签接口 */
export interface Tag {
  name: string;
}

/** 文章接口 */
export interface Post {
  readonly id: string;
  title: string;
  summary: string;
  content: string;
  tag?: Tag;
  authors?: Author[];
  images?: any[];
  allowComment: boolean;
  date_created: string;
  date_updated: string | null;
}

/** 文章查询选项 */
export interface PostOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}

/** 阅读时间配置选项 */
export interface ReadingTimeOptions {
  wordsPerMinute?: number;
  charactersPerMinute?: number;
  imageReadTime?: number;
}

/** 用户接口 */
export interface User {
  readonly id: string;
  email: string;
  first_name: string;
  avatar: string;
  location: string | null;
}

/** 点赞目标类型 */
export type LikeTargetType = "post" | "comment";

/** 点赞接口 */
export interface Like {
  user_created: User;
  target_id: string;
  target_type: LikeTargetType;
}

/** 点赞查询选项 */
export interface LikeOptions {
  fields: string[];
  filter?: Record<string, any>;
}

/** 评论接口 */
export interface Comment {
  readonly id: number;
  comment: string;
  date_created: string;
  user_created: User;
  post_id: string;
  reply_to: number;
}

/** 评论查询选项 */
export interface CommentOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}

export interface CommentFormProps {
  postId: string;
  userId: string | null;
}

export interface ImageLoaderReturn {
  loaded: Ref<boolean>;
  error: Ref<boolean>;
  imageSrc: Ref<string>;
}
