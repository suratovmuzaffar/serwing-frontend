import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/features/auth/types";

type AuthState = {
  me: AuthUser | null;
};

const initialState: AuthState = {
  me: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMe(state, action: PayloadAction<AuthUser>) {
      state.me = action.payload;
    },
    clearMe(state) {
      state.me = null;
    },
  },
});

export const { setMe, clearMe } = authSlice.actions;
export default authSlice.reducer;
