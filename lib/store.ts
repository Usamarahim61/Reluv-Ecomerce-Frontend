import { configureStore } from "@reduxjs/toolkit";
import categoriesReducer from "@/lib/features/categoriesSlice";
import productsReducer from "@/lib/features/productsSlice";
import messagesReducer from "@/lib/features/messagesSlice";

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
