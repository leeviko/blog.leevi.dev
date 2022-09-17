import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import api from "../../api";
import { TPostQuery } from "../../types";

const postsAdapter = createEntityAdapter({
  selectId: (post: any) => post.slug,
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

export const deletePost = createAsyncThunk("posts/deletePost", async (id) => {
  const response = await api.delete(`/posts/${id}`);

  return response.data;
});

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
        console.log(action.payload);
        postsAdapter.addOne(state, action.payload);
      })
      .addCase(savePost.rejected, (state, action) => {
        state.error = action.error.message;
      })

      .addCase(deletePost.fulfilled, (state: any, action) => {
        if (!action.payload?.id) {
          console.log("Delete could not complete");
          console.log(action.payload);
          return;
        }
        const { id } = action.payload;
        postsAdapter.removeOne(state, id);
      });
  },
});

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors((state: any) => state.posts);

export const getPostsLoading = (state: any) => state.posts.loading;
export const getPostsError = (state: any) => state.posts.error;
export const getPostsPagination = (state: any) => state.posts.pagination;

export default postsSlice.reducer;
