export type AuthorType = {
  created_at: string;
  description: string | null;
  id: string;
  username: string;
};

export type PostType = {
  authorid: string;
  content: string;
  created_at: string;
  private: boolean | null;
  slug: string;
  tags: Array<string>;
  title: string;
};
