import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import api from "../../api";

const postsAdapter = createEntityAdapter();

export interface PostState {
  post: {
    posts: Array<object>;
    pagination: {
      limit: number;
      cursor: string | null;
    };
    loading: boolean | null;
    error: string | undefined | null;
  };
}

const initialState: PostState = {
  post: {
    posts: [],
    pagination: {
      limit: 10,
      cursor: null,
    },
    loading: null,
    error: null,
  },
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (limit, cursor) => {
    const response = await api.get("/posts", { params: { limit, cursor } });
    return response.data;
  }
);

export const addPost = createAsyncThunk("posts/addPost", async (post) => {
  const headers = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await api.post("/posts", post, headers);
  return response.data;
});

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
        state.post.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state: PostState | any, action) => {
        state.post.loading = false;
        const loadedPosts = action.payload.map((data: any) => {
          return data;
        });

        // Add any fetched posts to the array
        postsAdapter.upsertMany(state, loadedPosts);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.post.loading = false;
        state.post.error = action.error.message;
      })
      .addCase(addPost.fulfilled, (state: any, action) => {
        action.payload.userId = Number(action.payload.userId);
        action.payload.date = new Date().toISOString();
        action.payload.reactions = {
          thumbsUp: 0,
          wow: 0,
          heart: 0,
          rocket: 0,
          coffee: 0,
        };
        console.log(action.payload);
        postsAdapter.addOne(state, action.payload);
      })
      // .addCase(updatePost.fulfilled, (state, action) => {
      //   if (!action.payload?.id) {
      //     console.log("Update could not complete");
      //     console.log(action.payload);
      //     return;
      //   }
      //   action.payload.date = new Date().toISOString();
      //   postsAdapter.upsertOne(state, action.payload);
      // })
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
export const getCount = (state: any) => state.posts.count;

export default postsSlice.reducer;
