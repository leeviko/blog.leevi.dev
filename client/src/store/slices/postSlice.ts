import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import api from "../../api";
import { TAxiosError, TPostQuery, TPostResult } from "../../types";

const postsAdapter = createEntityAdapter({
  selectId: (post: TPostResult) => post.postid,
});

export interface IPostInitialState {
  pagination: {
    limit: number;
    cursor: {
      prev: string | null;
      next: string | null;
    } | null;
  };
  loading: boolean | null;
  error: TAxiosError | string | undefined | null;
}

export type TPostUpdate = {
  post: TPostResult;
  newValues: any;
};

const initialState: IPostInitialState = postsAdapter.getInitialState({
  pagination: {
    limit: 10,
    cursor: null,
  },
  loading: null,
  error: null,
});

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (options: any, { rejectWithValue }) => {
    const { limit, cursor, page, status } = options;

    try {
      const res = await api.get("/posts", {
        params: { limit, cursor, page, status },
        withCredentials: true,
      });

      return res.data;
    } catch (err: any) {
      let error: TAxiosError;

      if (err.response) {
        if (err.response.data) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = {
            msg: "Couldn't load posts",
            status: err.response.status,
          };
        }
      } else if (err.request) {
        error = { msg: err.request.statusText, status: err.request.status };
      } else {
        error = { msg: err.message, status: 500 };
      }
      return rejectWithValue(error);
    }
  }
);

export const savePost = createAsyncThunk(
  "posts/savePost",
  async (post: TPostQuery, { rejectWithValue }) => {
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
      let error: TAxiosError;

      if (err.response) {
        if (err.response.data) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = {
            msg: "Failed to save post",
            status: err.response.status,
          };
        }
      } else if (err.request) {
        error = { msg: err.request.statusText, status: err.request.status };
      } else {
        error = { msg: err.message, status: 500 };
      }
      return rejectWithValue(error);
    }
  }
);

export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (values: TPostUpdate, { rejectWithValue }) => {
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
      let error: TAxiosError;

      if (err.response) {
        if (err.response.data) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = {
            msg: "Failed to update post",
            status: err.response.status,
          };
        }
      } else if (err.request) {
        error = { msg: err.request.statusText, status: err.request.status };
      } else {
        error = { msg: err.message, status: 500 };
      }
      return rejectWithValue(error);
    }
  }
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/posts/${postId}`, {
        withCredentials: true,
      });

      return response.data;
    } catch (err: any) {
      let error: TAxiosError;

      if (err.response) {
        if (err.response.data) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = {
            msg: "Failed to delete post",
            status: err.response.status,
          };
        }
      } else if (err.request) {
        error = { msg: err.request.statusText, status: err.request.status };
      } else {
        error = { msg: err.message, status: 500 };
      }
      return rejectWithValue(error);
    }
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
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pagination.cursor = action.payload.cursor;
        const loadedPosts = action.payload.result.map((data: any) => {
          return data;
        });

        postsAdapter.setAll(state as any, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(savePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(savePost.rejected, (state, action) => {
        state.loading = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(updatePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(deletePost.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
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
