import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUser, updateUserProfile, AccountUpdate } from "@/services/auth-service";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

interface UserState {
  profile: any | null;
  status: RequestStatus;
  error: string | null;
  updateStatus: RequestStatus;
  updateError: string | null;
  lastLoadedUserId: number | null;
}

const initialState: UserState = {
  profile: null,
  status: "idle",
  error: null,
  updateStatus: "idle",
  updateError: null,
  lastLoadedUserId: null,
};

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getUser(id);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load user");
    }
  }
);

export const updateUserProfileThunk = createAsyncThunk(
  "user/updateUserProfile",
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const result = await updateUserProfile(id, data);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update profile");
    }
  }
);

export const updateAccountThunk = createAsyncThunk(
  "user/updateAccount",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const result = await AccountUpdate(id, data);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update account");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserState: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
      state.updateStatus = "idle";
      state.updateError = null;
      state.lastLoadedUserId = null;
    },
    setUserProfile: (state, action: PayloadAction<any | null>) => {
      state.profile = action.payload;
      state.lastLoadedUserId = action.payload?.id ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
        state.lastLoadedUserId = action.payload?.id ?? null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateUserProfileThunk.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        if (action.payload) {
          state.profile = action.payload;
          state.lastLoadedUserId = action.payload?.id ?? state.lastLoadedUserId;
        }
      })
      .addCase(updateUserProfileThunk.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload as string;
      })
      .addCase(updateAccountThunk.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateAccountThunk.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        if (action.payload) {
          state.profile = action.payload;
          state.lastLoadedUserId = action.payload?.id ?? state.lastLoadedUserId;
        }
      })
      .addCase(updateAccountThunk.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload as string;
      });
  },
});

export const { clearUserState, setUserProfile } = userSlice.actions;
export default userSlice.reducer;
