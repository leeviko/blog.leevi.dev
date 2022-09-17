import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api from "../../api";

export interface UserState {
  isAuth: boolean | null;
  user: {
    id: string;
    username: string;
    created_at: string;
  } | null;
  loading: boolean | null;
  error: string | undefined | null;
}

const initialState: UserState = {
  isAuth: null,
  user: null,
  loading: null,
  error: null,
};

export const login = createAsyncThunk("users/login", async (values: any) => {
  const { username, password } = values;

  const headers = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };

  const body: any = { username, password };

  try {
    const res = await api.post("/auth", body, headers);

    return res.data;
  } catch (err: any) {
    throw new Error(err.response ? err.response.data.msg : err.message);
  }
});

export const isAuth = createAsyncThunk("users/isAuth", async () => {
  if (!Cookies.get("user_sid")) {
    throw new Error("Not logged in");
  }

  try {
    const res = await api.get("/auth", { withCredentials: true });

    return res.data;
  } catch (err: any) {
    throw new Error(err.response ? err.response.data.msg : err.message);
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state: any, action) => {
        state.loading = false;
        const user = action.payload;

        state.user = user;
        state.isAuth = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.isAuth = false;
      })
      .addCase(isAuth.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(isAuth.fulfilled, (state: any, action) => {
        state.loading = false;
        const user = action.payload.sessUser;

        state.user = user;
        state.isAuth = true;
      })
      .addCase(isAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuth = false;
      });
  },
});

export const getUserLoading = (state: any) => state.users.loading;
export const getUserError = (state: any) => state.users.error;
export const getCount = (state: any) => state.users.count;

export default usersSlice.reducer;
