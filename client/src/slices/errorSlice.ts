import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ErrorState {
  error: {};
}

const initialState: ErrorState = {
  error: {},
};

export const errorSlice = createSlice({
  name: "errors",
  initialState,
  reducers: {},
});

// Action creators are generated for each case reducer function

export default errorSlice.reducer;
