"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  SignInButton,
  useUser,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  setMessages,
  setChats,
  setSelectedChatId,
  setUrls,
  setInput,
  setLoading,
  addMessage,
  addChat,
  updateChatTitle,
  deleteChat as deleteChatAction,
  resetEditor,
} from "@/slices/editorSlice";
import {
  MenuIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
  LinkIcon,
  SendIcon,
  Loader2Icon,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}
interface Chat {
  id: string;
  title: string;
  urls?: string[];
  messages: Message[];
}

export default function EditorPage() {
  const { isSignedIn, user } = useUser();
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => state.editor.messages);
  const chats = useSelector((state: RootState) => state.editor.chats);
  const selectedChatId = useSelector(
    (state: RootState) => state.editor.selectedChatId
  );
  const urls = useSelector((state: RootState) => state.editor.urls);
  const input = useSelector((state: RootState) => state.editor.input);
  const loading = useSelector((state: RootState) => state.editor.loading);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [renameInput, setRenameInput] = useState("");
  const [currentUrlInput, setCurrentUrlInput] = useState("");

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`http://127.0.0.1:8000/api/users/${user.id}/chats`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(
              errorData.error ||
                `Failed to fetch chats with status: ${res.status}`
            );
          });
        }
        return res.json();
      })
      .then((chatsArray: Chat[]) => {
        if (chatsArray && chatsArray.length > 0) {
          dispatch(setChats(chatsArray));
          const lastChat = chatsArray[0];
          dispatch(setSelectedChatId(lastChat.id));
          const chatUrls = lastChat.urls || [];
          dispatch(setUrls(chatUrls));
          dispatch(
            setMessages(
              lastChat.messages.map((m: Message) => ({
                role: m.role,
                content: m.content,
              }))
            )
          );
        } else {
          dispatch(resetEditor());
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chats:", error.message);
        dispatch(resetEditor());
      });
  }, [isSignedIn, user, dispatch]);

  useEffect(() => {
    if (chatRef.current) {
      gsap.to(chatRef.current, {
        scrollTop: chatRef.current.scrollHeight,
        duration: 0.5,
      });
    }
  }, [messages]);

  const handleSelectChat = (chat: Chat) => {
    dispatch(setSelectedChatId(chat.id));
    const chatUrls = chat.urls || [];
    dispatch(setUrls(chatUrls));
    dispatch(
      setMessages(
        chat.messages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        }))
      )
    );
    dispatch(setInput(""));
  };

  const handleNewChat = () => {
    dispatch(resetEditor());
    setCurrentUrlInput("");
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) {
      console.error("User not available or title is empty for renaming chat.");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to rename chat:", errorData.error);
        return;
      }

      const updatedChat = await response.json();
      dispatch(
        updateChatTitle({ chatId: updatedChat.id, title: updatedChat.title })
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) {
      console.error("User not available for deleting chat.");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete chat:", errorData.error);
        return;
      }

      const result = await response.json();
      console.log(result.message);
      dispatch(deleteChatAction(chatId));
      if (selectedChatId === chatId) {
        const remainingChats = chats.filter((c) => c.id !== chatId);
        if (remainingChats.length > 0) {
          handleSelectChat(remainingChats[0]);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleAddUrl = () => {
    const trimmedUrl = currentUrlInput.trim();
    if (trimmedUrl && !urls.includes(trimmedUrl)) {
      if (selectedChatId && messages.length > 0) {
        console.warn(
          "Cannot add URLs to an active chat session with messages."
        );
        return;
      }
      dispatch(setUrls([...urls, trimmedUrl]));
      setCurrentUrlInput("");
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    if (selectedChatId && messages.length > 0) {
      console.warn(
        "Cannot remove URLs from an active chat session with messages."
      );
      return;
    }
    dispatch(setUrls(urls.filter((url) => url !== urlToRemove)));
  };

  const handleSend = async () => {
    if (!input.trim() || urls.length === 0 || !user) return;
    dispatch(setLoading(true));
    dispatch(addMessage({ role: "user", content: input }));
    const currentInput = input;
    dispatch(setInput(""));

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: urls,
          question: currentInput,
          userId: user.id,
          chatId: selectedChatId,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(addMessage({ role: "ai", content: data.answer }));

        if (data.chat) {
          const serverChat = data.chat as Chat;
          if (!selectedChatId || selectedChatId !== serverChat.id) {
            dispatch(addChat(serverChat));
            dispatch(setSelectedChatId(serverChat.id));
          } else {
            const existingChatIndex = chats.findIndex(
              (c) => c.id === serverChat.id
            );
            if (existingChatIndex !== -1) {
              const updatedChats = [...chats];
              updatedChats[existingChatIndex] = serverChat;
              dispatch(setChats(updatedChats));
            } else {
              dispatch(addChat(serverChat));
            }
          }
        }
      } else {
        dispatch(
          addMessage({
            role: "ai",
            content: data.error || "Error: Could not get answer.",
          })
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(
        addMessage({ role: "ai", content: "Error: Could not get answer." })
      );
    }
    dispatch(setLoading(false));
  };

  if (!isSignedIn) {
    return (
      <>
        <main className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-neutral-900 rounded-xl shadow-2xl"
          >
            <h1 className="text-4xl font-bold mb-3 text-primary">Welcome!</h1>
            <p className="text-lg text-neutral-300 mb-6">
              Please sign in to access the AI Document Agent editor.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-transform hover:scale-105 shadow-lg"
              >
                Sign In to Continue
              </Button>
            </SignInButton>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div
        className={`flex h-screen overflow-hidden bg-neutral-900 text-neutral-100`}
      >
        <aside
          className={`bg-neutral-900 border-r border-neutral-700/60 flex flex-col gap-4 transition-all duration-300 ease-in-out relative ${
            isSidebarOpen ? "w-72 p-4" : "w-20 p-3 items-center"
          }`}
        >
          <div
            className={`flex items-center ${
              isSidebarOpen ? "justify-between" : "justify-center"
            } mb-2 w-full`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "A"}
              </div>
              {isSidebarOpen && (
                <h2 className="text-xl font-semibold text-neutral-100">
                  AI Doc Agent
                </h2>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleNewChat}
            className={`w-full text-neutral-300 border-neutral-600 hover:bg-neutral-700 hover:text-neutral-100 transition-colors ${
              !isSidebarOpen &&
              "aspect-square p-0 flex justify-center items-center"
            }`}
            title="New Chat"
          >
            {isSidebarOpen ? "New Chat" : <PlusIcon className="h-5 w-5" />}
          </Button>

          {isSidebarOpen && (
            <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
              {chats.map((chat) => (
                <Card
                  key={chat.id}
                  className={`p-2.5 cursor-pointer transition-colors duration-150 rounded-md ${
                    selectedChatId === chat.id
                      ? "bg-primary/20 border-primary/50 text-primary-foreground shadow-md"
                      : "bg-neutral-800/70 border-neutral-700 hover:bg-neutral-700/90 text-neutral-300 hover:text-neutral-100"
                  }`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium truncate ${
                        selectedChatId === chat.id
                          ? "text-neutral-100"
                          : "text-neutral-300"
                      }`}
                      title={chat.title || "Untitled Chat"}
                    >
                      {chat.title?.slice(0, 22) || "Untitled Chat"}
                      {chat.title && chat.title.length > 22 ? "..." : ""}
                    </span>
                    <div className="flex items-center space-x-0.5">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-md hover:bg-neutral-700/50 ${
                              selectedChatId === chat.id
                                ? "text-neutral-100"
                                : "text-neutral-400 hover:text-neutral-100"
                            }`}
                            title="Rename chat"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameInput(chat.title || "");
                            }}
                          >
                            <MenuIcon className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="bottom"
                          className="p-6 rounded-t-lg sm:max-w-lg mx-auto bg-neutral-850 border-neutral-700 text-neutral-100 shadow-xl"
                        >
                          <SheetTitle className="text-neutral-50 text-lg">
                            Rename Chat
                          </SheetTitle>
                          <SheetDescription className="mt-1 mb-4 text-sm text-neutral-400">
                            Enter a new title for this chat session.
                          </SheetDescription>
                          <Input
                            placeholder="Enter new chat title"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            className="mb-4 bg-neutral-700 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus:border-primary focus:ring-primary/50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && renameInput.trim()) {
                                handleRenameChat(chat.id, renameInput);
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2">
                            <SheetClose asChild>
                              <Button
                                variant="outline"
                                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100"
                              >
                                Cancel
                              </Button>
                            </SheetClose>
                            <SheetClose asChild>
                              <Button
                                onClick={() =>
                                  handleRenameChat(chat.id, renameInput)
                                }
                                disabled={!renameInput.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                Save Changes
                              </Button>
                            </SheetClose>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-md hover:bg-destructive/20 hover:text-destructive ${
                              selectedChatId === chat.id
                                ? "text-neutral-100"
                                : "text-neutral-400"
                            }`}
                            title="Delete chat"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-850 border-neutral-700 text-neutral-100 shadow-xl">
                          <AlertDialogTitle className="text-neutral-50 text-lg">
                            Confirm Deletion
                          </AlertDialogTitle>
                          <p className="text-sm text-neutral-400 mt-2">
                            Are you sure you want to delete the chat: &quot;
                            {chat.title || "Untitled Chat"}&quot;? This action
                            cannot be undone.
                          </p>
                          <div className="flex justify-end gap-2 mt-4">
                            <AlertDialogCancel className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteChat(chat.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete Chat
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div
            className={`mt-auto border-t border-neutral-700/60 pt-4 w-full flex ${
              isSidebarOpen
                ? "items-center justify-between"
                : "flex-col items-center gap-3"
            }`}
          >
            <div
              className={`${!isSidebarOpen && "flex justify-center w-full"}`}
            >
              <UserButton afterSignOutUrl="/" />
            </div>
            <SignOutButton>
              <Button
                variant="ghost"
                size={isSidebarOpen ? "sm" : "icon"}
                className={`text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/70 transition-colors ${
                  !isSidebarOpen &&
                  "p-1 aspect-square flex justify-center items-center"
                }`}
                title="Sign Out"
              >
                <LogOutIcon
                  className={`${isSidebarOpen ? "mr-2" : ""} h-4 w-4`}
                />
                {isSidebarOpen && "Sign Out"}
              </Button>
            </SignOutButton>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-neutral-700 hover:bg-neutral-600 border border-neutral-500 text-neutral-300 hover:text-neutral-100 rounded-full h-6 w-6 z-20 flex items-center justify-center shadow-md transition-colors"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        </aside>

        <main className="flex-1 flex flex-col bg-neutral-850 overflow-hidden">
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-950 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-850"
          >
            {messages.length === 0 && (
              <div className="text-neutral-500 text-center py-10 flex flex-col items-center justify-center h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {urls.length === 0 ? (
                    <>
                      <LinkIcon className="h-12 w-12 text-neutral-600 mb-4" />
                      <p className="text-lg">No URLs added yet.</p>
                      <p>Add some documentation URLs to get started.</p>
                    </>
                  ) : selectedChatId ? (
                    <>
                      <SendIcon className="h-12 w-12 text-neutral-600 mb-4" />
                      <p className="text-lg">No messages in this chat yet.</p>
                      <p>
                        Ask a question about the content from the added URL(s).
                      </p>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-12 w-12 text-neutral-600 mb-4" />
                      <p className="text-lg">Ready to analyze!</p>
                      <p>Ask a question, or add more URLs.</p>
                    </>
                  )}
                </motion.div>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-xl shadow-sm max-w-[75%] break-words ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-neutral-700 text-neutral-100 rounded-bl-none"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
                    {msg.content}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-neutral-700/60 p-4 bg-neutral-900 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-neutral-500 flex-shrink-0" />
                <Input
                  className="flex-1 bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-primary ring-offset-neutral-900 transition-colors"
                  placeholder="Add documentation URL (e.g., https://docs.example.com)"
                  value={currentUrlInput}
                  onChange={(e) => setCurrentUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && currentUrlInput.trim()) {
                      handleAddUrl();
                    }
                  }}
                  disabled={
                    loading ||
                    (!!selectedChatId && messages.length > 0 && urls.length > 0)
                  }
                />
                <Button
                  onClick={handleAddUrl}
                  disabled={
                    loading ||
                    !currentUrlInput.trim() ||
                    (!!selectedChatId && messages.length > 0 && urls.length > 0)
                  }
                  variant="outline"
                  className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors"
                >
                  Add URL
                </Button>
              </div>
              {urls.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-neutral-800/50 rounded-md border border-neutral-700/60">
                  {urls.map((u, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="flex items-center gap-1.5 bg-neutral-700 text-neutral-200 text-xs px-2.5 py-1 rounded-full shadow-sm"
                    >
                      <span className="truncate max-w-xs" title={u}>
                        {u}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveUrl(u)}
                        className="h-5 w-5 text-neutral-400 hover:text-red-400 hover:bg-neutral-600 rounded-full p-0.5 transition-colors"
                        disabled={
                          loading || (!!selectedChatId && messages.length > 0)
                        }
                        title="Remove URL"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1 bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-primary ring-offset-neutral-900 transition-colors"
                placeholder={
                  urls.length === 0
                    ? "Add URL(s) first to ask a question"
                    : "Ask a question about the content from the URL(s)..."
                }
                value={input}
                onChange={(e) => dispatch(setInput(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                disabled={loading || urls.length === 0}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim() || urls.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 transition-colors shadow-md"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <SendIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
