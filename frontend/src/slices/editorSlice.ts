import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  role: "user" | "ai";
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface EditorState {
  messages: Message[];
  chats: Chat[];
  selectedChatId: string | null;
  urls: string[];
  input: string;
  loading: boolean;
}

const initialState: EditorState = {
  messages: [],
  chats: [],
  selectedChatId: null,
  urls: [],
  input: "",
  loading: false,
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    setChats(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload;
    },
    setSelectedChatId(state, action: PayloadAction<string | null>) {
      state.selectedChatId = action.payload;
    },
    setUrls(state, action: PayloadAction<string[]>) {
      state.urls = action.payload;
    },
    setInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    addChat(state, action: PayloadAction<Chat>) {
      state.chats.unshift(action.payload);
    },
    updateChatTitle(
      state,
      action: PayloadAction<{ chatId: string; title: string }>
    ) {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) chat.title = action.payload.title;
    },
    deleteChat(state, action: PayloadAction<string>) {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
      if (state.selectedChatId === action.payload) {
        state.selectedChatId = null;
        state.messages = [];
        state.urls = [];
      }
    },
    resetEditor(state) {
      state.selectedChatId = null;
      state.messages = [];
      state.urls = [];
      state.input = "";
      state.loading = false;
    },
  },
});

export const {
  setMessages,
  setChats,
  setSelectedChatId,
  setUrls,
  setInput,
  setLoading,
  addMessage,
  addChat,
  updateChatTitle,
  deleteChat,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
