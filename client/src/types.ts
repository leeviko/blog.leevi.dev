export type TAuthor = {
  created_at: string;
  description: string | null;
  id: string;
  username: string;
};

export type TPostResult = {
  postid: string;
  authorid: string;
  slug: string;
  title: string;
  content: string;
  tags: Array<string>;
  private: boolean | null;
  status: "live" | "draft" | undefined;
  created_at: string;
  author: {
    userId: string;
    username: string;
    created_at: string;
  } | null;
};

export type TPostQuery = {
  title: string;
  content: string;
  tags: Array<string>;
  isPrivate: boolean | null;
  status: "live" | "draft" | undefined;
};
