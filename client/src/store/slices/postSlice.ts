import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import api from "../../api";
import { TPostQuery, TPostResult } from "../../types";

const postsAdapter = createEntityAdapter({
  selectId: (post: any) => post.postid,
});

export interface IPostState {
  pagination: {
    limit: number;
    cursor: {
      prev: string | null;
      next: string | null;
    } | null;
  };
  loading: boolean | null;
  error: string | undefined | null;
}

export type TPostUpdate = {
  post: TPostResult;
  newValues: any;
};

const initialState: IPostState = postsAdapter.getInitialState({
  pagination: {
    limit: 10,
    cursor: null,
  },
  loading: null,
  error: null,
});

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (options: any) => {
    const { limit, cursor, page, status } = options;

    try {
      const res = await api.get("/posts", {
        params: { limit, cursor, page, status },
        withCredentials: true,
      });

      return res.data;
    } catch (err: any) {
      console.log("err: ", err);
      throw new Error(err.response ? err.response.data.msg : err.message);
    }
  }
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  async (post: TPostQuery) => {
    const { title, content, tags, status } = post;

    if (!title || title.length <= 5) {
      throw new Error("Title cannot less than 5 characters long");
    }

    if (status === "live" && !content) {
      throw new Error("Content cannot be empty");
    }

    if (tags && tags.length > 10) {
      throw new Error("You can have up to 10 tags");
    }

    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    try {
      const res = await api.post("/posts", post, headers);

      return res.data;
    } catch (err: any) {
      console.log("err: ", err);
      throw new Error(err.response ? err.response.data.msg : err.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (values: TPostUpdate) => {
    const { post } = values;
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    const newValues = values.newValues;

    if (!newValues.title || post.title === newValues.title) {
      delete newValues.title;
    }
    if (!newValues.content || post.content === newValues.content) {
      delete newValues.content;
    }
    if (
      !newValues.tags ||
      JSON.stringify(post.tags) === JSON.stringify(newValues.tags)
    ) {
      delete newValues.tags;
    }
    if (
      newValues.isPrivate === "undefined" ||
      post.private === newValues.isPrivate
    ) {
      delete newValues.isPrivate;
    }

    if (Object.keys(newValues).length === 0) {
      throw new Error("Nothing to update");
    }

    try {
      const response = await api.put(
        `/posts/${post.postid}`,
        newValues,
        headers
      );
      return response.data;
    } catch (err: any) {
      console.log("err: ", err);
      throw new Error(err.response ? err.response.data.msg : err.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string) => {
    const response = await api.delete(`/posts/${postId}`, {
      withCredentials: true,
    });

    return response.data;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state: any, action) => {
        state.loading = false;
        state.pagination.cursor = action.payload.cursor;
        const loadedPosts = action.payload.result.map((data: any) => {
          return data;
        });

        postsAdapter.setAll(state, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(savePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(savePost.fulfilled, (state: any, action) => {
        state.loading = false;
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(savePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updatePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state: any, action) => {
        state.loading = false;
      })
      .addCase(updatePost.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deletePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deletePost.fulfilled, (state: any, action) => {
        state.loading = false;
        const { id } = action.payload;
        postsAdapter.removeOne(state, id);
      });
  },
});

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state: any) => state.posts);

export const getPostsLoading = (state: any) => state.posts.loading;
export const getPostsError = (state: any) => state.posts.error;
export const getPostsPagination = (state: any) => state.posts.pagination;

export default postsSlice.reducer;
