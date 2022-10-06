import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import api from "../../api";
import { TAxiosError } from "../../types";

export interface UserState {
  isAuth: boolean | null;
  user: {
    id: string;
    username: string;
    admin: boolean;
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
            msg: "Failed to login, Please check your internet connection",
            status: err.response.status,
          };
        }
      } else {
        error = { msg: err.request.statusText, status: err.request.status };
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
            msg: "Failed to authenticate, Please check your internet connection",
            status: err.response.status,
          };
        }
      } else {
        error = { msg: err.request.statusText, status: err.request.status };
      }
      return rejectWithValue(error);
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
      .addCase(login.fulfilled, (state: any, action) => {
        state.loading = false;
        const user = action.payload;

        state.user = user;
        state.isAuth = true;
      })
      .addCase(login.rejected, (state: any, action) => {
        state.loading = false;
        state.isAuth = false;
        if (action.payload) {
          state.error = action.payload;
        } else {
          state.error = action.error.message;
        }
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
      .addCase(isAuth.rejected, (state: any, action) => {
        state.loading = false;
        state.isAuth = false;
        if (action.payload) {
          state.error = action.payload;
        } else {
          state.error = action.error.message;
        }
      });
  },
});

export const getAuthLoading = (state: any) => state.auth.loading;
export const getAuthError = (state: any) => state.auth.error;
export const getCount = (state: any) => state.auth.count;

export default authSlice.reducer;
