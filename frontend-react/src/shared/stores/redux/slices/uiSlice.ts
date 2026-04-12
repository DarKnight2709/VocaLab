import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  loading: boolean;
  loadingMessage: string;
}

const initialState: UiState = {
  loading: false,
  loadingMessage: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setGlobalLoading(
      state,
      action: PayloadAction<{ loading: boolean; message?: string }>,
    ) {
      state.loading = action.payload.loading;
      state.loadingMessage = action.payload.message ?? "";
    },
  },
});

export const { setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
