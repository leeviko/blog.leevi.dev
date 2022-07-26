import { apiSlice } from "../api/apiSlice";

// ACTIONS
export interface PostState {
  post: {
    posts: Array<object>;
    pagination: {
      limit: number;
      cursor: string | null;
    };
    loading: boolean | null;
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
  },
};

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      transformResponse: (res) => {
        console.log("ASD");
      },
    }),
  }),
});
// returns the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

// // Action creators are generated for each case reducer function
// export const { newPost, getPosts } = postSlice.actions;
