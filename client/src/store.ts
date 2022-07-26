import { configureStore } from "@reduxjs/toolkit";
import errorSlice from "./slices/errorSlice";
import postSlice from "./slices/postSlice";

export const store = configureStore({
  reducer: {
    post: postSlice,
    error: errorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
