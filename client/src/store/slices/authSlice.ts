import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api from "../../api";
import { TAxiosError } from "../../types";
import { RootState } from "../store";

export interface IUserState {
  isAuth: boolean | null;
  user: {
    id: string;
    username: string;
    admin: boolean;
    created_at: string;
  } | null;
  loading: boolean | null;
  error: TAxiosError | string | undefined | null;
}

const initialState: IUserState = {
  isAuth: null,
  user: null,
  loading: null,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (values: any, { rejectWithValue }) => {
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
      let error: TAxiosError;

      if (err.response) {
        if (err.response.data) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = {
            msg: "Failed to login",
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

export const isAuth = createAsyncThunk(
  "auth/isAuth",
  async (data, { rejectWithValue }) => {
    if (!Cookies.get("user_sid")) {
      throw new Error("Not logged in");
    }

    try {
      const res = await api.get("/auth", { withCredentials: true });

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
            msg: "Failed to authenticate",
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

export const logout = createAsyncThunk(
  "auth/logout",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.delete("/users/logout", { withCredentials: true });

      return res.data;
    } catch (err: any) {
      console.log(err);
      return rejectWithValue("Failed to logout");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const user = action.payload;
        state.user = user;
        state.isAuth = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuth = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(isAuth.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(isAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuth = true;
        const user = action.payload.sessUser;
        state.user = user;
      })
      .addCase(isAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuth = false;

        let actionError = action.payload as TAxiosError;
        if (actionError) {
          state.error = actionError;
        } else {
          state.error = action.error.message;
        }
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.isAuth = false;
        state.user = null;
        Cookies.remove("user_sid");
      });
  },
});

export const getAuthLoading = (state: RootState) => state.auth.loading;
export const getAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
