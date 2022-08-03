import { configureStore } from "@reduxjs/toolkit";
// import errorsReducer from "./features/errors/errorSlice";
import postsReducer from "./features/posts/postSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    // errors: errorsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
