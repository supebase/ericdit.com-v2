export interface Author {
  authors_id: {
    id: string;
    name: string;
    title?: string;
    avatar?: any;
  };
}

export interface Tag {
  name: string;
}

export interface Post {
  readonly id: string;
  title: string;
  summary: string;
  content: string;
  tag?: Tag;
  authors?: Author[];
  images?: [],
  allowComment: boolean;
  date_created: string;
  date_updated: string | null;
}

export interface PostOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}

export interface ReadingTimeOptions {
  wordsPerMinute?: number;
  charactersPerMinute?: number;
  imageReadTime?: number;
}

export interface User {
  readonly id: string;
  email: string;
  first_name: string;
  avatar: string;
  location?: string;
}

export interface Like {
  user_created: User;
  target_id: string;
  target_type: "post" | "comment";
}

export interface LikeOptions {
  fields: string[];
  filter?: Record<string, any>;
}

export interface Comment {
  readonly id: number;
  comment: string;
  date_created: string;
  user_created: User;
  post_id: string;
  reply_to: number;
}

export interface CommentOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}
