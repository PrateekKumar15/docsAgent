import { configureStore } from "@reduxjs/toolkit";
import editorReducer from "./slices/editorSlice";
import uiReducer from "./slices/uiSlice"; // Import the new UI reducer

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    ui: uiReducer, // Add the UI reducer to the store
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
